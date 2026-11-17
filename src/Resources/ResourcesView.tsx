import React from 'react';
import {
  Heart,
  Smile,
  Plus,
  X,
  Minus,
  Square,
  LayoutGrid,
  FileText,
  Edit2,
  GraduationCap,
  Info,
  Palette,
  Settings,
  Trophy,
  Undo2,
  Redo2,
  BookOpen
} from 'lucide-react';
import { LearnPage } from '../components/LearnPage';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityMenu } from '../components/AccessibilityMenu';
import { AccessibilityIcon } from '../components/AccessibilityIcon';

export interface ResourcesViewProps {
  onBack?: () => void;
  onSelectTopic?: (topic: string) => void;
  className?: string;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  onBack,
  onSelectTopic,
  className = '',
}) => {
  const { isMenuOpen, toggleMenu, setIsMenuOpen } = useAccessibility();

  return (
    <div
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none text-[#2C2936] font-sans flex ${className}`}
      style={{
        background: `
          radial-gradient(circle at 10% 25%, rgba(254, 230, 242, 0.7) 0%, transparent 45%),
          radial-gradient(circle at 90% 18%, rgba(228, 242, 255, 0.7) 0%, transparent 45%),
          radial-gradient(circle at 50% 85%, rgba(243, 232, 255, 0.8) 0%, transparent 50%),
          linear-gradient(135deg, #FAF8FE 0%, #F8F5FB 50%, #FAF8FE 100%)
        `,
      }}
    >
      {/* =========================================================================
          1. EXTREME LEFT VERTICAL RAIL (Width: 52px, matches Scratchpad & Home)
         ========================================================================= */}
      <aside className="w-[52px] h-full flex flex-col items-center justify-between py-4 border-r border-[#EBE6F0] bg-white/40 backdrop-blur-md z-30 shrink-0">
        <div className="flex flex-col items-center gap-4">
          {/* Cherry Blossom / Nilo Logo */}
          <div
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#651A3B] to-[#8E2856] flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform"
            title="Return to Nilo Home"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
              <path d="M12 2C10.5 5 8 7 5 7C7 9.5 7 12 5 14.5C8 14.5 10.5 16.5 12 19.5C13.5 16.5 16 14.5 19 14.5C17 12 17 9.5 19 7C16 7 13.5 5 12 2Z" />
            </svg>
          </div>

          <div className="w-5 h-[1px] bg-slate-200/80 my-1" />

          {/* Left Vertical Action Icons */}
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all cursor-pointer">
            <Heart className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all cursor-pointer">
            <Smile className="w-4 h-4" />
          </button>

          {/* Accessibility Option - Just above + */}
          <button
            onClick={toggleMenu}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isMenuOpen
                ? 'bg-[#8E2856] text-white shadow-sm ring-2 ring-[#8E2856]/30'
                : 'text-slate-500 hover:text-[#8E2856] hover:bg-white/80'
            }`}
            title="Accessibility Options"
            aria-label="Accessibility Options"
          >
            <AccessibilityIcon className="w-4 h-4" />
          </button>

          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-purple-600 hover:bg-white/80 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Exit */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          title="Back to Wheel"
        >
          <X className="w-4 h-4" />
        </button>
      </aside>

      {/* =========================================================================
          NEXT MENU: ACCESSIBILITY OPTIONS (Opens adjacent to the leftmost rail)
         ========================================================================= */}
      {isMenuOpen && (
        <AccessibilityMenu
          onClose={() => setIsMenuOpen(false)}
          onReadAloudCustomText="Study Guides and Resources library. Browse interactive 3D books covering Linear Equations, Cellular Biology, Wave Optics, and Chemical Kinetics."
        />
      )}

      {/* =========================================================================
          2. MAIN CONTENT AREA (TOP HEADER + 3D INTERACTIVE BOOK LIBRARY)
         ========================================================================= */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* ── TOP HEADER / TOOLBAR BAR ── */}
        <header className="h-14 px-4 flex items-center justify-between border-b border-[#EBE6F0]/80 bg-white/40 backdrop-blur-md shrink-0 z-20">
          
          {/* Left: Study Guides & Resources Title & Icons */}
          <div className="flex items-center gap-2.5">
            <button className="p-1.5 rounded-lg text-slate-600 hover:bg-white/60 transition-colors">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <h1 className="text-[15px] font-extrabold tracking-tight text-[#1E1926]">
              Study Guides & Resources
            </h1>
            <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors">
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center: Minimalist Toolbar + Menu Center Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_4px_20px_rgba(124,92,255,0.06)]">
              <button className="p-1.5 rounded-lg text-[#7C5CFF] bg-purple-50 transition-colors cursor-pointer" title="Study Guides & Books">
                <BookOpen className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer" title="Info">
                <Info className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer" title="Palette">
                <Palette className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer" title="Trophy">
                <Trophy className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer" title="Undo">
                <Undo2 className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer" title="Redo">
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Center / Back Pill */}
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF2F6] hover:bg-[#F4E3ED] border border-[#8E2856]/20 text-[#8E2856] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Return to Radial Wheel"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#8E2856] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-2 h-2 fill-white">
                  <path d="M12 2C10.5 5 8 7 5 7C7 9.5 7 12 5 14.5C8 14.5 10.5 16.5 12 19.5C13.5 16.5 16 14.5 19 14.5C17 12 17 9.5 19 7C16 7 13.5 5 12 2Z" />
                </svg>
              </div>
              <span>Menu center</span>
            </button>
          </div>

          {/* Right: Window Controls */}
          <div className="flex items-center gap-2">
            <button className="w-4 h-4 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors" title="Minimize">
              <Minus className="w-3 h-3" />
            </button>
            <button className="w-4 h-4 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors" title="Maximize">
              <Square className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={onBack}
              className="w-4 h-4 rounded flex items-center justify-center text-slate-500 hover:text-red-600 transition-colors"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* ── 3D Interactive Books Shelf & Reader ── */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none]">
          <LearnPage
            onBackToHome={onBack}
            onStartSession={onSelectTopic}
          />
        </div>

      </div>
    </div>
  );
};
