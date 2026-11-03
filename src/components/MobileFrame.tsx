import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export const toggleBrowserFullscreen = async () => {
  try {
    const doc = document as any;
    const docEl = document.documentElement as any;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    }
  } catch (err) {
    console.warn('Fullscreen toggle failed:', err);
  }
};

interface FullScreenWrapperProps {
  children: React.ReactNode;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const MobileFrame: React.FC<FullScreenWrapperProps> = ({
  children,
  isFullscreen: controlledFullscreen,
  onToggleFullscreen
}) => {
  const [internalFullscreen, setInternalFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setInternalFullscreen(
        !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement)
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const activeFullscreen = controlledFullscreen !== undefined ? controlledFullscreen : internalFullscreen;
  const handleToggle = onToggleFullscreen || toggleBrowserFullscreen;

  return (
    <div className="relative w-full flex-1 flex flex-col min-h-full">
      {/* Floating Native Fullscreen Toggle Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-4 right-4 z-40 p-2.5 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-amber-400/30 shadow-2xl backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-semibold select-none group"
        title={activeFullscreen ? 'Exit Full Screen' : 'Play in Full Screen'}
      >
        {activeFullscreen ? (
          <>
            <Minimize className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Exit Fullscreen</span>
          </>
        ) : (
          <>
            <Maximize className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Full Screen</span>
          </>
        )}
      </button>

      {/* Edge-to-Edge Immersive Game Viewport */}
      <div className="relative w-full flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
