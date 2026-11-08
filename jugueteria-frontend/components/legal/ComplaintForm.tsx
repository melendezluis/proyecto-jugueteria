'use client';

import { useState, type FormEvent } from 'react';
import { createComplaint } from '@/services/api';
import { COMPANY } from '@/lib/company';

type ComplaintType = 'reclamo' | 'queja';

type FormState = {
  fullName: string;
  documentType: 'DNI' | 'CE' | 'Pasaporte' | 'RUC';
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  orderNumber: string;
  complaintType: ComplaintType;
  productService: string;
  amount: string;
  detail: string;
  request: string;
  accepted: boolean;
};

type ApiError = Error & {
  errors?: Record<string, string[]>;
};

type RegisteredComplaint = {
  code: string;
  status_label: string;
  created_at: string;
};

const INITIAL_FORM: FormState = {
  fullName: '',
  documentType: 'DNI',
  documentNumber: '',
  email: '',
  phone: '',
  address: '',
  orderNumber: '',
  complaintType: 'reclamo',
  productService: '',
  amount: '',
  detail: '',
  request: '',
  accepted: false,
};

const inputClass =
  'w-full rounded-xl border-2 border-[#2B2D42]/10 bg-white px-4 py-3 text-sm text-[#2B2D42] outline-none transition-colors placeholder:text-[#2B2D42]/35 focus:border-[#5EA57E] focus:ring-4 focus:ring-[#5EA57E]/10 disabled:bg-gray-50 disabled:text-[#2B2D42]/55';

const labelClass =
  'mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#2B2D42]/60';

export default function ComplaintForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [registered, setRegistered] = useState<RegisteredComplaint | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(current => ({ ...current, [key]: value }));
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!form.accepted) {
      setError('Debes declarar que la información proporcionada es veraz.');
      return;
    }

    const amount = form.amount.trim()
      ? Number(form.amount.replace(',', '.'))
      : undefined;

    if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
      setError('Ingresa un monto válido o déjalo en blanco.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createComplaint({
        full_name: form.fullName.trim(),
        document_type: form.documentType,
        document_number: form.documentNumber.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        order_number: form.orderNumber.trim() || undefined,
        type: form.complaintType,
        product_service: form.productService.trim(),
        amount,
        detail: form.detail.trim(),
        request: form.request.trim(),
        accepted: true,
      });

      setRegistered(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      const firstValidationError = apiError.errors
        ? Object.values(apiError.errors)[0]?.[0]
        : undefined;
      setError(
        firstValidationError ||
          apiError.message ||
          'No pudimos registrar tu reclamo. Inténtalo de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function registerAnother() {
    setForm(INITIAL_FORM);
    setRegistered(null);
    setError('');
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-[#2B2D42]/10 bg-[#FFFAF5] p-5 text-sm leading-6 text-[#2B2D42]/75">
        <p className="mb-2">
          <strong className="text-[#2B2D42]">Reclamo:</strong> disconformidad
          relacionada con el producto o servicio.
        </p>
        <p className="mb-0">
          <strong className="text-[#2B2D42]">Queja:</strong> malestar respecto a
          la atención al público o al trato recibido.
        </p>
      </div>

      {registered && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-bold text-emerald-800">
            Tu reclamo fue registrado correctamente.
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            Código de atención:{' '}
            <strong className="text-base tracking-wide">
              {registered.code}
            </strong>
          </p>
          <p className="mt-1 text-xs text-emerald-700/80">
            Estado: {registered.status_label}. Guarda este código para dar
            seguimiento a tu caso.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="complaint-name" className={labelClass}>
              Nombre completo *
            </label>
            <input
              id="complaint-name"
              required
              disabled={!!registered}
              value={form.fullName}
              onChange={event => update('fullName', event.target.value)}
              className={inputClass}
              placeholder="Nombres y apellidos"
            />
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-3">
            <div>
              <label htmlFor="complaint-document-type" className={labelClass}>
                Documento *
              </label>
              <select
                id="complaint-document-type"
                disabled={!!registered}
                value={form.documentType}
                onChange={event =>
                  update(
                    'documentType',
                    event.target.value as FormState['documentType']
                  )
                }
                className={inputClass}
              >
                <option>DNI</option>
                <option>CE</option>
                <option>Pasaporte</option>
                <option>RUC</option>
              </select>
            </div>
            <div>
              <label htmlFor="complaint-document-number" className={labelClass}>
                Número *
              </label>
              <input
                id="complaint-document-number"
                required
                disabled={!!registered}
                value={form.documentNumber}
                onChange={event => update('documentNumber', event.target.value)}
                className={inputClass}
                placeholder="Número de documento"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="complaint-email" className={labelClass}>
              Correo electrónico *
            </label>
            <input
              id="complaint-email"
              type="email"
              required
              disabled={!!registered}
              value={form.email}
              onChange={event => update('email', event.target.value)}
              className={inputClass}
              placeholder="tucorreo@ejemplo.com"
            />
          </div>
          <div>
            <label htmlFor="complaint-phone" className={labelClass}>
              Teléfono
            </label>
            <input
              id="complaint-phone"
              disabled={!!registered}
              value={form.phone}
              onChange={event => update('phone', event.target.value)}
              className={inputClass}
              placeholder="Número de contacto"
            />
          </div>
        </div>

        <div>
          <label htmlFor="complaint-address" className={labelClass}>
            Domicilio
          </label>
          <input
            id="complaint-address"
            disabled={!!registered}
            value={form.address}
            onChange={event => update('address', event.target.value)}
            className={inputClass}
            placeholder="Dirección completa"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="complaint-order" className={labelClass}>
              Número de pedido
            </label>
            <input
              id="complaint-order"
              disabled={!!registered}
              value={form.orderNumber}
              onChange={event => update('orderNumber', event.target.value)}
              className={inputClass}
              placeholder="Ej. ELGATO-XXXXXXXX"
            />
          </div>
          <div>
            <label htmlFor="complaint-amount" className={labelClass}>
              Monto reclamado (S/)
            </label>
            <input
              id="complaint-amount"
              inputMode="decimal"
              disabled={!!registered}
              value={form.amount}
              onChange={event => update('amount', event.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="complaint-product" className={labelClass}>
            Producto o servicio *
          </label>
          <input
            id="complaint-product"
            required
            disabled={!!registered}
            value={form.productService}
            onChange={event => update('productService', event.target.value)}
            className={inputClass}
            placeholder="Describe el producto o servicio"
          />
        </div>

        <fieldset disabled={!!registered}>
          <legend className={labelClass}>Tipo de solicitud *</legend>
          <div className="flex flex-wrap gap-3">
            {(['reclamo', 'queja'] as const).map(type => (
              <label
                key={type}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  form.complaintType === type
                    ? 'border-[#5EA57E] bg-[#E7F5ED] text-[#3F7357]'
                    : 'border-[#2B2D42]/10 bg-white text-[#2B2D42]/60'
                } ${registered ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <input
                  type="radio"
                  name="complaint-type"
                  value={type}
                  checked={form.complaintType === type}
                  onChange={() => update('complaintType', type)}
                  className="sr-only"
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="complaint-detail" className={labelClass}>
            Detalle del reclamo o queja *
          </label>
          <textarea
            id="complaint-detail"
            required
            rows={5}
            disabled={!!registered}
            value={form.detail}
            onChange={event => update('detail', event.target.value)}
            className={inputClass}
            placeholder="Cuéntanos qué ocurrió, cuándo y con qué producto o servicio."
          />
        </div>

        <div>
          <label htmlFor="complaint-request" className={labelClass}>
            Pedido del consumidor *
          </label>
          <textarea
            id="complaint-request"
            required
            rows={4}
            disabled={!!registered}
            value={form.request}
            onChange={event => update('request', event.target.value)}
            className={inputClass}
            placeholder="Indica qué solución solicitas."
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#2B2D42]/10 bg-[#FFFAF5] p-4 text-sm leading-6 text-[#2B2D42]/75">
          <input
            type="checkbox"
            checked={form.accepted}
            disabled={!!registered}
            onChange={event => update('accepted', event.target.checked)}
            className="mt-1 h-4 w-4 flex-shrink-0 accent-[#5EA57E]"
          />
          <span>
            Declaro que la información proporcionada es veraz y autorizo su uso
            para atender este reclamo o queja.
          </span>
        </label>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={submitting || !!registered}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5EA57E] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4E8A68] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? (
              'Registrando reclamo...'
            ) : registered ? (
              'Reclamo registrado'
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
                Registrar reclamo
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#2B2D42]/15 bg-white px-6 py-3 text-sm font-bold text-[#2B2D42]/75 transition-colors hover:border-[#2B2D42]/30"
          >
            Imprimir o guardar PDF
          </button>
          {registered && (
            <button
              type="button"
              onClick={registerAnother}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#2B2D42]/15 bg-white px-6 py-3 text-sm font-bold text-[#2B2D42]/75 transition-colors hover:border-[#2B2D42]/30"
            >
              Registrar otro reclamo
            </button>
          )}
        </div>

        <p className="text-xs leading-5 text-[#2B2D42]/50">
          También puedes presentar tu reclamo en {COMPANY.address}. Si necesitas
          ayuda, escríbenos a {COMPANY.email}.
        </p>
      </form>
    </div>
  );
}
