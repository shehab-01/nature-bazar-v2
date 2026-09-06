"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function NoResponsePage() {
  return (
    <OrdersView
      title="No Response"
      description="Open an order to review it or change its status."
      statusOptions={["no_response"]}
      initialStatuses={["no_response"]}
    />
  );
}
