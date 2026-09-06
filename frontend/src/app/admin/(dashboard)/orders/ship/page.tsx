"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function ShipOrdersPage() {
  return (
    <OrdersView
      title="Shipping"
      description="Open an order to review it or change its status."
      statusOptions={["shipped"]}
      initialStatuses={["shipped"]}
    />
  );
}
