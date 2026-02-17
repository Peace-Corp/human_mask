import { supabase } from "./supabase";
import type { Product, ProductVariant, BrandHeroBanner } from "./types";

const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID!;

// --- Products ---

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("brand_id", BRAND_ID)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Product[];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("brand_id", BRAND_ID)
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("brand_id", BRAND_ID)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data as Product;
}

export async function getProductVariants(
  productId: string
): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as ProductVariant[];
}

// --- Hero Banners ---

export async function getHeroBanners(): Promise<BrandHeroBanner[]> {
  const { data, error } = await supabase
    .from("brand_hero_banners")
    .select("*")
    .eq("brand_id", BRAND_ID)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data as BrandHeroBanner[];
}
