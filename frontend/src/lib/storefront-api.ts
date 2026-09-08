// Everything the public storefront is allowed to call. Kept apart from the
// admin client on purpose: this is the only API module the landing page
// bundle contains, so there is no order-listing code in it to find, and no
// admin weight on a page whose only job is converting.

import { request } from "@/lib/http";
import { FALLBACK_PRODUCT, type StorefrontProduct } from "@/lib/products";

export async function createOrder(input: {
  customerName: string;
  phone: string;
  address: string;
  quantity?: number;
  draftKey?: string;
}): Promise<{ orderNo: string }> {
  const order = await request<{ order_no: string }>("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      customer_name: input.customerName,
      phone: input.phone,
      address: input.address,
      quantity: input.quantity ?? 1,
      draft_key: input.draftKey ?? null,
    }),
  });
  return { orderNo: order.order_no };
}

/**
 * Autosave a storefront form that has not been submitted yet, so the lead
 * reaches the admin Incomplete list even if the visitor never presses order.
 * Best-effort by design: a failure must never disturb the person filling it.
 *
 * `keepalive` lets the last save survive the page being closed, which is
 * exactly when an abandoned form matters most.
 */
export type DraftSaveResult = "saved" | "throttled" | "failed";

export async function saveOrderDraft(input: {
  draftKey: string;
  customerName: string;
  phone: string;
  address: string;
}): Promise<DraftSaveResult> {
  try {
    const res = await fetch("/api/orders/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        draft_key: input.draftKey,
        customer_name: input.customerName,
        phone: input.phone,
        address: input.address,
      }),
    });
    // 429 is the API asking us to slow down; the caller pauses autosaving.
    if (res.status === 429) return "throttled";
    return res.ok ? "saved" : "failed";
  } catch {
    // Offline or blocked: the next keystroke or the next visit tries again.
    return "failed";
  }
}


/**
 * The product the landing page should sell, read on the server so the page
 * renders with a price already in it — no flash of a stale number, and the
 * markup a crawler sees is the real offer.
 *
 * Called from a server component, so it talks to the API directly rather than
 * through the browser-relative "/api" rewrite. A failure falls back to the
 * bundled product instead of throwing: the storefront is the only page that
 * earns money, and it has to render even when the API is down.
 */
export async function fetchActiveProduct(): Promise<StorefrontProduct> {
  const base = process.env.API_URL ?? "http://api:8000";
  try {
    const res = await fetch(`${base}/api/storefront/product`, {
      // Always current: a super admin who edits the product expects to see it
      // on the next reload, not a minute later.
      cache: "no-store",
    });
    if (!res.ok) return FALLBACK_PRODUCT;
    const data = (await res.json()) as {
      title: string;
      subtitle: string;
      image_url: string | null;
      default_quantity: number;
      unit_price: number;
      sku: string;
    };
    return {
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.image_url,
      defaultQuantity: data.default_quantity,
      unitPrice: data.unit_price,
      sku: data.sku,
    };
  } catch {
    return FALLBACK_PRODUCT;
  }
}
