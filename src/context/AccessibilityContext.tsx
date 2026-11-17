import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  DraggableBrailleHUD,
  DraggableASLWindow,
  DraggableADHDFocusRuler,
} from '../components/DraggableWidgets';

export type HighContrastMode = 'off' | 'contrast' | 'dark';
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'grayscale';
export type FontSizeScale = 100 | 115 | 130 | 145;
export type SpeechRate = 0.8 | 1.0 | 1.25;

export interface AccessibilitySettings {
  brailleSupport: boolean;
  aslSupport: boolean;
  readingRuler: boolean;
  screenNarrator: boolean;
  highContrast: HighContrastMode;
  fontSize: FontSizeScale;
  dyslexicFont: boolean;
  colorBlindFilter: ColorBlindMode;
  invertColors: boolean;
  reduceMotion: boolean;
  largeCursor: boolean;
  speechRate: SpeechRate;
  soundCues: boolean;
  lineSpacing: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  isMenuOpen: boolean;
  isSpeaking: boolean;
  activeCount: number;
  setIsMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleMenu: () => void;
  setBrailleSupport: (val: boolean) => void;
  setAslSupport: (val: boolean) => void;
  setScreenNarrator: (val: boolean) => void;
  toggleScreenNarrator: () => void;
  setHighContrast: (mode: HighContrastMode) => void;
  setFontSize: (size: FontSizeScale) => void;
  setDyslexicFont: (val: boolean) => void;
  setColorBlindFilter: (mode: ColorBlindMode) => void;
  setInvertColors: (val: boolean) => void;
  setReduceMotion: (val: boolean) => void;
  setReadingRuler: (val: boolean) => void;
  setLargeCursor: (val: boolean) => void;
  setSpeechRate: (rate: SpeechRate) => void;
  setSoundCues: (val: boolean) => void;
  setLineSpacing: (val: boolean) => void;
  resetAll: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  playSoundChime: () => void;
}

const defaultSettings: AccessibilitySettings = {
  brailleSupport: false,
  aslSupport: false,
  readingRuler: false,
  screenNarrator: false,
  highContrast: 'off',
  fontSize: 100,
  dyslexicFont: false,
  colorBlindFilter: 'none',
  invertColors: false,
  reduceMotion: false,
  largeCursor: false,
  speechRate: 1.0,
  soundCues: true,
  lineSpacing: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('explaino_accessibility');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return defaultSettings;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('explaino_accessibility', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Track mouse coordinates for Reading Ruler & Large Cursor
  useEffect(() => {
    if (!settings.readingRuler && !settings.largeCursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [settings.readingRuler, settings.largeCursor]);

  // Apply root font size, dyslexic font, and motion preferences
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${settings.fontSize}%`;

    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.dyslexicFont) {
      document.body.classList.add('dyslexic-font-active');
    } else {
      document.body.classList.remove('dyslexic-font-active');
    }

    if (settings.lineSpacing) {
      document.body.classList.add('expanded-line-spacing');
    } else {
      document.body.classList.remove('expanded-line-spacing');
    }
  }, [settings.fontSize, settings.reduceMotion, settings.dyslexicFont, settings.lineSpacing]);

  // Screen Narrator: Reads aloud when hovering over elements or highlighting text
  const lastSpokenRef = useRef<string>('');
  const hoverTimerRef = useRef<number | null>(null);
  const currentHighlightedElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!settings.screenNarrator) {
      if (currentHighlightedElRef.current) {
        currentHighlightedElRef.current.classList.remove('screen-narrator-highlight');
        currentHighlightedElRef.current = null;
      }
      stopSpeaking();
      return;
    }

    const extractReadableText = (el: HTMLElement | null): string => {
      if (!el || el === document.body || el === document.documentElement) return '';
      // Don't read raw controls inside the accessibility menu itself
      if (el.closest('[aria-label="Accessibility Settings Menu"]')) return '';

      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel?.trim()) return ariaLabel.trim();

      const title = el.getAttribute('title');
      if (title?.trim()) return title.trim();

      const alt = el.getAttribute('alt');
      if (alt?.trim()) return alt.trim();

      // For interactive or text elements
      if (['BUTTON', 'A', 'H1', 'H2', 'H3', 'H4', 'P', 'SPAN', 'LABEL', 'LI'].includes(el.tagName)) {
        return (el.innerText || el.textContent || '').trim();
      }

      const text = (el.innerText || el.textContent || '').trim();
      if (text && text.length < 300) {
        return text;
      }
      return '';
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
      }

      hoverTimerRef.current = window.setTimeout(() => {
        const text = extractReadableText(target);
        if (text && text !== lastSpokenRef.current) {
          if (currentHighlightedElRef.current && currentHighlightedElRef.current !== target) {
            currentHighlightedElRef.current.classList.remove('screen-narrator-highlight');
          }
          target.classList.add('screen-narrator-highlight');
          currentHighlightedElRef.current = target;
          lastSpokenRef.current = text;
          speak(text);
        }
      }, 200);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
      }
      if (target && target === currentHighlightedElRef.current) {
        target.classList.remove('screen-narrator-highlight');
        currentHighlightedElRef.current = null;
      }
    };

    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText && selectedText.length > 0) {
        lastSpokenRef.current = selectedText;
        speak(selectedText);
      }
    };

    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
      }
      if (currentHighlightedElRef.current) {
        currentHighlightedElRef.current.classList.remove('screen-narrator-highlight');
      }
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [settings.screenNarrator, settings.speechRate]);

  // Sound chime helper
  const playSoundChime = () => {
    if (!settings.soundCues) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.06); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // AudioContext unavailable
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
    playSoundChime();
  };

  const setBrailleSupport = (val: boolean) => {
    setSettings(prev => ({ ...prev, brailleSupport: val }));
    playSoundChime();
  };

  const setAslSupport = (val: boolean) => {
    setSettings(prev => ({ ...prev, aslSupport: val }));
    playSoundChime();
  };

  const setScreenNarrator = (val: boolean) => {
    setSettings(prev => ({ ...prev, screenNarrator: val }));
    if (!val) {
      stopSpeaking();
    }
    playSoundChime();
  };

  const toggleScreenNarrator = () => {
    setSettings(prev => {
      const next = !prev.screenNarrator;
      if (!next) {
        stopSpeaking();
      }
      return { ...prev, screenNarrator: next };
    });
    playSoundChime();
  };

  const setHighContrast = (mode: HighContrastMode) => {
    setSettings(prev => ({ ...prev, highContrast: mode }));
    playSoundChime();
  };

  const setFontSize = (size: FontSizeScale) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
    playSoundChime();
  };

  const setDyslexicFont = (val: boolean) => {
    setSettings(prev => ({ ...prev, dyslexicFont: val }));
    playSoundChime();
  };

  const setColorBlindFilter = (mode: ColorBlindMode) => {
    setSettings(prev => ({ ...prev, colorBlindFilter: mode }));
    playSoundChime();
  };

  const setInvertColors = (val: boolean) => {
    setSettings(prev => ({ ...prev, invertColors: val }));
    playSoundChime();
  };

  const setReduceMotion = (val: boolean) => {
    setSettings(prev => ({ ...prev, reduceMotion: val }));
    playSoundChime();
  };

  const setReadingRuler = (val: boolean) => {
    setSettings(prev => ({ ...prev, readingRuler: val }));
    playSoundChime();
  };

  const setLargeCursor = (val: boolean) => {
    setSettings(prev => ({ ...prev, largeCursor: val }));
    playSoundChime();
  };

  const setSpeechRate = (rate: SpeechRate) => {
    setSettings(prev => ({ ...prev, speechRate: rate }));
    playSoundChime();
  };

  const setSoundCues = (val: boolean) => {
    setSettings(prev => ({ ...prev, soundCues: val }));
  };

  const setLineSpacing = (val: boolean) => {
    setSettings(prev => ({ ...prev, lineSpacing: val }));
    playSoundChime();
  };

  const resetAll = () => {
    setSettings(defaultSettings);
    stopSpeaking();
    playSoundChime();
  };

  // Text-To-Speech
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Count active enhancements
  const activeCount = [
    settings.brailleSupport,
    settings.aslSupport,
    settings.readingRuler,
    settings.screenNarrator,
    settings.highContrast !== 'off',
    settings.fontSize !== 100,
    settings.dyslexicFont,
    settings.colorBlindFilter !== 'none',
    settings.invertColors,
    settings.reduceMotion,
    settings.largeCursor,
    settings.lineSpacing,
  ].filter(Boolean).length;

  // Filter style calculation
  const getFilterStyle = (): string => {
    const filters: string[] = [];
    if (settings.invertColors) {
      filters.push('invert(100%) hue-rotate(180deg)');
    }
    if (settings.highContrast === 'contrast') {
      filters.push('contrast(135%) saturate(115%)');
    }
    if (settings.colorBlindFilter === 'grayscale') {
      filters.push('grayscale(100%)');
    } else if (settings.colorBlindFilter === 'protanopia') {
      filters.push('url(#protanopia-filter)');
    } else if (settings.colorBlindFilter === 'deuteranopia') {
      filters.push('url(#deuteranopia-filter)');
    } else if (settings.colorBlindFilter === 'tritanopia') {
      filters.push('url(#tritanopia-filter)');
    }
    return filters.join(' ');
  };

  const filterStyle = getFilterStyle();

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        isMenuOpen,
        isSpeaking,
        activeCount,
        setIsMenuOpen,
        toggleMenu,
        setBrailleSupport,
        setAslSupport,
        setScreenNarrator,
        toggleScreenNarrator,
        setHighContrast,
        setFontSize,
        setDyslexicFont,
        setColorBlindFilter,
        setInvertColors,
        setReduceMotion,
        setReadingRuler,
        setLargeCursor,
        setSpeechRate,
        setSoundCues,
        setLineSpacing,
        resetAll,
        speak,
        stopSpeaking,
        playSoundChime,
      }}
    >
      {/* Dynamic Filter Wrappers & Color Blind Matrices */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          {/* Protanopia (Red-Blind) */}
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0, 0, 0
                      0.558, 0.442, 0, 0, 0
                      0, 0.242, 0.758, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
          {/* Deuteranopia (Green-Blind) */}
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0, 0, 0
                      0.7, 0.3, 0, 0, 0
                      0, 0.3, 0.7, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
          {/* Tritanopia (Blue-Blind) */}
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05, 0, 0, 0
                      0, 0.433, 0.567, 0, 0
                      0, 0.475, 0.525, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Dyslexic & Custom Accessibility CSS Overrides */}
      <style>{`
        .screen-narrator-highlight {
          outline: 2.5px solid #8E2856 !important;
          outline-offset: 2px !important;
          background-color: rgba(142, 40, 86, 0.12) !important;
          border-radius: 6px !important;
          transition: outline 0.1s ease, background-color 0.1s ease;
        }
        .dyslexic-font-active {
          font-family: 'OpenDyslexic', 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif !important;
          letter-spacing: 0.035em !important;
          word-spacing: 0.08em !important;
        }
        .expanded-line-spacing * {
          line-height: 1.8 !important;
        }
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
        }
      `}</style>

      {/* High Contrast Dark Filter Overlay if enabled */}
      {settings.highContrast === 'dark' && (
        <div
          className="fixed inset-0 pointer-events-none z-[9998] mix-blend-difference bg-white"
          aria-hidden="true"
        />
      )}

      {/* Main Content with visual filters applied */}
      <div
        className="w-full h-full flex flex-col relative"
        style={filterStyle ? { filter: filterStyle } : undefined}
      >
        {children}
      </div>

      {/* Screen Narrator Active Floating Indicator Banner */}
      {settings.screenNarrator && (
        <div
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] bg-[#8E2856] text-white px-4 py-1.5 rounded-full shadow-[0_8px_30px_rgba(142,40,86,0.35)] flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 select-none border border-white/20"
          role="status"
          aria-live="polite"
        >
          <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
          <span>Screen Narrator ON • Hover or select text to read</span>
          <button
            onClick={() => setScreenNarrator(false)}
            className="ml-1 bg-white/20 hover:bg-white/30 text-white text-[10px] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
            title="Turn off Screen Narrator"
          >
            Turn Off
          </button>
        </div>
      )}

      {/* Draggable ADHD Reading Guide / Focus Ruler */}
      {settings.readingRuler && (
        <DraggableADHDFocusRuler
          mouseY={mousePos.y}
          onClose={() => setReadingRuler(false)}
        />
      )}

      {/* Large High-Visibility Cursor Ring Follower */}
      {settings.largeCursor && (
        <div
          className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-500 bg-purple-500/25 shadow-[0_0_16px_rgba(168,85,247,0.6)] w-8 h-8 transition-transform duration-75 ease-out"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-600 shadow-sm" />
        </div>
      )}

      {/* Draggable Braille Nemeth Math Translation HUD */}
      {settings.brailleSupport && (
        <DraggableBrailleHUD
          onClose={() => setBrailleSupport(false)}
          currentEquation="2x + 5 = 15"
          brailleCode="⠼⠃⠭⠬⠢⠨⠅⠼⠂⠢"
        />
      )}

      {/* Draggable ASL Sign Language Live Interpreter Window */}
      {settings.aslSupport && (
        <DraggableASLWindow
          onClose={() => setAslSupport(false)}
          currentEquation="2x + 5 = 15"
        />
      )}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
