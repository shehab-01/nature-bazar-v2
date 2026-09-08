"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function HoldOrdersPage() {
  return (
    <OrdersView
      statusOptions={["on_hold"]}
      initialStatuses={["on_hold"]}
      storageKey="orders-hold"
    />
  );
}
