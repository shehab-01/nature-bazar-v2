interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DayMeals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
}

interface DailySummaryProps {
  meals: DayMeals;
}

export function DailySummary({ meals }: DailySummaryProps) {
  const totalCalories =
    meals.breakfast.calories +
    meals.lunch.calories +
    meals.dinner.calories +
    meals.snack.calories;
  const totalProtein =
    meals.breakfast.protein +
    meals.lunch.protein +
    meals.dinner.protein +
    meals.snack.protein;
  const totalCarbs =
    meals.breakfast.carbs +
    meals.lunch.carbs +
    meals.dinner.carbs +
    meals.snack.carbs;
  const totalFats =
    meals.breakfast.fats +
    meals.lunch.fats +
    meals.dinner.fats +
    meals.snack.fats;

  return (
    <div
      className="bg-white rounded p-5 border"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
        backgroundColor: "var(--nutritrack-highlight)",
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h4
            className="text-sm mb-1"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-neutral)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Daily Total
          </h4>
          <div
            className="text-2xl"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--nutritrack-text)",
            }}
          >
            {totalCalories} calories
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div
              className="text-xs mb-1"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-neutral)",
              }}
            >
              Protein
            </div>
            <div
              className="text-lg"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--nutritrack-text)",
              }}
            >
              {totalProtein}g
            </div>
          </div>
          <div>
            <div
              className="text-xs mb-1"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-neutral)",
              }}
            >
              Carbs
            </div>
            <div
              className="text-lg"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--nutritrack-text)",
              }}
            >
              {totalCarbs}g
            </div>
          </div>
          <div>
            <div
              className="text-xs mb-1"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-neutral)",
              }}
            >
              Fats
            </div>
            <div
              className="text-lg"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--nutritrack-text)",
              }}
            >
              {totalFats}g
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
