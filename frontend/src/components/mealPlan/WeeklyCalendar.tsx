interface WeeklyCalendarProps {
  activeDay: string;
  setActiveDay: (day: string) => void;
}

const days = [
  { id: "monday", label: "Mon", fullLabel: "Monday" },
  { id: "tuesday", label: "Tue", fullLabel: "Tuesday" },
  { id: "wednesday", label: "Wed", fullLabel: "Wednesday" },
  { id: "thursday", label: "Thu", fullLabel: "Thursday" },
  { id: "friday", label: "Fri", fullLabel: "Friday" },
  { id: "saturday", label: "Sat", fullLabel: "Saturday" },
  { id: "sunday", label: "Sun", fullLabel: "Sunday" },
];

export function WeeklyCalendar({
  activeDay,
  setActiveDay,
}: WeeklyCalendarProps) {
  return (
    <div
      className="mb-8 border-b"
      style={{ borderColor: "rgba(113, 113, 122, 0.2)" }}
    >
      <div className="flex overflow-x-auto scrollbar-hide -mb-px">
        {days.map((day) => {
          const isActive = activeDay === day.id;

          return (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className="flex-shrink-0 px-4 md:px-6 py-3 transition-colors relative"
              style={{
                color: isActive
                  ? "var(--nutritrack-primary)"
                  : "var(--nutritrack-neutral)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span className="hidden sm:inline">{day.fullLabel}</span>
              <span className="sm:hidden">{day.label}</span>

              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "var(--nutritrack-primary)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
