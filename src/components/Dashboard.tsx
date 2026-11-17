import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  BookOpen,
  Compass,
  BarChart3,
  FileText,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sparkles,
  Flame,
  Zap,
  ShieldCheck,
  Star,
  Mic,
  Video,
  Upload,
  ArrowRight,
  Play,
  PanelRightClose,
  PanelRightOpen,
  PanelLeft,
  PanelLeftClose,
  LogOut,
  Pin,
  CheckCircle2,
  Target,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { ExoOrb } from './ExoOrb';
import { ExoTransitionOverlay } from './ExoTransitionOverlay';
import { ChatSession } from './ChatSession';
import { LearnPage } from './LearnPage';
import { HeroSlider } from './HeroSlider';
import { ArcadeCabinet3D } from './ArcadeCabinet3D';
import { ArcadePage } from './ArcadePage';
import { HomePage } from '../Home';
import bgImage from '../assets/bg.png';

interface DashboardProps {
  onLogout: () => void;
  userName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onLogout,
  userName = "Abhinav"
}) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isNavbarClosed, setIsNavbarClosed] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ text: string; top: number } | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Home');
  const [arcadeViewMode, setArcadeViewMode] = useState<'3d_cabinet' | 'arcade_page'>('3d_cabinet');
  const [activityTimeframe, setActivityTimeframe] = useState<'Week' | 'Month' | 'Year'>('Week');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [todoTasks, setTodoTasks] = useState([
    { id: 1, title: 'Light Reaction in Photosynthesis', category: 'Biology', time: '15m', completed: true },
    { id: 2, title: '5 Practice MCQs on Cell Division', category: 'Quiz', time: '10m', completed: false },
    { id: 3, title: 'Ask EXO about Osmosis doubt', category: 'Doubt', time: '5m', completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTodoTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  const [isMicActive, setIsMicActive] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [exoMessage, setExoMessage] = useState("Ask a question, explain a concept, or get help with your doubts.");
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showChatSession, setShowChatSession] = useState(false);
  const [sessionTopic, setSessionTopic] = useState('Photosynthesis');

  const handleStartSession = (topic?: string) => {
    const chosenTopic = topic || chatInput || 'Photosynthesis';
    setSessionTopic(chosenTopic);
    setShowChatSession(true);
    setIsTransitioning(true);
  };

  const bannerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const subjectsSectionRef = useRef<HTMLDivElement>(null);
  const isAutoScrollingRef = useRef(false);

  const handleScrollDown = () => {
    if (isAutoScrollingRef.current) return;
    isAutoScrollingRef.current = true;
    subjectsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 750);
  };

  useEffect(() => {
    const handleScrollEvent = (e: Event) => {
      if (showChatSession || isTransitioning) return;
      const target = e.target;
      let scrollTop = 0;
      if (target === document || target === window) {
        scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      } else if (target && 'scrollTop' in (target as HTMLElement)) {
        scrollTop = (target as HTMLElement).scrollTop;
      }

      setScrollY(scrollTop);

      // Check banner bounding rect if bannerRef is mounted
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        // If banner is scrolled up and mostly out of viewport (bottom < 150px)
        if (rect.bottom < 150) {
          setIsBannerVisible(false);
          return;
        }
      }

      setIsBannerVisible(scrollTop < 100);
    };

    // Capture phase listener catches scroll on any element (<main>, window, etc.)
    window.addEventListener('scroll', handleScrollEvent, { capture: true, passive: true });

    // Check initially
    if (bannerRef.current) {
      const rect = bannerRef.current.getBoundingClientRect();
      setIsBannerVisible(rect.bottom >= 150);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollEvent, true);
    };
  }, [showChatSession, isTransitioning]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isSidebarExpanded && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsSidebarExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSidebarExpanded]);

  // Lock body & html scroll when overlay transition or full-screen chat session is active (prevents double scrollbars)
  useEffect(() => {
    if (isTransitioning || showChatSession) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isTransitioning, showChatSession]);

  // When switching views (especially to Explore / Arcade), reset scroll position so elements don't get clipped
  useEffect(() => {
    window.scrollTo(0, 0);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeNav, arcadeViewMode]);

  const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
    // Only run on Home dashboard view
    if (activeNav !== 'Home') return;
    // When Today's summary is open, lock dashboard scrolling
    if (!rightPanelCollapsed) return;

    const mainEl = mainRef.current;
    if (!mainEl || isAutoScrollingRef.current) return;

    // When at top and user scrolls down, directly and automatically glide to subjects
    if (mainEl.scrollTop < 50 && e.deltaY > 15) {
      isAutoScrollingRef.current = true;
      subjectsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 750);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if (activeNav !== 'Home') return;

    const st = e.currentTarget.scrollTop;
    setScrollY(st);

    // Automatic smooth scroll down to subjects when user starts scrolling down
    if (st > 15 && st < 75 && !isAutoScrollingRef.current) {
      isAutoScrollingRef.current = true;
      subjectsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 750);
    }

    if (bannerRef.current) {
      const rect = bannerRef.current.getBoundingClientRect();
      if (rect.bottom < 150) {
        setIsBannerVisible(false);
        return;
      }
    }
    setIsBannerVisible(st < 100);
  };

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Learn', icon: BookOpen },
    { name: 'Explore', icon: Compass },
    { name: 'Progress', icon: BarChart3 },
    { name: 'Notes', icon: FileText },
    { name: 'Calendar', icon: Calendar },
  ];

  const handleVoiceToggle = () => {
    setIsMicActive(!isMicActive);
    if (!isMicActive) {
      setExoMessage("I'm listening! Explain the concept in your own words...");
    } else {
      setExoMessage("Analyzing your explanation against key points... Great coverage!");
      setTimeout(() => {
        setExoMessage("Ask a question, explain a concept, or get help with your doubts.");
      }, 4000);
    }
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setExoMessage(`Evaluating "${chatInput}"... Analyzing knowledge gaps!`);
    setChatInput('');
    setTimeout(() => {
      setExoMessage("Ask a question, explain a concept, or get help with your doubts.");
    }, 4000);
  };

  // Fullscreen voice/concept session
  if (showChatSession) {
    return (
      <div className="fixed inset-0 z-50">
        <ChatSession
          userName={userName}
          initialTopic={sessionTopic}
          onBackToDashboard={() => {
            setShowChatSession(false);
            setIsTransitioning(false);
            window.scrollTo(0, 0);
          }}
        />
        {isTransitioning && (
          <ExoTransitionOverlay
            topic={sessionTopic}
            onComplete={() => {
              setIsTransitioning(false);
            }}
          />
        )}
      </div>
    );
  }

  // Kando Radial Menu Home Screen (with ExoOrb in center)
  if (activeNav === 'Home') {
    return (
      <>
        <HomePage
          userName={userName}
          onStartSession={handleStartSession}
          onNavigateToLearn={() => setActiveNav('Learn')}
          onNavigateToExplore={() => setActiveNav('Explore')}
          onLogout={onLogout}
        />
        {isTransitioning && (
          <ExoTransitionOverlay
            topic={sessionTopic}
            onComplete={() => {
              setIsTransitioning(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className={`relative ${
      activeNav === 'Explore' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#0A0B1A] text-white' : 'min-h-screen text-[#1E1B2E]'
    } flex flex-col font-sans overflow-x-hidden selection:bg-[#7C5CFF]/20 selection:text-[#1E1B2E] transition-colors duration-300`}>

      {/* ================= FIXED DASHBOARD BACKGROUND ================= */}
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-300 ${
        activeNav === 'Explore' ? 'bg-[#0A0B1A]' : ''
      }`} aria-hidden="true">
        {/* Cosmic alien mountain vista background image */}
        <img
          src={bgImage}
          alt=""
          className={`w-full h-full object-cover object-center select-none transition-opacity duration-300 ${
            activeNav === 'Explore' ? 'opacity-15' : 'opacity-100'
          }`}
        />

        {/* Translucent white layer: only for non-Explore views */}
        {activeNav !== 'Explore' && (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.50) 30%, rgba(255, 255, 255, 0.80) 65%, rgba(255, 255, 255, 0.96) 88%, #FFFFFF 100%)',
            }}
          />
        )}
      </div>

      {/* Top Main Workspace Wrapper */}
      <div className={`flex-1 flex w-full relative z-10 ${activeNav === 'Explore' ? 'h-full min-h-0 overflow-hidden' : ''}`}>

        {/* ================= UNIFIED DYNAMIC EXPANDABLE NAVBAR ================= */}
        {/* Mobile backdrop when sidebar is expanded */}
        {isSidebarExpanded && (
          <div
            onClick={() => setIsSidebarExpanded(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-25 md:hidden animate-in fade-in duration-200"
          />
        )}

        {/* Floating Re-Open Navbar Button (When Navbar is closed) */}
        {isNavbarClosed && (
          <button
            onClick={() => setIsNavbarClosed(false)}
            className={`fixed top-4 left-4 z-40 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md animate-in fade-in duration-200 ${
              activeNav === 'Explore'
                ? 'bg-[#141630]/95 hover:bg-[#1E2248] text-white border border-[#2A2E63] shadow-[0_0_20px_rgba(0,0,0,0.5)]'
                : 'bg-white/95 hover:bg-white text-[#1E1B2E] border border-purple-100 shadow-purple-500/10'
            }`}
            title="Open Navigation Menu"
          >
            <PanelLeft className="w-4 h-4 text-purple-400" />
            <span>Menu</span>
          </button>
        )}

        {/* Dynamic layout spacer: expands smoothly so main content adjusts and gives space for the menu */}
        <div
          className={`shrink-0 hidden md:block transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isNavbarClosed ? 'w-0' : isSidebarExpanded ? 'w-[272px]' : 'w-[76px]'
          }`}
        />

        {/* Floating tooltip when sidebar is compact */}
        {hoveredTooltip && !isSidebarExpanded && !isNavbarClosed && (
          <div
            className="fixed z-50 pointer-events-none hidden md:flex items-center -translate-y-1/2 transition-opacity duration-150 animate-in fade-in zoom-in-95"
            style={{ left: 88, top: hoveredTooltip.top }}
          >
            <div className="relative bg-[#1E1B2E] text-white text-xs font-medium px-3 py-1.5 rounded-xl shadow-xl shadow-purple-950/25 whitespace-nowrap flex items-center gap-1.5 border border-purple-800/30">
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1E1B2E]" />
              <span>{hoveredTooltip.text}</span>
            </div>
          </div>
        )}

        {/* Unified Single Navbar (expands on clicking logo, can be closed) */}
        <aside
          ref={sidebarRef}
          className={`fixed top-3.5 left-3 bottom-3.5 z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between overflow-hidden ${
            isNavbarClosed
              ? '-translate-x-[125%] opacity-0 pointer-events-none'
              : 'translate-x-0 opacity-100'
          } ${
            activeNav === 'Explore'
              ? 'bg-[#0E1026]/95 backdrop-blur-2xl border border-[#23274F] text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
              : 'bg-white/95 backdrop-blur-2xl border border-purple-100/90 text-[#1E1B2E] shadow-[0_8px_30px_rgba(99,102,241,0.08)]'
          } ${
            isSidebarExpanded
              ? 'w-[272px] max-w-[85vw] px-4 py-4 rounded-[28px] shadow-[0_20px_50px_rgba(99,102,241,0.22)]'
              : 'w-12 h-12 p-1.5 rounded-full md:w-[72px] md:h-[calc(100vh-1.75rem)] md:rounded-[28px] md:py-4 md:px-2'
          }`}
          style={{
            maxHeight: 'calc(100vh - 1.75rem)',
            willChange: 'width, height, box-shadow, transform',
          }}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col min-h-0">
              {/* Top Logo Orb & Expandable Brand Name + Close Button */}
              <div className="flex items-center justify-between gap-1 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarExpanded(v => !v);
                    setHoveredTooltip(null);
                  }}
                  onMouseEnter={(e) => {
                    if (!isSidebarExpanded) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredTooltip({ text: 'Nilo (Click to expand)', top: rect.top + rect.height / 2 });
                    }
                  }}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  className={`flex-1 flex items-center cursor-pointer select-none shrink-0 transition-all focus:outline-none ${
                    isSidebarExpanded ? 'px-2 py-1.5 justify-between' : 'justify-center p-1.5'
                  }`}
                  title={isSidebarExpanded ? 'Click to collapse menu' : 'Click to expand menu'}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#EC4899] p-0.5 shadow-md shadow-purple-500/25 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0.5 left-1 w-2.5 h-1.5 bg-white/50 rounded-full blur-[0.5px]" />
                        <div className="flex items-center gap-0.5 text-white scale-[0.65] font-black">
                          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                            <path d="M1.5 6.5L4 2.5L6.5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7.5 6.5L10 2.5L12.5 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-lg font-black tracking-wider whitespace-nowrap transition-all duration-200 ${
                        activeNav === 'Explore' ? 'text-white' : 'text-[#1E1B2E]'
                      } ${
                        isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none w-0 hidden'
                      }`}
                    >
                      NILO
                    </span>
                  </div>

                  {isSidebarExpanded && (
                    <span className="p-1 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors shrink-0">
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  )}
                </button>

                {/* Close Navbar Button (to completely hide navbar and expand elements) */}
                {isSidebarExpanded && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavbarClosed(true);
                      setHoveredTooltip(null);
                    }}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      activeNav === 'Explore'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                    title="Close Sidebar Menu"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Navigation Items: Generous spacing between icons and text labels */}
              <div className="mt-3 space-y-1.5 sm:space-y-2 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 min-h-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveNav(item.name);
                        if (item.name === 'Explore') {
                          setArcadeViewMode('3d_cabinet');
                        }
                        setIsSidebarExpanded(false);
                        setHoveredTooltip(null);
                      }}
                      onMouseEnter={(e) => {
                        if (!isSidebarExpanded) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredTooltip({ text: item.name, top: rect.top + rect.height / 2 });
                        }
                      }}
                      onMouseLeave={() => setHoveredTooltip(null)}
                      className={`w-full flex items-center rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-150 ${
                        isSidebarExpanded ? 'px-4 py-2.5 gap-7' : 'justify-center p-2.5'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                          : activeNav === 'Explore'
                          ? 'text-gray-400 hover:text-white hover:bg-white/10'
                          : 'text-[#64748B] hover:text-[#1E1B2E] hover:bg-purple-50/70'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#8B5CF6]'}`} />
                      <span
                        className={`whitespace-nowrap transition-all duration-200 ${
                          isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none w-0 hidden'
                        }`}
                      >
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Settings & Logout inside the one unified navbar */}
            <div className={`pt-2 sm:pt-3 border-t space-y-1.5 sm:space-y-2 shrink-0 ${
              activeNav === 'Explore' ? 'border-[#23274F]' : 'border-purple-100/80'
            }`}>
              <button
                onClick={() => {
                  setActiveNav('Settings');
                  setIsSidebarExpanded(false);
                  setHoveredTooltip(null);
                }}
                onMouseEnter={(e) => {
                  if (!isSidebarExpanded) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredTooltip({ text: 'Settings', top: rect.top + rect.height / 2 });
                  }
                }}
                onMouseLeave={() => setHoveredTooltip(null)}
                className={`w-full flex items-center rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  isSidebarExpanded ? 'px-4 py-2.5 gap-7' : 'justify-center p-2.5'
                } ${
                  activeNav === 'Explore'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-[#64748B] hover:text-[#1E1B2E] hover:bg-purple-50/70'
                }`}
              >
                <Settings className="w-5 h-5 text-[#8B5CF6] shrink-0" />
                <span
                  className={`whitespace-nowrap transition-all duration-200 ${
                    isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none w-0 hidden'
                  }`}
                >
                  Settings
                </span>
              </button>

              <button
                onClick={() => {
                  setHoveredTooltip(null);
                  onLogout();
                }}
                onMouseEnter={(e) => {
                  if (!isSidebarExpanded) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredTooltip({ text: 'Log out', top: rect.top + rect.height / 2 });
                  }
                }}
                onMouseLeave={() => setHoveredTooltip(null)}
                className={`w-full flex items-center rounded-2xl font-semibold text-xs sm:text-sm text-red-500 transition-all duration-150 ${
                  activeNav === 'Explore' ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                } ${
                  isSidebarExpanded ? 'px-4 py-2.5 gap-7' : 'justify-center p-2.5'
                }`}
              >
                <LogOut className="w-5 h-5 text-red-400 shrink-0" />
                <span
                  className={`whitespace-nowrap transition-all duration-200 ${
                    isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none w-0 hidden'
                  }`}
                >
                  Log out
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* ================= CENTER MAIN CONTENT ================= */}
        {/* ================= CENTER MAIN CONTENT ================= */}
        <main
          ref={mainRef}
          onScroll={activeNav === 'Home' ? handleScroll : undefined}
          onWheel={activeNav === 'Home' ? handleWheel : undefined}
          className={`flex-1 flex flex-col min-w-0 ${
            activeNav === 'Explore'
              ? 'p-0 pb-0 h-full min-h-0 overflow-hidden'
              : !rightPanelCollapsed && activeNav === 'Home'
              ? 'p-3.5 sm:p-5 space-y-3 pb-20 h-screen max-h-screen overflow-hidden'
              : activeNav === 'Learn'
              ? 'p-0 pb-16 overflow-y-auto scroll-smooth'
              : 'p-3.5 sm:p-5 space-y-3 pb-20 overflow-y-auto scroll-smooth'
          } [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          {activeNav === 'Learn' ? (
            <LearnPage
              onBackToHome={() => setActiveNav('Home')}
              onStartSession={(topic) => handleStartSession(topic)}
            />
          ) : activeNav === 'Explore' ? (
            arcadeViewMode === '3d_cabinet' ? (
              <ArcadeCabinet3D
                onEnterArcade={() => setArcadeViewMode('arcade_page')}
                onClose={() => setActiveNav('Home')}
              />
            ) : (
              <ArcadePage
                onBackToHome={() => setActiveNav('Home')}
                onView3DModel={() => setArcadeViewMode('3d_cabinet')}
                userName={userName}
                isNavbarClosed={isNavbarClosed}
                onToggleNavbar={() => setIsNavbarClosed(prev => !prev)}
              />
            )
          ) : (
            <>
              {/* Top Bar: Greeting + Notifications + Avatar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-12 md:pl-0 shrink-0">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E1B2E] flex items-center gap-2">
                    <span>Hi, {userName}</span>
                    <span className="animate-wiggle">👋</span>
                  </h1>
                  <p className="text-xs text-[#6B7280] font-normal mt-0.5">
                    How may I help you today?
                  </p>
                </div>

                {/* Right Controls: Bell, Profile, and Activity Panel Toggle */}
                <div className="flex items-center gap-2.5">
                  {/* Notification Bell */}
                  <button className="relative w-8 h-8 rounded-full bg-white border border-[#E5E7EB] hover:bg-gray-50 flex items-center justify-center text-[#6B7280] transition-colors shadow-xs">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
                  </button>

                  {/* User Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-xs ring-2 ring-purple-100 cursor-pointer">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Activity Panel Collapse Toggle */}
                  <button
                    onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                    className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] hover:bg-purple-50 text-[#6B7280] hover:text-[#7C5CFF] flex items-center justify-center transition-colors shadow-xs"
                    title={rightPanelCollapsed ? "Expand Activity Panel" : "Collapse Activity Panel"}
                  >
                    {rightPanelCollapsed ? <PanelRightOpen className="w-3.5 h-3.5" /> : <PanelRightClose className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* HERO SLIDER SECTION (3 SLIDES + TRANSPARENT GLASS BOX + DYNAMIC TEXT COLOR + SCROLL ANIMATION) */}
              <HeroSlider
                userName={userName}
                chatInput={chatInput}
                setChatInput={setChatInput}
                exoMessage={exoMessage}
                onStartSession={handleStartSession}
                onNavigateToLearn={() => setActiveNav('Learn')}
                onScrollDown={handleScrollDown}
                scrollY={scrollY}
                bannerRef={bannerRef}
              />

              {/* SECTION: "Your Subjects" */}
              <div id="your-subjects" ref={subjectsSectionRef} className="snap-start pt-1 shrink-0">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-base sm:text-lg font-bold text-[#1E1B2E]">Your Subjects</h3>
                  <button
                    onClick={() => setActiveNav('Learn')}
                    className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View all in Library</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

            {/* 4 Subject Cards with 3D Badges & Card Hover Micro-animations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

              {/* Card 1: Coding (0 1 Binary Effect on Hover) */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md p-4 border border-white/80 shadow-[0_6px_20px_rgba(124,92,255,0.04)] flex flex-col justify-between hover:shadow-xl hover:border-indigo-200/60 transition-all duration-300">
                {/* Hover Micro-animation: 0 1 Binary Stream */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-2xl z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.04] via-purple-500/[0.06] to-indigo-600/[0.08]" />
                  <div className="absolute inset-0 flex justify-around px-2 font-mono text-[10px] font-bold text-indigo-500/35 leading-tight select-none">
                    <div className="flex flex-col animate-binary-stream-1">
                      <span>0</span><span>1</span><span>0</span><span>0</span><span>1</span><span>1</span><span>0</span><span>1</span>
                    </div>
                    <div className="flex flex-col animate-binary-stream-2">
                      <span>1</span><span>0</span><span>1</span><span>1</span><span>0</span><span>1</span><span>0</span><span>0</span>
                    </div>
                    <div className="flex flex-col animate-binary-stream-3">
                      <span>0</span><span>0</span><span>1</span><span>0</span><span>1</span><span>1</span><span>1</span><span>0</span>
                    </div>
                    <div className="flex flex-col animate-binary-stream-4">
                      <span>1</span><span>1</span><span>0</span><span>1</span><span>0</span><span>0</span><span>1</span><span>1</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mb-3">
                  {/* 3D Glass Badge */}
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#4338CA] p-[1.5px] shadow-[0_8px_16px_-2px_rgba(99,102,241,0.4),inset_0_1px_1px_rgba(255,255,255,0.8)] group-hover:scale-105 group-hover:shadow-[0_12px_22px_-2px_rgba(99,102,241,0.55)] transition-all duration-300 shrink-0">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#7C5CFF] via-[#6366F1] to-[#4F46E5] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-x-1 top-0.5 h-3 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl pointer-events-none" />
                      <div className="absolute inset-x-2 bottom-0.5 h-1 bg-white/20 rounded-full blur-[0.5px] pointer-events-none" />
                      <span className="font-mono font-black text-xs text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] tracking-tighter">
                        &lt;/&gt;
                      </span>
                    </div>
                  </div>
                  <div className="relative w-8 h-8 rounded-full border-2 border-indigo-100 bg-white/70 flex items-center justify-center text-[11px] font-bold text-[#6366F1] shadow-xs">
                    72%
                  </div>
                </div>

                <div className="relative z-10">
                  <h4 className="text-sm font-bold text-[#1E1B2E]">Coding</h4>
                  <p className="text-xs text-[#6B7280]">8/12 lessons</p>
                </div>

                <div className="relative z-10 mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-indigo-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-[72%]" />
                  </div>
                  <button className="w-6 h-6 rounded-full bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 flex items-center justify-center text-xs transition-colors">
                    &gt;
                  </button>
                </div>
              </div>

              {/* Card 2: Maths (+ - Symbols Falling on Hover) */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md p-4 border border-white/80 shadow-[0_6px_20px_rgba(124,92,255,0.04)] flex flex-col justify-between hover:shadow-xl hover:border-pink-200/60 transition-all duration-300">
                {/* Hover Micro-animation: Falling Math Symbols (+, -, ×, ÷, √, π) */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-2xl z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-pink-500/[0.04] via-rose-500/[0.06] to-pink-600/[0.08]" />
                  <div className="absolute inset-0">
                    <span className="absolute left-[10%] text-sm font-black text-pink-500/40 animate-math-fall-1 select-none">+</span>
                    <span className="absolute left-[28%] text-base font-black text-rose-500/45 animate-math-fall-2 select-none">−</span>
                    <span className="absolute left-[46%] text-sm font-black text-pink-500/40 animate-math-fall-3 select-none">×</span>
                    <span className="absolute left-[64%] text-base font-black text-rose-500/45 animate-math-fall-4 select-none">÷</span>
                    <span className="absolute left-[80%] text-sm font-black text-pink-500/40 animate-math-fall-5 select-none">√</span>
                    <span className="absolute left-[92%] text-xs font-black text-rose-500/40 animate-math-fall-6 select-none">π</span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mb-3">
                  {/* 3D Glass Badge */}
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F43F5E] via-[#EC4899] to-[#BE185D] p-[1.5px] shadow-[0_8px_16px_-2px_rgba(236,72,153,0.4),inset_0_1px_1px_rgba(255,255,255,0.8)] group-hover:scale-105 group-hover:shadow-[0_12px_22px_-2px_rgba(236,72,153,0.55)] transition-all duration-300 shrink-0">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#FB7185] via-[#EC4899] to-[#DB2777] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-x-1 top-0.5 h-3 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl pointer-events-none" />
                      <div className="absolute inset-x-2 bottom-0.5 h-1 bg-white/20 rounded-full blur-[0.5px] pointer-events-none" />
                      <span className="font-bold text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] tracking-tight">
                        √x
                      </span>
                    </div>
                  </div>
                  <div className="relative w-8 h-8 rounded-full border-2 border-pink-100 bg-white/70 flex items-center justify-center text-[11px] font-bold text-[#EC4899] shadow-xs">
                    56%
                  </div>
                </div>

                <div className="relative z-10">
                  <h4 className="text-sm font-bold text-[#1E1B2E]">Maths</h4>
                  <p className="text-xs text-[#6B7280]">7/14 lessons</p>
                </div>

                <div className="relative z-10 mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-pink-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full w-[56%]" />
                  </div>
                  <button className="w-6 h-6 rounded-full bg-gray-50 hover:bg-pink-50 text-gray-400 hover:text-[#EC4899] flex items-center justify-center text-xs transition-colors">
                    &gt;
                  </button>
                </div>
              </div>

              {/* Card 3: Science (Chemical Blast & Bubble Reaction on Hover) */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md p-4 border border-white/80 shadow-[0_6px_20px_rgba(124,92,255,0.04)] flex flex-col justify-between hover:shadow-xl hover:border-sky-200/60 transition-all duration-300">
                {/* Hover Micro-animation: Chemical Blast & Bubbles */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-2xl z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.04] via-sky-500/[0.06] to-cyan-600/[0.08]" />
                  {/* Central chemical blast glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl animate-chem-blast" />
                  {/* Effervescent bubbles */}
                  <div className="absolute inset-0 flex justify-around items-end pb-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-cyan-400/70 bg-cyan-300/30 backdrop-blur-[1px] animate-bubble-1 relative">
                      <div className="w-1 h-1 bg-white/90 rounded-full absolute top-0.5 left-0.5" />
                    </div>
                    <div className="w-5 h-5 rounded-full border border-sky-400/70 bg-sky-300/35 backdrop-blur-[1px] animate-bubble-2 relative">
                      <div className="w-1.5 h-1.5 bg-white/90 rounded-full absolute top-0.5 left-0.5" />
                    </div>
                    <div className="w-3 h-3 rounded-full border border-cyan-300/70 bg-cyan-200/30 backdrop-blur-[1px] animate-bubble-3 relative">
                      <div className="w-0.5 h-0.5 bg-white/90 rounded-full absolute top-0.5 left-0.5" />
                    </div>
                    <div className="w-4 h-4 rounded-full border border-sky-400/70 bg-sky-300/30 backdrop-blur-[1px] animate-bubble-4 relative">
                      <div className="w-1 h-1 bg-white/90 rounded-full absolute top-0.5 left-0.5" />
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full border border-cyan-400/70 bg-cyan-300/30 backdrop-blur-[1px] animate-bubble-5 relative">
                      <div className="w-0.5 h-0.5 bg-white/90 rounded-full absolute top-0.5 left-0.5" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mb-3">
                  {/* 3D Glass Badge */}
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#06B6D4] via-[#0284C7] to-[#0369A1] p-[1.5px] shadow-[0_8px_16px_-2px_rgba(2,132,199,0.4),inset_0_1px_1px_rgba(255,255,255,0.8)] group-hover:scale-105 group-hover:shadow-[0_12px_22px_-2px_rgba(2,132,199,0.55)] transition-all duration-300 shrink-0">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#38BDF8] via-[#0EA5E9] to-[#0284C7] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-x-1 top-0.5 h-3 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl pointer-events-none" />
                      <div className="absolute inset-x-2 bottom-0.5 h-1 bg-white/20 rounded-full blur-[0.5px] pointer-events-none" />
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
                        <path d="M10 3V8L5 18C4.3 19.4 5.3 21 6.8 21H17.2C18.7 21 19.7 19.4 19 18L14 8V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 3H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M7.5 16.5L16.5 16.5C15.8 15 14.8 13.5 14 12L10 12C9.2 13.5 8.2 15 7.5 16.5Z" fill="rgba(255,255,255,0.45)"/>
                        <circle cx="11" cy="15" r="1" fill="white" />
                        <circle cx="14" cy="14" r="1.2" fill="white" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative w-8 h-8 rounded-full border-2 border-sky-100 bg-white/70 flex items-center justify-center text-[11px] font-bold text-[#0284C7] shadow-xs">
                    41%
                  </div>
                </div>

                <div className="relative z-10">
                  <h4 className="text-sm font-bold text-[#1E1B2E]">Science</h4>
                  <p className="text-xs text-[#6B7280]">5/12 lessons</p>
                </div>

                <div className="relative z-10 mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-sky-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-sky-600 rounded-full w-[41%]" />
                  </div>
                  <button className="w-6 h-6 rounded-full bg-gray-50 hover:bg-sky-50 text-gray-400 hover:text-[#0284C7] flex items-center justify-center text-xs transition-colors">
                    &gt;
                  </button>
                </div>
              </div>

              {/* Card 4: History (People Marching Procession on Hover) */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md p-4 border border-white/80 shadow-[0_6px_20px_rgba(124,92,255,0.04)] flex flex-col justify-between hover:shadow-xl hover:border-amber-200/60 transition-all duration-300">
                {/* Hover Micro-animation: People Marching Across */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-2xl z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.04] via-orange-500/[0.06] to-amber-600/[0.08]" />
                  {/* Ground road line */}
                  <div className="absolute bottom-3.5 inset-x-0 h-0.5 bg-amber-400/20" />
                  {/* Advancing procession of silhouettes */}
                  <div className="absolute bottom-3.5 left-0 animate-march-across flex items-end gap-3 text-amber-700/50">
                    {/* Person 1 (Banner Bearer) */}
                    <div className="animate-march-bob flex flex-col items-center">
                      <div className="w-1 h-3.5 bg-amber-600/70 mb-[-2px] relative">
                        <div className="w-2.5 h-1.5 bg-amber-500/80 absolute -top-0.5 -right-2 rounded-r-xs" />
                      </div>
                      <div className="w-2 h-2 rounded-full bg-amber-700/70" />
                      <div className="w-2.5 h-3.5 bg-amber-700/70 rounded-t-xs" />
                    </div>
                    {/* Person 2 */}
                    <div className="animate-march-bob [animation-delay:0.15s] flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-amber-700/70" />
                      <div className="w-2.5 h-3.5 bg-amber-700/70 rounded-t-xs" />
                    </div>
                    {/* Person 3 */}
                    <div className="animate-march-bob [animation-delay:0.3s] flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-amber-700/70" />
                      <div className="w-2.5 h-3.5 bg-amber-700/70 rounded-t-xs" />
                    </div>
                    {/* Person 4 */}
                    <div className="animate-march-bob [animation-delay:0.45s] flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-amber-700/70" />
                      <div className="w-2.5 h-3.5 bg-amber-700/70 rounded-t-xs" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mb-3">
                  {/* 3D Glass Badge */}
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] p-[1.5px] shadow-[0_8px_16px_-2px_rgba(217,119,6,0.4),inset_0_1px_1px_rgba(255,255,255,0.8)] group-hover:scale-105 group-hover:shadow-[0_12px_22px_-2px_rgba(217,119,6,0.55)] transition-all duration-300 shrink-0">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#FBBF24] via-[#F59E0B] to-[#D97706] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-x-1 top-0.5 h-3 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl pointer-events-none" />
                      <div className="absolute inset-x-2 bottom-0.5 h-1 bg-white/20 rounded-full blur-[0.5px] pointer-events-none" />
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
                        <path d="M3 21H21M4 18H20M5 7L12 2.5L19 7M5 7H19M7 7V18M11 7V18M13 7V18M17 7V18" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="relative w-8 h-8 rounded-full border-2 border-amber-100 bg-white/70 flex items-center justify-center text-[11px] font-bold text-[#D97706] shadow-xs">
                    28%
                  </div>
                </div>

                <div className="relative z-10">
                  <h4 className="text-sm font-bold text-[#1E1B2E]">History</h4>
                  <p className="text-xs text-[#6B7280]">3/11 lessons</p>
                </div>

                <div className="relative z-10 mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-amber-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full w-[28%]" />
                  </div>
                  <button className="w-6 h-6 rounded-full bg-gray-50 hover:bg-amber-50 text-gray-400 hover:text-[#D97706] flex items-center justify-center text-xs transition-colors">
                    &gt;
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* LOWER TWO-COLUMN ROW: "Continue Learning" & "Upcoming" */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 shrink-0">

            {/* Continue Learning */}
            <div className="lg:col-span-7">
              <h3 className="text-lg font-bold text-[#1E1B2E] mb-3.5">Continue Learning</h3>
              <div className="rounded-2xl bg-white/90 backdrop-blur-md p-4 sm:p-5 border border-white shadow-[0_6px_20px_rgba(124,92,255,0.04)] flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden shrink-0 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=300"
                    alt="Cell biology"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent" />
                </div>

                <div className="flex-1 w-full">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-[#0284C7] text-[11px] font-semibold">
                    Science
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-[#1E1B2E] mt-1.5">
                    Cell Structure and Function
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Understanding the basic unit of life
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5046E5] rounded-full w-[60%]" />
                    </div>
                    <span className="text-xs font-bold text-[#6B7280]">60%</span>
                    <button className="w-8 h-8 rounded-full bg-[#5046E5] hover:bg-[#4338CA] text-white flex items-center justify-center shadow-md shadow-indigo-500/25 active:scale-95 transition-all">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-lg font-bold text-[#1E1B2E]">Upcoming</h3>
                <button className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1">
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="rounded-2xl bg-white/90 backdrop-blur-md p-4 border border-white shadow-[0_6px_20px_rgba(124,92,255,0.04)] space-y-3">
                {/* Item 1 */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-[#EC4899] text-xs font-bold shrink-0">
                      √x
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#1E1B2E]">Maths</h5>
                      <p className="text-[11px] text-[#6B7280]">Quadratic Equations</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] whitespace-nowrap">
                    10:00 AM
                  </span>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-[#0284C7] text-xs font-bold shrink-0">
                      ⚗️
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#1E1B2E]">Science</h5>
                      <p className="text-[11px] text-[#6B7280]">Human Digestive System</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] whitespace-nowrap">
                    02:00 PM
                  </span>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-[#D97706] text-xs font-bold shrink-0">
                      📖
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#1E1B2E]">History</h5>
                      <p className="text-[11px] text-[#6B7280]">The French Revolution</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] whitespace-nowrap">
                    05:00 PM
                  </span>
                </div>
              </div>
            </div>

          </div>

        </>
      )}

    </main>

      {/* ================= RIGHT ACTIVITY PANEL (APPLE WIDGETS SUITE) ================= */}
      {!rightPanelCollapsed && activeNav === 'Home' && (
        <aside className="w-80 lg:w-[356px] sticky top-0 self-start h-screen max-h-screen overflow-y-auto overscroll-contain bg-[#F8F9FD]/95 backdrop-blur-2xl border-l border-slate-200/80 p-4 space-y-3.5 shrink-0 transition-all duration-300 pb-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            {/* Apple Shelf Header: Date + Title + Collapse Button */}
            <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block leading-tight">
                  Tuesday, Oct 13
                </span>
                <h3 className="text-base font-extrabold text-[#1E1B2E] tracking-tight flex items-center gap-1.5 mt-0.5">
                  <span>Today's Summary</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
              </div>
              <button
                onClick={() => setRightPanelCollapsed(true)}
                className="w-7 h-7 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                title="Collapse Widgets"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* WIDGET 1: APPLE ACTIVITY RINGS (FITNESS / STUDY RINGS) */}
            <div className="bg-white rounded-[24px] p-4 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.07)] transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-[#FF2D55]">
                    <Target className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Activity Rings</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 rounded-full">
                  82% Goal Met
                </span>
              </div>

              <div className="flex items-center gap-4 pt-0.5">
                {/* Concentric 3-Ring SVG */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xs" viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="ringCoral" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF2D55" />
                        <stop offset="100%" stopColor="#FF375F" />
                      </linearGradient>
                      <linearGradient id="ringGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#30D158" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                      <linearGradient id="ringCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00F0FF" />
                        <stop offset="100%" stopColor="#0284C7" />
                      </linearGradient>
                    </defs>

                    {/* Ring 1 (Focus Time - Coral): r=46, C=289 */}
                    <circle cx="60" cy="60" r="46" stroke="#FFE4E8" strokeWidth="7" fill="transparent" />
                    <circle
                      cx="60" cy="60" r="46"
                      stroke="url(#ringCoral)"
                      strokeWidth="7"
                      strokeDasharray="289"
                      strokeDashoffset={289 * (1 - 0.80)}
                      strokeLinecap="round"
                      fill="transparent"
                    />

                    {/* Ring 2 (Lessons Completed - Emerald): r=35, C=220 */}
                    <circle cx="60" cy="60" r="35" stroke="#D1FAE5" strokeWidth="7" fill="transparent" />
                    <circle
                      cx="60" cy="60" r="35"
                      stroke="url(#ringGreen)"
                      strokeWidth="7"
                      strokeDasharray="220"
                      strokeDashoffset={220 * (1 - 0.75)}
                      strokeLinecap="round"
                      fill="transparent"
                    />

                    {/* Ring 3 (Accuracy / Quiz - Cyan): r=24, C=151 */}
                    <circle cx="60" cy="60" r="24" stroke="#CFFAFE" strokeWidth="7" fill="transparent" />
                    <circle
                      cx="60" cy="60" r="24"
                      stroke="url(#ringCyan)"
                      strokeWidth="7"
                      strokeDasharray="151"
                      strokeDashoffset={151 * (1 - 0.90)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  {/* Center Emblem */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Apple Health Metric Breakdown */}
                <div className="flex-1 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D55] ring-2 ring-pink-100 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">Focus</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      48<span className="text-[11px] text-slate-400 font-normal">/60m</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-emerald-100 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">Lessons</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      3<span className="text-[11px] text-slate-400 font-normal">/4</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] ring-2 ring-cyan-100 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">Accuracy</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      92%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 2: APPLE SCREEN TIME STYLE "STUDY RHYTHM" CAPSULES */}
            <div className="bg-white rounded-[24px] p-4 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.07)] transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Study Time</span>
                </div>

                {/* iOS Segmented Pill */}
                <div className="p-0.5 rounded-full bg-slate-100 flex items-center text-[10px] font-bold">
                  {(['Week', 'Month', 'Year'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActivityTimeframe(t)}
                      className={`px-2 py-0.5 rounded-full transition-all ${
                        activityTimeframe === t
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Metric + Trend */}
              <div className="flex items-baseline justify-between pt-0.5">
                <div>
                  <span className="text-xl font-black text-slate-900 tracking-tight">3h 24m</span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1.5">daily avg · 48m</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/70">
                  <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                  <span>+18%</span>
                </div>
              </div>

              {/* iOS Capsule Bars */}
              <div className="pt-2">
                <div className="h-24 flex items-end justify-between px-1.5">
                  {(
                    activityTimeframe === 'Week'
                      ? [
                          { label: 'M', time: '35m', h: 42, full: 'Mon' },
                          { label: 'T', time: '55m', h: 65, full: 'Tue' },
                          { label: 'W', time: '1h 10m', h: 84, full: 'Wed', active: true },
                          { label: 'T', time: '40m', h: 50, full: 'Thu' },
                          { label: 'F', time: '1h 05m', h: 76, full: 'Fri' },
                          { label: 'S', time: '1h 25m', h: 96, full: 'Sat', isToday: true, active: true },
                          { label: 'S', time: '45m', h: 54, full: 'Sun' },
                        ]
                      : activityTimeframe === 'Month'
                      ? [
                          { label: 'W1', time: '4h 10m', h: 58, full: 'Week 1' },
                          { label: 'W2', time: '6h 30m', h: 88, full: 'Week 2', active: true },
                          { label: 'W3', time: '5h 15m', h: 72, full: 'Week 3' },
                          { label: 'W4', time: '7h 20m', h: 100, full: 'Week 4', isToday: true, active: true },
                        ]
                      : [
                          { label: 'Q1', time: '24h', h: 62, full: 'Q1' },
                          { label: 'Q2', time: '38h', h: 94, full: 'Q2', active: true },
                          { label: 'Q3', time: '29h', h: 72, full: 'Q3' },
                          { label: 'Q4', time: '33h', h: 82, full: 'Q4', isToday: true },
                        ]
                  ).map((bar, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredBarIndex(i)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative"
                    >
                      {/* Floating Micro-Tooltip on hover */}
                      {hoveredBarIndex === i && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none z-20 animate-in fade-in zoom-in-95">
                          {bar.time}
                        </div>
                      )}

                      {/* Rounded Capsule Track */}
                      <div className="w-3.5 bg-slate-100 rounded-full h-full flex items-end p-0.5 overflow-hidden transition-colors group-hover:bg-slate-200/70">
                        <div
                          className={`w-full rounded-full transition-all duration-500 ease-out ${
                            bar.isToday
                              ? 'bg-gradient-to-t from-indigo-600 via-purple-600 to-pink-500 shadow-xs shadow-purple-500/30'
                              : bar.active
                              ? 'bg-indigo-400 group-hover:bg-indigo-500'
                              : 'bg-slate-300 group-hover:bg-slate-400'
                          }`}
                          style={{ height: `${bar.h}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${bar.isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WIDGET 3: APPLE FITNESS STREAK & 7-DAY HABIT TRACKER */}
            <div className="rounded-[24px] p-4 bg-gradient-to-br from-orange-500/[0.07] via-amber-500/[0.03] to-white border border-orange-200/60 shadow-[0_2px_12px_rgba(249,115,22,0.04)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  </div>
                  <span className="text-[11px] font-bold text-orange-800 tracking-wider uppercase">Habit Streak</span>
                </div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-full border border-orange-200/50">
                  Best: 14 Days
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">7</span>
                  <span className="text-xs font-semibold text-slate-500 ml-1.5">days in a row</span>
                </div>
                <span className="text-[10px] font-medium text-emerald-600">Top 5% consistency</span>
              </div>

              {/* 7-Day Apple Calendar Habit Row */}
              <div className="grid grid-cols-7 gap-1.5 pt-0.5">
                {[
                  { day: 'M', completed: true },
                  { day: 'T', completed: true },
                  { day: 'W', completed: true },
                  { day: 'T', completed: true },
                  { day: 'F', completed: true },
                  { day: 'S', completed: true, today: true },
                  { day: 'S', completed: false },
                ].map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        d.today
                          ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/30 scale-105'
                          : d.completed
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-slate-100/80 text-slate-300 border border-dashed border-slate-200'
                      }`}
                    >
                      {d.completed ? (
                        <Flame className={`w-3.5 h-3.5 ${d.today ? 'fill-white' : 'fill-orange-500'}`} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <span className={`text-[10px] font-bold ${d.today ? 'text-orange-600' : 'text-slate-400'}`}>
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 4: APPLE REMINDERS / TODAY'S FOCUS QUEUE */}
            <div className="bg-white rounded-[24px] p-4 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.07)] transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Focus Queue</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {todoTasks.filter(t => t.completed).length}/{todoTasks.length} Done
                </span>
              </div>

              <div className="space-y-1.5">
                {todoTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      t.completed
                        ? 'bg-slate-50/70 border-slate-100 text-slate-400'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200/70 hover:border-purple-200 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                          t.completed
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-slate-300 group-hover:border-purple-500'
                        }`}
                      >
                        {t.completed && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={`text-xs font-semibold truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {t.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 5: APPLE AWARDS & MILESTONE BADGES */}
            <div className="bg-white rounded-[24px] p-4 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.07)] transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Milestone Badges</span>
                </div>
                <button className="text-[10px] font-bold text-purple-600 hover:text-purple-700 transition-colors">
                  View All &gt;
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { icon: Star, label: 'First Lap', desc: '1st Lesson Done', bg: 'bg-amber-50 text-amber-600 border-amber-200/60' },
                  { icon: Flame, label: 'Fire Streak', desc: '7d in a row', bg: 'bg-orange-50 text-orange-600 border-orange-200/60' },
                  { icon: Zap, label: 'Quiz Ace', desc: '10 Qs solved', bg: 'bg-purple-50 text-purple-600 border-purple-200/60' },
                  { icon: ShieldCheck, label: 'Mastery', desc: 'Concept clear', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60' },
                ].map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="group relative flex flex-col items-center">
                      <div className={`w-11 h-11 rounded-2xl ${b.bg} border flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 cursor-pointer`}>
                        <Icon className="w-5 h-5 transition-transform group-hover:rotate-6" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 mt-1.5 leading-tight">
                        {b.label}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                        {b.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </aside>
        )}

      </div>

      {/* ================= CLEAN 'TALK WITH EXO' BOTTOM NAVBAR (APPEARS ONLY WHEN BANNER SCROLLED OUT ON HOME DASHBOARD) ================= */}
      {!showChatSession && !isTransitioning && activeNav === 'Home' && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out transform ${!isBannerVisible
              ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
              : 'translate-y-32 opacity-0 pointer-events-none scale-95'
            }`}
        >
          <div className="w-[92vw] max-w-xl mx-auto rounded-full bg-white/95 backdrop-blur-2xl p-2 sm:p-2.5 px-4 sm:px-5 border border-white/90 shadow-[0_14px_45px_rgba(124,92,255,0.22)] ring-1 ring-purple-100 flex items-center justify-between gap-3">

            {/* Left: Mini EXO Orb coming below with gentle pulse */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                onClick={() => handleStartSession(chatInput || 'Photosynthesis')}
                className="relative w-10 h-10 rounded-full shrink-0 shadow-md shadow-purple-500/30 overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title="Click to talk with EXO"
              >
                <div
                  className="w-full h-full rounded-full animate-pedestal"
                  style={{
                    background: 'radial-gradient(circle at 35% 25%, #FFD6F3 0%, #E879F9 22%, #A855F7 52%, #6366F1 80%, #312E81 100%)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-1 text-white scale-[0.75]">
                      <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                        <path d="M1.5 6.5L4 2.5L6.5 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7.5 6.5L10 2.5L12.5 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1E1B2E] tracking-tight leading-none flex items-center gap-1.5">
                  <span>Talk with EXO</span>
                  {isMicActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </span>
                <span className="text-[11px] text-[#6B7280] truncate mt-0.5 max-w-[130px] sm:max-w-[200px]">
                  {isMicActive ? "Listening to your voice..." : exoMessage}
                </span>
              </div>
            </div>

            {/* Center: Live Waveform Visualizer (compact) */}
            <div className="hidden sm:flex items-center justify-center px-1">
              <div className="flex items-center gap-1 h-6">
                {[8, 16, 22, 12, 26, 16, 10, 20, 12, 16, 8].map((h, i) => (
                  <span
                    key={i}
                    className={`w-[2.5px] rounded-full transition-all duration-150 ${isMicActive
                        ? 'bg-gradient-to-t from-[#EC4899] via-[#8B5CF6] to-[#38BDF8]'
                        : 'bg-purple-200'
                      }`}
                    style={{
                      height: isMicActive ? `${h}px` : '4px',
                      animation: isMicActive ? 'pulse 1.2s ease-in-out infinite' : 'none',
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right Action: Clean Mic Button & Quick Input */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mic Toggle Button */}
              <button
                onClick={() => handleStartSession(chatInput || 'Photosynthesis')}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-all shadow-md bg-gradient-to-tr from-[#5046E5] to-[#7C5CFF] shadow-indigo-500/25 hover:scale-105 active:scale-95"
                title="Tap to Speak with EXO"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Quick Text Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStartSession(chatInput || 'Photosynthesis');
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  placeholder="Ask or type..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-24 sm:w-32 pl-3 pr-8 py-1.5 bg-[#FAF9FD] text-xs text-[#1E1B2E] placeholder:text-gray-400 border border-gray-200 rounded-full outline-none focus:border-[#7C5CFF] focus:bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-1 w-6 h-6 rounded-full bg-[#5046E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
                  title="Send"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ================= INTERACTIVE VOICE & CONCEPT CHAT INTERFACE ================= */}
      {showChatSession && (
        <div className="fixed inset-0 z-50">
          <ChatSession
            userName={userName}
            initialTopic={sessionTopic}
            onBackToDashboard={() => {
              setShowChatSession(false);
              setIsTransitioning(false);
              window.scrollTo(0, 0);
            }}
          />
        </div>
      )}

      {/* ================= CINEMATIC DIVING GOGGLES TRANSITION ================= */}
      {isTransitioning && (
        <ExoTransitionOverlay
          topic={sessionTopic}
          onComplete={() => {
            setIsTransitioning(false);
          }}
        />
      )}

    </div>
  );
};
