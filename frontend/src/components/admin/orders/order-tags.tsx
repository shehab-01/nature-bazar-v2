"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/components/admin/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addOrderTag } from "@/lib/api";
import type { Order } from "@/lib/orders";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
];

function initial(name: string | null): string {
  return (name ?? "?").trim().slice(0, 1).toUpperCase();
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0];
}

export function OrderTags({
  order,
  onOrderUpdated,
}: {
  order: Order;
  onOrderUpdated: (order: Order) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [label, setLabel] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const create = async (value: string, closeAfter = true) => {
    if (busy || !value) return;
    setBusy(true);
    try {
      onOrderUpdated(await addOrderTag(order.id, value));
      setLabel("");
      if (closeAfter) setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const myName = firstName(user.name);
  const myNameCount = order.tags.filter(
    (tag) => tag.label.toLowerCase() === myName.toLowerCase()
  ).length;

  // Same-label tags collapse into one pill with a count.
  const groups: {
    key: string;
    label: string;
    createdByName: string | null;
    colorId: number;
    ids: number[];
  }[] = [];
  for (const tag of order.tags) {
    const key = tag.label.toLowerCase();
    const group = groups.find((g) => g.key === key);
    if (group) {
      group.ids.push(tag.id);
    } else {
      groups.push({
        key,
        label: tag.label,
        createdByName: tag.createdByName,
        colorId: tag.id,
        ids: [tag.id],
      });
    }
  }

  return (
    <div className="flex max-w-[260px] flex-wrap items-center gap-1">
      {groups.map((group) => (
        <span
          key={group.key}
          className={cn(
            "inline-flex items-center gap-1 rounded-full py-0.5 pr-1.5 pl-0.5 text-xs font-medium",
            TAG_COLORS[group.colorId % TAG_COLORS.length]
          )}
        >
          <span
            title={group.createdByName ?? "Unknown"}
            className="flex size-4 items-center justify-center rounded-full bg-white/70 text-[10px] font-bold dark:bg-black/30"
          >
            {initial(group.createdByName)}
          </span>
          {group.label}
          {group.ids.length > 1 && (
            <span className="rounded-full bg-white/70 px-1 text-[10px] font-bold dark:bg-black/30">
              {group.ids.length}
            </span>
          )}
        </span>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon-xs" title="Add tag">
            <Plus className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[210px] p-2">
          <p className="px-1.5 pb-1 text-xs font-medium text-muted-foreground">
            Available Tags
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => create(myName, false)}
            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            <span className="w-4 text-center text-xs font-semibold text-muted-foreground">
              {myNameCount || ""}
            </span>
            {myName}
          </button>
          <div className="mt-1.5 flex items-center gap-1.5 border-t pt-2">
            <Input
              autoFocus
              placeholder="Write a tag…"
              value={label}
              maxLength={50}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  create(label.trim());
                }
              }}
              className="h-7 text-xs"
            />
            <Button
              size="xs"
              disabled={busy || !label.trim()}
              onClick={() => create(label.trim())}
            >
              Add
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
