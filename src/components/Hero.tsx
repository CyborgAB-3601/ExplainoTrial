import React from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { ExoOrb } from './ExoOrb';

interface HeroProps {
  onStartLearning?: () => void;
  onWatchDemo?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartLearning, onWatchDemo }) => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-7 sm:pt-9 pb-4 flex flex-col items-center text-center">
      
      {/* Top Badge: "✨ Learn by Explaining" */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3EEFF] border border-[#E9D5FF] text-[#7C5CFF] text-xs sm:text-[13px] font-semibold mb-6 shadow-[0_2px_10px_rgba(124,92,255,0.06)] hover:bg-[#EDE5FF] transition-colors cursor-pointer select-none">
        <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
        <span>Learn by Explaining</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.12] max-w-3xl">
        <span className="text-gradient-brand">Explain</span>{' '}
        <span className="text-[#1E1B2E]">what you know.</span>
      </h1>

      {/* Subhead (2 lines) */}
      <div className="mt-4 sm:mt-5 text-sm sm:text-base md:text-[17px] text-[#6B7280] font-normal leading-relaxed max-w-xl">
        <p>Tell EXO a concept in your own words.</p>
        <p className="mt-0.5">Get instant feedback, fix gaps, and understand better.</p>
      </div>

      {/* CTA Buttons */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 z-20">
        {/* Primary CTA */}
        <button
          onClick={onStartLearning}
          className="flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full text-white text-sm sm:text-[15px] font-semibold bg-gradient-to-r from-[#5046E5] via-[#7042F8] to-[#9333EA] hover:opacity-95 shadow-[0_6px_22px_rgba(112,66,248,0.38)] active:scale-[0.98] transition-all duration-200"
        >
          <span>Start Learning</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>

        {/* Watch Demo CTA */}
        <button
          onClick={onWatchDemo}
          className="flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-full text-[#334155] text-sm sm:text-[15px] font-semibold bg-white/95 hover:bg-white border border-[#E2E8F0] shadow-[0_4px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all duration-200"
        >
          <div className="w-4 h-4 rounded-full bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1]">
            <Play className="w-2.5 h-2.5 fill-[#6366F1] ml-0.5" />
          </div>
          <span>Watch Demo</span>
        </button>
      </div>

      {/* EXO Orb Display & Pedestal */}
      <div className="w-full mt-4 sm:mt-5">
        <ExoOrb />
      </div>

    </section>
  );
};
