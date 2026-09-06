"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, type TeamMember, type UserStatus } from "@/lib/team";

function SortableHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="-ml-3">
      {label}
      <ArrowUpDown className="ml-1 size-3.5" />
    </Button>
  );
}

export function getTeamColumns({
  currentUserId,
  onStatusChange,
}: {
  currentUserId: number;
  onStatusChange: (id: number, status: UserStatus) => void;
}): ColumnDef<TeamMember>[] {
  return [
    {
      accessorKey: "name",
      header: "Member",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            {row.original.pictureUrl && (
              <AvatarImage
                src={row.original.pictureUrl}
                alt={row.original.name}
              />
            )}
            <AvatarFallback>
              {row.original.name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        </div>
      ),
      filterFn: (row, _columnId, filterValue) => {
        const search = String(filterValue).toLowerCase();
        return (
          row.original.name.toLowerCase().includes(search) ||
          row.original.email.toLowerCase().includes(search)
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge
          variant={row.original.role === "super_admin" ? "default" : "outline"}
        >
          {ROLE_LABELS[row.original.role]}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "active" ? "secondary" : "destructive"
          }
        >
          {row.original.status === "active" ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      accessorKey: "ordersConfirmed",
      header: ({ column }) => (
        <SortableHeader
          label="Confirmed"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.ordersConfirmed}</span>
      ),
    },
    {
      accessorKey: "ordersShipped",
      header: ({ column }) => (
        <SortableHeader
          label="Shipped"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.ordersShipped}</span>
      ),
    },
    {
      accessorKey: "lastActiveAt",
      header: ({ column }) => (
        <SortableHeader
          label="Last active"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) =>
        row.original.lastActiveAt
          ? new Date(row.original.lastActiveAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        if (
          row.original.role === "super_admin" ||
          row.original.id === currentUserId
        ) {
          return null;
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {row.original.status === "active" ? (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onStatusChange(row.original.id, "suspended")}
                >
                  Suspend access
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onStatusChange(row.original.id, "active")}
                >
                  Reactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
