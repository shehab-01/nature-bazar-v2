"use client";

import React from "react";
import { TodaySummary } from "@/components/dashboard/TodaySummary";
import { TodaysMeals } from "@/components/dashboard/TodaysMeal";
import { TodaysWorkout } from "@/components/dashboard/TodaysWorkout";
import { ProgressSnapshot } from "@/components/dashboard/ProgressSnapshot";
import { WeeklyStreak } from "@/components/dashboard/WeeklyStreak";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Hero header — Netflix-style bold intro */}
      <div className="pb-2 border-b border-border">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E50914] mb-1">
          Sunday, March 15, 2026
        </p>
        <h1 className="font-sans font-black text-4xl md:text-5xl tracking-tight text-[#141414] leading-none">
          Good afternoon, <span className="text-[#E50914]">Soojung</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-medium">
          Here&apos;s your health overview for today.
        </p>
      </div>

      <TodaySummary />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaysMeals />
        <TodaysWorkout />
      </div>

      <ProgressSnapshot />
      <WeeklyStreak />
    </div>
  );
};

export default Dashboard;
