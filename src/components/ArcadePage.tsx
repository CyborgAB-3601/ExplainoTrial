import React, { useState, useRef } from 'react';
import { arcadeAudio } from '../utils/arcadeAudio';
import { GeometryDashMathGame } from './GeometryDashMathGame';
import { TrajectoryTitanGame } from '../Games/TrajectoryTitanGame';
import {
  Gamepad2,
  Play,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  Tv,
  CheckCircle2,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';

export interface ArcadePageProps {
  onBackToHome: () => void;
  onView3DModel: () => void;
  userName?: string;
  isNavbarClosed?: boolean;
  onToggleNavbar?: () => void;
}

interface GameItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Adventure' | 'Action' | 'Strategy' | 'Puzzle' | 'Sci-Fi' | 'Math' | 'Science' | 'Coding' | 'Physics' | 'Chemistry' | 'Biology' | 'History' | string;
  coverImg: string;
  trailerImg: string;
  about: string;
  ratings: {
    starGame: number | string;
    metacritic: number | string;
    userAvg: number | string;
  };
  level?: string;
  badge?: string;
  topic: string;
}

const GAMES_DATA: GameItem[] = [
  // Math Games
  {
    id: 'math-prodigy',
    title: 'Math Prodigy : Algebra Quest',
    subtitle: 'Equation Battles & Polynomial Realms',
    category: 'Math',
    coverImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=900',
    about: "Embark on an epic mathematical RPG where spells are cast by solving linear equations, factoring polynomials, and balancing matrix transformations. Defeat mythical numerical bosses across the Realm of Calculus.",
    ratings: {
      starGame: 9.8,
      metacritic: 94,
      userAvg: 9.6
    },
    level: 'Lv. 88',
    badge: 'TOP MATH',
    topic: 'Algebra, Functions & Polynomial Equations'
  },
  {
    id: 'geometry-dash',
    title: 'Geometry Dash : Dimensions',
    subtitle: 'Euclidean Angles & Vector Physics',
    category: 'Math',
    coverImg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=900',
    about: "Navigate rhythmic vector-based geometry obstacle courses. Master Pythagorean theorems, coordinate geometry, trigonometry wave harmonics, and 3D isometric spatial puzzles to beat world records.",
    ratings: {
      starGame: 9.6,
      metacritic: 91,
      userAvg: 9.4
    },
    level: 'Lv. 104',
    badge: 'GEOMETRY HIT',
    topic: 'Trigonometry & Spatial Coordinate Geometry'
  },
  {
    id: 'calculus-prime',
    title: 'Calculus Prime : Quantum Realm',
    subtitle: 'Derivatives & Integral Engine',
    category: 'Math',
    coverImg: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=900',
    about: "Control the speed and acceleration of a starship through differential calculus and calculate gravitational mass curves using definite integration in an immersive futuristic simulator.",
    ratings: {
      starGame: 9.9,
      metacritic: 96,
      userAvg: 9.7
    },
    level: 'Lv. 120',
    badge: 'CALCULUS MASTER',
    topic: 'Differential & Integral Calculus'
  },
  {
    id: 'number-theory',
    title: 'Number Theory : Cryptic Enigma',
    subtitle: 'Prime Numbers & Cryptography',
    category: 'Math',
    coverImg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=900',
    about: "Crack high-security RSA cipher vaults using prime factorization, modular arithmetic, and Fibonacci sequences. Play as an elite cryptanalyst in a cyberpunk world of cyber puzzles.",
    ratings: {
      starGame: 9.4,
      metacritic: 88,
      userAvg: 9.1
    },
    level: 'Lv. 72',
    badge: 'CIPHER PUZZLE',
    topic: 'Modular Arithmetic & Prime Cryptography'
  },
  {
    id: 'fraction-kingdom',
    title: 'Fraction Kingdom : Ratio Wars',
    subtitle: 'Percentages & Decimals Arena',
    category: 'Math',
    coverImg: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=900',
    about: "Defend mathematical towers using equivalent fractions, decimal conversions, and proportional reasoning. Upgrade fortress defenses by simplifying complex fractions under time pressure.",
    ratings: {
      starGame: 9.3,
      metacritic: 89,
      userAvg: 9.2
    },
    level: 'Lv. 55',
    badge: 'ARITHMETIC HERO',
    topic: 'Fractions, Ratios & Percentages'
  },

  // Adventure Games
  {
    id: 'horizon',
    title: 'Horizon Zero Dawn',
    subtitle: 'Complete Edition',
    category: 'Adventure',
    coverImg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&q=80&w=900',
    about: "Experience Aloy's entire legendary quest to unravel the mysteries of a world ruled by deadly Machines. An outcast from her tribe, the young hunter fights to uncover her past, discover her destiny... and stop a catastrophic threat to the future.",
    ratings: {
      starGame: 9,
      metacritic: 89,
      userAvg: 9
    },
    level: 'Lv. 95',
    badge: 'TOP FEATURED',
    topic: 'Mechanical Physics & Energy Systems'
  },
  {
    id: 'ark',
    title: 'ARK : Survival Evolved',
    subtitle: 'Prehistoric Survival',
    category: 'Adventure',
    coverImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=900',
    about: "Stranded on the shores of a mysterious island, you must learn to survive. Hunt, harvest resources, craft items, grow crops, research technologies, and build shelters to withstand the elements and prehistoric dinosaurs.",
    ratings: {
      starGame: 8.5,
      metacritic: 82,
      userAvg: 8.8
    },
    level: 'Lv. 74',
    badge: 'POPULAR',
    topic: 'Ecological Systems & Prehistoric Biology'
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk 2077',
    subtitle: 'Phantom Liberty',
    category: 'Adventure',
    coverImg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=900',
    about: "An open-world action-adventure RPG set in the megalopolis of Night City, where you play as V, a cyber-enhanced mercenary caught in a fight for survival against corporate power and rogue AI networks.",
    ratings: {
      starGame: 8.9,
      metacritic: 86,
      userAvg: 8.8
    },
    level: 'Lv. 64',
    badge: 'SCI-FI HIT',
    topic: 'Neural Networks & Cybernetics'
  },
  {
    id: 'witcher',
    title: 'The Witcher 3',
    subtitle: 'Wild Hunt',
    category: 'Adventure',
    coverImg: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=900',
    about: "You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will. Track down the child of prophecy, an otherworldly weapon capable of reshaping reality.",
    ratings: {
      starGame: 9.8,
      metacritic: 93,
      userAvg: 9.4
    },
    level: 'Lv. 100',
    badge: 'MASTERPIECE',
    topic: 'Herbal Alchemy & Medieval Metallurgy'
  },

  // Action Games
  {
    id: 'destiny',
    title: 'Destiny 2',
    subtitle: 'The Final Shape',
    category: 'Action',
    coverImg: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=900',
    about: "Dive into the world of Destiny 2 to explore the mysteries of the solar system and experience responsive first-person combat. Unlock powerful elemental abilities like Solar, Arc, and Void to protect humanity.",
    ratings: {
      starGame: 8.8,
      metacritic: 86,
      userAvg: 8.7
    },
    level: 'Lv. 112',
    badge: 'ACTION CHOICE',
    topic: 'Solar Astronomy & Particle Physics'
  },

  // Puzzle Games
  {
    id: 'portal',
    title: 'Portal : Quantum Lab',
    subtitle: 'Aperture Science',
    category: 'Puzzle',
    coverImg: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=900',
    about: "Step into Aperture Science testing chambers. Solve quantum spatial physics puzzles using momentum conservation, wormhole portals, laser refraction optics, and thermal discouragement beams.",
    ratings: {
      starGame: 9.7,
      metacritic: 95,
      userAvg: 9.6
    },
    level: 'Lv. 50',
    badge: 'STEM PICK',
    topic: 'Momentum Conservation & Quantum Mechanics'
  },

  // Strategy Games
  {
    id: 'minecraft',
    title: 'Minecraft : Logic & Code',
    subtitle: 'Redstone Engineering',
    category: 'Strategy',
    coverImg: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=900',
    about: "Harness redstone electrical logic gates, binary adders, and algorithmic automations to engineer complex computing systems, arithmetic logic units, and automated memory arrays inside infinite sandbox worlds.",
    ratings: {
      starGame: 9.5,
      metacritic: 93,
      userAvg: 9.2
    },
    level: 'Lv. 120',
    badge: 'EDUCATIONAL',
    topic: 'Computer Architecture & Digital Logic'
  },

  // Science Games
  {
    id: 'cosmo-lab',
    title: 'CosmoLab : Stellar Astrophysics',
    subtitle: 'Gravitational Waves & Black Holes',
    category: 'Science',
    coverImg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&q=80&w=900',
    about: "Simulate thermonuclear fusion in stellar nurseries and chart the event horizons of supermassive black holes through astrophysical calculations and cosmic wave sensors.",
    ratings: {
      starGame: 9.6,
      metacritic: 92,
      userAvg: 9.4
    },
    level: 'Lv. 90',
    badge: 'SPACE SCIENCE',
    topic: 'Astrophysics & Nuclear Fusion'
  },

  // Coding Games
  {
    id: 'cyber-code',
    title: 'CyberCode : Python Hacker Arena',
    subtitle: 'Algorithms & Cyber Defense',
    category: 'Coding',
    coverImg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=900',
    about: "Write clean Python scripts and algorithmic data structures to bypass defensive firewalls, decrypt binary packets, and safeguard cybernetic grids from malicious botnets.",
    ratings: {
      starGame: 9.7,
      metacritic: 95,
      userAvg: 9.5
    },
    level: 'Lv. 105',
    badge: 'CODE MASTER',
    topic: 'Python, Big-O Notation & Data Structures'
  },

  // Physics Games
  {
    id: 'physics-projectile',
    title: 'Trajectory Titan : Slingshot',
    subtitle: 'Kinematics & Parabolic Slingshot',
    category: 'Physics',
    coverImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=900',
    about: 'Master projectile motion using authentic kinematics formulas! Slingshot physics cores at exact launch angles (45° max range, 30°/60° complementary angles) and tune launch power to smash destructible timber, glass, and stone citadels.',
    ratings: {
      starGame: 9.8,
      metacritic: 96,
      userAvg: 9.7
    },
    level: 'Lv. 45',
    badge: 'FEATURED PHYSICS',
    topic: 'Projectile Motion, 45° Range & Apex Height'
  },
  {
    id: 'physics-odyssey',
    title: "Newton's Relic : Gravity & Optics",
    subtitle: 'Classical Mechanics & Particle Kinematics',
    category: 'Physics',
    coverImg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=900',
    about: "Calibrate laser optics, harmonic oscillators, and gravitational trajectory cannons. Master kinematics, momentum vectors, and fluid dynamics in zero-gravity testing chambers.",
    ratings: {
      starGame: 9.5,
      metacritic: 90,
      userAvg: 9.3
    },
    level: 'Lv. 82',
    badge: 'PHYSICS LAB',
    topic: 'Kinematics, Friction & Optical Lasers'
  },

  // Chemistry Games
  {
    id: 'chem-reaction',
    title: 'ChemReaction : Periodic Warfare',
    subtitle: 'Molecular Bonds & Stoichiometry',
    category: 'Chemistry',
    coverImg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=900',
    about: "Synthesize rare elemental compounds, balance stoichiometric chemical equations, and harness exothermic enthalpy reactions to craft catalytic compounds in interactive laboratory duels.",
    ratings: {
      starGame: 9.4,
      metacritic: 89,
      userAvg: 9.1
    },
    level: 'Lv. 76',
    badge: 'MOLECULAR',
    topic: 'Stoichiometry & Chemical Bonding'
  },

  // Biology Games
  {
    id: 'bio-odyssey',
    title: 'EcoSphere : Genetics & Evolution',
    subtitle: 'Cellular Mitosis & Biodiversity',
    category: 'Biology',
    coverImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=900',
    about: "Engineer resilient biological organisms across evolving ecosystems. Sequence DNA helixes, simulate natural selection mutations, and optimize trophic food webs in a living planetary sandbox.",
    ratings: {
      starGame: 9.6,
      metacritic: 93,
      userAvg: 9.4
    },
    level: 'Lv. 98',
    badge: 'ECO SYSTEM',
    topic: 'Genetics, DNA Sequencing & Ecology'
  },

  // History Games
  {
    id: 'chrono-empires',
    title: 'Chronos : Rise of Civilizations',
    subtitle: 'Ancient Dynasties & World History',
    category: 'History',
    coverImg: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=900',
    trailerImg: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=900',
    about: "Travel across ancient Mesopotamia, the Silk Road, and the Indus Valley. Guide historical empires through diplomatic treaties, architectural marvels, and monumental archaeological expeditions.",
    ratings: {
      starGame: 9.3,
      metacritic: 88,
      userAvg: 9.2
    },
    level: 'Lv. 70',
    badge: 'CHRONO QUEST',
    topic: 'World Civilizations & Trade Routes'
  }
];

interface SubjectItem {
  id: string;
  name: string;
  subtitle: string;
  iconText: string;
  iconBg: string;
  quests: string;
  category: string;
}

const SUBJECTS_DATA: SubjectItem[] = [
  { id: 'maths', name: 'Maths', subtitle: 'Algebra & Geometry', iconText: '∑', iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600', quests: '18 Quests', category: 'Math' },
  { id: 'science', name: 'Science', subtitle: 'Physics & Chem', iconText: '⚛', iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600', quests: '24 Quests', category: 'Science' },
  { id: 'coding', name: 'Coding', subtitle: 'Python & Logic', iconText: '</>', iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600', quests: '15 Quests', category: 'Coding' },
  { id: 'physics', name: 'Physics', subtitle: 'Optics & Mechanics', iconText: '⚡', iconBg: 'bg-gradient-to-br from-violet-500 to-fuchsia-600', quests: '12 Quests', category: 'Physics' },
  { id: 'chemistry', name: 'Chemistry', subtitle: 'Reactions & Bonds', iconText: '🧪', iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600', quests: '14 Quests', category: 'Chemistry' },
  { id: 'biology', name: 'Biology', subtitle: 'Ecology & Genetics', iconText: '🧬', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600', quests: '16 Quests', category: 'Biology' },
  { id: 'history', name: 'History', subtitle: 'Civilizations', iconText: '🏛', iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-600', quests: '10 Quests', category: 'History' },
];

export const ArcadePage: React.FC<ArcadePageProps> = ({
  onView3DModel,
  userName = 'Abhinav',
  isNavbarClosed,
  onToggleNavbar
}) => {
  // Category & Selected Game state
  const [activeCategory, setActiveCategory] = useState<string>('Adventure');
  const [selectedGame, setSelectedGame] = useState<GameItem>(
    GAMES_DATA.find((g) => g.category === 'Adventure') || GAMES_DATA[0]
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [activeGameToPlay, setActiveGameToPlay] = useState<string | null>(null);

  // Scroll Container Refs for horizontal carousels
  const categoriesRef = useRef<HTMLDivElement>(null);
  const subjectsRef = useRef<HTMLDivElement>(null);
  const gamesGridRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, offset: number) => {
    arcadeAudio.playButton();
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleSelectGame = (game: GameItem) => {
    arcadeAudio.playButton();
    setSelectedGame(game);
    setIsSidebarOpen(true);
  };

  const handleLaunchGame = (gameId?: string) => {
    arcadeAudio.playButton();
    const targetId = gameId || selectedGame.id;
    setActiveGameToPlay(targetId);
  };

  const handleSelectCategory = (category: string) => {
    arcadeAudio.playButton();
    setActiveCategory(category);
    // Auto-select first game of this category
    const matched = GAMES_DATA.find((g) => {
      const gCat = g.category.toLowerCase();
      const tCat = category.toLowerCase();
      return (
        gCat === tCat ||
        ((tCat === 'math' || tCat === 'maths') && (gCat === 'math' || gCat === 'maths'))
      );
    });
    if (matched) {
      setSelectedGame(matched);
    }
  };

  const handleSelectSubject = (subject: SubjectItem) => {
    arcadeAudio.playButton();
    const targetCategory = subject.category || subject.name;
    setActiveCategory(targetCategory);

    // Look for matching game in GAMES_DATA
    const matched = GAMES_DATA.find((g) => {
      const gCat = g.category.toLowerCase();
      const sCat = targetCategory.toLowerCase();
      return (
        gCat === sCat ||
        ((sCat === 'math' || sCat === 'maths') && (gCat === 'math' || gCat === 'maths')) ||
        g.title.toLowerCase().includes(subject.id) ||
        g.topic.toLowerCase().includes(subject.id)
      );
    });

    if (matched) {
      setSelectedGame(matched);
    } else {
      const subjectGame: GameItem = {
        id: `subj-${subject.id}`,
        title: `${subject.name} : Interactive Quest`,
        subtitle: subject.subtitle,
        category: subject.category,
        coverImg: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=900',
        trailerImg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=900',
        about: `Master core concepts in ${subject.name} (${subject.subtitle}) through gamified interactive simulations, speed challenges, and problem-solving levels designed to reinforce CBSE curriculum.`,
        ratings: {
          starGame: 9.6,
          metacritic: 92,
          userAvg: 9.4,
        },
        level: subject.quests,
        badge: 'SUBJECT QUEST',
        topic: `${subject.name} · ${subject.subtitle}`,
      };
      setSelectedGame(subjectGame);
    }
    setIsSidebarOpen(true);
  };

  const handleActionToast = (action: string) => {
    arcadeAudio.playButton();
    setToastNotice(`${action} clicked for ${selectedGame.title}!`);
    setTimeout(() => {
      setToastNotice(null);
    }, 2800);
  };

  // Filter games based on search and category
  const filteredGames = GAMES_DATA.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.about.toLowerCase().includes(searchQuery.toLowerCase());
    
    const cat = activeCategory.toLowerCase();
    const gameCat = game.category.toLowerCase();
    const matchesCategory =
      cat === 'all' ||
      gameCat === cat ||
      ((cat === 'math' || cat === 'maths') && (gameCat === 'math' || gameCat === 'maths'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative w-full h-full min-h-0 bg-[#0A0B1A] text-white flex flex-col lg:flex-row overflow-hidden font-sans select-none">
      
      {/* Background Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-32 right-10 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[140px]" />
      </div>

      {/* ================= CENTER MAIN FEED ================= */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden z-10">
        
        {/* Top Header: Greeting + Search + Notifications + Avatar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Hi {userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-normal mt-0.5">
              Welcome back, many new games waiting to be played
            </p>
          </div>

          {/* Right Header Toolbar: Search + Notifications + 3D Mode + Details Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-32 sm:w-48 lg:w-56 h-9 pl-9 pr-3 rounded-full bg-[#161836] border border-[#262A56] text-xs text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => arcadeAudio.playButton()}
              className="relative w-9 h-9 rounded-full bg-[#161836] border border-[#262A56] hover:bg-[#202348] text-gray-300 flex items-center justify-center transition-colors shadow-sm cursor-pointer shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EC4899] ring-2 ring-[#161836]" />
            </button>

            {/* User Avatar */}
            <div
              onClick={() => arcadeAudio.playButton()}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-500/70 shadow-md ring-2 ring-purple-500/30 cursor-pointer hover:scale-105 transition-transform shrink-0"
              title={userName}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 3D Cabinet View Mode Toggle */}
            <button
              onClick={onView3DModel}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E2248] hover:bg-[#282D5F] border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Switch to 3D Retro Cabinet"
            >
              <Tv className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden md:inline">3D Cabinet</span>
            </button>

            {/* Toggle Navbar (Collapse/Expand) Button */}
            {onToggleNavbar && (
              <button
                onClick={onToggleNavbar}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                  isNavbarClosed
                    ? 'bg-purple-600/30 hover:bg-purple-600/50 border-purple-500/50 text-purple-200'
                    : 'bg-[#181A36] hover:bg-[#202348] border-[#262A56] text-gray-300 hover:text-white'
                }`}
                title={isNavbarClosed ? 'Show Navigation Menu' : 'Collapse Navigation Menu'}
              >
                {isNavbarClosed ? <PanelLeft className="w-3.5 h-3.5 text-purple-300" /> : <PanelLeftClose className="w-3.5 h-3.5 text-purple-300" />}
                <span>{isNavbarClosed ? 'Show Menu' : 'Full Width'}</span>
              </button>
            )}

            {/* Toggle Details Panel on All Screens */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-sm ${
                isSidebarOpen
                  ? 'bg-purple-600/30 hover:bg-purple-600/50 border-purple-500/50 text-purple-200'
                  : 'bg-[#181A36] hover:bg-[#202348] border-[#262A56] text-gray-300 hover:text-white'
              }`}
              title={isSidebarOpen ? 'Close Game Details' : 'Open Game Details'}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-purple-300" />
              <span>{isSidebarOpen ? 'Close Details' : 'Game Details'}</span>
            </button>
          </div>
        </div>

        {/* ================= SECTION 1: GAMES (FEATURED CATEGORY CARDS) ================= */}
        <section className="space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Games</h2>
            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel(categoriesRef, -280)}
                className="w-7 h-7 rounded-full bg-[#161836] hover:bg-[#22254F] border border-[#262A56] text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel(categoriesRef, 280)}
                className="w-7 h-7 rounded-full bg-[#161836] hover:bg-[#22254F] border border-[#262A56] text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Row of Category Cards */}
          <div
            ref={categoriesRef}
            className="flex items-center gap-4 sm:gap-5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-3 -mx-4"
          >
            {/* Card 0: Physics (Electric Blue & Amber Gradient + 3D Parabolic Trajectory Art) */}
            <div
              onClick={() => handleSelectCategory('Physics')}
              className={`min-w-[230px] sm:min-w-[260px] h-36 sm:h-40 rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg flex flex-col justify-between shrink-0 ${
                activeCategory.toLowerCase() === 'physics'
                  ? 'border-2 border-white/90 shadow-[0_0_30px_rgba(59,130,246,0.55)]'
                  : 'border-2 border-transparent'
              }`}
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0D9488 100%)',
              }}
            >
              {/* Play Button Icon */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const firstPhys = GAMES_DATA.find((g) => g.category.toLowerCase() === 'physics');
                  if (firstPhys) handleSelectGame(firstPhys);
                }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md text-[#2563EB] transition-transform hover:scale-110 cursor-pointer"
                title="Play Physics"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>

              {/* Title & Player Count */}
              <div className="relative z-10 text-white">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight drop-shadow-sm">Physics</h3>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400 text-amber-950">NEW</span>
                </div>
                <p className="text-xs text-white/90 font-medium">62,480 Playing</p>
              </div>

              {/* 3D Stylized Parabolic Trajectory Art */}
              <div className="absolute -right-2 -bottom-2 w-32 h-32 pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full transform rotate-[5deg]">
                  {/* Dotted Trajectory Arc */}
                  <path d="M 10 90 Q 45 10 90 75" stroke="#FFFFFF" strokeWidth="3.5" strokeDasharray="5 4" opacity="0.9" />
                  {/* Launch anchor */}
                  <circle cx="10" cy="90" r="5" fill="#FBBF24" />
                  {/* Apex height point */}
                  <circle cx="45" cy="38" r="6" fill="#38BDF8" />
                  <path d="M 45 32 L 53 42 L 37 42 Z" fill="#F43F5E" />
                  {/* Landing impact */}
                  <circle cx="90" cy="75" r="7" fill="#34D399" />
                  <circle cx="90" cy="75" r="12" stroke="#34D399" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 3" />
                </svg>
              </div>
            </div>

            {/* Card 1: Maths (Vibrant Rose/Pink Gradient + 3D Math Art) */}
            <div
              onClick={() => handleSelectCategory('Math')}
              className={`min-w-[230px] sm:min-w-[260px] h-36 sm:h-40 rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg flex flex-col justify-between shrink-0 ${
                activeCategory.toLowerCase() === 'math' || activeCategory.toLowerCase() === 'maths'
                  ? 'border-2 border-white/90 shadow-[0_0_30px_rgba(244,63,94,0.55)]'
                  : 'border-2 border-transparent'
              }`}
              style={{
                background: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 50%, #FB7185 100%)',
              }}
            >
              {/* Play Button Icon */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const firstMath = GAMES_DATA.find((g) => g.category.toLowerCase() === 'math');
                  if (firstMath) handleSelectGame(firstMath);
                }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md text-[#E11D48] transition-transform hover:scale-110 cursor-pointer"
                title="Play Maths"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>

              {/* Title & Player Count */}
              <div className="relative z-10 text-white">
                <h3 className="text-lg sm:text-xl font-black tracking-tight drop-shadow-sm">Maths</h3>
                <p className="text-xs text-white/90 font-medium">58,210 Playing</p>
              </div>

              {/* 3D Stylized Math Vector Art */}
              <div className="absolute -right-2 -bottom-2 w-32 h-32 pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full transform rotate-[10deg]">
                  <circle cx="50" cy="50" r="38" stroke="url(#mathGradArcade)" strokeWidth="4" strokeDasharray="6 4" opacity="0.4" />
                  <text x="28" y="60" fill="#FFFFFF" fontSize="38" fontWeight="bold" fontFamily="monospace" opacity="0.95">∑</text>
                  <text x="58" y="38" fill="#FFE4E6" fontSize="22" fontWeight="bold" fontFamily="monospace" opacity="0.85">π</text>
                  <text x="18" y="78" fill="#FDA4AF" fontSize="22" fontWeight="bold" fontFamily="monospace" opacity="0.8">√</text>
                  <defs>
                    <linearGradient id="mathGradArcade" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFFFFF" />
                      <stop offset="1" stopColor="#FDA4AF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 2: Adventure (Coral/Orange/Red Gradient + 3D Sword) */}
            <div
              onClick={() => handleSelectCategory('Adventure')}
              className={`min-w-[230px] sm:min-w-[260px] h-36 sm:h-40 rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg flex flex-col justify-between shrink-0 ${
                activeCategory.toLowerCase() === 'adventure'
                  ? 'border-2 border-white/90 shadow-[0_0_30px_rgba(255,94,98,0.45)]'
                  : 'border-2 border-transparent'
              }`}
              style={{
                background: 'linear-gradient(135deg, #FF5E62 0%, #FF6B55 45%, #FF9966 100%)',
              }}
            >
              {/* Play Button Icon */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const firstAdv = GAMES_DATA.find((g) => g.category.toLowerCase() === 'adventure');
                  if (firstAdv) handleSelectGame(firstAdv);
                }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md text-[#FF5E62] transition-transform hover:scale-110 cursor-pointer"
                title="Play Adventure"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>

              {/* Title & Player Count */}
              <div className="relative z-10 text-white">
                <h3 className="text-lg sm:text-xl font-black tracking-tight drop-shadow-sm">Adventure</h3>
                <p className="text-xs text-white/90 font-medium">53,883 Playing</p>
              </div>

              {/* 3D Stylized Sword Vector Art */}
              <div className="absolute -right-2 -bottom-2 w-32 h-32 pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full transform rotate-[25deg]">
                  <polygon points="50,5 60,70 50,75 40,70" fill="url(#swordBladeGrad)" />
                  <polygon points="50,5 50,75 40,70" fill="#E2E8F0" opacity="0.6" />
                  <rect x="25" y="70" width="50" height="9" rx="4.5" fill="#F59E0B" />
                  <circle cx="28" cy="74.5" r="3.5" fill="#D97706" />
                  <circle cx="72" cy="74.5" r="3.5" fill="#D97706" />
                  <rect x="46" y="79" width="8" height="15" rx="3" fill="#78350F" />
                  <circle cx="50" cy="96" r="6" fill="#F59E0B" />
                  <defs>
                    <linearGradient id="swordBladeGrad" x1="50" y1="5" x2="50" y2="75" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFFFFF" />
                      <stop offset="0.6" stopColor="#E2E8F0" />
                      <stop offset="1" stopColor="#94A3B8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 3: Action (Royal Purple Gradient + 3D Space Rocket) */}
            <div
              onClick={() => handleSelectCategory('Action')}
              className={`min-w-[230px] sm:min-w-[260px] h-36 sm:h-40 rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg flex flex-col justify-between shrink-0 ${
                activeCategory.toLowerCase() === 'action'
                  ? 'border-2 border-white/90 shadow-[0_0_30px_rgba(147,51,234,0.45)]'
                  : 'border-2 border-transparent'
              }`}
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #C084FC 100%)',
              }}
            >
              {/* Play Button */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const firstAct = GAMES_DATA.find((g) => g.category.toLowerCase() === 'action');
                  if (firstAct) handleSelectGame(firstAct);
                }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md text-[#7C3AED] transition-transform hover:scale-110 cursor-pointer"
                title="Play Action"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>

              {/* Title & Player Count */}
              <div className="relative z-10 text-white">
                <h3 className="text-lg sm:text-xl font-black tracking-tight drop-shadow-sm">Action</h3>
                <p className="text-xs text-white/90 font-medium">64,901 Playing</p>
              </div>

              {/* 3D Stylized Rocket Vector Art */}
              <div className="absolute right-0 bottom-0 w-32 h-32 pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full transform -rotate-[15deg]">
                  <polygon points="50,75 40,96 50,90 60,96" fill="#F59E0B" />
                  <polygon points="50,75 44,92 50,87 56,92" fill="#FEF08A" />
                  <rect x="32" y="55" width="8" height="22" rx="4" fill="#EF4444" />
                  <rect x="60" y="55" width="8" height="22" rx="4" fill="#EF4444" />
                  <path d="M50 12 C40 35 38 60 40 75 L60 75 C62 60 60 35 50 12 Z" fill="#FFFFFF" />
                  <path d="M50 12 C40 35 38 60 40 75 L50 75 Z" fill="#E2E8F0" />
                  <circle cx="50" cy="38" r="6" fill="#0284C7" />
                  <circle cx="48" cy="36" r="2" fill="#FFFFFF" />
                </svg>
              </div>
            </div>

            {/* Card 4: Strategy (Electric Blue Gradient + 3D Chess Knight) */}
            <div
              onClick={() => handleSelectCategory('Strategy')}
              className={`min-w-[230px] sm:min-w-[260px] h-36 sm:h-40 rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg flex flex-col justify-between shrink-0 ${
                activeCategory.toLowerCase() === 'strategy'
                  ? 'border-2 border-white/90 shadow-[0_0_30px_rgba(37,99,235,0.45)]'
                  : 'border-2 border-transparent'
              }`}
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)',
              }}
            >
              {/* Play Button */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const firstStrat = GAMES_DATA.find((g) => g.category.toLowerCase() === 'strategy');
                  if (firstStrat) handleSelectGame(firstStrat);
                }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md text-[#2563EB] transition-transform hover:scale-110 cursor-pointer"
                title="Play Strategy"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>

              {/* Title & Player Count */}
              <div className="relative z-10 text-white">
                <h3 className="text-lg sm:text-xl font-black tracking-tight drop-shadow-sm">Strategy</h3>
                <p className="text-xs text-white/90 font-medium">50,415 Playing</p>
              </div>

              {/* 3D Stylized Chess Knight Vector Art */}
              <div className="absolute right-0 bottom-0 w-32 h-32 pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <rect x="25" y="80" width="50" height="10" rx="5" fill="#E2E8F0" />
                  <rect x="30" y="74" width="40" height="7" rx="3.5" fill="#CBD5E1" />
                  <path d="M42 20 C42 20 52 14 65 24 C72 32 68 45 68 45 C78 48 80 58 75 66 C70 74 65 74 65 74 L35 74 C35 74 34 50 38 38 C40 32 42 20 42 20 Z" fill="#FFFFFF" />
                  <path d="M42 20 C42 20 46 28 42 38 C38 48 35 74 35 74 L45 74 C45 74 48 50 50 38 C52 28 50 20 42 20 Z" fill="#E2E8F0" />
                  <circle cx="58" cy="32" r="3" fill="#1E293B" />
                </svg>
              </div>
            </div>

            {/* Card 5: Puzzle (Warm Amber Gradient + 3D Isometric Cube) */}
            <div
              onClick={() => handleSelectCategory('Puzzle')}
              className={`min-w-[230px] sm:min-w-[260px] h-36 sm:h-40 rounded-3xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg flex flex-col justify-between shrink-0 ${
                activeCategory.toLowerCase() === 'puzzle'
                  ? 'border-2 border-white/90 shadow-[0_0_30px_rgba(245,158,11,0.45)]'
                  : 'border-2 border-transparent'
              }`}
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #FB923C 50%, #FBBF24 100%)',
              }}
            >
              {/* Play Button */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const firstPuzzle = GAMES_DATA.find((g) => g.category.toLowerCase() === 'puzzle');
                  if (firstPuzzle) handleSelectGame(firstPuzzle);
                }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md text-[#F59E0B] transition-transform hover:scale-110 cursor-pointer"
                title="Play Puzzle"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>

              {/* Title & Player Count */}
              <div className="relative z-10 text-white">
                <h3 className="text-lg sm:text-xl font-black tracking-tight drop-shadow-sm">Puzzle</h3>
                <p className="text-xs text-white/90 font-medium">45,710 Playing</p>
              </div>

              {/* 3D Isometric Cube Vector Art */}
              <div className="absolute right-0 bottom-0 w-32 h-32 pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <polygon points="50,20 80,35 50,50 20,35" fill="#FEF08A" />
                  <polygon points="20,35 50,50 50,85 20,70" fill="#F59E0B" />
                  <polygon points="50,50 80,35 80,70 50,85" fill="#D97706" />
                </svg>
              </div>
            </div>

          </div>
        </section>

        {/* ================= SECTION 2: SUBJECTS ================= */}
        <section className="space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Subjects</h2>
            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel(subjectsRef, -240)}
                className="w-7 h-7 rounded-full bg-[#161836] hover:bg-[#22254F] border border-[#262A56] text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel(subjectsRef, 240)}
                className="w-7 h-7 rounded-full bg-[#161836] hover:bg-[#22254F] border border-[#262A56] text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Items Row */}
          <div
            ref={subjectsRef}
            className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-2 -mx-4"
          >
            {SUBJECTS_DATA.map((item) => {
              const isSelected = isSidebarOpen && selectedGame?.id === `subj-${item.id}`;
              const isCategoryActive =
                activeCategory.toLowerCase() === item.category.toLowerCase() ||
                ((item.category.toLowerCase() === 'math' || item.category.toLowerCase() === 'maths') &&
                  (activeCategory.toLowerCase() === 'math' || activeCategory.toLowerCase() === 'maths'));
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectSubject(item)}
                  className={`min-w-[170px] sm:min-w-[190px] h-16 rounded-2xl bg-[#14162E] hover:bg-[#1C1F42] border-2 p-2.5 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-sm shrink-0 ${
                    isCategoryActive || isSelected
                      ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.45)] bg-[#1B1E40]'
                      : 'border-[#22264F] hover:border-purple-500/50'
                  }`}
                >
                  {/* Subject Logo Badge */}
                  <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center font-black text-white text-base shadow-md shrink-0`}>
                    {item.iconText}
                  </div>

                  {/* Title and Subtitle */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">{item.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 3: CATEGORY GAMES (ADVENTURE / MATHS GAMES) ================= */}
        <section className="space-y-3 flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {activeCategory.toLowerCase() === 'math' || activeCategory.toLowerCase() === 'maths' ? 'Maths' : activeCategory} Games
            </h2>
            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel(gamesGridRef, -320)}
                className="w-7 h-7 rounded-full bg-[#161836] hover:bg-[#22254F] border border-[#262A56] text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel(gamesGridRef, 320)}
                className="w-7 h-7 rounded-full bg-[#161836] hover:bg-[#22254F] border border-[#262A56] text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Row of Game Cards with Rich Cover Art */}
          <div
            ref={gamesGridRef}
            className="flex items-center gap-4 sm:gap-5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-3 pb-6 -mx-4"
          >
            {filteredGames.map((game) => {
              const isSelected = isSidebarOpen && selectedGame.id === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className={`min-w-[210px] sm:min-w-[240px] h-60 sm:h-64 rounded-3xl overflow-hidden relative cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg flex flex-col justify-end p-3.5 group shrink-0 ${
                    isSelected
                      ? 'border-2 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.5)]'
                      : 'border-2 border-[#22264F] hover:border-purple-500/50'
                  }`}
                >
                  {/* Game Cover Background Image */}
                  <img
                    src={game.coverImg}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C1D] via-[#0B0C1D]/40 to-transparent" />

                  {/* Top Badge (if any) */}
                  {game.badge && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-purple-900/80 backdrop-blur-md border border-purple-400/30 text-[10px] font-black tracking-wider text-purple-200 uppercase">
                      {game.badge}
                    </div>
                  )}

                  {/* Center Play Button Overlay on Hover */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectGame(game);
                    }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.8)] transform transition-transform hover:scale-110 active:scale-95 cursor-pointer">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Title Pill Badge Overlay (Matching the picture exactly) */}
                  <div className="relative z-10 w-full rounded-2xl bg-[#141630]/90 backdrop-blur-md border border-[#272B5C] py-2.5 px-3 text-center transition-all group-hover:bg-[#1E2248]">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-wide block truncate">
                      {game.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ================= RIGHT DETAILS SIDEBAR ================= */}
      {/* Mobile Backdrop with Smooth Blur & Seamless Gradient Flow */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-25 lg:hidden bg-gradient-to-r from-black/80 via-black/40 to-transparent backdrop-blur-md transition-opacity duration-300 animate-in fade-in cursor-pointer"
        />
      )}

      {/* Sleek collapsible column on desktop & slide-in drawer on mobile/tablet */}
      <aside
        className={`w-full sm:w-[360px] lg:w-[340px] xl:w-[380px] shrink-0 fixed lg:relative inset-y-0 right-0 lg:inset-auto lg:h-full z-30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0 pointer-events-none lg:hidden'
        }`}
      >
        {/* ================= SEAMLESS IMAGE-DERIVED BLUE AURA BLEND ================= */}
        {/* Radiates outward to the left, glowing from the panel and fading to 100% transparent on the left */}
        <div
          className="absolute -left-36 sm:-left-48 top-0 bottom-0 w-36 sm:w-48 pointer-events-none z-10 transition-opacity duration-700"
          style={{
            maskImage: 'linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)'
          }}
        >
          {/* 1. Deep blurred replica of the game's actual cover image to sample its exact blue/cyan colors */}
          <img
            key={selectedGame.id}
            src={selectedGame.coverImg}
            alt=""
            className="w-full h-full object-cover scale-150 blur-2xl opacity-60 mix-blend-screen transition-opacity duration-700 animate-in fade-in"
          />

          {/* 2. Soft luminous blue aura gradient: brightest at the panel (right) -> fading to transparent (left) */}
          <div className="absolute inset-0 bg-gradient-to-l from-cyan-400/35 via-blue-500/20 to-transparent blur-xl" />
        </div>

        {/* Ambient floating radial aura orb at top-left (level with the banner image) matching the blue in the image */}
        <div className="absolute -left-20 top-8 w-56 h-56 rounded-full bg-cyan-400/25 blur-[65px] pointer-events-none z-10 animate-pulse duration-1000" />
        <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-blue-600/20 blur-[75px] pointer-events-none z-10" />

        {/* Inner Scrollable Drawer Content: Borderless, soft glassmorphism & luminous ambient aura shadow */}
        <div className="relative w-full h-full bg-[#101229]/95 backdrop-blur-2xl p-5 flex flex-col gap-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-[-20px_0_50px_rgba(14,165,233,0.18)]">
          {/* Header with Title and Close 'X' Button on ALL SCREENS */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Game Overview
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Large Cover Banner with Game Title Badge */}
          <div className="w-full h-40 sm:h-44 rounded-2xl overflow-hidden relative shadow-md group shrink-0">
            <img
              src={selectedGame.coverImg}
              alt={selectedGame.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101229] via-transparent to-black/30" />
            
            {/* Stylized Badge Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-center shadow-lg">
                <span className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-blue-200">
                  {selectedGame.title}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Game Title Heading */}
          <div className="shrink-0">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {selectedGame.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40">
                {selectedGame.category}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                {selectedGame.topic}
              </span>
            </div>
          </div>

          {/* 3. About Section */}
          <div className="space-y-1.5 shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">About</h3>
            <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed font-normal">
              {selectedGame.about}
            </p>
          </div>

          {/* 4. Rating Section with 3 Circular Rings (Matching picture) */}
          <div className="space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Rating</h3>
              <button
                onClick={() => handleActionToast('Reviews')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                See all review
              </button>
            </div>

            {/* 3 Circular Score Badges */}
            <div className="grid grid-cols-3 gap-2 py-1">
              {/* Ring 1: Star Game */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#1A2044]"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-cyan-400"
                      strokeDasharray="90, 100"
                      strokeLinecap="round"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-white">
                    {selectedGame.ratings.starGame}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium text-center">
                  Star Game
                </span>
              </div>

              {/* Ring 2: Metacritic */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#1A2044]"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-400"
                      strokeDasharray="89, 100"
                      strokeLinecap="round"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-white">
                    {selectedGame.ratings.metacritic}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium text-center">
                  Metacritic
                </span>
              </div>

              {/* Ring 3: User Avg */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#1A2044]"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-400"
                      strokeDasharray="90, 100"
                      strokeLinecap="round"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-white">
                    {selectedGame.ratings.userAvg}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium text-center">
                  User Avg
                </span>
              </div>
            </div>
          </div>

          {/* 5. Trailer Preview Thumbnail */}
          <div className="space-y-1.5 shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Trailer</h3>
            <div
              onClick={() => handleActionToast('Trailer')}
              className="w-full h-28 sm:h-32 rounded-2xl overflow-hidden relative cursor-pointer group shadow-md"
            >
              <img
                src={selectedGame.trailerImg}
                alt="Trailer preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 text-blue-900 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 6. High-Impact "PLAY GAME" Action CTA */}
          <div className="pt-2 shrink-0">
            <button
              onClick={() => handleLaunchGame(selectedGame.id)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-[0_0_25px_rgba(59,130,246,0.55)] flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer border border-cyan-400/40"
            >
              <Gamepad2 className="w-5 h-5 text-cyan-200 animate-pulse" />
              <span>PLAY GAME</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Floating Status Notification Toast */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#181A36] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-2xl border border-purple-500/50 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* ================= 3D GEOMETRY DASH MATH / KINEMATICS SLINGSHOT ================= */}
      {activeGameToPlay && (() => {
        const gameObj = GAMES_DATA.find((g) => g.id === activeGameToPlay) || selectedGame;
        if (activeGameToPlay === 'physics-projectile' || activeGameToPlay === 'physics-odyssey' || gameObj?.category === 'Physics') {
          return (
            <TrajectoryTitanGame
              onBack={() => setActiveGameToPlay(null)}
            />
          );
        }
        return (
          <GeometryDashMathGame
            onExit={() => setActiveGameToPlay(null)}
            userName={userName}
            gameTitle={gameObj?.title || 'Geometry Dash : Dimensions'}
            gameSubtitle={gameObj?.subtitle || 'Algebra Highway Runner'}
            gameCategory={gameObj?.category || 'Math'}
            gameTopic={gameObj?.topic || 'Algebra & Coordinate Geometry'}
            gameBadge={gameObj?.badge || 'TOP HIT'}
          />
        );
      })()}

    </div>
  );
};
