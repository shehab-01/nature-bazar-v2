import { useState } from "react";
import { Pencil } from "lucide-react";

interface Measurement {
  id: string;
  name: string;
  current: number;
  starting: number;
  unit: string;
}

export function BodyMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([
    { id: "waist", name: "Waist", current: 34, starting: 38, unit: "in" },
    { id: "hips", name: "Hips", current: 40, starting: 42, unit: "in" },
    { id: "chest", name: "Chest", current: 38, starting: 40, unit: "in" },
    { id: "arms", name: "Arms", current: 13, starting: 14, unit: "in" },
    { id: "thighs", name: "Thighs", current: 22, starting: 24, unit: "in" },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (measurement: Measurement) => {
    setEditingId(measurement.id);
    setEditValue(measurement.current.toString());
  };

  const handleSave = (id: string) => {
    setMeasurements(
      measurements.map((m) =>
        m.id === id ? { ...m, current: parseFloat(editValue) } : m,
      ),
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div
      className="bg-white rounded p-6 md:p-8 border mb-6"
      style={{
        borderColor: "rgba(113, 113, 122, 0.2)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      {/* Header */}
      <h2
        className="text-2xl mb-6"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--nutritrack-text)",
        }}
      >
        Body Measurements
      </h2>

      {/* Measurements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {measurements.map((measurement) => {
          const isEditing = editingId === measurement.id;
          const change = measurement.starting - measurement.current;

          return (
            <div
              key={measurement.id}
              className="p-4 rounded border"
              style={{
                borderColor: "rgba(113, 113, 122, 0.15)",
                borderRadius: "6px",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "var(--nutritrack-neutral)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {measurement.name}
                </div>
                {!isEditing && (
                  <button
                    onClick={() => handleEdit(measurement)}
                    className="p-1.5 hover:bg-opacity-10 hover:bg-gray-500 rounded transition-colors"
                    style={{ borderRadius: "4px" }}
                  >
                    <Pencil
                      size={14}
                      style={{ color: "var(--nutritrack-neutral)" }}
                    />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.5"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 rounded border text-sm"
                      style={{
                        borderColor: "rgba(113, 113, 122, 0.3)",
                        fontFamily: "var(--font-sans)",
                        borderRadius: "4px",
                      }}
                      autoFocus
                    />
                    <span
                      className="flex items-center text-sm"
                      style={{
                        fontFamily: "var(--font-sans)",
                        color: "var(--nutritrack-neutral)",
                      }}
                    >
                      {measurement.unit}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-3 py-1.5 rounded border text-sm transition-all"
                      style={{
                        borderColor: "rgba(113, 113, 122, 0.3)",
                        color: "var(--nutritrack-neutral)",
                        fontFamily: "var(--font-sans)",
                        borderRadius: "4px",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(measurement.id)}
                      className="flex-1 px-3 py-1.5 rounded text-sm transition-all"
                      style={{
                        backgroundColor: "var(--nutritrack-primary)",
                        color: "white",
                        fontFamily: "var(--font-sans)",
                        borderRadius: "4px",
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <div
                    className="text-2xl"
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "var(--nutritrack-text)",
                    }}
                  >
                    {measurement.current} {measurement.unit}
                  </div>
                  <div
                    className="text-sm"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--nutritrack-neutral)",
                    }}
                  >
                    from {measurement.starting} {measurement.unit}
                  </div>
                </div>
              )}

              {!isEditing && change > 0 && (
                <div
                  className="text-sm mt-2 px-2 py-1 rounded inline-block"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "var(--nutritrack-primary)",
                    backgroundColor: "var(--nutritrack-highlight)",
                    borderRadius: "4px",
                  }}
                >
                  -{change} {measurement.unit}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
