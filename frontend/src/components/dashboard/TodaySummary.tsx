import { Flame, Droplet, CheckCircle2 } from "lucide-react";

const stats = [
  {
    label: "Calories Target",
    value: "1,850",
    subtext: "650 remaining",
    icon: Flame,
    accent: "#E50914",
  },
  {
    label: "Water Intake",
    value: "6/8",
    subtext: "glasses",
    icon: Droplet,
    accent: "#1D70E0",
  },
  {
    label: "Workout Today",
    value: "Yes",
    subtext: "Upper Body",
    icon: CheckCircle2,
    accent: "#36A94D",
  },
];

export function TodaySummary() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-[#E5E5E0] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div
              className="rounded-lg p-3 shrink-0"
              style={{ backgroundColor: `${stat.accent}15` }}
            >
              <Icon size={22} style={{ color: stat.accent }} strokeWidth={2} />
            </div>
            <div>
              <div
                className="font-black text-2xl leading-none tracking-tight"
                style={{ color: "#141414" }}
              >
                {stat.value}
              </div>
              <div className="font-semibold text-sm text-[#141414] mt-0.5">
                {stat.label}
              </div>
              <div className="text-xs text-[#757575] mt-0.5">
                {stat.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
