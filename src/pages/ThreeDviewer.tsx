import React, { useMemo } from "react";

const ThreeDViewerPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const src = params.get("src") ?? "";
  const productName = params.get("name") ?? "3D View";

  const safeSrc = useMemo(() => {
    // Basic guard: only allow http(s) iframes (optional but recommended)
    if (!src) return "";
    try {
      const u = new URL(src);
      if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
      return "";
    } catch {
      return "";
    }
  }, [src]);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white">
        <div className="text-lg font-semibold truncate">{productName}</div>

        <div className="flex gap-2">
          <button
            onClick={() => window.close()}
            className="px-5 py-3 rounded bg-white text-black font-semibold"
            title="Close this window"
          >
            Close
          </button>

          {/* Fallback if window.close() is blocked 
          <a
            href="/"
            className="px-5 py-3 rounded border border-white text-white font-semibold"
            title="Go back"
          >
            Back
          </a>
          */}
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 flex items-center justify-center p-3">
        {safeSrc ? (
          <iframe
            title="3D Model"
            src={safeSrc}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
            className="w-[95vw] h-[80vh] max-w-[1200px] rounded"
            frameBorder={0}
          />
        ) : (
          <div className="text-white p-6 text-center">
            Invalid or missing 3D source URL.
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeDViewerPage;
