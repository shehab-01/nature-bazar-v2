// Timeline runs 6 AM → 9 PM (15 hours)
const START_HOUR = 6;
const END_HOUR = 21;
const SPAN = END_HOUR - START_HOUR;

const MEALS = [
  { name: "Breakfast", start: 7,    end: 9,    label: "7:00 – 9:00 AM"   },
  { name: "Lunch",     start: 12,   end: 13.5, label: "12:00 – 1:30 PM"  },
  { name: "Snack",     start: 15.5, end: 16.5, label: "3:30 – 4:30 PM"   },
  { name: "Dinner",    start: 19,   end: 20.5, label: "7:00 – 8:30 PM"   },
];

const TIME_LABELS = [
  { h: 6,  label: "6 AM"  },
  { h: 9,  label: "9 AM"  },
  { h: 12, label: "12 PM" },
  { h: 15, label: "3 PM"  },
  { h: 18, label: "6 PM"  },
  { h: 21, label: "9 PM"  },
];

function toPercent(hour: number) {
  return ((hour - START_HOUR) / SPAN) * 100;
}

export function MealTimingGuide() {
  return (
    <div className="bg-white shadow-sm p-6" style={{ borderRadius: "12px" }}>
      <h3
        className="text-lg font-semibold mb-5"
        style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
      >
        Meal Timing Guide
      </h3>

      {/* ── Desktop: horizontal timeline ── */}
      <div className="hidden md:block">
        {/* Time axis labels */}
        <div className="relative flex justify-between mb-2 px-0">
          {TIME_LABELS.map(({ h, label }) => (
            <span
              key={h}
              className="text-xs"
              style={{ color: "#9CA3AF", fontFamily: "var(--font-inter)" }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Track */}
        <div
          className="relative h-20 overflow-hidden"
          style={{ backgroundColor: "#F9FAFB", borderRadius: "10px" }}
        >
          {/* Subtle grid lines */}
          {TIME_LABELS.map(({ h }) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: `${toPercent(h)}%`,
                backgroundColor: "#E5E7EB",
              }}
            />
          ))}

          {/* Meal blocks */}
          {MEALS.map((meal) => {
            const left  = toPercent(meal.start);
            const width = toPercent(meal.end) - toPercent(meal.start);
            return (
              <div
                key={meal.name}
                className="absolute top-2 bottom-2 flex flex-col justify-center px-2 overflow-hidden"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: "#E1F5EE",
                  borderLeft: "3px solid #1D9E75",
                  borderRadius: "6px",
                }}
              >
                <span
                  className="text-xs font-semibold truncate leading-tight"
                  style={{ color: "#0F6E56", fontFamily: "var(--font-inter)" }}
                >
                  {meal.name}
                </span>
                <span
                  className="text-[10px] truncate leading-tight mt-0.5"
                  style={{ color: "#6B7280", fontFamily: "var(--font-inter)" }}
                >
                  {meal.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: vertical stacked list ── */}
      <div className="md:hidden flex flex-col gap-3">
        {MEALS.map((meal) => (
          <div
            key={meal.name}
            className="px-4 py-3"
            style={{
              backgroundColor: "#E1F5EE",
              borderLeft: "3px solid #1D9E75",
              borderRadius: "8px",
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: "#0F6E56", fontFamily: "var(--font-inter)" }}
            >
              {meal.name}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "#6B7280", fontFamily: "var(--font-inter)" }}
            >
              {meal.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
