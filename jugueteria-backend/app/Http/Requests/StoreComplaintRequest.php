<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => is_string($this->email) ? mb_strtolower(trim($this->email)) : $this->email,
            'phone' => is_string($this->phone) ? preg_replace('/[\s-]/', '', $this->phone) : $this->phone,
        ]);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'min:3', 'max:255'],
            'document_type' => ['required', Rule::in(['DNI', 'CE', 'Pasaporte', 'RUC'])],
            'document_number' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'order_number' => ['nullable', 'string', 'max:50'],
            'type' => ['required', Rule::in(['reclamo', 'queja'])],
            'product_service' => ['required', 'string', 'max:500'],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'detail' => ['required', 'string', 'min:10', 'max:5000'],
            'request' => ['required', 'string', 'min:5', 'max:5000'],
            'accepted' => ['required', 'accepted'],
        ];
    }

    public function attributes(): array
    {
        return [
            'full_name' => 'nombre completo',
            'document_type' => 'tipo de documento',
            'document_number' => 'número de documento',
            'product_service' => 'producto o servicio',
            'detail' => 'detalle',
            'request' => 'pedido del consumidor',
            'accepted' => 'declaración de veracidad',
        ];
    }
}
