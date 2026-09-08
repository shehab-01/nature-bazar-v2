"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function CancelledOrdersPage() {
  return (
    <OrdersView
      statusOptions={["cancelled"]}
      initialStatuses={["cancelled"]}
      storageKey="orders-cancelled"
    />
  );
}
