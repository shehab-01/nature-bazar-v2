import { Droplet } from "lucide-react";

const TOTAL_GLASSES = 8;
const FILLED_GLASSES = 5; // visual placeholder — replace with real tracking data

export function HydrationGuide() {
  return (
    <div className="bg-white shadow-sm p-6 flex flex-col" style={{ borderRadius: "12px" }}>
      {/* Header row */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center w-12 h-12 shrink-0"
          style={{ backgroundColor: "#E1F5EE", borderRadius: "12px" }}
        >
          <Droplet size={22} style={{ color: "#1D9E75" }} />
        </div>
        <div>
          <h3
            className="text-lg font-semibold leading-tight"
            style={{ color: "#111827", fontFamily: "var(--font-inter)" }}
          >
            Daily Hydration Target
          </h3>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className="text-3xl font-bold leading-none"
              style={{ color: "#1D9E75", fontFamily: "var(--font-inter)" }}
            >
              2.5 L
            </span>
            <span
              className="text-sm"
              style={{ color: "#9CA3AF", fontFamily: "var(--font-inter)" }}
            >
              · 8–10 glasses / day
            </span>
          </div>
        </div>
      </div>

      {/* Subtext */}
      <p
        className="text-sm leading-relaxed mb-5"
        style={{ color: "#6B7280", fontFamily: "var(--font-inter)" }}
      >
        Drink a glass before each meal and after waking up. Staying hydrated boosts
        metabolism and helps control appetite throughout the day.
      </p>

      {/* Water glass icons */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: TOTAL_GLASSES }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-end w-7 h-9 border-2 overflow-hidden"
            style={{
              borderColor: i < FILLED_GLASSES ? "#1D9E75" : "#D1D5DB",
              borderRadius: "4px 4px 6px 6px",
              position: "relative",
            }}
          >
            {/* Fill level */}
            {i < FILLED_GLASSES && (
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{ height: "70%", backgroundColor: "#E1F5EE" }}
              />
            )}
            {/* Drop icon centered */}
            <Droplet
              size={12}
              className="relative z-10 mb-0.5"
              style={{ color: i < FILLED_GLASSES ? "#1D9E75" : "#9CA3AF" }}
            />
          </div>
        ))}
      </div>
      <p
        className="text-xs mt-2"
        style={{ color: "#9CA3AF", fontFamily: "var(--font-inter)" }}
      >
        {FILLED_GLASSES} of {TOTAL_GLASSES} glasses today
      </p>
    </div>
  );
}
