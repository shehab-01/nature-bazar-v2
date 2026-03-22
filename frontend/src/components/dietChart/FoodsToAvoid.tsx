export function FoodsToAvoid() {
  const foodCategories = [
    {
      category: "Processed Foods",
      foods: [
        "Fast food",
        "Instant noodles",
        "Frozen dinners",
        "Packaged snacks",
      ],
    },
    {
      category: "Sugary Items",
      foods: ["Candy", "Soda", "Pastries", "Ice cream", "Energy drinks"],
    },
    {
      category: "Refined Carbs",
      foods: ["White bread", "White rice", "Regular pasta", "Crackers"],
    },
    {
      category: "Unhealthy Fats",
      foods: ["Fried foods", "Margarine", "Processed meats", "High-fat dairy"],
    },
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
      <h3
        className="text-xl mb-6"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--nutritrack-text)",
        }}
      >
        Foods to Avoid
      </h3>

      <div className="space-y-5">
        {foodCategories.map((category, index) => (
          <div key={index}>
            <h4
              className="text-sm mb-2.5"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-text)",
                fontWeight: 600,
              }}
            >
              {category.category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.foods.map((food, foodIndex) => (
                <span
                  key={foodIndex}
                  className="px-3 py-1.5 rounded text-sm"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "#991b1b",
                    fontFamily: "var(--font-sans)",
                    borderRadius: "20px",
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
