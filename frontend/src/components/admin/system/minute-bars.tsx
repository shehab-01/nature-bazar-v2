"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * One series, one minute per bar, the last hour. Thin marks with a surface gap
 * between them, a recessive baseline, and a per-bar tooltip; values are never
 * printed on every bar — the hero number beside the chart carries the total.
 */
export function MinuteBars({
  points,
  fillClass,
  label,
}: {
  points: { minute: string; value: number }[];
  /** Tailwind fill classes for light and dark, e.g. "fill-[#2a78d6] dark:fill-[#3987e5]". */
  fillClass: string;
  /** What one unit is, for the tooltip: "requests". */
  label: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const width = 240;
  const height = 48;
  const gap = 2;
  const slot = width / points.length;
  const barWidth = Math.max(1, slot - gap);
  const max = Math.max(1, ...points.map((p) => p.value));
  const hovered = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-12 w-full"
        role="img"
        aria-label={`${label} per minute over the last hour`}
        onMouseLeave={() => setHover(null)}
      >
        {/* baseline, recessive */}
        <line
          x1={0}
          x2={width}
          y1={height - 0.5}
          y2={height - 0.5}
          className="stroke-border"
          strokeWidth={1}
        />
        {points.map((p, i) => {
          const h = p.value === 0 ? 0 : Math.max(2, (p.value / max) * (height - 4));
          return (
            <g key={p.minute}>
              {/* hit target wider than the mark */}
              <rect
                x={i * slot}
                y={0}
                width={slot}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
              <rect
                x={i * slot + gap / 2}
                y={height - 1 - h}
                width={barWidth}
                height={h}
                rx={1.5}
                className={cn(
                  fillClass,
                  hover !== null && hover !== i && "opacity-40",
                  "transition-opacity"
                )}
              />
            </g>
          );
        })}
      </svg>
      {hovered && (
        <div
          className="pointer-events-none absolute -top-8 rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-sm"
          style={{
            left: `${Math.min(85, (hover! / points.length) * 100)}%`,
          }}
        >
          <span className="text-muted-foreground">
            {new Date(hovered.minute).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>{" "}
          <span className="font-medium tabular-nums">{hovered.value}</span>{" "}
          {label}
        </div>
      )}
    </div>
  );
}
