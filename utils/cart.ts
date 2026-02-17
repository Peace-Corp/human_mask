import type { CartItem } from "@/lib/types";

const CART_KEY = "human_mask_cart";

function dispatchCartChange(): void {
  window.dispatchEvent(new Event("cart-change"));
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  dispatchCartChange();
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const idx = cart.findIndex((c) => c.variantId === item.variantId);
  if (idx >= 0) {
    cart[idx].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function updateCartItemQuantity(
  variantId: string,
  quantity: number
): void {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter((c) => c.variantId !== variantId);
  } else {
    const idx = cart.findIndex((c) => c.variantId === variantId);
    if (idx >= 0) cart[idx].quantity = quantity;
  }
  saveCart(cart);
}

export function removeFromCart(variantId: string): void {
  const cart = getCart().filter((c) => c.variantId !== variantId);
  saveCart(cart);
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  dispatchCartChange();
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}
