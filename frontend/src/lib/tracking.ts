// Ecommerce event tracking.
//
// Every event is pushed to `window.dataLayer` in the GA4 ecommerce format
// (so a GTM container can consume it) and, when NEXT_PUBLIC_META_PIXEL_ID is
// set, mapped to the matching Meta Pixel standard event. With no Pixel ID the
// events are logged to the console in development so the flow can be verified
// before the ID exists.

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

export const CURRENCY = "BDT";
export const SHIPPING = 0;

export type TrackedItem = {
  id: string;
  item_id: string;
  item_name: string;
  currency: string;
  price: number;
  item_category: string;
  quantity: number;
};

export type UserData = {
  first_name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

let eventCounter = 0;
const sessionStart = Date.now();

/**
 * Console logging is on in development when no Pixel ID is configured, and
 * can be switched on anywhere (including production) from the browser console:
 *   localStorage.trackingDebug = "1"   // off: delete localStorage.trackingDebug
 */
function debugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem("trackingDebug") === "1") return true;
  } catch {
    // storage blocked; fall through
  }
  return process.env.NODE_ENV !== "production" && !PIXEL_ID;
}

function cartValue(items: TrackedItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function push(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const event = {
    ...payload,
    gtm: { uniqueEventId: ++eventCounter, start: sessionStart },
  };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
  if (debugEnabled()) console.log("[tracking] dataLayer.push", event);
}

function fbq(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const loaded = Boolean(window.fbq);
  if (debugEnabled()) {
    console.log(
      `[tracking] fbq (${loaded ? "pixel loaded" : "pixel not loaded"})`,
      ...args,
    );
  }
  if (loaded) window.fbq?.(...args);
}

function pixelContents(items: TrackedItem[]) {
  return {
    content_type: "product",
    content_ids: items.map((item) => item.item_id),
    contents: items.map((item) => ({
      id: item.item_id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    currency: CURRENCY,
  };
}

export function trackViewItem(items: TrackedItem[]) {
  const value = cartValue(items);
  push({
    event: "view_item",
    pageType: "product-page",
    productType: "simple",
    ecommerce: { items, value, currency: CURRENCY },
  });
  fbq("track", "ViewContent", {
    ...pixelContents(items),
    content_name: items[0]?.item_name,
    value,
  });
}

export function trackAddToCart(items: TrackedItem[]) {
  const value = cartValue(items);
  push({
    event: "add_to_cart",
    pageType: "product-page",
    productType: "simple",
    ecommerce: { currency: CURRENCY, value, items },
  });
  fbq("track", "AddToCart", { ...pixelContents(items), value });
}

export function trackViewCart(items: TrackedItem[]) {
  push({
    event: "view_cart",
    pageType: "cart",
    ecommerce: { currency: CURRENCY, value: cartValue(items), items },
  });
  // Meta has no standard cart-view event; dataLayer only.
}

export function trackBeginCheckout(items: TrackedItem[]) {
  const value = cartValue(items);
  push({
    event: "begin_checkout",
    pageType: "checkout",
    ecommerce: { currency: CURRENCY, value, items },
  });
  fbq("track", "InitiateCheckout", {
    ...pixelContents(items),
    num_items: items.reduce((n, item) => n + item.quantity, 0),
    value,
  });
}

export function trackPurchase(input: {
  transactionId: string;
  items: TrackedItem[];
  shipping?: number;
  user: Partial<UserData>;
}) {
  const items = input.items;
  const shipping = input.shipping ?? SHIPPING;
  const value = cartValue(items) + shipping;
  const user_data: UserData = {
    first_name: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    region: "",
    postal_code: "",
    country: "BD",
    ...input.user,
  };
  push({
    event: "purchase",
    pageType: "order-received",
    ecommerce: {
      transaction_id: input.transactionId,
      value,
      tax: 0,
      shipping,
      currency: CURRENCY,
      items,
    },
    new_customer: true,
    user_data,
  });
  fbq(
    "track",
    "Purchase",
    { ...pixelContents(items), value, num_items: items.length },
    { eventID: input.transactionId },
  );
}

/** Normalises a Bangladeshi phone number to E.164 for Meta advanced matching. */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0")) return `+880${digits.slice(1)}`;
  return digits ? `+880${digits}` : "";
}
