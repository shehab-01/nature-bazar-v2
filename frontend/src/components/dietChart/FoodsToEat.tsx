export function FoodsToEat() {
  const foodCategories = [
    {
      category: "Proteins",
      foods: [
        "Chicken breast",
        "Salmon",
        "Eggs",
        "Greek yogurt",
        "Tofu",
        "Lentils",
        "Cottage cheese",
      ],
    },
    {
      category: "Vegetables",
      foods: [
        "Spinach",
        "Broccoli",
        "Kale",
        "Bell peppers",
        "Carrots",
        "Tomatoes",
        "Cauliflower",
        "Zucchini",
      ],
    },
    {
      category: "Fruits",
      foods: ["Berries", "Apples", "Bananas", "Oranges", "Avocado"],
    },
    {
      category: "Grains",
      foods: ["Quinoa", "Brown rice", "Oats", "Whole wheat bread"],
    },
    {
      category: "Healthy Fats",
      foods: ["Almonds", "Walnuts", "Olive oil", "Chia seeds", "Flaxseeds"],
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
        Foods to Eat
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
                    backgroundColor: "rgba(113, 113, 122, 0.1)",
                    color: "var(--nutritrack-text)",
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
