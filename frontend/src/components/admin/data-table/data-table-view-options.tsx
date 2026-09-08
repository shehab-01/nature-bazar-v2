"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Check, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * The Toggle columns panel.
 *
 * Toggling applies straight away so the change can be judged against the real
 * table. Save writes the layout to this browser so it survives reloads; Reset
 * drops the saved layout and returns to the page's defaults.
 */
export function DataTableViewOptions<TData>({
  table,
  onSave,
  onReset,
  canSave,
}: {
  table: Table<TData>;
  onSave: () => void;
  onReset: () => void;
  /** False when there is nowhere to persist to (no storage key given). */
  canSave: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Confirm the save in place, then go back to the normal label.
  React.useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(timer);
  }, [saved]);

  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          <SlidersHorizontal className="size-3.5" />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <p className="px-4 pt-4 pb-3 text-base font-semibold">
          Toggle columns
        </p>

        <div className="max-h-[19rem] overflow-y-auto border-y py-1">
          {columns.map((column) => {
            const visible = column.getIsVisible();
            return (
              <button
                key={column.id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={visible}
                onClick={() => column.toggleVisibility(!visible)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-table-header"
              >
                {/* Fixed-width slot so the labels stay aligned whether or not
                    a column is ticked. */}
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    visible ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">
                  {column.columnDef.meta?.label ?? column.id}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 p-3">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={!canSave}
            title={
              canSave ? undefined : "This table has no saved layout"
            }
            onClick={() => {
              onSave();
              setSaved(true);
            }}
          >
            {saved ? "Saved" : "Save"}
          </Button>
          <Button
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              onReset();
              setSaved(false);
            }}
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
