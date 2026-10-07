import HomeContent from '@/components/HomeContent';
import { getCategories, getProducts, GRID_PAGE_SIZE } from '@/services/api';
import type { ProductsResponse, CategoriesResponse } from '@/types';

export const dynamic = 'force-dynamic';

const DISCOUNT_BADGE = (
  <div className="flex items-center gap-4">
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/40 flex-shrink-0">
      <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FFD23F] border-2 border-white flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2B2D42]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.8 5h5.2l-4.3 3.3 1.7 5.7-4.4-3.1-4.4 3.1 1.7-5.7L5 7h5.2z" />
        </svg>
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <path d="M7 7h.01" />
      </svg>
    </div>
    <div>
      <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-[#2B2D42] tracking-wide">
        Juguetes en Descuento
      </h1>
      <p className="text-[#2B2D42]/60 mt-1">Los mejores precios de la tienda 🔥</p>
    </div>
  </div>
);

const OFFER_QUERY: Record<string, string> = { offer: '1' };

export default async function DescuentosPage() {
  let categories: CategoriesResponse = { success: true, data: [] };
  let products: ProductsResponse | null = null;

  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      getCategories(),
      getProducts({ per_page: GRID_PAGE_SIZE, offer: '1', sort_by: 'discount', sort_order: 'desc' }),
    ]);
    categories = categoriesResponse;
    products = productsResponse;
  } catch (error) {
    console.error('Error al cargar productos/categorías en descuentos:', error);
  }

  return (
    <HomeContent
      initialProducts={products?.data ?? []}
      initialTotal={products?.pagination.total ?? 0}
      categories={categories.data}
      heading={DISCOUNT_BADGE}
      showSort
      queryParams={OFFER_QUERY}
      initialSort="discount"
    />
  );
}