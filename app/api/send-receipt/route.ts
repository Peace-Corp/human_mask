import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id, total, status, payment_method, delivery_method,
        customer_name, customer_email, order_name, created_at
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.customer_email) {
      return NextResponse.json(
        { error: "No customer email" },
        { status: 400 }
      );
    }

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        id, size, quantity, price_at_time,
        product:products(name, images)
      `
      )
      .eq("order_id", orderId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItems = (items || []).map((item: any) => ({
      ...item,
      product: Array.isArray(item.product) ? item.product[0] : item.product,
    }));

    const subtotal = orderItems.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: number, item: any) => sum + item.price_at_time * item.quantity,
      0
    );
    const shippingCost = order.total - subtotal;

    const orderDate = new Date(order.created_at).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = buildReceiptHtml({
      order,
      orderItems,
      subtotal,
      shippingCost,
      orderDate,
    });

    const mailjetResponse = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          btoa(
            `${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`
          ),
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_FROM_EMAIL,
              Name: process.env.MAILJET_FROM_NAME,
            },
            To: [
              {
                Email: order.customer_email,
                Name: order.customer_name || order.customer_email,
              },
            ],
            Subject: `주문 확인 - ${order.id}`,
            HTMLPart: html,
          },
        ],
      }),
    });

    if (!mailjetResponse.ok) {
      const errorBody = await mailjetResponse.text();
      console.error("Mailjet error:", errorBody);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send receipt error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatPrice(amount: number) {
  return `₩ ${amount.toLocaleString()}원`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildReceiptHtml({
  order,
  orderItems,
  subtotal,
  shippingCost,
  orderDate,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderItems: any[];
  subtotal: number;
  shippingCost: number;
  orderDate: string;
}) {
  const itemRows = orderItems
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => `
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">
          ${item.product?.name || "상품"}
          <br/>
          <span style="font-size:11px;color:#9ca3af;">
            ${item.size ? `${item.size} · ` : ""}수량 ${item.quantity}개
          </span>
        </td>
        <td style="padding:8px 0;font-size:13px;color:#111827;text-align:right;white-space:nowrap;border-bottom:1px solid #f3f4f6;font-weight:500;">
          ${formatPrice(item.price_at_time * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color:#111827;color:#ffffff;padding:28px 24px;text-align:center;">
              <div style="width:48px;height:48px;margin:0 auto 12px;background-color:rgba(255,255,255,0.2);border-radius:50%;line-height:48px;font-size:22px;">&#10003;</div>
              <h1 style="margin:0;font-size:18px;font-weight:600;">결제 완료</h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.7);">주문이 정상적으로 접수되었습니다</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;">

              <!-- Order ID + Date -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px dashed #d1d5db;">
                <tr>
                  <td style="font-size:11px;color:#9ca3af;">주문번호<br/><span style="font-size:12px;color:#111827;font-family:monospace;">${order.id}</span></td>
                  <td style="font-size:11px;color:#9ca3af;text-align:right;">주문일시<br/><span style="font-size:12px;color:#374151;">${orderDate}</span></td>
                </tr>
              </table>

              <!-- Items -->
              <p style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">주문 내역</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px dashed #d1d5db;">
                ${itemRows}
              </table>

              <!-- Price breakdown -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px dashed #d1d5db;">
                <tr>
                  <td style="font-size:12px;color:#6b7280;padding:3px 0;">소계</td>
                  <td style="font-size:12px;color:#374151;text-align:right;padding:3px 0;">${formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#6b7280;padding:3px 0;">배송비 (${order.delivery_method === "domestic" ? "국내" : "해외"})</td>
                  <td style="font-size:12px;color:#374151;text-align:right;padding:3px 0;">${shippingCost > 0 ? formatPrice(shippingCost) : "무료"}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;font-weight:600;color:#111827;padding:10px 0 0;border-top:1px solid #e5e7eb;">총 결제 금액</td>
                  <td style="font-size:16px;font-weight:700;color:#111827;text-align:right;padding:10px 0 0;border-top:1px solid #e5e7eb;">${formatPrice(order.total)}</td>
                </tr>
              </table>

              <!-- Payment & Customer Info -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="font-size:11px;color:#9ca3af;padding:4px 0;width:50%;">결제 수단<br/><span style="font-size:12px;color:#374151;">${order.payment_method === "toss" ? "국내 결제" : "PayPal"}</span></td>
                  <td style="font-size:11px;color:#9ca3af;padding:4px 0;width:50%;">주문 상태<br/><span style="font-size:12px;color:#059669;font-weight:500;">결제 완료</span></td>
                </tr>
                ${
                  order.customer_name || order.customer_email
                    ? `<tr>
                  ${order.customer_name ? `<td style="font-size:11px;color:#9ca3af;padding:4px 0;">수령인<br/><span style="font-size:12px;color:#374151;">${order.customer_name}</span></td>` : "<td></td>"}
                  ${order.customer_email ? `<td style="font-size:11px;color:#9ca3af;padding:4px 0;">이메일<br/><span style="font-size:12px;color:#374151;">${order.customer_email}</span></td>` : "<td></td>"}
                </tr>`
                    : ""
                }
              </table>

              <!-- Footer -->
              <p style="font-size:11px;color:#9ca3af;text-align:center;margin:16px 0 0;">
                본 메일은 발신 전용이며, 문의사항은 사이트 내 FAQ를 이용해주세요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
