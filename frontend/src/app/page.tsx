import { Storefront } from "@/components/storefront/storefront";
import { fetchActiveProduct } from "@/lib/storefront-api";

/**
 * The landing page. A server component whose only job is to read the product
 * currently on sale and hand it to the storefront, so the price and title are
 * in the first byte of HTML — no client fetch, no flash of a stale figure, and
 * a crawler sees the real offer.
 *
 * fetchActiveProduct never throws: with the API unreachable it falls back to
 * the bundled product, because a storefront that will not render sells nothing.
 */
export default async function Home() {
  const product = await fetchActiveProduct();
  return <Storefront product={product} />;
}
