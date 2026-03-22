import { useState } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { ExerciseRow } from "./ExerciseRow";

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

interface WorkoutDayCardProps {
  workout: Workout;
  exerciseStates: { [key: string]: boolean };
  setExerciseStates: (states: { [key: string]: boolean }) => void;
}

export function WorkoutDayCard({
  workout,
  exerciseStates,
  setExerciseStates,
}: WorkoutDayCardProps) {
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const toggleExercise = (exerciseId: string) => {
    setExerciseStates({
      ...exerciseStates,
      [exerciseId]: !exerciseStates[exerciseId],
    });
  };

  const allExercisesComplete = workout.exercises.every(
    (ex) => exerciseStates[ex.id],
  );

  const handleMarkComplete = () => {
    setWorkoutComplete(true);
    setTimeout(() => {
      setWorkoutComplete(false);
    }, 2000);
  };

  return (
    <div
      className="bg-white rounded p-6 md:p-8 border"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      {/* Workout Header */}
      <div className="mb-6">
        <h2
          className="text-3xl mb-2"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--nutritrack-text)",
          }}
        >
          {workout.name}
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          <span
            className="text-sm px-3 py-1.5 rounded"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-text)",
              backgroundColor: "var(--nutritrack-highlight)",
              borderRadius: "12px",
            }}
          >
            {workout.type}
          </span>
          <div
            className="flex items-center gap-1.5 text-sm"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-neutral)",
            }}
          >
            <Clock size={16} />
            <span>{workout.duration} min</span>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="mb-6">
        {workout.exercises.map((exercise, index) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            index={index}
            isCompleted={exerciseStates[exercise.id] || false}
            onToggle={() => toggleExercise(exercise.id)}
          />
        ))}
      </div>

      {/* Mark Complete Button */}
      <button
        onClick={handleMarkComplete}
        disabled={!allExercisesComplete || workoutComplete}
        className="px-6 py-3 rounded transition-all"
        style={{
          backgroundColor: allExercisesComplete
            ? "var(--nutritrack-primary)"
            : "rgba(113, 113, 122, 0.3)",
          color: allExercisesComplete ? "white" : "rgba(113, 113, 122, 0.6)",
          fontFamily: "var(--font-sans)",
          borderRadius: "4px",
          cursor: allExercisesComplete ? "pointer" : "not-allowed",
          opacity: workoutComplete ? 0.7 : 1,
        }}
      >
        <span className="flex items-center gap-2 justify-center">
          {workoutComplete ? (
            <>
              <CheckCircle2 size={18} />
              <span>Workout Complete!</span>
            </>
          ) : (
            "Mark Workout Complete"
          )}
        </span>
      </button>

      {!allExercisesComplete && (
        <p
          className="text-sm mt-2"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--nutritrack-neutral)",
          }}
        >
          Complete all exercises to mark workout as done
        </p>
      )}
    </div>
  );
}
