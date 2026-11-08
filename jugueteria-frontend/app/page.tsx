import HomeContent from '@/components/HomeContent';
import { getProducts, getCategories, GRID_PAGE_SIZE } from '@/services/api';
import type { ProductsResponse, CategoriesResponse } from '@/types';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let products: ProductsResponse | null = null;
  let categories: CategoriesResponse = { success: true, data: [] };
  const resolvedParams = searchParams ? await searchParams : undefined;

  try {
    const params: Record<string, string | string[] | number | undefined> = {
      per_page: GRID_PAGE_SIZE,
      sort_by: 'name',
      sort_order: 'asc',
    };

    if (resolvedParams) {
      if (resolvedParams.category_id) params.category_id = Array.isArray(resolvedParams.category_id) ? resolvedParams.category_id[0] : resolvedParams.category_id;
      else if (resolvedParams.category) params.category = Array.isArray(resolvedParams.category) ? resolvedParams.category[0] : resolvedParams.category;
      if (resolvedParams.brand_id) params.brand_id = Array.isArray(resolvedParams.brand_id) ? resolvedParams.brand_id[0] : resolvedParams.brand_id;
      else if (resolvedParams.brand) params.brand = Array.isArray(resolvedParams.brand) ? resolvedParams.brand[0] : resolvedParams.brand;
      if (resolvedParams.min_age) params.min_age = Array.isArray(resolvedParams.min_age) ? resolvedParams.min_age[0] : resolvedParams.min_age;
      if (resolvedParams.max_age) params.max_age = Array.isArray(resolvedParams.max_age) ? resolvedParams.max_age[0] : resolvedParams.max_age;
      if (resolvedParams.min_price) params.min_price = Array.isArray(resolvedParams.min_price) ? resolvedParams.min_price[0] : resolvedParams.min_price;
      if (resolvedParams.max_price) params.max_price = Array.isArray(resolvedParams.max_price) ? resolvedParams.max_price[0] : resolvedParams.max_price;
      if (resolvedParams.q) params.q = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q;
      if (resolvedParams.search) params.search = Array.isArray(resolvedParams.search) ? resolvedParams.search[0] : resolvedParams.search;
    }

    const [productsResponse, categoriesResponse] = await Promise.all([
      getProducts(params),
      getCategories(),
    ]);
    products = productsResponse;
    categories = categoriesResponse;
  } catch (error) {
    console.error('Error al cargar productos/categorías:', error);
  }

  const queryParamsForHome: Record<string, string | string[] | number | undefined> = {
    per_page: GRID_PAGE_SIZE,
    sort_by: 'name',
    sort_order: 'asc',
  };
  if (resolvedParams) {
    if (resolvedParams.category_id) queryParamsForHome.category_id = Array.isArray(resolvedParams.category_id) ? resolvedParams.category_id[0] : resolvedParams.category_id;
    else if (resolvedParams.category) queryParamsForHome.category = Array.isArray(resolvedParams.category) ? resolvedParams.category[0] : resolvedParams.category;
    if (resolvedParams.brand_id) queryParamsForHome.brand_id = Array.isArray(resolvedParams.brand_id) ? resolvedParams.brand_id[0] : resolvedParams.brand_id;
    else if (resolvedParams.brand) queryParamsForHome.brand = Array.isArray(resolvedParams.brand) ? resolvedParams.brand[0] : resolvedParams.brand;
    if (resolvedParams.min_age) queryParamsForHome.min_age = Array.isArray(resolvedParams.min_age) ? resolvedParams.min_age[0] : resolvedParams.min_age;
    if (resolvedParams.max_age) queryParamsForHome.max_age = Array.isArray(resolvedParams.max_age) ? resolvedParams.max_age[0] : resolvedParams.max_age;
    if (resolvedParams.min_price) queryParamsForHome.min_price = Array.isArray(resolvedParams.min_price) ? resolvedParams.min_price[0] : resolvedParams.min_price;
    if (resolvedParams.max_price) queryParamsForHome.max_price = Array.isArray(resolvedParams.max_price) ? resolvedParams.max_price[0] : resolvedParams.max_price;
    if (resolvedParams.q) queryParamsForHome.q = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q;
    if (resolvedParams.search) queryParamsForHome.search = Array.isArray(resolvedParams.search) ? resolvedParams.search[0] : resolvedParams.search;
  }

  return (
    <HomeContent
      initialProducts={products?.data ?? []}
      initialTotal={products?.pagination.total ?? 0}
      categories={categories.data}
      queryParams={queryParamsForHome}
      showSort
      home
    />
  );
}