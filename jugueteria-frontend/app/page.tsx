import HomeContent from '@/components/HomeContent';
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

  return <HomeContent initialProducts={products} categories={categories} />;
}
