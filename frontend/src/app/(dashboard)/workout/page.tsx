"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
// import { MealCard } from "@/components/mealPlan/MealCard";
import { WeeklyCalendar } from "@/components/mealPlan/WeeklyCalendar";
import { RestDayCard } from "@/components/workout/RestDayCard";
import { WorkoutDayCard } from "@/components/workout/WorkoutDayCard";

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

interface WeekSchedule {
  [key: string]: Workout | "rest";
}

const weekSchedule: WeekSchedule = {
  monday: {
    name: "Upper Body Strength",
    type: "Strength Training",
    duration: 45,
    exercises: [
      {
        id: "e1",
        name: "Push-ups",
        sets: 3,
        reps: "12-15",
        instructions:
          "Start in a plank position with hands shoulder-width apart. Lower your body until chest nearly touches the floor, then push back up. Keep core engaged throughout.",
        completed: false,
      },
      {
        id: "e2",
        name: "Dumbbell Rows",
        sets: 3,
        reps: "10-12",
        instructions:
          "Bend at hips with a flat back. Pull dumbbell to your side, keeping elbow close to body. Squeeze shoulder blade at the top, then lower with control.",
        completed: false,
      },
      {
        id: "e3",
        name: "Shoulder Press",
        sets: 3,
        reps: "10-12",
        instructions:
          "Stand with dumbbells at shoulder height. Press weights overhead until arms are fully extended. Lower back to shoulders with control.",
        completed: false,
      },
      {
        id: "e4",
        name: "Bicep Curls",
        sets: 3,
        reps: "12-15",
        instructions:
          "Stand with dumbbells at sides, palms facing forward. Curl weights toward shoulders, keeping elbows stationary. Lower slowly to starting position.",
        completed: false,
      },
      {
        id: "e5",
        name: "Tricep Dips",
        sets: 3,
        reps: "10-12",
        instructions:
          "Use a bench or chair. Lower body by bending elbows to 90 degrees, then push back up. Keep shoulders down and core engaged.",
        completed: false,
      },
    ],
  },
  tuesday: {
    name: "Lower Body & Core",
    type: "Strength Training",
    duration: 50,
    exercises: [
      {
        id: "e6",
        name: "Squats",
        sets: 4,
        reps: "12-15",
        instructions:
          "Stand with feet shoulder-width apart. Lower hips back and down as if sitting in a chair. Keep chest up and knees tracking over toes. Push through heels to stand.",
        completed: false,
      },
      {
        id: "e7",
        name: "Lunges",
        sets: 3,
        reps: "10 each leg",
        instructions:
          "Step forward with one leg, lowering hips until both knees are bent at 90 degrees. Push back to starting position. Alternate legs.",
        completed: false,
      },
      {
        id: "e8",
        name: "Glute Bridges",
        sets: 3,
        reps: "15-20",
        instructions:
          "Lie on back with knees bent, feet flat. Lift hips toward ceiling, squeezing glutes at top. Hold briefly, then lower with control.",
        completed: false,
      },
      {
        id: "e9",
        name: "Plank",
        sets: 3,
        reps: "30-60 sec",
        instructions:
          "Hold a plank position on forearms and toes. Keep body in a straight line from head to heels. Engage core and breathe steadily.",
        completed: false,
      },
      {
        id: "e10",
        name: "Russian Twists",
        sets: 3,
        reps: "20 total",
        instructions:
          "Sit with knees bent, leaning back slightly. Rotate torso side to side, touching hands to floor beside hips. Keep core engaged throughout.",
        completed: false,
      },
    ],
  },
  wednesday: "rest",
  thursday: {
    name: "Full Body Circuit",
    type: "Circuit Training",
    duration: 40,
    exercises: [
      {
        id: "e11",
        name: "Burpees",
        sets: 3,
        reps: "10-12",
        instructions:
          "Start standing, drop to plank, do a push-up, jump feet to hands, then jump up with arms overhead. Land softly and repeat.",
        completed: false,
      },
      {
        id: "e12",
        name: "Mountain Climbers",
        sets: 3,
        reps: "20 total",
        instructions:
          "Start in plank position. Alternate bringing knees toward chest in a running motion. Keep hips level and core engaged.",
        completed: false,
      },
      {
        id: "e13",
        name: "Kettlebell Swings",
        sets: 3,
        reps: "15-20",
        instructions:
          "Hinge at hips with kettlebell between legs. Drive hips forward explosively, swinging kettlebell to chest height. Let it swing back down.",
        completed: false,
      },
      {
        id: "e14",
        name: "Jump Squats",
        sets: 3,
        reps: "12-15",
        instructions:
          "Perform a squat, then explode up into a jump. Land softly and immediately go into next squat. Keep chest up throughout.",
        completed: false,
      },
    ],
  },
  friday: {
    name: "Cardio & Flexibility",
    type: "Cardio & Stretching",
    duration: 35,
    exercises: [
      {
        id: "e15",
        name: "Brisk Walk or Jog",
        sets: 1,
        reps: "20 min",
        instructions:
          "Maintain a steady pace that elevates heart rate but allows conversation. Focus on breathing and form.",
        completed: false,
      },
      {
        id: "e16",
        name: "Jumping Jacks",
        sets: 3,
        reps: "30 sec",
        instructions:
          "Jump feet apart while raising arms overhead. Jump back to starting position. Maintain a steady rhythm.",
        completed: false,
      },
      {
        id: "e17",
        name: "Hamstring Stretch",
        sets: 2,
        reps: "30 sec each",
        instructions:
          "Sit with one leg extended, other bent. Reach toward toes of extended leg. Hold stretch without bouncing.",
        completed: false,
      },
      {
        id: "e18",
        name: "Quad Stretch",
        sets: 2,
        reps: "30 sec each",
        instructions:
          "Stand on one leg, pull other foot toward glutes. Keep knees together and hold for time.",
        completed: false,
      },
    ],
  },
  saturday: "rest",
  sunday: {
    name: "Active Recovery",
    type: "Light Activity",
    duration: 30,
    exercises: [
      {
        id: "e19",
        name: "Yoga Flow",
        sets: 1,
        reps: "15 min",
        instructions:
          "Flow through gentle yoga poses like cat-cow, downward dog, and child's pose. Focus on breathing and mobility.",
        completed: false,
      },
      {
        id: "e20",
        name: "Foam Rolling",
        sets: 1,
        reps: "10 min",
        instructions:
          "Roll major muscle groups slowly, pausing on tight spots. Apply moderate pressure and breathe through discomfort.",
        completed: false,
      },
      {
        id: "e21",
        name: "Light Stretching",
        sets: 1,
        reps: "5 min",
        instructions:
          "Gentle full-body stretches, holding each for 20-30 seconds. Focus on areas that feel tight.",
        completed: false,
      },
    ],
  },
};

const Workout = () => {
  const [activeSection, setActiveSection] = useState("workout-plan");
  const [activeDay, setActiveDay] = useState("monday");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [exerciseStates, setExerciseStates] = useState<{
    [key: string]: boolean;
  }>({});

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 1500);
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
          <WeeklyCalendar activeDay={activeDay} setActiveDay={setActiveDay} />

          {/* Workout Content */}
          {currentDayWorkout === "rest" ? (
            <RestDayCard />
          ) : (
            <WorkoutDayCard
              workout={currentDayWorkout}
              exerciseStates={exerciseStates}
              setExerciseStates={setExerciseStates}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Workout;
