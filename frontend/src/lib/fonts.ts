import { Manrope, Noto_Sans_Bengali } from "next/font/google";

/**
 * Manrope, self-hosted by next/font: the files are fetched at build time and
 * served from our own origin, so there is no request to Google at runtime and
 * no flash of unstyled text.
 *
 * Loaded as a variable font (200–800), which covers every weight the
 * storefront and the admin ask for in one file.
 */
export const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

/**
 * Bengali carries most of the storefront, and Manrope has no Bengali glyphs.
 *
 * Noto Sans Bengali is variable across 100–900, so the 800 and 900 weights the
 * storefront leans on are real cuts rather than the browser faking a bold.
 *
 * Not preloaded: admin pages are all Latin, so the browser never matches this
 * face there and never downloads it. The storefront fetches it on first paint.
 */
export const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-bengali",
  preload: false,
});
