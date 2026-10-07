import HomeContent from '@/components/HomeContent';
import { getProducts, getCategories, GRID_PAGE_SIZE } from '@/services/api';
import type { ProductsResponse, CategoriesResponse } from '@/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products: ProductsResponse | null = null;
  let categories: CategoriesResponse = { success: true, data: [] };

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      getProducts({ per_page: GRID_PAGE_SIZE, sort_by: 'name', sort_order: 'asc' }),
      getCategories(),
    ]);
    products = productsResponse;
    categories = categoriesResponse;
  } catch (error) {
    console.error('Error al cargar productos/categorías:', error);
  }

  return (
    <HomeContent
      initialProducts={products?.data ?? []}
      initialTotal={products?.pagination.total ?? 0}
      categories={categories.data}
      showSort
      home
    />
  );
}