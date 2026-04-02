import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown } from "lucide-react";

const weightData = [
  { week: "Week 1", weight: 75 },
  { week: "Week 2", weight: 74.2 },
  { week: "Week 3", weight: 73.5 },
  { week: "Week 4", weight: 72.8 },
];

const stats = [
  { label: "Current Weight", value: "72.8 kg", highlight: true },
  { label: "Starting Weight", value: "75.0 kg", highlight: false },
  { label: "Goal Weight", value: "68.0 kg", highlight: false },
];

export function ProgressSnapshot() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E5E0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#E5E5E0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown size={16} className="text-[#E50914]" />
          <h3 className="font-bold text-base tracking-tight text-[#141414]">
            Progress Snapshot
          </h3>
        </div>
        <span className="text-xs font-semibold text-[#36A94D] bg-[#36A94D]/10 px-2 py-0.5 rounded-full">
          ↓ 2.2 kg lost
        </span>
      </div>

      {/* Chart */}
      <div className="px-6 pt-5 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weightData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F0EFEB"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: "#757575", fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[70, 76]}
              tick={{ fill: "#757575", fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E5E0",
                borderRadius: "6px",
                fontFamily: "var(--font-inter)",
                fontSize: "12px",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              cursor={{ stroke: "#E50914", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#E50914"
              strokeWidth={2.5}
              dot={{ fill: "#E50914", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#E50914", strokeWidth: 2, stroke: "white" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-[#E5E5E0] border-t border-[#E5E5E0] mt-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white px-4 py-4 text-center"
          >
            <div
              className="font-black text-xl tracking-tight leading-none"
              style={{ color: stat.highlight ? "#E50914" : "#141414" }}
            >
              {stat.value}
            </div>
            <div className="text-xs text-[#757575] font-medium mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
