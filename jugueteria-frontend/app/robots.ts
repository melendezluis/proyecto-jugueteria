import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/company';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/perfil', '/orders', '/recuperar-password', '/restablecer-password'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
