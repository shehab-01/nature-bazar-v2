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
      <div>
        <h1 className="font-display text-5xl">Good afternoon, Soojung</h1>
        <p className="text-muted-foreground mt-1">Sunday, March 15, 2026</p>
      </div>
      <TodaySummary />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TodaysMeals />
        <TodaysWorkout />
      </div>
      <ProgressSnapshot />
      <WeeklyStreak />
    </div>
  );
};

export default Dashboard;
