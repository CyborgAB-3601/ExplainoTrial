import React, { useState, useEffect, useRef } from 'react';
import { Activity, RotateCcw } from 'lucide-react';

interface ParabolaVisualizerProps {
  initialA?: number;
  initialB?: number;
  initialC?: number;
}

export const ParabolaVisualizer: React.FC<ParabolaVisualizerProps> = ({
  initialA = 1,
  initialB = -2,
  initialC = -3,
}) => {
  const [a, setA] = useState<number>(initialA);
  const [b, setB] = useState<number>(initialB);
  const [c, setC] = useState<number>(initialC);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const discriminant = b * b - 4 * a * c;
  const vertexX = a !== 0 ? -b / (2 * a) : 0;
  const vertexY = a !== 0 ? c - (b * b) / (4 * a) : 0;

  let root1: number | null = null;
  let root2: number | null = null;
  if (a !== 0 && discriminant >= 0) {
    const sqrtD = Math.sqrt(discriminant);
    root1 = (-b - sqrtD) / (2 * a);
    root2 = (-b + sqrtD) / (2 * a);
  }

  const handleReset = () => {
    setA(1);
    setB(-2);
    setC(-3);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#FAFAFC';
    ctx.fillRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height / 2;
    const scale = 22; // pixels per unit

    // Grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    for (let x = originX % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = originY % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('x', width - 15, originY - 6);
    ctx.fillText('y', originX + 8, 15);

    // Parabola Curve
    ctx.strokeStyle = '#8E2856';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let started = false;
    for (let px = 0; px <= width; px += 2) {
      const mathX = (px - originX) / scale;
      const mathY = a * mathX * mathX + b * mathX + c;
      const py = originY - mathY * scale;

      if (py >= -50 && py <= height + 50) {
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Vertex Marker (Pink)
    const vxPx = originX + vertexX * scale;
    const vyPx = originY - vertexY * scale;
    if (vxPx >= 0 && vxPx <= width && vyPx >= 0 && vyPx <= height) {
      ctx.fillStyle = '#EC4899';
      ctx.beginPath();
      ctx.arc(vxPx, vyPx, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Roots Markers (Green)
    const drawRoot = (rx: number) => {
      const px = originX + rx * scale;
      const py = originY;
      if (px >= 0 && px <= width) {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    if (root1 !== null) drawRoot(root1);
    if (root2 !== null) drawRoot(root2);
  }, [a, b, c, vertexX, vertexY, root1, root2]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      
      {/* Top Pedagogical Banner */}
      <div className="w-full max-w-2xl bg-[#FAF2F6] border border-[#8E2856]/20 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-[#8E2856] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Activity className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-[13px] font-extrabold text-[#1E1926] tracking-tight">
            Quadratic Curve & Roots Explorer
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Adjust coefficients <span className="font-bold text-[#8E2856]">a</span>, <span className="font-bold text-[#8E2856]">b</span>, and <span className="font-bold text-[#8E2856]">c</span> to see how the vertex and real roots shift dynamically across the Cartesian plane.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#8E2856] hover:bg-white/80 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Graph Area */}
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center py-4 min-h-[260px]">
        <canvas
          ref={canvasRef}
          width={480}
          height={260}
          className="w-full max-w-[480px] h-[260px] rounded-2xl border border-slate-200/80 shadow-xs bg-slate-50"
        />
      </div>

      {/* Analytics & Sliders */}
      <div className="w-full max-w-2xl space-y-3">
        
        {/* Math Properties Stats */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs grid grid-cols-3 gap-3 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Vertex</span>
            <span className="text-xs font-extrabold text-[#8E2856] font-mono mt-0.5 block">
              ({vertexX.toFixed(2)}, {vertexY.toFixed(2)})
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Discriminant (Δ)</span>
            <span className={`text-xs font-extrabold font-mono mt-0.5 block ${
              discriminant > 0 ? 'text-emerald-600' : discriminant === 0 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {discriminant} ({discriminant > 0 ? '2 roots' : discriminant === 0 ? '1 root' : 'No real roots'})
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Roots</span>
            <span className="text-xs font-extrabold text-slate-800 font-mono mt-0.5 block">
              {root1 !== null && root2 !== null
                ? `x = ${root1.toFixed(1)}, ${root2.toFixed(1)}`
                : 'Complex'}
            </span>
          </div>
        </div>

        {/* 3 Coefficient Sliders */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">a = {a}</span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="1"
              value={a}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val !== 0) setA(val);
              }}
              className="w-full accent-[#8E2856] cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">b = {b}</span>
            </div>
            <input
              type="range"
              min="-6"
              max="6"
              step="1"
              value={b}
              onChange={(e) => setB(parseInt(e.target.value, 10))}
              className="w-full accent-[#8E2856] cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">c = {c}</span>
            </div>
            <input
              type="range"
              min="-8"
              max="8"
              step="1"
              value={c}
              onChange={(e) => setC(parseInt(e.target.value, 10))}
              className="w-full accent-[#8E2856] cursor-pointer"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
