export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  images: string[];
  brand_id: string;
  category: string;
  rating: number;
  review_count: number;
  tags: string[];
  featured: boolean;
  stock: number;
  size_chart_image: string | null;
  description_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  email: string;
  shippingType: "domestic" | "international";
  // Domestic (JUSO API)
  zonecode?: string;
  roadAddress?: string;
  detailAddress?: string;
  // International
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
}

export interface BrandHeroBanner {
  id: string;
  brand_id: string;
  image_link: string;
  title: string;
  subtitle: string | null;
  link: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
