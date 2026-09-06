"use client";

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { CalendarRange } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DateFilterValue = { from?: string; to?: string } | undefined;

type DateFilterMode = "specific" | "range";

function formatDisplayDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface DataTableDateFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
}

export function DataTableDateFilter<TData, TValue>({
  column,
  title = "Date",
}: DataTableDateFilterProps<TData, TValue>) {
  const filterValue = column?.getFilterValue() as DateFilterValue;
  const isRange = !!(
    filterValue?.from &&
    filterValue.to &&
    filterValue.from !== filterValue.to
  );

  const [mode, setMode] = React.useState<DateFilterMode>(
    isRange ? "range" : "specific"
  );
  const [specificDate, setSpecificDate] = React.useState(
    filterValue?.from && filterValue.from === filterValue.to
      ? filterValue.from
      : ""
  );
  const [fromDate, setFromDate] = React.useState(
    isRange ? filterValue?.from ?? "" : ""
  );
  const [toDate, setToDate] = React.useState(isRange ? filterValue?.to ?? "" : "");

  function handleSpecificDateChange(value: string) {
    setSpecificDate(value);
    column?.setFilterValue(value ? { from: value, to: value } : undefined);
  }

  function handleRangeChange(next: { from?: string; to?: string }) {
    const from = next.from ?? fromDate;
    const to = next.to ?? toDate;
    setFromDate(from);
    setToDate(to);
    column?.setFilterValue(from || to ? { from, to } : undefined);
  }

  function switchMode(nextMode: DateFilterMode) {
    setMode(nextMode);
    if (nextMode === "specific") {
      column?.setFilterValue(
        specificDate ? { from: specificDate, to: specificDate } : undefined
      );
    } else {
      column?.setFilterValue(
        fromDate || toDate ? { from: fromDate, to: toDate } : undefined
      );
    }
  }

  function clearFilter() {
    setSpecificDate("");
    setFromDate("");
    setToDate("");
    column?.setFilterValue(undefined);
  }

  const isActive = !!filterValue?.from || !!filterValue?.to;

  let summary: string | null = null;
  if (filterValue?.from && filterValue.from === filterValue.to) {
    summary = formatDisplayDate(filterValue.from);
  } else if (filterValue?.from || filterValue?.to) {
    summary = `${filterValue?.from ? formatDisplayDate(filterValue.from) : "…"} – ${
      filterValue?.to ? formatDisplayDate(filterValue.to) : "…"
    }`;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0 border-dashed">
          <CalendarRange className="mr-1.5 size-3.5" />
          {title}
          {isActive && summary && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                {summary}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px]">
        <div className="flex flex-col gap-3">
          <Tabs value={mode} onValueChange={(v) => switchMode(v as DateFilterMode)}>
            <TabsList className="w-full">
              <TabsTrigger value="specific">Specific date</TabsTrigger>
              <TabsTrigger value="range">Date range</TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === "specific" ? (
            <div className="space-y-1.5">
              <Label htmlFor="date-filter-specific" className="text-xs text-muted-foreground">
                Date
              </Label>
              <Input
                id="date-filter-specific"
                type="date"
                value={specificDate}
                onChange={(event) => handleSpecificDateChange(event.target.value)}
                className="h-8"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="date-filter-from" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Input
                  id="date-filter-from"
                  type="date"
                  value={fromDate}
                  onChange={(event) =>
                    handleRangeChange({ from: event.target.value })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date-filter-to" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Input
                  id="date-filter-to"
                  type="date"
                  value={toDate}
                  onChange={(event) =>
                    handleRangeChange({ to: event.target.value })
                  }
                  className="h-8"
                />
              </div>
            </div>
          )}

          {isActive && (
            <Button variant="ghost" size="sm" onClick={clearFilter}>
              Clear filter
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
