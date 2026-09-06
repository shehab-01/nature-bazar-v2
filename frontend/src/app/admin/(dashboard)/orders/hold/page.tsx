"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function HoldOrdersPage() {
  return (
    <OrdersView
      title="Hold"
      description="Open an order to review it or change its status."
      statusOptions={["on_hold"]}
      initialStatuses={["on_hold"]}
    />
  );
}
