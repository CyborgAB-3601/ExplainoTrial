import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ChevronDown,
  Terminal,
  Keyboard,
  Folder,
  ExternalLink,
  Settings,
  Globe,
  ClipboardList,
  GraduationCap,
  Info,
  Palette,
  Trophy,
  Undo2,
  Redo2,
  Minus,
  Square,
  X,
  Plus,
  Download,
  Share2,
  Copy,
  Trash2,
  MessageSquare,
  Gamepad2,
  FlaskConical,
  Play,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Mic,
  Pencil
} from 'lucide-react';
import { ExoOrb } from '../components/ExoOrb';
import { VoiceAgent } from '../Voice';
import { ResourcesView } from '../Resources';
import { ChatView } from '../Chat';
import { GamesView } from '../Games';
import { ScratchpadView } from '../Scratchpad';
import { VideoLessonsView } from '../Video';
import { DigitalLabView } from '../DigitalLab';

export interface HomePageProps {
  userName?: string;
  onStartSession?: (topic?: string) => void;
  onNavigateToLearn?: () => void;
  onNavigateToExplore?: () => void;
  onLogout?: () => void;
}

interface RecentTask {
  id: string;
  title: string;
  service: 'Speak with Nilo' | 'Scratchpad' | 'Digital Lab' | 'Books' | 'Concept Games' | 'Socratic Chat';
  serviceType: 'speak' | 'scratchpad' | 'digitallab' | 'books' | 'games' | 'chat';
  timeAgo: string;
  shortcut: string;
  tags: string[];
  status?: string;
  bound: boolean;
}

type MenuItem = RecentTask;

interface RadialNode {
  id: number;
  label: string;
  angle: number; // in degrees: 0° is 12 o'clock, 45° is 1:30, 90° is 3 o'clock, etc.
  icon: 'chat' | 'resources' | 'arrow-right' | 'clipboard' | 'play' | 'flask' | 'arrow-left' | 'games';
  description: string;
  featureKey: 'chat' | 'resources' | 'next' | 'scratchpad' | 'video' | 'digitallab' | 'prev' | 'games';
}

export const HomePage: React.FC<HomePageProps> = ({
  userName = "Abhinav",
  onStartSession,
  onNavigateToLearn,
  onNavigateToExplore,
  onLogout,
}) => {
  // Navigation & Search States
  const [selectedTaskId, setSelectedTaskId] = useState<string>('task-1');
  const selectedMenuId = selectedTaskId;
  const setSelectedMenuId = setSelectedTaskId;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRadialNode, setActiveRadialNode] = useState<number | null>(null);
  const [hoveredRadialNode, setHoveredRadialNode] = useState<number | null>(null);

  // Active Feature View (Modal / Fullscreen view over the wheel)
  const [activeFeature, setActiveFeature] = useState<'chat' | 'resources' | 'games' | 'scratchpad' | 'video' | 'digitallab' | null>(null);

  // Radial Menu Interaction States (Blooms on hover, collapses into orb when normal)
  const [isRadialMenuOpen, setIsRadialMenuOpen] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isBottomShelfExpanded, setIsBottomShelfExpanded] = useState(false);

  // Purple animation states & phase progression for Voice
  const [isCenterHovered, setIsCenterHovered] = useState(false);
  type PurplePhase = 'idle' | 'sliding' | 'peeping';
  const [purplePhase, setPurplePhase] = useState<PurplePhase>('idle');

  const effectiveRadialOpen = isRadialMenuOpen || isPinnedOpen;
  const isMeltActive = purplePhase !== 'idle';
  const isHoveredOrPurple = effectiveRadialOpen || isCenterHovered;

  // Debounced radial stage hover so moving between orb and sub-elements never accidentally closes
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Opening is strictly triggered ONLY when mouse is directly over the orb
  const handleOrbEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsRadialMenuOpen(true);
    setIsCenterHovered(true);
  };

  // Moving across the outer radial stage:
  // If already open, keep it open (cancel any pending leave delay)
  // If NOT open, moving over the outer stage does NOT open the menu
  const handleStageMouseMove = () => {
    if (isRadialMenuOpen && leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleStageLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      if (!isPinnedOpen) {
        setIsRadialMenuOpen(false);
        setIsCenterHovered(false);
        setHoveredRadialNode(null);
      }
    }, 380);
  };

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  // Inspector Panel State
  const [menuBehaviorOpen, setMenuBehaviorOpen] = useState(false);
  const [menuConditionsOpen, setMenuConditionsOpen] = useState(true);
  const [limitApps, setLimitApps] = useState(false);
  const [limitWindowTitles, setLimitWindowTitles] = useState(false);
  const [limitScreenArea, setLimitScreenArea] = useState(false);
  const [quickSelectKey, setQuickSelectKey] = useState('Backspace');
  const [centerWorkflowAction, setCenterWorkflowAction] = useState('Close Menu');

  // 10 Recent Tasks across Nilo Services (Speak with Nilo, Scratchpad, Digital Lab, Books, etc.)
  const [tasks, setTasks] = useState<RecentTask[]>([
    {
      id: 'task-1',
      title: 'Photosynthesis & ATP Yield',
      service: 'Speak with Nilo',
      serviceType: 'speak',
      timeAgo: '5m ago',
      shortcut: 'Control+1',
      tags: ['biology', 'oral-exam'],
      status: '82% Mastery Verified',
      bound: true,
    },
    {
      id: 'task-2',
      title: 'Quadratic Roots & Factoring',
      service: 'Scratchpad',
      serviceType: 'scratchpad',
      timeAgo: '18m ago',
      shortcut: 'Control+2',
      tags: ['maths', 'algebra'],
      status: 'All steps verified',
      bound: true,
    },
    {
      id: 'task-3',
      title: 'O₂ Evolution Rate Sandbox',
      service: 'Digital Lab',
      serviceType: 'digitallab',
      timeAgo: '42m ago',
      shortcut: 'Control+3',
      tags: ['science', 'simulation'],
      status: 'Experiment saved',
      bound: true,
    },
    {
      id: 'task-4',
      title: 'CBSE Ch 6: Life Processes',
      service: 'Books',
      serviceType: 'books',
      timeAgo: '1h ago',
      shortcut: 'Control+4',
      tags: ['class-10', 'ncert'],
      status: 'Chapter 2 / 5 completed',
      bound: true,
    },
    {
      id: 'task-5',
      title: 'Geometry Math Dash (Lvl 3)',
      service: 'Concept Games',
      serviceType: 'games',
      timeAgo: '2h ago',
      shortcut: 'Control+5',
      tags: ['arcade', 'speed'],
      status: 'High score: 1,420',
      bound: true,
    },
    {
      id: 'task-6',
      title: 'Faraday’s Induction Derivation',
      service: 'Speak with Nilo',
      serviceType: 'speak',
      timeAgo: '3h ago',
      shortcut: 'Control+6',
      tags: ['physics', 'electromagnetism'],
      status: 'Needs 1 prerequisite fix',
      bound: true,
    },
    {
      id: 'task-7',
      title: 'Trigonometric Identities Canvas',
      service: 'Scratchpad',
      serviceType: 'scratchpad',
      timeAgo: '5h ago',
      shortcut: 'Control+7',
      tags: ['maths', 'geometry'],
      status: 'Draft canvas saved',
      bound: true,
    },
    {
      id: 'task-8',
      title: 'Acid-Base Titration Curves',
      service: 'Digital Lab',
      serviceType: 'digitallab',
      timeAgo: 'Yesterday',
      shortcut: 'Control+8',
      tags: ['chemistry', 'kinetics'],
      status: 'pH graph exported',
      bound: true,
    },
    {
      id: 'task-9',
      title: 'CBSE Ch 9: Light & Reflection',
      service: 'Books',
      serviceType: 'books',
      timeAgo: 'Yesterday',
      shortcut: 'Control+9',
      tags: ['class-10', 'optics'],
      status: 'Ex-libris shelved',
      bound: true,
    },
    {
      id: 'task-10',
      title: 'Thermodynamics Dialogue',
      service: 'Socratic Chat',
      serviceType: 'chat',
      timeAgo: '2 days ago',
      shortcut: 'Control+0',
      tags: ['physics', 'socratic'],
      status: '12 turns discussed',
      bound: true,
    },
  ]);

  const menus = tasks;
  const setMenus = setTasks;

  const activeTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId) || tasks[0];
  }, [tasks, selectedTaskId]);
  const activeMenu = activeTask;

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(t => t.title.toLowerCase().includes(q) || t.service.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q)));
  }, [tasks, searchQuery]);
  const filteredMenus = filteredTasks;

  // Radial Menu Nodes (8 items, 45° step starting from top 12 o'clock)
  const radialNodes: RadialNode[] = [
    { id: 0, label: 'Chat', angle: 0, icon: 'chat', description: 'AI Chat & Socratic Tutor', featureKey: 'chat' },
    { id: 1, label: 'Resources', angle: 45, icon: 'resources', description: 'Verified study guides & formula sheets', featureKey: 'resources' },
    { id: 2, label: 'Next Topic', angle: 90, icon: 'arrow-right', description: 'Jump forward in syllabus', featureKey: 'next' },
    { id: 3, label: 'Scratchpad', angle: 135, icon: 'clipboard', description: 'Multimodal math canvas & step solver', featureKey: 'scratchpad' },
    { id: 4, label: 'Video Lessons', angle: 180, icon: 'play', description: 'Targeted visual concept fixes', featureKey: 'video' },
    { id: 5, label: 'Digital Lab', angle: 225, icon: 'flask', description: 'Virtual science simulation workbench', featureKey: 'digitallab' },
    { id: 6, label: 'Previous Topic', angle: 270, icon: 'arrow-left', description: 'Review prerequisites', featureKey: 'prev' },
    { id: 7, label: 'Games', angle: 315, icon: 'games', description: 'Interactive concept arcade games', featureKey: 'games' },
  ];

  // Radial geometry math - Scaled up generously for prominent presence
  const RADIUS = 236; // Distance from center in pixels

  const handleCenterOrbClick = () => {
    if (purplePhase !== 'idle') return;
    setPurplePhase('sliding'); // Living orb drops full down off screen

    setTimeout(() => {
      setPurplePhase('peeping'); // Scales up & neatly peeps from half from bottom of screen!
    }, 550);
  };

  const handleResetOrb = () => {
    setPurplePhase('idle');
  };

  const handleRadialClick = (node: RadialNode) => {
    setActiveRadialNode(node.id);
    switch (node.featureKey) {
      case 'chat':
        setActiveFeature('chat');
        break;
      case 'resources':
        setActiveFeature('resources');
        break;
      case 'games':
        setActiveFeature('games');
        break;
      case 'scratchpad':
        setActiveFeature('scratchpad');
        break;
      case 'video':
        setActiveFeature('video');
        break;
      case 'digitallab':
        setActiveFeature('digitallab');
        break;
      case 'next':
        setSelectedMenuId((prev) => {
          const idx = menus.findIndex(m => m.id === prev);
          const nextIdx = (idx + 1) % menus.length;
          return menus[nextIdx].id;
        });
        break;
      case 'prev':
        setSelectedMenuId((prev) => {
          const idx = menus.findIndex(m => m.id === prev);
          const prevIdx = (idx - 1 + menus.length) % menus.length;
          return menus[prevIdx].id;
        });
        break;
    }
  };

  const NEW_TASK_TEMPLATES: Array<Omit<RecentTask, 'id' | 'timeAgo'>> = [
    {
      title: 'DNA Replication & Polymerase',
      service: 'Speak with Nilo',
      serviceType: 'speak',
      shortcut: 'Control+1',
      tags: ['genetics', 'oral-exam'],
      status: 'In progress',
      bound: true,
    },
    {
      title: 'Integration by Parts Canvas',
      service: 'Scratchpad',
      serviceType: 'scratchpad',
      shortcut: 'Control+2',
      tags: ['calculus', 'derivation'],
      status: 'Draft canvas saved',
      bound: true,
    },
    {
      title: 'Photoelectric Effect Sandbox',
      service: 'Digital Lab',
      serviceType: 'digitallab',
      shortcut: 'Control+3',
      tags: ['quantum', 'simulation'],
      status: 'Frequency sweep completed',
      bound: true,
    },
    {
      title: 'CBSE Ch 10: Human Eye & Spectrum',
      service: 'Books',
      serviceType: 'books',
      shortcut: 'Control+4',
      tags: ['class-10', 'physics'],
      status: 'Page 142 bookmarked',
      bound: true,
    },
    {
      title: 'Trig Orbit Velocity Game',
      service: 'Concept Games',
      serviceType: 'games',
      shortcut: 'Control+5',
      tags: ['arcade', 'maths'],
      status: 'High score: 2,150',
      bound: true,
    },
    {
      title: 'Entropy & Statistical Mechanics',
      service: 'Socratic Chat',
      serviceType: 'chat',
      shortcut: 'Control+6',
      tags: ['thermodynamics', 'socratic'],
      status: '8 turns discussed',
      bound: true,
    },
  ];

  const handleAddTask = () => {
    const template = NEW_TASK_TEMPLATES[Math.floor(Math.random() * NEW_TASK_TEMPLATES.length)];
    const newTask: RecentTask = {
      ...template,
      id: `task-${Date.now()}`,
      timeAgo: 'Just now',
    };
    // Always keep strictly 10 recent tasks
    setTasks(prev => [newTask, ...prev.filter(t => t.id !== newTask.id)].slice(0, 10));
    setSelectedTaskId(newTask.id);
  };
  const handleAddMenu = handleAddTask;

  const handleDeleteMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tasks.length <= 1) return;
    setTasks(prev => prev.filter(m => m.id !== id));
    if (selectedTaskId === id) {
      const remaining = tasks.filter(m => m.id !== id);
      setSelectedTaskId(remaining[0].id);
    }
  };

  const handleOpenTask = (task: RecentTask) => {
    switch (task.serviceType) {
      case 'speak':
        handleCenterOrbClick();
        break;
      case 'scratchpad':
        setActiveFeature('scratchpad');
        break;
      case 'digitallab':
        setActiveFeature('digitallab');
        break;
      case 'books':
        setActiveFeature('resources');
        break;
      case 'games':
        setActiveFeature('games');
        break;
      case 'chat':
        setActiveFeature('chat');
        break;
      default:
        break;
    }
  };

  // Render Service Icons with sleek gradients and clear Nilo branding
  const renderServiceIcon = (type: string, size: 'small' | 'large' = 'small') => {
    const isLg = size === 'large';
    const containerClasses = isLg
      ? 'w-14 h-14 rounded-2xl flex items-center justify-center shadow-md'
      : 'w-8 h-8 rounded-xl flex items-center justify-center shadow-xs';
    const iconClasses = isLg ? 'w-7 h-7 stroke-[2.2]' : 'w-4 h-4 stroke-[2.2]';

    switch (type) {
      case 'speak':
        return (
          <div className={`${containerClasses} bg-gradient-to-tr from-[#651A3B] to-[#EC4899] text-white`} title="Speak with Nilo">
            <Mic className={iconClasses} />
          </div>
        );
      case 'scratchpad':
        return (
          <div className={`${containerClasses} bg-gradient-to-tr from-[#4F46E5] to-[#38BDF8] text-white`} title="Scratchpad">
            <Pencil className={iconClasses} />
          </div>
        );
      case 'digitallab':
        return (
          <div className={`${containerClasses} bg-gradient-to-tr from-[#059669] to-[#10B981] text-white`} title="Digital Lab">
            <FlaskConical className={iconClasses} />
          </div>
        );
      case 'books':
        return (
          <div className={`${containerClasses} bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white`} title="Books & Resources">
            <BookOpen className={iconClasses} />
          </div>
        );
      case 'games':
        return (
          <div className={`${containerClasses} bg-gradient-to-tr from-[#7C3AED] to-[#D946EF] text-white`} title="Concept Games">
            <Gamepad2 className={iconClasses} />
          </div>
        );
      case 'chat':
        return (
          <div className={`${containerClasses} bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] text-white`} title="Socratic Chat">
            <MessageSquare className={iconClasses} />
          </div>
        );
      default:
        return (
          <div className={`${containerClasses} bg-[#8E2856] text-white`}>
            <Sparkles className={iconClasses} />
          </div>
        );
    }
  };

  const renderMenuIcon = (type: string) => renderServiceIcon(type, 'small');

  // Render Radial Node Icon
  const renderRadialIcon = (icon: RadialNode['icon']) => {
    switch (icon) {
      case 'chat':
        return <MessageSquare className="w-6 h-6 text-white stroke-[2.2]" />;
      case 'resources':
        return <BookOpen className="w-6 h-6 text-white stroke-[2.2]" />;
      case 'arrow-right':
        return <ArrowRight className="w-6 h-6 text-white stroke-[2.6]" />;
      case 'clipboard':
        return <ClipboardList className="w-6 h-6 text-white stroke-[2.2]" />;
      case 'play':
        return <Play className="w-6 h-6 text-white fill-white ml-0.5" />;
      case 'flask':
        return <FlaskConical className="w-6 h-6 text-white stroke-[2.2]" />;
      case 'arrow-left':
        return <ArrowLeft className="w-6 h-6 text-white stroke-[2.6]" />;
      case 'games':
        return <Gamepad2 className="w-6 h-6 text-white stroke-[2.2]" />;
    }
  };

  // ── SEPARATE PAGE ROUTING: When clicking an individual sub-menu, open cleanly in its OWN SEPARATE PAGE ──
  if (activeFeature === 'scratchpad') {
    return <ScratchpadView onBack={() => setActiveFeature(null)} />;
  }

  if (activeFeature === 'resources') {
    return (
      <ResourcesView
        onBack={() => setActiveFeature(null)}
        onSelectTopic={(t) => {
          setActiveFeature(null);
          handleCenterOrbClick();
        }}
      />
    );
  }

  if (activeFeature === 'chat') {
    return <ChatView onBack={() => setActiveFeature(null)} />;
  }

  if (activeFeature === 'games') {
    return <GamesView onBack={() => setActiveFeature(null)} />;
  }

  if (activeFeature === 'video') {
    return <VideoLessonsView onBack={() => setActiveFeature(null)} />;
  }

  if (activeFeature === 'digitallab') {
    return <DigitalLabView onBack={() => setActiveFeature(null)} />;
  }

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none text-[#2C2936] font-sans"
      style={{
        background: `
          radial-gradient(circle at 10% 25%, rgba(254, 230, 242, 0.8) 0%, transparent 45%),
          radial-gradient(circle at 90% 18%, rgba(228, 242, 255, 0.8) 0%, transparent 45%),
          radial-gradient(circle at 50% 85%, rgba(243, 232, 255, 0.85) 0%, transparent 50%),
          radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.96) 0%, transparent 60%),
          linear-gradient(135deg, #FAF8FE 0%, #F8F5FB 50%, #FAF8FE 100%)
        `,
      }}
    >
      {/* =========================================================================
          1. EXTREME LEFT VERTICAL RAIL (Width: 50px)
         ========================================================================= */}
      <aside className={`fixed top-0 left-0 w-[52px] h-full flex flex-col items-center justify-between py-4 border-r border-[#EBE6F0] bg-white/40 backdrop-blur-md z-30 transition-transform duration-600 ease-in-out ${
        isMeltActive ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
      }`}>
        <div className="flex flex-col items-center gap-4">
          {/* Cherry Blossom / Nilo Logo */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#651A3B] to-[#8E2856] flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform" title="Nilo Home">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
              <path d="M12 2C10.5 5 8 7 5 7C7 9.5 7 12 5 14.5C8 14.5 10.5 16.5 12 19.5C13.5 16.5 16 14.5 19 14.5C17 12 17 9.5 19 7C16 7 13.5 5 12 2Z" />
            </svg>
          </div>

          <div className="w-5 h-[1px] bg-slate-200/80 my-1" />

          {/* Left Vertical Action Icons */}
          <button
            onClick={() => setIsPinnedOpen(prev => !prev)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isPinnedOpen ? 'bg-purple-100 text-[#7C5CFF]' : 'text-slate-500 hover:text-slate-800 hover:bg-white/80'
            }`}
            title="Pin / Keep Radial Menu Open"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveFeature('resources')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-purple-600 hover:bg-white/80 transition-all cursor-pointer"
            title="Study Guides & Resources"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={handleAddMenu}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-purple-600 hover:bg-white/80 transition-all cursor-pointer"
            title="Create New Task"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom subtle settings icon */}
        <button
          onClick={onLogout}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          title="Sign Out / Exit"
        >
          <X className="w-4 h-4" />
        </button>
      </aside>

      {/* =========================================================================
          2. LEFT MENU LIST ("RECENT TASKS") (Width: 260px)
         ========================================================================= */}
      <section className={`fixed top-0 left-[52px] w-64 h-full flex flex-col border-r border-[#EBE6F0] bg-white/60 backdrop-blur-lg z-20 transition-transform duration-600 ease-in-out ${
        isMeltActive ? '-translate-x-[calc(100%+52px)] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
      }`}>
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#EBE6F0]/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[15px] tracking-tight text-[#1E1926]">
              Recent Tasks
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {filteredTasks.length}
            </span>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('kando-search-input');
              el?.focus();
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
            title="Search Recent Tasks"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar input */}
        <div className="px-3 pt-2.5 pb-1">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs shadow-xs focus-within:border-purple-400 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              id="kando-search-input"
              type="text"
              placeholder="Search recent tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-[#2C2936] placeholder:text-slate-400 text-xs"
            />
          </div>
        </div>

        {/* Task Cards Stack (Strictly 10 items) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filteredTasks.map((task) => {
            const isSelected = task.id === selectedTaskId;
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                onDoubleClick={() => handleOpenTask(task)}
                className={`group relative rounded-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#FAF2F6] border-[#8E2856] shadow-[0_4px_16px_rgba(142,40,86,0.14)] ring-1 ring-[#8E2856]/40'
                    : 'bg-white/85 hover:bg-white border-white/80 hover:border-slate-200 shadow-xs'
                }`}
                title={`Double-click to open in ${task.service}`}
              >
                {/* Left: Icon + Title & Subtitle */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    {renderServiceIcon(task.serviceType, 'small')}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold tracking-tight text-[#1E1926] truncate">
                      {task.title}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1.5">
                      <span className="text-purple-900/85 font-semibold">{task.service}</span>
                      <span className="text-slate-300">•</span>
                      <span>{task.timeAgo}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Actions on Selected Card */}
                {isSelected ? (
                  <div className="flex items-center gap-1 shrink-0 text-[#6B6678]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTask(task);
                      }}
                      className="p-1 rounded-md text-[#8E2856] hover:bg-pink-100/60 transition-colors"
                      title={`Open in ${task.service}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const dupTask: RecentTask = {
                          ...task,
                          id: `task-${Date.now()}`,
                          title: `${task.title} (Copy)`,
                          timeAgo: 'Just now',
                        };
                        setTasks(prev => [dupTask, ...prev].slice(0, 10));
                        setSelectedTaskId(dupTask.id);
                      }}
                      className="p-1 rounded-md hover:text-[#8E2856] hover:bg-pink-100/60 transition-colors"
                      title="Duplicate Task"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteMenu(task.id, e)}
                      className="p-1 rounded-md hover:text-red-600 hover:bg-red-100/60 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Bottom Action Buttons: + Add Task & Export */}
        <div className="p-3 border-t border-[#EBE6F0]/70 flex items-center gap-2 shrink-0 bg-white/40">
          <button
            onClick={handleAddTask}
            className="flex-1 py-2 px-3 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-[12px] font-bold text-slate-700 hover:text-purple-700 shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => {}}
            className="p-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-600 hover:text-purple-700 shadow-xs transition-colors cursor-pointer"
            title="Export Tasks"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          3. CENTER CONTROLS & RADIAL STAGE (Strictly Center-Anchored at 50vw)
         ========================================================================= */}
      
      {/* ── Top Center Minimalist Toolbar ── */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_4px_20px_rgba(124,92,255,0.08)] transition-all duration-500 ease-in-out ${
        (isMeltActive || effectiveRadialOpen) ? '-translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}>
        <button
          onClick={() => setActiveFeature('resources')}
          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          title="Study Guides & Resources"
        >
          <GraduationCap className="w-4 h-4" />
        </button>
        <button
          onClick={() => {}}
          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          title="Information & About"
        >
          <Info className="w-4 h-4" />
        </button>
        <button
          onClick={() => {}}
          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          title="Palette / Theme"
        >
          <Palette className="w-4 h-4" />
        </button>
        <button
          onClick={() => {}}
          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={onNavigateToExplore}
          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          title="Trophies / Arcade"
        >
          <Trophy className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />
        <button
          onClick={() => {}}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => {}}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── CONCENTRIC AMBIENT ACOUSTIC PURPLE RINGS ON HOVER (Strictly behind menu items at z-15) ── */}
      {isHoveredOrPurple && !isMeltActive && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15 flex items-center justify-center">
          <div className="w-[280px] h-[280px] rounded-full border-2 border-purple-400/45 animate-pulse" />
          <div className="absolute w-[350px] h-[350px] rounded-full border border-purple-300/30 animate-pulse" style={{ animationDuration: '2.5s' }} />
        </div>
      )}

      {/* ── THE LIVING ExoOrb (Center at z-20 so it stays strictly BEHIND the z-40 radial menu items) ── */}
      <div
        onMouseEnter={handleOrbEnter}
        onMouseLeave={handleStageLeave}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (purplePhase === 'idle') {
            handleCenterOrbClick();
          } else if (purplePhase === 'peeping') {
            handleResetOrb();
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (purplePhase === 'idle') {
            handleCenterOrbClick();
          } else if (purplePhase === 'peeping') {
            handleResetOrb();
          }
        }}
        className={`fixed left-1/2 -translate-x-1/2 flex flex-col items-center justify-center cursor-pointer select-none ${
          purplePhase === 'peeping' ? 'z-50' : 'z-20'
        }`}
        style={{
          top: purplePhase === 'idle'
            ? '50%'
            : purplePhase === 'sliding'
            ? 'calc(100% + 160px)' // Drops FULL DOWN off the screen cleanly!
            : '100%', // Sits cleanly on bottom edge, top half peeping up!
          transform: purplePhase === 'idle'
            ? 'translate(-50%, -50%) scale(1.05)'
            : purplePhase === 'sliding'
            ? 'translate(-50%, 0) scale(0.85, 1.4)' // Liquid teardrop melting straight down
            : 'translate(-50%, -46%) scale(2.4)', // Big smooth dome peeping half from bottom floor
          transition: purplePhase === 'sliding'
            ? 'top 0.55s cubic-bezier(0.55, 0, 0.9, 0.7), transform 0.55s cubic-bezier(0.55, 0, 0.9, 0.7)'
            : purplePhase === 'peeping'
            ? 'top 0.6s cubic-bezier(0.2, 0.9, 0.35, 1.25), transform 0.6s cubic-bezier(0.2, 0.9, 0.35, 1.25)'
            : 'top 0.65s cubic-bezier(0.34, 1.4, 0.64, 1), transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1)',
          willChange: 'top, transform',
        }}
        title={
          purplePhase === 'idle'
            ? "Click to melt orb & open Nilo Voice Agent"
            : purplePhase === 'peeping'
            ? "Click orb to return to menu"
            : undefined
        }
      >
        <ExoOrb
          size="md"
          showPedestal={false}
          showSpeechBubble={false}
          interactive={true}
          isListening={isHoveredOrPurple || isMeltActive}
          subLabel=""
          className="!my-0 pointer-events-auto"
          onPointerDown={(e) => {
            e.stopPropagation();
            if (purplePhase === 'idle') {
              handleCenterOrbClick();
            } else if (purplePhase === 'peeping') {
              handleResetOrb();
            }
          }}
        />
      </div>

      {/* ── CENTRAL RADIAL MENU NODES (Unified 680px interactive stage at z-40 IN FRONT of orb, never closes when navigating to sub-elements) ── */}
      <div
        onMouseMove={handleStageMouseMove}
        onMouseLeave={handleStageLeave}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full flex items-center justify-center z-40 ${
          isMeltActive ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        {/* Clickable center hit target on the stage itself */}
        {!isMeltActive && (
          <div
            onMouseEnter={handleOrbEnter}
            onClick={(e) => {
              e.stopPropagation();
              handleCenterOrbClick();
            }}
            className="absolute w-48 h-48 rounded-full cursor-pointer z-45"
            title="Click to melt orb & open Nilo Voice Agent"
          />
        )}

        {/* Subtle faint orbital guide ring visible when radial menu blooms */}
        <div
          className={`absolute w-[472px] h-[472px] rounded-full border border-pink-300/30 pointer-events-none transition-all duration-500 ease-out ${
            !isMeltActive && effectiveRadialOpen
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-75 rotate-45'
          }`}
        />

        {/* Symmetrical 8 Radial Nodes Orbiting Around Center Orb */}
        {radialNodes.map((node) => {
          const rad = ((node.angle - 90) * Math.PI) / 180;
          const x = Math.round(Math.cos(rad) * RADIUS);
          const y = Math.round(Math.sin(rad) * RADIUS);
          const isHovered = hoveredRadialNode === node.id;
          const isActive = activeRadialNode === node.id;

          const isShown = !isMeltActive && effectiveRadialOpen;
          const staggerDelay = isShown ? `${node.id * 24}ms` : '0ms';

          return (
            <div
              key={node.id}
              onMouseEnter={() => {
                if (leaveTimerRef.current) {
                  clearTimeout(leaveTimerRef.current);
                  leaveTimerRef.current = null;
                }
                setHoveredRadialNode(node.id);
              }}
              onMouseLeave={() => setHoveredRadialNode(null)}
              onClick={() => handleRadialClick(node)}
              className="absolute flex items-center justify-center cursor-pointer select-none group pointer-events-auto z-40"
              style={{
                transform: isShown
                  ? `translate(${x}px, ${y}px) scale(${isHovered || isActive ? 1.15 : 1})`
                  : 'translate(0px, 0px) scale(0)',
                opacity: isShown ? 1 : 0,
                pointerEvents: isShown ? 'auto' : 'none',
                transitionProperty: 'transform, opacity, filter',
                transitionDuration: isShown ? '420ms' : '220ms',
                transitionTimingFunction: isShown
                  ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                  : 'cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: staggerDelay,
                willChange: 'transform, opacity',
              }}
            >
              {/* Outer Gear Teeth (8 circular petal cogs) */}
              <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out ${
                  isHovered ? 'rotate-45' : 'rotate-0'
                }`}
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((cogAngle) => {
                  const cogRad = (cogAngle * Math.PI) / 180;
                  const cogDist = isHovered ? 43 : 38;
                  const cx = Math.cos(cogRad) * cogDist;
                  const cy = Math.sin(cogRad) * cogDist;
                  return (
                    <div
                      key={cogAngle}
                      className="absolute rounded-full transition-all duration-300"
                      style={{
                        width: isHovered ? '13px' : '10px',
                        height: isHovered ? '13px' : '10px',
                        transform: `translate(${cx}px, ${cy}px)`,
                        background: isHovered
                          ? '#8E2856'
                          : isActive
                          ? '#A43768'
                          : '#9DA4B0',
                        opacity: isHovered ? 0.95 : 0.8,
                      }}
                    />
                  );
                })}
              </div>

              {/* Central Circular Node Body */}
              <div
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                  isHovered
                    ? 'bg-[#8E2856] scale-105 shadow-[0_6px_20px_rgba(142,40,86,0.35)]'
                    : isActive
                    ? 'bg-[#A43768] shadow-[0_4px_16px_rgba(164,55,104,0.3)]'
                    : 'bg-[#9DA4B0] hover:bg-[#8F96A3]'
                }`}
              >
                <div className="absolute inset-0.5 rounded-full border border-white/30 pointer-events-none" />
                <div className="transition-transform duration-200 group-hover:scale-105">
                  {renderRadialIcon(node.icon)}
                </div>
              </div>

              {/* ── Smart Side Label Tag (shows only page name beside the icon, never clipped or behind) ── */}
              {isHovered && !isMeltActive && (
                <div
                  className={`absolute z-55 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${
                    node.angle === 0
                      ? 'bottom-full mb-3 left-1/2 -translate-x-1/2'
                      : node.angle === 180
                      ? 'top-full mt-3 left-1/2 -translate-x-1/2'
                      : node.angle > 0 && node.angle < 180
                      ? 'left-full ml-3.5 top-1/2 -translate-y-1/2'
                      : 'right-full mr-3.5 top-1/2 -translate-y-1/2'
                  }`}
                >
                  <div className="px-3 py-1 rounded-full bg-[#1E1926]/95 text-white backdrop-blur-md shadow-2xl border border-white/20 text-xs font-bold tracking-tight flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                    <span>{node.label}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── UPWARD CONCENTRIC ACOUSTIC WAVES BEHIND THE PEEPING ORB ── */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-10 transition-opacity duration-500 ${
          purplePhase === 'peeping' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-t-full border-2 border-purple-400/40 animate-[bigAcousticWaves_2.2s_ease-out_infinite]" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[880px] h-[440px] rounded-t-full border border-purple-300/30 animate-[bigAcousticWaves_2.2s_ease-out_infinite]" style={{ animationDelay: '0.45s' }} />
          <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1040px] h-[520px] rounded-t-full border border-purple-200/20 animate-[bigAcousticWaves_2.2s_ease-out_infinite]" style={{ animationDelay: '0.9s' }} />
        </div>
      </div>

      {/* ── VOICE AGENT MODAL / POPUP (Connected from src/Voice/ when peeping) ── */}
      {purplePhase === 'peeping' && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 pb-48 overflow-y-auto animate-in fade-in duration-300">
          <VoiceAgent
            onClose={handleResetOrb}
            onNavigateToTopic={(t) => {
              handleResetOrb();
              onStartSession && onStartSession(t);
            }}
          />
        </div>
      )}

      {/* ── HELPER PILL: CLICK TO RETURN TO MENU (Visible only when peeping) ── */}
      {purplePhase === 'peeping' && (
        <button
          onClick={handleResetOrb}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-55 px-4 py-1.5 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/40 text-white font-bold text-xs shadow-lg tracking-wide cursor-pointer transition-all animate-in fade-in duration-300 hover:scale-105 active:scale-95"
        >
          Click orb to return to menu
        </button>
      )}

      {/* ── BOTTOM FLOATING "ADD MENU ITEMS" COLLAPSIBLE SHELF / DOCK ── */}
      <div className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center transition-all duration-500 ease-in-out ${
        (isMeltActive || effectiveRadialOpen) ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}>
        
        {/* Overhead Tab Badge: "Add Menu Items" (Clickable toggle button) */}
        <button
          onClick={() => setIsBottomShelfExpanded(prev => !prev)}
          className="group px-3.5 py-1 rounded-t-xl bg-[#989FAE] hover:bg-[#838B9B] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs mb-[-1px] z-10 flex items-center gap-1.5 cursor-pointer transition-colors"
          title={isBottomShelfExpanded ? "Click to collapse menu tools" : "Click to expand menu tools"}
        >
          <span>Add Menu Items</span>
          <ChevronDown
            className={`w-3 h-3 text-white transition-transform duration-300 ${
              isBottomShelfExpanded ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        {/* Main Frosted Glass Shelf Container */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col items-center ${
            isBottomShelfExpanded
              ? 'max-h-40 opacity-100 scale-100 translate-y-0'
              : 'max-h-0 opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/55 hover:bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
            {/* Top row of circular tools */}
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-full bg-[#A3AAB8] hover:bg-[#8D95A3] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Radial Submenu"
              >
                <div className="w-4 h-4 rounded-full border-2 border-dashed border-white" />
              </button>

              <button
                className="w-9 h-9 rounded-full bg-[#A3AAB8] hover:bg-[#8D95A3] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer font-mono font-bold text-xs"
                title="Command Line Action"
              >
                <Terminal className="w-4 h-4" />
              </button>

              <button
                className="w-9 h-9 rounded-full bg-[#A3AAB8] hover:bg-[#8D95A3] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Keyboard Shortcut"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              <button
                className="w-9 h-9 rounded-full bg-[#A3AAB8] hover:bg-[#8D95A3] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Directory Action"
              >
                <Folder className="w-4 h-4" />
              </button>

              <button
                className="w-9 h-9 rounded-full bg-[#A3AAB8] hover:bg-[#8D95A3] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Launch Application"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                className="w-9 h-9 rounded-full bg-[#A3AAB8] hover:bg-[#8D95A3] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Configure Node"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                className="w-9 h-9 rounded-full bg-[#A3AAB8] hover:bg-[#8D95A3] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Open URL"
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom mini tool row */}
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 rounded-full bg-[#A3AAB8] hover:bg-[#8D95A3] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs"
                title="Clipboard Action"
              >
                <ClipboardList className="w-3.5 h-3.5" />
              </button>

              <button
                className="w-8 h-8 rounded-full bg-[#A3AAB8] hover:bg-[#8D95A3] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-[11px]"
                title="Function Key F4"
              >
                F4
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. RIGHT INSPECTOR / PROPERTIES PANEL (Width: 320px)
         ========================================================================= */}
      <aside className={`fixed top-0 right-0 w-80 h-full flex flex-col border-l border-[#EBE6F0] bg-white/65 backdrop-blur-xl z-20 transition-transform duration-600 ease-in-out ${
        isMeltActive ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
      }`}>
        
        {/* Top Window Controls (—, □, ✕) */}
        <div className="h-9 px-3 flex items-center justify-end gap-2 shrink-0">
          <button
            className="w-4 h-4 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            className="w-4 h-4 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Maximize"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={onLogout}
            className="w-4 h-4 rounded flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-100/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Scrollable Inspector Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Header Preview Badge + Menu Title */}
          <div className="flex flex-col items-center pt-2 text-center">
            <div className="mb-2">
              {renderServiceIcon(activeTask.serviceType, 'large')}
            </div>

            <h2 className="text-base font-extrabold tracking-tight text-[#1E1926]">
              {activeTask.title}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                {activeTask.service}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {activeTask.timeAgo}
              </span>
            </div>

            {/* Quick Open in Service Button */}
            <button
              onClick={() => handleOpenTask(activeTask)}
              className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-[#651A3B] to-[#8E2856] hover:from-[#50142e] hover:to-[#782249] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in {activeTask.service}</span>
            </button>

            <div className="flex items-center gap-1.5 mt-3 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="w-8 h-[1px] bg-slate-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          </div>

          {/* Properties Form Rows */}
          <div className="space-y-3 pt-2">
            
            {/* Shortcut Input */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                Shortcut
                <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold">i</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeMenu.shortcut}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMenus(prev => prev.map(m => m.id === activeMenu.id ? { ...m, shortcut: val } : m));
                  }}
                  className="px-3 py-1 rounded-lg bg-white/90 border border-slate-200 text-slate-800 font-mono text-[11px] text-right focus:outline-none focus:border-purple-400 shadow-2xs"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Tags Input */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                Tags
                <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold">i</span>
              </span>
              <div className="flex items-center gap-1.5">
                {activeMenu.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-md bg-[#584D63] text-white text-[11px] font-medium flex items-center gap-1 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Collapsible Accordion: Menu Behavior */}
            <div className="border-t border-slate-200/80 pt-2.5">
              <button
                onClick={() => setMenuBehaviorOpen(prev => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-1 hover:text-purple-700 cursor-pointer"
              >
                <span>Menu Behavior</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuBehaviorOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
            </div>

            {/* Collapsible Accordion: Menu Conditions */}
            <div className="border-t border-slate-200/80 pt-2.5 space-y-2.5">
              <button
                onClick={() => setMenuConditionsOpen(prev => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-1 hover:text-purple-700 cursor-pointer"
              >
                <span>Menu Conditions</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuConditionsOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {menuConditionsOpen && (
                <div className="space-y-2 text-[11px] text-slate-500">
                  <p className="leading-relaxed">
                    You can bind multiple menus to the same shortcut and then choose under which conditions each menu should be shown.
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        Limit to Specific Apps
                        <span className="w-3 h-3 rounded-full bg-slate-200 text-slate-500 text-[9px] flex items-center justify-center">i</span>
                      </span>
                      <button
                        onClick={() => setLimitApps(prev => !prev)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          limitApps ? 'bg-purple-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          limitApps ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        Limit to Specific Window Titles
                        <span className="w-3 h-3 rounded-full bg-slate-200 text-slate-500 text-[9px] flex items-center justify-center">i</span>
                      </span>
                      <button
                        onClick={() => setLimitWindowTitles(prev => !prev)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          limitWindowTitles ? 'bg-purple-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          limitWindowTitles ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle 3 */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        Limit to Specific Screen Area
                        <span className="w-3 h-3 rounded-full bg-slate-200 text-slate-500 text-[9px] flex items-center justify-center">i</span>
                      </span>
                      <button
                        onClick={() => setLimitScreenArea(prev => !prev)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          limitScreenArea ? 'bg-purple-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          limitScreenArea ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Center-Click Workflow Box */}
            <div className="border border-slate-200/90 rounded-2xl p-3.5 bg-white/70 shadow-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Center-Click Workflow</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                The actions below will be executed when you click the center of the root menu.
              </p>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  Quick-select key
                  <span className="w-3 h-3 rounded-full bg-slate-200 text-slate-500 text-[9px] flex items-center justify-center">i</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
                    {quickSelectKey}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                </div>
              </div>

              {/* Close Menu Pill */}
              <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-slate-400" />
                  {centerWorkflowAction}
                </span>
                <button
                  onClick={() => {}}
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove Action"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* + Add Action button */}
              <button
                onClick={() => {}}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Action</span>
              </button>
            </div>

          </div>
        </div>
      </aside>

    </div>
  );
};
