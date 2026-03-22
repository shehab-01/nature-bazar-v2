import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface LogWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: number, date: string, note: string) => void;
}

export function LogWeightModal({
  isOpen,
  onClose,
  onSave,
}: LogWeightModalProps) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setWeight("");
      setNote("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (weight && date) {
      onSave(parseFloat(weight), date, note);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded p-6 max-w-md w-full"
        style={{
          backgroundColor: "var(--nutritrack-bg)",
          borderRadius: "8px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-2xl"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--nutritrack-text)",
            }}
          >
            Log Weight
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-opacity-10 hover:bg-gray-500 rounded transition-colors"
            style={{ borderRadius: "4px" }}
          >
            <X size={20} style={{ color: "var(--nutritrack-neutral)" }} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-text)",
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded border"
              style={{
                borderColor: "rgba(113, 113, 122, 0.3)",
                fontFamily: "var(--font-sans)",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Weight */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-text)",
              }}
            >
              Weight (lbs)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              className="w-full px-4 py-2 rounded border"
              style={{
                borderColor: "rgba(113, 113, 122, 0.3)",
                fontFamily: "var(--font-sans)",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Note (Optional) */}
          <div>
            <label
              className="block text-sm mb-2"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-text)",
              }}
            >
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes about your progress..."
              rows={3}
              className="w-full px-4 py-2 rounded border resize-none"
              style={{
                borderColor: "rgba(113, 113, 122, 0.3)",
                fontFamily: "var(--font-sans)",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded border transition-all"
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
            onClick={handleSave}
            disabled={!weight || !date}
            className="flex-1 px-4 py-2 rounded transition-all"
            style={{
              backgroundColor:
                weight && date
                  ? "var(--nutritrack-primary)"
                  : "rgba(113, 113, 122, 0.3)",
              color: "white",
              fontFamily: "var(--font-sans)",
              borderRadius: "4px",
              cursor: weight && date ? "pointer" : "not-allowed",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
