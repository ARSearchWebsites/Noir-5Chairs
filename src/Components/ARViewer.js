// src/Components/ARViewer.tsx
import React, { useRef, useEffect } from 'react';
import '@google/model-viewer';           // defines the web component

const ARViewer = ({ modelSrc, productName, autoLaunch = false }) => {
  const viewerRef = useRef(null);

  /* Optional: jump straight into AR once the model finishes loading.
     Works only if the initial navigation came from a user tap/click. */
  useEffect(() => {
    if (!autoLaunch) return;
    const el = viewerRef.current;
    if (!el) return;
    function tryLaunch() {
      // small delay lets <model-viewer> finish internal setup
      setTimeout(() => el.activateAR?.(), 75);
    }
    el.addEventListener('load', tryLaunch);
    return () => el.removeEventListener('load', tryLaunch);
  }, [autoLaunch]);

  return (
    <model-viewer
      ref={viewerRef}
      src={modelSrc}
      alt={`${productName} 3-D model`}
      ar
      /* WebXR first, fall back to Scene Viewer if WebXR unsupported */
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      style={{ width: '100%', height: '600px', background: '#f0f0f0' }}
    >
      {/* Use your own big button instead of the default icon */}
      <button slot="ar-button" className="mt-6 px-8 py-4 rounded bg-primary-blue text-white">
        View in your space
      </button>
    </model-viewer>
  );
};

export default ARViewer;
