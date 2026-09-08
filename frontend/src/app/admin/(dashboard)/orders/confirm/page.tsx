"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function ConfirmOrdersPage() {
  return (
    <OrdersView
      statusOptions={["confirmed"]}
      initialStatuses={["confirmed"]}
      storageKey="orders-confirmed"
      showFulfilment
      bulkActions="confirm"
    />
  );
}
