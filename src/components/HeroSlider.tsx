import React, { useState, useEffect } from 'react';
import { 
  Search, Mic, ArrowRight, ChevronLeft, ChevronRight, 
  Volume2, Headphones, Gamepad2, Sparkles, Play, ChevronDown
} from 'lucide-react';
import { ExoOrb } from './ExoOrb';

export interface HeroSliderProps {
  userName?: string;
  chatInput: string;
  setChatInput: (val: string) => void;
  exoMessage: string;
  onStartSession: (topic?: string) => void;
  onNavigateToLearn: () => void;
  onScrollDown?: () => void;
  scrollY?: number;
  bannerRef?: React.RefObject<HTMLDivElement | null>;
}

interface SlideData {
  id: number;
  badge: string;
  badgeIcon: React.ElementType;
  title: string;
  titleAccent: string;
  subtitle: string;
  buttonLabel: string;
  buttonIcon: React.ElementType;
  bgGradient: string;
  ambientLight: string;
  textColor: string;
  titleGradient: string;
  subtitleColor: string;
  glassBorder: string;
  glassActiveBorder: string;
  inputBg: string;
  inputBorder: string;
  inputPlaceholder: string;
  searchIconColor: string;
  micGradient: string;
  micShadow: string;
  statusBadgeBg: string;
  statusBadgeText: string;
  statusBadgeBorder: string;
  promptPillBg: string;
  promptPillHover: string;
  promptPillText: string;
  promptPillBorder: string;
  orbHaloBorder: string;
  orbHaloBg: string;
  orbHaloShadow: string;
  suggestedTopics: string[];
}

const SLIDES: SlideData[] = [
  {
    id: 0,
    badge: 'VOICE DIALOGUE • REAL-TIME AI',
    badgeIcon: Sparkles,
    title: 'Learn by speaking with',
    titleAccent: 'EXO',
    subtitle: 'Talk through concepts in your own words. EXO hears your gaps, clarifies doubts in real time, and validates your mastery.',
    buttonLabel: 'Speak with EXO',
    buttonIcon: Mic,
    bgGradient: 'from-[#0B0818] via-[#1E1138] to-[#120B24]',
    ambientLight: 'rgba(168, 85, 247, 0.32)',
    textColor: 'text-white',
    titleGradient: 'from-purple-200 via-pink-200 to-indigo-100',
    subtitleColor: 'text-purple-100/85',
    glassBorder: 'border border-purple-500/20',
    glassActiveBorder: 'border-purple-300/60 ring-2 ring-purple-400/25 shadow-[0_22px_55px_rgba(124,92,255,0.3)]',
    inputBg: 'bg-white/10',
    inputBorder: 'border-white/20 focus-within:border-purple-300 focus-within:ring-purple-400/20',
    inputPlaceholder: 'placeholder:text-purple-200/60',
    searchIconColor: 'text-purple-300',
    micGradient: 'from-[#6366F1] to-[#EC4899]',
    micShadow: 'shadow-purple-500/30',
    statusBadgeBg: 'bg-purple-900/50',
    statusBadgeText: 'text-purple-200',
    statusBadgeBorder: 'border-purple-400/30',
    promptPillBg: 'bg-white/10',
    promptPillHover: 'hover:bg-white/20',
    promptPillText: 'text-purple-100',
    promptPillBorder: 'border-white/15',
    orbHaloBorder: 'border-purple-300/40',
    orbHaloBg: 'from-purple-500/20 via-pink-500/10 to-transparent',
    orbHaloShadow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    suggestedTopics: ['Photosynthesis', 'Quantum Physics', 'Calculus Limits', 'Cell Mitosis'],
  },
  {
    id: 1,
    badge: 'IMMERSIVE AUDIOBOOKS • CBSE 10TH NCERT',
    badgeIcon: Headphones,
    title: 'Listen to',
    titleAccent: 'your books',
    subtitle: 'Transform every textbook chapter into crystal-clear voice narrations. Sit back, absorb key takeaways hands-free, and study on the go.',
    buttonLabel: 'Listen to Chapter',
    buttonIcon: Volume2,
    bgGradient: 'from-[#170E07] via-[#2A180A] to-[#140B05]',
    ambientLight: 'rgba(245, 158, 11, 0.32)',
    textColor: 'text-[#FFFBEB]',
    titleGradient: 'from-amber-200 via-yellow-100 to-orange-200',
    subtitleColor: 'text-amber-100/85',
    glassBorder: 'border border-amber-500/20',
    glassActiveBorder: 'border-amber-300/60 ring-2 ring-amber-400/25 shadow-[0_22px_55px_rgba(245,158,11,0.3)]',
    inputBg: 'bg-white/10',
    inputBorder: 'border-amber-200/25 focus-within:border-amber-300 focus-within:ring-amber-400/20',
    inputPlaceholder: 'placeholder:text-amber-200/60',
    searchIconColor: 'text-amber-300',
    micGradient: 'from-[#F59E0B] to-[#EA580C]',
    micShadow: 'shadow-amber-500/30',
    statusBadgeBg: 'bg-amber-900/50',
    statusBadgeText: 'text-amber-200',
    statusBadgeBorder: 'border-amber-400/30',
    promptPillBg: 'bg-amber-950/40',
    promptPillHover: 'hover:bg-amber-900/60',
    promptPillText: 'text-amber-100',
    promptPillBorder: 'border-amber-300/20',
    orbHaloBorder: 'border-amber-300/40',
    orbHaloBg: 'from-amber-500/20 via-orange-500/10 to-transparent',
    orbHaloShadow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]',
    suggestedTopics: ['Life Processes Ch 6', 'Nationalism in India', 'Chemical Reactions', 'Electricity Ch 11'],
  },
  {
    id: 2,
    badge: 'GAMIFIED CONCEPTS • INTERACTIVE QUESTS',
    badgeIcon: Gamepad2,
    title: 'Play games to understand',
    titleAccent: 'concept',
    subtitle: 'Turn difficult formulas and diagrams into fast-paced interactive challenges, trivia battles, and unlockable knowledge streaks.',
    buttonLabel: 'Play Concept Game',
    buttonIcon: Play,
    bgGradient: 'from-[#031510] via-[#09281F] to-[#041611]',
    ambientLight: 'rgba(16, 185, 129, 0.32)',
    textColor: 'text-[#ECFDF5]',
    titleGradient: 'from-emerald-200 via-teal-100 to-cyan-200',
    subtitleColor: 'text-emerald-100/85',
    glassBorder: 'border border-emerald-500/20',
    glassActiveBorder: 'border-emerald-300/60 ring-2 ring-emerald-400/25 shadow-[0_22px_55px_rgba(16,185,129,0.3)]',
    inputBg: 'bg-white/10',
    inputBorder: 'border-emerald-300/25 focus-within:border-emerald-300 focus-within:ring-emerald-400/20',
    inputPlaceholder: 'placeholder:text-emerald-200/60',
    searchIconColor: 'text-emerald-300',
    micGradient: 'from-[#10B981] to-[#06B6D4]',
    micShadow: 'shadow-emerald-500/30',
    statusBadgeBg: 'bg-emerald-900/50',
    statusBadgeText: 'text-emerald-200',
    statusBadgeBorder: 'border-emerald-400/30',
    promptPillBg: 'bg-emerald-950/40',
    promptPillHover: 'hover:bg-emerald-900/60',
    promptPillText: 'text-emerald-100',
    promptPillBorder: 'border-emerald-400/20',
    orbHaloBorder: 'border-emerald-300/40',
    orbHaloBg: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    orbHaloShadow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
    suggestedTopics: ['Pythagoras Quest', 'Periodic Table Blitz', 'Binary Puzzle', 'History Timeline Run'],
  },
];

export const HeroSlider: React.FC<HeroSliderProps> = ({
  chatInput,
  setChatInput,
  exoMessage,
  onStartSession,
  onNavigateToLearn,
  onScrollDown,
  scrollY = 0,
  bannerRef,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const SLIDE_DURATION = 5500; // 5.5s per slide

  // Auto-advance timer
  useEffect(() => {
    if (isHovered) return;

    const intervalTime = 50;
    const step = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((curr) => (curr + 1) % SLIDES.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isHovered, currentSlide]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    setSlideProgress(0);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setSlideProgress(0);
  };

  const handleSelectSlide = (idx: number) => {
    setCurrentSlide(idx);
    setSlideProgress(0);
  };

  const current = SLIDES[currentSlide];
  const isScrolled = scrollY > 15;

  return (
    <div
      ref={bannerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0A0718] shadow-[0_14px_42px_rgba(0,0,0,0.22)] select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] p-4 sm:p-5 sm:px-6 flex flex-col justify-between snap-start shrink-0 ${
        isScrolled 
          ? current.glassActiveBorder + ' scale-[0.99] -translate-y-1' 
          : current.glassBorder
      }`}
    >
      {/* ================= BUTTER-SMOOTH GRADIENTS & GLOWING AMBIENT LIGHTS ================= */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none ${
              isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            {/* Deep Rich Gradient Base */}
            <div className={`w-full h-full bg-gradient-to-r ${slide.bgGradient}`} />

            {/* Glowing Ambient Radial Lights */}
            <div 
              style={{ background: slide.ambientLight }}
              className="absolute -top-12 right-12 w-96 h-96 rounded-full blur-3xl opacity-75"
            />
            <div 
              style={{ background: slide.ambientLight }}
              className="absolute -bottom-12 left-12 w-80 h-80 rounded-full blur-3xl opacity-40"
            />

            {/* Subtle Ethereal Dynamic Mesh Pattern */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>
        );
      })}

      {/* Luminous Top Shimmer Line that activates when scrolling */}
      <div
        className={`absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent transition-opacity duration-300 pointer-events-none ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ================= MAIN CONTENT ROW: SINGLE UNIFIED SURFACE ================= */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-7 pl-1 sm:pl-3 pr-1">
        
        {/* Left: 3D Orb with Equal Balanced Spacing on Both Sides */}
        <div className="flex items-center justify-center shrink-0 px-3 sm:px-5">
          <div
            onClick={() => {
              if (currentSlide === 1) {
                onNavigateToLearn();
              } else {
                onStartSession(chatInput || current.suggestedTopics[0]);
              }
            }}
            className="relative flex items-center justify-center w-22 h-22 sm:w-28 sm:h-28 cursor-pointer group"
            title={`Click EXO - ${current.buttonLabel}`}
          >
            <div
              className={`absolute inset-0 rounded-full border ${current.orbHaloBorder} bg-gradient-to-tr ${current.orbHaloBg} ${current.orbHaloShadow} pointer-events-none group-hover:scale-105 transition-transform duration-300`}
            />
            <div className="absolute inset-1.5 rounded-full border border-white/20 border-dashed pointer-events-none opacity-50" />

            <div className="scale-85 sm:scale-95">
              <ExoOrb
                size="sm"
                showPedestal={false}
                showSpeechBubble={false}
                subLabel=""
                speechBubbleTitle=""
                speechBubbleSubtitle=""
                interactive={true}
                accessory={currentSlide === 1 ? 'headphones' : currentSlide === 2 ? 'controller' : 'none'}
                className="!my-0 group-hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* Center: Dynamic Slide Content (Text color smoothly adapts) */}
        <div className="flex-1 flex flex-col items-start z-10 w-full min-w-0">
          
          {/* Top Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase mb-1">
            {React.createElement(current.badgeIcon, { className: "w-2.5 h-2.5 text-white/90" })}
            <span className="text-white/90">{current.badge}</span>
          </div>

          {/* Slide Title */}
          <h2 className={`text-base sm:text-xl md:text-2xl font-extrabold tracking-tight leading-tight ${current.textColor}`}>
            {current.title}{' '}
            <span className={`bg-gradient-to-r ${current.titleGradient} bg-clip-text text-transparent`}>
              {current.titleAccent}
            </span>
          </h2>

          {/* Subtitle */}
          <p className={`text-xs ${current.subtitleColor} mt-0.5 max-w-xl leading-normal line-clamp-1 sm:line-clamp-2`}>
            {current.subtitle}
          </p>

          {/* Search & Mic Input Bar */}
          <div className="w-full mt-2.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onStartSession(chatInput || current.suggestedTopics[0]);
              }}
              className={`relative flex items-center w-full rounded-xl p-1 pl-3 pr-1.5 backdrop-blur-md border shadow-sm transition-all ${current.inputBg} ${current.inputBorder}`}
            >
              <Search className={`w-3.5 h-3.5 shrink-0 mr-2 pointer-events-none ${current.searchIconColor}`} />
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Search or ask about ${current.titleAccent.toLowerCase()}...`}
                className={`flex-1 bg-transparent text-xs text-white ${current.inputPlaceholder} outline-none`}
              />

              {/* Mic Action Button */}
              <button
                type="button"
                onClick={() => onStartSession(chatInput || current.suggestedTopics[0])}
                className={`ml-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white transition-all shadow-xs shrink-0 bg-gradient-to-tr ${current.micGradient} ${current.micShadow} hover:scale-105 active:scale-95`}
                title={`Tap to ${current.buttonLabel}`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              {/* Submit Arrow */}
              <button
                type="submit"
                className="ml-1 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors shrink-0"
                title="Submit"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Status badge & Quick pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border truncate max-w-xs ${current.statusBadgeBg} ${current.statusBadgeText} ${current.statusBadgeBorder}`}>
                💬 {exoMessage}
              </span>

              {current.suggestedTopics.slice(0, 3).map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    if (currentSlide === 1) {
                      onNavigateToLearn();
                    } else {
                      onStartSession(topic);
                    }
                  }}
                  className={`hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full border transition-all ${current.promptPillBg} ${current.promptPillHover} ${current.promptPillText} ${current.promptPillBorder}`}
                >
                  +{topic}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ================= BOTTOM CONTROLS ROW: UNIFIED INSIDE THE CARD ================= */}
      <div className="relative z-10 mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
        
        {/* Slide Progress Indicator Pills + Integrated Left/Right Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevSlide}
            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white flex items-center justify-center transition-all mr-0.5"
            title="Previous slide"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={slide.id}
                onClick={() => handleSelectSlide(idx)}
                className={`group relative px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 text-white ring-1 ring-white/30' 
                    : 'bg-black/25 hover:bg-black/40 text-white/60 hover:text-white'
                }`}
              >
                <span>{idx + 1}</span>
                <span className="hidden md:inline text-[10px]">
                  {idx === 0 ? 'Speak' : idx === 1 ? 'Audiobooks' : 'Games'}
                </span>
                
                {isActive && (
                  <div className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${slideProgress}%` }}
                      className="h-full bg-white rounded-full transition-all duration-75"
                    />
                  </div>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleNextSlide}
            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white flex items-center justify-center transition-all ml-0.5"
            title="Next slide"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action & "Explore below" */}
        <div className="flex items-center gap-3">
          {onScrollDown && (
            <button
              onClick={onScrollDown}
              className="hidden sm:flex items-center gap-1 text-[11px] text-white/70 hover:text-white transition-colors"
              title="Scroll down to Your Subjects"
            >
              <span>Explore below</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </button>
          )}

          <button
            onClick={() => {
              if (currentSlide === 1) {
                onNavigateToLearn();
              } else {
                onStartSession(chatInput || current.suggestedTopics[0]);
              }
            }}
            className="text-xs font-bold text-white hover:text-purple-200 flex items-center gap-1 transition-colors"
          >
            <span>{current.buttonLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

    </div>
  );
};
