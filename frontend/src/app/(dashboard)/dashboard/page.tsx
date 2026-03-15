import React from "react";
import { TodaySummary } from "@/components/dashboard/TodaySummary";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display text-5xl">Good afternoon, Alex</h1>
        <p className="text-muted-foreground mt-1">Sunday, March 15, 2026</p>
      </div>
      <TodaySummary />
    </div>
  );
};

export default Dashboard;
