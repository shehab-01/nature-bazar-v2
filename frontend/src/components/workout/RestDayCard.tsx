export function RestDayCard() {
  return (
    <div
      className="bg-white rounded p-8 md:p-12 border text-center max-w-2xl mx-auto"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      <div
        className="text-3xl md:text-4xl mb-4"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--nutritrack-text)",
        }}
      >
        Rest Day
      </div>

      <p
        className="text-lg mb-4"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--nutritrack-neutral)",
        }}
      >
        Recovery is part of the plan.
      </p>

      <div
        className="max-w-md mx-auto text-sm leading-relaxed"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--nutritrack-neutral)",
        }}
      >
        Taking rest days allows your muscles to repair and grow stronger. Use
        this time for light stretching, walking, or simply relaxing. Listen to
        your body and prioritize quality sleep.
      </div>
    </div>
  );
}
