"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function GoodButNoResponsePage() {
  return (
    <OrdersView
      statusOptions={["good_but_no_response"]}
      initialStatuses={["good_but_no_response"]}
      storageKey="orders-gbnr"
    />
  );
}
