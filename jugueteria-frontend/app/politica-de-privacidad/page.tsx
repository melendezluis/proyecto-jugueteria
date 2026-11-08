import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description:
    'Información sobre los datos personales que recopilamos, cómo los usamos y cómo puedes ejercer tus derechos.',
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      subtitle="Tu privacidad es importante. Aquí explicamos qué datos recopilamos y cómo los protegemos."
      updatedAt={COMPANY.legalUpdatedAt}
    >
      <p>
        Esta Política de Privacidad describe cómo <strong>{COMPANY.legalName}</strong>{' '}
        recopila, usa, almacena y protege los datos personales de las personas que
        visitan o compran en este sitio.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable es <strong>{COMPANY.legalName}</strong>, con domicilio en{' '}
        {COMPANY.address}. Para consultas sobre privacidad puedes escribir a{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> o llamar al{' '}
        <a href={`tel:${COMPANY.phoneHref}`}>{COMPANY.phone}</a>.
      </p>
      {COMPANY.ruc && (
        <p>
          <strong>RUC:</strong> {COMPANY.ruc}
        </p>
      )}

      <h2>2. Datos que recopilamos</h2>
      <p>Podemos recopilar las siguientes categorías de datos:</p>
      <ul>
        <li>
          <strong>Datos de identificación y contacto:</strong> nombre, correo
          electrónico, teléfono, documento de identidad cuando sea necesario.
        </li>
        <li>
          <strong>Datos de entrega:</strong> dirección, número, referencias y
          coordenadas de ubicación que marques en el mapa.
        </li>
        <li>
          <strong>Datos de compra:</strong> productos, cantidades, importes,
          historial de pedidos y estado de pago.
        </li>
        <li>
          <strong>Datos de pago:</strong> información necesaria para procesar el
          pago a través de Mercado Pago. No almacenamos los datos completos de tu
          tarjeta.
        </li>
        <li>
          <strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo,
          navegador, fecha y hora de acceso, y registros de seguridad.
        </li>
      </ul>

      <h2>3. Finalidades del tratamiento</h2>
      <p>Usamos tus datos para:</p>
      <ul>
        <li>Gestionar tu cuenta, carrito y pedidos.</li>
        <li>Procesar pagos y coordinar entregas o recojo en tienda.</li>
        <li>Enviarte comunicaciones relacionadas con tus compras.</li>
        <li>Atender consultas, reclamos, devoluciones y garantías.</li>
        <li>Prevenir fraudes y mantener la seguridad del sitio.</li>
        <li>Cumplir obligaciones legales y tributarias.</li>
        <li>
          Enviarte promociones o novedades, solo si otorgaste tu consentimiento y
          mientras no solicites dejar de recibirlas.
        </li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        Tratamos tus datos sobre la base de la ejecución de la relación de compra,
        el cumplimiento de obligaciones legales, tu consentimiento cuando
        corresponda y nuestro interés legítimo en mejorar y proteger el servicio.
      </p>

      <h2>5. Cookies y almacenamiento local</h2>
      <p>
        Usamos cookies y almacenamiento local para recordar tu sesión y tu carrito,
        y para guardar tus preferencias de privacidad. No utilizamos cookies
        publicitarias de terceros en este sitio. Puedes obtener más información en
        nuestra <Link href="/politica-de-cookies">Política de Cookies</Link>.
      </p>

      <h2>6. Compartición de datos</h2>
      <p>
        No vendemos tus datos personales. Podemos compartirlos con proveedores que
        nos ayudan a operar el servicio, como Mercado Pago para el procesamiento de
        pagos, empresas de transporte para las entregas, proveedores de hosting y
        servicios tecnológicos, y autoridades cuando exista una obligación legal.
      </p>

      <h2>7. Conservación</h2>
      <p>
        Conservamos tus datos mientras tu cuenta esté activa o mientras sean
        necesarios para cumplir las finalidades descritas. Luego los eliminamos o
        anonimizamos, salvo que la ley exija conservarlos por un plazo mayor.
      </p>

      <h2>8. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, cancelación y
        oposición (ARCO), así como solicitar información sobre el tratamiento de
        tus datos, escribiendo a{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Tu solicitud debe
        incluir tu nombre, un medio de contacto y el detalle de lo que deseas
        ejercer. Podremos pedirte información adicional para verificar tu
        identidad.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus
        datos, como cifrado en tránsito, control de acceso y monitoreo de
        seguridad. Ningún sistema es completamente infalible, por lo que te
        recomendamos usar contraseñas seguras y no compartir tu cuenta.
      </p>

      <h2>10. Menores de edad</h2>
      <p>
        El sitio está dirigido a personas mayores de edad. Si un menor de edad
        utiliza el sitio, debe hacerlo con la supervisión y autorización de su
        padre, madre o tutor. No recopilamos conscientemente datos de menores sin
        dicha autorización.
      </p>

      <h2>11. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta Política de Privacidad para reflejar cambios en
        nuestras prácticas o en la normativa aplicable. Publicaremos la versión
        vigente en esta página con su fecha de actualización.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Si tienes preguntas sobre esta política, escríbenos a{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> o visítanos en{' '}
        {COMPANY.address}, en el horario {COMPANY.hours.toLowerCase()}.
      </p>
    </LegalPage>
  );
}
