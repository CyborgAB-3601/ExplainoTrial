import React from 'react';
import { 
  Mic, 
  Check, 
  HelpCircle, 
  GraduationCap, 
  BookOpen, 
  Play, 
  FileText, 
  Clock, 
  Star,
  TrendingUp
} from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 pt-4 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: Explain Anything */}
        <div className="glass-card rounded-[22px] p-6 sm:p-7 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
          {/* Card Header & Text */}
          <div className="z-10 max-w-[210px] sm:max-w-[220px]">
            <h3 className="text-xl font-bold text-[#1E1B2E] tracking-tight leading-snug">
              Explain Anything
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#6B7280] mt-2 font-normal">
              Speak or type your explanation and let EXO understand what you know.
            </p>
          </div>

          {/* Bottom Audio Waveform + Mic */}
          <div className="mt-6 flex items-center gap-3 z-10">
            <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center text-white shadow-md shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-transform">
              <Mic className="w-4 h-4 text-white" />
            </button>
            <div className="flex items-center gap-1 h-6">
              {[8, 14, 20, 10, 16, 22, 12, 18, 14, 8, 12, 6].map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-gradient-to-t from-[#6366F1] to-[#A855F7] opacity-80"
                  style={{
                    height: `${h}px`,
                    animation: 'pulse 1.8s ease-in-out infinite',
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Graphic on the Right: Chat Bubble Mock */}
          <div className="absolute right-3 sm:right-4 bottom-4 w-40 sm:w-44 h-32 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 p-3 shadow-[0_6px_20px_rgba(124,92,255,0.06)] flex flex-col justify-between pointer-events-none group-hover:translate-x-0.5 transition-transform">
            <div className="space-y-2 mt-1">
              <div className="h-2 w-full bg-purple-100/70 rounded-full" />
              <div className="h-2 w-4/5 bg-purple-100/50 rounded-full" />
              <div className="h-2 w-3/5 bg-purple-100/40 rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-200" />
              </div>
              <div className="w-7 h-7 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C5CFF]">
                <Mic className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Find Knowledge Gaps */}
        <div className="glass-card rounded-[22px] p-6 sm:p-7 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
          <div className="z-10 max-w-[210px] sm:max-w-[220px]">
            <h3 className="text-xl font-bold text-[#1E1B2E] tracking-tight leading-snug">
              Find Knowledge Gaps
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#6B7280] mt-2 font-normal">
              EXO identifies what you missed and corrects misconceptions.
            </p>
          </div>

          {/* Graphic on the Right: Verification Check Rows */}
          <div className="absolute right-3 sm:right-4 top-5 bottom-5 w-40 sm:w-44 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 p-3.5 shadow-[0_6px_20px_rgba(124,92,255,0.06)] flex flex-col justify-center gap-3 pointer-events-none group-hover:scale-[1.02] transition-transform">
            {/* Row 1: Green check */}
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center text-white shrink-0 shadow-sm shadow-green-500/30">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="h-2.5 flex-1 bg-slate-200/70 rounded-full" />
            </div>

            {/* Row 2: Orange Question */}
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-500/30">
                <span className="text-xs font-bold leading-none">?</span>
              </div>
              <div className="h-2.5 flex-1 bg-amber-100/80 rounded-full" />
            </div>

            {/* Row 3: Slate Question */}
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#94A3B8] flex items-center justify-center text-white shrink-0 shadow-sm">
                <span className="text-xs font-bold leading-none">?</span>
              </div>
              <div className="h-2.5 flex-1 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>

        {/* CARD 3: Personalized Learning Path */}
        <div className="glass-card rounded-[22px] p-6 sm:p-7 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
          <div className="z-10 max-w-[210px] sm:max-w-[220px]">
            <h3 className="text-xl font-bold text-[#1E1B2E] tracking-tight leading-snug">
              Personalized Learning Path
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#6B7280] mt-2 font-normal">
              Get lessons, examples and practice based on your understanding.
            </p>
          </div>

          {/* Graphic on the Right: Curved Path with 3 Icon Badges */}
          <div className="absolute right-2 sm:right-3 inset-y-4 w-44 sm:w-48 flex items-center justify-center pointer-events-none">
            {/* Curved Path SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 180 180" fill="none">
              <path 
                d="M30 140 C 60 140, 70 80, 110 80 C 140 80, 150 40, 150 30" 
                stroke="#E2E8F0" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeDasharray="5 5" 
              />
            </svg>

            {/* Graduation Cap Badge (Top-Right) */}
            <div className="absolute right-5 top-5 w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5046E5] to-[#7C5CFF] flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:-translate-y-1 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>

            {/* Book Open Badge (Middle) */}
            <div className="absolute right-16 top-16 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-purple-200/70 flex items-center justify-center text-[#7C5CFF] shadow-[0_4px_12px_rgba(124,92,255,0.12)]">
              <BookOpen className="w-4 h-4" />
            </div>

            {/* Play Badge (Bottom-Left) */}
            <div className="absolute left-8 bottom-6 w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#F472B6] flex items-center justify-center text-white shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* CARD 4: Interactive Concept Maps */}
        <div className="glass-card rounded-[22px] p-6 sm:p-7 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
          <div className="z-10 max-w-[210px] sm:max-w-[220px]">
            <h3 className="text-xl font-bold text-[#1E1B2E] tracking-tight leading-snug">
              Interactive Concept Maps
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#6B7280] mt-2 font-normal">
              See your understanding visually with AI-generated mind maps.
            </p>
          </div>

          {/* Graphic on the Right: Mind Map Nodes */}
          <div className="absolute right-2 sm:right-4 inset-y-4 w-44 sm:w-48 flex items-center justify-center pointer-events-none">
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 180 180" fill="none">
              <path d="M90 90 L 50 60" stroke="#E9D5FF" strokeWidth="2" />
              <path d="M90 90 L 135 60" stroke="#E9D5FF" strokeWidth="2" />
              <path d="M90 90 L 40 115" stroke="#E9D5FF" strokeWidth="2" />
              <path d="M90 90 L 145 115" stroke="#E9D5FF" strokeWidth="2" />
              <path d="M90 90 L 70 140" stroke="#E9D5FF" strokeWidth="2" />
              <path d="M90 90 L 125 140" stroke="#E9D5FF" strokeWidth="2" />
            </svg>

            {/* Central Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-7 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#A855F7] shadow-md shadow-purple-500/25 flex items-center justify-center z-10">
              <span className="w-8 h-1.5 bg-white/80 rounded-full" />
            </div>

            {/* Surrounding Nodes */}
            <div className="absolute top-8 left-6 w-11 h-5 rounded-full bg-purple-100/90 border border-purple-200/60 shadow-sm" />
            <div className="absolute top-8 right-6 w-11 h-5 rounded-full bg-pink-100/90 border border-pink-200/60 shadow-sm" />
            <div className="absolute left-2 top-[88px] w-12 h-5 rounded-full bg-indigo-100/90 border border-indigo-200/60 shadow-sm" />
            <div className="absolute right-2 top-[88px] w-12 h-5 rounded-full bg-purple-100/90 border border-purple-200/60 shadow-sm" />
            <div className="absolute bottom-6 left-8 w-11 h-5 rounded-full bg-amber-100/90 border border-amber-200/60 shadow-sm" />
            
            {/* Mini Checklist node bottom-right */}
            <div className="absolute bottom-5 right-6 w-14 h-8 rounded-lg bg-white/95 border border-purple-100/80 shadow-sm p-1.5 flex flex-col justify-between">
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-purple-400" />
                <span className="h-1 w-7 bg-purple-100 rounded-full" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-purple-400" />
                <span className="h-1 w-5 bg-purple-100 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: Practice & Reinforce */}
        <div className="glass-card rounded-[22px] p-6 sm:p-7 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
          <div className="z-10 max-w-[210px] sm:max-w-[220px]">
            <h3 className="text-xl font-bold text-[#1E1B2E] tracking-tight leading-snug">
              Practice & Reinforce
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#6B7280] mt-2 font-normal">
              Get quizzes, examples and challenges tailored to your gaps.
            </p>
          </div>

          {/* Graphic on the Right/Bottom: 3 Floating Glossy Badges */}
          <div className="mt-8 flex items-center justify-end gap-3 z-10 pr-2">
            {/* Document Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EFF6FF] to-[#DBEAFE] border border-blue-200/60 shadow-sm flex items-center justify-center text-[#3B82F6] transform group-hover:-translate-y-1 transition-transform duration-300">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Stopwatch Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFF1F2] to-[#FFE4E6] border border-rose-200/60 shadow-sm flex items-center justify-center text-[#F43F5E] transform group-hover:-translate-y-2 transition-transform duration-300 delay-75">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Star Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FAF5FF] to-[#F3E8FF] border border-purple-200/60 shadow-sm flex items-center justify-center text-[#A855F7] transform group-hover:-translate-y-1 transition-transform duration-300 delay-150">
              <Star className="w-5 h-5 fill-[#A855F7]/30 stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* CARD 6: Track Your Progress */}
        <div className="glass-card rounded-[22px] p-6 sm:p-7 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
          <div className="z-10 max-w-[210px] sm:max-w-[220px]">
            <h3 className="text-xl font-bold text-[#1E1B2E] tracking-tight leading-snug">
              Track Your Progress
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#6B7280] mt-2 font-normal">
              See how your understanding grows over time.
            </p>
          </div>

          {/* Graphic on the Right: Rising Gradient Bar Chart */}
          <div className="absolute right-4 sm:right-6 bottom-5 w-40 sm:w-44 h-32 flex items-end justify-between px-2 pb-2 pointer-events-none">
            {/* Bar 1 */}
            <div className="w-4 bg-gradient-to-t from-[#E0E7FF] to-[#C7D2FE] rounded-t-md h-8 group-hover:h-9 transition-all duration-300" />
            {/* Bar 2 */}
            <div className="w-4 bg-gradient-to-t from-[#C7D2FE] to-[#A5B4FC] rounded-t-md h-12 group-hover:h-13 transition-all duration-300" />
            {/* Bar 3 */}
            <div className="w-4 bg-gradient-to-t from-[#A5B4FC] to-[#818CF8] rounded-t-md h-16 group-hover:h-18 transition-all duration-300" />
            {/* Bar 4 */}
            <div className="w-4 bg-gradient-to-t from-[#818CF8] to-[#6366F1] rounded-t-md h-20 group-hover:h-22 transition-all duration-300" />
            {/* Bar 5 */}
            <div className="w-4 bg-gradient-to-t from-[#6366F1] to-[#7C5CFF] rounded-t-md h-24 group-hover:h-26 transition-all duration-300" />
            {/* Bar 6 */}
            <div className="w-4 bg-gradient-to-t from-[#7C5CFF] to-[#9333EA] rounded-t-md h-28 group-hover:h-30 transition-all duration-300 relative">
              {/* Star / glowing peak indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#EC4899] shadow-[0_0_8px_#EC4899]" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
