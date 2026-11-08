export const COMPANY = {
  name: 'Juguetería El Gato',
  legalName:
    process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME?.trim() || 'Juguetería El Gato',
  ruc: process.env.NEXT_PUBLIC_COMPANY_RUC?.trim() || '',
  address: 'Av. Buenos Aires 1209, Chancay - Huaral, Perú',
  email: 'ventas@elgato.pe',
  phone: '+51 928 049 345',
  phoneHref: '+51928049345',
  whatsapp: '51928049345',
  hours: 'Lunes a viernes de 09:00 a 17:00 hrs',
  legalUpdatedAt: '3 de noviembre de 2026',
} as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://elgato.pe'
).replace(/\/$/, '');

export const LEGAL_LINKS = [
  { label: 'Términos y Condiciones', href: '/terminos-y-condiciones' },
  { label: 'Política de Privacidad', href: '/politica-de-privacidad' },
  { label: 'Política de Cookies', href: '/politica-de-cookies' },
  {
    label: 'Envíos y Devoluciones',
    href: '/politica-de-envios-y-devoluciones',
  },
  { label: 'Libro de Reclamaciones', href: '/libro-de-reclamaciones' },
] as const;
