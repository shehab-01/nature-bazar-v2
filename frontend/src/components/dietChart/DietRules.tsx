import { CheckCircle2 } from "lucide-react";

const RULES = [
  "Eat every 3–4 hours to keep metabolism active",
  "Prioritize protein at breakfast to stay full longer",
  "Avoid eating after 9 PM",
  "Drink a glass of water before each meal",
  "Track your meals daily to stay accountable",
  "Plan meals ahead to avoid impulsive choices",
];

export function DietRules() {
  return (
    <div className="bg-white shadow-sm p-6 flex flex-col" style={{ borderRadius: "12px" }}>
      <h3
        className="text-lg font-semibold mb-5"
        style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
      >
        General Diet Rules
      </h3>

      <div className="flex flex-col gap-3">
        {RULES.map((rule) => (
          <div key={rule} className="flex items-start gap-3">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
              style={{ color: "#1D9E75" }}
            />
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#374151", fontFamily: "var(--font-inter)" }}
            >
              {rule}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
