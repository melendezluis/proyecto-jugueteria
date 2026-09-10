<?php

namespace App\Services;

use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Net\MPSearchRequest;

/**
 * Fachada sobre el SDK de Mercado Pago para poder probar el flujo de pagos
 * sin depender de llamadas reales a la API (los clientes del SDK son finales).
 */
class MercadoPagoService
{
    public function __construct(
        private PaymentClient $paymentClient,
        private PreferenceClient $preferenceClient,
    ) {}

    public function createPreference(array $payload)
    {
        return $this->preferenceClient->create($payload);
    }

    public function getPayment(int $paymentId)
    {
        return $this->paymentClient->get($paymentId);
    }

    public function searchPayments(string $externalReference)
    {
        return $this->paymentClient->search(new MPSearchRequest(1, 0, [
            'external_reference' => $externalReference,
            'sort' => 'date_created',
            'criteria' => 'desc',
        ]));
    }
}
