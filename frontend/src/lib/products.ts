import { CURRENCY, type TrackedItem } from "@/lib/tracking";

/** A catalogue row as the admin sees it. */
export type Product = {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  defaultQuantity: number;
  unitPrice: number;
  sku: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * The active product as the storefront sees it — no row id, no timestamps.
 * This is what prices the order table and feeds the analytics events.
 */
export type StorefrontProduct = {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  defaultQuantity: number;
  unitPrice: number;
  sku: string;
};

/**
 * What the landing page falls back to when the API cannot be reached.
 *
 * The storefront is the only page that earns money, so it must render and take
 * orders even with the API down — the order form fails loudly on submit, which
 * is far better than a blank page. These values mirror the seed row in
 * migration 0011 and the PRODUCT_* defaults in the API's config.
 */
export const FALLBACK_PRODUCT: StorefrontProduct = {
  title:
    "ইলিশের আচার ২০০ গ্রাম, গরুর মাংস আচার ২০০ গ্রাম, এবং চেপা শুটকির আচার ২০০ গ্রাম, কম্বো",
  subtitle: "",
  imageUrl: null,
  defaultQuantity: 1,
  unitPrice: 1490,
  sku: "combo-1490",
};

/** The product image, or the bundled artwork when none has been uploaded. */
export function productImage(product: StorefrontProduct): string {
  return product.imageUrl ?? "/order-item.png";
}

/**
 * The product as GA4/Meta want it. Built from the live product rather than a
 * constant, so a price change in the admin cannot leave the analytics events
 * reporting the old one.
 */
export function trackedItem(product: StorefrontProduct): TrackedItem {
  return {
    id: product.sku,
    item_id: product.sku,
    item_name: product.title,
    currency: CURRENCY,
    price: product.unitPrice,
    item_category: "সারা বাংলাদেশে ফ্রি ডেলিভারি",
    quantity: 1,
  };
}
