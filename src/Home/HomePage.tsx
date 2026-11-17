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
  Pencil,
  Activity
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityMenu } from '../components/AccessibilityMenu';
import { AccessibilityIcon } from '../components/AccessibilityIcon';
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

interface FeatureGuideItem {
  title: string;
  badge: string;
  badgeColor: string;
  category: string;
  description: string;
  howToUse: string[];
  proTip?: string;
}

export const FEATURE_GUIDES: Record<string, FeatureGuideItem> = {
  'nilo-home': {
    title: 'Nilo Home',
    badge: 'Overview',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    category: 'Dashboard',
    description: 'Central learning dashboard with Feynman radial wheel, study session queue, and real-time focus metrics.',
    howToUse: [
      'Click to reset your view and return to the main radial wheel.',
      'Access all learning modules from the central circular navigation.',
      'Check your recent study queue and daily focus statistics.',
    ],
    proTip: 'Clicking here cleanly collapses any open sub-menu.',
  },
  'pin-menu': {
    title: 'Pin Radial Wheel',
    badge: 'Quick Navigation',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    category: 'Radial Control',
    description: 'Locks the 360° circular navigation wheel open so all 6 core learning tools stay visible without auto-collapsing.',
    howToUse: [
      'Click to lock the radial wheel in bloom mode.',
      'Freely move your mouse across the screen without losing your tools.',
      'Click again to unpin and allow automatic hover-bloom.',
    ],
    proTip: 'Perfect when jumping between tools and taking notes.',
  },
  'resources': {
    title: 'Study Guides & 3D Books',
    badge: 'Reference Library',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    category: 'Study Library',
    description: 'Interactive 3D bookshelf containing high-yield textbook chapter summaries, formulas, and flashcards.',
    howToUse: [
      'Click to enter the 3D interactive book library.',
      'Select subjects like Linear Equations, Cellular Biology, or Optics.',
      'Review verified Feynman summaries and launch focused problem sets.',
    ],
    proTip: 'Drag to rotate 3D book covers and preview chapter outlines.',
  },
  'accessibility': {
    title: 'Accessibility Options',
    badge: 'Inclusive Suite',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    category: 'Accessibility',
    description: 'Inclusive learning suite with Braille Nemeth math code, ASL sign language interpreter, and ADHD focus ruler.',
    howToUse: [
      'Click the person figure icon to open the accessibility menu.',
      'Toggle Braille or ASL to view draggable floating helpers on canvas.',
      'Enable Screen Narrator to speak text aloud when hovering or selecting.',
    ],
    proTip: 'All floating mini widgets can be dragged anywhere on screen.',
  },
  'add-task-rail': {
    title: 'Create New Task',
    badge: 'Task Manager',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    category: 'Productivity',
    description: 'Quickly start a fresh study session, open a blank math sandbox, or log a new homework objective.',
    howToUse: [
      'Click + to instantly create a new task card in your queue.',
      'Name your task and assign your preferred study mode.',
      'Double-click the card in the list to jump right in.',
    ],
    proTip: 'Duplicate tasks to replicate past problem sets.',
  },
  'scratchpad': {
    title: 'Math Sandbox',
    badge: 'Canvas & AI Tutor',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    category: 'STEM Tool',
    description: 'Interactive digital chalkboard with freehand handwriting, step-by-step algebra hints, and instant equation verification.',
    howToUse: [
      'Double-click to open the full Math Sandbox whiteboard.',
      'Use the Pen and Eraser tools to write equations or sketch graphs.',
      'Ask the AI tutor in the right chat panel to verify your solution steps.',
    ],
    proTip: 'Toggle grid lines on the top toolbar for precise graphs.',
  },
  'video': {
    title: 'Targeted Video Lessons',
    badge: 'Micro-Lectures',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    category: 'Visual Learning',
    description: 'Curated 3-5 minute animated concept lectures addressing specific knowledge gaps identified during study.',
    howToUse: [
      'Click to browse recommended concept animations for this topic.',
      'Watch high-yield visual breakdowns of difficult mechanisms.',
      'Complete the checkpoint question at the end to lock in retention.',
    ],
    proTip: 'Videos are automatically prioritized based on your weak spots.',
  },
  'digitallab': {
    title: 'Digital Science Lab',
    badge: 'Virtual Simulation',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    category: 'Laboratory',
    description: 'Interactive virtual science laboratory for running chemistry titrations, optics experiments, and physics simulations.',
    howToUse: [
      'Click to launch the 3D lab simulation apparatus.',
      'Adjust interactive sliders for concentration, wavelength, or temperature.',
      'Observe real-time simulated outputs and graph visualizations.',
    ],
    proTip: 'Use presets to quickly test standard textbook lab setups.',
  },
  'games': {
    title: 'Arcade Math Games',
    badge: 'Rhythm & Challenges',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    category: 'Gamified Practice',
    description: 'Fast-paced gamified challenges (Geometry Dash Math) combining music rhythm with arithmetic and algebraic obstacles.',
    howToUse: [
      'Click to enter the Arcade room and choose your game mode.',
      'Solve math checkpoints in rhythm to jump over hurdles.',
      'Maintain lives and build streaks to unlock achievements.',
    ],
    proTip: 'Use Spacebar or Left Click to jump at checkpoints.',
  },
  'chat': {
    title: 'Feynman AI Tutor Chat',
    badge: 'Socratic Dialogue',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    category: 'AI Assistant',
    description: 'Conversational dialogue agent that asks probing questions to help you explain concepts simply and find gaps.',
    howToUse: [
      'Open chat and type any difficult topic or problem.',
      'Explain your reasoning; the AI evaluates conceptual clarity.',
      'Follow guided hint breakdowns instead of getting direct answers.',
    ],
    proTip: 'Ask "Give me a practice problem" to test your mastery.',
  },
  'next': {
    title: 'Next Topic: Calvin Cycle & Electron Transport',
    badge: 'Curriculum Progression',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    category: 'Syllabus Navigator',
    description: 'Advance forward in your learning path to the next sequential mastery module and problem sets.',
    howToUse: [
      'Click to queue the next syllabus module.',
      'Auto-loads prerequisites and diagnostic practice questions.',
      'Syncs your progress with course milestones.',
    ],
    proTip: 'Completing the current checkpoint unlocks bonus challenge problems in the next chapter.',
  },
  'prev': {
    title: 'Previous Topic: Cellular Respiration Basics',
    badge: 'Foundations Review',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    category: 'Prerequisite Refresh',
    description: 'Jump back to review foundational concepts, previous chalkboard notes, and earlier quiz results.',
    howToUse: [
      'Click to review the previous chapter and foundational definitions.',
      'Check your prior mastery score and whiteboard solutions.',
      'Easily reinforce foundational concepts before continuing.',
    ],
    proTip: 'Quickly revisit earlier diagrams if you feel stuck on current concepts.',
  },
  'speak': {
    title: 'Voice-First Feynman Session',
    badge: 'Spoken AI Dialogue',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    category: 'Speech Verification',
    description: 'Spoken dialogue with the holographic ExoOrb to practice verbal explanations and get instantaneous speech verification.',
    howToUse: [
      'Click the center ExoOrb to start talking.',
      'Speak your explanation naturally out loud as if teaching a beginner.',
      'Exo transcribes, analyzes, and responds with constructive audio guidance.',
    ],
    proTip: 'Wear headphones for optimal acoustic echo cancellation.',
  },
  'system-usage': {
    title: 'Focus Guard & App Tracking',
    badge: 'Focus Analytics',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    category: 'Productivity Guard',
    description: 'Monitors background screen time on distracting applications during active study sessions to keep you in flow state.',
    howToUse: [
      'Review your daily breakdown of study vs entertainment apps.',
      'Track hours spent on YouTube, Netflix, or social apps.',
      'Set focus thresholds to maintain high study efficiency.',
    ],
    proTip: 'Focus Guard automatically pauses timers when you switch windows.',
  },
  'sign-out': {
    title: 'Sign Out / Exit',
    badge: 'Account',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    category: 'Session',
    description: 'Safely save your current session progress and return to the main welcome screen.',
    howToUse: [
      'Click to sign out of your account.',
      'All your canvas sketches and task history are saved automatically.',
    ],
  },
};

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
  const [isInspectorClosed, setIsInspectorClosed] = useState(false);
  const { isMenuOpen, toggleMenu, setIsMenuOpen } = useAccessibility();

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
  const nodeHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      }
    }, 380);
    if (nodeHoverTimerRef.current) {
      clearTimeout(nodeHoverTimerRef.current);
    }
    nodeHoverTimerRef.current = setTimeout(() => {
      setHoveredRadialNode(null);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
      if (nodeHoverTimerRef.current) {
        clearTimeout(nodeHoverTimerRef.current);
      }
    };
  }, []);

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

  // Currently inspected feature in the Right Inspector panel (swaps when hovering radial nodes around the orb)
  const inspectedOrbNode = hoveredRadialNode !== null
    ? radialNodes.find(n => n.id === hoveredRadialNode) || null
    : null;
  const inspectedOrbGuide = inspectedOrbNode
    ? FEATURE_GUIDES[inspectedOrbNode.featureKey] || null
    : null;

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

  // =========================================================================
  // 3D TACTILE SERVICE ICONS (High-End Material, Specular Lighting, 3D Depth)
  // =========================================================================

  const Icon3DSpeak = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-3d-speak" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB7185" />
          <stop offset="0.5" stopColor="#E11D48" />
          <stop offset="1" stopColor="#881337" />
        </linearGradient>
        <linearGradient id="mic-body-3d" x1="12" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.3" stopColor="#F1F5F9" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id="mic-mesh-3d" x1="12" y1="7" x2="20" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* 3D Squircle Base with Directional Lighting */}
      <rect x="1" y="1" width="30" height="30" rx="8.5" fill="url(#bg-3d-speak)" />
      {/* Top 3D Specular Light Rim */}
      <path d="M9 1.8H23C27 1.8 29.8 4.5 30.2 8.5" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M1.8 8.5C2.2 4.5 5 1.8 9 1.8" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      {/* Bottom Contact Shadow */}
      <path d="M2.5 23C3.5 27.5 6.5 30.2 11 30.2H21C25.5 30.2 28.5 27.5 29.5 23" stroke="#4C0519" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />

      {/* 3D Studio Microphone Head & Yoke */}
      <g>
        {/* Acoustic glow wave behind capsule */}
        <circle cx="16" cy="12" r="7" stroke="white" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 2" />
        {/* Capsule mesh */}
        <rect x="12" y="6" width="8" height="10" rx="4" fill="url(#mic-mesh-3d)" />
        {/* Chrome metallic band */}
        <rect x="11.5" y="10.8" width="9" height="1.4" rx="0.7" fill="#FFFFFF" />
        {/* Lower capsule body */}
        <path d="M12 12.2H20V14C20 16.2 18.2 18 16 18C13.8 18 12 16.2 12 14V12.2Z" fill="url(#mic-body-3d)" />
        {/* Specular highlight stripe */}
        <path d="M13.8 7.5V15.5" stroke="white" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.85" />
        {/* Yoke bracket */}
        <path d="M9.5 13.5C9.5 17.2 12.4 20 16 20C19.6 20 22.5 17.2 22.5 13.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        {/* Stem & base */}
        <path d="M16 20V24" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12.5 24.5H19.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </svg>
  );

  const Icon3DScratchpad = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-3d-scratch" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" />
          <stop offset="0.5" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id="pencil-facet-1-3d" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FEF08A" />
          <stop offset="1" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id="pencil-facet-2-3d" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8.5" fill="url(#bg-3d-scratch)" />
      <path d="M9 1.8H23C27 1.8 29.8 4.5 30.2 8.5" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M1.8 8.5C2.2 4.5 5 1.8 9 1.8" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M2.5 23C3.5 27.5 6.5 30.2 11 30.2H21C25.5 30.2 28.5 27.5 29.5 23" stroke="#0F172A" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />

      {/* 3D Angled Pencil with Eraser & Wood Tip */}
      <g>
        {/* Subtle coordinate ruler tick marks */}
        <path d="M6 24H26" stroke="#C7D2FE" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 2" strokeOpacity="0.7" />
        {/* Pink Eraser */}
        <path d="M22 6.5L25.5 10L23.5 12L20 8.5L22 6.5Z" fill="#FDA4AF" />
        {/* Silver Ferrule */}
        <path d="M20 8.5L23.5 12L22.2 13.3L18.7 9.8L20 8.5Z" fill="#F8FAFC" />
        {/* Pencil Body - Lit Facet */}
        <path d="M18.7 9.8L22.2 13.3L12.5 23L9 19.5L18.7 9.8Z" fill="url(#pencil-facet-1-3d)" />
        {/* Pencil Body - Shaded Facet */}
        <path d="M17 11.5L20.5 15L12.5 23L9 19.5L17 11.5Z" fill="url(#pencil-facet-2-3d)" opacity="0.6" />
        {/* Sharpened Wood Cone */}
        <path d="M9 19.5L12.5 23L7 25L9 19.5Z" fill="#FED7AA" />
        {/* Graphite Tip */}
        <path d="M7 25L8 23.5L8.5 24.5L7 25Z" fill="#0F172A" />
      </g>
    </svg>
  );

  const Icon3DDigitalLab = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-3d-lab" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="0.5" stopColor="#059669" />
          <stop offset="1" stopColor="#022C22" />
        </linearGradient>
        <linearGradient id="liquid-lab-3d" x1="8" y1="17" x2="24" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="0.6" stopColor="#2DD4BF" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8.5" fill="url(#bg-3d-lab)" />
      <path d="M9 1.8H23C27 1.8 29.8 4.5 30.2 8.5" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M1.8 8.5C2.2 4.5 5 1.8 9 1.8" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M2.5 23C3.5 27.5 6.5 30.2 11 30.2H21C25.5 30.2 28.5 27.5 29.5 23" stroke="#022C22" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />

      {/* 3D Glass Flask with Glowing Chemistry Liquid & Bubbles */}
      <g>
        {/* Flask Glass Outline & Depth */}
        <path d="M14 6H18V11L24.5 22C25.5 23.5 24.5 25.5 22.8 25.5H9.2C7.5 25.5 6.5 23.5 7.5 22L14 11V6Z" fill="#064E3B" fillOpacity="0.35" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
        {/* Luminous Liquid Solution */}
        <path d="M9.8 21.5L12 18C13 18.5 15 18 16.5 17.5C18 17 20 18.5 22.2 21.5C23 22.6 22.5 24.5 21 24.5H11C9.5 24.5 9 22.6 9.8 21.5Z" fill="url(#liquid-lab-3d)" />
        {/* Curved Specular Glass Glare */}
        <path d="M10 22L14.5 13V8" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.85" />
        <path d="M13 6H19" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        {/* Rising 3D Reaction Bubbles */}
        <circle cx="16" cy="14" r="1.3" fill="#E0F2FE" />
        <circle cx="13" cy="16.5" r="0.9" fill="#E0F2FE" />
        <circle cx="18" cy="11.5" r="0.7" fill="#E0F2FE" />
      </g>
    </svg>
  );

  const Icon3DBooks = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-3d-books" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="0.5" stopColor="#D97706" />
          <stop offset="1" stopColor="#78350F" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8.5" fill="url(#bg-3d-books)" />
      <path d="M9 1.8H23C27 1.8 29.8 4.5 30.2 8.5" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M1.8 8.5C2.2 4.5 5 1.8 9 1.8" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M2.5 23C3.5 27.5 6.5 30.2 11 30.2H21C25.5 30.2 28.5 27.5 29.5 23" stroke="#451A03" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />

      {/* 3D Open Textbook with Depth & Bookmark Ribbon */}
      <g>
        {/* Pages block rim */}
        <path d="M7 21C10 20 14 21 16 23C18 21 22 20 25 21V23C22 22 18 23 16 25C14 23 10 22 7 23V21Z" fill="#FEF3C7" />
        {/* Left page wing */}
        <path d="M7 9C10 8 14 9 16 11V22C14 20 10 19 7 20V9Z" fill="#FFFFFF" />
        <path d="M8.5 12H14" stroke="#CBD5E1" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M8.5 14.5H13" stroke="#CBD5E1" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M8.5 17H14" stroke="#CBD5E1" strokeWidth="0.9" strokeLinecap="round" />
        {/* Right page wing */}
        <path d="M25 9C22 8 18 9 16 11V22C18 20 22 19 25 20V9Z" fill="#F8FAFC" />
        <path d="M18 12H23.5" stroke="#CBD5E1" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M18 14.5H22.5" stroke="#CBD5E1" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M18 17H23.5" stroke="#CBD5E1" strokeWidth="0.9" strokeLinecap="round" />
        {/* Center spine seam */}
        <path d="M16 11V24" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
        {/* Hanging red bookmark ribbon */}
        <path d="M16 11V18L17.5 16.5L19 18V11" fill="#EF4444" />
      </g>
    </svg>
  );

  const Icon3DGames = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-3d-games" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C084FC" />
          <stop offset="0.5" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#3B0764" />
        </linearGradient>
        <linearGradient id="controller-body-3d" x1="7" y1="9" x2="25" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E2E8F0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8.5" fill="url(#bg-3d-games)" />
      <path d="M9 1.8H23C27 1.8 29.8 4.5 30.2 8.5" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M1.8 8.5C2.2 4.5 5 1.8 9 1.8" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M2.5 23C3.5 27.5 6.5 30.2 11 30.2H21C25.5 30.2 28.5 27.5 29.5 23" stroke="#2E1065" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />

      {/* 3D Ergonomic Game Controller with Gem Buttons */}
      <g>
        <path d="M9 11C7 11 5 13 5.5 17L6.8 22C7.2 23.5 8.8 24.2 10.2 23.2L13 21H19L21.8 23.2C23.2 24.2 24.8 23.5 25.2 22L26.5 17C27 13 25 11 23 11H9Z" fill="url(#controller-body-3d)" />
        <path d="M9.5 12.2H22.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.9" />
        {/* D-Pad */}
        <path d="M9 15.5H12M10.5 14V17" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
        {/* Gem Action Buttons */}
        <circle cx="21" cy="14" r="1.1" fill="#EF4444" />
        <circle cx="23" cy="16" r="1.1" fill="#3B82F6" />
        <circle cx="19" cy="16" r="1.1" fill="#10B981" />
        <circle cx="21" cy="18" r="1.1" fill="#F59E0B" />
      </g>
    </svg>
  );

  const Icon3DChat = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-3d-chat" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="0.5" stopColor="#0284C7" />
          <stop offset="1" stopColor="#082F49" />
        </linearGradient>
        <linearGradient id="chat-front-3d" x1="7" y1="11" x2="23" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F0F9FF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8.5" fill="url(#bg-3d-chat)" />
      <path d="M9 1.8H23C27 1.8 29.8 4.5 30.2 8.5" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M1.8 8.5C2.2 4.5 5 1.8 9 1.8" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M2.5 23C3.5 27.5 6.5 30.2 11 30.2H21C25.5 30.2 28.5 27.5 29.5 23" stroke="#082F49" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />

      {/* Layered 3D Speech Bubbles with Specular Glaze */}
      <g>
        {/* Back bubble */}
        <path d="M13 8H21C23.2 8 25 9.8 25 12V16C25 18.2 23.2 20 21 20H20.5L22 23L18.5 20H13C10.8 20 9 18.2 9 16V12C9 9.8 10.8 8 13 8Z" fill="#7DD3FC" fillOpacity="0.8" />
        {/* Front Glossy White Bubble */}
        <path d="M9 11H18C20.2 11 22 12.8 22 15V19C22 21.2 20.2 23 18 23H14L10 26V23H9C6.8 23 5 21.2 5 19V15C5 12.8 6.8 11 9 11Z" fill="url(#chat-front-3d)" />
        <path d="M9 12.2H18" stroke="white" strokeWidth="0.9" strokeLinecap="round" />
        {/* Dialogue Dots */}
        <circle cx="10.5" cy="17" r="1.1" fill="#0284C7" />
        <circle cx="13.5" cy="17" r="1.1" fill="#38BDF8" />
        <circle cx="16.5" cy="17" r="1.1" fill="#7C3AED" />
      </g>
    </svg>
  );

  const Icon3DDefault = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-3d-def" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6" />
          <stop offset="0.5" stopColor="#8E2856" />
          <stop offset="1" stopColor="#4A0424" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8.5" fill="url(#bg-3d-def)" />
      <path d="M9 1.8H23C27 1.8 29.8 4.5 30.2 8.5" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M1.8 8.5C2.2 4.5 5 1.8 9 1.8" stroke="white" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
      <path d="M2.5 23C3.5 27.5 6.5 30.2 11 30.2H21C25.5 30.2 28.5 27.5 29.5 23" stroke="#4A0424" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />

      {/* 3D Crystal Star */}
      <path d="M16 6C16 11 20 14 24 15C20 16 16 19 16 24C16 19 12 16 8 15C12 14 16 11 16 6Z" fill="#FFFFFF" />
      <circle cx="23" cy="8" r="1.3" fill="#FDE047" />
    </svg>
  );

  // Render Service Icons: Premium 3D tactile icons with continuous depth and specular rim
  const renderServiceIcon = (type: string, size: 'small' | 'large' = 'small') => {
    const isLg = size === 'large';
    const iconClass = isLg
      ? 'w-13 h-13 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform'
      : 'w-7 h-7 drop-shadow-xs transition-transform group-hover:scale-105';

    switch (type) {
      case 'speak':
        return <Icon3DSpeak className={iconClass} />;
      case 'scratchpad':
        return <Icon3DScratchpad className={iconClass} />;
      case 'digitallab':
        return <Icon3DDigitalLab className={iconClass} />;
      case 'books':
        return <Icon3DBooks className={iconClass} />;
      case 'games':
        return <Icon3DGames className={iconClass} />;
      case 'chat':
        return <Icon3DChat className={iconClass} />;
      default:
        return <Icon3DDefault className={iconClass} />;
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
      <aside className={`fixed top-0 left-0 w-[52px] h-full flex flex-col items-center justify-between py-4 border-r border-[#EBE6F0] bg-white/40 backdrop-blur-md z-30 transition-transform duration-600 ease-in-out ${isMeltActive ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        }`}>
        <div className="flex flex-col items-center gap-4">
          {/* Cherry Blossom / Nilo Logo */}
          <div
            onClick={() => {
              setActiveFeature(null);
              setIsPinnedOpen(false);
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#651A3B] to-[#8E2856] flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform"
            title="Nilo Home"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
              <path d="M12 2C10.5 5 8 7 5 7C7 9.5 7 12 5 14.5C8 14.5 10.5 16.5 12 19.5C13.5 16.5 16 14.5 19 14.5C17 12 17 9.5 19 7C16 7 13.5 5 12 2Z" />
            </svg>
          </div>

          <div className="w-5 h-[1px] bg-slate-200/80 my-1" />

          {/* Left Vertical Action Icons */}
          <button
            onClick={() => setIsPinnedOpen(prev => !prev)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isPinnedOpen ? 'bg-purple-100 text-[#7C5CFF]' : 'text-slate-500 hover:text-slate-800 hover:bg-white/80'
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

          {/* Accessibility Option - Just above + */}
          <button
            onClick={toggleMenu}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isMenuOpen
              ? 'bg-[#8E2856] text-white shadow-sm ring-2 ring-[#8E2856]/30'
              : 'text-slate-500 hover:text-[#8E2856] hover:bg-white/80'
              }`}
            title="Accessibility Options"
            aria-label="Accessibility Options"
          >
            <AccessibilityIcon className="w-4 h-4" />
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
          NEXT MENU: ACCESSIBILITY OPTIONS (Opens adjacent to the leftmost rail)
         ========================================================================= */}
      {isMenuOpen && (
        <div className="fixed top-0 left-[52px] h-full z-40 shadow-2xl">
          <AccessibilityMenu
            onClose={() => setIsMenuOpen(false)}
            onReadAloudCustomText="Welcome to Explaino Dashboard. You can select Feynman voice learning, solve math problems in the Sandbox, explore the Digital Science Lab, or play interactive educational games."
          />
        </div>
      )}

      {/* =========================================================================
          2. LEFT MENU LIST ("RECENT TASKS" 70% + "SYSTEM APP USAGE" 30%) (Width: 260px)
         ========================================================================= */}
      <section className={`fixed top-0 left-[52px] w-64 h-full flex flex-col border-r border-[#EBE6F0] bg-white/60 backdrop-blur-lg z-20 transition-transform duration-600 ease-in-out ${isMeltActive ? '-translate-x-[calc(100%+52px)] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        }`}>
        {/* ── TOP 70%: RECENT TASKS HISTORY (LIKE BEFORE) ── */}
        <div className="h-[70%] flex flex-col min-h-0 border-b border-[#EBE6F0]/80">
          {/* Header */}
          <div className="h-12 px-3.5 flex items-center justify-between border-b border-[#EBE6F0]/60 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[14px] tracking-tight text-[#1E1926]">
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
              className="p-1 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
              title="Search Recent Tasks"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Bar input */}
          <div className="px-2.5 pt-2 pb-1 shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs shadow-xs focus-within:border-purple-400 transition-colors">
              <Search className="w-3 h-3 text-slate-400 shrink-0" />
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

          {/* Task Cards Stack (Scrollable) with smooth bottom gradient fade */}
          <div className="relative flex-1 min-h-0">
            <div className="h-full overflow-y-auto px-2.5 py-1.5 pb-4 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filteredTasks.map((task) => {
                const isSelected = task.id === selectedTaskId;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    onDoubleClick={() => handleOpenTask(task)}
                    className={`group relative rounded-xl px-2.5 py-2 flex items-center justify-between cursor-pointer transition-all duration-150 border ${isSelected
                      ? 'bg-white border-[#8E2856]/40 shadow-xs ring-1 ring-[#8E2856]/20'
                      : 'bg-white/60 hover:bg-white border-transparent hover:border-slate-200/80 shadow-xs'
                      }`}
                    title={`Double-click to open in ${task.service}`}
                  >
                    {/* Left: Icon + Title & Subtitle */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0 flex items-center justify-center">
                        {renderServiceIcon(task.serviceType, 'small')}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12.5px] font-semibold text-[#1E1926] tracking-tight truncate group-hover:text-purple-950 transition-colors">
                          {task.title}
                        </span>
                        <span className="text-[10.5px] font-medium text-slate-400 truncate flex items-center gap-1.5">
                          <span className="text-slate-600 font-semibold">{task.service}</span>
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

            {/* Soft upward gradient overlay to prevent abrupt cut-off */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/95 via-white/60 to-transparent z-10" />
          </div>

          {/* Compact Add & Export toolbar at bottom of top 70% with soft backdrop glow */}
          <div className="relative z-10 p-2 border-t border-[#EBE6F0]/50 flex items-center gap-1.5 shrink-0 bg-white/70 backdrop-blur-md shadow-[0_-4px_16px_rgba(124,92,255,0.04)]">
            <button
              onClick={handleAddTask}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200/90 text-[11px] font-bold text-slate-700 hover:text-purple-700 shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Task</span>
            </button>
            <button
              onClick={() => { }}
              className="p-1.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200/90 text-slate-600 hover:text-purple-700 shadow-xs transition-colors cursor-pointer"
              title="Export Tasks"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── BOTTOM 30%: SYSTEM LEVEL APP USAGE (YOUTUBE, INSTAGRAM, NETFLIX) ── */}
        <div
          className="h-[30%] flex flex-col min-h-0 bg-white/45 backdrop-blur-md px-3 pt-2.5 pb-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-center justify-between pb-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-extrabold text-[12px] tracking-tight text-[#1E1926]">
                System App Usage
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="space-y-2 flex-1 justify-center flex flex-col">
            {/* 1. YouTube */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <div className="w-4 h-4 rounded bg-[#FF0000] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Play className="w-2 h-2 fill-white stroke-none ml-0.5" />
                  </div>
                  <span>YouTube</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">1h 45m</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">45%</span>
                </div>
              </div>
              <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full w-[45%]" />
              </div>
            </div>

            {/* 2. Instagram */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <div className="w-4 h-4 rounded bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <div className="w-2 h-2 border border-white rounded-[2px] flex items-center justify-center">
                      <div className="w-0.5 h-0.5 bg-white rounded-full" />
                    </div>
                  </div>
                  <span>Instagram</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">1h 10m</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">30%</span>
                </div>
              </div>
              <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full w-[30%]" />
              </div>
            </div>

            {/* 3. Netflix */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <div className="w-4 h-4 rounded bg-[#141414] flex items-center justify-center text-[#E50914] font-black text-[9px] shrink-0 shadow-xs">
                    N
                  </div>
                  <span>Netflix</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">35m</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">15%</span>
                </div>
              </div>
              <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#E50914] to-red-700 rounded-full w-[15%]" />
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[9px] text-slate-400 font-medium border-t border-slate-100 shrink-0">
            <span>Focus Guard Active</span>
            <span className="text-purple-600 font-semibold">3h 30m Total</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CENTER CONTROLS & RADIAL STAGE (Strictly Center-Anchored at 50vw)
         ========================================================================= */}

      {/* ── Top Center Minimalist Toolbar ── */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_4px_20px_rgba(124,92,255,0.08)] transition-all duration-500 ease-in-out ${(isMeltActive || effectiveRadialOpen) ? '-translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}>
        <button
          onClick={() => setActiveFeature('resources')}
          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          title="Study Guides & Resources"
        >
          <GraduationCap className="w-4 h-4" />
        </button>
        <button
          onClick={() => { }}
          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          title="Information & About"
        >
          <Info className="w-4 h-4" />
        </button>
        <button
          onClick={() => { }}
          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          title="Palette / Theme"
        >
          <Palette className="w-4 h-4" />
        </button>
        <button
          onClick={() => { }}
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
          onClick={() => { }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => { }}
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
        className={`fixed left-1/2 -translate-x-1/2 flex flex-col items-center justify-center cursor-pointer select-none ${purplePhase === 'peeping' ? 'z-50' : 'z-20'
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
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full flex items-center justify-center z-40 ${isMeltActive ? 'pointer-events-none' : 'pointer-events-auto'
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
          className={`absolute w-[472px] h-[472px] rounded-full border border-pink-300/30 pointer-events-none transition-all duration-500 ease-out ${!isMeltActive && effectiveRadialOpen
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
                if (nodeHoverTimerRef.current) {
                  clearTimeout(nodeHoverTimerRef.current);
                  nodeHoverTimerRef.current = null;
                }
                setHoveredRadialNode(node.id);
                setIsInspectorClosed(false);
              }}
              onMouseLeave={() => {
                if (nodeHoverTimerRef.current) {
                  clearTimeout(nodeHoverTimerRef.current);
                }
                nodeHoverTimerRef.current = setTimeout(() => {
                  setHoveredRadialNode(null);
                }, 240);
              }}
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
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out ${isHovered ? 'rotate-45' : 'rotate-0'
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
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${isHovered
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
                  className={`absolute z-55 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${node.angle === 0
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
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-10 transition-opacity duration-500 ${purplePhase === 'peeping' ? 'opacity-100' : 'opacity-0'
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
      <div className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center transition-all duration-500 ease-in-out ${(isMeltActive || effectiveRadialOpen) ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}>

        {/* Overhead Tab Badge: "Add Menu Items" (Clickable toggle button) */}
        <button
          onClick={() => setIsBottomShelfExpanded(prev => !prev)}
          className="group px-3.5 py-1 rounded-t-xl bg-[#989FAE] hover:bg-[#838B9B] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs mb-[-1px] z-10 flex items-center gap-1.5 cursor-pointer transition-colors"
          title={isBottomShelfExpanded ? "Click to collapse menu tools" : "Click to expand menu tools"}
        >
          <span>Add Menu Items</span>
          <ChevronDown
            className={`w-3 h-3 text-white transition-transform duration-300 ${isBottomShelfExpanded ? 'rotate-180' : 'rotate-0'
              }`}
          />
        </button>

        {/* Main Frosted Glass Shelf Container */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col items-center ${isBottomShelfExpanded
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
      <aside className={`fixed top-0 right-0 w-80 h-full flex flex-col border-l border-[#EBE6F0] bg-white/65 backdrop-blur-xl z-20 transition-transform duration-600 ease-in-out ${(isMeltActive || isInspectorClosed) ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        }`}>

          {/* Top Window Header */}
          <div className="h-10 px-4 flex items-center justify-between border-b border-[#EBE6F0]/60 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {inspectedOrbNode ? 'Feature Overview' : 'Task Details'}
            </span>
            <button
              onClick={() => setIsInspectorClosed(true)}
              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Inspector"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable Inspector Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {inspectedOrbNode ? (
                /* ── ORB FEATURE PREVIEW (Active when hovering over orb radial nodes like Chat, Scratchpad, etc.) ── */
                      <div className="space-y-4">
                        {/* Centered Icon + Title + Meta */}
                        <div className="flex flex-col items-center pt-2 pb-1 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#651A3B] to-[#8E2856] flex items-center justify-center shadow-md shadow-[#651A3B]/20 mb-3 text-white shrink-0">
                            {renderRadialIcon(inspectedOrbNode.icon)}
                          </div>

                            <h2 className="text-base font-extrabold tracking-tight text-[#1E1926] max-w-[260px] leading-snug min-h-[44px] flex items-center justify-center">
                              {inspectedOrbGuide?.title || inspectedOrbNode.label}
                            </h2>

                                <div className="flex items-center gap-1.5 mt-1.5 justify-center min-h-[22px]">
                                  <span className="text-[11px] font-semibold text-[#8E2856] bg-[#8E2856]/8 px-2.5 py-0.5 rounded-full border border-[#8E2856]/15">
                                    {inspectedOrbGuide?.badge || 'Study Tool'}
                                  </span>
                                  {inspectedOrbGuide?.category && (
                                      <span className="text-[11px] text-slate-500 font-medium">
                                        {inspectedOrbGuide.category}
                                      </span>
                  )}
                                    </div>

                                  {/* Primary Action Button */}
                                  <button
                                    onClick={() => handleRadialClick(inspectedOrbNode)}
                                    className="w-full mt-3.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#651A3B] to-[#8E2856] hover:from-[#541530] hover:to-[#792249] text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                                    <span>Launch {inspectedOrbNode.label}</span>
                                    <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-pink-200" />
                                  </button>
                                </div>

                                {/* Description Card */}
                                    <div className="w-full p-4 rounded-2xl bg-white/70 border border-[#EBE6F0] space-y-1.5 text-left shadow-2xs">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Description
                                      </span>
                                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                                        {inspectedOrbGuide?.description || inspectedOrbNode.description}
                                      </p>
                                    </div>

                                    {/* Step-by-Step How To Use */}
                                    {inspectedOrbGuide?.howToUse && inspectedOrbGuide.howToUse.length > 0 && (
                                          <div className="w-full p-4 rounded-2xl bg-white/70 border border-[#EBE6F0] space-y-2 text-left shadow-2xs">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                              How To Use
                                            </span>
                                              <div className="space-y-2 pt-0.5">
                                                {inspectedOrbGuide.howToUse.map((step, idx) => (
                                                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-snug">
                                                        <span className="w-4 h-4 rounded-full bg-[#8E2856]/10 text-[#8E2856] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                          {idx + 1}
                                                        </span>
                                                        <span>{step}</span>
                                                      </div>
                    ))}
                                                  </div>
                </div>
              )}

                                              {/* Pro Tip */}
                                              {inspectedOrbGuide?.proTip && (
                                                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/50 text-xs text-amber-900/90 text-left">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                                                      Tip
                                                    </span>
                                                    <p className="leading-snug text-[11.5px] text-slate-700">
                                                      {inspectedOrbGuide.proTip}
                                                    </p>
                                                  </div>
              )}
                                                </div>
                                              ) : (
            /* ── DEFAULT ACTIVE TASK INSPECTOR VIEW ("Photosynthesis & ATP Yield") ── */
                                                    <div className="space-y-4">
                                                      {/* Centered Icon + Title + Meta */}
                                                      <div className="flex flex-col items-center pt-2 pb-1 text-center">
                                                        <div className="w-14 h-14 flex items-center justify-center mb-3 shrink-0">
                                                          {renderServiceIcon(activeTask.serviceType, 'large')}
                                                        </div>

                                                          <h2 className="text-base font-extrabold tracking-tight text-[#1E1926] max-w-[260px] leading-snug min-h-[44px] flex items-center justify-center">
                                                            {activeTask.title}
                                                          </h2>

                                                              <div className="flex items-center gap-1.5 mt-1.5 justify-center min-h-[22px]">
                                                                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                                                                  {activeTask.service}
                                                                </span>
                                                                <span className="text-[11px] text-slate-400 font-medium">
                                                                  {activeTask.timeAgo}
                                                                </span>
                                                              </div>

                                                              {/* Primary Action Button */}
                                                              <button
                                                                onClick={() => handleOpenTask(activeTask)}
                                                                className="w-full mt-3.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#651A3B] to-[#8E2856] hover:from-[#541530] hover:to-[#792249] text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                                                              >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                                <span>Open in {activeTask.service}</span>
                                                              </button>
                                                          </div>

                                                          {/* Clean Overview Card */}
                                                          <div className="w-full p-4 rounded-2xl bg-white/70 border border-[#EBE6F0] space-y-1.5 text-left shadow-2xs">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                              Overview
                                                            </span>
                                                            <p className="text-xs text-slate-700 leading-relaxed font-normal">
                                                              {FEATURE_GUIDES[activeTask.serviceType]?.description ||
                                                                'Interactive study session module designed for deep conceptual retention and step-by-step verification.'}
                                                            </p>
                                                          </div>

                                                                    {/* Status & Details */}
                                                                    <div className="w-full p-4 rounded-2xl bg-white/70 border border-[#EBE6F0] space-y-3 text-left shadow-2xs">
                                                                      {activeTask.status && (
                                                                        <div>
                                                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                                            Session Status
                                                                          </span>
                                                                          <div className="flex items-center gap-2">
                                                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                            <span className="text-xs font-semibold text-slate-800">
                                                                              {activeTask.status}
                                                                            </span>
                                                                          </div>
                                                                        </div>
                )}

                                                                            {/* Tags */}
                                                                            {activeTask.tags && activeTask.tags.length > 0 && (
                                                                              <div>
                                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                                                                  Subject Tags
                                                                                </span>
                                                                                  <div className="flex flex-wrap gap-1.5">
                                                                                    {activeTask.tags.map((tag) => (
                                                                                      <span
                                                                                        key={tag}
                                                                                        className="px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-600 text-[11px] font-medium border border-slate-200/60"
                                                                                      >
                                                                                        #{tag}
                                                                                      </span>
                                                                                    ))}
                                                                                  </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
          )}
                                                                  </div>
      </aside>

                                                            </div>
                                                            );
};
