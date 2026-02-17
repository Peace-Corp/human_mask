import { supabase } from "./supabase";
import type { CartItem, ShippingInfo } from "./types";

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
    variant_id: item.variantId,
    size: item.size,
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
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "completed",
      payment_id: paymentId,
      status: "processing",
    })
    .eq("id", orderId);

  if (error) throw error;
}
