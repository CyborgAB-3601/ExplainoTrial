import React, { useState } from 'react';
import { ArrowLeft, Target, Gamepad2, Box } from 'lucide-react';
import { ArcadeCabinet3D } from '../components/ArcadeCabinet3D';
import { ArcadePage } from '../components/ArcadePage';
import { TrajectoryTitanGame } from './TrajectoryTitanGame';

export interface GamesViewProps {
  onBack?: () => void;
  className?: string;
}

export const GamesView: React.FC<GamesViewProps> = ({
  onBack,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'arcade_page' | '3d_cabinet'>('arcade_page');

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#0A0B1A] text-white font-sans ${className}`}>
      {/* ── Top Header Bar with Menu Center / Back to Wheel & Game Mode Switcher ── */}
      <header className="h-12 px-4 bg-black/75 border-b border-purple-900/40 flex items-center justify-between shrink-0 z-50 backdrop-blur-md">
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

        {/* View Switcher: Arcade Catalog | 3D Cabinet */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/10 border border-white/10">
          <button
            onClick={() => setViewMode('arcade_page')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'arcade_page'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Arcade Catalog</span>
          </button>

          <button
            onClick={() => setViewMode('3d_cabinet')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === '3d_cabinet'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Cabinet</span>
          </button>
        </div>
      </header>

      {/* ── Active Game Stage ── */}
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
