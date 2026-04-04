const TOTAL_KCAL = 1850;

const MEALS = [
  { name: "Breakfast", icon: "☀️",  kcal: 350 },
  { name: "Lunch",     icon: "🕛",  kcal: 500 },
  { name: "Dinner",    icon: "🌙",  kcal: 600 },
  { name: "Snack",     icon: "🍎",  kcal: 400 },
];

export function MealCalorieSplit() {
  return (
    <div className="bg-white shadow-sm p-6 flex flex-col" style={{ borderRadius: "12px" }}>
      <h3
        className="text-lg font-semibold mb-5"
        style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
      >
        Calorie Budget per Meal
      </h3>

      <div className="flex flex-col gap-5 flex-1 justify-center">
        {MEALS.map((meal) => {
          const pct = Math.round((meal.kcal / TOTAL_KCAL) * 100);
          return (
            <div key={meal.name}>
              {/* Row header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{meal.icon}</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#374151", fontFamily: "var(--font-inter)" }}
                  >
                    {meal.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
                  >
                    {meal.kcal} kcal
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "#9CA3AF", fontFamily: "var(--font-inter)" }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="h-1.5 overflow-hidden"
                style={{ backgroundColor: "#F3F4F6", borderRadius: "99px" }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: "#1D9E75",
                    borderRadius: "99px",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
