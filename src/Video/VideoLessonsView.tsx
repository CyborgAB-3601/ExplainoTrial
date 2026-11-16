import React from 'react';
import { ArrowLeft, Play, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export interface VideoLessonsViewProps {
  onBack?: () => void;
  className?: string;
}

export const VideoLessonsView: React.FC<VideoLessonsViewProps> = ({
  onBack,
  className = '',
}) => {
  const lessons = [
    {
      id: 1,
      title: 'Targeted Fix: Chemiosmosis & Thylakoid Proton Pump',
      duration: '3:15 min',
      subject: 'Biology',
      tag: 'Mistake Remediation',
      description: 'Clear 3-minute visual walkthrough explaining how H+ accumulation drives the ATP synthase turbine.',
    },
    {
      id: 2,
      title: 'Intuitive Derivation of Faraday’s Law of Induction',
      duration: '4:40 min',
      subject: 'Physics',
      tag: 'Concept Deep Dive',
      description: 'Visualizing changing magnetic flux and induced electromotive force using field line simulations.',
    },
    {
      id: 3,
      title: 'Geometric Meaning of the Eigenvalues & Eigenvectors',
      duration: '5:20 min',
      subject: 'Mathematics',
      tag: 'Visual Geometry',
      description: 'Understanding linear transformation stretch factors without getting lost in algebraic matrices.',
    },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#FAF8FE] text-[#1E1926] font-sans ${className}`}>
      {/* Top Header */}
      <header className="h-16 px-6 border-b border-purple-100/80 bg-white/70 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-100/50 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Wheel</span>
            </button>
          )}
          <div className="h-4 w-[1px] bg-slate-200 mx-1" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#EC4899] flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#1E1926]">Nilo Video Lessons</span>
              <p className="text-[11px] text-slate-500">Short targeted concept fixes & visual derivations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full [scrollbar-width:none]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex flex-col justify-between group hover:shadow-md transition-all">
              <div>
                <div className="w-full h-36 rounded-xl bg-purple-950/90 relative overflow-hidden flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                    {lesson.duration}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#7C5CFF] uppercase">{lesson.subject} • {lesson.tag}</span>
                <h3 className="text-sm font-bold text-[#1E1926] mt-1 group-hover:text-[#7C5CFF] transition-colors">{lesson.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{lesson.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
