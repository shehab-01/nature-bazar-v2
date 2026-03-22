export function DailyTargets() {
  const macros = [
    {
      label: "Daily Calories",
      value: "1,850",
      unit: "kcal",
      percentage: 100,
      color: "#C2410C",
    },
    {
      label: "Protein",
      value: "120",
      unit: "g",
      percentage: 30,
      color: "#C2410C",
    },
    {
      label: "Carbohydrates",
      value: "180",
      unit: "g",
      percentage: 45,
      color: "#C2410C",
    },
    {
      label: "Fats",
      value: "55",
      unit: "g",
      percentage: 25,
      color: "#C2410C",
    },
  ];

  return (
    <div className="mb-8">
      <h2
        className="text-2xl mb-4"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--nutritrack-text)",
        }}
      >
        Daily Targets
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {macros.map((macro, index) => (
          <div
            key={index}
            className="p-5 rounded"
            style={{
              backgroundColor: "var(--nutritrack-highlight)",
              borderRadius: "8px",
            }}
          >
            <div
              className="text-3xl mb-1"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--nutritrack-text)",
              }}
            >
              {macro.value}
              <span
                className="text-lg ml-1"
                style={{ color: "var(--nutritrack-neutral)" }}
              >
                {macro.unit}
              </span>
            </div>
            <div
              className="text-sm mb-3"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-text)",
              }}
            >
              {macro.label}
            </div>

            {/* Progress Bar */}
            {index > 0 && (
              <div className="relative h-1.5 bg-white bg-opacity-50 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all"
                  style={{
                    width: `${macro.percentage}%`,
                    backgroundColor: macro.color,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
