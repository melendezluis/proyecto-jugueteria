import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Escríbenos, llámanos o visítanos en Chancay. Estamos para ayudarte con tu compra.',
};

const WHATSAPP_URL = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(
  'Hola, necesito ayuda con una compra en Juguetería El Gato.'
)}`;

const CONTACT_METHODS = [
  {
    title: 'WhatsApp',
    detail: COMPANY.phone,
    hint: 'Respuesta rápida en horario de atención',
    href: WHATSAPP_URL,
    external: true,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
      />
    ),
  },
  {
    title: 'Correo electrónico',
    detail: COMPANY.email,
    hint: 'Para consultas, pedidos y reclamos',
    href: `mailto:${COMPANY.email}`,
    external: false,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    ),
  },
  {
    title: 'Teléfono',
    detail: COMPANY.phone,
    hint: 'Llámanos de lunes a viernes',
    href: `tel:${COMPANY.phoneHref}`,
    external: false,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    ),
  },
];

export default function ContactoPage() {
  return (
    <LegalPage
      title="Contacto"
      subtitle="Estamos para ayudarte con tu compra, tu pedido o cualquier consulta."
      updatedAt={COMPANY.legalUpdatedAt}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {CONTACT_METHODS.map(method => (
          <a
            key={method.title}
            href={method.href}
            target={method.external ? '_blank' : undefined}
            rel={method.external ? 'noopener noreferrer' : undefined}
            className="legal-card group rounded-2xl border border-[#2B2D42]/10 bg-[#FFFAF5] p-5 transition-all hover:-translate-y-0.5 hover:border-[#5EA57E]/40 hover:shadow-md"
          >
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F5ED] text-[#3F7357]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {method.icon}
              </svg>
            </span>
            <p className="!mb-1 font-fredoka text-base font-semibold text-[#2B2D42]">
              {method.title}
            </p>
            <p className="!mb-1 text-sm font-semibold text-[#1B66D0] group-hover:underline">
              {method.detail}
            </p>
            <p className="!mb-0 text-xs text-[#2B2D42]/55">{method.hint}</p>
          </a>
        ))}
      </div>

      <h2>Visítanos</h2>
      <p>
        <strong>Dirección:</strong> {COMPANY.address}
        <br />
        <strong>Horario:</strong> {COMPANY.hours}
        <br />
        <strong>Domingos y feriados:</strong> cerrado
      </p>
      <p>
        Si vienes a recoger un pedido, trae tu número de orden y tu documento de
        identidad. También puedes coordinar previamente por WhatsApp.
      </p>

      <h2>Antes de escribirnos</h2>
      <p>
        Revisa nuestras <Link href="/preguntas-frecuentes">preguntas frecuentes</Link>{' '}
        para encontrar respuestas sobre pagos, envíos y devoluciones. Para
        presentar un reclamo o queja formal, usa el{' '}
        <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link>.
      </p>

      <div className="legal-note">
        <p>
          <strong>Importante:</strong> por seguridad, nunca te pediremos tu
          contraseña ni los datos completos de tu tarjeta por correo, teléfono o
          WhatsApp.
        </p>
      </div>
    </LegalPage>
  );
}
