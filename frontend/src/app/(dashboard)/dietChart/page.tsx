import { RefreshCw } from "lucide-react";
import { DailyTargets }     from "@/components/dietChart/DailyTargets";
import { MacroBreakdown }   from "@/components/dietChart/MacroBreakdown";
import { MealCalorieSplit } from "@/components/dietChart/MealCalorieSplit";
import { MealTimingGuide }  from "@/components/dietChart/MealTimingGuide";
import { FoodsToEat }       from "@/components/dietChart/FoodsToEat";
import { FoodsToAvoid }     from "@/components/dietChart/FoodsToAvoid";
import { HydrationGuide }   from "@/components/dietChart/HydrationGuide";
import { DietRules }        from "@/components/dietChart/DietRules";

export default function DietChartPage() {
  return (
    <div className="flex-1 pb-20 lg:pb-0" style={{ backgroundColor: "#F5F5F0" }}>
      <div className="max-w-300 mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1
              className="text-[32px] font-bold leading-tight"
              style={{ fontFamily: "var(--font-playfair)", color: "#111827" }}
            >
              Your Diet Chart
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "#6B7280", fontFamily: "var(--font-inter)" }}
            >
              Personalized based on your body measurements and goals.
            </p>
          </div>

          {/* Generated badge + Regenerate button */}
          <div className="flex items-center gap-2 sm:mt-1 shrink-0">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5"
              style={{
                backgroundColor: "#E1F5EE",
                color: "#0F6E56",
                borderRadius: "99px",
                fontFamily: "var(--font-inter)",
              }}
            >
              Generated March 15, 2026
            </span>
            <button
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              style={{
                borderRadius: "8px",
                color: "#374151",
                fontFamily: "var(--font-inter)",
              }}
            >
              <RefreshCw size={13} />
              Regenerate
            </button>
          </div>
        </div>

        {/* ── Section 1: Daily Targets ── */}
        <DailyTargets />

        {/* ── Section 2: Macro Breakdown + Meal Calorie Split ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MacroBreakdown />
          <MealCalorieSplit />
        </div>

        {/* ── Section 3: Meal Timing Guide ── */}
        <MealTimingGuide />

        {/* ── Section 4: Foods to Eat / Foods to Avoid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FoodsToEat />
          <FoodsToAvoid />
        </div>

        {/* ── Section 5: Hydration + General Rules ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HydrationGuide />
          <DietRules />
        </div>

      </div>
    </div>
  );
}
