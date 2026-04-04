const macros = [
  { label: "Daily Calories", value: "1,850", unit: "kcal", current: 0, target: 1850 },
  { label: "Protein",        value: "120",   unit: "g",    current: 0, target: 120  },
  { label: "Carbohydrates",  value: "180",   unit: "g",    current: 0, target: 180  },
  { label: "Fats",           value: "55",    unit: "g",    current: 0, target: 55   },
];

export function DailyTargets() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {macros.map((macro) => {
        const pct = Math.min(100, (macro.current / macro.target) * 100);
        return (
          <div
            key={macro.label}
            className="bg-white shadow-sm p-5"
            style={{ borderRadius: "12px" }}
          >
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "#6B7280", fontFamily: "var(--font-inter)" }}
            >
              {macro.label}
            </p>

            <div className="flex items-baseline gap-1 mb-4">
              <span
                className="text-4xl font-bold"
                style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
              >
                {macro.value}
              </span>
              <span className="text-base" style={{ color: "#9CA3AF" }}>
                {macro.unit}
              </span>
            </div>

            {/* Green underline progress bar */}
            <div
              className="h-1.5 overflow-hidden"
              style={{ backgroundColor: "#F3F4F6", borderRadius: "99px" }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: "#1D9E75",
                  borderRadius: "99px",
                  minWidth: pct > 0 ? "4px" : "0",
                }}
              />
            </div>

            <p
              className="text-xs mt-1.5"
              style={{ color: "#9CA3AF", fontFamily: "var(--font-inter)" }}
            >
              {macro.current} / {macro.target} {macro.unit} today
            </p>
          </div>
        );
      })}
    </div>
  );
}
