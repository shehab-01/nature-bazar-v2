import { useState } from "react";
import { Info, Check } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  instructions: string;
  completed: boolean;
}

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
}

export function ExerciseRow({
  exercise,
  index,
  isCompleted,
  onToggle,
}: ExerciseRowProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div>
      <div
        className="flex items-center gap-3 py-3 px-4 transition-colors"
        style={{
          backgroundColor:
            index % 2 === 0 ? "transparent" : "rgba(113, 113, 122, 0.03)",
        }}
      >
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-5 h-5 rounded border transition-all flex items-center justify-center"
          style={{
            borderColor: isCompleted
              ? "var(--nutritrack-primary)"
              : "rgba(113, 113, 122, 0.3)",
            backgroundColor: isCompleted
              ? "var(--nutritrack-primary)"
              : "transparent",
            borderRadius: "3px",
          }}
        >
          {isCompleted && <Check size={14} style={{ color: "white" }} />}
        </button>

        {/* Exercise Name */}
        <div
          className="flex-1"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--nutritrack-text)",
            textDecoration: isCompleted ? "line-through" : "none",
            opacity: isCompleted ? 0.6 : 1,
          }}
        >
          {exercise.name}
        </div>

        {/* Sets x Reps */}
        <div
          className="text-sm flex-shrink-0"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--nutritrack-neutral)",
            minWidth: "80px",
            textAlign: "right",
          }}
        >
          {exercise.sets} × {exercise.reps}
        </div>

        {/* Info Icon */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex-shrink-0 p-1.5 hover:bg-opacity-10 hover:bg-gray-500 rounded transition-colors"
          style={{ borderRadius: "4px" }}
          aria-label="View instructions"
        >
          <Info
            size={18}
            style={{
              color: showInstructions
                ? "var(--nutritrack-primary)"
                : "var(--nutritrack-neutral)",
            }}
          />
        </button>
      </div>

      {/* Instructions Expansion */}
      {showInstructions && (
        <div
          className="px-4 py-3 ml-8 mr-4 mb-2 rounded"
          style={{
            backgroundColor: "var(--nutritrack-highlight)",
            borderRadius: "6px",
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--nutritrack-text)",
            }}
          >
            {exercise.instructions}
          </p>
        </div>
      )}
    </div>
  );
}
