import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Smile,
  Plus,
  X,
  Minus,
  Square,
  LayoutGrid,
  Edit2,
  FileText,
  GraduationCap,
  Info,
  Palette,
  Settings,
  Trophy,
  Undo2,
  Redo2,
  Pencil,
  Eraser,
  MousePointer,
  Grid,
  Send,
  ArrowLeft,
  Scale,
  Grid3X3,
  Activity,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityMenu } from '../components/AccessibilityMenu';
import { AccessibilityIcon } from '../components/AccessibilityIcon';
import { EquationBalanceVisualizer } from './components/visualizers/EquationBalanceVisualizer';
import { AlgebraTilesVisualizer } from './components/visualizers/AlgebraTilesVisualizer';
import { ParabolaVisualizer } from './components/visualizers/ParabolaVisualizer';
import { solveMathProblem, SolvedProblem } from './utils/mathSolver';
import {
  recognizeHandwritingFromCanvas,
  generateInteractiveTutoringPlan,
  InteractiveTutoringPlan,
  validateStudentAnswer,
  isCanvasDrawn,
  cleanMathTextForChat,
} from './services/groqMathService';

export interface ScratchpadViewProps {
  onBack?: () => void;
  className?: string;
}

export const ScratchpadView: React.FC<ScratchpadViewProps> = ({
  onBack,
  className = '',
}) => {
  // Accessibility state
  const { isMenuOpen, toggleMenu, setIsMenuOpen } = useAccessibility();

  // Canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'select' | 'shape' | 'grid'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Scratchpad Workspace Mode: Canvas whiteboard vs interactive math visualizers
  type ScratchpadMode = 'canvas' | 'balance' | 'tiles' | 'parabola';
  const [scratchpadMode, setScratchpadMode] = useState<ScratchpadMode>('canvas');

  // Chat input state
  const [chatInput, setChatInput] = useState('');

  // Active interactive tutoring plan (works for linear, quadratic, circles, triangles, trig, proofs)
  const [currentPlan, setCurrentPlan] = useState<InteractiveTutoringPlan | null>(null);

  // Dynamic parameters for the interactive visualizers
  const [balanceParams, setBalanceParams] = useState({ a: 2, b: 5, c: 15 });
  const [tilesParams, setTilesParams] = useState({ p: 2, q: 3 });
  const [parabolaParams, setParabolaParams] = useState({ a: 1, b: -2, c: -3 });

  // Chat message thread - Starts clean with NO default messages as requested
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; sender: 'user' | 'ai'; text: string }>>([]);

  // Handwriting & AI Analysis states
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false);

  // Canvas drawing setup - Starts completely clean and blank
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on client size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Clear whiteboard canvas
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setCurrentPlan(null);
    setCurrentStepIndex(0);
    setIsStepCompleted(false);
  };

  // Render step-by-step solution derivation cleanly on the whiteboard
    const writeSolutionOnCanvas = (plan: InteractiveTutoringPlan, stepIndex: number = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      if (canvas.width === 0 || canvas.height === 0) {
        canvas.width = (rect.width || 800) * window.devicePixelRatio;
        canvas.height = (rect.height || 600) * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      const W = rect.width || canvas.width / window.devicePixelRatio;
      const H = rect.height || canvas.height / window.devicePixelRatio;

      // Clear board first
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Problem Header
      ctx.fillStyle = '#8E2856';
      ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(cleanMathTextForChat(plan.originalEquation), 60, 90);

      // Decorative underline
      ctx.strokeStyle = '#E9D5E4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(60, 106);
      ctx.lineTo(Math.min(W - 80, 420), 106);
      ctx.stroke();

      let curY = 150;

      // 2. Render steps revealed up to stepIndex
      const totalSteps = plan.steps?.length || 0;
      const stepsToRender = plan.steps ? plan.steps.slice(0, stepIndex + 1) : [];

        stepsToRender.forEach((step) => {
          // Step title badge
          ctx.fillStyle = '#8E2856';
          ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(`Step ${step.stepNumber}: ${cleanMathTextForChat(step.title)}`, 60, curY);
          curY += 28;

            // Mathematical expression
            ctx.fillStyle = '#1E1926';
            ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(cleanMathTextForChat(step.boardExpression), 80, curY);
            curY += 40;
          });

        // If there is a next step still waiting for student input:
        if (stepIndex < totalSteps - 1) {
          ctx.save();
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = '#CBD5E1';
          ctx.fillStyle = '#F8FAFC';

          const nextY = curY + 6;
          ctx.strokeRect(60, nextY, 340, 48);
          ctx.fillRect(60, nextY, 340, 48);

          ctx.fillStyle = '#64748B';
          ctx.font = 'italic 13px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(`Step ${stepIndex + 2}: Waiting for your answer in chat...`, 80, nextY + 30);
          ctx.restore();
        } else if (totalSteps > 0 && stepIndex >= totalSteps - 1) {
          // 3. Final Solution Card when all steps are completed!
          const pillY = curY + 8;
          const pillW = 280;
          const pillH = 46;
          const r = 12;

        ctx.fillStyle = '#ECFDF5';
        ctx.strokeStyle = '#A7F3D0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(60 + r, pillY);
        ctx.lineTo(60 + pillW - r, pillY);
        ctx.quadraticCurveTo(60 + pillW, pillY, 60 + pillW, pillY + r);
        ctx.lineTo(60 + pillW, pillY + pillH - r);
        ctx.quadraticCurveTo(60 + pillW, pillY + pillH, 60 + pillW - r, pillY + pillH);
        ctx.lineTo(60 + r, pillY + pillH);
        ctx.quadraticCurveTo(60, pillY + pillH, 60, pillY + pillH - r);
        ctx.lineTo(60, pillY + r);
        ctx.quadraticCurveTo(60, pillY, 60 + r, pillY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#065F46';
        ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`✓ ${cleanMathTextForChat(plan.solution)}`, 80, pillY + 28);
      }

      ctx.restore();
    };



    // Drawing event handlers
    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsDrawing(true);
      setHasDrawn(true);
      ctx.beginPath();
      ctx.moveTo(x, y);

      if (activeTool === 'eraser') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 24;
      } else {
        ctx.strokeStyle = '#1E1926';
        ctx.lineWidth = 3;
      }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handlePointerUp = () => {
      setIsDrawing(false);
    };

    // Triggered when user enters math question in chat or draws on whiteboard and hits Enter
    const handleSendMessage = async () => {
      if (isAnalyzing) return;
      const rawQuery = chatInput.trim();
      const canvas = canvasRef.current;
      const hasCanvasContent = hasDrawn && canvas && isCanvasDrawn(canvas);

      if (!rawQuery && !hasCanvasContent) return;

      // A. Socratic Interactive Step Response:
        // If student is answering the current step of an ongoing problem
        if (currentPlan && !isStepCompleted && !hasCanvasContent && rawQuery) {
          setChatInput('');

          // 1. Append user's chat response
          const userMsg = {
            id: Date.now(),
            sender: 'user' as const,
            text: cleanMathTextForChat(rawQuery),
          };
          setChatMessages((prev) => [...prev, userMsg]);

          // 2. Validate student's answer
          const currentStep = currentPlan.steps[currentStepIndex];
          const validation = validateStudentAnswer(rawQuery, currentStep?.expectedAnswer || '');

          // 3. Advance to the next step
          const nextStepIndex = currentStepIndex + 1;
          const totalSteps = currentPlan.steps?.length || 1;
          setCurrentStepIndex(nextStepIndex);

            // 4. Render on whiteboard canvas (ALWAYS stays on white canvas)
            setScratchpadMode('canvas');
            writeSolutionOnCanvas(currentPlan, nextStepIndex);

            // 5. Check if problem is now completed
            if (nextStepIndex >= totalSteps - 1) {
              setIsStepCompleted(true);
              const finalAiResponse = cleanMathTextForChat(
                `${validation.feedback}\n\n` +
                `✓ Final Solution: ${currentPlan.solution}!\n\n` +
                `Brilliant job! You've completed every step on your whiteboard.` +
                (currentPlan.visualModel ? ` If you'd like to inspect the physical visual model, click below!` : '')
              );

              setTimeout(() => {
                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now() + 1,
                    sender: 'ai' as const,
                    text: finalAiResponse,
                  },
                ]);
              }, 120);
            } else {
              // Next intermediate step prompt
              const nextStepObj = currentPlan.steps[nextStepIndex];
              const nextPrompt = cleanMathTextForChat(
                `${validation.feedback}\n\n` +
                `${nextStepObj.questionForStudent}`
              );

              setTimeout(() => {
                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now() + 1,
                    sender: 'ai' as const,
                    text: nextPrompt,
                  },
                ]);
              }, 120);
            }
            return;
          }

          // B. Otherwise, this is a NEW equation or drawing
          setIsAnalyzing(true);
          setChatInput('');

          let problemText = rawQuery;
          let userMsgText = rawQuery;

          // 1. If student drew on whiteboard, invoke Groq Vision OCR
            if (hasCanvasContent && canvas) {
              try {
                const recognized = await recognizeHandwritingFromCanvas(canvas);
                if (recognized) {
                  problemText = cleanMathTextForChat(recognized);
                  userMsgText = rawQuery
                    ? `✍️ [From Whiteboard]: ${problemText}\n"${cleanMathTextForChat(rawQuery)}"`
                    : `✍️ [From Whiteboard]: ${problemText}`;
                }
              } catch (err) {
                console.warn('Vision OCR could not transcribe:', err);
              }
            }

            // 2. Append User Message to Chat Thread
            const userMsg = {
              id: Date.now(),
              sender: 'user' as const,
              text: cleanMathTextForChat(userMsgText),
            };
            setChatMessages((prev) => [...prev, userMsg]);

            // 3. Generate Interactive Tutoring Plan (Works for linear, quadratic, circles, triangles, trig, proofs)
            try {
              const plan = await generateInteractiveTutoringPlan(problemText);
              setCurrentPlan(plan);
              setCurrentStepIndex(0);
              setIsStepCompleted(plan.steps.length <= 1);

              // 4. Update dynamic visualizer parameters
              if (plan.params) {
                if (plan.params.a !== undefined || plan.params.b !== undefined || plan.params.c !== undefined) {
                  setBalanceParams({
                    a: plan.params.a ?? 2,
                    b: plan.params.b ?? 5,
                    c: plan.params.c ?? 10,
                  });
                  setParabolaParams({
                    a: plan.params.a ?? 1,
                    b: plan.params.b ?? -2,
                    c: plan.params.c ?? -3,
                  });
                }
                if (plan.params.p !== undefined && plan.params.q !== undefined) {
                  setTilesParams({
                    p: plan.params.p,
                    q: plan.params.q,
                  });
                }
              }

              // 5. Render Step 1 onto the whiteboard canvas
              // IMPORTANT: MUST STAY ON WHITE CANVAS ONLY (No auto-switching away)
              setScratchpadMode('canvas');
              writeSolutionOnCanvas(plan, 0);

              // 6. In Chat, present Step 1 and wait for student answer
              const initialStep = plan.steps[0];
              const initialChatMsg = cleanMathTextForChat(
                `I see you wrote: ${plan.originalEquation} on the whiteboard!\n\n` +
                `${initialStep.questionForStudent}`
              );

              setTimeout(() => {
                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now() + 1,
                    sender: 'ai' as const,
                    text: initialChatMsg,
                  },
                ]);
              }, 100);

            } catch (err) {
              console.error('Error generating tutoring plan:', err);
              const fallbackSolved = solveMathProblem(problemText);
              const fallbackPlan: InteractiveTutoringPlan = {
                topic: 'Mathematics',
                originalEquation: fallbackSolved.originalEquation,
                solution: fallbackSolved.solution,
                visualModel: fallbackSolved.visualModel,
                steps: [
                  {
                    stepNumber: 1,
                    title: 'Solve Equation',
                    boardExpression: fallbackSolved.originalEquation,
                    questionForStudent: `What is the first step to solve ${fallbackSolved.originalEquation}?`,
                    expectedAnswer: fallbackSolved.solution,
                  },
                ],
              };
              setCurrentPlan(fallbackPlan);
              setCurrentStepIndex(0);
              setIsStepCompleted(false);
              setScratchpadMode('canvas');
              writeSolutionOnCanvas(fallbackPlan, 0);

              setChatMessages((prev) => [
                ...prev,
                {
                  id: Date.now() + 1,
                  sender: 'ai' as const,
                  text: cleanMathTextForChat(`Let's solve ${fallbackSolved.originalEquation} step-by-step. What is your first step?`),
                },
              ]);
            } finally {
              setIsAnalyzing(false);
              setHasDrawn(false);
            }
          };

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
          1. EXTREME LEFT VERTICAL RAIL (Width: 52px)
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
                  <button
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all cursor-pointer"
                    title="Favorites"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all cursor-pointer"
                    title="Stickers"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {/* Accessibility Option - Just above + */}
                  <button
                    onClick={toggleMenu}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isMenuOpen
                      ? 'bg-[#8E2856] text-white shadow-sm ring-2 ring-[#8E2856]/30'
                      : 'text-slate-500 hover:text-[#8E2856] hover:bg-white/80'
                      }`}
                    title="Accessibility Options"
                    aria-label="Accessibility Options"
                  >
                    <AccessibilityIcon className="w-4 h-4" />
                  </button>

                  <button
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-purple-600 hover:bg-white/80 transition-all cursor-pointer"
                    title="New Canvas"
                  >
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
          NEXT MENU: ACCESSIBILITY OPTIONS (Opens adjacent to the leftmost menu)
         ========================================================================= */}
              {isMenuOpen && (
                <AccessibilityMenu
                  onClose={() => setIsMenuOpen(false)}
                  onReadAloudCustomText="Math Sandbox: Solving linear equations. Current equation on board: 2x plus 5 equals 15. Hint: To isolate 2x, try to get rid of plus 5 first by subtracting 5 from both sides, which gives 2x equals 10. Then divide both sides by 2 to find x equals 5."
                />
              )}

              {/* =========================================================================
          2. MAIN CONTENT AREA (TOP BAR + CANVAS + RIGHT CHAT PANEL)
         ========================================================================= */}
              <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

                {/* ── TOP HEADER / TOOLBAR BAR ── */}
                <header className="h-14 px-4 flex items-center justify-between border-b border-[#EBE6F0]/80 bg-white/40 backdrop-blur-md shrink-0 z-20">

                  {/* Left: Math Sandbox Title & Icons */}
                  <div className="flex items-center gap-2.5">
                    <button className="p-1.5 rounded-lg text-slate-600 hover:bg-white/60 transition-colors">
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <h1 className="text-[15px] font-extrabold tracking-tight text-[#1E1926]">
                      Math Sandbox
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
                      <button className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer" title="Learn">
                        <GraduationCap className="w-4 h-4" />
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

                {/* ── SPLIT BODY: CANVAS + CHAT ── */}
                <div className="flex-1 flex overflow-hidden">

                  {/* ── LEFT: DRAWING CANVAS AREA ── */}
                  <div className="flex-1 relative p-4 flex flex-col items-center justify-center overflow-hidden">

                    {/* White Rounded Canvas Card */}
                    <div className="relative w-full h-full bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">

                      {/* Top Sub-Bar: Mode Selector (Whiteboard vs Interactive Math Models) */}
                      <div className="h-11 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-md z-30">
                        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
                          <button
                            onClick={() => setScratchpadMode('canvas')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${scratchpadMode === 'canvas'
                              ? 'bg-white text-[#8E2856] shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                              }`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Whiteboard</span>
                          </button>
                          <button
                            onClick={() => setScratchpadMode('balance')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${scratchpadMode === 'balance'
                              ? 'bg-white text-[#8E2856] shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                              }`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Balance Scale</span>
                          </button>
                          <button
                            onClick={() => setScratchpadMode('tiles')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${scratchpadMode === 'tiles'
                              ? 'bg-white text-[#8E2856] shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                              }`}
                          >
                            <Grid3X3 className="w-3.5 h-3.5" />
                            <span>Algebra Tiles</span>
                          </button>
                          <button
                            onClick={() => setScratchpadMode('parabola')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${scratchpadMode === 'parabola'
                              ? 'bg-white text-[#8E2856] shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                              }`}
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Quadratic Curve</span>
                          </button>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block">
                          {scratchpadMode === 'canvas' && (currentPlan ? `${currentPlan.topic}: ${currentPlan.originalEquation}` : 'Clean Mathematical Sandbox')}
                          {scratchpadMode === 'balance' && `Physical Inverse Balance: ${balanceParams.a}x + ${balanceParams.b} = ${balanceParams.c}`}
                          {scratchpadMode === 'tiles' && `Visual Area Model: (x + ${tilesParams.p})(x + ${tilesParams.q})`}
                          {scratchpadMode === 'parabola' && `Quadratic Exploration: y = ${parabolaParams.a}x² + ${parabolaParams.b}x + ${parabolaParams.c}`}
                        </span>
                      </div>

                      {/* View Container */}
                      <div className="relative flex-1 w-full min-h-0 overflow-hidden">
                        {/* 1. Whiteboard Canvas (Always preserved in DOM so drawings are never lost!) */}
                        <div className={`w-full h-full relative ${scratchpadMode === 'canvas' ? 'block' : 'hidden'}`}>
                          {/* Floating Canvas Drawing Toolbar Pill */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md">
                            {/* Pen tool */}
                            <button
                              onClick={() => setActiveTool('pen')}
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${activeTool === 'pen'
                                ? 'bg-[#FAF2F6] text-[#8E2856] ring-1 ring-[#8E2856]/30'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              title="Pen Tool"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Eraser */}
                            <button
                              onClick={() => setActiveTool('eraser')}
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${activeTool === 'eraser'
                                ? 'bg-[#FAF2F6] text-[#8E2856] ring-1 ring-[#8E2856]/30'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              title="Eraser"
                            >
                              <Eraser className="w-4 h-4" />
                            </button>

                            {/* Select / Lasso */}
                            <button
                              onClick={() => setActiveTool('select')}
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${activeTool === 'select'
                                ? 'bg-[#FAF2F6] text-[#8E2856]'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              title="Select"
                            >
                              <MousePointer className="w-4 h-4" />
                            </button>

                            <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

                            {/* Undo */}
                            <button className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Undo Stroke">
                              <Undo2 className="w-4 h-4" />
                            </button>

                            {/* Redo */}
                            <button className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Redo Stroke">
                              <Redo2 className="w-4 h-4" />
                            </button>

                            <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

                            {/* Shape / Rectangle */}
                            <button
                              onClick={() => setActiveTool('shape')}
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${activeTool === 'shape'
                                ? 'bg-[#FAF2F6] text-[#8E2856]'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              title="Rectangle / Shapes"
                            >
                              <Square className="w-4 h-4" />
                            </button>

                            {/* Grid toggle */}
                            <button
                              onClick={() => setShowGrid(prev => !prev)}
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${showGrid
                                ? 'bg-[#FAF2F6] text-[#8E2856]'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              title="Toggle Grid Lines"
                            >
                              <Grid className="w-4 h-4" />
                            </button>

                            <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

                            {/* Clear Canvas */}
                            <button
                              onClick={handleClearCanvas}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Clear Whiteboard"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Grid background overlay if enabled */}
                          {showGrid && (
                            <div
                              className="absolute inset-0 pointer-events-none opacity-20"
                              style={{
                                backgroundImage: 'linear-gradient(#94A3B8 1px, transparent 1px), linear-gradient(90deg, #94A3B8 1px, transparent 1px)',
                                backgroundSize: '24px 24px',
                              }}
                            />
                          )}

                          {/* Floating indicator when visual model is ready */}
                          {currentPlan && currentPlan.visualModel && (
                            <div className="absolute bottom-4 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#8E2856]/20 shadow-md">
                              <div className="w-2 h-2 rounded-full bg-[#8E2856] animate-pulse" />
                              <span className="text-xs font-semibold text-slate-700">
                                Visual Model:
                              </span>
                              <button
                                onClick={() => setScratchpadMode(currentPlan.visualModel!)}
                                className="px-2.5 py-1 rounded-xl bg-[#FAF2F6] hover:bg-[#F4E3ED] text-[#8E2856] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>
                                  {currentPlan.visualModel === 'balance'
                                    ? 'Open Balance Scale'
                                    : currentPlan.visualModel === 'tiles'
                                      ? 'Open Algebra Tiles'
                                      : 'Open Quadratic Curve'}
                                </span>
                              </button>
                            </div>
                          )}

                          {/* Interactive HTML5 Drawing Canvas */}
                          <canvas
                            ref={canvasRef}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                            className="w-full h-full cursor-crosshair touch-none"
                          />
                        </div>

                        {/* 2. Equation Balance Visualizer */}
                        {scratchpadMode === 'balance' && (
                          <EquationBalanceVisualizer
                            key={`balance-${balanceParams.a}-${balanceParams.b}-${balanceParams.c}`}
                            initialA={balanceParams.a}
                            initialB={balanceParams.b}
                            initialC={balanceParams.c}
                            onStepChange={(st, explanation) => {
                              setChatMessages((prev) => [
                                ...prev,
                                {
                                  id: Date.now(),
                                  sender: 'ai',
                                  text: `[Scale Step ${st + 1}] ${explanation}`,
                                },
                              ]);
                            }}
                          />
                        )}

                        {/* 3. Algebra Tiles Visualizer */}
                        {scratchpadMode === 'tiles' && (
                          <AlgebraTilesVisualizer
                            key={`tiles-${tilesParams.p}-${tilesParams.q}`}
                            initialP={tilesParams.p}
                            initialQ={tilesParams.q}
                          />
                        )}

                        {/* 4. Parabola Visualizer */}
                        {scratchpadMode === 'parabola' && (
                          <ParabolaVisualizer
                            key={`parabola-${parabolaParams.a}-${parabolaParams.b}-${parabolaParams.c}`}
                            initialA={parabolaParams.a}
                            initialB={parabolaParams.b}
                            initialC={parabolaParams.c}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── RIGHT: AI TUTOR CHAT PANEL ── */}
                  <aside className="w-[340px] md:w-[380px] h-full flex flex-col border-l border-[#EBE6F0] bg-white/70 backdrop-blur-xl shrink-0 z-20">

                    {/* Header: AI tutor • Dynamic Math Topic */}
                    <div className="p-4 border-b border-[#EBE6F0]/80">
                      <h2 className="text-sm font-extrabold tracking-tight text-[#1E1926]">
                        AI tutor • {currentPlan ? currentPlan.topic : 'Step-by-step solver'}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-2 text-xs">
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          Topic
                          <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold">i</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-[#FAF2F6] text-[#8E2856] border border-[#8E2856]/20 text-[11px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8E2856]" />
                          {currentPlan ? currentPlan.originalEquation : 'interactive'}
                        </span>
                      </div>
                    </div>

                    {/* Scrollable Message Thread */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {/* Empty State when no messages exist */}
                      {chatMessages.length === 0 && !isAnalyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                          <div className="w-11 h-11 rounded-2xl bg-[#FAF2F6] border border-[#8E2856]/15 flex items-center justify-center text-[#8E2856] mb-3 shadow-xs">
                            <Pencil className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 mb-1">
                            Whiteboard Ready
                          </p>
                          <p className="text-[11px] text-slate-400 max-w-[210px] leading-relaxed">
                            Draw math on the canvas or type an equation below, then press <span className="font-semibold text-slate-700">Enter</span> to solve!
                          </p>
                        </div>
                      )}

                      {/* Message List */}
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* AI Flower Avatar */}
                          {msg.sender === 'ai' && (
                            <div className="w-5 h-5 rounded-full bg-[#8E2856] flex items-center justify-center shrink-0 mt-1 shadow-xs">
                              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                                <path d="M12 2C10.5 5 8 7 5 7C7 9.5 7 12 5 14.5C8 14.5 10.5 16.5 12 19.5C13.5 16.5 16 14.5 19 14.5C17 12 17 9.5 19 7C16 7 13.5 5 12 2Z" />
                              </svg>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[270px] p-3 rounded-2xl text-[12px] leading-relaxed shadow-xs ${msg.sender === 'user'
                              ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-xs'
                              : 'bg-[#FAF2F6] border border-[#8E2856]/20 text-[#1E1926] rounded-tl-xs'
                              }`}
                          >
                            <div className="whitespace-pre-line font-medium">
                              {cleanMathTextForChat(msg.text)}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Analyzing indicator while Groq Vision + LLM processes */}
                      {isAnalyzing && (
                        <div className="flex items-start gap-2 justify-start animate-fade-in">
                          <div className="w-5 h-5 rounded-full bg-[#8E2856] flex items-center justify-center shrink-0 mt-1 shadow-xs animate-pulse">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <div className="p-3 rounded-2xl text-[12px] bg-[#FAF2F6] border border-[#8E2856]/20 text-[#8E2856] flex items-center gap-2 shadow-xs">
                            <div className="w-3 h-3 border-2 border-[#8E2856] border-t-transparent rounded-full animate-spin" />
                            <span className="font-semibold text-xs">Reading whiteboard & solving...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Peeping Glowing ExoOrb at bottom above input bar */}
                    <div className="relative flex justify-center -mb-4 pointer-events-none select-none z-10">
                      <div
                        className="w-32 h-16 rounded-t-full relative overflow-hidden flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #38BDF8 100%)',
                          boxShadow: '0 -8px 30px rgba(168, 85, 247, 0.35)',
                        }}
                      >
                        {/* Glowing Happy Eyes */}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#FFF] animate-pulse" />
                          <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#FFF] animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Chat Input Bar */}
                    <div className="p-3 border-t border-[#EBE6F0] bg-white/90 backdrop-blur-md relative z-20">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs focus-within:border-purple-400 transition-colors">
                        <input
                          type="text"
                          placeholder={
                            isAnalyzing
                              ? 'Reading whiteboard & planning steps...'
                              : currentPlan && !isStepCompleted
                                    ? `Your answer for Step ${currentStepIndex + 1}...`
                                    : hasDrawn
                                      ? 'Press Enter to solve whiteboard drawing...'
                                      : 'Ask any math problem (Linear, Quadratic, Circle, Triangle, Trig)...'
                          }
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={isAnalyzing}
                          className="flex-1 bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-400 py-1 disabled:opacity-50"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={isAnalyzing}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </aside>

                </div>

              </div>
            </div>
          );
        };
