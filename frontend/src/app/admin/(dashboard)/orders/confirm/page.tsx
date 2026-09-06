"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function ConfirmOrdersPage() {
  return (
    <OrdersView
      title="Confirmed Order"
      description="Open an order to review it or change its status."
      statusOptions={["confirmed"]}
      initialStatuses={["confirmed"]}
    />
  );
}
