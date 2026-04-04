const CATEGORIES = [
  {
    label: "Processed Foods",
    foods: ["Fast food", "Instant noodles", "Frozen dinners", "Packaged snacks"],
  },
  {
    label: "Sugary Items",
    foods: ["Candy", "Soda", "Pastries", "Ice cream", "Energy drinks"],
  },
  {
    label: "Refined Carbs",
    foods: ["White bread", "White rice", "Regular pasta", "Crackers"],
  },
  {
    label: "Unhealthy Fats",
    foods: ["Fried foods", "Margarine", "Processed meats", "High-fat dairy"],
  },
];

export function FoodsToAvoid() {
  return (
    <div className="bg-white shadow-sm p-6 flex flex-col" style={{ borderRadius: "12px" }}>
      <h3
        className="text-lg font-semibold mb-5"
        style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
      >
        Foods to Avoid
      </h3>

      <div className="flex flex-col gap-5">
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: "#374151", fontFamily: "var(--font-inter)" }}
            >
              {cat.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {cat.foods.map((food) => (
                <span
                  key={food}
                  className="px-3 py-1 text-sm border border-red-200 bg-red-50"
                  style={{
                    borderRadius: "8px",
                    color: "#B91C1C",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
