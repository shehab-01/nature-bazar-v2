import { Clock, Dumbbell, Play } from "lucide-react";

const exercises = [
  "Bench Press — 3 sets × 10 reps",
  "Dumbbell Rows — 3 sets × 12 reps",
  "Shoulder Press — 3 sets × 10 reps",
  "Bicep Curls — 3 sets × 12 reps",
  "Tricep Extensions — 3 sets × 12 reps",
];

export function TodaysWorkout() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E5E0] shadow-sm overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#E5E5E0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={16} className="text-[#E50914]" />
          <h3 className="font-bold text-base tracking-tight text-[#141414]">
            Today&apos;s Workout
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#757575]">
          <div className="flex items-center gap-1">
            <Dumbbell size={12} />
            <span className="font-medium">Upper Body</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span className="font-medium">45 min</span>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-6 py-4 space-y-2 flex-1">
        {exercises.map((exercise, index) => (
          <div
            key={index}
            className="flex items-center gap-3 py-1.5 group"
          >
            <div className="w-5 h-5 rounded-full border-2 border-[#E5E5E0] flex items-center justify-center shrink-0 group-hover:border-[#E50914] transition-colors">
              <span className="text-[10px] font-bold text-[#757575] group-hover:text-[#E50914] transition-colors">
                {index + 1}
              </span>
            </div>
            <span className="text-sm text-[#141414] font-medium">{exercise}</span>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <div className="px-6 pb-5 pt-2">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#E50914] text-white font-bold text-sm hover:bg-[#cc0812] active:scale-[0.98] transition-all duration-150 shadow-sm">
          <Play size={14} fill="white" />
          Start Workout
        </button>
      </div>
    </div>
  );
}
