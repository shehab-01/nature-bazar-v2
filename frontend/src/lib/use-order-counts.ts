"use client";

import * as React from "react";

import { getOrderCounts } from "@/lib/api";
import type { OrderStatus } from "@/lib/orders";

/** Refresh cadence while the tab is visible, matching the order tables. */
const POLL_MS = 15_000;

const ORDERS_CHANGED = "nb:orders-changed";

/**
 * Tell the sidebar counters an order moved, so they update with the table
 * instead of waiting out the poll.
 */
export function notifyOrdersChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ORDERS_CHANGED));
}

/**
 * How many orders sit under each status, kept fresh so the sidebar counts
 * follow other workers' changes as well as this tab's.
 */
export function useOrderCounts(): Partial<Record<OrderStatus, number>> | null {
  const [counts, setCounts] = React.useState<Record<
    OrderStatus,
    number
  > | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = () => {
      getOrderCounts()
        .then((next) => {
          if (!cancelled) setCounts(next);
        })
        .catch(() => {
          // Counters are decoration; a failed refresh keeps the last numbers
          // rather than pushing an error into the navigation.
        });
    };

    const loadIfVisible = () => {
      if (document.visibilityState === "visible") load();
    };

    load();
    const interval = setInterval(loadIfVisible, POLL_MS);
    document.addEventListener("visibilitychange", loadIfVisible);
    window.addEventListener(ORDERS_CHANGED, load);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", loadIfVisible);
      window.removeEventListener(ORDERS_CHANGED, load);
    };
  }, []);

  return counts;
}
