import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Política de Envíos y Devoluciones',
  description:
    'Zonas de cobertura, costos, plazos de entrega, recojo en tienda y proceso de cambios o devoluciones.',
};

export default function EnviosDevolucionesPage() {
  return (
    <LegalPage
      title="Política de Envíos y Devoluciones"
      subtitle="Todo lo que necesitas saber antes y después de recibir tu pedido."
      updatedAt={COMPANY.legalUpdatedAt}
    >
      <h2>1. Zona de cobertura</h2>
      <p>
        Realizamos entregas a domicilio dentro de los primeros{' '}
        <strong>15 km</strong> desde nuestra tienda en Chancay. El costo depende de
        la distancia entre la tienda y la ubicación que marques en el mapa durante
        el checkout:
      </p>
      <ul>
        <li>
          <strong>Hasta 5 km:</strong> S/ 5.00.
        </li>
        <li>
          <strong>Más de 5 km y hasta 15 km:</strong> S/ 10.00.
        </li>
        <li>
          <strong>Más de 15 km:</strong> no hay cobertura de envío. Puedes elegir
          recojo en tienda.
        </li>
      </ul>
      <p>
        La disponibilidad y el costo exacto se muestran antes de confirmar el
        pedido. Si no marcas tu ubicación, el sistema no podrá calcular el envío.
      </p>

      <h2>2. Recojo en tienda</h2>
      <p>
        Puedes elegir <strong>recojo en tienda sin costo</strong> en{' '}
        {COMPANY.address}. Coordinaremos contigo el horario de atención, de lunes a
        viernes de 09:00 a 17:00 hrs. Para recoger el pedido, presenta el número de
        orden y tu documento de identidad.
      </p>

      <h2>3. Plazos de entrega</h2>
      <p>
        Preparamos los pedidos pagados dentro de las 24 horas hábiles siguientes.
        Las entregas locales suelen realizarse el mismo día o el siguiente día
        hábil, previa coordinación. Los plazos pueden variar por feriados, clima,
        disponibilidad del producto o causas ajenas a nosotros.
      </p>

      <h2>4. Seguimiento y entrega</h2>
      <p>
        Te contactaremos por teléfono o correo para coordinar la entrega. Es
        importante que los datos de contacto y la dirección estén correctos. Si no
        es posible realizar la entrega por datos incorrectos o ausencia del
        destinatario, coordinaremos un nuevo intento o el recojo en tienda.
      </p>

      <h2>5. Cambios y devoluciones</h2>
      <p>
        Puedes solicitar un cambio o devolución dentro de los{' '}
        <strong>30 días calendario</strong> posteriores a la entrega. El producto
        debe estar sin uso, completo, en su empaque original y acompañado del
        comprobante de compra o número de orden.
      </p>
      <p>No se aceptan cambios ni devoluciones cuando:</p>
      <ul>
        <li>El producto fue usado, abierto o manipulado indebidamente.</li>
        <li>Faltan piezas, accesorios o el empaque original.</li>
        <li>Se trata de productos personalizados o de uso higiénico, salvo defecto.</li>
        <li>El daño fue causado por mal uso o por no seguir las instrucciones.</li>
      </ul>

      <h2>6. Productos defectuosos o incorrectos</h2>
      <p>
        Si recibes un producto defectuoso, incompleto o distinto al solicitado,
        contáctanos de inmediato con fotos y el número de orden. Evaluaremos el caso
        y, según corresponda, coordinaremos el cambio, la reparación o la
        devolución del importe, conforme a la garantía legal.
      </p>

      <h2>7. Reembolsos</h2>
      <p>
        Los reembolsos se realizan por el mismo medio de pago utilizado, una vez
        verificado y recibido el producto cuando corresponda. El plazo depende del
        proveedor de pago y puede tomar entre 5 y 10 días hábiles.
      </p>

      <h2>8. Cómo solicitar un cambio o devolución</h2>
      <ol>
        <li>
          Escríbenos a <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> o por
          WhatsApp al <a href={`tel:${COMPANY.phoneHref}`}>{COMPANY.phone}</a>.
        </li>
        <li>Indica tu número de orden y el motivo de la solicitud.</li>
        <li>Adjunta fotos del producto y del empaque, si corresponde.</li>
        <li>Te indicaremos los pasos y el lugar de entrega o recojo.</li>
      </ol>

      <h2>9. Cancelaciones</h2>
      <p>
        Puedes solicitar la cancelación de un pedido mientras no haya sido enviado.
        Si el pago ya fue procesado, coordinaremos la devolución correspondiente
        según el medio de pago.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para cualquier consulta sobre envíos o devoluciones, contáctanos en{' '}
        <Link href="/contacto">nuestra página de contacto</Link> o revisa las{' '}
        <Link href="/preguntas-frecuentes">preguntas frecuentes</Link>.
      </p>
    </LegalPage>
  );
}
