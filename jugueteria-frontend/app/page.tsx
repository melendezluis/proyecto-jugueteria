import HomeContent from '@/components/HomeContent';
import HeroCarousel from '@/components/home/HeroCarousel';
import OffersSection from '@/components/home/OffersSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhatsAppButton from '@/components/home/WhatsAppButton';
import { getProducts, getCategories } from '@/services/api';
import type { Product, Category } from '@/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      getProducts({ per_page: '1000' }),
      getCategories(),
    ]);
    products = productsResponse.data;
    categories = categoriesResponse.data;
  } catch (error) {
    console.error('Error al cargar productos/categorías:', error);
  }

  const offers = products
    .filter(p => p.offer_price !== null && p.offer_price < p.price)
    .sort(
      (a, b) =>
        (b.price - b.offer_price!) / b.price - (a.price - a.offer_price!) / a.price
    )
    .slice(0, 8);

  const featured = products.filter(p => p.is_featured).slice(0, 10);

  return (
    <HomeContent initialProducts={products} categories={categories}>
      <HeroCarousel />
      <OffersSection offers={offers} />
      <FeaturedProducts products={featured} />
      <WhatsAppButton />
    </HomeContent>
  );
}
