import React, { useState } from 'react';
import {
  X,
  Search,
  Eye,
  Type,
  MousePointer2,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import {
  useAccessibility,
  HighContrastMode,
  ColorBlindMode,
  FontSizeScale,
  SpeechRate
} from '../context/AccessibilityContext';

export interface AccessibilityMenuProps {
  onClose?: () => void;
  className?: string;
  onReadAloudCustomText?: string;
}

// ── CUSTOM VECTOR ICONS MATCHING USER SCREENSHOT ──
const BrailleDotsIcon: React.FC = () => (
  <svg width="22" height="28" viewBox="0 0 22 28" fill="none" className="shrink-0 select-none">
    {/* Dot 1, 4 */}
    <circle cx="5" cy="5" r="3.2" fill="#651A3B" />
    <circle cx="16" cy="5" r="3.2" fill="#651A3B" />
    {/* Dot 2, 5 */}
    <circle cx="5" cy="14" r="3.2" fill="#651A3B" />
    <circle cx="16" cy="14" r="3.2" fill="#DDB2C1" />
    {/* Dot 3, 6 */}
    <circle cx="5" cy="23" r="3.2" fill="#651A3B" />
    <circle cx="16" cy="23" r="3.2" fill="#DDB2C1" />
  </svg>
);

const AslHandsIcon: React.FC = () => (
  <svg width="34" height="28" viewBox="0 0 34 28" fill="none" className="shrink-0 select-none">
    {/* Left Hand with Sign Language Gesture */}
    <path
      d="M2.5 13.5C1.8 12 2.5 9.5 4.5 9C6.5 8.5 7.5 10 8.5 11.5L9 8C9.5 6.2 11.5 6.2 12 8L12.5 7C13 5.2 15 5.2 15.5 7L16 9C16.5 8 18 8 18.5 9.5C19 11 18.5 13.2 17 15L15.5 17.5L12.5 21H8.5L4.5 16.5L2.5 13.5Z"
      fill="#F5D3DC"
      stroke="#651A3B"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9.5" cy="12" r="2.2" fill="#F5D3DC" stroke="#651A3B" strokeWidth="1.1" />
    {/* Right Hand */}
    <path
      d="M20.5 15.5L23.5 12.5C24.5 11.5 26.5 11.5 27.5 13C28.5 14.5 27.5 16.5 26 17.5L23.5 22H19.5L17.5 19L20.5 15.5Z"
      fill="#F5D3DC"
      stroke="#651A3B"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AdhdFocusIcon: React.FC = () => (
  <svg width="34" height="26" viewBox="0 0 34 26" fill="none" className="shrink-0 select-none">
    {/* Double-ended horizontal arrow on top */}
    <path d="M4.5 5L1.5 7.5L4.5 10" stroke="#651A3B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 7.5H32" stroke="#651A3B" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M29.5 5L32.5 7.5L29.5 10" stroke="#651A3B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Ruler body underneath */}
    <rect x="1.5" y="14" width="31" height="10.5" rx="2" fill="#F5D3DC" stroke="#651A3B" strokeWidth="1.3" />
    {/* Ruler tick marks */}
    <line x1="5.5" y1="14" x2="5.5" y2="18" stroke="#651A3B" strokeWidth="1.1" strokeLinecap="round" />
    <line x1="9.5" y1="14" x2="9.5" y2="19.5" stroke="#651A3B" strokeWidth="1.1" strokeLinecap="round" />
    <line x1="13.5" y1="14" x2="13.5" y2="18" stroke="#651A3B" strokeWidth="1.1" strokeLinecap="round" />
    <line x1="17.5" y1="14" x2="17.5" y2="19.5" stroke="#651A3B" strokeWidth="1.1" strokeLinecap="round" />
    <line x1="21.5" y1="14" x2="21.5" y2="18" stroke="#651A3B" strokeWidth="1.1" strokeLinecap="round" />
    <line x1="25.5" y1="14" x2="25.5" y2="19.5" stroke="#651A3B" strokeWidth="1.1" strokeLinecap="round" />
    <line x1="29.5" y1="14" x2="29.5" y2="18" stroke="#651A3B" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  onClose,
  className = '',
  onReadAloudCustomText,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const {
    settings,
    isSpeaking,
    activeCount,
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
  } = useAccessibility();

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const textToRead =
        onReadAloudCustomText ||
        'Welcome to Explaino Math Sandbox. Current problem: 2x plus 5 equals 15. Hint: To isolate 2x, subtract 5 from both sides, leaving 2x equals 10. Next, divide both sides by 2 to solve for x equals 5.';
      speak(textToRead);
    }
  };

  const matchesFilter = (text: string) => {
    if (!filterQuery.trim()) return true;
    return text.toLowerCase().includes(filterQuery.toLowerCase());
  };

  return (
    <aside
      className={`w-[300px] md:w-[320px] h-full flex flex-col border-r border-[#EBE6F0] bg-white/85 backdrop-blur-2xl z-30 shrink-0 select-none text-[#1E1926] shadow-[10px_0_35px_rgba(100,50,150,0.08)] animate-in slide-in-from-left duration-250 ${className}`}
      aria-label="Accessibility Settings Menu"
    >
      {/* ── 1. HEADER (Title: Accessibility + Close 'X') ── */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#EBE6F0]/70 bg-white/60 shrink-0">
        <h2 className="text-[17px] font-extrabold tracking-tight text-[#1E1926]">
          Accessibility
        </h2>

        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <button
              onClick={resetAll}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-[#8E2856] hover:bg-[#FAF2F6] transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset all settings to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Close menu"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. SEARCH / FILTER BAR ("Filter accessibility...") ── */}
      <div className="p-3 border-b border-[#EBE6F0]/60 bg-white/40 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs focus-within:border-[#8E2856]/50 focus-within:ring-2 focus-within:ring-[#8E2856]/10 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Filter accessibility..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 3. SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* ── TOP FEATURED OPTIONS (Braille, ASL, ADHD Focus) ── */}
        
        {/* 1. Braille Card */}
        {matchesFilter('braille support blind') && (
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100/90 shadow-xs flex items-center justify-between hover:border-slate-200 transition-all">
            <div className="flex items-center gap-3.5">
              <BrailleDotsIcon />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-slate-900 leading-tight">
                  Braille
                </span>
                <span className="text-[12px] text-slate-400 font-medium mt-0.5">
                  Braille' support
                </span>
              </div>
            </div>

            <button
              onClick={() => setBrailleSupport(!settings.brailleSupport)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                settings.brailleSupport ? 'bg-[#8E2856]' : 'bg-slate-200'
              }`}
              role="switch"
              aria-checked={settings.brailleSupport}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  settings.brailleSupport ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        )}

        {/* 2. ASL Card */}
        {matchesFilter('asl sign language deaf hands') && (
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100/90 shadow-xs flex items-center justify-between hover:border-slate-200 transition-all">
            <div className="flex items-center gap-3.5">
              <AslHandsIcon />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-slate-900 leading-tight">
                  ASL
                </span>
                <span className="text-[12px] text-slate-400 font-medium mt-0.5">
                  Sign language
                </span>
              </div>
            </div>

            <button
              onClick={() => setAslSupport(!settings.aslSupport)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                settings.aslSupport ? 'bg-[#8E2856]' : 'bg-slate-200'
              }`}
              role="switch"
              aria-checked={settings.aslSupport}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  settings.aslSupport ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        )}

        {/* 3. ADHD Focus Card */}
        {matchesFilter('adhd focus highlight guide ruler') && (
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100/90 shadow-xs flex items-center justify-between hover:border-slate-200 transition-all">
            <div className="flex items-center gap-3.5">
              <AdhdFocusIcon />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-slate-900 leading-tight">
                  ADHD Focus
                </span>
                <span className="text-[12px] text-slate-400 font-medium mt-0.5">
                  Highlight guide
                </span>
              </div>
            </div>

            <button
              onClick={() => setReadingRuler(!settings.readingRuler)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                settings.readingRuler ? 'bg-[#8E2856]' : 'bg-slate-200'
              }`}
              role="switch"
              aria-checked={settings.readingRuler}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  settings.readingRuler ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        )}

        {/* ── 4. GENERAL SETTINGS (Directly below featured cards) ── */}
        <div className="pt-3 pb-1 flex items-center justify-between px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3 text-[#8E2856]" />
            General Settings
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {activeCount} Active
          </span>
        </div>

        {/* Vision & Contrast Section */}
        {matchesFilter('contrast dark vision color blind invert') && (
          <div className="space-y-2">
            {/* Contrast Mode */}
            <div className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Contrast Mode</span>
                <span className="text-[10px] text-slate-400 font-medium capitalize">
                  {settings.highContrast}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 text-[11px] font-bold">
                {(['off', 'contrast', 'dark'] as HighContrastMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setHighContrast(mode)}
                    className={`py-1 rounded-lg transition-all capitalize cursor-pointer text-center ${
                      settings.highContrast === mode
                        ? 'bg-white text-[#8E2856] shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'off' ? 'Normal' : mode === 'contrast' ? 'High' : 'Dark'}
                  </button>
                ))}
              </div>
            </div>

            {/* Invert Colors Toggle */}
            <div className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Invert Colors</div>
                <div className="text-[10px] text-slate-400">Night mode inversion</div>
              </div>
              <button
                onClick={() => setInvertColors(!settings.invertColors)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.invertColors ? 'bg-[#8E2856]' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={settings.invertColors}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                    settings.invertColors ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Color Blind Filters */}
            <div className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Color Blind Filter</span>
                <span className="text-[10px] text-slate-400 font-medium">Daltonism</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                {[
                  { id: 'none', label: 'Standard' },
                  { id: 'protanopia', label: 'Protanopia' },
                  { id: 'deuteranopia', label: 'Deuteranopia' },
                  { id: 'tritanopia', label: 'Tritanopia' },
                  { id: 'grayscale', label: 'Monochrome' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setColorBlindFilter(filter.id as ColorBlindMode)}
                    className={`px-2 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      settings.colorBlindFilter === filter.id
                        ? 'bg-[#FAF2F6] border-[#8E2856]/40 text-[#8E2856]'
                        : 'bg-slate-50/70 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{filter.label}</span>
                    {settings.colorBlindFilter === filter.id && (
                      <Check className="w-3 h-3 text-[#8E2856] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Text & Typography Section */}
        {matchesFilter('text font size dyslexia line spacing') && (
          <div className="space-y-2">
            {/* Font Scaling */}
            <div className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Text Scaling</span>
                <span className="text-[10px] font-extrabold text-[#8E2856] bg-[#FAF2F6] px-1.5 py-0.5 rounded-md">
                  {settings.fontSize}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold">
                {([100, 115, 130, 145] as FontSizeScale[]).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setFontSize(scale)}
                    className={`py-1 rounded-xl border transition-all text-center cursor-pointer ${
                      settings.fontSize === scale
                        ? 'bg-[#FAF2F6] border-[#8E2856]/40 text-[#8E2856] shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {scale}%
                  </button>
                ))}
              </div>
            </div>

            {/* Dyslexia Font Toggle */}
            <div className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Dyslexia Font</div>
                <div className="text-[10px] text-slate-400">High legibility glyphs</div>
              </div>
              <button
                onClick={() => setDyslexicFont(!settings.dyslexicFont)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.dyslexicFont ? 'bg-[#8E2856]' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={settings.dyslexicFont}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                    settings.dyslexicFont ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Line Spacing */}
            <div className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Line Spacing</div>
                <div className="text-[10px] text-slate-400">1.8x line height</div>
              </div>
              <button
                onClick={() => setLineSpacing(!settings.lineSpacing)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.lineSpacing ? 'bg-[#8E2856]' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={settings.lineSpacing}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                    settings.lineSpacing ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Focus & Motor Section */}
        {matchesFilter('cursor pointer motion aura reduce') && (
          <div className="space-y-2">
            {/* Pointer Aura */}
            <div className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Pointer Aura</div>
                <div className="text-[10px] text-slate-400">High-vis cursor ring</div>
              </div>
              <button
                onClick={() => setLargeCursor(!settings.largeCursor)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.largeCursor ? 'bg-[#8E2856]' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={settings.largeCursor}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                    settings.largeCursor ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduce Motion */}
            <div className="p-3 rounded-2xl bg-white border border-slate-100/90 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Reduce Motion</div>
                <div className="text-[10px] text-slate-400">Disable pulsing lights</div>
              </div>
              <button
                onClick={() => setReduceMotion(!settings.reduceMotion)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.reduceMotion ? 'bg-[#8E2856]' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={settings.reduceMotion}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                    settings.reduceMotion ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Audio & Speech Section */}
        {matchesFilter('audio speech read aloud sound screen narrator hover highlight') && (
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Screen Narrator</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Hover on elements or highlight text to speak
                </span>
              </div>

              {/* Narrator Toggle Switch */}
              <button
                onClick={toggleScreenNarrator}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  settings.screenNarrator ? 'bg-[#8E2856]' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={settings.screenNarrator}
                title={settings.screenNarrator ? 'Click to turn off Screen Narrator' : 'Click to enable Screen Narrator'}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    settings.screenNarrator ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Main Toggle Button: Click to enable, click again to turn off */}
            <button
              onClick={toggleScreenNarrator}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                settings.screenNarrator
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 ring-2 ring-rose-300'
                  : 'bg-[#FAF2F6] hover:bg-[#F4E3ED] border border-[#8E2856]/30 text-[#8E2856]'
              }`}
            >
              {settings.screenNarrator ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Narrator Active • Click to Turn Off</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Enable Screen Narrator</span>
                </>
              )}
            </button>

            {/* Quick Test / Read Aloud Button if needed */}
            <button
              onClick={handleReadAloud}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isSpeaking ? 'Stop Active Speech' : 'Sample: Read Current Lesson'}</span>
            </button>

            {/* Speech Rate Controls */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold">Narrator Speed</span>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                {([0.8, 1.0, 1.25] as SpeechRate[]).map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      settings.speechRate === rate
                        ? 'bg-[#8E2856] text-white border-[#8E2856]'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── 5. FOOTER ── */}
      <div className="p-3 border-t border-[#EBE6F0]/80 bg-white/60 shrink-0 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">
          Explaino Inclusive Learning
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#FAF2F6] hover:bg-[#F4E3ED] text-[#8E2856] text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        )}
      </div>
    </aside>
  );
};
