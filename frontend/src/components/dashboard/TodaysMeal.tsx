"use client";

import { useState } from "react";
import { ArrowRightLeft, UtensilsCrossed } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: string;
  completed: boolean;
}

export function TodaysMeals() {
  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", name: "Oatmeal with berries & almonds", time: "Breakfast", calories: "350 cal", completed: false },
    { id: "2", name: "Grilled chicken salad", time: "Lunch", calories: "450 cal", completed: false },
    { id: "3", name: "Greek yogurt & honey", time: "Snack", calories: "150 cal", completed: false },
    { id: "4", name: "Salmon with quinoa & veggies", time: "Dinner", calories: "550 cal", completed: false },
  ]);

  const toggleMeal = (id: string) => {
    setMeals(meals.map((meal) =>
      meal.id === id ? { ...meal, completed: !meal.completed } : meal
    ));
  };

  const completedCount = meals.filter((m) => m.completed).length;

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E0] shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#E5E5E0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={16} className="text-[#E50914]" />
          <h3 className="font-bold text-base tracking-tight text-[#141414]">
            Today&apos;s Meals
          </h3>
        </div>
        <span className="text-xs font-semibold text-[#757575] bg-[#F5F5F1] px-2 py-0.5 rounded-full">
          {completedCount}/{meals.length} done
        </span>
      </div>

      {/* Meal list */}
      <div className="px-6 py-4 space-y-1">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className={`flex items-center gap-3 py-2.5 px-2 rounded-md transition-colors cursor-pointer group ${
              meal.completed ? "opacity-60" : "hover:bg-[#F5F5F1]"
            }`}
            onClick={() => toggleMeal(meal.id)}
          >
            <Checkbox.Root
              checked={meal.completed}
              onCheckedChange={() => toggleMeal(meal.id)}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-5 h-5 border-2 rounded transition-all shrink-0"
              style={{
                borderColor: meal.completed ? "#E50914" : "#D0D0D0",
                backgroundColor: meal.completed ? "#E50914" : "transparent",
              }}
            >
              <Checkbox.Indicator>
                <Check size={12} color="white" strokeWidth={3} />
              </Checkbox.Indicator>
            </Checkbox.Root>

            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium leading-tight"
                style={{
                  color: meal.completed ? "#757575" : "#141414",
                  textDecoration: meal.completed ? "line-through" : "none",
                }}
              >
                {meal.name}
              </div>
              <div className="text-xs text-[#757575] mt-0.5">
                {meal.time} &middot; {meal.calories}
              </div>
            </div>

            <button
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-[#E5E5E0] transition-all"
              onClick={(e) => e.stopPropagation()}
              title="Swap meal"
            >
              <ArrowRightLeft size={14} className="text-[#757575]" />
            </button>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-5">
        <div className="w-full h-1 rounded-full bg-[#F0EFEB] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#E50914] transition-all duration-500"
            style={{ width: `${(completedCount / meals.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
