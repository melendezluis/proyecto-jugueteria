import HomeContent from '@/components/HomeContent';
import { getCategories, getProducts } from '@/services/api';
import type { Category, Product } from '@/types';

export const dynamic = 'force-dynamic';

const PACK_BADGE = (
  <div className="flex items-center gap-4">
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#2FB0E8] flex items-center justify-center shadow-lg shadow-[#5390D9]/40 flex-shrink-0">
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
        <path d="M6 11h4" />
        <path d="M8 9v4" />
        <path d="M15 12h.01" />
        <path d="M18 10h.01" />
        <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
      </svg>
    </div>
    <div>
      <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-[#2B2D42] tracking-wide">
        Pack de Juegos
      </h1>
      <p className="text-[#2B2D42]/60 mt-1">Diversión en familia garantizada 🎮</p>
    </div>
  </div>
);

function isGame(p: Product): boolean {
  return p.category?.slug === 'juegos-de-mesa';
}

export default async function PackDeJuegosPage() {
  let categories: Category[] = [];
  let products: Product[] = [];

  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      getCategories(),
      getProducts({ per_page: '1000' }),
    ]);
    categories = categoriesResponse.data;
    products = productsResponse.data;
  } catch (error) {
    console.error('Error al cargar productos/categorías en pack de juegos:', error);
  }

  const games = products.filter(isGame);

  return <HomeContent initialProducts={games} categories={categories} heading={PACK_BADGE} showSort />;
}