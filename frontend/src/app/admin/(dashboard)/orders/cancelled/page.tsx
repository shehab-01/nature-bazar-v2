"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function CancelledOrdersPage() {
  return (
    <OrdersView
      title="Cancelled"
      description="Open an order to review it or change its status."
      statusOptions={["cancelled"]}
      initialStatuses={["cancelled"]}
    />
  );
}
