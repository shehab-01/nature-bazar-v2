"use client";

import { Check, Flame } from "lucide-react";

const days = [
  { label: "Mon", completed: true },
  { label: "Tue", completed: true },
  { label: "Wed", completed: true },
  { label: "Thu", completed: true },
  { label: "Fri", completed: false },
  { label: "Sat", completed: false },
  { label: "Sun", completed: false },
];

const completedCount = days.filter((d) => d.completed).length;
const progressPct = Math.round((completedCount / 7) * 100);

export function WeeklyStreak() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E5E0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#E5E5E0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-[#E50914]" />
          <h3 className="font-bold text-base tracking-tight text-[#141414]">
            Weekly Streak
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-black text-lg text-[#E50914] leading-none">
            {completedCount}
          </span>
          <span className="text-xs font-semibold text-[#757575]">
            / 7 days
          </span>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Day circles */}
        <div className="flex justify-between items-end gap-2 mb-5">
          {days.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: day.completed ? "#E50914" : "#F0EFEB",
                  boxShadow: day.completed ? "0 2px 8px rgba(229,9,20,0.25)" : "none",
                }}
              >
                {day.completed ? (
                  <Check size={16} color="white" strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold text-[#AEAEAE]">
                    {day.label.charAt(0)}
                  </span>
                )}
              </div>
              <span
                className="text-xs font-semibold"
                style={{
                  color: day.completed ? "#E50914" : "#AEAEAE",
                }}
              >
                {day.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar with label */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-[#F0EFEB] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#E50914] transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#E50914] shrink-0">
            {progressPct}%
          </span>
        </div>
        <p className="text-xs text-[#757575] font-medium mt-2">
          {completedCount} of 7 days completed this week
        </p>
      </div>
    </div>
  );
}
