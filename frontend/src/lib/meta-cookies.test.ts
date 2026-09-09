import { describe, expect, it } from "vitest";

import {
  COOKIE_MAX_AGE_SECONDS,
  cookieDomainFor,
  cookieString,
  ensureMetaCookies,
  fbclidFrom,
  makeFbc,
  makeFbp,
  randomDigits,
  readCookie,
} from "@/lib/meta-cookies";

describe("value formats", () => {
  it("_fbp is fb.1.<ms>.<10 digits>", () => {
    expect(makeFbp(1700000000000, "0123456789")).toBe("fb.1.1700000000000.0123456789");
    expect(makeFbp()).toMatch(/^fb\.1\.\d{13}\.\d{10}$/);
  });

  it("randomDigits gives exactly ten digits", () => {
    for (let i = 0; i < 50; i += 1) expect(randomDigits()).toMatch(/^\d{10}$/);
  });

  it("_fbc is fb.1.<ms>.<fbclid>, fbclid kept verbatim", () => {
    expect(makeFbc("IwAR0abc-DEF_123", 1700000000000)).toBe(
      "fb.1.1700000000000.IwAR0abc-DEF_123",
    );
  });

  it("fbclidFrom reads the query parameter", () => {
    expect(fbclidFrom("https://s/?utm=x&fbclid=AbC_-1#frag")).toBe("AbC_-1");
    expect(fbclidFrom("https://s/?fbclid=a%2Bb")).toBe("a+b");
    expect(fbclidFrom("https://s/?utm=x")).toBeNull();
    expect(fbclidFrom("https://s/?notfbclid=1")).toBeNull();
  });
});

describe("cookie attributes", () => {
  it("sets domain only where browsers accept one", () => {
    expect(cookieDomainFor("naturebazar.example.com")).toBe("naturebazar.example.com");
    expect(cookieDomainFor("localhost")).toBeNull();
    expect(cookieDomainFor("127.0.0.1")).toBeNull();
    expect(cookieDomainFor("10.0.0.5")).toBeNull();
  });

  it("writes path, SameSite=Lax, 90-day max-age and the host", () => {
    const s = cookieString("_fbp", "fb.1.1.2", "shop.example.com");
    expect(s).toContain("_fbp=fb.1.1.2");
    expect(s).toContain("path=/");
    expect(s).toContain("SameSite=Lax");
    expect(s).toContain(`max-age=${90 * 24 * 60 * 60}`);
    expect(COOKIE_MAX_AGE_SECONDS).toBe(7776000);
    expect(s).toContain("domain=shop.example.com");
    expect(cookieString("_fbp", "v", "localhost")).not.toContain("domain=");
  });

  it("readCookie finds a value among several", () => {
    const jar = "a=1; _fbp=fb.1.2.3; _fbc=fb.1.2.X%3DY";
    expect(readCookie("_fbp", jar)).toBe("fb.1.2.3");
    expect(readCookie("_fbc", jar)).toBe("fb.1.2.X=Y");
    expect(readCookie("nope", jar)).toBeNull();
    expect(readCookie("_fbp", "")).toBeNull();
  });
});

/** A document.cookie stand-in that keeps what it is given, like a browser. */
function jar(initial = "") {
  const values = new Map<string, string>();
  for (const part of initial.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k) values.set(k, v);
  }
  return {
    get cookie() {
      return [...values].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    set cookie(s: string) {
      const [k, v] = s.split(";")[0].split("=");
      values.set(k, v);
    },
  };
}

describe("ensureMetaCookies", () => {
  const loc = { hostname: "shop.example.com", href: "https://shop.example.com/" };

  it("creates _fbp when missing", () => {
    const doc = jar();
    const { fbp, fbc } = ensureMetaCookies(doc, loc, 1700000000000);
    expect(fbp).toMatch(/^fb\.1\.1700000000000\.\d{10}$/);
    expect(fbc).toBeNull();
    expect(readCookie("_fbp", doc.cookie)).toBe(fbp);
  });

  it("keeps an existing _fbp", () => {
    const doc = jar("_fbp=fb.1.5.5555555555");
    expect(ensureMetaCookies(doc, loc).fbp).toBe("fb.1.5.5555555555");
  });

  it("creates _fbc from fbclid, but never overwrites one", () => {
    const withClick = { ...loc, href: "https://shop.example.com/?fbclid=CLICK1" };
    const fresh = jar();
    expect(ensureMetaCookies(fresh, withClick, 1700000000000).fbc).toBe(
      "fb.1.1700000000000.CLICK1",
    );
    const existing = jar("_fbc=fb.1.1.OLD");
    expect(ensureMetaCookies(existing, withClick).fbc).toBe("fb.1.1.OLD");
  });

  it("does not invent _fbc without a click id", () => {
    expect(ensureMetaCookies(jar(), loc).fbc).toBeNull();
  });
});
