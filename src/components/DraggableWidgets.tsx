import React, { useState, useEffect, useRef } from 'react';
import { GripVertical, X, Lock, Unlock, MousePointer } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

/**
 * 1. DRAGGABLE BRAILLE NEMETH MATH HUD
 */
export const DraggableBrailleHUD: React.FC<{
  onClose: () => void;
  currentEquation?: string;
  brailleCode?: string;
}> = ({
  onClose,
  currentEquation = '2x + 5 = 15',
  brailleCode = '⠼⠃⠭⠬⠢⠨⠅⠼⠂⠢',
}) => {
  const [pos, setPos] = useState<Position>(() => {
    try {
      const saved = localStorage.getItem('explaino_braille_pos');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const defaultY = typeof window !== 'undefined' ? Math.max(80, window.innerHeight - 85) : 550;
    return { x: 80, y: defaultY };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
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

    const newX = Math.max(10, Math.min(window.innerWidth - 330, dragStartRef.current.posX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));

    const nextPos = { x: newX, y: newY };
    setPos(nextPos);
    try {
      localStorage.setItem('explaino_braille_pos', JSON.stringify(nextPos));
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

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        touchAction: 'none',
      }}
      className={`fixed z-[9995] select-none bg-[#1E1926]/95 text-white backdrop-blur-2xl border border-white/20 rounded-2xl p-2.5 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] flex items-center gap-3 transition-shadow ${
        isDragging ? 'cursor-grabbing shadow-[0_16px_50px_rgba(236,72,153,0.3)] ring-2 ring-pink-500/50 scale-[1.02]' : 'cursor-grab hover:border-white/40'
      }`}
      title="Click and drag anywhere to move"
    >
      {/* Drag Grip Handle */}
      <div className="text-white/40 hover:text-white/80 transition-colors p-0.5">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Braille 6-dot Graphic */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-white/10 rounded-lg shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
      </div>

      {/* Braille Text */}
      <div className="flex flex-col min-w-0 pr-1">
        <span className="text-[9px] font-extrabold tracking-wider text-rose-300 uppercase leading-none">
          Braille Nemeth Math Code
        </span>
        <span className="text-xs font-mono tracking-widest text-white mt-0.5 truncate">
          {brailleCode} ({currentEquation})
        </span>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={onClose}
        className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
        title="Close Braille HUD"
        aria-label="Close"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

/**
 * 2. DRAGGABLE ASL SIGN LANGUAGE INTERPRETER WINDOW
 */
export const DraggableASLWindow: React.FC<{
  onClose: () => void;
  currentEquation?: string;
}> = ({
  onClose,
  currentEquation = '2x + 5 = 15',
}) => {
  const [pos, setPos] = useState<Position>(() => {
    try {
      const saved = localStorage.getItem('explaino_asl_pos');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const defaultX = typeof window !== 'undefined' ? Math.max(40, window.innerWidth - 280) : 800;
    const defaultY = typeof window !== 'undefined' ? Math.max(60, window.innerHeight - 260) : 400;
    return { x: defaultX, y: defaultY };
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
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

    const width = 260;
    const height = isMinimized ? 50 : 230;
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

  return (
    <div
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        touchAction: 'none',
      }}
      className={`fixed z-[9995] w-64 select-none bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-3 shadow-[0_16px_45px_rgba(0,0,0,0.15)] transition-shadow ${
        isDragging ? 'shadow-[0_20px_60px_rgba(142,40,86,0.25)] ring-2 ring-[#8E2856]/40 scale-[1.01]' : 'hover:border-slate-300'
      }`}
    >
      {/* Draggable Header Bar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex items-center justify-between pb-2 border-b border-slate-100 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Click and drag header to move window"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-slate-400" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold text-slate-800 tracking-tight">
            ASL Interpreter
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(prev => !prev)}
            className="w-5 h-5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors text-[10px] font-bold cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '＋' : '—'}
          </button>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Close ASL"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {!isMinimized && (
        <>
          <div className="mt-2 relative rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-100 via-pink-50 to-amber-50 h-32 flex flex-col items-center justify-center border border-purple-100 shadow-inner">
            {/* Animated Sign Hand Graphics */}
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-bounce" style={{ animationDuration: '1.4s' }}>
                🤟
              </div>
              <div className="text-3xl animate-bounce" style={{ animationDuration: '1.8s' }}>
                ✌️
              </div>
            </div>
            <span className="mt-2 text-[10px] font-bold text-purple-700 bg-white/90 px-2.5 py-0.5 rounded-full shadow-xs border border-purple-200">
              Signing: "{currentEquation}"
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
            Drag anywhere to position window
          </p>
        </>
      )}
    </div>
  );
};

/**
 * 3. DRAGGABLE ADHD FOCUS READING RULER (Follows mouse OR locks/drags to any line)
 */
export const DraggableADHDFocusRuler: React.FC<{
  mouseY: number;
  onClose: () => void;
}> = ({ mouseY, onClose }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockedY, setLockedY] = useState(() => {
    try {
      const saved = localStorage.getItem('explaino_adhd_ruler_y');
      if (saved) return Number(saved);
    } catch {}
    return 300;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const initialPosY = useRef(0);

  const effectiveY = isLocked ? lockedY : mouseY - 24;

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsLocked(true);
    setIsDragging(true);
    dragStartY.current = e.clientY;
    initialPosY.current = effectiveY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dy = e.clientY - dragStartY.current;
    const newY = Math.max(10, Math.min(window.innerHeight - 60, initialPosY.current + dy));
    setLockedY(newY);
    try {
      localStorage.setItem('explaino_adhd_ruler_y', String(newY));
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

  return (
    <div
      style={{
        top: 0,
        transform: `translateY(${effectiveY}px)`,
        touchAction: 'none',
      }}
      className="fixed left-0 w-full z-[9990] transition-transform duration-75 ease-out select-none"
      aria-hidden="true"
    >
      {/* Horizontal Reading Highlight Bar */}
      <div className="relative w-full h-12 bg-amber-400/20 border-y-2 border-amber-500/80 shadow-[0_0_24px_rgba(245,158,11,0.25)] backdrop-brightness-105 pointer-events-none" />

      {/* Left Draggable Grip & Control Handle Pill */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ pointerEvents: 'auto' }}
        className={`absolute left-16 -top-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-md transition-all ${
          isDragging ? 'cursor-grabbing scale-105 ring-2 ring-amber-300' : 'cursor-grab hover:bg-amber-600'
        }`}
        title={isLocked ? 'Locked at this line. Drag up/down or click to follow mouse.' : 'Following mouse. Click/drag to lock to a line.'}
      >
        <GripVertical className="w-3.5 h-3.5 opacity-80" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider">
          {isLocked ? 'Line Locked' : 'Focus Guide'}
        </span>

        {/* Lock / Follow Mouse Toggle */}
        <button
          onClick={() => {
            if (isLocked) {
              setIsLocked(false);
            } else {
              setLockedY(mouseY - 24);
              setIsLocked(true);
            }
          }}
          className="p-1 rounded-full hover:bg-amber-700/50 transition-colors ml-0.5 cursor-pointer"
          title={isLocked ? 'Switch to follow mouse' : 'Lock at this position'}
        >
          {isLocked ? <Lock className="w-2.5 h-2.5" /> : <MousePointer className="w-2.5 h-2.5" />}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-amber-700/50 transition-colors cursor-pointer"
          title="Turn off Focus Ruler"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
