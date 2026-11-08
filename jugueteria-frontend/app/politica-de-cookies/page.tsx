import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description:
    'Conoce qué cookies y almacenamiento local usa Juguetería El Gato y cómo puedes gestionarlos.',
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de Cookies"
      subtitle="Usamos almacenamiento esencial para que la tienda funcione correctamente y para recordar tus preferencias."
      updatedAt={COMPANY.legalUpdatedAt}
    >
      <h2>1. ¿Qué son las cookies y el almacenamiento local?</h2>
      <p>
        Las cookies son pequeños archivos que un sitio web guarda en tu
        dispositivo. El almacenamiento local (localStorage) funciona de manera
        similar, pero permite guardar información directamente en el navegador.
        Ambos se usan para recordar datos entre visitas o durante una misma sesión.
      </p>

      <h2>2. Qué utilizamos en este sitio</h2>
      <p>
        Actualmente utilizamos almacenamiento estrictamente necesario para el
        funcionamiento de la tienda. No usamos cookies publicitarias ni herramientas
        de seguimiento de terceros en este sitio.
      </p>
      <ul>
        <li>
          <strong>Sesión y autenticación:</strong> guardamos un token de acceso
          para mantener tu sesión iniciada mientras navegas y realizas compras.
        </li>
        <li>
          <strong>Carrito de compras:</strong> guardamos los productos que agregas
          para que no los pierdas al recargar la página.
        </li>
        <li>
          <strong>Preferencias de privacidad:</strong> guardamos tu elección en el
          aviso de cookies para no volver a mostrártelo en cada visita.
        </li>
      </ul>

      <h2>3. Servicios de terceros</h2>
      <p>
        Cuando eliges pagar con Mercado Pago, serás redirigido a su plataforma y
        estarás sujeto a sus propias políticas de cookies y privacidad. También
        podemos usar proveedores de hosting o seguridad que aplican cookies
        técnicas necesarias para prestar el servicio.
      </p>

      <h2>4. Cómo gestionar o eliminar cookies</h2>
      <p>
        Puedes eliminar o bloquear las cookies y el almacenamiento local desde la
        configuración de tu navegador. Ten en cuenta que, si bloqueas el
        almacenamiento esencial, es posible que el carrito o el inicio de sesión no
        funcionen correctamente.
      </p>
      <p>
        También puedes borrar los datos del sitio desde las opciones de privacidad
        de tu navegador. Al hacerlo, se eliminarán tus preferencias guardadas.
      </p>

      <h2>5. Consentimiento</h2>
      <p>
        Al usar el sitio aceptas el uso del almacenamiento estrictamente necesario
        descrito en esta política. Si en el futuro incorporamos cookies analíticas o
        publicitarias, actualizaremos esta política y solicitaremos el
        consentimiento correspondiente antes de activarlas.
      </p>

      <h2>6. Más información</h2>
      <p>
        Para conocer cómo tratamos tus datos personales, revisa nuestra{' '}
        <Link href="/politica-de-privacidad">Política de Privacidad</Link>. Si
        tienes dudas, escríbenos a{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>

      <div className="legal-note">
        <p>
          <strong>Nota:</strong> este sitio no utiliza cookies de publicidad
          comportamental. Las cookies técnicas son necesarias para mantener tu
          carrito, tu sesión y tus preferencias de privacidad.
        </p>
      </div>
    </LegalPage>
  );
}
