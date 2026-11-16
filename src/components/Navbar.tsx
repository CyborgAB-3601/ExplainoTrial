import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NavbarProps {
  onLoginClick?: () => void;
  onHomeClick?: () => void;
  currentPage?: 'home' | 'login' | 'signup';
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onLoginClick, 
  onHomeClick,
  currentPage = 'home' 
}) => {
  return (
    <header className="w-full max-w-7xl mx-auto px-6 pt-5 pb-3">
      <nav className="flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none group" 
          onClick={onHomeClick}
        >
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#EC4899] p-0.5 shadow-md shadow-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0.5 left-1 w-2.5 h-1.5 bg-white/50 rounded-full blur-[0.5px]" />
              <div className="flex items-center gap-0.5 text-white scale-[0.65] font-black tracking-tighter">
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 6.5L4 2.5L6.5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.5 6.5L10 2.5L12.5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-wide text-[#1E1926] font-sans">
            NILO
          </span>
        </div>

        {/* Right Area: Login / Sign Up Action Button */}
        <div className="flex items-center gap-3">
          {currentPage !== 'home' ? (
            <button
              onClick={onHomeClick}
              className="px-4 py-2 rounded-full text-sm font-semibold text-[#6B7280] hover:text-[#1E1B2E] hover:bg-white/60 transition-all"
            >
              Back to Home
            </button>
          ) : null}

          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-[#5046E5] via-[#7042F8] to-[#9333EA] hover:opacity-95 shadow-[0_4px_16px_rgba(112,66,248,0.32)] active:scale-[0.98] transition-all duration-200"
          >
            <span>Login / Sign Up</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </nav>
    </header>
  );
};
