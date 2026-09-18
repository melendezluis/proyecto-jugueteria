import HomeContent from '@/components/HomeContent';
import { getCategories, getProducts } from '@/services/api';
import type { Category, Product } from '@/types';

export const dynamic = 'force-dynamic';

const NO_BADGE = (
  <div className="flex items-center gap-4">
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#FF5D73] flex items-center justify-center shadow-lg shadow-[#6EBA92]/40 flex-shrink-0">
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
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5C9 3 12 4 12 8Z" />
        <path d="M16.5 8a2.5 2.5 0 0 0 0-5C15 3 12 4 12 8Z" />
      </svg>
    </div>
    <div>
      <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-[#2B2D42] tracking-wide">
        Recién Llegados
      </h1>
      <p className="text-[#2B2D42]/60 mt-1">Juguetes nuevos en la tienda 🧸</p>
    </div>
  </div>
);

const RECIEN_LLEGADOS_SLUGS = [
  'bloques-magneticos-constru-luna',
  'dino-robot-ruge-y-camina',
  'kit-explorador-arqueologo-t-rex',
  'pista-turbo-pit-stop-x',
  'muneca-bebe-reborn-mimosa',
  'monopoly-junior-animalitos',
  'robot-cachorrito-interactivo-bo',
  'cometa-acrobatica-aventura',
];

export default async function RecienLlegadosPage() {
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
    console.error('Error al cargar productos/categorías en recién llegados:', error);
  }

  const recienLlegados = products.filter(p => RECIEN_LLEGADOS_SLUGS.includes(p.slug));

  return (
    <HomeContent initialProducts={recienLlegados} categories={categories} heading={NO_BADGE} showSort />
  );
}