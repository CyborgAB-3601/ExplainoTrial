import React, { useState, useRef, useEffect } from 'react';
import { Check, X, RotateCcw, Crosshair } from 'lucide-react';
import { ScreenROI, saveASLROI } from './aslVisionService';

interface ASLAreaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAreaSaved: (roi: ScreenROI) => void;
  currentROI: ScreenROI | null;
}

export const ASLAreaSelector: React.FC<ASLAreaSelectorProps> = ({
  isOpen,
  onClose,
  onAreaSaved,
  currentROI,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(
    currentROI
      ? { x: currentROI.x, y: currentROI.y, w: currentROI.width, h: currentROI.height }
      : null
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard shortcut: ESC to cancel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    // If clicking on control buttons, ignore
    if ((e.target as HTMLElement).closest('.selector-controls')) return;

    setIsDrawing(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setCurrentBox({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !startPoint) return;

    const x = Math.min(startPoint.x, e.clientX);
    const y = Math.min(startPoint.y, e.clientY);
    const w = Math.abs(e.clientX - startPoint.x);
    const h = Math.abs(e.clientY - startPoint.y);

    setCurrentBox({ x, y, w, h });
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const handleConfirm = () => {
    if (!currentBox || currentBox.w < 20 || currentBox.h < 20) {
      onClose();
      return;
    }

    const roi: ScreenROI = {
      x: Math.round(currentBox.x),
      y: Math.round(currentBox.y),
      width: Math.round(currentBox.w),
      height: Math.round(currentBox.h),
      isCustom: true,
      label: 'Custom Selected Area',
    };

    saveASLROI(roi);
    onAreaSaved(roi);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="fixed inset-0 z-[10000] cursor-crosshair select-none bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      {/* ── TOP GUIDANCE PILL ── */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#1E1926]/95 text-white px-5 py-2.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-purple-500/40 flex items-center gap-3 text-xs font-bold pointer-events-auto">
        <Crosshair className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Click & drag a rectangle on screen to select ASL vision target</span>
        <span className="text-[10px] text-purple-300 bg-white/10 px-2 py-0.5 rounded-md font-mono">
          Saved once • Smart auto-used every time
        </span>
        <button
          onClick={onClose}
          className="ml-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── DRAWING RECTANGLE SELECTION BOX ── */}
      {currentBox && currentBox.w > 5 && currentBox.h > 5 && (
        <div
          style={{
            left: `${currentBox.x}px`,
            top: `${currentBox.y}px`,
            width: `${currentBox.w}px`,
            height: `${currentBox.h}px`,
          }}
          className="absolute border-2 border-purple-500 bg-purple-500/15 shadow-[0_0_30px_rgba(168,85,247,0.35)] rounded-xl pointer-events-none transition-none"
        >
          {/* Corner target reticles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-purple-400 border border-white rounded-full shadow-sm" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-purple-400 border border-white rounded-full shadow-sm" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-purple-400 border border-white rounded-full shadow-sm" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-purple-400 border border-white rounded-full shadow-sm" />

          {/* Size Dimension Badge */}
          <div className="absolute -top-7 left-2 bg-purple-900/90 text-purple-200 text-[10px] font-mono px-2 py-0.5 rounded-md border border-purple-400/40 shadow-xs">
            {Math.round(currentBox.w)} × {Math.round(currentBox.h)} px
          </div>

          {/* Controls Bar */}
          {!isDrawing && (
            <div className="selector-controls pointer-events-auto absolute -bottom-11 left-0 flex items-center gap-1.5 bg-[#1E1926]/95 border border-purple-500/40 p-1 rounded-xl shadow-xl">
              <button
                onClick={handleConfirm}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Area</span>
              </button>
              <button
                onClick={() => setCurrentBox(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset Selection"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
