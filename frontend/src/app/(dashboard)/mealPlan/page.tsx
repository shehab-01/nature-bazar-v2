"use client";

import { DailySummary } from "@/components/mealPlan/DailySummary";
import { MealCard } from "@/components/mealPlan/MealCard";
import { WeeklyCalendar } from "@/components/mealPlan/WeeklyCalendar";
import { mealPlan, MealEntry, WeekMealPlan } from "@/app/lib/api";
import { RefreshCw } from "lucide-react";
import React, { useState, useEffect } from "react";

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

function toMeal(entry: MealEntry): Meal {
  return {
    id: entry.entry_id,
    name: entry.recipe_name,
    description: entry.recipe_description,
    calories: entry.calories,
    protein: entry.protein_g,
    carbs: entry.carbs_g,
    fats: entry.fat_g,
  };
}

function buildWeekMeals(plan: WeekMealPlan): Record<string, DayMeals> {
  const result: Record<string, Record<string, Meal>> = {};
  for (const entry of plan.entries) {
    const day = entry.day_name;
    if (!result[day]) result[day] = {};
    result[day][entry.meal_type] = toMeal(entry);
  }
  return result as unknown as Record<string, DayMeals>;
}

// Hardcoded for now
const USER_ID = "00000000-0000-0000-0000-000000000001";
const WEEK_START = "2026-03-23";

const MealPlan = () => {
  const [activeDay, setActiveDay] = useState("monday");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [weekMeals, setWeekMeals] = useState<Record<string, DayMeals> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const data = await mealPlan.getWeekPlan(USER_ID, WEEK_START);
        const built = buildWeekMeals(data);
        setWeekMeals(built);
        const firstDay = Object.keys(built)[0];
        if (firstDay) setActiveDay(firstDay);
      } catch (err) {
        console.error("Failed to fetch meal plan:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealPlan();
  }, []);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 1500);
  };

  const availableDays = weekMeals ? Object.keys(weekMeals) : [];
  console.log(availableDays)
  const currentDayMeals = weekMeals?.[activeDay];

  return (
    <div className="flex-1 pb-20 lg:pb-0">
      <div className="px-6 md:px-6 py-8 md:py-6 max-w-7xl mx-auto">
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
        <WeeklyCalendar activeDay={activeDay} setActiveDay={setActiveDay} availableDays={availableDays} />

        {isLoading && (
          <p
            className="text-center py-12"
            style={{ color: "var(--nutritrack-neutral)" }}
          >
            Loading meal plan...
          </p>
        )}

        {!isLoading && currentDayMeals && (
          <>
            {/* Meal Cards */}
            <div className="space-y-4 mb-6">
              <MealCard mealType="Breakfast" meal={currentDayMeals.breakfast} />
              <MealCard mealType="Lunch" meal={currentDayMeals.lunch} />
              <MealCard mealType="Dinner" meal={currentDayMeals.dinner} />
              <MealCard mealType="Snack" meal={currentDayMeals.snack} />
            </div>

            {/* Daily Summary */}
            <DailySummary meals={currentDayMeals} />
          </>
        )}
      </div>
    </div>
  );
};

export default MealPlan;
