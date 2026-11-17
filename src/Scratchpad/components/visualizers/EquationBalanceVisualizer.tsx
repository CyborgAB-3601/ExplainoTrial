import React, { useState } from 'react';
import { Scale, RotateCcw, ChevronRight } from 'lucide-react';

interface EquationBalanceProps {
  initialA?: number;
  initialB?: number;
  initialC?: number;
  onStepChange?: (step: number, explanation: string) => void;
}

export const EquationBalanceVisualizer: React.FC<EquationBalanceProps> = ({
  initialA = 2,
  initialB = 5,
  initialC = 15,
  onStepChange,
}) => {
  const [a] = useState(initialA);
  const [b] = useState(initialB);
  const [c] = useState(initialC);
  const [step, setStep] = useState(0);

  const solutionX = a !== 0 ? (c - b) / a : 0;

  const stepsInfo = [
    {
      title: `Original Equation: ${a}x + ${b} = ${c}`,
      explanation: `The scale is balanced: left pan has ${a} variable bags (x) plus ${b} unit weights, balancing ${c} unit weights on the right pan.`,
    },
    {
      title: `Inverse Operation: Subtract ${b} from both pans`,
      explanation: `Removing ${b} weights from both pans keeps the scale balanced, simplifying to ${a}x = ${c - b}.`,
    },
    {
      title: `Isolate x: Divide both pans by ${a}`,
      explanation: `Dividing both sides into ${a} equal groups reveals that each x bag balances exactly ${solutionX} unit weights: x = ${solutionX}.`,
    },
  ];

  const handleSelectStep = (newStep: number) => {
    setStep(newStep);
    if (onStepChange) {
      onStepChange(newStep, stepsInfo[newStep].explanation);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      
      {/* Top Pedagogical Banner */}
      <div className="w-full max-w-2xl bg-[#FAF2F6] border border-[#8E2856]/20 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-[#8E2856] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Scale className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-[13px] font-extrabold text-[#1E1926] tracking-tight">
            Equation Balance Principle
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            An equation represents a perfectly balanced physical scale. Whatever operation you apply to the left pan, you must apply to the right pan to preserve equality.
          </p>
        </div>
        <button
          onClick={() => handleSelectStep(0)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#8E2856] hover:bg-white/80 transition-colors"
          title="Reset Scale"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Scale Apparatus */}
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center py-6 min-h-[280px]">
        
        {/* Scale Stage */}
        <div className="relative w-full max-w-lg flex flex-col items-center">
          
          {/* Top Beam */}
          <div className="relative w-full h-3 bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400 rounded-full shadow-sm flex items-center justify-center">
            
            {/* Center Pivot Point */}
            <div className="w-5 h-5 rounded-full bg-[#8E2856] border-2 border-white shadow-sm -mt-0.5" />

            {/* Left Suspension Chain */}
            <div className="absolute left-6 top-3 flex flex-col items-center">
              <div className="w-[2px] h-14 bg-slate-400" />
              {/* Left Pan */}
              <div className="w-44 min-h-[90px] bg-gradient-to-b from-white to-[#FAF8FE] border-2 border-slate-300 rounded-2xl shadow-sm p-2.5 flex flex-col items-center justify-between">
                
                {/* Left Pan Weights */}
                <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-[46px]">
                  {step === 0 && (
                    <>
                      {Array.from({ length: Math.min(a, 4) }).map((_, i) => (
                        <span
                          key={`x-${i}`}
                          className="px-2.5 py-1 rounded-lg bg-[#8E2856] text-white font-extrabold text-xs shadow-2xs tracking-wide"
                        >
                          x
                        </span>
                      ))}
                      <span className="text-xs font-bold text-slate-400">+</span>
                      {Array.from({ length: Math.min(b, 6) }).map((_, i) => (
                        <span
                          key={`b-${i}`}
                          className="w-6 h-6 rounded-md bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center shadow-2xs"
                        >
                          1
                        </span>
                      ))}
                    </>
                  )}

                  {step === 1 && (
                    <>
                      {Array.from({ length: Math.min(a, 4) }).map((_, i) => (
                        <span
                          key={`x-${i}`}
                          className="px-2.5 py-1 rounded-lg bg-[#8E2856] text-white font-extrabold text-xs shadow-2xs tracking-wide"
                        >
                          x
                        </span>
                      ))}
                    </>
                  )}

                  {step === 2 && (
                    <span className="px-3 py-1.5 rounded-xl bg-[#8E2856] text-white font-black text-sm shadow-xs">
                      x
                    </span>
                  )}
                </div>

                {/* Left Pan Formula Label */}
                <div className="text-xs font-bold text-slate-700 mt-1">
                  {step === 0 && `${a}x + ${b}`}
                  {step === 1 && `${a}x`}
                  {step === 2 && 'x'}
                </div>
              </div>
            </div>

            {/* Equals Sign in Center */}
            <div className="absolute top-10 font-black text-2xl text-slate-300 select-none">
              =
            </div>

            {/* Right Suspension Chain */}
            <div className="absolute right-6 top-3 flex flex-col items-center">
              <div className="w-[2px] h-14 bg-slate-400" />
              {/* Right Pan */}
              <div className="w-44 min-h-[90px] bg-gradient-to-b from-white to-[#FAF8FE] border-2 border-slate-300 rounded-2xl shadow-sm p-2.5 flex flex-col items-center justify-between">
                
                {/* Right Pan Weights */}
                <div className="flex items-center justify-center gap-1 flex-wrap min-h-[46px] max-w-[140px]">
                  {step === 0 && (
                    Array.from({ length: Math.min(c, 15) }).map((_, i) => (
                      <span
                        key={`c-${i}`}
                        className="w-5 h-5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] flex items-center justify-center shadow-2xs"
                      >
                        1
                      </span>
                    ))
                  )}

                  {step === 1 && (
                    Array.from({ length: Math.min(c - b, 10) }).map((_, i) => (
                      <span
                        key={`cb-${i}`}
                        className="w-5 h-5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] flex items-center justify-center shadow-2xs"
                      >
                        1
                      </span>
                    ))
                  )}

                  {step === 2 && (
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-xs">
                      {solutionX}
                    </span>
                  )}
                </div>

                {/* Right Pan Formula Label */}
                <div className="text-xs font-bold text-slate-700 mt-1">
                  {step === 0 && `${c}`}
                  {step === 1 && `${c - b}`}
                  {step === 2 && `${solutionX}`}
                </div>
              </div>
            </div>

          </div>

          {/* Scale Base Triangle Fulcrum */}
          <div className="w-0 h-0 border-l-[28px] border-l-transparent border-r-[28px] border-r-transparent border-b-[50px] border-b-slate-400 -mt-0.5" />
          <div className="w-36 h-2 bg-slate-600 rounded-full -mt-0.5 shadow-sm" />
        </div>
      </div>

      {/* Step Scaffolding Navigation Bar */}
      <div className="w-full max-w-2xl bg-white/90 border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-2 shadow-xs">
        {stepsInfo.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectStep(idx)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              step === idx
                ? 'bg-[#8E2856] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                step === idx ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {idx + 1}
              </span>
              <span className="truncate">{item.title}</span>
            </div>
            {step === idx && <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-1 text-white/80" />}
          </button>
        ))}
      </div>

      {/* Step Explanation Card */}
      <div className="w-full max-w-2xl mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 text-center leading-relaxed font-medium">
        {stepsInfo[step].explanation}
      </div>

    </div>
  );
};
