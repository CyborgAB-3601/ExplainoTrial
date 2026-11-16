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
  ArrowLeft
} from 'lucide-react';

export interface ScratchpadViewProps {
  onBack?: () => void;
  className?: string;
}

export const ScratchpadView: React.FC<ScratchpadViewProps> = ({
  onBack,
  className = '',
}) => {
  // Canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'select' | 'shape' | 'grid'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Chat input state
  const [chatInput, setChatInput] = useState('');

  // Initial demo chat messages matching the screenshot
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'What worst wnes the sear?\n2x + 5 = 15',
    },
    {
      id: 2,
      sender: 'ai',
      text: "Great start! Let's solve 2x + 5 = 15.",
    },
    {
      id: 3,
      sender: 'ai',
      text: 'Step 1: Subtract 5 from both sides to isolate the x term. Can you show me that step on the canvas?',
    },
    {
      id: 4,
      sender: 'user',
      text: 'How 1 + x = 15',
    },
    {
      id: 5,
      sender: 'ai',
      text: 'Nice job! Now divide by 2 to find x.',
    },
  ]);

  // Canvas drawing setup & initial sample math sketches matching the screenshot
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

    // Draw initial sample handwriting matching the screenshot
    drawInitialSketches(ctx, rect.width, rect.height);
  }, []);

  const drawInitialSketches = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = '#1E1926';
    ctx.fillStyle = '#1E1926';

    // 1. Main Equation Stack: 2x + 5 = 15, 2x = 10, x = 5
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('2x + 5 = 15', 70, 150);

    ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('2x = 10', 140, 220);

    ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('x = 5', 170, 290);

    // 2. Upper Right XY Graph with line through (3, 5)
    const gx = 380;
    const gy = 150;
    ctx.lineWidth = 2.5;

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(gx, gy - 60);
    ctx.lineTo(gx, gy + 20);
    ctx.stroke();

    // X Axis
    ctx.beginPath();
    ctx.moveTo(gx - 25, gy);
    ctx.lineTo(gx + 80, gy);
    ctx.stroke();

    // Axis Labels
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('y', gx - 16, gy - 55);
    ctx.fillText('x', gx + 85, gy + 5);

    // Slanted line
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(gx - 15, gy + 10);
    ctx.lineTo(gx + 65, gy - 55);
    ctx.stroke();

    // Dashed guide lines to (3, 5)
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#64748B';
    ctx.beginPath();
    ctx.moveTo(gx, gy - 30);
    ctx.lineTo(gx + 35, gy - 30);
    ctx.lineTo(gx + 35, gy);
    ctx.stroke();
    ctx.restore();

    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('5', gx - 14, gy - 26);
    ctx.fillText('3', gx + 31, gy + 16);

    // 3. Lower Right Equation: 2x + 55, x = 10
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('2x + 5 5', 360, 260);
    ctx.fillText('x = 10', 368, 300);

    // Underline
    ctx.beginPath();
    ctx.moveTo(365, 312);
    ctx.quadraticCurveTo(390, 315, 415, 310);
    ctx.stroke();

    // 4. Lower Left Small Axis
    const ax = 95;
    const ay = 400;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay - 40);
    ctx.lineTo(ax, ay + 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ax - 20, ay);
    ctx.lineTo(ax + 50, ay);
    ctx.stroke();

    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('y', ax - 14, ay - 38);
    ctx.fillText('x', ax + 54, ay + 4);

    ctx.beginPath();
    ctx.moveTo(ax - 10, ay + 8);
    ctx.lineTo(ax + 35, ay - 32);
    ctx.stroke();

    ctx.fillText('1', ax + 25, ay + 15);

    // 5. Triangle sketch with sides a, c
    const tx = 200;
    const ty = 415;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + 60, ty);
    ctx.lineTo(tx + 28, ty - 50);
    ctx.closePath();
    ctx.stroke();

    // Altitude line
    ctx.beginPath();
    ctx.moveTo(tx + 28, ty - 50);
    ctx.lineTo(tx + 28, ty);
    ctx.stroke();

    // Right-angle marker
    ctx.strokeRect(tx + 28, ty - 8, 8, 8);

    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('a', tx + 24, ty + 18);
    ctx.fillText('c', tx + 50, ty - 22);

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

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: chatInput,
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
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
              
              {/* Floating Canvas Drawing Toolbar Pill */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md">
                {/* Pen tool */}
                <button
                  onClick={() => setActiveTool('pen')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTool === 'pen'
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
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTool === 'eraser'
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
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTool === 'select'
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
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTool === 'shape'
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
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    showGrid
                      ? 'bg-[#FAF2F6] text-[#8E2856]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                  title="Toggle Grid Lines"
                >
                  <Grid className="w-4 h-4" />
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
          </div>

          {/* ── RIGHT: AI TUTOR CHAT PANEL ── */}
          <aside className="w-[340px] md:w-[380px] h-full flex flex-col border-l border-[#EBE6F0] bg-white/70 backdrop-blur-xl shrink-0 z-20">
            
            {/* Header: AI tutor • Solving linear equations */}
            <div className="p-4 border-b border-[#EBE6F0]/80">
              <h2 className="text-sm font-extrabold tracking-tight text-[#1E1926]">
                AI tutor • Solving linear equations
              </h2>
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  Tags
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold">i</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#FAF2F6] text-[#8E2856] border border-[#8E2856]/20 text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8E2856]" />
                  games
                </span>
              </div>
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                    className={`max-w-[270px] p-3 rounded-2xl text-[12px] leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-xs'
                        : 'bg-[#FAF2F6] border border-[#8E2856]/20 text-[#1E1926] rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-medium">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
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
                  placeholder="Ask a question or explain step..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-400 py-1"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
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
