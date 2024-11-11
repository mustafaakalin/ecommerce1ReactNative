// src/types/product.ts
export interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    icon: string;
    description: string;
    products_count: number;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface ProductImage {
    id: number;
    product_id: number;
    image_path: string;
    created_at: string;
    updated_at: string;
  }
  
  // Specifications için dinamik key-value yapısı
  export interface Specifications {
    [key: string]: string | number;
  }
  
  export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    old_price: string | null;
    stock: number;
    is_active: boolean;
    is_featured: boolean;
    is_new: boolean;
    discount: number | null;
    rating: string;
    category: Category;
    images: ProductImage[];
    specifications: Specifications;
    created_at: string;
    updated_at: string;
  }
  
  export interface ProductsResponse {
    data: Product[];
  }