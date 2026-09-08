"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  FileWarning,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderStats, type OrderStats } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<OrderStats | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getOrderStats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load stats")
      );
  }, []);

  const cards = [
    {
      label: "Total orders",
      value: stats?.total.toLocaleString(),
      icon: ShoppingBag,
    },
    {
      label: "In progress",
      value: stats?.in_progress.toLocaleString(),
      icon: Clock3,
    },
    {
      label: "Confirmed",
      value: stats?.confirmed.toLocaleString(),
      icon: PackageCheck,
    },
    {
      label: "Revenue",
      value: stats ? `৳${stats.revenue.toLocaleString()}` : undefined,
      icon: ArrowUpRight,
    },
    {
      label: "Incomplete",
      value: stats?.incomplete.toLocaleString(),
      icon: FileWarning,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Incomplete forms are counted on their own — nobody ordered them, so they
        are left out of the order totals and revenue.
      </p>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {card.value ?? <Skeleton className="h-8 w-20" />}
              </CardTitle>
              <CardAction>
                <card.icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            View, update the status of, and leave notes on every order.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            Go to orders &rarr;
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
