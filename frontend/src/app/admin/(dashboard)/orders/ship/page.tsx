"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function ShipOrdersPage() {
  return (
    <OrdersView
      statusOptions={["shipped"]}
      initialStatuses={["shipped"]}
      storageKey="orders-shipping"
      showFulfilment
      bulkActions="ship"
    />
  );
}
