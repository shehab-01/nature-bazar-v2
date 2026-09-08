"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function NoResponsePage() {
  return (
    <OrdersView
      statusOptions={["no_response"]}
      initialStatuses={["no_response"]}
      storageKey="orders-no-response"
    />
  );
}
