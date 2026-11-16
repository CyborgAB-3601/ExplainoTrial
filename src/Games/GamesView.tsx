import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ArcadeCabinet3D } from '../components/ArcadeCabinet3D';
import { ArcadePage } from '../components/ArcadePage';

export interface GamesViewProps {
  onBack?: () => void;
  className?: string;
}

export const GamesView: React.FC<GamesViewProps> = ({
  onBack,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'3d_cabinet' | 'arcade_page'>('3d_cabinet');

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#0A0B1A] text-white font-sans ${className}`}>
      {/* ── Top Header Bar with Menu Center / Back to Wheel ── */}
      <header className="h-12 px-4 bg-black/70 border-b border-purple-900/40 flex items-center justify-between shrink-0 z-50 backdrop-blur-md">
        <button
          onClick={onBack}
          className="px-3 py-1 rounded-full bg-[#FAF2F6] hover:bg-[#F4E3ED] border border-[#8E2856]/20 text-[#8E2856] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          title="Return to Nilo Home Wheel"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-[#8E2856] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-2 h-2 fill-white">
              <path d="M12 2C10.5 5 8 7 5 7C7 9.5 7 12 5 14.5C8 14.5 10.5 16.5 12 19.5C13.5 16.5 16 14.5 19 14.5C17 12 17 9.5 19 7C16 7 13.5 5 12 2Z" />
            </svg>
          </div>
          <span>Menu center</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold tracking-wider text-purple-300 uppercase">
            Nilo Concept Arcade
          </span>
          {viewMode === 'arcade_page' && (
            <button
              onClick={() => setViewMode('3d_cabinet')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              View 3D Cabinet
            </button>
          )}
        </div>
      </header>

      {/* ── 3D Arcade Screen vs Arcade Page ── */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === '3d_cabinet' ? (
          <ArcadeCabinet3D
            onEnterArcade={() => setViewMode('arcade_page')}
            onClose={onBack}
          />
        ) : (
          <ArcadePage
            onBackToHome={onBack || (() => {})}
            onView3DModel={() => setViewMode('3d_cabinet')}
            userName="Abhinav"
          />
        )}
      </div>
    </div>
  );
};
