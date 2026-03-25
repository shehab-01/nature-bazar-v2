"use client";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { WeeklyCalendar } from "@/components/mealPlan/WeeklyCalendar";
import { RestDayCard } from "@/components/workout/RestDayCard";
import { WorkoutDayCard } from "@/components/workout/WorkoutDayCard";
import { workout as workoutApi } from "@/app/lib/api";

const USER_ID = "00000000-0000-0000-0000-000000000001";
const WEEK_START = "2026-03-23";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  instructions: string;
  completed: boolean;
}

interface Workout {
  name: string;
  type: string;
  duration: number;
  exercises: Exercise[];
}

type DaySchedule = Workout | "rest";

const WorkoutPage = () => {
  const [activeDay, setActiveDay] = useState("monday");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [weekSchedule, setWeekSchedule] = useState<Record<string, DaySchedule>>({});
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [exerciseStates, setExerciseStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const days = await workoutApi.getWeekPlan(USER_ID, WEEK_START);
        const schedule: Record<string, DaySchedule> = {};
        const active: string[] = [];

        days.forEach((day) => {
          const key = day.day_name.toLowerCase();
          active.push(key);
          if (day.is_rest_day || day.sessions.length === 0) {
            schedule[key] = "rest";
          } else {
            const session = day.sessions[0];
            schedule[key] = {
              name: session.session_name,
              type: session.category,
              duration: session.duration,
              exercises: session.exercises.map((ex, idx) => ({
                id: `${key}-${idx}`,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                instructions: "",
                completed: ex.completed,
              })),
            };
          }
        });

        setWeekSchedule(schedule);
        setAvailableDays(active);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), 1500);
  };

  const currentDayWorkout = weekSchedule[activeDay];

  return (
    <div>
      <div className="flex-1 pb-20 lg:pb-0">
        <div className="px-6 md:px-12 py-8 md:py-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1
                className="text-4xl md:text-5xl mb-2"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--nutritrack-text)",
                }}
              >
                Workout Plan
              </h1>
              <p
                className="text-lg"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--nutritrack-neutral)",
                }}
              >
                Your personalized weekly workout schedule
              </p>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-4 py-2 rounded border transition-all hover:bg-opacity-5"
              style={{
                borderColor: "var(--nutritrack-primary)",
                color: "var(--nutritrack-primary)",
                fontFamily: "var(--font-sans)",
                borderRadius: "4px",
                backgroundColor: isRegenerating
                  ? "rgba(194, 65, 12, 0.05)"
                  : "transparent",
              }}
            >
              <RefreshCw
                size={16}
                className={isRegenerating ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Regenerate Plan</span>
            </button>
          </div>

          {/* Weekly Calendar */}
          <WeeklyCalendar
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            availableDays={availableDays}
          />

          {/* Workout Content */}
          {loading ? (
            <div
              className="text-center py-12"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-neutral)",
              }}
            >
              Loading workout plan...
            </div>
          ) : currentDayWorkout === "rest" ? (
            <RestDayCard />
          ) : currentDayWorkout ? (
            <WorkoutDayCard
              workout={currentDayWorkout}
              exerciseStates={exerciseStates}
              setExerciseStates={setExerciseStates}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPage;
