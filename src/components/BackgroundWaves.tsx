import React from 'react';

export const BackgroundWaves: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background Soft Mesh Gradients */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-purple-200/25 via-pink-100/20 to-transparent rounded-full blur-3xl opacity-70" />
      
      {/* Left Flowing Ribbon / Wave Shape */}
      <svg 
        className="absolute top-0 left-0 w-[55vw] max-w-[850px] h-[650px] opacity-40 mix-blend-multiply"
        viewBox="0 0 800 600" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="leftWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#F5D0FE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path 
          d="M-100 0 C 150 100, 300 280, 200 480 C 120 620, -50 550, -100 500 Z" 
          fill="url(#leftWaveGrad)" 
        />
      </svg>

      {/* Right Flowing Ribbon / Wave Shape */}
      <svg 
        className="absolute top-0 right-0 w-[55vw] max-w-[850px] h-[650px] opacity-40 mix-blend-multiply" 
        viewBox="0 0 800 600" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rightWaveGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5D0FE" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#E0E7FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path 
          d="M900 20 C 650 120, 500 260, 600 450 C 680 580, 850 500, 900 450 Z" 
          fill="url(#rightWaveGrad)" 
        />
      </svg>

      {/* Subtle Floating Translucent Pastel Pebbles & Orbs (from original screenshot) */}
      {/* 1. Left upper-mid pebble */}
      <div 
        className="absolute top-48 left-[8%] w-10 h-14 rounded-full bg-gradient-to-tr from-purple-300/40 via-pink-200/50 to-white/60 shadow-[0_8px_20px_rgba(168,85,247,0.12)] blur-[1px] transform -rotate-45"
      />
      {/* 2. Top-right capsule pebble */}
      <div 
        className="absolute top-28 right-[12%] w-9 h-14 rounded-full bg-gradient-to-tr from-purple-200/50 via-pink-200/40 to-white/60 shadow-[0_8px_20px_rgba(168,85,247,0.1)] blur-[1px] transform rotate-[35deg]"
      />
      {/* 3. Right mid-lower pebble */}
      <div 
        className="absolute top-72 right-[5%] w-8 h-12 rounded-full bg-gradient-to-bl from-pink-200/40 to-purple-200/30 blur-[1px] transform -rotate-12"
      />
      {/* 4. Left lower-mid small droplet */}
      <div 
        className="absolute top-80 left-[16%] w-7 h-7 rounded-full bg-gradient-to-tr from-pink-300/40 to-white/50 blur-[0.5px]"
      />
    </div>
  );
};
