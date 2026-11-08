import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description:
    'Respuestas sobre compras, pagos, envíos, recojo en tienda, devoluciones y tu cuenta.',
};

const FAQS = [
  {
    question: '¿Cómo realizo una compra?',
    answer:
      'Elige los productos que deseas, agrégalos al carrito y ve a la página de checkout. Inicia sesión, completa tus datos de entrega, acepta los términos y confirma el pedido. Luego serás dirigido a Mercado Pago para completar el pago.',
  },
  {
    question: '¿Qué medios de pago aceptan?',
    answer:
      'Aceptamos los medios habilitados en Mercado Pago, como tarjetas de crédito y débito, y otros métodos disponibles en tu cuenta. El pago se procesa en la plataforma segura de Mercado Pago.',
  },
  {
    question: '¿Cuánto cuesta el envío?',
    answer:
      'El envío cuesta S/ 5.00 hasta 5 km y S/ 10.00 entre 5 y 15 km desde la tienda en Chancay. Si estás a más de 15 km, no hay cobertura de envío y puedes elegir recojo en tienda sin costo.',
  },
  {
    question: '¿Cómo se calcula la distancia de envío?',
    answer:
      'Durante el checkout debes marcar tu ubicación en el mapa. Usamos esa referencia para calcular la distancia aproximada desde la tienda y mostrarte la tarifa antes de confirmar la compra.',
  },
  {
    question: '¿Puedo recoger mi pedido en tienda?',
    answer:
      'Sí. El recojo en tienda es gratuito. Coordinaremos el horario por teléfono o correo. Presenta tu número de orden y documento de identidad al momento de recogerlo.',
  },
  {
    question: '¿Cuánto demora mi pedido?',
    answer:
      'Preparamos los pedidos pagados dentro de las 24 horas hábiles siguientes. Las entregas locales suelen realizarse el mismo día o el siguiente día hábil, previa coordinación.',
  },
  {
    question: '¿Cómo sigo el estado de mi pedido?',
    answer:
      'Puedes revisar tus pedidos desde la sección “Mis pedidos” de tu cuenta. También te contactaremos por teléfono o correo para coordinar la entrega.',
  },
  {
    question: '¿Puedo cambiar o devolver un producto?',
    answer:
      'Sí, dentro de los 30 días calendario posteriores a la entrega, siempre que el producto esté sin uso, completo y en su empaque original. Revisa la Política de Envíos y Devoluciones para conocer las condiciones y exclusiones.',
  },
  {
    question: '¿Qué hago si mi producto llegó defectuoso?',
    answer:
      'Escríbenos de inmediato con tu número de orden y fotos del producto. Evaluaremos el caso y coordinaremos el cambio, la reparación o la devolución según corresponda.',
  },
  {
    question: '¿Cómo actualizo mis datos o mi contraseña?',
    answer:
      'Ingresa a la sección “Mi perfil” para actualizar tus datos. Para cambiar tu contraseña, usa la opción correspondiente dentro de tu cuenta o el enlace de recuperación en la pantalla de inicio de sesión.',
  },
  {
    question: '¿Cómo elimino mi cuenta o mis datos?',
    answer:
      'Escríbenos a ventas@elgato.pe indicando tu solicitud. Atenderemos tu pedido conforme a nuestra Política de Privacidad y a la normativa aplicable.',
  },
  {
    question: '¿Dónde presento un reclamo o queja?',
    answer:
      'Puedes usar nuestro Libro de Reclamaciones o escribirnos a ventas@elgato.pe. También puedes acudir a la tienda en el horario de atención.',
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <LegalPage
      title="Preguntas Frecuentes"
      subtitle="Encuentra respuestas rápidas sobre compras, pagos, envíos y devoluciones."
      updatedAt={COMPANY.legalUpdatedAt}
    >
      <div className="space-y-3">
        {FAQS.map(item => (
          <details
            key={item.question}
            className="group rounded-2xl border border-[#2B2D42]/10 bg-[#FFFAF5] px-5 py-4"
          >
            <summary className="cursor-pointer list-none pr-8 font-fredoka text-base font-semibold text-[#2B2D42] marker:content-none">
              <span className="flex items-start justify-between gap-4">
                {item.question}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="mt-1 h-4 w-4 flex-shrink-0 text-[#5EA57E] transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-[#2B2D42]/75">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <h2>¿No encontraste lo que buscabas?</h2>
      <p>
        Visita nuestra <Link href="/contacto">página de contacto</Link> o revisa
        las políticas de <Link href="/politica-de-envios-y-devoluciones">envíos y devoluciones</Link>,{' '}
        <Link href="/politica-de-privacidad">privacidad</Link> y{' '}
        <Link href="/politica-de-cookies">cookies</Link>.
      </p>

      <div className="legal-note">
        <p>
          <strong>Horario de atención:</strong> {COMPANY.hours}. También puedes
          escribirnos a <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
      </div>
    </LegalPage>
  );
}
