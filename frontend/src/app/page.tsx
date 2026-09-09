import Image from "next/image";

import "@/components/landing/landing.css";
import { Landing } from "@/components/landing/landing";
import { fetchStorefrontListing } from "@/lib/storefront-api";

/**
 * The landing page. A server component whose only job is to read the offer —
 * the live product, its description and its sizes — and hand it to the page,
 * so the prices and titles are in the first byte of HTML: no client fetch, no
 * flash of a stale figure, and a crawler sees the real offer.
 *
 * With nothing live, or the API unreachable, the page says the shop is
 * closed for the moment. There is deliberately no bundled product to fall
 * back to: selling something nobody put in the catalogue, at a price nobody
 * set, is worse than selling nothing.
 *
 * The page this replaced is preserved at /legacy, which 404s unless
 * SHOW_LEGACY_LANDING=1.
 */
export default async function Home() {
  const listing = await fetchStorefrontListing();
  if (listing === null) return <Closed />;
  return <Landing listing={listing} />;
}

/** The shop with nothing to sell: the logo and a line, nothing to tap. */
function Closed() {
  return (
    <main className="nb-landing">
      <header className="nb-header">
        <Image src="/logo.png" alt="Nature Bazar" width={150} height={48} priority />
      </header>
      <div className="nb-stack">
        <section className="nb-card nb-closed">
          <h1>এই মুহূর্তে কোনো পণ্য বিক্রির জন্য নেই</h1>
          <p>আমরা শিগগিরই ফিরছি। একটু পরে আবার দেখুন।</p>
        </section>
      </div>
    </main>
  );
}
