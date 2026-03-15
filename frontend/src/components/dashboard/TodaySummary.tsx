import { Flame, Droplet, CheckCircle2 } from "lucide-react";

export function TodaySummary() {
  const stats = [
    {
      label: "Calories Target",
      value: "1,850",
      subtext: "650 remaining",
      icon: Flame,
    },
    {
      label: "Water Intake",
      value: "6/8",
      subtext: "glasses",
      icon: Droplet,
    },
    {
      label: "Workout Today",
      value: "Yes",
      subtext: "Upper Body",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-start gap-4">
              <div className="rounded bg-primary/10 p-2">
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-display mb-1 text-2xl text-foreground">
                  {stat.value}
                </div>
                <div className="mb-0.5 text-sm text-foreground">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
