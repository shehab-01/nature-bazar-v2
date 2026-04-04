"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const MACROS = [
  { name: "Protein", grams: 120, color: "#1D9E75" },
  { name: "Carbs",   grams: 180, color: "#57C9A0" },
  { name: "Fats",    grams: 55,  color: "#A8E6CF" },
];

const TOTAL_KCAL = 1850;

// kcal per gram: protein=4, carbs=4, fats=9
const kcalMap: Record<string, number> = { Protein: 4, Carbs: 4, Fats: 9 };

const data = MACROS.map((m) => ({
  ...m,
  kcal: m.grams * kcalMap[m.name],
}));

const totalMacroKcal = data.reduce((acc, m) => acc + m.kcal, 0);

export function MacroBreakdown() {
  return (
    <div className="bg-white shadow-sm p-6 flex flex-col" style={{ borderRadius: "12px" }}>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
      >
        Macro Breakdown
      </h3>

      {/* Donut chart */}
      <div className="relative h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              dataKey="kcal"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-2xl font-bold leading-none"
            style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
          >
            {TOTAL_KCAL.toLocaleString()}
          </span>
          <span className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            kcal / day
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2.5">
        {data.map((item) => {
          const pct = Math.round((item.kcal / totalMacroKcal) * 100);
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 flex-shrink-0"
                  style={{ backgroundColor: item.color, borderRadius: "50%" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "#374151", fontFamily: "var(--font-inter)" }}
                >
                  {item.name}
                </span>
              </div>
              <span
                className="text-sm"
                style={{ color: "#6B7280", fontFamily: "var(--font-inter)" }}
              >
                {item.grams}g &middot; {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
