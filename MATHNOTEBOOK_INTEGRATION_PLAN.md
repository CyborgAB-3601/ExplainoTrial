# MathNoteBook to Scratchpad Integration Plan

## 1. Executive Summary: What is MathNoteBook?

**MathNoteBook** (developed by Abpattar) is an AI-powered, multi-modal, inclusive mathematics learning platform built on the principle:
> **"ONE Mathematical Problem · ONE Verified Mathematical Solution · MULTIPLE Ways of Understanding."**

It combines **computer algebra solving**, **handwriting recognition**, **interactive visual models**, and **assistive multimodal accommodations** for neurodivergent, blind/low-vision, and deaf/hard-of-hearing learners.

---

## 2. Core Subsystems & Components in MathNoteBook

### A. Core Mathematical Engines & Solvers
| Subsystem | Tech Stack | Role in MathNoteBook |
| :--- | :--- | :--- |
| **SymPy CAS Solver** | Python 3.12 / SymPy | Formal step-by-step algebraic equation solver, root finder, and step-equivalence verifier. |
| **Ink-On OCR Engine** | ONNX Runtime / Groq Vision | Dual-engine recognition of handwritten mathematical formulas directly from canvas strokes. |
| **Mathua Concept DAG** | Graph Engine (3,015 Nodes) | Resolves prerequisite concept dependencies (e.g., *Solving Linear Equations* $\rightarrow$ *Inverse Operations* $\rightarrow$ *Combining Like Terms*). |
| **Unified Math Representation (UMR)** | Pydantic / TypeScript Schema | Single JSON payload containing LaTeX, MathML, solutions, visualizer parameters, speech, Braille, and sign gestures. |

### B. Interactive Mathematical Visualizers (`components/visualizations/`)
1. **Equation Balance Scale (`EquationBalanceVisualizer.tsx`)**:
   - Physics-inspired SVG balance beam illustrating operations applied symmetrically to both sides of an equation (e.g. subtracting $5$ from both pans).
2. **Algebra Tiles Area Model (`AlgebraTilesVisualizer.tsx`)**:
   - Interactive 2D grid model for quadratic factoring and binomial products: $(x+p)(x+q) = x^2 + (p+q)x + pq$.
3. **Parabola & Quadratic Roots Explorer (`ParabolaVisualizer.tsx`)**:
   - Dynamic SVG quadratic curve with real-time vertex $(-b/2a, -\Delta/4a)$, discriminant $\Delta$, and root coordinates.
4. **Geometry Diagram Engine (`GeometryDiagramVisualizer.tsx` / `diagram/`)**:
   - Coordinate plane geometry and triangle/angle relationship generator.

### C. Multimodal & Accessibility Accommodations
1. **MathCAT Speech Narration (`AccessibilityPanel.tsx`)**:
   - Reads LaTeX using natural pedagogical spoken English (ClearSpeak & SimpleSpeak standards).
2. **Tactile Braille Card (`AccessibilityPanel.tsx`)**:
   - Generates copyable and displayable Nemeth Code and Unified English Braille (UEB) for equations and intermediate steps.
3. **ISL (Indian Sign Language) 3D Avatar (`ISLSkeletonViewer.tsx`)**:
   - 3D skeletal landmark playback for mathematical tokens (`+`, `-`, `=`, squared, numbers, operations) using pre-recorded kinematic sequences.
4. **MAIDR Pitch Sonification (`hooks/useSonification.ts`)**:
   - Converts curves into continuous audio frequencies ($220\,\text{Hz} - 880\,\text{Hz}$) navigated via spatial keyboard arrows for auditory curve comprehension.

### D. Practice Mode & Adaptive Hint Ladder (`practice/`)
- Step-by-step student practice input (`AttemptInput.tsx`).
- Graduated scaffolding hints: Level 1 (Nudge), Level 2 (Conceptual), Level 3 (Actionable calculation) (`HintLadder.tsx`).
- Misconception diagnosis banner (`MisconceptionBanner.tsx`).

---

## 3. How It Fits Into Explaino's `ScratchpadView`

In Explaino, the Scratchpad is the **Math Sandbox** (`d:\Explaino\src\Scratchpad\ScratchpadView.tsx`). Currently, it features:
- A freehand digital whiteboard (Pen, Eraser, Clear).
- Sample hints cards for $2x + 5 = 15$.
- A Socratic AI tutor chat in the right side panel.
- Left rail with navigation and draggable accessibility tools.

### Visual Architecture Alignment:
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Explaino Top App Bar (Title, Breadcrumb, Canvas Controls, Back to Home)                         │
├────────┬────────────────────────────────────────────────────────┬────────────────────────────────┤
│ Left   │ Center: Scratchpad Interactive Workspace                │ Right: Socratic AI Tutor Panel │
│ Rail   │ ┌────────────────────────────────────────────────────┐ │                                │
│ (Nav,  │ │ Tab Bar: [Canvas Whiteboard] [Visual Models]       │ │ • Step Hints & Verification    │
│ Access │ │          [Prerequisites Chain] [Practice Mode]     │ │ • Voice / Text Dialogue        │
│ ibility│ ├────────────────────────────────────────────────────┤ │ • Pedagogical Explanation      │
│ Option)│ │ • MathCanvas (Freehand + Auto Equation OCR)        │ │                                │
│        │ │ • Embedded Visualizers (Balance Scale, Tiles, Graph)│ │                                │
│        │ │ • MathDisplay (KaTeX step-by-step solution)        │ │                                │
│        │ ├────────────────────────────────────────────────────┤ │                                │
│        │ │ Bottom Dock: Accessibility Bar                     │ │                                │
│        │ │ [🔊 ClearSpeak] [📋 Nemeth Braille] [🤟 ISL Sign] │ │                                │
│        │ └────────────────────────────────────────────────────┘ │                                │
└────────┴────────────────────────────────────────────────────────┴────────────────────────────────┘
```

---

## 4. Phased Integration Roadmap

### Phase 1: Pure Frontend Component Porting (Zero Breaking Changes)
- **Target**: Port visualizers and client-side accessible mathematical modules into `src/Scratchpad/components/`.
- **Items**:
  1. `EquationBalanceVisualizer.tsx` $\rightarrow$ Interactive balance scale for algebraic equations.
  2. `AlgebraTilesVisualizer.tsx` $\rightarrow$ Area model for factoring polynomials.
  3. `ParabolaVisualizer.tsx` $\rightarrow$ Quadratic graph visualizer with draggable vertex and roots.
  4. `MathDisplay.tsx` $\rightarrow$ Beautiful KaTeX step-by-step solution card.
  5. `AccessibilityDock.tsx` $\rightarrow$ ClearSpeak audio speech, Nemeth Braille card, and ISL gesture avatar.
- **Styling**: Adapt to Explaino's design system (`#8E2856` berry accent, frosted glass `bg-white/80`, `border-[#EBE6F0]`, rounded-2xl cards).

### Phase 2: Canvas Handwriting & Equation Recognition Integration
- Integrate the stroke tracking from `MathCanvas.tsx` into `ScratchpadView.tsx`.
- Connect the auto-recognition trigger: when user sketches an equation, recognize it and generate the live steps in the AI Tutor panel.
- Preserve full backward compatibility with the existing Pen, Eraser, and Grid modes.

### Phase 3: Socratic Chat & Hint Ladder Synchronization
- Synchronize the right AI tutor chat in `ScratchpadView` with MathNoteBook's `HintLadder`:
  - When student gets stuck, AI tutor automatically offers Level 1, 2, or 3 hints.
  - Detect common mathematical misconceptions (e.g. subtracting instead of dividing).

### Phase 4: Backend Orchestrator Service (Optional / Modular)
- Connect to MathNoteBook's FastAPI backend (`/api/orchestrate/process`) or bundle lightweight client-side mathematical solvers (mathjs / SymPy WebAssembly) for offline execution.
- Maintain mock/fallback mode so Explaino functions seamlessly without a running Python backend.

---

## 5. Non-Regression Safeguards for Explaino Main UI
1. **Isolated Submodule**: All MathNoteBook code will live strictly inside `src/Scratchpad/` and its subdirectories.
2. **Preserve Main Routing**: `HomePage.tsx`, `ResourcesView.tsx`, and `GamesView.tsx` will remain untouched.
3. **No Dependency Conflicts**: MathNoteBook only requires standard React and KaTeX, perfectly compatible with Explaino's `vite` setup.
4. **Theme Preservation**: All MathNoteBook visual components will adopt Explaino's design tokens (fonts, borders, berry accents).
