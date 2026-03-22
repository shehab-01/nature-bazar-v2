import { Clock, Dumbbell } from "lucide-react";

export function TodaysWorkout() {
  const exercises = [
    "Bench Press - 3 sets × 10 reps",
    "Dumbbell Rows - 3 sets × 12 reps",
    "Shoulder Press - 3 sets × 10 reps",
    "Bicep Curls - 3 sets × 12 reps",
    "Tricep Extensions - 3 sets × 12 reps",
  ];

  return (
    <div
      className="bg-white rounded p-6 border"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-xl mb-2"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--nutritrack-text)",
            }}
          >
            Today&apos;s Workout
          </h3>
          <div
            className="flex items-center gap-4 text-sm"
            style={{ color: "var(--nutritrack-neutral)" }}
          >
            <div className="flex items-center gap-1.5">
              <Dumbbell size={14} />
              <span style={{ fontFamily: "var(--font-sans)" }}>Upper Body</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span style={{ fontFamily: "var(--font-sans)" }}>45 min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 mb-6">
        {exercises.map((exercise, index) => (
          <div
            key={index}
            className="flex items-start gap-2.5 text-sm"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-text)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
              style={{ backgroundColor: "var(--nutritrack-primary)" }}
            />
            {exercise}
          </div>
        ))}
      </div>

      <button
        className="w-full px-4 py-2.5 rounded transition-transform hover:scale-105 bg-(--nutritrack-primary)"
        style={{
          color: "white",
          fontFamily: "var(--font-sans)",
          borderRadius: "4px",
        }}
      >
        Start Workout
      </button>
    </div>
  );
}
