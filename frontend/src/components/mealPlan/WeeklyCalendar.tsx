const DAY_META: Record<string, { label: string; fullLabel: string }> = {
  monday:    { label: "Mon", fullLabel: "Monday" },
  tuesday:   { label: "Tue", fullLabel: "Tuesday" },
  wednesday: { label: "Wed", fullLabel: "Wednesday" },
  thursday:  { label: "Thu", fullLabel: "Thursday" },
  friday:    { label: "Fri", fullLabel: "Friday" },
  saturday:  { label: "Sat", fullLabel: "Saturday" },
  sunday:    { label: "Sun", fullLabel: "Sunday" },
};

interface WeeklyCalendarProps {
  activeDay: string;
  setActiveDay: (day: string) => void;
  availableDays: string[];
}

export function WeeklyCalendar({
  activeDay,
  setActiveDay,
  availableDays,
}: WeeklyCalendarProps) {
  return (
    <div
      className="mb-8 border-b"
      style={{ borderColor: "rgba(113, 113, 122, 0.2)" }}
    >
      <div className="flex overflow-x-auto scrollbar-hide -mb-px">
        {availableDays.map((dayId) => {
          const day = { id: dayId, ...DAY_META[dayId] };
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
