import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import ComplaintForm from '@/components/legal/ComplaintForm';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones',
  description:
    'Presenta un reclamo o queja sobre un producto o servicio de Juguetería El Gato.',
};

export default function LibroDeReclamacionesPage() {
  return (
    <LegalPage
      title="Libro de Reclamaciones"
      subtitle="Registra en línea un reclamo o queja sobre nuestros productos o servicios y recibe un código de seguimiento."
      updatedAt={COMPANY.legalUpdatedAt}
    >
      <h2>Datos del proveedor</h2>
      <p>
        <strong>Razón social:</strong> {COMPANY.legalName}
        <br />
        {COMPANY.ruc && (
          <>
            <strong>RUC:</strong> {COMPANY.ruc}
            <br />
          </>
        )}
        <strong>Domicilio:</strong> {COMPANY.address}
        <br />
        <strong>Correo:</strong>{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        <br />
        <strong>Teléfono:</strong>{' '}
        <a href={`tel:${COMPANY.phoneHref}`}>{COMPANY.phone}</a>
      </p>

      <div className="legal-note">
        <p>
          <strong>Cómo funciona:</strong> completa el formulario y envíalo en
          línea. Recibirás un código de atención para dar seguimiento a tu caso.
          También puedes imprimirlo o guardarlo en PDF y presentarlo en nuestra
          tienda.
        </p>
      </div>

      <h2>Formato de reclamo o queja</h2>
      <ComplaintForm />

      <h2>¿Prefieres presentarlo en tienda?</h2>
      <p>
        Puedes acercarte a {COMPANY.address} en el horario {COMPANY.hours.toLowerCase()}.
        Lleva tu documento de identidad y, si corresponde, el número de pedido o
        comprobante de compra.
      </p>
      <p>
        Si tu consulta no es un reclamo formal, puedes usar nuestra{' '}
        <Link href="/contacto">página de contacto</Link> o revisar las{' '}
        <Link href="/preguntas-frecuentes">preguntas frecuentes</Link>.
      </p>
    </LegalPage>
  );
}
