"use client";

import { BodyMeasurements } from "@/components/progress/BodyMeasurements";
import { LogWeightModal } from "@/components/progress/LogWeightModal";
import { PhotoProgress } from "@/components/progress/PhotoProgress";
import { WeeklyAdherence } from "@/components/progress/WeeklyAdherence";
import { WeightProgress } from "@/components/progress/WeightProgress";
import { useState } from "react";

export interface WeightEntry {
  week: number;
  weight: number;
  date: string;
}

const Progress = () => {
  const [activeSection, setActiveSection] = useState("progress");
  const [isLogWeightOpen, setIsLogWeightOpen] = useState(false);
  const [weightData, setWeightData] = useState<WeightEntry[]>([
    { week: 1, weight: 180, date: "2026-01-13" },
    { week: 2, weight: 178, date: "2026-01-20" },
    { week: 3, weight: 177, date: "2026-01-27" },
    { week: 4, weight: 175, date: "2026-02-03" },
    { week: 5, weight: 174, date: "2026-02-10" },
    { week: 6, weight: 172, date: "2026-02-17" },
    { week: 7, weight: 171, date: "2026-02-24" },
    { week: 8, weight: 170, date: "2026-03-03" },
    { week: 9, weight: 169, date: "2026-03-10" },
  ]);

  const handleLogWeight = (weight: number, date: string, note: string) => {
    const newEntry: WeightEntry = {
      week: weightData.length + 1,
      weight,
      date,
    };
    setWeightData([...weightData, newEntry]);
  };
  const startingWeight = weightData[0]?.weight || 180;
  const currentWeight = weightData[weightData.length - 1]?.weight || 169;
  const goalWeight = 160;

  return (
    <div>
      <div className="flex-1 pb-20 lg:pb-0">
        <div className="px-6 md:px-12 py-8 md:py-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-4xl md:text-5xl mb-2"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--nutritrack-text)",
              }}
            >
              Progress Tracker
            </h1>
            <p
              className="text-lg"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-neutral)",
              }}
            >
              Track your journey and celebrate your progress
            </p>
          </div>

          {/* Weight Progress Section */}
          <WeightProgress
            weightData={weightData}
            startingWeight={startingWeight}
            currentWeight={currentWeight}
            goalWeight={goalWeight}
            onLogWeight={() => setIsLogWeightOpen(true)}
          />

          {/* Body Measurements Section */}
          <BodyMeasurements />

          {/* Weekly Adherence Section */}
          <WeeklyAdherence />

          {/* Photo Progress Section */}
          <PhotoProgress />
        </div>
        <LogWeightModal
          isOpen={isLogWeightOpen}
          onClose={() => setIsLogWeightOpen(false)}
          onSave={handleLogWeight}
        />
      </div>
    </div>
  );
};

export default Progress;
