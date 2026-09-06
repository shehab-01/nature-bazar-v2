"use client";

import type { Column } from "@tanstack/react-table";
import { ListFilter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title: string;
  options: { label: string; value: string }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set((column?.getFilterValue() as string[]) ?? []);

  function toggleValue(value: string, checked: boolean) {
    if (checked) {
      selectedValues.add(value);
    } else {
      selectedValues.delete(value);
    }
    const next = Array.from(selectedValues);
    column?.setFilterValue(next.length ? next : undefined);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <ListFilter className="mr-1.5 size-3.5" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              {selectedValues.size > 2 ? (
                <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                  {selectedValues.size} selected
                </Badge>
              ) : (
                <div className="flex gap-1">
                  {options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        key={option.value}
                        variant="secondary"
                        className="rounded-sm px-1.5 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))}
                </div>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value);
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) => toggleValue(option.value, !!checked)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          );
        })}
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-center"
              onSelect={() => column?.setFilterValue(undefined)}
            >
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
