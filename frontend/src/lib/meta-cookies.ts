// The two cookies Meta uses to match a browser to an ad click, created by us
// rather than waited for. fbevents.js normally sets them when it loads, but it
// loads late on purpose (see MetaPixel.tsx), and a server event sent before
// then would have no browser id to match on. Same format as the SDK's, so
// when it does load it reads ours instead of minting new ones.
//
// The inline bootstrap in pixel-bootstrap.ts carries a plain-JS copy of this
// logic for the pre-hydration path; keep the two in step.

export const FBP_COOKIE = "_fbp";
export const FBC_COOKIE = "_fbc";
/** 90 days, the lifetime Meta's own SDK gives these cookies. */
export const COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

export function readCookie(name: string, cookieString: string): string | null {
  for (const part of cookieString.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Ten decimal digits, the random tail of an _fbp value. */
export function randomDigits(count = 10): string {
  let out = "";
  for (let i = 0; i < count; i += 1) out += Math.floor(Math.random() * 10);
  return out;
}

/** `fb.1.<ms since epoch>.<10 random digits>` */
export function makeFbp(now = Date.now(), random = randomDigits()): string {
  return `fb.1.${now}.${random}`;
}

/** `fb.1.<ms since epoch>.<fbclid>` */
export function makeFbc(fbclid: string, now = Date.now()): string {
  return `fb.1.${now}.${fbclid}`;
}

/** The fbclid query parameter of a URL, or null. */
export function fbclidFrom(url: string): string | null {
  const match = /[?&]fbclid=([^&#]+)/.exec(url);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Whether a `domain=` attribute may be set for this host. Browsers drop
 * cookies whose domain is `localhost` or an IP literal, so those get a
 * host-only cookie instead.
 */
export function cookieDomainFor(hostname: string): string | null {
  if (!hostname.includes(".")) return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return null;
  return hostname;
}

/** The `document.cookie` assignment string for one of the Meta cookies. */
export function cookieString(name: string, value: string, hostname: string): string {
  let out = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; max-age=${COOKIE_MAX_AGE_SECONDS}`;
  const domain = cookieDomainFor(hostname);
  if (domain) out += `; domain=${domain}`;
  return out;
}

/**
 * Make sure _fbp exists, and _fbc too when the page was reached from an ad
 * click (fbclid in the URL). Returns both current values.
 */
export function ensureMetaCookies(
  doc: { cookie: string },
  location: { hostname: string; href: string },
  now = Date.now(),
): { fbp: string | null; fbc: string | null } {
  if (!readCookie(FBP_COOKIE, doc.cookie)) {
    doc.cookie = cookieString(FBP_COOKIE, makeFbp(now), location.hostname);
  }
  const fbclid = fbclidFrom(location.href);
  if (fbclid && !readCookie(FBC_COOKIE, doc.cookie)) {
    doc.cookie = cookieString(FBC_COOKIE, makeFbc(fbclid, now), location.hostname);
  }
  return {
    fbp: readCookie(FBP_COOKIE, doc.cookie),
    fbc: readCookie(FBC_COOKIE, doc.cookie),
  };
}

/** Both cookies as the browser currently has them. */
export function metaCookies(): { fbp: string | null; fbc: string | null } {
  if (typeof document === "undefined") return { fbp: null, fbc: null };
  return {
    fbp: readCookie(FBP_COOKIE, document.cookie),
    fbc: readCookie(FBC_COOKIE, document.cookie),
  };
}
