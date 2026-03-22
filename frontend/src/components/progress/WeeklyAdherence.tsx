interface DayAdherence {
  day: string;
  mealPlan: boolean;
  workout: boolean;
}

export function WeeklyAdherence() {
  const adherenceData: DayAdherence[] = [
    { day: "Mon", mealPlan: true, workout: true },
    { day: "Tue", mealPlan: true, workout: true },
    { day: "Wed", mealPlan: false, workout: false },
    { day: "Thu", mealPlan: true, workout: true },
    { day: "Fri", mealPlan: true, workout: true },
    { day: "Sat", mealPlan: true, workout: false },
    { day: "Sun", mealPlan: true, workout: true },
  ];

  const mealPlanCompleted = adherenceData.filter((d) => d.mealPlan).length;
  const workoutCompleted = adherenceData.filter((d) => d.workout).length;

  return (
    <div
      className="bg-white rounded p-6 md:p-8 border mb-6"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      {/* Header */}
      <h2
        className="text-2xl mb-2"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--nutritrack-text)",
        }}
      >
        Weekly Adherence
      </h2>
      <p
        className="text-sm mb-6"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--nutritrack-neutral)",
        }}
      >
        This week consistency
      </p>

      {/* Adherence Grid */}
      <div className="space-y-6">
        {/* Meal Plan */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div
              className="text-sm"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-text)",
              }}
            >
              Meal Plan
            </div>
            <div
              className="text-sm"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-neutral)",
              }}
            >
              {mealPlanCompleted}/7 days
            </div>
          </div>
          <div className="flex gap-2">
            {adherenceData.map((data) => (
              <div key={`meal-${data.day}`} className="flex-1">
                <div
                  className="h-16 rounded mb-1 transition-all"
                  style={{
                    backgroundColor: data.mealPlan
                      ? "var(--nutritrack-primary)"
                      : "rgba(113, 113, 122, 0.15)",
                    borderRadius: "4px",
                  }}
                />
                <div
                  className="text-xs text-center"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "var(--nutritrack-neutral)",
                  }}
                >
                  {data.day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workout */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div
              className="text-sm"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-text)",
              }}
            >
              Workout
            </div>
            <div
              className="text-sm"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-neutral)",
              }}
            >
              {workoutCompleted}/7 days
            </div>
          </div>
          <div className="flex gap-2">
            {adherenceData.map((data) => (
              <div key={`workout-${data.day}`} className="flex-1">
                <div
                  className="h-16 rounded mb-1 transition-all"
                  style={{
                    backgroundColor: data.workout
                      ? "var(--nutritrack-primary)"
                      : "rgba(113, 113, 122, 0.15)",
                    borderRadius: "4px",
                  }}
                />
                <div
                  className="text-xs text-center"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "var(--nutritrack-neutral)",
                  }}
                >
                  {data.day}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div
        className="mt-6 p-4 rounded"
        style={{
          backgroundColor: "var(--nutritrack-highlight)",
          borderRadius: "6px",
        }}
      >
        <div
          className="text-sm"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--nutritrack-text)",
          }}
        >
          Overall adherence:{" "}
          <span style={{ color: "var(--nutritrack-primary)", fontWeight: 600 }}>
            {Math.round(((mealPlanCompleted + workoutCompleted) / 14) * 100)}%
          </span>{" "}
          this week
        </div>
      </div>
    </div>
  );
}
