# 🚀 Nilo — Core Features Specification & Roadmap (`features.md`)

> **Comprehensive feature specification document for Nilo's four pillar learning capabilities.**  
> *Transforming passive studying into active mastery through conversational voice AI, intelligent handwriting recognition, gamified concept challenges, and immersive virtual experiment sandboxes.*

---

## 📑 Table of Contents

1. [Executive Summary & Product Pillars](#-executive-summary--product-pillars)
2. [Feature 1: Conversational Voice Evaluation Agent (Feynman Method)](#-feature-1-conversational-voice-evaluation-agent-feynman-method)
   - [Overview & User Flow](#11-overview--user-flow)
   - [Verification Engine: What's Right vs. What's Wrong](#12-verification-engine-whats-right-vs-whats-wrong)
   - [Dynamic Mind Map & Knowledge Graph](#13-dynamic-mind-map--knowledge-graph)
   - [Targeted Mistake Remediation ("Teach What You Missed")](#14-targeted-mistake-remediation-teach-what-you-missed)
   - [Technical Architecture](#15-technical-architecture)
3. [Feature 2: Scribble — Intelligent Math Canvas & Step-by-Step Solver](#-feature-2-scribble--intelligent-math-canvas--step-by-step-solver)
   - [Overview & Canvas Capabilities](#21-overview--canvas-capabilities)
   - [Multimodal Equation Vision & Real-time OCR](#22-multimodal-equation-vision--real-time-ocr)
   - [Socratic Step-by-Step Guidance Engine](#23-socratic-step-by-step-guidance-engine)
   - [Error Detection & Canvas Annotations](#24-error-detection--canvas-annotations)
   - [Technical Architecture](#25-technical-architecture)
4. [Feature 3: Interactive Concept Games & Gamification System](#-feature-3-interactive-concept-games--gamification-system)
   - [Overview & Mechanics](#31-overview--mechanics)
   - [Subject Minigames Library](#32-subject-minigames-library)
   - [Coin Economy, XP & Collectible Milestones](#33-coin-economy-xp--collectible-milestones)
   - [Technical Architecture](#34-technical-architecture)
5. [Feature 4: Virtual Lab — Hands-On Simulation & Project Workbench](#-feature-4-virtual-lab--hands-on-simulation--project-workbench)
   - [Overview & Simulation Sandboxes](#41-overview--simulation-sandboxes)
   - [Experiment Lab Workflows (Bio, Chem, Physics, CS)](#42-experiment-lab-workflows-bio-chem-physics-cs)
   - [Interactive Variable Sliders & Live Results](#43-interactive-variable-sliders--live-results)
   - [Lab Reports & Project Portfolio Export](#44-lab-reports--project-portfolio-export)
   - [Technical Architecture](#45-technical-architecture)
6. [System Integration & User Experience Synergy](#-system-integration--user-experience-synergy)
7. [Implementation Timeline & Phase Roadmap](#-implementation-timeline--phase-roadmap)

---

## 🌟 Executive Summary & Product Pillars

Nilo shifts learning from passive memorization to active demonstration. Grounded in the **Feynman Technique** ("if you can't explain it simply, you don't understand it well enough"), Nilo creates an interconnected 4-pillar learning ecosystem:

```
                  ┌───────────────────────────────────────────────┐
                  │                   NILO PLATFORM               │
                  └───────────────────────┬───────────────────────┘
                                          │
         ┌──────────────────┬─────────────┴───────┬──────────────────┐
         │                  │                     │                  │
         ▼                  ▼                     ▼                  ▼
┌──────────────────┐ ┌───────────────┐ ┌────────────────────┐ ┌───────────────┐
│  Pillar 1:       │ │  Pillar 2:    │ │  Pillar 3:         │ │  Pillar 4:    │
│  Voice Agent     │ │  Scribble     │ │  Concept Games     │ │  Virtual Lab  │
│  (Feynman Oral   │ │  (Vision Math │ │  (Gamified Quests  │ │  (Simulation  │
│  Evaluation)     │ │  Step Solver) │ │  & Rewards)        │ │  Workbench)   │
└──────────────────┘ └───────────────┘ └────────────────────┘ └───────────────┘
```

---

## 🎙️ Feature 1: Conversational Voice Evaluation Agent (Feynman Method)

### 1.1 Overview & User Flow
The **Voice Agent** acts as an engaged, intelligent study partner (represented visually by **EXO**, the 3D reactive orb). Instead of asking multiple-choice questions, the agent prompts the student to explain a core topic in their own words.

#### Step-by-Step Flow:
1. **Topic Prompting**: EXO asks a targeted question (e.g., *"Can you explain what happens during the Light-Dependent Reactions of photosynthesis?"*).
2. **Push-to-Talk / Free Voice Input**: Student holds the Spacebar or taps the orb/capsule to record their explanation naturally.
3. **Real-Time Acoustic Feedback**: The capsule displays a live voice-reacting waveform, and EXO’s 3D auras pulse in real-time to the student's voice volume.
4. **Instant Semantic Assessment**: On release, speech is transcribed and evaluated against semantic ground truths using LLM reasoning.
5. **Multi-Faceted Feedback Delivery**:
   - Spoken audio feedback with emotional nuance.
   - Comprehensive breakdown cards ("What you nailed" vs. "What you missed").
   - Dynamic interactive Mind Map.
   - Targeted interactive lesson remediating the exact mistake.

---

### 1.2 Verification Engine: What's Right vs. What's Wrong
The evaluation engine analyzes the explanation across 3 dimensions:
- **Conceptual Accuracy**: Are core principles, causal links, and definitions factually correct?
- **Completeness**: Did the student explain necessary prerequisites and key mechanisms?
- **Clarity & Simplicity**: Did the student use plain English or rely on vague buzzwords without understanding?

#### Output Format:
| Category | UI Presentation | Example |
| :--- | :--- | :--- |
| **✅ What You Got Right** | Green glow card with checkmarks, highlighting student's correct claims | *"You correctly identified that chlorophyll absorbs photons and splits water ($H_2O$) into oxygen ($O_2$) and protons."* |
| **❌ Misconceptions & Gaps** | Amber/Red indicator card highlighting the exact misstatement or omitted step | *"You stated that ATP is produced in the Calvin Cycle. In reality, ATP is generated during the light reactions and consumed in the Calvin Cycle."* |
| **📊 Mastery Confidence Score** | Circular percentage ring + progress breakdown | **74% Mastery** (Accuracy: 88%, Completeness: 60%) |

---

### 1.3 Dynamic Mind Map & Knowledge Graph
Whenever an explanation is evaluated, Nilo automatically constructs or updates a **Dynamic Topic Mind Map**:

```
                       [Photosynthesis]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [Light Reactions]                  [Calvin Cycle]
   (✅ Mastered: 92%)                 (⚠️ Gap Detected: 48%)
            │                                 │
     ┌──────┴──────┐                   ┌──────┴──────┐
     ▼             ▼                   ▼             ▼
[Thylakoid]   [Photolysis]        [Stroma]       [ATP Usage]
  (✅ 95%)       (✅ 88%)          (✅ 80%)       (❌ Confused)
```

- **Visual States**:
  - 🟢 **Green Nodes**: Concepts accurately explained by the student.
  - 🟡 **Yellow Nodes**: Concepts mentioned vaguely or with incomplete relationships.
  - 🔴 **Red Nodes**: Glaring misconceptions or missed critical dependencies.
- **Interactive Exploration**: Students can click any node in the mind map to zoom in, inspect prerequisites, or ask EXO to quiz them on that specific connection.

---

### 1.4 Targeted Mistake Remediation ("Teach What You Missed")
Instead of forcing the student to re-read an entire chapter, EXO initiates a micro-teaching moment:
1. **Targeted Micro-Lesson**: EXO highlights the exact sentence where the deviation occurred.
2. **Simple Analogy Explanation**: Provides a relatable mental model (e.g., *"Think of ATP as a rechargeable battery. The light reaction charges it up; the Calvin cycle drains it to build sugar."*).
3. **Follow-Up Verification Question**: EXO asks a short, one-sentence clarifying question to confirm understanding before moving forward.

---

### 1.5 Technical Architecture
- **Audio Capture**: Web Audio API (`AnalyserNode`) with hardware noise reduction and dynamic smoothing.
- **Speech-to-Text**: Web Speech API (`webkitSpeechRecognition`) fallback to Whisper API for accents and technical terms.
- **Evaluation Engine**: LLM with structured JSON output schema (Accuracy score, Strengths list, Gaps list, MindMap JSON tree, Remediation plan).
- **TTS Delivery**: Web Speech Synthesis API with ElevenLabs neural voice fallback for lifelike conversational warmth.

---

## ✏️ Feature 2: Scribble — Intelligent Math Canvas & Step-by-Step Solver

### 2.1 Overview & Canvas Capabilities
**Scribble** is an interactive, low-latency drawing canvas built for stylus, finger, and mouse input. It gives students the freedom of traditional pen-and-paper scratchpads while equipping them with an AI tutor that "watches" them write.

#### Canvas Features:
- Smooth freehand drawing with stroke smoothing (Bézier curves).
- Grid toggles: Blank, Dot Grid, Graph Paper, Isometric grid for geometry.
- Mathematical toolset: Ruler, protractor, compass, undo/redo, lasso select, clear.
- LaTeX formula rendering overlay directly above handwritten strokes.

---

### 2.2 Multimodal Equation Vision & Real-Time OCR
As the student writes an equation (e.g., $\int (3x^2 - 4x + 1) \,dx$ or $\frac{2x + 5}{3} = 7$), Scribble's multimodal vision engine:
1. **Detects Strokes in Real Time**: Converts canvas strokes into mathematical tokens via Mathpix / Vision LLM.
2. **Live Digital Preview**: Displays a crisp formatted LaTeX equation preview in the top bar to verify OCR accuracy.
3. **Supports Complex Math**: Fractions, square roots, integrals, matrices, exponents, Greek symbols ($\theta, \alpha, \pi$), and geometric sketches.

---

### 2.3 Socratic Step-by-Step Guidance Engine
Scribble is **not a cheat calculator** that outputs the final answer immediately. It operates as a Socratic coach:
- **Step Verification**: When the student writes Line 2, the agent checks whether Line 2 logically follows from Line 1.
- **Non-Intrusive Encouragement**: If correct, a subtle green checkmark appears beside the line (`✓ Good step! Now isolate x`).
- **Interactive Hints**: When stuck, clicking *"Give me a hint"* provides a conceptual clue (e.g., *"Remember to multiply both sides by 3 before subtracting 5"*) rather than revealing the answer.

---

### 2.4 Error Detection & Canvas Annotations
When a student makes an arithmetic or algebraic blunder:
- **Targeted Canvas Circling**: The AI highlights the exact error region on the canvas with a soft coral pen halo.
- **Margin Note**: A friendly sticky annotation appears beside the line:
  > *"Oops! When distributing $-2(x - 3)$, remember that $-2 \times -3 = +6$, not $-6$."*
- **Undo & Retry**: The student can erase that line and rewrite it, reinforcing muscle memory.

---

### 2.5 Technical Architecture
- **Canvas Rendering**: HTML5 Canvas with OffscreenCanvas worker for 60fps rendering without UI lag.
- **Vision Pipeline**: Base64 stroke image snapshotting debounced to 600ms after pen lift.
- **Math Engine**: Computer Algebra System (SymPy / MathJS) coupled with Claude 3.5 Sonnet / Gemini Vision for semantic mathematical reasoning.
- **LaTeX Renderer**: KaTeX for instant formula rendering.

---

## 🎮 Feature 3: Interactive Concept Games & Gamification System

### 3.1 Overview & Mechanics
Concept Games bridge the gap between theoretical study and intuitive understanding. By gamifying core concepts into fast-paced interactive challenges, students develop rapid recall and structural intuition.

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONCEPT GAMES PORTAL                        │
├─────────────────┬───────────────────┬───────────────────────────┤
│ 🧪 ChemBalance   │ ⚡ CircuitRun     │ 📐 AngleSniper            │
│ Balance chemical│ Build working     │ Estimate angles & vectors │
│ equations under │ circuits to power │ to hit orbital targets!   │
│ time pressure!  │ futuristic cities │                           │
└─────────────────┴───────────────────┴───────────────────────────┘
```

---

### 3.2 Subject Minigames Library

#### 1. ChemBalance (Chemistry)
- **Objective**: Balance stoichiometry equations before time runs out.
- **Gameplay**: Drag coefficient molecules onto scales. Atoms visually assemble into 3D compound models; matching left and right masses opens the next valve.

#### 2. CircuitCraft (Physics & Electronics)
- **Objective**: Route electrical current to power specific components without overloading resistors.
- **Gameplay**: Snap resistors, capacitors, switches, and LEDs onto a modular breadboard. Real-time Ohm’s law simulations show voltage drops and current flow animations.

#### 3. VectorVoyager (Math & Mechanics)
- **Objective**: Navigate a spacecraft through gravity wells and asteroid belts.
- **Gameplay**: Add vector arrows ($x$ and $y$ components) to set trajectory, demonstrating velocity vs. acceleration and resultant forces.

#### 4. CodeQuest: Algorithm Arena (Computer Science)
- **Objective**: Guide a rover through obstacle mazes using visual logic blocks (loops, conditionals, recursion).

---

### 3.3 Coin Economy, XP & Collectible Milestones ("Concepts / Pets")
- **Earn Learning Coins**: Earn coins for every verified explanation, completed Scribble problem, and game win.
- **Streak Multipliers**: Maintain daily practice streaks to multiply coin earnings (e.g., 5-day streak = 1.5x coins).
- **Companion Evolutions & Accessories**: Use coins to customize your 3D EXO companion (e.g., Retro Headphones 🎧, Neon Visors 🥽, Golden Auras, Orbital Rings).
- **Mastery Badges**: Showcase badges on student profiles (*"Photosynthesis Virtuoso"*, *"Calculus Titan"*, *"Circuit Architect"*).

---

### 3.4 Technical Architecture
- **Game Engines**: Lightweight 2D canvas with Matter.js physics engine, WebGL, and Three.js mini-scenes.
- **Audio Feedback**: Web Audio synthesized retro sound effects for successes, combos, and coin rings.
- **State Persistence**: Supabase / AWS DynamoDB storing XP, coin balances, unlocked cosmetics, and game high scores.

---

## 🔬 Feature 4: Virtual Lab — Hands-On Simulation & Project Workbench

### 4.1 Overview & Simulation Sandboxes
The **Virtual Lab** is a virtual experimental sandbox enabling students to conduct authentic science experiments and engineering projects directly in the browser without expensive equipment or safety hazards.

---

### 4.2 Experiment Lab Workflows

```
┌─────────────────────────────────────────────────────────────────┐
│                VIRTUAL LAB: CHEMISTRY TITRATION                 │
├───────────────────────────────┬─────────────────────────────────┤
│  [ Interactive Apparatus ]    │  [ Live Measurements ]          │
│                               │  • Buret Volume: 14.2 mL        │
│    ┌───┐                      │  • Solution pH: 7.02            │
│    │   │ Buret (0.1M NaOH)    │  • Indicator: Phenolphthalein   │
│    └───┘                      │                                 │
│      │  Drop Rate: [ ==o== ]  │  [ Real-Time Titration Curve ]  │
│      ▼                        │    pH 14 ┌─────────/─┐          │
│   ┌─────┐                     │          │        /  │          │
│   │ 🌸  │ Flask (HCl + Ind.)  │        7 ├───────/───┤          │
│   └─────┘ Pale Pink Transition│        0 └───────┴───┘          │
│                               │           0   10  20 mL NaOH    │
└───────────────────────────────┴─────────────────────────────────┘
```

#### Supported Lab Modules:
1. **Cell Biology & Microscopy Lab**:
   - Stain and examine virtual specimen slides (onion cell, cheek cell, chloroplasts).
   - Adjust objective lenses (4x, 10x, 40x, 100x oil immersion), fine focus, and illumination.
2. **Acid-Base Titration & Reaction Lab**:
   - Dispense titrants drop-by-drop with stopcock controls.
   - Observe real-time color transitions with phenolphthalein, bromothymol blue, and pH meter readings.
3. **Optics & Wave Physics Bench**:
   - Position laser emitters, convex/concave lenses, prisms, and mirrors on an optical rail.
   - Measure refraction indices (Snell's Law) and interference patterns.
4. **DNA Electrophoresis & Genetics Bench**:
   - Pipette DNA samples into agarose gel wells, run current, and visualize UV fluorescent band separations.

---

### 4.3 Interactive Variable Sliders & Live Results
Every experiment includes adjustable variables:
- **Environmental Controls**: Temperature, pressure, concentration, gravity, resistance.
- **Instant Causality**: Adjusting temperature increases molecular collision rates and reaction velocity instantaneously.
- **Data Plotting**: Automatic generation of real-time graphs ($XY$ plots, bar charts, logarithmic scales) as data points are collected.

---

### 4.4 Lab Reports & Project Portfolio Export
- **Automated Data Tables**: Records every trial, measurement, and calculated error percentage.
- **Hypothesis Testing**: Students formulate a hypothesis before starting, and the report prompts them to accept or refute it based on observed data.
- **One-Click PDF / Shareable Link**: Export professional lab reports with student conclusions, graphs, and teacher grading rubrics.

---

### 4.5 Technical Architecture
- **Physics/Simulation Core**: Mathematical physics solvers running in Web Workers to prevent UI frame drops.
- **Rendering**: Canvas2D and Three.js 3D models for equipment and apparatus.
- **Chart Visualizations**: Chart.js / Recharts for responsive, interactive scientific graphs.

---

## 🔄 System Integration & User Experience Synergy

All four features interconnect to form an unbroken learning loop:

```
                  ┌───────────────────────────────┐
                  │ 1. Voice Agent (EXO)          │
                  │ Student explains Photosynthesis│
                  └───────────────┬───────────────┘
                                  │
                       Gap Detected in Math of
                       Light Absorption Wavelengths
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │ 2. Scribble Math Solver       │
                  │ Student calculates photon     │
                  │ energy: E = hc / λ            │
                  └───────────────┬───────────────┘
                                  │
                       Reinforce Intuition with
                       Interactive Play
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │ 3. Concept Game (VectorVoyager│
                  │ Collect photons of target λ   │
                  │ Earn 150 Coins + Trophy       │
                  └───────────────┬───────────────┘
                                  │
                       Conduct Authentic Hands-On
                       Laboratory Project
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │ 4. Virtual Lab                │
                  │ Run Spectrophotometer test    │
                  │ on spinach extract & export   │
                  └───────────────────────────────┘
```

---

## 📅 Implementation Timeline & Phase Roadmap

| Phase | Milestone | Features Covered | Key Deliverables |
| :---: | :--- | :--- | :--- |
| **Phase 1** | **Oral Verification & Mind Maps** | Feature 1 (Voice Agent) | Real-time voice verification, Strengths/Gaps breakdown, Dynamic SVG/D3 Mind Map, Targeted Remediation |
| **Phase 2** | **Scribble Math Canvas** | Feature 2 (Scribble) | Low-latency stylus canvas, Multimodal OCR, Socratic step-by-step guidance, In-line error circling |
| **Phase 3** | **Interactive Concept Games** | Feature 3 (Gamification) | 4 core minigames, Coin & streak economy, EXO companion cosmetics, Leaderboard system |
| **Phase 4** | **Virtual Lab Workbench** | Feature 4 (Virtual Lab) | 4 simulation modules, Variable slider engine, Live data graphing, Automated lab report generation |
| **Phase 5** | **Ecosystem Unification** | All Features | Cross-feature learning pathways, Unified student mastery index, Parent/Teacher dashboard |

---

*Authored for the **Nilo** Engineering & Product Team. Document Version: 1.0.0*

