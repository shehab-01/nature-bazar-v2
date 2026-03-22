import { useState } from "react";
import { Plus, Upload } from "lucide-react";

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  displayDate: string;
}

export function PhotoProgress() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([
    { id: "1", url: "", date: "2026-01-13", displayDate: "Jan 13" },
    { id: "2", url: "", date: "2026-02-10", displayDate: "Feb 10" },
    { id: "3", url: "", date: "2026-03-10", displayDate: "Mar 10" },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const today = new Date();
      const displayDate = today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const dateString = today.toISOString().split("T")[0];

      const newPhoto: ProgressPhoto = {
        id: Date.now().toString(),
        url,
        date: dateString,
        displayDate,
      };

      setPhotos([...photos, newPhoto]);
    }
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
        className="text-2xl mb-2"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--nutritrack-text)",
        }}
      >
        Photo Progress
      </h2>
      <p
        className="text-sm mb-6"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--nutritrack-neutral)",
        }}
      >
        Track your visual transformation over time
      </p>

      {/* Photo Timeline */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="flex-shrink-0"
            style={{ width: "160px" }}
          >
            <div
              className="rounded overflow-hidden mb-2 border"
              style={{
                aspectRatio: "3/4",
                borderColor: "rgba(113, 113, 122, 0.2)",
                borderRadius: "6px",
                backgroundColor: photo.url
                  ? "transparent"
                  : "rgba(113, 113, 122, 0.05)",
              }}
            >
              {photo.url ? (
                <img
                  src={photo.url}
                  alt={`Progress photo from ${photo.displayDate}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="text-center"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--nutritrack-neutral)",
                    }}
                  >
                    <Upload size={24} className="mx-auto mb-2 opacity-40" />
                    <div className="text-xs">No photo</div>
                  </div>
                </div>
              )}
            </div>
            <div
              className="text-sm text-center"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-text)",
              }}
            >
              {photo.displayDate}
            </div>
          </div>
        ))}

        {/* Add Photo Button */}
        <div className="flex-shrink-0" style={{ width: "160px" }}>
          <label className="block cursor-pointer">
            <div
              className="rounded overflow-hidden mb-2 border border-dashed flex items-center justify-center transition-all hover:border-solid"
              style={{
                aspectRatio: "3/4",
                borderColor: "var(--nutritrack-primary)",
                borderRadius: "6px",
                backgroundColor: "rgba(194, 65, 12, 0.03)",
              }}
            >
              <div className="text-center">
                <Plus
                  size={32}
                  className="mx-auto mb-2"
                  style={{ color: "var(--nutritrack-primary)" }}
                />
                <div
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "var(--nutritrack-primary)",
                  }}
                >
                  Add Photo
                </div>
              </div>
            </div>
            <div
              className="text-sm text-center"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--nutritrack-neutral)",
              }}
            >
              Upload new
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Info */}
      <div
        className="mt-4 p-3 rounded text-sm"
        style={{
          backgroundColor: "rgba(113, 113, 122, 0.05)",
          borderRadius: "6px",
          fontFamily: "var(--font-sans)",
          color: "var(--nutritrack-neutral)",
        }}
      >
        Tip: Take photos in similar lighting and poses for the most accurate
        comparison
      </div>
    </div>
  );
}
