"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus } from "lucide-react";

interface WeightEntry {
  week: number;
  weight: number;
  date: string;
}

interface WeightProgressProps {
  weightData: WeightEntry[];
  startingWeight: number;
  currentWeight: number;
  goalWeight: number;
  onLogWeight: () => void;
}

export function WeightProgress({
  weightData,
  startingWeight,
  currentWeight,
  goalWeight,
  onLogWeight,
}: WeightProgressProps) {
  return (
    <div
      className="bg-white rounded p-6 md:p-8 border mb-6"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h2
          className="text-2xl"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--nutritrack-text)",
          }}
        >
          Weight Progress
        </h2>
        <button
          onClick={onLogWeight}
          className="flex items-center gap-2 px-4 py-2 rounded border transition-all hover:bg-opacity-5"
          style={{
            borderColor: "var(--nutritrack-primary)",
            color: "var(--nutritrack-primary)",
            fontFamily: "var(--font-sans)",
            borderRadius: "4px",
          }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Log Weight</span>
        </button>
      </div>

      {/* Chart */}
      <div className="mb-6" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={weightData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(113, 113, 122, 0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              label={{ value: "Week", position: "insideBottom", offset: -5 }}
              tick={{
                fill: "#71717A",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}
              axisLine={{ stroke: "rgba(113, 113, 122, 0.2)" }}
              tickLine={{ stroke: "rgba(113, 113, 122, 0.2)" }}
            />
            <YAxis
              domain={[150, "dataMax + 5"]}
              label={{
                value: "Weight (lbs)",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{
                fill: "#71717A",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}
              axisLine={{ stroke: "rgba(113, 113, 122, 0.2)" }}
              tickLine={{ stroke: "rgba(113, 113, 122, 0.2)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid rgba(113, 113, 122, 0.2)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
              }}
              labelStyle={{ color: "#18181B", fontWeight: 600 }}
              itemStyle={{ color: "#C2410C" }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#C2410C"
              strokeWidth={2}
              dot={{ fill: "#C2410C", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-4 rounded"
          style={{
            backgroundColor: "rgba(113, 113, 122, 0.05)",
            borderRadius: "6px",
          }}
        >
          <div
            className="text-sm mb-1"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-neutral)",
            }}
          >
            Starting Weight
          </div>
          <div
            className="text-2xl"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--nutritrack-text)",
            }}
          >
            {startingWeight} lbs
          </div>
        </div>

        <div
          className="p-4 rounded"
          style={{
            backgroundColor: "var(--nutritrack-highlight)",
            borderRadius: "6px",
          }}
        >
          <div
            className="text-sm mb-1"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-neutral)",
            }}
          >
            Current Weight
          </div>
          <div
            className="text-2xl"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--nutritrack-primary)",
            }}
          >
            {currentWeight} lbs
          </div>
          <div
            className="text-xs mt-1"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-neutral)",
            }}
          >
            {startingWeight - currentWeight} lbs lost
          </div>
        </div>

        <div
          className="p-4 rounded"
          style={{
            backgroundColor: "rgba(113, 113, 122, 0.05)",
            borderRadius: "6px",
          }}
        >
          <div
            className="text-sm mb-1"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-neutral)",
            }}
          >
            Goal Weight
          </div>
          <div
            className="text-2xl"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--nutritrack-text)",
            }}
          >
            {goalWeight} lbs
          </div>
          <div
            className="text-xs mt-1"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-neutral)",
            }}
          >
            {currentWeight - goalWeight} lbs to go
          </div>
        </div>
      </div>
    </div>
  );
}
