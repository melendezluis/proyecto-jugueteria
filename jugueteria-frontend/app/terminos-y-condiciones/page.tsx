import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description:
    'Conoce las condiciones de compra, pagos, envíos, devoluciones y uso del sitio de Juguetería El Gato.',
};

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y Condiciones"
      subtitle="Estas condiciones regulan el uso de nuestro sitio web y la compra de productos en Juguetería El Gato."
      updatedAt={COMPANY.legalUpdatedAt}
    >
      <p>
        Bienvenido a <strong>{COMPANY.name}</strong>. Al navegar en este sitio,
        crear una cuenta o realizar una compra, aceptas los presentes Términos y
        Condiciones. Si no estás de acuerdo con alguna parte, te pedimos no
        utilizar el sitio ni completar una compra.
      </p>

      <h2>1. Datos del proveedor</h2>
      <p>
        Este sitio es operado por <strong>{COMPANY.legalName}</strong>, con
        domicilio en {COMPANY.address}. Puedes contactarnos por correo a{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> o por teléfono
        al <a href={`tel:${COMPANY.phoneHref}`}>{COMPANY.phone}</a>.
      </p>
      {COMPANY.ruc && (
        <p>
          <strong>RUC:</strong> {COMPANY.ruc}
        </p>
      )}

      <h2>2. Aceptación y capacidad</h2>
      <p>
        Para comprar debes ser mayor de edad y contar con capacidad legal para
        contratar. Si compras como representante de un menor de edad, asumes la
        responsabilidad por la compra y por la supervisión del uso de los
        productos según la edad recomendada.
      </p>

      <h2>3. Productos, stock y disponibilidad</h2>
      <p>
        Los productos se ofrecen sujetos a disponibilidad de stock. Las imágenes,
        colores y descripciones son referenciales y pueden variar ligeramente
        respecto al producto físico. La edad recomendada y las advertencias de
        seguridad de cada juguete deben respetarse, especialmente cuando
        contienen piezas pequeñas.
      </p>
      <p>
        Si un producto no se encuentra disponible después de realizada la compra,
        nos pondremos en contacto contigo para ofrecerte un cambio, un vale o la
        devolución del importe pagado.
      </p>

      <h2>4. Precios y pagos</h2>
      <p>
        Los precios se expresan en soles peruanos (S/) e incluyen los impuestos
        aplicables, salvo que se indique lo contrario. El costo de envío se
        calcula antes de confirmar el pedido y se muestra en el resumen de compra.
      </p>
      <p>
        Los pagos se procesan a través de Mercado Pago u otros medios habilitados
        en el sitio. No almacenamos los datos completos de tarjetas bancarias. La
        confirmación del pedido está sujeta a la aprobación del pago por parte del
        proveedor correspondiente.
      </p>
      <p>
        Los cupones y descuentos están sujetos a vigencia, stock, compra mínima y
        límites de uso indicados en cada promoción. Solo se puede aplicar un cupón
        por pedido y no son acumulables entre sí ni canjeables por efectivo. El uso
        del cupón se reserva al confirmar el pedido y se libera si el pedido es
        cancelado. Nos reservamos el derecho de anular descuentos obtenidos mediante
        uso indebido, duplicidad o fraude.
      </p>

      <h2>5. Confirmación y cancelación del pedido</h2>
      <p>
        Al finalizar la compra recibirás una confirmación con el detalle del
        pedido. Nos reservamos el derecho de cancelar pedidos con datos falsos,
        incompletos, duplicados, sospechosos o cuando exista un error evidente de
        precio o stock. En esos casos coordinaremos la devolución del monto
        pagado.
      </p>

      <h2>6. Envíos y recojo en tienda</h2>
      <p>
        Realizamos envíos dentro de la zona de cobertura indicada en el checkout.
        Los plazos y costos dependen de la distancia y se detallan en la{' '}
        <Link href="/politica-de-envios-y-devoluciones">
          Política de Envíos y Devoluciones
        </Link>
        . También puedes elegir recojo en tienda en el domicilio indicado, previa
        coordinación.
      </p>

      <h2>7. Cambios, devoluciones y garantía</h2>
      <p>
        Aceptamos cambios y devoluciones dentro de los 30 días calendario
        posteriores a la entrega, siempre que el producto esté sin uso, completo,
        en su empaque original y con el comprobante de compra. Los productos
        defectuosos o distintos a lo solicitado serán atendidos conforme a la
        garantía legal y a la{' '}
        <Link href="/politica-de-envios-y-devoluciones">
          Política de Envíos y Devoluciones
        </Link>
        .
      </p>

      <h2>8. Uso permitido del sitio</h2>
      <p>Al utilizar el sitio te comprometes a no:</p>
      <ul>
        <li>Realizar compras fraudulentas o con datos de terceros sin autorización.</li>
        <li>Intentar acceder a cuentas, sistemas o información no autorizados.</li>
        <li>Copiar, modificar o distribuir el contenido sin autorización.</li>
        <li>Usar el sitio para actividades ilícitas o contrarias al orden público.</li>
      </ul>

      <h2>9. Propiedad intelectual</h2>
      <p>
        El nombre, logotipo, textos, imágenes, diseño y demás contenido del sitio
        son propiedad de {COMPANY.legalName} o de sus respectivos titulares. No se
        permite su reproducción o uso comercial sin autorización previa por
        escrito.
      </p>

      <h2>10. Responsabilidad</h2>
      <p>
        Hacemos esfuerzos razonables para que la información del sitio sea exacta y
        esté actualizada. Sin embargo, no garantizamos que el sitio esté libre de
        interrupciones, errores técnicos o inexactitudes. En la medida permitida
        por ley, no seremos responsables por daños indirectos derivados del uso del
        sitio.
      </p>

      <h2>11. Modificaciones</h2>
      <p>
        Podemos actualizar estos Términos y Condiciones en cualquier momento. La
        versión vigente será la publicada en esta página e indicará su fecha de
        actualización. Las compras realizadas antes de un cambio se rigen por la
        versión vigente al momento de la compra.
      </p>

      <h2>12. Ley aplicable y reclamos</h2>
      <p>
        Estos términos se rigen por las leyes de la República del Perú. Para
        presentar un reclamo o queja puedes usar nuestro{' '}
        <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link> o
        escribirnos a <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>

      <div className="legal-note">
        <p>
          <strong>Importante:</strong> los juguetes pueden contener piezas pequeñas
          o requerir supervisión adulta. Revisa siempre la edad recomendada y las
          instrucciones del fabricante antes de entregar un producto a un menor.
        </p>
      </div>
    </LegalPage>
  );
}
