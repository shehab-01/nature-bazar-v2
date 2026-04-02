import { DailyTargets } from "@/components/dietChart/DailyTargets";
import { DietRules } from "@/components/dietChart/DietRules";
import { FoodsToAvoid } from "@/components/dietChart/FoodsToAvoid";
import { FoodsToEat } from "@/components/dietChart/FoodsToEat";
import { HydrationGuide } from "@/components/dietChart/HydrationGuide";
import React from "react";

const DeitChart = () => {
  return (
    <div className="flex-1 pb-20 lg:pb-0">
      <div className="px-6 md:px-6 py-8 md:py-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-5xl">Your Diet Chart</h1>
          <p className="text-muted-foreground mt-1">
            Based on your body measurements and goals.
          </p>
        </div>
        <DailyTargets />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FoodsToEat />
          <FoodsToAvoid />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HydrationGuide />
          <DietRules />
        </div>
      </div>
    </div>
  );
};

export default DeitChart;
