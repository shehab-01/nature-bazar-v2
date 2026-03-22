import { Droplet } from "lucide-react";

export function HydrationGuide() {
  return (
    <div
      className="bg-white rounded p-6 border"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="p-3 rounded"
          style={{ backgroundColor: "var(--nutritrack-highlight)" }}
        >
          <Droplet size={24} style={{ color: "var(--nutritrack-primary)" }} />
        </div>
        <div>
          <h3
            className="text-xl mb-1"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--nutritrack-text)",
            }}
          >
            Hydration Guide
          </h3>
          <div
            className="text-3xl"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--nutritrack-primary)",
            }}
          >
            2.5 L
            <span
              className="text-base ml-2"
              style={{
                color: "var(--nutritrack-neutral)",
                fontFamily: "var(--font-sans)",
              }}
            >
              per day
            </span>
          </div>
        </div>
      </div>

      <p
        className="text-sm leading-relaxed"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--nutritrack-neutral)",
        }}
      >
        Based on your activity level and weight loss goals, aim to drink at
        least 2.5 liters of water daily. This helps boost metabolism, control
        appetite, and support fat loss. Drink a glass before each meal and keep
        a water bottle with you throughout the day.
      </p>
    </div>
  );
}
