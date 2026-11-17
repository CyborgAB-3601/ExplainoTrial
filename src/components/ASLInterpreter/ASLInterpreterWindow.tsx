import React, { useState, useEffect, useRef } from 'react';
import { X, Crop, RefreshCw, Check, Sparkles } from 'lucide-react';
import { ASLGlassHands3D } from './ASLGlassHands3D';
import { ASLAreaSelector } from './ASLAreaSelector';
import {
  ScreenROI,
  getSavedASLROI,
  clearSavedASLROI,
  interpretScreenAreaForASL,
  ASLInterpretationResult,
} from './aslVisionService';
import { DualHandPose, POSE_ISOLATE_OK, getPoseForSign } from './aslGestures';

export interface ASLInterpreterWindowProps {
  onClose: () => void;
  currentEquation?: string;
  activeStepTitle?: string;
}

interface Position {
  x: number;
  y: number;
}

// ── CUSTOM VECTOR ICON MATCHING USER SCREENSHOT ──
const AslTitleHandsIcon: React.FC = () => (
  <svg width="22" height="18" viewBox="0 0 34 28" fill="none" className="shrink-0 select-none">
    {/* Left Hand */}
    <path
      d="M2.5 13.5C1.8 12 2.5 9.5 4.5 9C6.5 8.5 7.5 10 8.5 11.5L9 8C9.5 6.2 11.5 6.2 12 8L12.5 7C13 5.2 15 5.2 15.5 7L16 9C16.5 8 18 8 18.5 9.5C19 11 18.5 13.2 17 15L15.5 17.5L12.5 21H8.5L4.5 16.5L2.5 13.5Z"
      fill="#651A3B"
      opacity="0.9"
    />
    <circle cx="9.5" cy="12" r="2.2" fill="#FAF5FF" />
    {/* Right Hand */}
    <path
      d="M20.5 15.5L23.5 12.5C24.5 11.5 26.5 11.5 27.5 13C28.5 14.5 27.5 16.5 26 17.5L23.5 22H19.5L17.5 19L20.5 15.5Z"
      fill="#651A3B"
      opacity="0.9"
    />
  </svg>
);

export const ASLInterpreterWindow: React.FC<ASLInterpreterWindowProps> = ({
  onClose,
  currentEquation = '2x + 5 = 15',
  activeStepTitle = 'Subtract 5 from both sides to isolate 2x',
}) => {
  // ── 1. WINDOW DRAGGING & PERSISTENT POSITION ──
  const [pos, setPos] = useState<Position>(() => {
    try {
      const saved = localStorage.getItem('explaino_asl_pos');
      if (saved) return JSON.parse(saved);
    } catch {}
    const defaultX = typeof window !== 'undefined' ? Math.max(40, window.innerWidth - 320) : 850;
    const defaultY = typeof window !== 'undefined' ? Math.max(60, window.innerHeight - 380) : 350;
    return { x: defaultX, y: defaultY };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, .interactive-control')) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const width = 290;
    const height = 340;
    const newX = Math.max(10, Math.min(window.innerWidth - width, dragStartRef.current.posX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - height, dragStartRef.current.posY + dy));

    const nextPos = { x: newX, y: newY };
    setPos(nextPos);
    try {
      localStorage.setItem('explaino_asl_pos', JSON.stringify(nextPos));
    } catch {}
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // ── 2. SMART AREA OF INTEREST (ROI) PERSISTENCE ──
  // User can select once; saved and remembered every time ASL is enabled
  const [currentROI, setCurrentROI] = useState<ScreenROI | null>(() => getSavedASLROI());
  const [isAreaSelectorOpen, setIsAreaSelectorOpen] = useState(false);
  const [showAreaIndicator, setShowAreaIndicator] = useState(false);

  // ── 3. ASL VISION INTERPRETATION STATE ──
  const [isScanning, setIsScanning] = useState(false);
  const [interpretation, setInterpretation] = useState<ASLInterpretationResult>({
    actionLabel: 'Solve / isolate',
    aslGloss: '[ ASL: subtract 5 ]',
    primaryPose: POSE_ISOLATE_OK,
    poseSequence: ['isolate', 'subtract', '5'],
    recognizedText: currentEquation,
    source: 'active_step',
    timestamp: Date.now(),
  });

  const [activePose, setActivePose] = useState<DualHandPose>(POSE_ISOLATE_OK);
  const [showControls, setShowControls] = useState(false);

  // Cycle through gesture sequence smoothly if multiple tokens
  useEffect(() => {
    const sequence = interpretation.poseSequence;
    if (!sequence || sequence.length <= 1) {
      setActivePose(interpretation.primaryPose);
      return;
    }

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % sequence.length;
      const nextPose = getPoseForSign(sequence[idx]);
      setActivePose(nextPose);
    }, 2400);

    return () => clearInterval(interval);
  }, [interpretation]);

  // Trigger Vision scan of the selected area
  const scanTargetArea = async () => {
    setIsScanning(true);
    try {
      const result = await interpretScreenAreaForASL(currentROI, currentEquation, activeStepTitle);
      setInterpretation(result);
      setActivePose(result.primaryPose);
    } catch (err) {
      console.warn('Scan area failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Re-scan when equation or active step changes
  useEffect(() => {
    scanTargetArea();
  }, [currentEquation, activeStepTitle, currentROI]);

  const handleAreaSaved = (roi: ScreenROI) => {
    setCurrentROI(roi);
    setShowAreaIndicator(true);
    setTimeout(() => setShowAreaIndicator(false), 3000);
    scanTargetArea();
  };

  const handleResetArea = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSavedASLROI();
    setCurrentROI(null);
    scanTargetArea();
  };

  return (
    <>
      {/* ── DRAGGABLE ASL INTERPRETER WINDOW ── */}
      <div
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          touchAction: 'none',
        }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        className={`fixed z-[9995] w-[290px] select-none rounded-[28px] overflow-hidden border border-white/60 bg-white/80 backdrop-blur-2xl shadow-[0_16px_50px_rgba(100,50,150,0.14)] transition-all ${
          isDragging ? 'cursor-grabbing shadow-[0_24px_70px_rgba(142,40,86,0.25)] ring-2 ring-[#651A3B]/40 scale-[1.01]' : 'hover:border-white/80'
        }`}
      >
        {/* ── 1. HEADER (Title: ASL Interpreter + Close '✕') ── */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`h-11 px-4 flex items-center justify-between border-b border-purple-100/50 bg-white/40 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title="Drag header to position window"
        >
          <div className="flex items-center gap-2">
            <AslTitleHandsIcon />
            <span className="text-[13px] font-extrabold text-[#1E1926] tracking-tight">
              ASL Interpreter
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isScanning && (
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" title="Scanning screen..." />
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Close ASL"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── 2. GLASS 3D HANDS VIEWPORT (MATCHES SCREENSHOT) ── */}
        <div className="relative w-full h-[215px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-50/20 via-pink-50/15 to-white/30">
          <ASLGlassHands3D currentPose={activePose} showMotionArcs={true} />

          {/* Scanning Overlay indicator */}
          {isScanning && (
            <div className="absolute inset-0 bg-purple-500/10 backdrop-blur-[1px] flex items-center justify-center gap-2 text-purple-900 text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
              <span>Interpreting screen...</span>
            </div>
          )}

          {/* Hover Action Bar: Area Selection & Re-scan */}
          <div
            className={`absolute top-2 right-2 flex items-center gap-1 transition-opacity duration-200 ${
              showControls || showAreaIndicator ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={() => setIsAreaSelectorOpen(true)}
              className="interactive-control px-2 py-1 rounded-full bg-white/90 hover:bg-white text-[10px] font-bold text-purple-900 border border-purple-200/80 shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              title={
                currentROI?.isCustom
                  ? 'Selected Area: Custom (Saved) • Click to re-select'
                  : 'Select area on screen to interpret'
              }
            >
              <Crop className="w-3 h-3 text-purple-600" />
              <span>{currentROI?.isCustom ? 'Area Saved' : 'Select Area'}</span>
            </button>

            {currentROI?.isCustom && (
              <button
                onClick={handleResetArea}
                className="interactive-control w-6 h-6 rounded-full bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-purple-200/80 flex items-center justify-center transition-colors cursor-pointer"
                title="Reset to Full Canvas"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={scanTargetArea}
              disabled={isScanning}
              className="interactive-control w-6 h-6 rounded-full bg-white/90 hover:bg-white text-purple-700 border border-purple-200/80 flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer disabled:opacity-50"
              title="Rescan selected area"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── 3. BOTTOM ASL LABELS (EXACT DESIGN MATCH) ── */}
        <div className="py-3 px-4 flex flex-col items-center justify-center text-center bg-white/60 border-t border-purple-100/40">
          {/* Action / Context: "Solve / isolate" */}
          <span className="text-[14px] font-bold text-slate-800 leading-tight">
            {interpretation.actionLabel}
          </span>

          {/* ASL Interpretation: "[ ASL: subtract 5 ]" */}
          <span className="text-[12px] font-semibold text-slate-900 tracking-wide font-mono mt-1">
            {interpretation.aslGloss}
          </span>

          {/* Subtle Smart Status Note */}
          <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-slate-400 font-medium">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                currentROI?.isCustom ? 'bg-purple-500' : 'bg-emerald-500'
              }`}
            />
            <span>
              {currentROI?.isCustom
                ? `Area: ${currentROI.width}×${currentROI.height}px (Smart Active)`
                : 'Smart tracking active whiteboard area'}
            </span>
          </div>
        </div>
      </div>

      {/* ── FULL SCREEN INTERACTIVE AREA SELECTOR OVERLAY ── */}
      <ASLAreaSelector
        isOpen={isAreaSelectorOpen}
        onClose={() => setIsAreaSelectorOpen(false)}
        onAreaSaved={handleAreaSaved}
        currentROI={currentROI}
      />
    </>
  );
};
