import { supabase } from "./supabase";
import type { CartItem, ShippingInfo } from "./types";

export async function validateStock(
  cartItems: CartItem[]
): Promise<{ valid: boolean; message?: string }> {
  const variantIds = cartItems
    .filter((item) => item.variantId !== item.productId)
    .map((item) => item.variantId);

  const productOnlyItems = cartItems.filter(
    (item) => item.variantId === item.productId
  );

  // Check variant stock
  if (variantIds.length > 0) {
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, stock")
      .in("id", variantIds);

    for (const item of cartItems) {
      if (item.variantId === item.productId) continue;
      const variant = variants?.find((v) => v.id === item.variantId);
      if (!variant) return { valid: false, message: `"${item.productName} (${item.size})" 옵션을 찾을 수 없습니다.` };
      if (variant.stock < item.quantity) {
        return {
          valid: false,
          message: variant.stock === 0
            ? `"${item.productName} (${item.size})"이(가) 품절되었습니다.`
            : `"${item.productName} (${item.size})" 재고가 ${variant.stock}개 남았습니다.`,
        };
      }
    }
  }

  // Check product-level stock for no-variant items
  for (const item of productOnlyItems) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.productId)
      .single();

    if (!product) return { valid: false, message: `"${item.productName}" 상품을 찾을 수 없습니다.` };
    if (product.stock < item.quantity) {
      return {
        valid: false,
        message: product.stock === 0
          ? `"${item.productName}"이(가) 품절되었습니다.`
          : `"${item.productName}" 재고가 ${product.stock}개 남았습니다.`,
      };
    }
  }

  return { valid: true };
}

export async function createOrder({
  orderId,
  cartItems,
  shippingInfo,
  total,
  paymentMethod,
  orderName,
}: {
  orderId: string;
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  total: number;
  paymentMethod: "toss" | "paypal";
  orderName: string;
}) {
  const isDomestic = shippingInfo.shippingType === "domestic";

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    total,
    status: "pending",
    payment_method: paymentMethod,
    payment_status: "pending",
    delivery_method: shippingInfo.shippingType,
    customer_name: shippingInfo.name,
    customer_phone: shippingInfo.phone,
    customer_email: shippingInfo.email,
    order_name: orderName,
    shipping_address_line_one: isDomestic
      ? shippingInfo.roadAddress!
      : shippingInfo.addressLine1!,
    shipping_address_line_two: isDomestic
      ? shippingInfo.detailAddress || null
      : shippingInfo.addressLine2 || null,
    shipping_zip_code: isDomestic
      ? shippingInfo.zonecode!
      : shippingInfo.postalCode!,
    shipping_country: isDomestic ? null : shippingInfo.country!,
    shipping_city: isDomestic ? null : shippingInfo.city!,
    shipping_state: isDomestic ? null : shippingInfo.state!,
  });

  if (orderError) throw orderError;

  const orderItems = cartItems.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    variant_id: item.variantId === item.productId ? null : item.variantId,
    size: item.size || null,
    quantity: item.quantity,
    price_at_time: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderId;
}

export async function finalizeOrder(
  orderId: string,
  paymentId: string | null
) {
  // Only finalize orders that are still pending — prevents double finalization
  // on page refresh or duplicate calls
  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      payment_status: "completed",
      payment_id: paymentId,
      status: "processing",
    })
    .eq("id", orderId)
    .eq("payment_status", "pending")
    .select("id")
    .maybeSingle();

  if (error) throw error;

  // If no row was updated, the order was already finalized — skip stock decrement
  if (!updated) return;

  // Decrement stock for all items in the order
  const { error: stockError } = await supabase.rpc(
    "decrement_stock_for_order",
    { p_order_id: orderId }
  );

  if (stockError) {
    console.error("Failed to decrement stock:", stockError);
  }
}

export interface OrderWithItems {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  delivery_method: string;
  customer_name: string | null;
  customer_email: string | null;
  order_name: string | null;
  created_at: string;
  items: {
    id: string;
    size: string | null;
    quantity: number;
    price_at_time: number;
    product: { name: string; images: string[] } | null;
  }[];
}

export async function getOrderWithItems(
  orderId: string
): Promise<OrderWithItems | null> {
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id, total, status, payment_method, delivery_method,
      customer_name, customer_email, order_name, created_at
    `
    )
    .eq("id", orderId)
    .single();

  if (error || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select(
      `
      id, size, quantity, price_at_time,
      product:products(name, images)
    `
    )
    .eq("order_id", orderId);

  return {
    ...order,
    items: (items || []).map((item) => ({
      ...item,
      product: Array.isArray(item.product) ? item.product[0] : item.product,
    })),
  };
}
