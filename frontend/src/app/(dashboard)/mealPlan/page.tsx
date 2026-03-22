"use client";

import { DailySummary } from "@/components/mealPlan/DailySummary";
import { MealCard } from "@/components/mealPlan/MealCard";
import { WeeklyCalendar } from "@/components/mealPlan/WeeklyCalendar";
import { RefreshCw } from "lucide-react";
import React, { useState } from "react";

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

const weekMeals: Record<string, DayMeals> = {
  monday: {
    breakfast: {
      id: "m1",
      name: "Greek Yogurt Bowl",
      description:
        "Greek yogurt with mixed berries, granola, and honey drizzle",
      calories: 350,
      protein: 20,
      carbs: 45,
      fats: 8,
    },
    lunch: {
      id: "m2",
      name: "Grilled Chicken Salad",
      description:
        "Mixed greens, grilled chicken breast, cherry tomatoes, cucumber, olive oil",
      calories: 420,
      protein: 35,
      carbs: 25,
      fats: 18,
    },
    dinner: {
      id: "m3",
      name: "Baked Salmon with Quinoa",
      description:
        "Herb-crusted salmon, quinoa pilaf, roasted broccoli and carrots",
      calories: 550,
      protein: 40,
      carbs: 45,
      fats: 20,
    },
    snack: {
      id: "m4",
      name: "Apple with Almond Butter",
      description: "Fresh apple slices with natural almond butter",
      calories: 180,
      protein: 5,
      carbs: 20,
      fats: 9,
    },
  },
  tuesday: {
    breakfast: {
      id: "t1",
      name: "Veggie Omelet",
      description:
        "Three-egg omelet with spinach, mushrooms, bell peppers, and feta",
      calories: 320,
      protein: 25,
      carbs: 12,
      fats: 18,
    },
    lunch: {
      id: "t2",
      name: "Turkey & Avocado Wrap",
      description:
        "Whole wheat wrap with turkey, avocado, lettuce, tomato, mustard",
      calories: 440,
      protein: 30,
      carbs: 38,
      fats: 16,
    },
    dinner: {
      id: "t3",
      name: "Lean Beef Stir-Fry",
      description:
        "Lean beef strips, mixed vegetables, brown rice, ginger-soy sauce",
      calories: 520,
      protein: 38,
      carbs: 50,
      fats: 15,
    },
    snack: {
      id: "t4",
      name: "Protein Smoothie",
      description:
        "Banana, protein powder, almond milk, spinach, peanut butter",
      calories: 220,
      protein: 25,
      carbs: 22,
      fats: 6,
    },
  },
  // Add similar data for other days (simplified for brevity)
  wednesday: {
    breakfast: {
      id: "w1",
      name: "Overnight Oats",
      description:
        "Oats soaked in almond milk, topped with chia seeds and blueberries",
      calories: 340,
      protein: 12,
      carbs: 52,
      fats: 10,
    },
    lunch: {
      id: "w2",
      name: "Quinoa Buddha Bowl",
      description:
        "Quinoa, chickpeas, roasted sweet potato, tahini dressing, greens",
      calories: 460,
      protein: 18,
      carbs: 58,
      fats: 16,
    },
    dinner: {
      id: "w3",
      name: "Grilled Chicken Breast",
      description:
        "Herb-marinated chicken, sweet potato mash, steamed green beans",
      calories: 530,
      protein: 42,
      carbs: 48,
      fats: 14,
    },
    snack: {
      id: "w4",
      name: "Mixed Nuts",
      description: "Portion of almonds, walnuts, and cashews",
      calories: 170,
      protein: 6,
      carbs: 8,
      fats: 14,
    },
  },
  thursday: {
    breakfast: {
      id: "th1",
      name: "Avocado Toast",
      description:
        "Whole grain toast, mashed avocado, poached eggs, cherry tomatoes",
      calories: 380,
      protein: 18,
      carbs: 35,
      fats: 20,
    },
    lunch: {
      id: "th2",
      name: "Tuna Salad Bowl",
      description:
        "Tuna, mixed greens, hard-boiled egg, olives, balsamic vinaigrette",
      calories: 400,
      protein: 35,
      carbs: 20,
      fats: 18,
    },
    dinner: {
      id: "th3",
      name: "Shrimp Pasta",
      description:
        "Whole wheat pasta, garlic shrimp, cherry tomatoes, spinach, olive oil",
      calories: 540,
      protein: 32,
      carbs: 62,
      fats: 16,
    },
    snack: {
      id: "th4",
      name: "Cottage Cheese & Berries",
      description: "Low-fat cottage cheese with fresh strawberries",
      calories: 150,
      protein: 16,
      carbs: 15,
      fats: 3,
    },
  },
  friday: {
    breakfast: {
      id: "f1",
      name: "Protein Pancakes",
      description: "Banana protein pancakes with Greek yogurt and maple syrup",
      calories: 360,
      protein: 24,
      carbs: 48,
      fats: 8,
    },
    lunch: {
      id: "f2",
      name: "Chicken Caesar Salad",
      description:
        "Romaine lettuce, grilled chicken, parmesan, whole grain croutons",
      calories: 430,
      protein: 36,
      carbs: 28,
      fats: 18,
    },
    dinner: {
      id: "f3",
      name: "Baked Cod with Vegetables",
      description:
        "Herb-baked cod, roasted Mediterranean vegetables, brown rice",
      calories: 510,
      protein: 38,
      carbs: 50,
      fats: 14,
    },
    snack: {
      id: "f4",
      name: "Hummus & Veggies",
      description: "Homemade hummus with carrot and celery sticks",
      calories: 160,
      protein: 6,
      carbs: 18,
      fats: 7,
    },
  },
  saturday: {
    breakfast: {
      id: "s1",
      name: "Smoothie Bowl",
      description:
        "Acai smoothie bowl topped with granola, coconut, and fresh fruit",
      calories: 370,
      protein: 14,
      carbs: 58,
      fats: 10,
    },
    lunch: {
      id: "s2",
      name: "Mediterranean Bowl",
      description:
        "Falafel, quinoa, cucumber-tomato salad, tzatziki sauce, pita",
      calories: 480,
      protein: 20,
      carbs: 62,
      fats: 16,
    },
    dinner: {
      id: "s3",
      name: "Grilled Steak",
      description: "Lean sirloin steak, roasted fingerling potatoes, asparagus",
      calories: 560,
      protein: 45,
      carbs: 42,
      fats: 20,
    },
    snack: {
      id: "s4",
      name: "Dark Chocolate & Almonds",
      description: "70% dark chocolate square with a handful of almonds",
      calories: 190,
      protein: 5,
      carbs: 14,
      fats: 14,
    },
  },
  sunday: {
    breakfast: {
      id: "su1",
      name: "Egg White Scramble",
      description:
        "Scrambled egg whites with vegetables, whole wheat toast, avocado",
      calories: 330,
      protein: 22,
      carbs: 32,
      fats: 12,
    },
    lunch: {
      id: "su2",
      name: "Asian Chicken Bowl",
      description:
        "Teriyaki chicken, brown rice, edamame, shredded carrots, sesame",
      calories: 470,
      protein: 34,
      carbs: 52,
      fats: 14,
    },
    dinner: {
      id: "su3",
      name: "Turkey Meatballs",
      description:
        "Lean turkey meatballs, marinara sauce, zucchini noodles, parmesan",
      calories: 520,
      protein: 40,
      carbs: 38,
      fats: 18,
    },
    snack: {
      id: "su4",
      name: "Banana & Peanut Butter",
      description: "Banana with natural peanut butter",
      calories: 200,
      protein: 7,
      carbs: 28,
      fats: 8,
    },
  },
};

const MealPlan = () => {
  const [activeSection, setActiveSection] = useState("meal-plan");
  const [activeDay, setActiveDay] = useState("monday");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 1500);
  };

  const currentDayMeals = weekMeals[activeDay];

  return (
    <div className="flex-1 pb-20 lg:pb-0">
      <div className="px-6 md:px-12 py-8 md:py-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1
              className="text-4xl md:text-5xl mb-2"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--nutritrack-text)",
              }}
            >
              Meal Plan
            </h1>
            <p
              className="text-lg"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-neutral)",
              }}
            >
              Your personalized weekly meal plan
            </p>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 rounded border transition-all hover:bg-opacity-5"
            style={{
              borderColor: "var(--nutritrack-primary)",
              color: "var(--nutritrack-primary)",
              fontFamily: "var(--font-sans)",
              borderRadius: "4px",
              backgroundColor: isRegenerating
                ? "rgba(194, 65, 12, 0.05)"
                : "transparent",
            }}
          >
            <RefreshCw
              size={16}
              className={isRegenerating ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Regenerate Week</span>
          </button>
        </div>

        {/* Weekly Calendar */}
        <WeeklyCalendar activeDay={activeDay} setActiveDay={setActiveDay} />

        {/* Meal Cards */}
        <div className="space-y-4 mb-6">
          <MealCard mealType="Breakfast" meal={currentDayMeals.breakfast} />
          <MealCard mealType="Lunch" meal={currentDayMeals.lunch} />
          <MealCard mealType="Dinner" meal={currentDayMeals.dinner} />
          <MealCard mealType="Snack" meal={currentDayMeals.snack} />
        </div>

        {/* Daily Summary */}
        <DailySummary meals={currentDayMeals} />
      </div>
    </div>
  );
};

export default MealPlan;
