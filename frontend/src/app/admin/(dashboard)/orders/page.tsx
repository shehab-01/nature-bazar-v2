"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";
import type { OrderStatus } from "@/lib/orders";

const OPEN_STATUSES: OrderStatus[] = [
  "processing",
  "incomplete",
  "good_but_no_response",
  "no_response",
  "advance_payment",
  "on_hold",
  "confirmed",
  "shipped",
  "cancelled",
];

export default function WebOrderListsPage() {
  return (
    <OrdersView
      title="Web Order Lists"
      description="Open an order to review it, change its status, or approve it."
      statusOptions={OPEN_STATUSES}
      initialStatuses={OPEN_STATUSES}
    />
  );
}
