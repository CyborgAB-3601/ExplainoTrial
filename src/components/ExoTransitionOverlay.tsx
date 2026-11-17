import React, { useEffect, useState } from 'react';
import { ArrowRight, Wind } from 'lucide-react';

interface ExoTransitionOverlayProps {
  onComplete: () => void;
  topic?: string;
}

export const ExoTransitionOverlay: React.FC<ExoTransitionOverlayProps> = ({
  onComplete,
  topic = "Photosynthesis"
}) => {
  const [progress, setProgress] = useState(0);
  const [isWarping, setIsWarping] = useState(false);

  useEffect(() => {
    // Smooth progress counter to 100% over 3 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 60);

    // Warp into workspace transition at 2.6s
    const warpTimer = setTimeout(() => {
      setIsWarping(true);
    }, 2600);

    // Complete transition at 3.2s
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(warpTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden select-none transition-all duration-700 ${
        isWarping ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #E0EEFE 0%, #EDE9FE 40%, #F8F7FF 100%)',
      }}
    >
      {/* ================= HIGH-ALTITUDE ATMOSPHERIC SKY & CLOUDS ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft glowing ambient clouds / nebulae */}
        <div className="absolute -top-20 -left-20 w-[600px] h-[500px] rounded-full bg-gradient-to-br from-white/70 via-purple-100/40 to-transparent blur-3xl" />
        <div className="absolute top-1/4 -right-24 w-[500px] h-[600px] rounded-full bg-gradient-to-bl from-pink-200/35 via-sky-100/40 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-10 w-72 h-44 rounded-full bg-purple-200/25 blur-2xl transform -rotate-12" />
        <div className="absolute top-1/2 right-16 w-80 h-48 rounded-full bg-purple-200/20 blur-2xl transform rotate-12" />
        
        {/* Sun Flare in upper corner */}
        <div className="absolute -top-10 right-1/4 w-96 h-96 rounded-full bg-gradient-to-b from-white/80 via-amber-100/30 to-transparent blur-3xl pointer-events-none" />

        {/* Ambient Distant Floating Pastel Shapes (Matching Reference Image) */}
        <div className="absolute top-[28%] right-[14%] w-24 h-40 rounded-full bg-gradient-to-tr from-purple-400/25 to-pink-300/30 blur-xl transform rotate-45 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[48%] left-[8%] w-28 h-44 rounded-full bg-gradient-to-tr from-purple-400/20 to-indigo-300/25 blur-xl transform -rotate-30" />
      </div>

      {/* ================= FAST UPWARD WIND STREAKS (High-Speed Terminal Velocity) ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(24)].map((_, i) => {
          const leftPos = (i * 4.2) + 2;
          const height = 80 + (i % 6) * 35;
          const duration = 0.55 + (i % 4) * 0.15;
          const delay = (i % 5) * 0.12;
          const opacity = 0.25 + (i % 3) * 0.2;
          return (
            <div
              key={i}
              className="absolute w-[1.5px] rounded-full bg-gradient-to-t from-transparent via-white to-transparent"
              style={{
                left: `${leftPos}%`,
                height: `${height}px`,
                opacity: opacity,
                animation: `rushUpward ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
                filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))',
              }}
            />
          );
        })}
      </div>

      {/* ================= TOP BRANDING: NILO ================= */}
      <header className="relative z-30 pt-4 sm:pt-6 pb-2 flex items-center justify-between w-full px-6 sm:px-10 shrink-0">
        <div className="flex-1" />
        
        {/* Centered Minimalist Logo Header */}
        <div className="flex items-center justify-center tracking-[0.4em] text-[11px] sm:text-xs font-black text-[#5B50A0]/80 uppercase">
          NILO
        </div>

        {/* Quick Skip button at the far end */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={onComplete}
            className="text-xs font-bold text-[#6366F1] hover:text-[#4F46E5] bg-white/85 hover:bg-white px-3.5 py-1.5 rounded-full border border-purple-200/80 shadow-xs backdrop-blur-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Skip directly to workspace"
          >
            <span>Skip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ================= CENTER: ORB FREE-FALLING FROM SKY FACING THE WIND ================= */}
      <div className="relative z-20 flex-1 min-h-0 flex flex-col items-center justify-center w-full px-4 py-1">
        
        {/* Skydiving Orb Assembly with Wind Reactions */}
        <div className="relative flex items-center justify-center shrink-0">

          {/* AERODYNAMIC WIND TRAILS (translucent white vapor wisps rushing upward) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Left Wispy Vapor Trail */}
            <svg 
              className="absolute -top-16 -left-12 sm:-left-16 w-28 sm:w-36 h-36 sm:h-48 text-white/60 pointer-events-none animate-wind-trail-left" 
              viewBox="0 0 100 200" 
              fill="none"
            >
              <path 
                d="M80 180 C60 140, 20 110, 45 60 C65 20, 25 10, 30 0" 
                stroke="url(#windGradL)" 
                strokeWidth="6" 
                strokeLinecap="round" 
                filter="url(#windBlur)"
              />
              <path 
                d="M75 160 C50 125, 30 90, 50 40 C60 15, 40 5, 45 0" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                opacity="0.8"
              />
              <defs>
                <linearGradient id="windGradL" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="white" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <filter id="windBlur">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>
            </svg>

            {/* Right Wispy Vapor Trail */}
            <svg 
              className="absolute -top-18 -right-12 sm:-right-16 w-28 sm:w-36 h-36 sm:h-48 text-white/60 pointer-events-none animate-wind-trail-right" 
              viewBox="0 0 100 200" 
              fill="none"
            >
              <path 
                d="M20 180 C40 140, 80 105, 55 55 C35 20, 75 10, 70 0" 
                stroke="url(#windGradR)" 
                strokeWidth="6" 
                strokeLinecap="round" 
                filter="url(#windBlur)"
              />
              <path 
                d="M25 160 C50 125, 70 90, 50 35 C40 15, 60 5, 55 0" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                opacity="0.8"
              />
              <defs>
                <linearGradient id="windGradR" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="white" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Behind Wind Slipstream Vortex */}
            <div className="absolute -top-10 w-36 sm:w-44 h-40 sm:h-48 rounded-full bg-gradient-to-t from-white/30 via-white/10 to-transparent blur-lg transform -rotate-2" />
          </div>

          {/* WIND BUFFETING CONTAINER: Micro-jitter & high-speed oscillation against the wind */}
          <div className="relative animate-wind-buffet flex items-center justify-center">

            {/* Soft Ambient Orb Aura */}
            <div className="absolute -inset-8 rounded-full bg-gradient-to-tr from-purple-400/30 via-pink-300/25 to-sky-300/30 blur-2xl pointer-events-none" />

            {/* ================= 3D SPHERICAL ORB BODY ================= */}
            <div 
              className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-50 md:h-50 rounded-full overflow-hidden shadow-[0_16px_45px_rgba(124,92,255,0.35),0_0_25px_rgba(255,255,255,0.8),inset_0_4px_12px_rgba(255,255,255,0.9)] border-[2px] sm:border-[2.5px] border-white/90"
              style={{
                background: 'radial-gradient(circle at 45% 28%, #FFFFFF 0%, #F5D0FE 14%, #C084FC 38%, #8B5CF6 64%, #4F46E5 85%, #312E81 100%)',
              }}
            >
              {/* Gloss Specular Highlight Arc */}
              <div className="absolute top-2 left-6 right-6 h-10 rounded-full bg-gradient-to-b from-white/95 to-transparent blur-[1px] transform -rotate-12 pointer-events-none" />
              
              {/* Wind Streak Glints across Sphere Surface */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Bottom Shadow within Sphere */}
              <div className="absolute -bottom-5 inset-x-0 h-16 rounded-full bg-gradient-to-t from-indigo-950/40 to-transparent blur-md pointer-events-none" />
            </div>

            {/* ================= AERODYNAMIC SKI / SKYDIVE GOGGLES ================= */}
            <div className="absolute z-30 pointer-events-none flex items-center justify-center w-full">
              
              {/* Elastic Headband Strap with Logo Mark */}
              <div className="absolute w-[116%] sm:w-[118%] h-6 sm:h-7 md:h-8 rounded-full bg-gradient-to-r from-[#D8B4FE] via-[#E9D5FF] to-[#D8B4FE] border border-white/80 shadow-md flex items-center justify-between px-2.5 sm:px-3">
                <span className="text-[8px] sm:text-[9px] font-black text-purple-700 tracking-wider">▲▲</span>
                <span className="text-[8px] sm:text-[9px] font-black text-purple-700 tracking-wider">▲▲</span>
              </div>

              {/* Outer Ergonomic White Goggle Frame */}
              <div className="relative w-34 sm:w-40 md:w-46 h-18 sm:h-20 md:h-23 rounded-[28px] sm:rounded-[34px] md:rounded-[36px] bg-gradient-to-b from-white via-[#FAF5FF] to-[#E9D5FF] p-1 sm:p-1.5 md:p-2 shadow-[0_8px_24px_rgba(30,27,75,0.3),0_2px_4px_rgba(255,255,255,0.9),inset_0_2px_4px_rgba(255,255,255,1)] border border-white flex items-center justify-center">
                
                {/* Polarized Iridescent Visor Lens */}
                <div 
                  className="relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] overflow-hidden flex items-center justify-center shadow-inner"
                  style={{
                    background: 'linear-gradient(135deg, #6EE7B7 0%, #38BDF8 25%, #818CF8 55%, #C084FC 80%, #F472B6 100%)',
                  }}
                >
                  {/* Visor Specular Reflection Sweep */}
                  <div className="absolute -top-8 -left-5 w-28 sm:w-34 h-20 sm:h-24 rounded-full bg-white/45 blur-[2px] transform rotate-25 pointer-events-none" />
                  <div className="absolute bottom-1 right-2 w-16 sm:w-20 h-5 sm:h-6 rounded-full bg-white/30 blur-[1px] transform -rotate-12 pointer-events-none" />

                  {/* Wind Reaction: Closed Squinting Happy Eyes Against the Rush of Wind (`< >`) */}
                  <div className="relative z-10 flex items-center justify-between w-22 sm:w-26 md:w-30 px-1.5 sm:px-2">
                    {/* Left Squint Eye: `<` */}
                    <svg width="20" height="15" viewBox="0 0 24 18" fill="none" className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.95)] sm:scale-110">
                      <path 
                        d="M18 3L6 9L18 15" 
                        stroke="white" 
                        strokeWidth="3.4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>

                    {/* Right Squint Eye: `>` */}
                    <svg width="20" height="15" viewBox="0 0 24 18" fill="none" className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.95)] sm:scale-110">
                      <path 
                        d="M6 3L18 9L6 15" 
                        stroke="white" 
                        strokeWidth="3.4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>

                </div>

                {/* Goggle Nose Bridge Indentation Contour */}
                <div className="absolute -bottom-1 w-5 sm:w-6 h-2.5 sm:h-3 rounded-full bg-white shadow-sm" />
              </div>

            </div>

          </div>

        </div>

        {/* ================= GRADIENT MOTION GRAPHIC STYLE TYPOGRAPHY ================= */}
        <div className="mt-3 sm:mt-5 flex flex-col items-center text-center max-w-lg px-4 shrink-0">
          
          {/* Main Headline: "Let's Learn by Explaining" */}
          <div className="relative group">
            {/* Glowing Ambient Backdrop Text Bloom */}
            <h1 
              aria-hidden="true" 
              className="absolute inset-0 text-xl sm:text-3xl md:text-4xl font-black tracking-tight select-none blur-lg opacity-60 bg-gradient-to-r from-[#6366F1] via-[#EC4899] to-[#38BDF8] bg-clip-text text-transparent transform translate-y-0.5"
            >
              Let's Learn by Explaining
            </h1>

            {/* Front Crisp Gradient Motion Graphic Text */}
            <h1 
              className="relative text-xl sm:text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-[#4F46E5] via-[#9333EA] to-[#DB2777] bg-clip-text text-transparent animate-gradient-flow"
              style={{
                backgroundSize: '200% auto',
              }}
            >
              Let's Learn by Explaining
            </h1>
          </div>

          {/* Subtitle / Topic Notice */}
          <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-[#6B5EAE]">
            PREPARING YOUR EXPLANATION • <span className="text-purple-600 font-extrabold">{topic}</span>
          </p>

          {/* High-Altitude Loading Progress Capsule Bar */}
          <div className="mt-2.5 sm:mt-3 w-48 sm:w-60 h-1.5 sm:h-2 rounded-full bg-white/85 p-0.5 border border-purple-200/80 shadow-inner overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#C084FC] to-[#38BDF8] transition-all duration-150 ease-out shadow-[0_0_8px_rgba(168,85,247,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Animated Speed Tag */}
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-purple-700/80">
            <Wind className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse text-sky-500" />
            <span>Terminal velocity dive • Entering workspace...</span>
          </div>

          {/* Skip Button at the end of content */}
          <button
            onClick={onComplete}
            className="mt-3 text-xs font-bold text-[#6366F1] hover:text-[#4F46E5] bg-white/85 hover:bg-white px-4 py-1.5 rounded-full border border-purple-200/80 shadow-xs backdrop-blur-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Skip to Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* ================= BOTTOM: MAJESTIC 3D SPHERICAL CURVED PLANET EARTH ================= */}
      <div className="relative z-10 w-full shrink-0 flex items-end justify-center pointer-events-none select-none overflow-hidden h-36 sm:h-48 md:h-56">

        {/* Giant 3D Curved Earth Sphere (Crisp, clean spherical arc with no bleeding haze) */}
        <div 
          className="relative w-[160vw] sm:w-[140vw] md:w-[120vw] min-w-[1200px] h-[380px] sm:h-[460px] md:h-[540px] rounded-t-[50%] shrink-0 -mb-[250px] sm:-mb-[305px] md:-mb-[355px] overflow-hidden border-t-[3px] border-cyan-100/95 shadow-[0_-3px_12px_rgba(56,189,248,0.3),inset_0_4px_24px_rgba(255,255,255,0.7)]"
          style={{
            background: 'radial-gradient(ellipse at 50% 12%, #BAE6FD 0%, #38BDF8 16%, #0EA5E9 38%, #0284C7 64%, #0369A1 85%, #082F49 100%)',
          }}
        >
          {/* Atmosphere Luminous Ozone Glow Layer */}
          <div className="absolute top-0 inset-x-0 h-6 sm:h-8 bg-gradient-to-b from-white via-cyan-200/90 to-transparent blur-[1px] pointer-events-none" />

          {/* Continents / Landmass Silhouettes (Naturally curving across the globe) */}
          <svg className="absolute inset-0 w-full h-full opacity-85" viewBox="0 0 1200 400" preserveAspectRatio="none">
            {/* Left Landmass (North / Greenland / Scandinavian shape) with coastal shelf */}
            <path d="M 240 70 Q 290 45 350 70 T 420 120 Q 360 170 290 145 Z" fill="#0D9488" opacity="0.6" filter="blur(2px)" />
            <path d="M 250 75 Q 295 50 345 75 T 410 115 Q 350 160 295 140 Z" fill="#166534" opacity="0.85" />
            <path d="M 270 85 Q 310 65 350 85 T 390 110 Q 350 135 320 120 Z" fill="#15803D" opacity="0.9" />

            {/* Center-Right Continental Landmass (Europe / Africa shape) */}
            <path d="M 460 85 Q 550 30 650 70 T 780 125 Q 710 205 570 180 Q 480 145 460 85 Z" fill="#0D9488" opacity="0.55" filter="blur(2px)" />
            <path d="M 470 90 Q 555 35 645 75 T 770 120 Q 700 195 570 175 Q 490 140 470 90 Z" fill="#166534" opacity="0.85" />
            <path d="M 500 100 Q 580 50 655 85 T 725 125 Q 660 165 580 150 Z" fill="#15803D" opacity="0.95" />
            <path d="M 540 115 Q 600 75 640 100 T 670 130 Q 630 150 580 140 Z" fill="#4ADE80" opacity="0.6" />

            {/* Far Right Coastal Landmass */}
            <path d="M 850 75 Q 950 35 1060 80 T 1140 170 Q 1000 195 900 140 Z" fill="#0D9488" opacity="0.5" filter="blur(2px)" />
            <path d="M 860 80 Q 955 40 1050 85 T 1130 165 Q 995 190 905 135 Z" fill="#166534" opacity="0.8" />
            <path d="M 890 95 Q 960 60 1020 95 T 1070 140 Q 980 165 930 130 Z" fill="#15803D" opacity="0.9" />
          </svg>

          {/* Natural Atmospheric Cloud Swirls (Translucent, curved, realistic) */}
          <div className="absolute top-2 left-[15%] w-[35%] h-14 bg-gradient-to-r from-white/20 via-white/70 to-white/10 rounded-full blur-md opacity-85 pointer-events-none transform -rotate-2" />
          <div className="absolute top-6 right-[18%] w-[38%] h-16 bg-gradient-to-r from-white/15 via-white/65 to-white/20 rounded-full blur-md opacity-80 pointer-events-none transform rotate-1" />
          <div className="absolute top-10 left-[35%] w-[30%] h-12 bg-gradient-to-r from-white/10 via-white/50 to-white/10 rounded-full blur-sm opacity-70 pointer-events-none" />
        </div>

      </div>

      {/* ================= CSS KEYFRAMES FOR WIND BUFFETING & RUSHING STREAKS ================= */}
      <style>{`
        @keyframes rushUpward {
          0% {
            transform: translateY(100vh);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-40vh);
            opacity: 0;
          }
        }

        @keyframes windBuffet {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          20% {
            transform: translateY(-3px) rotate(-1.2deg) scale(0.99, 1.01);
          }
          40% {
            transform: translateY(2px) rotate(0.8deg) scale(1.01, 0.99);
          }
          60% {
            transform: translateY(-2px) rotate(-0.6deg) scale(0.995, 1.005);
          }
          80% {
            transform: translateY(2.5px) rotate(1deg) scale(1.005, 0.995);
          }
        }

        @keyframes windTrailLeft {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate(-4px, -8px) scale(1.05);
            opacity: 0.95;
          }
        }

        @keyframes windTrailRight {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate(4px, -8px) scale(1.05);
            opacity: 0.95;
          }
        }

        .animate-wind-buffet {
          animation: windBuffet 0.8s ease-in-out infinite;
        }

        .animate-wind-trail-left {
          animation: windTrailLeft 0.6s ease-in-out infinite;
        }

        .animate-wind-trail-right {
          animation: windTrailRight 0.6s ease-in-out infinite;
        }

        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-flow {
          animation: gradientFlow 3s ease infinite;
        }
      `}</style>

    </div>
  );
};
