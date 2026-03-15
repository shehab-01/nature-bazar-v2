"use client";

import { Check } from "lucide-react";

const days = [
  { label: "Mon", completed: true },
  { label: "Tue", completed: true },
  { label: "Wed", completed: true },
  { label: "Thu", completed: true },
  { label: "Fri", completed: false },
  { label: "Sat", completed: false },
  { label: "Sun", completed: false },
];

const completedCount = days.filter((d) => d.completed).length;

export function WeeklyStreak() {
  return (
    <div
      className="bg-white rounded-lg border p-6"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3
          className="text-xl"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--nutritrack-text)",
          }}
        >
          Weekly Streak
        </h3>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 18 }}>🔥</span>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--nutritrack-primary)" }}
          >
            {completedCount} day{completedCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <p
        className="text-xs mb-6"
        style={{ color: "var(--nutritrack-neutral)" }}
      >
        {completedCount} of 7 days completed this week
      </p>

      {/* Day circles */}
      <div className="flex justify-between items-center gap-2 mb-5">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all"
              style={{
                backgroundColor: day.completed
                  ? "var(--primary)"
                  : "rgba(113, 113, 122, 0.1)",
              }}
            >
              {day.completed ? (
                <Check
                  className="w-4 h-4"
                  style={{ color: "white", strokeWidth: 2.5 }}
                />
              ) : (
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "var(--nutritrack-neutral)",
                  }}
                >
                  {day.label.charAt(0)}
                </span>
              )}
            </div>
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-sans)",
                color: day.completed
                  ? "var(--nutritrack-primary)"
                  : "var(--nutritrack-neutral)",
                fontWeight: day.completed ? 500 : 400,
              }}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: 6,
          backgroundColor: "rgba(113, 113, 122, 0.12)",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(completedCount / 7) * 100}%`,
            backgroundColor: "var(--nutritrack-primary)",
          }}
        />
      </div>
    </div>
  );
}
