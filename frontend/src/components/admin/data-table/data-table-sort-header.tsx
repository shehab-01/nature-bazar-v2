"use client";

import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * A sortable column header.
 *
 * It matches the size and weight of the plain headers so a sortable column
 * doesn't read as a different kind of heading, and it darkens on hover instead
 * of using the button's default lighter tint, which would wash out against the
 * shaded header band.
 */
export function SortableHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      // -ml-2.5 cancels the button's own padding, lining the label up with the
      // headers that are plain text.
      className="-ml-2.5 h-8 px-2.5 text-[0.9375rem] font-semibold hover:bg-black/5 dark:hover:bg-white/10"
    >
      {label}
      <ArrowUpDown className="size-3.5 opacity-60" />
    </Button>
  );
}
