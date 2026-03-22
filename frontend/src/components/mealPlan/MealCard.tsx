import { ArrowRightLeft, ExternalLink } from "lucide-react";

interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MealCardProps {
  mealType: string;
  meal: Meal;
}

export function MealCard({ mealType, meal }: MealCardProps) {
  return (
    <div
      className="bg-white rounded p-5 border"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div
            className="text-xs mb-1"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-neutral)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {mealType}
          </div>
          <h3
            className="text-lg mb-1"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--nutritrack-text)",
            }}
          >
            {meal.name}
          </h3>
          <p
            className="text-sm mb-3"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-neutral)",
            }}
          >
            {meal.description}
          </p>
        </div>

        <button
          className="p-2 hover:bg-opacity-10 hover:bg-gray-500 rounded transition-colors flex-shrink-0"
          style={{ borderRadius: "4px" }}
          aria-label="Swap meal"
        >
          <ArrowRightLeft
            size={18}
            style={{ color: "var(--nutritrack-neutral)" }}
          />
        </button>
      </div>

      {/* Macros and Calories */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm px-2.5 py-1 rounded"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-text)",
              backgroundColor: "rgba(113, 113, 122, 0.08)",
              borderRadius: "12px",
            }}
          >
            P: {meal.protein}g
          </span>
          <span
            className="text-sm px-2.5 py-1 rounded"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-text)",
              backgroundColor: "rgba(113, 113, 122, 0.08)",
              borderRadius: "12px",
            }}
          >
            C: {meal.carbs}g
          </span>
          <span
            className="text-sm px-2.5 py-1 rounded"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-text)",
              backgroundColor: "rgba(113, 113, 122, 0.08)",
              borderRadius: "12px",
            }}
          >
            F: {meal.fats}g
          </span>
          <span
            className="text-sm px-2.5 py-1 rounded"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-primary)",
              backgroundColor: "var(--nutritrack-highlight)",
              borderRadius: "12px",
              fontWeight: 600,
            }}
          >
            {meal.calories} cal
          </span>
        </div>

        <button
          className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--nutritrack-primary)",
          }}
        >
          View Recipe
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}
