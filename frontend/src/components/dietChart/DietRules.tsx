import { CheckCircle2 } from "lucide-react";

export function DietRules() {
  const rules = [
    "Eat within an 8-hour window (intermittent fasting)",
    "Avoid processed sugar and artificial sweeteners",
    "Eat protein with every meal to stay full longer",
    "Track your meals daily to stay accountable",
    "Plan your meals ahead to avoid impulsive choices",
  ];

  return (
    <div
      className="bg-white rounded p-6 border"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      <h3
        className="text-xl mb-4"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--nutritrack-text)",
        }}
      >
        General Diet Rules
      </h3>

      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle2
              size={20}
              className="flex-shrink-0 mt-0.5"
              style={{ color: "var(--nutritrack-primary)" }}
            />
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-text)",
              }}
            >
              {rule}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
