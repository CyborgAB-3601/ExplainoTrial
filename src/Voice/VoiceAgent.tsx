import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  GitBranch,
  Volume2,
  ChevronRight,
  Flame,
  ArrowRight,
  X
} from 'lucide-react';

export interface VoiceAgentProps {
  initialTopic?: string;
  onClose?: () => void;
  onNavigateToTopic?: (topic: string) => void;
  className?: string;
}

export const VoiceAgent: React.FC<VoiceAgentProps> = ({
  initialTopic = 'Photosynthesis & Light Reactions',
  onClose,
  onNavigateToTopic,
  className = '',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [recordingState, setRecordingState] = useState<'idle' | 'prompting' | 'recording' | 'evaluating' | 'reviewed'>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<'feedback' | 'mindmap' | 'remediation'>('feedback');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulated transcription & evaluation
  const [studentTranscript, setStudentTranscript] = useState('');

  const samplePrompt = "Can you explain what happens during the light-dependent reactions of photosynthesis, and how ATP & NADPH are produced?";

  const sampleEvaluation = {
    masteryScore: 82,
    accuracy: 88,
    completeness: 75,
    clarity: 84,
    rights: [
      {
        claim: "Chlorophyll absorbs photon energy in Thylakoid membranes",
        detail: "Accurately identified that Photosystem II captures solar energy and excites electrons.",
      },
      {
        claim: "Photolysis of water produces oxygen gas",
        detail: "Correctly explained that H2O splitting replenishes electrons and releases O2 as a byproduct.",
      },
      {
        claim: "Proton gradient drives ATP synthase",
        detail: "Solid grasp of chemiosmosis: high H+ concentration in thylakoid lumen powers ATP synthesis.",
      },
    ],
    gaps: [
      {
        issue: "Confused ATP production in Calvin Cycle",
        correction: "ATP is produced during the light reactions and consumed in the Calvin Cycle (dark reaction) to synthesize G3P sugar.",
        severity: "medium",
      },
      {
        issue: "Omitted NADPH electron carrier role",
        correction: "NADP+ is reduced to NADPH at Photosystem I by ferredoxin-NADP+ reductase (FNR).",
        severity: "low",
      },
    ],
    mindMapNodes: [
      { id: '1', title: 'Thylakoid Membrane', status: 'mastered' },
      { id: '2', title: 'Photolysis of H2O', status: 'mastered' },
      { id: '3', title: 'Electron Transport Chain', status: 'mastered' },
      { id: '4', title: 'Proton Gradient (H+)', status: 'mastered' },
      { id: '5', title: 'ATP Synthase Complex', status: 'mastered' },
      { id: '6', title: 'Calvin Cycle ATP Usage', status: 'needs-fix' },
      { id: '7', title: 'NADPH Synthesis (PSI)', status: 'needs-fix' },
    ],
  };

  const handleStartPrompt = () => {
    setRecordingState('prompting');
  };

  const handleStartRecording = () => {
    setRecordingState('recording');
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingState('evaluating');
    setStudentTranscript(
      "So in the thylakoid membranes, chlorophyll traps sunlight. Water molecules get split into hydrogen ions and oxygen gas. The excited electrons travel down the electron transport chain, creating a proton pump gradient that turns ATP synthase to make ATP. Then the Calvin cycle also produces some ATP."
    );

    setTimeout(() => {
      setRecordingState('reviewed');
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_60px_rgba(124,92,255,0.14)] overflow-hidden transition-all duration-300 ${className}`}>
      
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-purple-100/70 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-pink-50/40 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-[#EC4899] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#1E1926] tracking-tight">Nilo Feynman Voice Agent</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 tracking-wide uppercase">Oral Exam</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Explain in your own words — Nilo verifies, spots gaps & teaches mistakes</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close Voice Session"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="p-6 flex flex-col gap-6">

        {/* Topic Prompt Card */}
        <div className="p-4 rounded-2xl bg-[#FAF8FE] border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-100/70 text-[#7C5CFF] shrink-0 mt-0.5">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#7C5CFF] uppercase tracking-wider">Current Topic Challenge</span>
              <h3 className="text-sm font-bold text-[#1E1926] mt-0.5">{topic}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{samplePrompt}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {recordingState === 'idle' && (
              <button
                onClick={handleStartRecording}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#EC4899] text-white text-xs font-bold shadow-md shadow-purple-500/25 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Start Explaining</span>
              </button>
            )}

            {recordingState === 'recording' && (
              <button
                onClick={handleStopRecording}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/25 transition-all flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Finish ({recordingSeconds}s)</span>
              </button>
            )}

            {recordingState === 'reviewed' && (
              <button
                onClick={handleStartRecording}
                className="px-3.5 py-1.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Explain</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Visualizer (During Recording) */}
        {recordingState === 'recording' && (
          <div className="p-8 rounded-2xl bg-purple-900/90 text-white flex flex-col items-center justify-center gap-4 animate-in fade-in">
            <div className="flex items-center gap-1.5">
              {[40, 75, 120, 90, 60, 110, 80, 130, 95, 50, 85, 115, 70].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-pink-400 to-purple-300 rounded-full animate-pulse"
                  style={{
                    height: `${h * 0.45}px`,
                    animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <span>Nilo is listening to your explanation... ({recordingSeconds}s)</span>
            </div>
          </div>
        )}

        {/* Evaluation Progress State */}
        {recordingState === 'evaluating' && (
          <div className="p-8 rounded-2xl bg-purple-50 border border-purple-200/80 flex flex-col items-center justify-center gap-3">
            <Sparkles className="w-7 h-7 text-[#7C5CFF] animate-spin" />
            <h4 className="text-sm font-bold text-[#1E1926]">Nilo is analyzing your explanation...</h4>
            <p className="text-xs text-slate-500">Cross-checking key causal links, terminology, and concept precision.</p>
          </div>
        )}

        {/* Results & Multi-Tab Breakdown (When Reviewed) */}
        {recordingState === 'reviewed' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-100/60 via-pink-50/50 to-purple-50/60 border border-purple-200/70">
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/80 shadow-xs text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Feynman Score</span>
                <span className="text-2xl font-black text-[#7C5CFF] tracking-tight">{sampleEvaluation.masteryScore}%</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">Strong Concept</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/80 shadow-xs text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Accuracy</span>
                <span className="text-xl font-black text-slate-800">{sampleEvaluation.accuracy}%</span>
                <span className="text-[10px] text-slate-500">Core scientific claims</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/80 shadow-xs text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completeness</span>
                <span className="text-xl font-black text-slate-800">{sampleEvaluation.completeness}%</span>
                <span className="text-[10px] text-amber-600">Missed 1 sub-step</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/80 shadow-xs text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clarity</span>
                <span className="text-xl font-black text-slate-800">{sampleEvaluation.clarity}%</span>
                <span className="text-[10px] text-slate-500">Simple plain language</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'feedback'
                    ? 'bg-[#1E1926] text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>What's Right & Wrong</span>
              </button>
              <button
                onClick={() => setActiveTab('mindmap')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'mindmap'
                    ? 'bg-[#1E1926] text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Dynamic Mind Map</span>
              </button>
              <button
                onClick={() => setActiveTab('remediation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'remediation'
                    ? 'bg-[#1E1926] text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Teach What You Missed</span>
              </button>
            </div>

            {/* Tab 1: What's Right & Wrong */}
            {activeTab === 'feedback' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rights Column */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>What You Nailed</span>
                  </div>
                  {sampleEvaluation.rights.map((item, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col gap-1">
                      <span className="text-xs font-bold text-emerald-900">{item.claim}</span>
                      <p className="text-[11px] text-emerald-800/90 leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Gaps Column */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Misconceptions & Gaps</span>
                  </div>
                  {sampleEvaluation.gaps.map((item, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col gap-1">
                      <span className="text-xs font-bold text-amber-900">{item.issue}</span>
                      <p className="text-[11px] text-amber-800 leading-relaxed">{item.correction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Dynamic Mind Map */}
            {activeTab === 'mindmap' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-700">Concept Mastery Map: Light Reactions</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {sampleEvaluation.mindMapNodes.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        n.status === 'mastered'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      <span>{n.title}</span>
                      {n.status === 'mastered' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Targeted Mistake Remediation */}
            {activeTab === 'remediation' && (
              <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7C5CFF] uppercase tracking-wider">Targeted 30-Second Fix</span>
                  <span className="text-[11px] text-slate-500">ATP & Calvin Cycle Distinction</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Remember: <strong>Light Reactions</strong> build up the rechargeable batteries (ATP and NADPH) using photon energy. The <strong>Calvin Cycle (Dark Reactions)</strong> then unloads and spends that ATP to fix atmospheric CO2 into glucose sugars!
                </p>
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className="px-4 py-1.5 rounded-xl bg-[#7C5CFF] hover:bg-[#6848E6] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Understood, Got It</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
