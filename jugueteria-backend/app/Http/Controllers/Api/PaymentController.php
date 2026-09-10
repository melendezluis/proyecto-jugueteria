<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use MercadoPago\Exceptions\MPApiException;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Webhook\WebhookSignatureValidator;

class PaymentController
{
    public function __construct(private MercadoPagoService $mercadoPago) {}

    private function guardHasAccessToken(): bool
    {
        return (bool) config('mercadopago.access_token');
    }

    private function bootMercadoPago(): void
    {
        MercadoPagoConfig::setAccessToken(config('mercadopago.access_token'));
    }

    /**
     * Crea la preferencia de pago en Mercado Pago para una orden pendiente.
     */
    public function checkout(Request $request, $orderId)
    {
        $order = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->findOrFail($orderId);

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Esta orden ya no se encuentra pendiente de pago.',
            ], 422);
        }

        if (! $this->guardHasAccessToken()) {
            return response()->json([
                'success' => false,
                'message' => 'El pago en línea no está configurado. Contacta al administrador.',
            ], 503);
        }

        try {
            $this->bootMercadoPago();

            $items = $order->items->map(fn ($item) => [
                'id' => (string) $item->product_id,
                'title' => $item->product_name,
                'quantity' => (int) $item->quantity,
                'unit_price' => round((float) $item->unit_price, 2),
                'currency_id' => 'PEN',
            ])->values()->toArray();

            if ((float) $order->shipping > 0) {
                $items[] = [
                    'title' => 'Envío',
                    'quantity' => 1,
                    'unit_price' => round((float) $order->shipping, 2),
                    'currency_id' => 'PEN',
                ];
            }

            $orderId = $order->id;
            $frontendUrl = rtrim(config('mercadopago.frontend_url'), '/');
            $notificationUrl = config('mercadopago.webhook_url');

            $preferenceRequest = [
                'items' => $items,
                'external_reference' => $order->order_number,
                'notification_url' => $notificationUrl,
                'back_urls' => [
                    'success' => "{$frontendUrl}/order-confirmation/{$orderId}?status=success",
                    'pending' => "{$frontendUrl}/order-confirmation/{$orderId}?status=pending",
                    'failure' => "{$frontendUrl}/order-confirmation/{$orderId}?status=failure",
                ],
                'statement_descriptor' => 'EL GATO',
            ];

            if (str_starts_with($frontendUrl, 'https://')) {
                $preferenceRequest['auto_return'] = 'approved';
            }

            $preference = $this->mercadoPago->createPreference($preferenceRequest);

            $order->update(['preference_id' => $preference->id]);

            $initPoint = str_starts_with(config('mercadopago.access_token'), 'TEST-')
                ? $preference->sandbox_init_point
                : $preference->init_point;

            return response()->json([
                'success' => true,
                'message' => 'Preferencia de pago creada.',
                'data' => [
                    'init_point' => $initPoint,
                    'preference_id' => $preference->id,
                ],
            ]);
        } catch (MPApiException $e) {
            Log::error('Mercado Pago: error al crear preferencia.', [
                'order_id' => $orderId,
                'status' => $e->getApiResponse()->getStatusCode(),
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'No se pudo iniciar el pago. Inténtalo nuevamente.',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Mercado Pago: excepción inesperada al crear preferencia.', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'No se pudo iniciar el pago. Inténtalo nuevamente.',
            ], 500);
        }
    }

    /**
     * Consulta el estado real del pago en Mercado Pago y actualiza la orden.
     */
    public function status(Request $request, $orderId)
    {
        $order = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->findOrFail($orderId);

        if ($order->preference_id && $this->guardHasAccessToken()) {
            try {
                $this->bootMercadoPago();
                $payment = $this->mercadoPago->searchPayments($order->order_number);

                if (! empty($payment->results)) {
                    $this->syncOrderWithPayment($order, $payment->results[0]);
                }
            } catch (\Exception $e) {
                Log::error('Mercado Pago: error al consultar estado del pago.', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order->fresh('items')),
        ]);
    }

    /**
     * Webhook de Mercado Pago para confirmar pagos.
     */
    public function webhook(Request $request)
    {
        $secret = config('mercadopago.webhook_secret');

        if ($secret) {
            try {
                WebhookSignatureValidator::validate(
                    $request->header('x-signature'),
                    $request->header('x-request-id'),
                    $request->query('data.id') ?: $request->input('data.id'),
                    $secret,
                    300
                );
            } catch (\Exception $e) {
                Log::warning('Mercado Pago: webhook con firma inválida.', [
                    'error' => $e->getMessage(),
                ]);

                return response()->json(['success' => false], 401);
            }
        }

        $paymentId = $request->input('data.id')
            ?? $request->query('data.id')
            ?? $request->input('id');

        if (! $paymentId) {
            return response()->json(['success' => false], 422);
        }

        if (! $this->guardHasAccessToken()) {
            Log::warning('Mercado Pago: webhook recibido sin access token configurado.');

            return response()->json(['success' => false], 503);
        }

        try {
            $this->bootMercadoPago();
            $payment = $this->mercadoPago->getPayment((int) $paymentId);

            if ($payment->external_reference) {
                $order = Order::where('order_number', $payment->external_reference)->first();

                if ($order) {
                    $this->syncOrderWithPayment($order, $payment);
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Mercado Pago: error procesando webhook.', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['success' => false], 500);
        }
    }

    private function syncOrderWithPayment(Order $order, $payment): void
    {
        $status = $payment->status;

        if ($status === 'approved' && $order->status === 'pending') {
            $order->update([
                'status' => 'paid',
                'payment_id' => (string) $payment->id,
                'payment_method' => $payment->payment_method_id,
                'paid_at' => now(),
            ]);
        }

        if ($status === 'pending' && ! $order->payment_id) {
            $order->update([
                'payment_id' => (string) $payment->id,
                'payment_method' => $payment->payment_method_id,
            ]);
        }

        // Pago abandonado por el cliente: se cancela la orden y se libera el stock
        if ($status === 'cancelled' && $order->status === 'pending') {
            $order->update([
                'status' => 'cancelled',
                'payment_id' => (string) $payment->id,
                'payment_method' => $payment->payment_method_id,
            ]);
        }

        // Pago rechazado: se conserva la orden pendiente para permitir un reintento
        if ($status === 'rejected' && $order->status === 'pending' && ! $order->payment_id) {
            $order->update([
                'payment_id' => (string) $payment->id,
                'payment_method' => $payment->payment_method_id,
            ]);
        }
    }
}
