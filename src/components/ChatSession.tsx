import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Settings,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Mic,
  MicOff,
  Keyboard,
  Video,
  Upload,
  MoreHorizontal,
  Check,
  Play,
  FileText,
  Sun,
  Cloud,
  Droplets,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Target,
  Zap,
  BookOpen,
  TrendingUp,
  Award,
} from 'lucide-react';
import { ExoOrb } from './ExoOrb';
import { SphericalDotsBackground, VoiceFeedbackStatus } from './SphericalDotsBackground';
import { useMicrophoneAudio } from '../hooks/useMicrophoneAudio';
import { useLiveSpeechRecognition } from '../hooks/useLiveSpeechRecognition';
import orbVoiceBg from '../assets/orb-voice-bg.jpg';

/* ─────────────────────────────────────────────────────────────────
   Simulated transcript phrases
───────────────────────────────────────────────────────────────── */
const DEMO_PHRASES = [
  'Can you explain',
  'how photosynthesis works?',
  'Like, what exactly',
  'happens inside the leaf?',
  'And why does it need sunlight?',
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'exo';
  text?: string;
  timestamp: string;
  isTranscribing?: boolean;
  hasDiagram?: boolean;
  chips?: string[];
}

interface ChatSessionProps {
  onBackToDashboard: () => void;
  userName?: string;
  initialTopic?: string;
}

export const ChatSession: React.FC<ChatSessionProps> = ({
  onBackToDashboard,
  userName = 'Jasmin',
  initialTopic = 'Photosynthesis',
}) => {
  const [isMicActive, setIsMicActive]     = useState(false);
  const [inputMessage, setInputMessage]   = useState('');
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [copiedId, setCopiedId]           = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(true);

  /* Transcript state */
  const [doneLines, setDoneLines]         = useState<string[]>([]);
  const [typingLine, setTypingLine]       = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* Voice 3D Spherical Feedback & Test State */
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedbackStatus>('normal');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isOrbHovered, setIsOrbHovered] = useState(false);
  const [isQuestionDone, setIsQuestionDone] = useState(false);
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [isSimulatingVoice, setIsSimulatingVoice] = useState(false);
  /* Press & Hold or Click-to-Listen State */
  const [isHoldingOrb, setIsHoldingOrb] = useState(false);
  const isHoldingOrbRef = useRef(false);
  const [isClickedListening, setIsClickedListening] = useState(false);
  const pointerDownTimeRef = useRef(0);
  const isListeningNow = isHoldingOrb || isClickedListening;

  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [aiVoiceReply, setAiVoiceReply] = useState<string | null>(null);
  const [userLastSpoken, setUserLastSpoken] = useState<string | null>(null);

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Live microphone audio hook with smooth voice volume detection
  const {
    volume: micVolume,
    permissionStatus: micPermission,
    errorMessage: micError,
    start: retryMic,
  } = useMicrophoneAudio(isMicActive);

  // Web Speech API Transcription: active when user holds orb OR clicks listen!
  const isSpeechActive = isMicActive && (isQuestionDone || isClickedListening) && isListeningNow;
  const {
    interimTranscript,
    finalTranscript,
    fullTranscript,
    finalLines: userSpokenLines,
    reset: resetSpeechTranscript,
    isListening: isSpeechRecognizing,
    isSupported: isSpeechSupported,
  } = useLiveSpeechRecognition(isSpeechActive);

  // Voice level responds strictly when user is holding or clicked to speak
  const effectiveVoiceLevel = isSpeechActive
    ? (isSimulatingVoice ? 0.75 : micVolume)
    : 0;

  // Active talking state
  const isVoiceActive = isSpeechActive;

  const handleStatusReset = useCallback(() => {
    setVoiceFeedback('normal');
  }, []);

  const TESTS = [
    {
      id: 'test-1',
      title: 'Practice Test 1: Light Reactions in Chloroplast',
      prompt: 'Explain what happens when light hits chlorophyll inside the leaf cell.',
    },
    {
      id: 'test-2',
      title: 'Practice Test 2: Calvin Cycle & Carbon Fixation',
      prompt: 'How does carbon dioxide turn into glucose without direct sunlight?',
    },
    {
      id: 'test-3',
      title: 'Practice Test 3: Cellular Respiration vs Photosynthesis',
      prompt: 'Why do plants need both photosynthesis and cellular respiration?',
    },
  ];

  const currentTest = TESTS[activeTestIndex];

  const triggerFeedback = (status: VoiceFeedbackStatus, message: string) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setVoiceFeedback(status);
    setFeedbackMessage(message);
    feedbackTimerRef.current = setTimeout(() => {
      setVoiceFeedback('normal');
      setFeedbackMessage(null);
    }, 2800);
  };

  const scrollToTop = () => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTo({ top: transcriptScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  /* Auto-scroll only when user is near bottom so user can freely scroll front and back */
  useEffect(() => {
    if (transcriptScrollRef.current) {
      const el = transcriptScrollRef.current;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (isNearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [doneLines, typingLine]);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* ── Question playback (Let question be told first) ────────── */
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!isMicActive) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setDoneLines([]);
      setTypingLine('');
      setIsQuestionDone(false);
      setIsHoldingOrb(false);
      isHoldingOrbRef.current = false;
      setIsClickedListening(false);
      setIsAiEvaluating(false);
      setAiVoiceReply(null);
      setUserLastSpoken(null);
      resetSpeechTranscript();
      return;
    }

    setIsQuestionDone(false);
    setIsHoldingOrb(false);
    isHoldingOrbRef.current = false;
    setIsClickedListening(false);
    setIsAiEvaluating(false);
    setAiVoiceReply(null);
    setUserLastSpoken(null);
    resetSpeechTranscript();

    // Spoken Audio for the question (EXO tells the question aloud)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const questionText =
        'Can you explain how photosynthesis works? What happens inside the leaf, and why does it need sunlight?';
      const questionUtterance = new SpeechSynthesisUtterance(questionText);
      questionUtterance.rate = 1.0;
      questionUtterance.pitch = 1.12;

      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Jenny'))
      );
      if (friendlyVoice) questionUtterance.voice = friendlyVoice;

      questionUtterance.onend = () => {
        setIsQuestionDone(true);
      };

      try {
        window.speechSynthesis.speak(questionUtterance);
      } catch {}
    }

    // Question typography lines streaming
    let pIdx = 0, cIdx = 0;
    const done: string[] = [];

    const tick = () => {
      if (pIdx >= DEMO_PHRASES.length) {
        setTimeout(() => setIsQuestionDone(true), 500);
        return;
      }
      const phrase = DEMO_PHRASES[pIdx];
      if (cIdx <= phrase.length) {
        setTypingLine(phrase.slice(0, cIdx));
        cIdx++;
        timerRef.current = setTimeout(tick, cIdx === 1 ? 260 : 40);
      } else {
        done.push(phrase);
        setDoneLines([...done]);
        setTypingLine('');
        pIdx++; cIdx = 0;
        if (pIdx >= DEMO_PHRASES.length) {
          setTimeout(() => setIsQuestionDone(true), 500);
          return;
        }
        timerRef.current = setTimeout(tick, 340);
      }
    };
    timerRef.current = setTimeout(tick, 350);

    return () => {
      clearTimeout(timerRef.current);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isMicActive]);

  /* ── Messages ──────────────────────────────────────────────── */
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1', sender: 'user', timestamp: '10:24 AM', isTranscribing: true,
      text: 'Can you explain how photosynthesis works in simple words?',
    },
    {
      id: 'msg-2', sender: 'exo', timestamp: '10:24 AM',
      text: `Sure! Photosynthesis is the process by which plants make their own food using sunlight, water and carbon dioxide.\n\nIn simple words, plants take in carbon dioxide from the air and water from the soil, use sunlight to convert them into food (glucose), and release oxygen as a byproduct.`,
      hasDiagram: true,
    },
    {
      id: 'msg-3', sender: 'exo', timestamp: '10:25 AM',
      text: 'Would you like me to also give some real-life examples or a quick quiz to check your understanding?',
      chips: ['Yes, give real examples', 'Give a quiz', 'Explain step by step'],
    },
  ]);

  const scrollDown = useCallback(() => {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 80);
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`, sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    }]);
    setInputMessage('');
    setIsMicActive(false);
    scrollDown();

    setTimeout(() => {
      let reply = '';
      let nextChips: string[] = [];
      if (text.toLowerCase().includes('example')) {
        reply = 'A real-life example: houseplants thrive near a sunny window. If left in the dark, leaves turn yellow because glucose production halts!';
        nextChips = ['Desert plants?', 'Chemical formula', 'Next topic'];
      } else if (text.toLowerCase().includes('quiz')) {
        reply = 'Quick Quiz! 🌿\n\nQ: What gas do plants absorb during photosynthesis?\n\nA) Nitrogen  B) CO₂ ✓  C) Oxygen';
        nextChips = ['Next question', 'Show formula', 'Next topic'];
      } else {
        reply = 'Step by step: ① Chlorophyll absorbs solar energy ② Water splits, releasing O₂ ③ ATP drives the Calvin cycle to build glucose molecules!';
        nextChips = ['Tell me about chlorophyll', 'Take a test', 'Summarize'];
      }
      setMessages(prev => [...prev, {
        id: `exo-${Date.now()}`, sender: 'exo',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: reply, chips: nextChips,
      }]);
      scrollDown();
    }, 900);
  };



  /* ── Spoken Explanation Submission & Evaluation ──────────────── */
  const handleSendSpokenExplanation = useCallback((overrideText?: string) => {
    const spoken = (overrideText || fullTranscript || [...userSpokenLines, interimTranscript].filter(Boolean).join(' ')).trim();
    if (!spoken) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setUserLastSpoken(spoken);
    setIsAiEvaluating(true);
    triggerFeedback('correct', 'AI analyzing your explanation...');

    // Add user transcript to messages
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: spoken,
    }]);
    scrollDown();
    resetSpeechTranscript();

    setTimeout(() => {
      let reply = '';
      const lower = spoken.toLowerCase();
      if (
        lower.includes('chlorophyll') ||
        lower.includes('light') ||
        lower.includes('sun') ||
        lower.includes('glucose') ||
        lower.includes('water') ||
        lower.includes('plant') ||
        lower.includes('oxygen')
      ) {
        reply =
          'Excellent explanation! You accurately explained how chlorophyll traps light energy to convert carbon dioxide and water into glucose while releasing oxygen.';
      } else {
        reply = `I heard: "${spoken}". Plants use sunlight, water, and CO₂ to create glucose and oxygen. Great start!`;
      }

      setAiVoiceReply(reply);
      setIsAiEvaluating(false);
      triggerFeedback('correct', 'Spot on!');

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(reply);
        utt.rate = 1.0;
        utt.pitch = 1.1;
        const voices = window.speechSynthesis.getVoices();
        const friendly = voices.find(
          v =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny'))
        );
        if (friendly) utt.voice = friendly;
        window.speechSynthesis.speak(utt);
      }

      setMessages(prev => [...prev, {
        id: `exo-${Date.now()}`,
        sender: 'exo',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: reply,
        chips: ['Tell me about chlorophyll', 'Take next quiz', 'Summarize key points'],
      }]);
      scrollDown();
    }, 950);
  }, [fullTranscript, userSpokenLines, interimTranscript, resetSpeechTranscript, scrollDown]);

  /* ── Toggle Click to Listen ──────────────────────────────────── */
  const handleToggleClickListen = useCallback(() => {
    if (isClickedListening) {
      setIsClickedListening(false);
      handleSendSpokenExplanation();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsQuestionDone(true);
      setIsAiEvaluating(false);
      setAiVoiceReply(null);
      setIsClickedListening(true);
    }
  }, [isClickedListening, handleSendSpokenExplanation]);

  /* ── Orb Press & Release Handlers (Supports Quick Tap & Hold-to-Talk) ── */
  const handleOrbPress = useCallback((e?: React.PointerEvent) => {
    // Only accept primary button (left click / touch)
    if (e && e.button !== undefined && e.button !== 0) return;

    if (!isQuestionDone) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsQuestionDone(true);
    }

    pointerDownTimeRef.current = performance.now();

    if (e && 'setPointerCapture' in e.currentTarget) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
    setIsAiEvaluating(false);
    setAiVoiceReply(null);
    isHoldingOrbRef.current = true;
    setIsHoldingOrb(true);
  }, [isQuestionDone]);

  const handleOrbRelease = useCallback((e?: React.PointerEvent) => {
    if (e && 'releasePointerCapture' in e.currentTarget) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }

    // If persistent listening is currently ON, any tap immediately stops and submits
    if (isClickedListening) {
      setIsClickedListening(false);
      isHoldingOrbRef.current = false;
      setIsHoldingOrb(false);
      handleSendSpokenExplanation();
      return;
    }

    const pressDuration = performance.now() - pointerDownTimeRef.current;
    
    // Quick tap (< 250ms) toggles persistent listening mode
    if (pressDuration < 250) {
      isHoldingOrbRef.current = false;
      setIsHoldingOrb(false);
      handleToggleClickListen();
      return;
    }

    if (!isHoldingOrbRef.current) return;
    isHoldingOrbRef.current = false;
    setIsHoldingOrb(false);

    handleSendSpokenExplanation();
  }, [isClickedListening, handleSendSpokenExplanation, handleToggleClickListen]);

  const handleOrbLeave = useCallback((e?: React.PointerEvent) => {
    // If pointer left while holding (e.g. dragged outside without pointer capture),
    // stop holding without accidentally toggling persistent click listening
    if (isHoldingOrbRef.current) {
      isHoldingOrbRef.current = false;
      setIsHoldingOrb(false);
      handleSendSpokenExplanation();
    }
  }, [handleSendSpokenExplanation]);

  /* Keyboard Push-to-Talk (Spacebar) */
  const isSpacePressedRef = useRef(false);

  useEffect(() => {
    if (!isMicActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        // Prevent key-repeat from firing continuously and resetting the timer!
        if (e.repeat || isSpacePressedRef.current) return;
        isSpacePressedRef.current = true;
        handleOrbPress();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isSpacePressedRef.current) {
          isSpacePressedRef.current = false;
          handleOrbRelease();
        }
      }
    };

    const handleBlur = () => {
      if (isSpacePressedRef.current) {
        isSpacePressedRef.current = false;
        handleOrbRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isMicActive, handleOrbPress, handleOrbRelease]);

  const handleCopyText = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(() => {}); setIsFullscreen(true); }
    else { document.exitFullscreen().catch(() => {}); setIsFullscreen(false); }
  };

  /* ─────────────────────────────────────────────────────────────
     All visible lines for the lyrics display
  ───────────────────────────────────────────────────────────── */
  const allLines = typingLine ? [...doneLines, typingLine] : doneLines;
  const currentIdx = allLines.length - 1;

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        className="bg-gradient-to-br from-[#FAF9FF] via-[#F4F1FD] to-[#EAE5F8] text-[#1E1B2E] font-sans select-none"
      >
        {/* Ambient glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-bl from-pink-200/25 via-purple-200/12 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-72 rounded-full bg-gradient-to-tr from-cyan-200/20 via-purple-200/12 to-transparent blur-3xl pointer-events-none" />

        {/* ─── HEADER ──────────────────────────────────────────── */}
        <header
          style={{ flexShrink: 0, height: 56 }}
          className="w-full px-5 sm:px-8 flex items-center justify-between z-30 border-b border-purple-100/50 bg-white/60 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-purple-100 flex items-center justify-center text-gray-600 hover:text-[#7C5CFF] shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div onClick={onBackToDashboard} className="flex items-center gap-2 cursor-pointer group">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{
                background: 'radial-gradient(circle at 35% 28%, #FFD6F3 0%, #E879F9 20%, #A855F7 50%, #6366F1 78%, #312E81 100%)',
                boxShadow: '0 0 10px rgba(168,85,247,.4)',
              }}>
                <div className="absolute" style={{ transform: 'translateY(-1px)' }}>
                  <div style={{ width: 7, height: 7, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'white', opacity: 0.9 }} />
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'white', opacity: 0.9 }} />
                  </div>
                </div>
              </div>
              <span className="text-base font-extrabold tracking-wide text-[#1E1B2E]">NILO</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="hidden lg:flex w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-purple-100 items-center justify-center text-gray-500 hover:text-[#7C5CFF] shadow-sm transition-all"
              title={sidebarOpen ? 'Collapse concept panel' : 'Expand concept panel'}
            >
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
            </button>
            <button onClick={toggleFullscreen} className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-purple-100 flex items-center justify-center text-gray-500 hover:text-[#7C5CFF] shadow-sm transition-all">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-purple-100 flex items-center justify-center text-gray-500 hover:text-[#7C5CFF] shadow-sm transition-all">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-white cursor-pointer">
              {userName ? userName.charAt(0).toUpperCase() : 'J'}
            </div>
          </div>
        </header>

        {/* ─── BODY ────────────────────────────────────────────── */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }} className="w-full">

          {/* ── CENTER COLUMN ──────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }} className="px-3 sm:px-5">

            {/* Messages scroll wrapper with mask fade */}
            <div style={{
              flex: 1, minHeight: 0, width: '100%', maxWidth: 720, position: 'relative',
              maskImage: 'linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.4) 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.4) 80%, transparent 100%)',
            }}>
              <div
                ref={scrollRef}
                style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                className="pt-4 pb-32 space-y-3 chat-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {messages.map((msg) => {
                  if (msg.sender === 'user') {
                    return (
                      <div key={msg.id} className="flex flex-col items-start w-full">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7280] mb-1 pl-0.5">
                          <div className="flex items-center gap-0.5 text-purple-600">
                            <span className="inline-block w-[3px] h-2.5 bg-purple-500 rounded-full animate-pulse" />
                            <span className="inline-block w-[3px] h-3.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '.12s' }} />
                            <span className="inline-block w-[3px] h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '.24s' }} />
                          </div>
                          <span className="text-[#1E1B2E] font-bold">You</span>
                          {msg.isTranscribing && <span className="text-gray-400">(transcribing...)</span>}
                          <span className="text-gray-400 ml-1">{msg.timestamp}</span>
                        </div>
                        <div className="w-full p-3 px-4 rounded-2xl bg-white/95 border border-white shadow-sm text-sm font-medium text-[#1E1B2E] leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="flex items-start gap-2.5 w-full">
                      {/* ── EXO Avatar — orb lives here ── */}
                      <div
                        className="shrink-0 mt-0.5"
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'radial-gradient(circle at 35% 28%, #FFD6F3 0%, #E879F9 20%, #A855F7 50%, #6366F1 78%, #312E81 100%)',
                          boxShadow: '0 0 8px rgba(168,85,247,.45)',
                          position: 'relative', overflow: 'hidden', flexShrink: 0,
                        }}
                      >
                        {/* glare */}
                        <div style={{ position: 'absolute', top: '12%', left: '18%', width: '36%', height: '20%', borderRadius: '50%', background: 'rgba(255,255,255,.5)', filter: 'blur(1.5px)', transform: 'rotate(-20deg)' }} />
                        {/* eyes */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3.5 }}>
                          <div style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'white', opacity: 0.92 }} />
                          <div style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'white', opacity: 0.92 }} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E1B2E] mb-1">
                          <span>EXO</span>
                          <span className="text-gray-400 font-normal">{msg.timestamp}</span>
                        </div>

                        <div className="w-full p-3.5 rounded-2xl bg-white/95 border border-white shadow-sm text-[13px] text-[#334155] leading-relaxed space-y-3">
                          {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                          {msg.hasDiagram && (
                            <div className="rounded-xl bg-gradient-to-b from-[#FAF8FF] to-white p-3 border border-purple-100 shadow-sm">
                              <h4 className="text-[13px] font-extrabold text-[#1E1B2E] mb-2">Photosynthesis</h4>
                              <div className="w-full rounded-lg bg-white/95 p-2.5 border border-purple-50 flex flex-col sm:flex-row items-center justify-around gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-400/20 animate-pulse">
                                    <Sun className="w-6 h-6 fill-white/90" />
                                    <div className="absolute inset-0 rounded-full border border-dashed border-amber-300 animate-spin" style={{ animationDuration: '14s' }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-amber-600 mt-1">Sunlight</span>
                                  <span className="text-[9px] text-gray-500">(energy)</span>
                                  <span className="text-amber-500 font-black text-xs">➔</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className="w-11 h-13 flex items-center justify-center">
                                    <svg viewBox="0 0 100 120" className="w-11 h-14 drop-shadow-[0_2px_4px_rgba(34,197,94,0.25)]">
                                      <path d="M50 110 V 45" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
                                      <path d="M50 70 C 35 60, 20 65, 25 45 C 35 45, 48 55, 50 70 Z" fill="#22C55E" />
                                      <path d="M50 55 C 65 45, 80 50, 75 30 C 65 30, 52 40, 50 55 Z" fill="#4ADE80" />
                                      <path d="M50 45 C 40 30, 45 15, 50 10 C 55 15, 60 30, 50 45 Z" fill="#16A34A" />
                                      <ellipse cx="50" cy="112" rx="36" ry="7" fill="#78350F" opacity="0.5" />
                                    </svg>
                                  </div>
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-bold mt-1">
                                    <Droplets className="w-2.5 h-2.5" /><span>Water (H₂O)</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5 text-[11px]">
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">
                                    <Cloud className="w-3 h-3 text-gray-400" /><span className="font-semibold">Carbon Dioxide (CO₂) ➔</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="font-bold">Glucose (food)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500" /><span className="font-bold">Oxygen (O₂)</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-purple-100/60 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                                <div className="flex items-center gap-1 text-gray-400">
                                  <button className="p-1 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                                  <button className="p-1 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleCopyText(msg.id, msg.text)} className="p-1 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors">
                                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {['Explain in more detail', 'Show real example', 'Generate quiz'].map(a => (
                                    <button key={a} onClick={() => handleSendMessage(a)} className="px-2.5 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold transition-colors text-[10.5px]">
                                      {a} →
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {msg.chips && (
                            <div className="flex flex-wrap gap-1.5">
                              {msg.chips.map((chip, idx) => (
                                <button key={idx} onClick={() => handleSendMessage(chip)}
                                  className="px-3 py-1 rounded-full bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold shadow-sm hover:shadow transition-all">
                                  {chip}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── SIMPLE INPUT DOCK ──────────────────────────────── */}
            <div style={{ flexShrink: 0 }} className="w-full max-w-[720px] pb-3 pt-1">
              <div className="w-full rounded-full bg-white/95 backdrop-blur-2xl p-1.5 px-3 border border-white shadow-[0_4px_20px_rgba(124,92,255,0.10)] flex items-center gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex-1 flex items-center gap-2 pl-1">
                  <Keyboard className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type or tap mic to speak..."
                    className="w-full bg-transparent text-xs sm:text-sm text-[#1E1B2E] placeholder:text-gray-400 outline-none"
                  />
                </form>

                {/* Send */}
                {inputMessage.trim() && (
                  <button
                    onClick={() => handleSendMessage()}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Mic */}
                <button
                  id="open-voice-mode-btn"
                  onClick={() => setIsMicActive(true)}
                  className="relative w-9 h-9 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#6366F1] via-[#A855F7] to-[#EC4899] shadow-md hover:scale-105 active:scale-95 transition-transform shrink-0 cursor-pointer"
                  title="Open Voice Mode with Speech API & Push to Talk"
                  aria-label="Open Voice Mode"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-0.5 shrink-0">
                  {[Video, Upload, MoreHorizontal].map((Icon, i) => (
                    <button key={i} className="w-7 h-7 rounded-full bg-gray-50 hover:bg-purple-50 text-gray-500 hover:text-[#7C5CFF] flex items-center justify-center transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR (APPLE WIDGETS SUITE FOR CONCEPT STATUS) ── */}
          <div
            style={{ flexShrink: 0, width: sidebarOpen ? 320 : 0, transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden' }}
            className="hidden lg:block h-full"
          >
            <div
              style={{ width: 320, height: '100%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="p-3.5 bg-[#F8F9FD]/95 backdrop-blur-2xl border-l border-slate-200/80 space-y-3 chat-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* Apple Shelf Header: Label + Title + Collapse Button */}
              <div className="flex items-center justify-between px-1 pt-0.5 pb-0.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block leading-tight">
                    Live Concept Analysis
                  </span>
                  <h3 className="text-sm font-extrabold text-[#1E1B2E] tracking-tight flex items-center gap-1.5 mt-0.5">
                    <span>{initialTopic || 'Concept Status'}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-7 h-7 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                  title="Collapse Panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* WIDGET 1: APPLE MASTERY SPIDER / RADAR GRAPH */}
              <div className="bg-white rounded-[22px] p-3.5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.07)] transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                      <Target className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Mastery Radar</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>81% Advanced</span>
                  </div>
                </div>

                {/* Score Headline */}
                <div className="flex items-baseline justify-between pt-0.5 px-0.5">
                  <div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">81%</span>
                    <span className="text-[11px] text-slate-400 font-medium ml-2">Spider Assessment · 5 Axes</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md">
                    <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                    <span>+15%</span>
                  </div>
                </div>

                {/* SVG 5-Axis Spider / Radar Graph */}
                <div className="relative w-full flex items-center justify-center pt-1 pb-1">
                  <svg viewBox="0 0 260 190" className="w-full h-auto max-w-[280px] overflow-visible drop-shadow-xs select-none">
                    <defs>
                      <radialGradient id="spiderFill" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
                        <stop offset="65%" stopColor="#7C5CFF" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.14" />
                      </radialGradient>
                    </defs>

                    {/* Concentric Spider Web Grid Polygons */}
                    {/* Outer Web (100%) */}
                    <polygon
                      points="130,41 190.9,85.2 167.6,156.8 92.4,156.8 69.1,85.2"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    {/* Mid Web (66%) */}
                    <polygon
                      points="130,62.8 170.2,92.0 154.8,139.2 105.2,139.2 89.8,92.0"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="1.2"
                    />
                    {/* Inner Web (33%) */}
                    <polygon
                      points="130,83.9 150.1,98.5 142.4,122.1 117.6,122.1 109.9,98.5"
                      fill="none"
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />

                    {/* 5 Radial Spider Spoke Axis Lines */}
                    <line x1="130" y1="105" x2="130" y2="41" stroke="#E2E8F0" strokeWidth="1.2" />
                    <line x1="130" y1="105" x2="190.9" y2="85.2" stroke="#E2E8F0" strokeWidth="1.2" />
                    <line x1="130" y1="105" x2="167.6" y2="156.8" stroke="#E2E8F0" strokeWidth="1.2" />
                    <line x1="130" y1="105" x2="92.4" y2="156.8" stroke="#E2E8F0" strokeWidth="1.2" />
                    <line x1="130" y1="105" x2="69.1" y2="85.2" stroke="#E2E8F0" strokeWidth="1.2" />

                    {/* Spider Data Area Polygon */}
                    <polygon
                      points="130,46.1 183.6,87.6 160.1,146.4 103.7,141.2 83.7,90.0"
                      fill="url(#spiderFill)"
                      stroke="#7C5CFF"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />

                    {/* Glowing Vertex Dots */}
                    <circle cx="130" cy="46.1" r="3.5" fill="#7C5CFF" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="183.6" cy="87.6" r="3.5" fill="#7C5CFF" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="160.1" cy="146.4" r="3.5" fill="#7C5CFF" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="103.7" cy="141.2" r="3.5" fill="#7C5CFF" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="83.7" cy="90.0" r="3.5" fill="#7C5CFF" stroke="#FFFFFF" strokeWidth="1.8" />

                    {/* Spider Axis Labels */}
                    <text x="130" y="24" textAnchor="middle" className="text-[10px] font-black fill-slate-800">
                      Recall 92%
                    </text>
                    <text x="198" y="86" textAnchor="start" className="text-[10px] font-bold fill-slate-700">
                      Clarity 88%
                    </text>
                    <text x="175" y="172" textAnchor="start" className="text-[10px] font-bold fill-slate-700">
                      Logic 80%
                    </text>
                    <text x="85" y="172" textAnchor="end" className="text-[10px] font-bold fill-slate-700">
                      Scope 70%
                    </text>
                    <text x="62" y="86" textAnchor="end" className="text-[10px] font-bold fill-slate-700">
                      Depth 76%
                    </text>
                  </svg>
                </div>

                {/* Apple Style Dimension Badges */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-100/60">
                    Recall 92%
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold border border-sky-100/60">
                    Clarity 88%
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100/60">
                    Logic 80%
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/60">
                    Depth 76%
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-100/60">
                    Scope 70%
                  </span>
                </div>
              </div>

              {/* WIDGET 2: CURRICULUM FLOW (STEP-BY-STEP QUEUE) */}
              <div className="bg-white rounded-[22px] p-3.5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.07)] transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Curriculum Flow</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-full">
                    Stage 2/5
                  </span>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  {[
                    { n: 1, title: 'Introduction & Equation', desc: 'What is photosynthesis?', status: 'done' },
                    { n: 2, title: 'Inputs & Absorption', desc: 'Sunlight, water and CO₂', status: 'active' },
                    { n: 3, title: 'Chloroplast Conversion', desc: 'Light-dependent reaction', status: 'pending' },
                    { n: 4, title: 'Outputs & Glucose', desc: 'Energy storage and respiration', status: 'pending' },
                    { n: 5, title: 'Biological Significance', desc: 'Global food chain foundation', status: 'pending' },
                  ].map(item => (
                    <div
                      key={item.n}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        item.status === 'active'
                          ? 'bg-purple-50/80 border border-purple-200/70 shadow-xs'
                          : item.status === 'done'
                          ? 'bg-slate-50/70 border border-slate-100'
                          : 'hover:bg-slate-50/60 border border-transparent'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.status === 'done' ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : item.status === 'active' ? (
                          <div className="w-4 h-4 rounded-full border-2 border-purple-600 flex items-center justify-center bg-white shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-[11px] font-bold truncate ${item.status === 'active' ? 'text-purple-700' : 'text-[#1E1B2E]'}`}>
                            {item.n}. {item.title}
                          </p>
                          {item.status === 'active' && (
                            <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider shrink-0 ml-1">Live</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WIDGET 3: KEY TAKEAWAYS & VERIFIED CONCEPTS */}
              <div className="bg-white rounded-[22px] p-3.5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.07)] transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Key Takeaways</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100/80 px-2 py-0.5 rounded-full">
                    4 Verified
                  </span>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  {[
                    { text: 'Uses sunlight, water & CO₂', color: 'from-amber-400 to-amber-500' },
                    { text: 'Produces glucose food molecule', color: 'from-blue-400 to-indigo-500' },
                    { text: 'Releases essential O₂ gas', color: 'from-emerald-400 to-teal-500' },
                    { text: 'Takes place in chloroplasts', color: 'from-purple-400 to-purple-600' },
                  ].map(point => (
                    <div key={point.text} className="flex items-center gap-2 p-1.5 px-2 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${point.color} shrink-0`} />
                      <span className="text-[11px] font-medium text-slate-700 flex-1 truncate">{point.text}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* WIDGET 4: STUDY DECK & MEDIA ATTACHMENTS */}
              <div className="bg-white rounded-[22px] p-3.5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.07)] transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Study Deck</span>
                  </div>
                  <span className="text-[10px] font-semibold text-purple-600 hover:text-purple-700 cursor-pointer">
                    View All →
                  </span>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  {[
                    { icon: FileText, title: 'Photosynthesis Notes', meta: 'PDF • 2 pages', bg: 'bg-purple-50 text-purple-600 border-purple-100' },
                    { icon: Play, title: '3D Leaf Reaction Tour', meta: 'Video • 1:45 min', bg: 'bg-pink-50 text-pink-600 border-pink-100' },
                  ].map(res => {
                    const Icon = res.icon;
                    return (
                      <div
                        key={res.title}
                        className="p-2 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-purple-200/60 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2.5 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-lg ${res.bg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate">{res.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{res.meta}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar reopen button */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-14 rounded-2xl bg-white/95 border border-slate-200/80 shadow-md flex-col items-center justify-center gap-1 text-slate-600 hover:text-purple-600 hover:bg-white transition-all z-20 active:scale-95"
              title="Open Concept Status"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════
            VOICE / LYRICS OVERLAY — shown when mic is active
        ════════════════════════════════════════════════════════ */}
        {/* ════════════════════════════════════════════════════════
            VOICE / 3D SPHERICAL ACOUSTIC FIELD OVERLAY
        ════════════════════════════════════════════════════════ */}
        {isMicActive && (
          <div
            className="voice-overlay-in"
            style={{
              position: 'absolute', inset: 0, zIndex: 50,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backgroundImage: `url(${orbVoiceBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              backgroundRepeat: 'no-repeat',
              overflowY: 'auto',
              padding: '20px 16px',
            }}
          >

            {/* Close button top right */}
            <button
              onClick={() => setIsMicActive(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-purple-100 flex items-center justify-center text-gray-500 hover:text-purple-600 shadow-sm transition-all z-30"
              title="Close Voice Mode"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ════════════════════════════════════════════════════════
                ALL-CORNER DREAMY BOKEH EFFECT OVERLAY (FOCUS ON ORB)
            ════════════════════════════════════════════════════════ */}
            {/* 1. Depth-of-Field Radial Focus Mask (softens periphery, leaves orb luminous & crystal clear) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 40%, transparent 26%, rgba(26, 16, 60, 0.1) 55%, rgba(18, 10, 42, 0.32) 100%)',
                zIndex: 2,
              }}
            />

            {/* 2. Top-Left Corner Bokeh Clusters (Lilac, Periwinkle, Celestial Cyan) */}
            <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none overflow-hidden z-[3]">
              <div
                className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-gradient-to-br from-[#C084FC]/45 via-[#818CF8]/30 to-transparent blur-3xl animate-float"
                style={{ animationDuration: '6.5s' }}
              />
              <div
                className="absolute top-10 left-16 w-36 h-36 rounded-full bg-gradient-to-tr from-[#38BDF8]/40 to-[#A855F7]/35 blur-2xl animate-float"
                style={{ animationDuration: '7.8s', animationDelay: '1.2s' }}
              />
              <div
                className="absolute top-24 left-6 w-18 h-18 rounded-full bg-white/55 blur-lg animate-float"
                style={{ animationDuration: '5.2s', animationDelay: '2.1s' }}
              />
              <div
                className="absolute top-6 left-44 w-12 h-12 rounded-full bg-[#E879F9]/55 blur-md animate-pulse"
                style={{ animationDuration: '3.4s' }}
              />
            </div>

            {/* 3. Top-Right Corner Bokeh Clusters (Golden Dawn, Sunset Coral, Peach) */}
            <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none overflow-hidden z-[3]">
              <div
                className="absolute -top-14 -right-14 w-72 h-72 rounded-full bg-gradient-to-bl from-[#FDBA74]/50 via-[#F472B6]/35 to-transparent blur-3xl animate-float"
                style={{ animationDuration: '7s', animationDelay: '0.8s' }}
              />
              <div
                className="absolute top-12 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-[#FB7185]/40 to-[#FBBF24]/30 blur-2xl animate-float"
                style={{ animationDuration: '8.2s', animationDelay: '2s' }}
              />
              <div
                className="absolute top-26 right-8 w-20 h-20 rounded-full bg-[#FFF1F2]/65 blur-lg animate-float"
                style={{ animationDuration: '5.6s', animationDelay: '1.4s' }}
              />
              <div
                className="absolute top-34 right-48 w-12 h-12 rounded-full bg-[#F472B6]/60 blur-md animate-pulse"
                style={{ animationDuration: '3.8s' }}
              />
            </div>

            {/* 4. Bottom-Left Corner Bokeh Clusters (Deep Twilight Violet & Velvet Indigo) */}
            <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none overflow-hidden z-[3]">
              <div
                className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-gradient-to-tr from-[#9333EA]/45 via-[#6366F1]/35 to-transparent blur-3xl animate-float"
                style={{ animationDuration: '7.5s', animationDelay: '1.6s' }}
              />
              <div
                className="absolute bottom-14 left-20 w-40 h-40 rounded-full bg-gradient-to-tl from-[#C084FC]/40 to-[#38BDF8]/25 blur-2xl animate-float"
                style={{ animationDuration: '8.8s', animationDelay: '0.5s' }}
              />
              <div
                className="absolute bottom-30 left-8 w-16 h-16 rounded-full bg-white/45 blur-lg animate-float"
                style={{ animationDuration: '5s', animationDelay: '2.5s' }}
              />
            </div>

            {/* 5. Bottom-Right Corner Bokeh Clusters (Warm Amber, Peach Glow, Sunset Rose) */}
            <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none overflow-hidden z-[3]">
              <div
                className="absolute -bottom-16 -right-16 w-76 h-76 rounded-full bg-gradient-to-tl from-[#F472B6]/45 via-[#FB923C]/35 to-transparent blur-3xl animate-float"
                style={{ animationDuration: '7.2s', animationDelay: '2.2s' }}
              />
              <div
                className="absolute bottom-14 right-20 w-40 h-40 rounded-full bg-gradient-to-tr from-[#E879F9]/40 to-[#FDBA74]/30 blur-2xl animate-float"
                style={{ animationDuration: '8.4s', animationDelay: '1.2s' }}
              />
              <div
                className="absolute bottom-30 right-12 w-18 h-18 rounded-full bg-white/50 blur-lg animate-float"
                style={{ animationDuration: '5.4s', animationDelay: '0.9s' }}
              />
            </div>

            {/* Content card — clean unboxed before UI */}
            <div
              className="orb-fly-in"
              style={{
                position: 'relative', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                width: '100%', maxWidth: 680, padding: '0 24px',
                gap: 0,
              }}
            >
              {/* ── STAGE: EXO Orb ONLY (WaveformCircles completely removed) ── */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: 24,
                  minHeight: 190,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                {/* Interactive Orb Container with pointer capture for hold-to-talk */}
                <div
                  style={{
                    position: 'relative',
                    cursor: isQuestionDone ? (isHoldingOrb ? 'grabbing' : 'grab') : 'default',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'none',
                    transform: isOrbHovered && !isVoiceActive ? 'scale(1.03)' : 'scale(1)',
                    transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'transform',
                  }}
                  onMouseEnter={() => setIsOrbHovered(true)}
                  onMouseLeave={() => setIsOrbHovered(false)}
                  title={isQuestionDone ? 'Hold orb or Spacebar to speak' : 'EXO is speaking the question...'}
                >
                  <ExoOrb
                    size="md"
                    showPedestal={false}
                    isListening={Boolean(isVoiceActive || isListeningNow)}
                    listeningVolume={effectiveVoiceLevel}
                    showSpeechBubble={false}
                    subLabel=""
                    interactive={!(isVoiceActive || isListeningNow)}
                    onPointerDown={handleOrbPress}
                    onPointerUp={handleOrbRelease}
                    onPointerLeave={handleOrbLeave}
                    onPointerCancel={handleOrbRelease}
                    className="!my-0"
                  />
                </div>
              </div>

              {/* ── Question & Live Transcript Area ── */}
              {!isQuestionDone ? (
                /* ── Question Lyrics Streaming: Main Line & 1 Line Before Fading Away ── */
                (() => {
                  const allLines = [...doneLines, ...(typingLine ? [typingLine] : [])];
                  const prevLine = allLines.length >= 2 ? allLines[allLines.length - 2] : null;
                  const currLine = allLines.length >= 1 ? allLines[allLines.length - 1] : '';

                  return (
                    <div className="flex flex-col items-center justify-center w-full max-w-2xl px-4 py-2 text-center select-none overflow-hidden animate-in fade-in duration-300" style={{ position: 'relative', zIndex: 20, marginTop: 16 }}>
                      {prevLine && (
                        <p
                          className="transition-all duration-700 ease-out"
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#7C5CFF',
                            opacity: 0.35,
                            transform: 'translateY(-2px) scale(0.96)',
                            filter: 'blur(1px)',
                            lineHeight: 1.35,
                            margin: '0 0 4px 0',
                          }}
                        >
                          {prevLine}
                        </p>
                      )}
                      <p
                        className="transition-all duration-200 ease-out"
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: '#1E1B2E',
                          lineHeight: 1.3,
                          letterSpacing: '-0.3px',
                          margin: 0,
                        }}
                      >
                        {currLine}
                        {typingLine && (
                          <span
                            style={{
                              display: 'inline-block',
                              width: 3,
                              height: '1em',
                              background: '#A855F7',
                              borderRadius: 2,
                              marginLeft: 4,
                              verticalAlign: 'text-bottom',
                              animation: 'blink .7s step-end infinite',
                            }}
                          />
                        )}
                      </p>
                    </div>
                  );
                })()
              ) : (
                /* ── Answer State: Push-to-Talk via Orb / Spacebar (Strictly 2 Lines Lyrics, No Scrollbar) ── */
                <div className="flex flex-col items-center justify-center w-full max-w-2xl px-4 py-2 overflow-hidden animate-in fade-in duration-200" style={{ position: 'relative', zIndex: 20, marginTop: 16 }}>
                  {isAiEvaluating ? (
                    /* AI Evaluating cleanly */
                    <div className="flex items-center gap-2 py-4 text-purple-700 text-xs font-semibold animate-pulse">
                      <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
                      <span>Evaluating explanation with AI...</span>
                    </div>
                  ) : aiVoiceReply ? (
                    /* AI Response Card after evaluation */
                    <div className="w-full max-w-md bg-purple-50/90 border border-purple-200/90 rounded-2xl p-4 text-left shadow-sm animate-in zoom-in-95 duration-200">
                      {userLastSpoken && (
                        <div className="mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">
                            You:
                          </span>
                          <p className="text-xs font-semibold text-gray-800 leading-snug">
                            "{userLastSpoken}"
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-500" />
                          EXO:
                        </span>
                        <p className="text-[13px] font-medium text-[#1E1B2E] leading-relaxed mt-0.5">
                          {aiVoiceReply}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setAiVoiceReply(null);
                            setUserLastSpoken(null);
                            resetSpeechTranscript();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700 transition-colors flex items-center gap-1"
                        >
                          <Mic className="w-3.5 h-3.5" /> Explain More
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Clean Voice UI: Audio Visualizer Dock showing user speech level neatly ── */
                    <div className="flex flex-col items-center justify-center py-2 text-center select-none animate-in fade-in duration-200" style={{ position: 'relative', zIndex: 20, marginTop: 12 }}>
                      {isListeningNow ? (
                        /* Modern Glassmorphic Audio Spectrum Visualizer Dock */
                        <div
                          className="flex items-center justify-between gap-3 sm:gap-4 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-2xl border border-white/85 shadow-[0_8px_30px_rgba(168,85,247,0.16),0_1px_3px_rgba(0,0,0,0.04)] transition-all max-w-lg w-full animate-in zoom-in-95 duration-200"
                        >
                          {/* Live Listening Status: EXACT same typography as before holding */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-tr from-purple-600 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                            </span>
                            <span className="text-xs sm:text-[13px] font-semibold text-purple-900 flex items-center gap-1.5">
                              <span className="font-bold">Listening</span>
                              <span className="text-purple-300">•</span>
                              <span className="text-purple-600/90 font-medium text-xs sm:text-[12px]">
                                {isHoldingOrb ? 'Release Spacebar to finish' : 'Click Finish when done'}
                              </span>
                              {isHoldingOrb && (
                                <>
                                  <span className="text-purple-300">•</span>
                                  <span className="text-purple-600/90 font-medium text-xs sm:text-[12px]">
                                    Release Spacebar to finish
                                  </span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Dynamic 16-Bar Voice Reacting Clean Waveform neatly merged in pill */}
                          <div className="flex items-center justify-center gap-[3px] sm:gap-[4px] h-7 flex-1 max-w-[130px] sm:max-w-[170px] mx-1 overflow-hidden">
                            {[
                              0.28, 0.44, 0.62, 0.82, 0.94, 1.0, 0.96, 0.84, 
                              0.84, 0.96, 1.0, 0.94, 0.82, 0.62, 0.44, 0.28
                            ].map((scaleFactor, idx) => {
                              const isCenter = idx >= 4 && idx <= 11;
                              const idleHeight = 3.5 + Math.sin((idx / 15) * Math.PI) * 2.5;
                              const voiceBoost = scaleFactor * (effectiveVoiceLevel * 19);
                              const barHeight = Math.max(3.5, Math.min(24, Math.round(idleHeight + voiceBoost)));
                              const barOpacity = Math.min(1, 0.55 + effectiveVoiceLevel * 0.45);

                              return (
                                <span
                                  key={idx}
                                  className={`w-[2.5px] sm:w-[3px] rounded-full transition-all duration-100 ease-out ${
                                    isCenter
                                      ? 'bg-gradient-to-t from-[#7C5CFF] via-[#A855F7] to-[#EC4899]'
                                      : 'bg-gradient-to-t from-[#6366F1] via-[#818CF8] to-[#C084FC]'
                                  }`}
                                  style={{
                                    height: `${barHeight}px`,
                                    opacity: barOpacity,
                                    animation: effectiveVoiceLevel < 0.05
                                      ? 'modernWaveIdle 1.5s ease-in-out infinite'
                                      : undefined,
                                    animationDelay: `${(idx % 4) * 0.18}s`,
                                    filter: isCenter && effectiveVoiceLevel > 0.12
                                      ? 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.45))'
                                      : undefined,
                                  }}
                                />
                              );
                            })}
                          </div>

                          {/* Compact Finish Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isClickedListening) {
                                handleToggleClickListen();
                              } else {
                                handleOrbRelease();
                              }
                            }}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-[0_2px_8px_rgba(124,92,255,0.28)] transition-all cursor-pointer"
                          >
                            <span>Finish</span>
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        /* Idle status / Click to Listen Pill matching cosmic UI */
                        <button
                          type="button"
                          onClick={handleToggleClickListen}
                          className="flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full bg-white/75 hover:bg-white/90 backdrop-blur-2xl border border-white/80 shadow-[0_6px_24px_rgba(168,85,247,0.12)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.22)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                        >
                          <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-125 transition-transform animate-ping" />
                          <span className="text-xs sm:text-[13px] font-semibold text-purple-900 flex items-center gap-1.5">
                            <span className="font-bold">Hold orb or press Spacebar to speak</span>
                            <span className="text-purple-300">•</span>
                            <span className="text-purple-600 font-semibold underline decoration-purple-300 underline-offset-2">or Click to Listen</span>
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Status Feedback Alert Toast (only visible during correct/deviation events) ── */}
              {voiceFeedback !== 'normal' && (
                <div style={{ height: 26, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {voiceFeedback === 'correct' && (
                    <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold shadow-xs animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feedbackMessage || 'Spot on!'}</span>
                    </div>
                  )}
                  {voiceFeedback === 'wrong' && (
                    <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 border border-red-300 text-red-700 text-xs font-bold shadow-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{feedbackMessage || 'Deviation detected'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Global styles ────────────────────────────────────── */}
      <style>{`
        .chat-scroll {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .chat-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }

        .lyrics-scroll {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .lyrics-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }

        /* Overlay fade-in */
        .voice-overlay-in { animation: overlayIn 0.3s cubic-bezier(.4,0,.2,1) forwards; }
        @keyframes overlayIn { from { opacity: 0 } to { opacity: 1 } }

        /* Orb flies up from bottom-left (avatar position) */
        .orb-fly-in { animation: orbFlyIn 0.5s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes orbFlyIn {
          from { opacity: 0; transform: translate(-160px, 180px) scale(0.22); }
          to   { opacity: 1; transform: translate(0, 0) scale(1); }
        }

        @keyframes orbHalo { from { opacity: 0.6; transform: scale(1); } to { opacity: 1; transform: scale(1.12); } }
        @keyframes orbRing { 0%,100%{ opacity:.4; transform:scale(1); } 50%{ opacity:.8; transform:scale(1.07); } }
        @keyframes waveBar { from { transform: scaleY(0.4); opacity: 0.6; } to { transform: scaleY(1); opacity: 1; } }
        @keyframes blink { 0%,100%{ opacity:1 } 50%{ opacity:0 } }
      `}</style>
    </>
  );
};
