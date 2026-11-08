import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/company';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/', priority: 1 },
    { path: '/descuentos', priority: 0.9 },
    { path: '/recien-llegados', priority: 0.9 },
    { path: '/pack-de-juegos', priority: 0.8 },
    { path: '/envio-express', priority: 0.7 },
    { path: '/preguntas-frecuentes', priority: 0.7 },
    { path: '/nosotros', priority: 0.6 },
    { path: '/contacto', priority: 0.6 },
    { path: '/politica-de-envios-y-devoluciones', priority: 0.5 },
    { path: '/terminos-y-condiciones', priority: 0.4 },
    { path: '/politica-de-privacidad', priority: 0.4 },
    { path: '/politica-de-cookies', priority: 0.4 },
    { path: '/libro-de-reclamaciones', priority: 0.3 },
  ];
  const lastModified = new Date();

  return routes.map(route => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.path === '/' ? 'daily' : 'monthly',
    priority: route.priority,
  }));
}
