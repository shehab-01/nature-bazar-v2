"use client";

import { OrdersView } from "@/components/admin/orders/orders-view";

export default function GoodButNoResponsePage() {
  return (
    <OrdersView
      title="Good But No Response"
      description="Open an order to review it or change its status."
      statusOptions={["good_but_no_response"]}
      initialStatuses={["good_but_no_response"]}
    />
  );
}
