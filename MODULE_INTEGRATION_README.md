# 🌌 NILO MODULE ARCHITECTURE & DEVELOPER INTEGRATION SPECIFICATION
> **Mandatory Master Guide for Teammates & Autonomous Coding Agents**  
> *Target: Build modular learning services inside isolated directories while maintaining 100% UI/UX parity with the Nilo Agentic OS.*

---

## 🚨 Non-Negotiable Integration Rules (Zero Breakage Guarantee)

1. **Strict Folder Isolation:**
   - You must **ONLY** create and modify files inside your assigned folder:
     - **Voice Agent:** `src/Voice/`
     - **Scribble Canvas:** `src/Scratchpad/`
     - **Concept Games:** `src/Games/`
     - **Digital Lab:** `src/DigitalLab/`
     - **Socratic Chat:** `src/Chat/`
     - **3D Library & Resources:** `src/Resources/`
     - **Video Lessons:** `src/Video/`
   - **DO NOT** edit, rename, or touch `src/App.tsx`, `src/Home/HomePage.tsx`, `src/components/Dashboard.tsx`, `package.json`, or any files outside your folder.

2. **Strict Package Boundary:**
   - The project uses **React 19**, **TypeScript 5/6**, **Vite 8**, **Tailwind CSS 3.4**, and **`lucide-react`** (`^1.48.0`), plus **`three`**.
   - **DO NOT** install additional npm packages (`npm i`). Use native HTML5 Canvas 2D, SVG, Web Audio API, and Tailwind CSS for custom visuals, diagrams, and interactions.

3. **Persistent Session & Navigation Rule:**
   - Once a student logs in, clicking "Home", the Nilo logo, or "Menu center" returns them to the active **Dashboard / Radial Stage**, and must **NEVER trigger a logout**. Logouts only occur via the explicit "Log out / Exit" button.

4. **Export Contract:**
   - Every module must maintain its clean export in `src/<ModuleFolder>/index.ts` conforming to the existing TypeScript props.

5. **Zero-Scrollbar & Clean Design Rule:**
   - All scrollable containers must use hidden scrollbars (`[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`).
   - UI selection must be controlled (`select-none` on UI containers, selectable on code/text).

---

## 🎨 The Nilo Design System & UI Shell Architecture

Every feature view in Nilo is structured around the **Nilo Desktop Shell**. If your module renders a full page, it **MUST** adopt the exact layout shell below:

```
+---------------------------------------------------------------------------------------+
| [ Rail: 52px ] | [ Header: h-14 (Title + Toolbar + "Menu center" Pill)              ] |
|----------------+----------------------------------------------------------------------|
| • Nilo Plum    |                                                                      |
| • Heart        |                                                                      |
| • Smile        |                    FEATURE CONTENT WORKSPACE                         |
| • Plus (+)     |              (Cards, Canvas, Simulation, Games, Audio)               |
|                |                                                                      |
| • Exit (X)     |                                                                      |
+---------------------------------------------------------------------------------------+
```

### 1. Master CSS & Ambient Background
```tsx
style={{
  background: `
    radial-gradient(circle at 10% 25%, rgba(254, 230, 242, 0.75) 0%, transparent 45%),
    radial-gradient(circle at 90% 18%, rgba(228, 242, 255, 0.75) 0%, transparent 45%),
    radial-gradient(circle at 50% 85%, rgba(243, 232, 255, 0.85) 0%, transparent 50%),
    linear-gradient(135deg, #FAF8FE 0%, #F8F5FB 50%, #FAF8FE 100%)
  `
}}
```

### 2. Design Tokens & Color Palette
- **Brand Purple:** `#7C5CFF` (Hover: `#6D4CE8`, Glow: `rgba(124, 92, 255, 0.15)`)
- **Brand Indigo:** `#6366F1`
- **Brand Pink / Plum:** Gradient `from-[#651A3B] to-[#8E2856]`
- **Deep Navy Text:** `#1E1926` / `#1E1B2E`
- **Muted Slate Text:** `#64748B` / `#94A3B8`
- **Subtle Surface Cards:** `bg-white/80 backdrop-blur-xl border border-purple-100/80 shadow-[0_4px_20px_rgba(124,92,255,0.06)]`
- **Success / Validated:** Emerald `#10B981` (Surface: `bg-emerald-50`, Border: `border-emerald-200`, Text: `text-emerald-900`)
- **Misconception / Gap:** Amber `#F59E0B` / Coral `#EF4444` (Surface: `bg-amber-50`, Border: `border-amber-200`)

### 3. Typography
- **Primary Body & UI:** `font-sans` (`'Plus Jakarta Sans'`, Inter, sans-serif)
- **Editorial Headings:** `font-serif-editorial` (`'Newsreader'`, Georgia, serif)
- **Scores, Timers & Telemetry:** `font-orbitron` (`'Orbitron'`, sans-serif)
- **Arcade Games:** `font-arcade` (`'Press Start 2P'`, monospace)

---

## 🏛️ Reusable Shell Code Template (Copy to your feature)

```tsx
import React from 'react';
import { Heart, Smile, Plus, X, BookOpen, Info, Palette, Settings, Trophy, Undo2, Redo2 } from 'lucide-react';

interface FeatureViewProps {
  onBack?: () => void;
  className?: string;
}

export const FeatureView: React.FC<FeatureViewProps> = ({ onBack, className = '' }) => {
  return (
    <div
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none text-[#1E1926] font-sans flex ${className}`}
      style={{
        background: `
          radial-gradient(circle at 10% 25%, rgba(254, 230, 242, 0.75) 0%, transparent 45%),
          radial-gradient(circle at 90% 18%, rgba(228, 242, 255, 0.75) 0%, transparent 45%),
          radial-gradient(circle at 50% 85%, rgba(243, 232, 255, 0.85) 0%, transparent 50%),
          linear-gradient(135deg, #FAF8FE 0%, #F8F5FB 50%, #FAF8FE 100%)
        `
      }}
    >
      {/* 1. EXTREME LEFT VERTICAL RAIL (52px width) */}
      <aside className="w-[52px] h-full flex flex-col items-center justify-between py-4 border-r border-[#EBE6F0] bg-white/40 backdrop-blur-md z-30 shrink-0">
        <div className="flex flex-col items-center gap-4">
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
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all cursor-pointer">
            <Heart className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all cursor-pointer">
            <Smile className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-purple-600 hover:bg-white/80 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          title="Back to Wheel"
        >
          <X className="w-4 h-4" />
        </button>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 px-4 flex items-center justify-between border-b border-[#EBE6F0]/80 bg-white/40 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[15px] font-extrabold tracking-tight text-[#1E1926]">
              Your Feature Title
            </h1>
          </div>

          {/* Center Toolbar Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_4px_20px_rgba(124,92,255,0.06)]">
              <button className="p-1.5 rounded-lg text-[#7C5CFF] bg-purple-50"><BookOpen className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600"><Info className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600"><Palette className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600"><Settings className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600"><Trophy className="w-4 h-4" /></button>
            </div>

            {/* Menu Center / Back Pill */}
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF2F6] hover:bg-[#F4E3ED] border border-[#8E2856]/20 text-[#8E2856] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#8E2856] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-2 h-2 fill-white">
                  <path d="M12 2C10.5 5 8 7 5 7C7 9.5 7 12 5 14.5C8 14.5 10.5 16.5 12 19.5C13.5 16.5 16 14.5 19 14.5C17 12 17 9.5 19 7C16 7 13.5 5 12 2Z" />
                </svg>
              </div>
              <span>Menu center</span>
            </button>
          </div>
        </header>

        {/* Feature Specific Body */}
        <main className="flex-1 overflow-auto p-6 [scrollbar-width:none]">
          {/* YOUR MODULE LOGIC HERE */}
        </main>
      </div>
    </div>
  );
};
```
