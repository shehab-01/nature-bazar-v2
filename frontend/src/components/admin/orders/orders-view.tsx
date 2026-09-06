"use client";

import * as React from "react";

import { getOrderColumns } from "@/components/admin/orders/columns";
import { OrderDetailsModal } from "@/components/admin/orders/order-details-modal";
import {
  DataTable,
  type DataTableQuery,
} from "@/components/admin/data-table/data-table";
import { listOrders, type OrderListParams } from "@/lib/api";
import { ORDER_STATUSES, type OrderStatus, type Order } from "@/lib/orders";

const SORT_FIELDS: Record<string, string> = {
  id: "id",
  total: "total",
  createdAt: "created_at",
};

function queryToParams(query: DataTableQuery): OrderListParams {
  const params: OrderListParams = {
    page: query.pagination.pageIndex + 1,
    pageSize: query.pagination.pageSize,
  };
  for (const filter of query.columnFilters) {
    if (filter.id === "status") {
      params.status = filter.value as OrderStatus[];
    } else if (filter.id === "customerName") {
      const q = String(filter.value).trim();
      if (q) params.q = q;
    } else if (filter.id === "createdAt") {
      const range = filter.value as { from?: string; to?: string };
      if (range.from) params.dateFrom = range.from;
      if (range.to) params.dateTo = range.to;
    }
  }
  const sort = query.sorting[0];
  if (sort && SORT_FIELDS[sort.id]) {
    params.sort = `${sort.desc ? "-" : ""}${SORT_FIELDS[sort.id]}`;
  }
  return params;
}

export function OrdersView({
  title,
  description,
  statusOptions,
  initialStatuses,
}: {
  title: string;
  description: string;
  /** Which statuses the filter offers on this page. */
  statusOptions: OrderStatus[];
  /** Which of them are selected by default. */
  initialStatuses: OrderStatus[];
}) {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState<DataTableQuery | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const lastSearch = React.useRef<string | undefined>(undefined);
  const silentRef = React.useRef(false);

  // Live view: refresh every 10s while the tab is visible, and on refocus,
  // so changes made by other workers show up without anyone reloading.
  React.useEffect(() => {
    const silentRefresh = () => {
      if (document.visibilityState !== "visible") return;
      silentRef.current = true;
      setRefreshKey((k) => k + 1);
    };
    const interval = setInterval(silentRefresh, 10_000);
    document.addEventListener("visibilitychange", silentRefresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", silentRefresh);
    };
  }, []);

  React.useEffect(() => {
    if (!query) return;
    const params = queryToParams(query);
    const searchChanged = params.q !== lastSearch.current;
    lastSearch.current = params.q;

    let cancelled = false;
    const silent = silentRef.current;
    silentRef.current = false;
    const run = async () => {
      if (!silent) setLoading(true);
      try {
        const result = await listOrders(params);
        if (cancelled) return;
        setOrders(result.items);
        setTotal(result.total);
        setPages(result.pages);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Debounce keystrokes in the search box; everything else fetches at once.
    const timer = setTimeout(run, searchChanged ? 350 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, refreshKey]);

  const handleOpen = React.useCallback((order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  }, []);

  const handleOrderUpdated = React.useCallback((updated: Order) => {
    setSelectedOrder(updated);
    setOrders((prev) =>
      prev.map((order) => (order.id === updated.id ? updated : order))
    );
    // Refetch so orders that left this page's filter scope disappear.
    silentRef.current = true;
    setRefreshKey((k) => k + 1);
  }, []);

  const columns = React.useMemo(
    () =>
      getOrderColumns({
        onOpen: handleOpen,
        onOrderUpdated: handleOrderUpdated,
      }),
    [handleOpen, handleOrderUpdated]
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {total} orders match the current filters. {description}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={orders}
        searchColumnId="customerName"
        searchPlaceholder="Search by name, phone, or order ID..."
        facetedFilters={[
          {
            columnId: "status",
            title: "Status",
            options: ORDER_STATUSES.filter((status) =>
              statusOptions.includes(status.value)
            ).map((status) => ({
              label: status.label,
              value: status.value,
            })),
          },
        ]}
        dateFilter={{ columnId: "createdAt", title: "Date" }}
        initialColumnFilters={[{ id: "status", value: initialStatuses }]}
        initialColumnVisibility={{ status: false }}
        serverSide={{
          total,
          pages,
          loading,
          onQueryChange: setQuery,
        }}
      />

      <OrderDetailsModal
        order={selectedOrder}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}
