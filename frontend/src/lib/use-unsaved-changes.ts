"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

/**
 * Warn before leaving a page with work in progress.
 *
 * Two escape routes have to be covered, and they behave differently:
 *
 *  - Closing the tab, reloading, or navigating to another site fires
 *    `beforeunload`. The browser shows its own dialog there and ignores any
 *    text we supply, so all we can do is ask for it.
 *  - Moving to another admin page never unloads anything, so `beforeunload`
 *    is silent. The App Router has no route-change event to hook, so link
 *    clicks are caught during the capture phase, before Next sees them, and
 *    turned into our own dialog.
 *
 * The browser Back button is not intercepted: blocking it needs history
 * entries pushed under the user, which breaks the back stack in worse ways
 * than it helps.
 */
export function useUnsavedChanges(dirty: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Legacy browsers need returnValue set to something before they prompt.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  React.useEffect(() => {
    if (!dirty) return;
    const onClick = (event: MouseEvent) => {
      // Leave alone anything that was never a plain left-click navigation:
      // modified clicks open a new tab, so this page is not going anywhere.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      // Another site unloads the page, so beforeunload above already covers it.
      if (url.origin !== window.location.origin) return;
      // Same page: nothing is being lost.
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      // Stop Next's own click handler, which would otherwise navigate anyway.
      event.stopPropagation();
      setPendingHref(url.pathname + url.search);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  return {
    /** Where the user tried to go, or null when nothing is blocked. */
    pendingHref,
    /** Dismiss the prompt and stay put. */
    stay: React.useCallback(() => setPendingHref(null), []),
    /**
     * Navigate from code rather than a link. The capture listener only sees
     * clicks, so a router.push elsewhere in the page would slip past the guard
     * and lose the work silently — route those through here instead.
     */
    navigate: React.useCallback(
      (href: string) => {
        if (dirty) setPendingHref(href);
        else router.push(href);
      },
      [dirty, router]
    ),
    /** Go where they were headed. router.push is not a click, so the capture
     * listener above never sees it and cannot re-block the navigation. */
    leave: React.useCallback(() => {
      const href = pendingHref;
      setPendingHref(null);
      if (href) router.push(href);
    }, [pendingHref, router]),
  };
}
