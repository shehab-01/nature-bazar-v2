"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function IncompleteOrdersPage() {
  return (
    <OrdersView
      title="Incomplete"
      description="Open an order to review it or change its status."
      statusOptions={["incomplete"]}
      initialStatuses={["incomplete"]}
    />
  );
}
