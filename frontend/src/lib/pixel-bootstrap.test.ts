import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { pixelBootstrap } from "@/lib/pixel-bootstrap";
import { readCookie } from "@/lib/meta-cookies";

type Queued = unknown[];
type Stub = ((...args: unknown[]) => void) & { queue: Queued[]; callMethod?: unknown };

/** Run the inline script exactly as the browser would: as a global script. */
function boot(pixelId = "777") {
  const script = pixelBootstrap(pixelId);
  new Function(script)();
  return window.fbq as unknown as Stub;
}

function clearCookies() {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  }
}

const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));

beforeEach(() => {
  window.history.replaceState({}, "", "/");
  clearCookies();
  delete (window as { fbq?: unknown }).fbq;
  delete (window as { _fbq?: unknown })._fbq;
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockClear();
});

afterEach(() => vi.unstubAllGlobals());

describe("pixelBootstrap", () => {
  it("is empty without a pixel id", () => {
    expect(pixelBootstrap("")).toBe("");
  });

  it("defines a queuing fbq stub and inits the pixel", () => {
    const fbq = boot("777");
    expect(typeof fbq).toBe("function");
    expect(Array.from(fbq.queue[0] as Queued)).toEqual(["init", "777"]);
    // Still a stub: later calls queue too.
    fbq("track", "AddToCart", {});
    expect(Array.from(fbq.queue.at(-1) as Queued)).toEqual(["track", "AddToCart", {}]);
  });

  it("fires PageView with an eventID and posts the same id to /api/track", () => {
    const fbq = boot();
    const pageView = fbq.queue.map((q) => Array.from(q)).find((q) => q[1] === "PageView");
    expect(pageView).toBeDefined();
    const { eventID } = pageView![3] as { eventID: string };
    expect(eventID).toMatch(/^[0-9a-f-]{36}$/);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/track");
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
    const body = JSON.parse(String(init.body));
    expect(body.event_name).toBe("PageView");
    expect(body.event_id).toBe(eventID);
    expect(body.event_source_url).toBe(window.location.href);
  });

  it("creates _fbp in the SDK's format and sends it along", () => {
    boot();
    const fbp = readCookie("_fbp", document.cookie);
    expect(fbp).toMatch(/^fb\.1\.\d{13}\.\d{10}$/);
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.fbp).toBe(fbp);
    expect(body.fbc).toBeNull();
  });

  it("keeps an existing _fbp", () => {
    document.cookie = "_fbp=fb.1.1.1111111111; path=/";
    boot();
    expect(readCookie("_fbp", document.cookie)).toBe("fb.1.1.1111111111");
  });

  it("creates _fbc from fbclid when there is none", () => {
    window.history.replaceState({}, "", "/?utm_source=fb&fbclid=IwAR0-click_1");
    boot();
    const fbc = readCookie("_fbc", document.cookie);
    expect(fbc).toMatch(/^fb\.1\.\d{13}\.IwAR0-click_1$/);
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.fbc).toBe(fbc);
  });

  it("does not overwrite an existing _fbc", () => {
    document.cookie = "_fbc=fb.1.1.OLD; path=/";
    window.history.replaceState({}, "", "/?fbclid=NEW");
    boot();
    expect(readCookie("_fbc", document.cookie)).toBe("fb.1.1.OLD");
  });

  it("uses sendBeacon when fetch is unavailable", () => {
    vi.stubGlobal("fetch", undefined);
    const beacon = vi.fn(() => true);
    Object.defineProperty(window.navigator, "sendBeacon", { value: beacon, configurable: true });
    boot();
    expect(beacon).toHaveBeenCalledOnce();
    const [url, blob] = beacon.mock.calls[0] as unknown as [string, Blob];
    expect(url).toBe("/api/track");
    expect(blob.type).toBe("application/json");
  });

  it("does nothing at all under /admin", () => {
    window.history.replaceState({}, "", "/admin/orders");
    new Function(pixelBootstrap("777"))();
    expect(window.fbq).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(readCookie("_fbp", document.cookie)).toBeNull();
  });

  it("escapes the pixel id safely", () => {
    const script = pixelBootstrap(`7'); alert(1); ('`);
    expect(script).toContain(JSON.stringify(`7'); alert(1); ('`));
    expect(() => new Function(script)).not.toThrow();
  });
});
