"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";

import { OrderTags } from "@/components/admin/orders/order-tags";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatOrderDateTime, timeAgo, type Order } from "@/lib/orders";

export function getOrderColumns({
  onOpen,
  onOrderUpdated,
}: {
  onOpen: (order: Order) => void;
  onOrderUpdated: (order: Order) => void;
}): ColumnDef<Order>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-1 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {formatOrderDateTime(row.original.createdAt)}
          </span>
          <span className="text-xs text-muted-foreground">
            ID: {row.original.orderNo}
          </span>
        </div>
      ),
      filterFn: () => true,
    },
    {
      id: "landTime",
      header: "Land Time",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {timeAgo(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.customerName}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.phone}
          </span>
        </div>
      ),
      filterFn: () => true,
    },
    {
      id: "note",
      header: "Note",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex max-w-[240px] flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">
            Updated {timeAgo(row.original.updatedAt)}
          </span>
          <span className="line-clamp-2 text-sm">
            {row.original.comment || "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[220px] text-sm text-muted-foreground">
          {row.original.address}
        </span>
      ),
    },
    {
      id: "tags",
      header: "Tags",
      enableSorting: false,
      cell: ({ row }) => (
        <OrderTags order={row.original} onOrderUpdated={onOrderUpdated} />
      ),
    },
    {
      id: "status",
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
      filterFn: () => true,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpen(row.original)}
        >
          Open
          <ExternalLink className="ml-1 size-3.5" />
        </Button>
      ),
    },
  ];
}
