import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description:
    'Conoce Juguetería El Gato, una tienda de juguetes en Chancay para todas las edades.',
};

export default function NosotrosPage() {
  return (
    <LegalPage
      title="Sobre Nosotros"
      subtitle="Juguetes que hacen feliz, con atención cercana y entrega en Chancay."
      updatedAt={COMPANY.legalUpdatedAt}
    >
      <p>
        <strong>{COMPANY.name}</strong> es una juguetería ubicada en Chancay,
        Huaral, dedicada a acercar juguetes y momentos de alegría a las familias
        de nuestra comunidad.
      </p>

      <h2>Nuestra misión</h2>
      <p>
        Ofrecer juguetes de calidad para todas las edades, con una experiencia de
        compra simple, segura y cercana. Queremos que encontrar el regalo perfecto
        sea fácil, desde la comodidad de tu casa o visitando nuestra tienda.
      </p>

      <h2>Qué nos importa</h2>
      <ul>
        <li>
          <strong>Atención cercana:</strong> te ayudamos a elegir el juguete
          adecuado según la edad, el interés y el presupuesto.
        </li>
        <li>
          <strong>Confianza:</strong> mostramos precios claros, opciones de pago
          seguras y una política transparente de envíos y devoluciones.
        </li>
        <li>
          <strong>Juego seguro:</strong> recomendamos revisar siempre la edad
          indicada y las advertencias de cada producto.
        </li>
        <li>
          <strong>Comunidad:</strong> trabajamos para que las familias de Chancay y
          alrededores tengan una opción local para sus compras.
        </li>
      </ul>

      <h2>Nuestra tienda</h2>
      <p>
        Nos encuentras en {COMPANY.address}. Atendemos de {COMPANY.hours.toLowerCase()}
        . Si compras en línea, puedes elegir entrega a domicilio dentro de nuestra
        zona de cobertura o recojo en tienda sin costo.
      </p>

      <h2>Hablemos</h2>
      <p>
        ¿Buscas un juguete en particular o necesitas orientación? Escríbenos por{' '}
        <Link href="/contacto">nuestros canales de contacto</Link> o revisa las{' '}
        <Link href="/preguntas-frecuentes">preguntas frecuentes</Link>.
      </p>
    </LegalPage>
  );
}
