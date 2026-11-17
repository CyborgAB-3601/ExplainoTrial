import React, { useState, useEffect, useRef } from 'react';
import { Grid3X3, RotateCcw } from 'lucide-react';

interface AlgebraTilesProps {
  initialP?: number;
  initialQ?: number;
}

export const AlgebraTilesVisualizer: React.FC<AlgebraTilesProps> = ({
  initialP = 2,
  initialQ = 3,
}) => {
  const [p, setP] = useState<number>(initialP);
  const [q, setQ] = useState<number>(initialQ);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    setP(2);
    setQ(3);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#FAFAFC';
    ctx.fillRect(0, 0, W, H);

    const X = Math.min(140, W * 0.35); // x edge length
    const u = Math.min(24, (W - X - 80) / 7); // unit width per integer
    const pw = Math.abs(p) * u;
    const qh = Math.abs(q) * u;

    const ox = Math.max(50, (W - X - pw) / 2);
    const oy = 35;

    // 1. x² Tile (Blue)
    ctx.fillStyle = 'rgba(142, 40, 86, 0.85)';
    ctx.fillRect(ox, oy, X, X);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#651A3B';
    ctx.strokeRect(ox, oy, X, X);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('x²', ox + X / 2, oy + X / 2);

    // 2. px Tile (Right of x²)
    if (p !== 0) {
      const px = ox + X;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.85)';
      ctx.fillRect(px, oy, pw, X);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#BE185D';
      ctx.strokeRect(px, oy, pw, X);
      if (pw > 20) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`${p}x`, px + pw / 2, oy + X / 2);
      }
    }

    // 3. qx Tile (Below x²)
    if (q !== 0) {
      const qy = oy + X;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.85)';
      ctx.fillRect(ox, qy, X, qh);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#BE185D';
      ctx.strokeRect(ox, qy, X, qh);
      if (qh > 20) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`${q}x`, ox + X / 2, qy + qh / 2);
      }
    }

    // 4. pq Constant Units (Bottom Right)
    if (p !== 0 && q !== 0) {
      const rx = ox + X;
      const ry = oy + X;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
      ctx.fillRect(rx, ry, pw, qh);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#059669';
      ctx.strokeRect(rx, ry, pw, qh);

      // Sub-grid unit squares
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 1; i < Math.abs(p); i++) {
        ctx.beginPath();
        ctx.moveTo(rx + i * u, ry);
        ctx.lineTo(rx + i * u, ry + qh);
        ctx.stroke();
      }
      for (let j = 1; j < Math.abs(q); j++) {
        ctx.beginPath();
        ctx.moveTo(rx, ry + j * u);
        ctx.lineTo(rx + pw, ry + j * u);
        ctx.stroke();
      }

      if (pw > 20 && qh > 20) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`${p * q}`, rx + pw / 2, ry + qh / 2);
      }
    }
  }, [p, q]);

  const b = p + q;
  const c = p * q;
  const bSign = b >= 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`;
  const cSign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      
      {/* Top Pedagogical Banner */}
      <div className="w-full max-w-2xl bg-[#FAF2F6] border border-[#8E2856]/20 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-[#8E2856] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Grid3X3 className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-[13px] font-extrabold text-[#1E1926] tracking-tight">
            Algebra Tiles Area Model
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            The area of a rectangle with sides <span className="font-bold text-[#8E2856]">(x + {p})</span> and <span className="font-bold text-[#8E2856]">(x + {q})</span> equals the sum of its four sub-regions.
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

      {/* Main Canvas Area */}
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center py-4 min-h-[260px]">
        <canvas
          ref={canvasRef}
          width={480}
          height={260}
          className="w-full max-w-[480px] h-[260px] rounded-2xl border border-slate-200/80 shadow-xs bg-slate-50"
        />
      </div>

      {/* Interactive Controls & Formula Cards */}
      <div className="w-full max-w-2xl space-y-3">
        
        {/* Expression Breakdown */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="text-center flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Factored Form</span>
            <span className="text-sm font-extrabold text-[#8E2856] font-mono mt-0.5 block">
              (x + {p})(x + {q})
            </span>
          </div>
          <div className="text-slate-300 font-black text-lg">=</div>
          <div className="text-center flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Standard Form</span>
            <span className="text-sm font-extrabold text-slate-800 font-mono mt-0.5 block">
              x² {bSign} {cSign}
            </span>
          </div>
        </div>

        {/* Sliders */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Side p = {p}</span>
              <span className="text-slate-400 text-[11px] font-mono">(x + {p})</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={p}
              onChange={(e) => setP(parseInt(e.target.value, 10))}
              className="w-full accent-[#8E2856] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Side q = {q}</span>
              <span className="text-slate-400 text-[11px] font-mono">(x + {q})</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={q}
              onChange={(e) => setQ(parseInt(e.target.value, 10))}
              className="w-full accent-[#8E2856] cursor-pointer"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
