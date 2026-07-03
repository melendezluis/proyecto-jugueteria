export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  position: number;
  is_active: boolean;
  products_count: number;
  created_at: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  is_active: boolean;
  products_count: number;
  created_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string | null;
  color: string | null;
  size: string | null;
  stock: number;
  price_extra: number;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  alt_text: string | null;
  position: number;
  is_main: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  offer_price: number | null;
  stock: number;
  sku: string | null;
  age_from: number | null;
  age_to: number | null;
  material: string | null;
  safety_info: string | null;
  is_featured: boolean;
  is_active: boolean;
  category: Category | null;
  brand: Brand | null;
  variants: ProductVariant[];
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface BrandsResponse {
  success: boolean;
  data: Brand[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}
