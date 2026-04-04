const CATEGORIES = [
  {
    label: "Proteins",
    foods: ["Chicken breast", "Salmon", "Eggs", "Greek yogurt", "Tofu", "Lentils", "Cottage cheese"],
  },
  {
    label: "Vegetables",
    foods: ["Spinach", "Broccoli", "Kale", "Bell peppers", "Carrots", "Tomatoes", "Zucchini"],
  },
  {
    label: "Fruits",
    foods: ["Berries", "Apples", "Bananas", "Oranges", "Avocado"],
  },
  {
    label: "Grains",
    foods: ["Quinoa", "Brown rice", "Oats", "Whole wheat bread"],
  },
  {
    label: "Healthy Fats",
    foods: ["Almonds", "Walnuts", "Olive oil", "Chia seeds", "Flaxseeds"],
  },
];

export function FoodsToEat() {
  return (
    <div className="bg-white shadow-sm p-6 flex flex-col" style={{ borderRadius: "12px" }}>
      <h3
        className="text-lg font-semibold mb-5"
        style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
      >
        Foods to Eat
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
                  className="px-3 py-1 text-sm border border-gray-200 bg-white"
                  style={{
                    borderRadius: "8px",
                    color: "#374151",
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
