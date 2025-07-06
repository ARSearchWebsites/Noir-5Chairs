// src/components/ModelViewer.tsx
import React, { useRef, useEffect, useState } from 'react';
import '@google/model-viewer';

interface ModelViewerProps {
  id?: string;
  src: string;
  alt: string;
  ar?: boolean;
  arModes?: string;
  cameraControls?: boolean;
  autoRotate?: boolean;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onArStatus?: (event: CustomEvent) => void;
  onCameraChange?: (event: CustomEvent) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  id = "ar-model",
  src,
  alt = "3D model of an office chair",
  ar = true,
  arModes = "webxr scene-viewer quick-look",
  cameraControls = true,
  autoRotate = true,
  poster,
  className,
  style,
  onLoad,
  onError,
  onArStatus,
  onCameraChange
}) => {
  const modelRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const modelViewer = modelRef.current;
    
    if (modelViewer) {
      const handleLoad = () => {
        console.log('3D Model loaded successfully');
        setIsLoading(false);
        setHasError(false);
        onLoad?.();
      };
      
      const handleError = (event: any) => {
        console.error('3D Model failed to load:', event);
        setIsLoading(false);
        setHasError(true);
        onError?.(event);
      };

      const handleArStatus = (event: any) => {
        console.log('AR Status changed:', event.detail);
        onArStatus?.(event);
      };

      const handleCameraChange = (event: any) => {
        console.log('Camera changed:', event.detail);
        onCameraChange?.(event);
      };
      
      // Add event listeners
      modelViewer.addEventListener('load', handleLoad);
      modelViewer.addEventListener('error', handleError);
      modelViewer.addEventListener('ar-status', handleArStatus);
      modelViewer.addEventListener('camera-change', handleCameraChange);
      
      return () => {
        modelViewer.removeEventListener('load', handleLoad);
        modelViewer.removeEventListener('error', handleError);
        modelViewer.removeEventListener('ar-status', handleArStatus);
        modelViewer.removeEventListener('camera-change', handleCameraChange);
      };
    }
  }, [onLoad, onError, onArStatus, onCameraChange]);

  // Method to get camera position (useful for debugging)
  const getCameraPosition = () => {
    const modelViewer = modelRef.current as any;
    if (modelViewer && modelViewer.getCameraOrbit) {
      return modelViewer.getCameraOrbit();
    }
    return null;
  };

  // Method to reset camera
  const resetCamera = () => {
    const modelViewer = modelRef.current as any;
    if (modelViewer && modelViewer.resetTurntableRotation) {
      modelViewer.resetTurntableRotation();
    }
  };

  return (
    <div className={`model-viewer-container ${className || ''}`} style={style}>
      {isLoading && (
        <div className="model-viewer-loading">
          <div className="loading-spinner"></div>
          <p>Loading 3D model...</p>
        </div>
      )}
      
      {hasError && (
        <div className="model-viewer-error">
          <p>Failed to load 3D model. Please check the file path.</p>
        </div>
      )}
      
      {React.createElement('model-viewer', {
        ref: modelRef,
        id,
        src,
        alt,
        ar: ar,
        'ar-modes': arModes,
        'camera-controls': cameraControls,
        'auto-rotate': autoRotate,
        poster: poster,
        style: {
          width: '100%',
          height: '100%',
          display: hasError ? 'none' : 'block'
        }
      })}
      
      {/* Optional controls */}
      <div className="model-viewer-controls">
        <button onClick={resetCamera} className="control-button">
          Reset Camera
        </button>
        <button onClick={() => console.log(getCameraPosition())} className="control-button">
          Log Camera Position
        </button>
      </div>
    </div>
  );
};

export default ModelViewer;