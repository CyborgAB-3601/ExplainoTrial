import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Layers, Compass, ArrowRight, X, 
  Sparkles, CheckCircle2, Bookmark, Volume2, Share2, CornerDownLeft, GraduationCap
} from 'lucide-react';

export interface BookItem {
  id: string;
  title: string;
  shortTitle: string;
  author: string;
  subject: 'Coding' | 'Maths' | 'Science' | 'History';
  chapterNo: string;
  topic: string;
  year: string;
  readTime: string;
  progress: number; // 0 - 100
  spineWidth: number; // in px
  spineHeight: number; // in px
  colorScheme: {
    spineBg: string;
    spineBorder: string;
    spineText: string;
    coverBg: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
  hasRibbon?: boolean;
  ribbonColor?: string;
  excerpt: string;
  exLibrisId: string;
  shelvedDate: string;
  artType: 'tree' | 'geometry' | 'atom' | 'pillar' | 'neural' | 'spiral';
}

const CBSE_10TH_BOOKS_DATA: BookItem[] = [
  // SCIENCE (Cyan / Sky) - NCERT Class 10 Science
  {
    id: 'cbse-sci-1',
    title: 'Life Processes (Nutrition, Respiration, Transport & Excretion)',
    shortTitle: 'Life Processes',
    author: 'NCERT Biology',
    subject: 'Science',
    chapterNo: 'Ch 6',
    topic: 'Biology',
    year: 'Class 10',
    readTime: '24 min',
    progress: 72,
    spineWidth: 42,
    spineHeight: 235,
    colorScheme: {
      spineBg: 'from-[#0C4A6E] via-[#0369A1] to-[#075985]',
      spineBorder: '#0284C7',
      spineText: '#E0F2FE',
      coverBg: '#075985',
      accent: '#38BDF8',
      badgeBg: '#E0F2FE',
      badgeText: '#0284C7',
    },
    hasRibbon: true,
    ribbonColor: '#38BDF8',
    excerpt: 'Photosynthesis mechanisms, light and dark reactions, human digestive enzymes, double circulation in heart, and nephron filtration in kidneys.',
    exLibrisId: 'NCERT-SCI-06',
    shelvedDate: 'Term 1 Syllabus',
    artType: 'tree',
  },
  {
    id: 'cbse-sci-2',
    title: 'Chemical Reactions and Equations',
    shortTitle: 'Chemical Reactions',
    author: 'NCERT Chemistry',
    subject: 'Science',
    chapterNo: 'Ch 1',
    topic: 'Chemistry',
    year: 'Class 10',
    readTime: '18 min',
    progress: 90,
    spineWidth: 38,
    spineHeight: 226,
    colorScheme: {
      spineBg: 'from-[#155E75] via-[#0891B2] to-[#164E63]',
      spineBorder: '#06B6D4',
      spineText: '#ECFEFF',
      coverBg: '#0E7490',
      accent: '#22D3EE',
      badgeBg: '#ECFEFF',
      badgeText: '#0891B2',
    },
    hasRibbon: true,
    ribbonColor: '#22D3EE',
    excerpt: 'Balancing chemical equations by hit-and-trial, combination, decomposition, displacement, double displacement, and oxidation-reduction (redox) reactions.',
    exLibrisId: 'NCERT-SCI-01',
    shelvedDate: 'Term 1 Syllabus',
    artType: 'atom',
  },
  {
    id: 'cbse-sci-3',
    title: 'Light: Reflection and Refraction',
    shortTitle: 'Light & Optics',
    author: 'NCERT Physics',
    subject: 'Science',
    chapterNo: 'Ch 9',
    topic: 'Physics',
    year: 'Class 10',
    readTime: '30 min',
    progress: 45,
    spineWidth: 44,
    spineHeight: 238,
    colorScheme: {
      spineBg: 'from-[#075985] via-[#0284C7] to-[#0369A1]',
      spineBorder: '#38BDF8',
      spineText: '#F0F9FF',
      coverBg: '#0369A1',
      accent: '#7DD3FC',
      badgeBg: '#F0F9FF',
      badgeText: '#0284C7',
    },
    excerpt: 'Spherical mirrors, ray tracing, mirror formula 1/f = 1/v + 1/u, Snell’s law of refraction, refractive index, lens formula and optical power of lenses.',
    exLibrisId: 'NCERT-SCI-09',
    shelvedDate: 'Term 2 Syllabus',
    artType: 'geometry',
  },
  {
    id: 'cbse-sci-4',
    title: 'Electricity & Magnetic Effects of Current',
    shortTitle: 'Electricity & Magnetism',
    author: 'NCERT Physics',
    subject: 'Science',
    chapterNo: 'Ch 11',
    topic: 'Physics',
    year: 'Class 10',
    readTime: '26 min',
    progress: 55,
    spineWidth: 40,
    spineHeight: 228,
    colorScheme: {
      spineBg: 'from-[#0E7490] via-[#0284C7] to-[#155E75]',
      spineBorder: '#0EA5E9',
      spineText: '#E0F2FE',
      coverBg: '#0E7490',
      accent: '#38BDF8',
      badgeBg: '#E0F2FE',
      badgeText: '#0284C7',
    },
    hasRibbon: true,
    ribbonColor: '#F59E0B',
    excerpt: 'Ohm’s law (V = IR), factors affecting resistance, series and parallel combinations, Joule’s heating law, magnetic field lines, and Fleming’s left-hand rule.',
    exLibrisId: 'NCERT-SCI-11',
    shelvedDate: 'Term 2 Syllabus',
    artType: 'atom',
  },
  {
    id: 'cbse-sci-5',
    title: 'Acids, Bases and Salts & Metallurgy',
    shortTitle: 'Acids, Bases & Salts',
    author: 'NCERT Chemistry',
    subject: 'Science',
    chapterNo: 'Ch 2',
    topic: 'Chemistry',
    year: 'Class 10',
    readTime: '20 min',
    progress: 80,
    spineWidth: 36,
    spineHeight: 220,
    colorScheme: {
      spineBg: 'from-[#164E63] via-[#0891B2] to-[#155E75]',
      spineBorder: '#06B6D4',
      spineText: '#ECFEFF',
      coverBg: '#155E75',
      accent: '#67E8F9',
      badgeBg: '#ECFEFF',
      badgeText: '#0891B2',
    },
    excerpt: 'pH scale, universal indicators, neutralization reactions, preparation of Sodium Hydroxide, Bleaching Powder, Baking Soda, Washing Soda and Plaster of Paris.',
    exLibrisId: 'NCERT-SCI-02',
    shelvedDate: 'Term 1 Syllabus',
    artType: 'atom',
  },

  // MATHEMATICS (Rose / Ruby / Magenta) - NCERT Class 10 Mathematics
  {
    id: 'cbse-math-1',
    title: 'Quadratic Equations & Roots Nature',
    shortTitle: 'Quadratic Equations',
    author: 'NCERT Mathematics',
    subject: 'Maths',
    chapterNo: 'Ch 4',
    topic: 'Algebra',
    year: 'Class 10',
    readTime: '25 min',
    progress: 85,
    spineWidth: 42,
    spineHeight: 236,
    colorScheme: {
      spineBg: 'from-[#831843] via-[#9D174D] to-[#701A39]',
      spineBorder: '#DB2777',
      spineText: '#FCE7F3',
      coverBg: '#831843',
      accent: '#F472B6',
      badgeBg: '#FCE7F3',
      badgeText: '#BE185D',
    },
    hasRibbon: true,
    ribbonColor: '#F43F5E',
    excerpt: 'Standard form ax² + bx + c = 0, solution by factorization, completing the square, quadratic formula x = (-b ± √(b² - 4ac))/(2a), and discriminant analysis.',
    exLibrisId: 'NCERT-MTH-04',
    shelvedDate: 'Term 1 Syllabus',
    artType: 'geometry',
  },
  {
    id: 'cbse-math-2',
    title: 'Introduction to Trigonometry & Heights',
    shortTitle: 'Trigonometry',
    author: 'NCERT Mathematics',
    subject: 'Maths',
    chapterNo: 'Ch 8',
    topic: 'Trigonometry',
    year: 'Class 10',
    readTime: '32 min',
    progress: 60,
    spineWidth: 44,
    spineHeight: 234,
    colorScheme: {
      spineBg: 'from-[#9F1239] via-[#BE123C] to-[#881337]',
      spineBorder: '#E11D48',
      spineText: '#FFE4E6',
      coverBg: '#9F1239',
      accent: '#FB7185',
      badgeBg: '#FFE4E6',
      badgeText: '#E11D48',
    },
    hasRibbon: true,
    ribbonColor: '#FBBF24',
    excerpt: 'Trigonometric ratios sin, cos, tan, cosec, sec, cot for acute angles 0°, 30°, 45°, 60°, 90°, fundamental identity sin²θ + cos²θ = 1, and angles of elevation & depression.',
    exLibrisId: 'NCERT-MTH-08',
    shelvedDate: 'Term 2 Syllabus',
    artType: 'spiral',
  },
  {
    id: 'cbse-math-3',
    title: 'Arithmetic Progressions (AP Series)',
    shortTitle: 'Arithmetic Progressions',
    author: 'NCERT Mathematics',
    subject: 'Maths',
    chapterNo: 'Ch 5',
    topic: 'Algebra',
    year: 'Class 10',
    readTime: '22 min',
    progress: 75,
    spineWidth: 38,
    spineHeight: 228,
    colorScheme: {
      spineBg: 'from-[#881337] via-[#9F1239] to-[#701A39]',
      spineBorder: '#F43F5E',
      spineText: '#FFE4E6',
      coverBg: '#881337',
      accent: '#FDA4AF',
      badgeBg: '#FFE4E6',
      badgeText: '#BE123C',
    },
    excerpt: 'General form of an AP, common difference d, nth term an = a + (n - 1)d, and derivation of sum of first n terms Sn = n/2 [2a + (n - 1)d] with practical word problems.',
    exLibrisId: 'NCERT-MTH-05',
    shelvedDate: 'Term 1 Syllabus',
    artType: 'geometry',
  },
  {
    id: 'cbse-math-4',
    title: 'Triangles, Circles & Coordinate Geometry',
    shortTitle: 'Triangles & Geometry',
    author: 'NCERT Mathematics',
    subject: 'Maths',
    chapterNo: 'Ch 6',
    topic: 'Geometry',
    year: 'Class 10',
    readTime: '35 min',
    progress: 40,
    spineWidth: 46,
    spineHeight: 240,
    colorScheme: {
      spineBg: 'from-[#701A75] via-[#86198F] to-[#581C87]',
      spineBorder: '#C026D3',
      spineText: '#FDF4FF',
      coverBg: '#701A75',
      accent: '#E879F9',
      badgeBg: '#FDF4FF',
      badgeText: '#A21CAF',
    },
    excerpt: 'Basic Proportionality Theorem (Thales Theorem), AAA, SAS and SSS similarity criteria, tangents to a circle from an external point, distance and section formulas.',
    exLibrisId: 'NCERT-MTH-06',
    shelvedDate: 'Term 2 Syllabus',
    artType: 'spiral',
  },

  // HISTORY & SOCIAL SCIENCE (Amber / Golden Bronze) - NCERT India and the Contemporary World II
  {
    id: 'cbse-hist-1',
    title: 'The Rise of Nationalism in Europe',
    shortTitle: 'Nationalism in Europe',
    author: 'NCERT History',
    subject: 'History',
    chapterNo: 'Ch 1',
    topic: 'History',
    year: 'Class 10',
    readTime: '28 min',
    progress: 88,
    spineWidth: 42,
    spineHeight: 232,
    colorScheme: {
      spineBg: 'from-[#78350F] via-[#92400E] to-[#692906]',
      spineBorder: '#D97706',
      spineText: '#FEF3C7',
      coverBg: '#78350F',
      accent: '#FBBF24',
      badgeBg: '#FEF3C7',
      badgeText: '#B45309',
    },
    hasRibbon: true,
    ribbonColor: '#F59E0B',
    excerpt: 'Frédéric Sorrieu’s utopian vision, French Revolution and the idea of the Nation, Napoleonic Code 1804, Romanticism, and the unification of Italy and Germany.',
    exLibrisId: 'NCERT-HIS-01',
    shelvedDate: 'Term 1 Syllabus',
    artType: 'pillar',
  },
  {
    id: 'cbse-hist-2',
    title: 'Nationalism in India (Non-Cooperation & Civil Disobedience)',
    shortTitle: 'Nationalism in India',
    author: 'NCERT History',
    subject: 'History',
    chapterNo: 'Ch 2',
    topic: 'History',
    year: 'Class 10',
    readTime: '32 min',
    progress: 65,
    spineWidth: 44,
    spineHeight: 236,
    colorScheme: {
      spineBg: 'from-[#854D0E] via-[#A16207] to-[#713F12]',
      spineBorder: '#EAB308',
      spineText: '#FEF9C3',
      coverBg: '#854D0E',
      accent: '#FACC15',
      badgeBg: '#FEF9C3',
      badgeText: '#CA8A04',
    },
    hasRibbon: true,
    ribbonColor: '#DC2626',
    excerpt: 'The Rowlatt Act, Jallianwala Bagh massacre, Khilafat movement, Mahatma Gandhi’s Non-Cooperation Movement, Dandi Salt March 1930, and the sense of collective belonging.',
    exLibrisId: 'NCERT-HIS-02',
    shelvedDate: 'Term 1 Syllabus',
    artType: 'pillar',
  },
  {
    id: 'cbse-hist-3',
    title: 'Power Sharing & Federalism in India',
    shortTitle: 'Power Sharing & Civics',
    author: 'NCERT Civics',
    subject: 'History',
    chapterNo: 'Ch 1',
    topic: 'Political Science',
    year: 'Class 10',
    readTime: '20 min',
    progress: 95,
    spineWidth: 36,
    spineHeight: 222,
    colorScheme: {
      spineBg: 'from-[#653310] via-[#7B3F16] to-[#542B0D]',
      spineBorder: '#B45309',
      spineText: '#FEF3C7',
      coverBg: '#653310',
      accent: '#F59E0B',
      badgeBg: '#FEF3C7',
      badgeText: '#92400E',
    },
    excerpt: 'Ethnic composition and power sharing in Belgium vs Sri Lanka, majoritarian crisis, federal system features in India, Union, State and Concurrent lists, and decentralization.',
    exLibrisId: 'NCERT-CIV-01',
    shelvedDate: 'Term 1 Syllabus',
    artType: 'pillar',
  },
  {
    id: 'cbse-hist-4',
    title: 'Resources, Development & Indian Economy',
    shortTitle: 'Resources & Economics',
    author: 'NCERT Geography/Econ',
    subject: 'History',
    chapterNo: 'Ch 1',
    topic: 'Economics',
    year: 'Class 10',
    readTime: '24 min',
    progress: 50,
    spineWidth: 38,
    spineHeight: 224,
    colorScheme: {
      spineBg: 'from-[#78350F] via-[#854D0E] to-[#542B0D]',
      spineBorder: '#D97706',
      spineText: '#FEF3C7',
      coverBg: '#78350F',
      accent: '#FBBF24',
      badgeBg: '#FEF3C7',
      badgeText: '#B45309',
    },
    excerpt: 'Resource conservation, Rio Earth Summit 1992, Agenda 21, land degradation, Primary, Secondary and Tertiary sectors of Indian economy, and rising importance of tertiary sector.',
    exLibrisId: 'NCERT-GEO-01',
    shelvedDate: 'Term 2 Syllabus',
    artType: 'tree',
  },

  // CODING & IT (Purple / Indigo) - CBSE Class 10 IT (Subject Code 402 / 165)
  {
    id: 'cbse-code-1',
    title: 'Information Technology (CBSE Code 402)',
    shortTitle: 'IT 402 Curriculum',
    author: 'CBSE Skill Education',
    subject: 'Coding',
    chapterNo: 'Part B',
    topic: 'Information Tech',
    year: 'Class 10',
    readTime: '28 min',
    progress: 82,
    spineWidth: 42,
    spineHeight: 234,
    colorScheme: {
      spineBg: 'from-[#2D2A54] via-[#3B3868] to-[#252248]',
      spineBorder: '#4E4984',
      spineText: '#E0E7FF',
      coverBg: '#352F5B',
      accent: '#818CF8',
      badgeBg: '#EEF2FF',
      badgeText: '#4F46E5',
    },
    hasRibbon: true,
    ribbonColor: '#EC4899',
    excerpt: 'Digital documentation using styles and mail merge, electronic spreadsheets with scenarios and Goal Seek, Relational Database Management Systems (RDBMS) and SQL commands.',
    exLibrisId: 'CBSE-IT-402',
    shelvedDate: 'Board Practical Unit',
    artType: 'neural',
  },
  {
    id: 'cbse-code-2',
    title: 'Python Programming & Algorithmic Thinking',
    shortTitle: 'Python & Algorithms',
    author: 'CBSE Computer Applications',
    subject: 'Coding',
    chapterNo: 'Unit 2',
    topic: 'Coding',
    year: 'Class 10',
    readTime: '34 min',
    progress: 70,
    spineWidth: 44,
    spineHeight: 238,
    colorScheme: {
      spineBg: 'from-[#3730A3] via-[#4338CA] to-[#312E81]',
      spineBorder: '#6366F1',
      spineText: '#EEF2FF',
      coverBg: '#312E81',
      accent: '#A5B4FC',
      badgeBg: '#EDE9FE',
      badgeText: '#6366F1',
    },
    hasRibbon: true,
    ribbonColor: '#F59E0B',
    excerpt: 'Variables, data types, if-elif-else statements, for/while loops, nested iterations, list manipulation, functions, and solving CBSE logic puzzles with verified pseudocode.',
    exLibrisId: 'CBSE-CA-165',
    shelvedDate: 'Practical Coding Lab',
    artType: 'geometry',
  },
  {
    id: 'cbse-code-3',
    title: 'HTML, CSS Web Design & Cyber Ethics',
    shortTitle: 'Web Design & Ethics',
    author: 'CBSE Computer Applications',
    subject: 'Coding',
    chapterNo: 'Unit 3',
    topic: 'Web Design',
    year: 'Class 10',
    readTime: '22 min',
    progress: 60,
    spineWidth: 38,
    spineHeight: 226,
    colorScheme: {
      spineBg: 'from-[#312E81] via-[#3730A3] to-[#252260]',
      spineBorder: '#6366F1',
      spineText: '#EEF2FF',
      coverBg: '#312E81',
      accent: '#A5B4FC',
      badgeBg: '#EEF2FF',
      badgeText: '#4F46E5',
    },
    excerpt: 'HTML5 semantic tags, tables, forms, inline/internal CSS styling, digital footprint, cyber safety, open source licensing, and intellectual property rights.',
    exLibrisId: 'CBSE-CA-166',
    shelvedDate: 'Board Theory Unit',
    artType: 'neural',
  },
];

interface LearnPageProps {
  onBackToHome?: () => void;
  onStartSession?: (topic: string) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  onBackToHome,
  onStartSession
}) => {
  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Coding' | 'Maths' | 'Science' | 'History'>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'Shelf' | 'Topics' | 'Map'>('Shelf');
  
  // Selected book for the 3D animated opening sequence
  const [activeBook, setActiveBook] = useState<BookItem | null>(null);
  // Stage: 'closed' | 'pullout' | 'facing' | 'open'
  const [bookStage, setBookStage] = useState<'closed' | 'pullout' | 'facing' | 'open'>('closed');

  // Handle book click with staged animation
  const handleOpenBook = (book: BookItem) => {
    setActiveBook(book);
    setBookStage('pullout');

    // Stage 1 -> 2: Pull out in 3D perspective
    setTimeout(() => {
      setBookStage('facing');
    }, 450);

    // Stage 2 -> 3: Face forward then open like a book spread
    setTimeout(() => {
      setBookStage('open');
    }, 900);
  };

  const handleCloseBook = () => {
    setBookStage('facing');
    setTimeout(() => {
      setBookStage('closed');
      setTimeout(() => {
        setActiveBook(null);
      }, 300);
    }, 300);
  };

  // Keyboard shortcut: Esc to put back book
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeBook) {
        handleCloseBook();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBook]);

  // Filter books (All 10th grade CBSE books)
  const filteredBooks = CBSE_10TH_BOOKS_DATA.filter((book) => {
    const matchesSubject = selectedSubject === 'All' || book.subject === selectedSubject;
    const matchesTopic = selectedTopic === 'All' || book.topic === selectedTopic;
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesTopic && matchesSearch;
  });

  // Count metrics for CBSE Class 10
  const totalCount = CBSE_10TH_BOOKS_DATA.length;
  const scienceCount = CBSE_10TH_BOOKS_DATA.filter(b => b.subject === 'Science').length;
  const mathCount = CBSE_10TH_BOOKS_DATA.filter(b => b.subject === 'Maths').length;
  const historyCount = CBSE_10TH_BOOKS_DATA.filter(b => b.subject === 'History').length;
  const codingCount = CBSE_10TH_BOOKS_DATA.filter(b => b.subject === 'Coding').length;

  return (
    <div className="w-full min-h-screen bg-transparent text-[#1E1B2E] p-4 sm:p-8 selection:bg-purple-200">
      
      {/* Top Header Section (Matches rest of app design system) */}
      <div className="max-w-7xl mx-auto mb-7">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#7C5CFF] mb-1.5">
          <GraduationCap className="w-4 h-4 text-[#7C5CFF]" />
          <span>CBSE Class 10 • Academic Library</span>
        </div>

        {/* Clean Modern Heading matching Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1E1B2E]">
              Your Library
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] font-normal mt-1">
              NCERT & CBSE Board 10th Grade Standard Curated Textbooks
            </p>
          </div>

          {/* Quick Breadcrumb/Back link */}
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="text-xs font-semibold text-[#64748B] hover:text-[#1E1B2E] flex items-center gap-1.5 transition-colors bg-white px-3.5 py-2 rounded-xl border border-purple-100 shadow-sm"
            >
              <CornerDownLeft className="w-3.5 h-3.5 text-[#7C5CFF]" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>

        {/* Stats Summary Line */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#64748B] mt-3 font-medium">
          <span className="font-bold text-[#1E1B2E]">{totalCount}</span> CBSE 10th books
          <span>•</span>
          <span className="font-bold text-[#1E1B2E]">4</span> core streams
          <span>•</span>
          <span className="font-bold text-[#1E1B2E]">100%</span> NCERT aligned
          <span>•</span>
          <span className="font-bold text-[#1E1B2E]">1</span> unified master shelf
          <span>•</span>
          <span className="font-bold text-[#7C5CFF]">Board Exam 2026</span>
        </div>
      </div>

      {/* Control Bar: View Pills, Search Input, Arrange By */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: View Mode Toggles */}
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-purple-100 shadow-sm w-fit">
          <button
            onClick={() => setViewMode('Shelf')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'Shelf' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20' 
                : 'text-[#64748B] hover:text-[#1E1B2E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Single Shelf</span>
          </button>
          <button
            onClick={() => setViewMode('Topics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'Topics' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20' 
                : 'text-[#64748B] hover:text-[#1E1B2E]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Chapters</span>
          </button>
          <button
            onClick={() => setViewMode('Map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'Map' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20' 
                : 'text-[#64748B] hover:text-[#1E1B2E]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Syllabus Map</span>
          </button>
        </div>

        {/* Center: Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CBSE Class 10 chapter, topic, or subject..."
            className="w-full bg-white/90 backdrop-blur-md border border-purple-100 rounded-2xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-[#1E1B2E] placeholder-[#94A3B8] shadow-sm focus:outline-hidden focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Arrange Indicators */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#64748B]">
          <span>Arrange by:</span>
          <span className="font-semibold text-[#1E1B2E] bg-white px-2.5 py-1 rounded-xl border border-purple-100 shadow-xs">
            Subject
          </span>
          <span className="hover:text-[#1E1B2E] cursor-pointer">Chapter</span>
          <span className="hover:text-[#1E1B2E] cursor-pointer">Term</span>
          <span className="hover:text-[#1E1B2E] cursor-pointer">Progress</span>
        </div>
      </div>

      {/* Subject Filter Pills (Color-coded to design system!) */}
      <div className="max-w-7xl mx-auto mb-8 overflow-x-auto pb-2 [scrollbar-width:none]">
        <div className="flex items-center gap-2 min-w-max">
          
          {/* All */}
          <button
            onClick={() => { setSelectedSubject('All'); setSelectedTopic('All'); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedSubject === 'All' && selectedTopic === 'All'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-white text-[#64748B] hover:text-[#1E1B2E] border border-purple-100 shadow-xs'
            }`}
          >
            All 10th CBSE <span className="opacity-75 ml-1">{totalCount}</span>
          </button>

          {/* Science (Cyan / Sky) */}
          <button
            onClick={() => { setSelectedSubject('Science'); setSelectedTopic('All'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedSubject === 'Science'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-sky-50 text-[#0284C7] border border-sky-200/60 hover:bg-sky-100/70 shadow-xs'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Science</span>
            <span className="opacity-75 text-[11px]">{scienceCount}</span>
          </button>

          {/* Maths (Pink / Rose) */}
          <button
            onClick={() => { setSelectedSubject('Maths'); setSelectedTopic('All'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedSubject === 'Maths'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20'
                : 'bg-pink-50 text-[#EC4899] border border-pink-200/60 hover:bg-pink-100/70 shadow-xs'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span>Maths</span>
            <span className="opacity-75 text-[11px]">{mathCount}</span>
          </button>

          {/* History / Social Science (Amber / Golden Bronze) */}
          <button
            onClick={() => { setSelectedSubject('History'); setSelectedTopic('All'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedSubject === 'History'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-amber-50 text-[#D97706] border border-amber-200/60 hover:bg-amber-100/70 shadow-xs'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Social Science</span>
            <span className="opacity-75 text-[11px]">{historyCount}</span>
          </button>

          {/* Coding / IT 402 (Indigo / Violet) */}
          <button
            onClick={() => { setSelectedSubject('Coding'); setSelectedTopic('All'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedSubject === 'Coding'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-purple-50 text-[#7C5CFF] border border-purple-200/60 hover:bg-purple-100/70 shadow-xs'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Coding (IT 402)</span>
            <span className="opacity-75 text-[11px]">{codingCount}</span>
          </button>

          <div className="h-4 w-[1px] bg-purple-100 mx-1" />

          {/* Chapter & Branch Pills */}
          {['Biology', 'Chemistry', 'Physics', 'Algebra', 'Trigonometry', 'History', 'Political Science', 'Information Tech', 'Coding'].map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(selectedTopic === topic ? 'All' : topic)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedTopic === topic
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#1E1B2E] border border-purple-100 shadow-xs'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          EXACTLY 1 SHELF FOR ALL CBSE CLASS 10TH BOOKS
          ======================================================== */}
      <div className="max-w-7xl mx-auto pb-24">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 text-[#64748B] bg-white rounded-2xl border border-purple-100 shadow-sm">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-purple-500" />
            <p className="text-base font-semibold text-[#1E1B2E]">No Class 10 books matched your query.</p>
            <button
              onClick={() => { setSelectedSubject('All'); setSelectedTopic('All'); setSearchQuery(''); }}
              className="mt-3 text-xs font-bold text-[#7C5CFF] hover:underline"
            >
              Show all 16 CBSE 10th books
            </button>
          </div>
        ) : (
          <div className="relative bg-white/90 backdrop-blur-md p-4 sm:p-7 rounded-3xl border border-purple-100 shadow-[0_10px_35px_rgba(124,92,255,0.06)]">
            
            {/* Shelf Title & Indicator (Matches rest of app typography) */}
            <div className="flex items-center justify-between mb-2 px-2 text-xs font-bold text-[#64748B]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[#1E1B2E] font-extrabold uppercase tracking-wider">
                  Class 10 CBSE Board Shelf
                </span>
                <span className="text-[#94A3B8]">•</span>
                <span className="font-normal text-[#64748B]">{filteredBooks.length} Books Standing</span>
              </div>
              <span className="text-[11px] font-semibold text-[#7C5CFF] hidden sm:inline">
                Click any spine to pull out & open in 3D
              </span>
            </div>

            {/* Books Row: Exactly 1 continuous shelf showing all filtered books (No scrollbar) */}
            <div className="relative flex items-end gap-1.5 sm:gap-2.5 px-2 sm:px-6 pt-8 min-h-[270px] overflow-x-auto pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              
              {filteredBooks.map((book) => {
                return (
                  <div
                    key={book.id}
                    onClick={() => handleOpenBook(book)}
                    style={{
                      width: `${book.spineWidth}px`,
                      height: `${book.spineHeight}px`,
                    }}
                    className="group relative cursor-pointer select-none shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-5 hover:z-20"
                    title={`${book.shortTitle} (${book.chapterNo}) - Click to inspect & open`}
                  >
                    {/* Top Ribbon bookmark poking out */}
                    {book.hasRibbon && (
                      <div
                        style={{ backgroundColor: book.ribbonColor || '#EC4899' }}
                        className="absolute -top-3.5 right-2 w-2 h-4 rounded-t-xs shadow-xs z-10"
                      />
                    )}

                    {/* 3D Realistic Spine Card */}
                    <div
                      className={`w-full h-full rounded-t-sm rounded-b-xs bg-gradient-to-r ${book.colorScheme.spineBg} shadow-[inset_2px_0_4px_rgba(255,255,255,0.25),inset_-3px_0_5px_rgba(0,0,0,0.5),0_6px_14px_rgba(0,0,0,0.25)] border-t border-r border-l border-white/20 flex flex-col justify-between py-3 px-1 items-center relative overflow-hidden`}
                    >
                      {/* Spine Crease / Book hinge shadow line */}
                      <div className="absolute top-0 bottom-0 left-1 w-[1.5px] bg-black/40 blur-[0.5px]" />
                      <div className="absolute top-0 bottom-0 right-1 w-[1px] bg-white/20" />

                      {/* Top Spine Mark / Chapter Number */}
                      <div className="w-full flex justify-center text-[10px] text-white/80 font-mono font-bold">
                        <span>{book.chapterNo}</span>
                      </div>

                      {/* Vertical Title (running down the spine) */}
                      <div className="flex-1 flex items-center justify-center py-2 overflow-hidden">
                        <span
                          style={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            color: book.colorScheme.spineText,
                          }}
                          className="font-serif-editorial text-[11px] sm:text-[12px] font-semibold tracking-wider truncate max-h-[165px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] uppercase"
                        >
                          {book.shortTitle}
                        </span>
                      </div>

                      {/* Bottom Author / Subject Stamp */}
                      <div className="w-full text-center">
                        <div className="w-3/4 mx-auto h-[1px] bg-white/20 mb-1" />
                        <span className="text-[8px] font-mono text-white/70 tracking-tighter uppercase truncate block">
                          {book.subject}
                        </span>
                      </div>
                    </div>

                    {/* Elevated Hover Shadow onto Shelf */}
                    <div className="absolute -bottom-2 inset-x-1 h-2 bg-black/30 rounded-full blur-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}

              {/* Wooden Bookend on the right */}
              <div className="h-32 w-5 bg-gradient-to-r from-[#78716C] via-[#57534E] to-[#44403C] rounded-t-xl shadow-lg shrink-0 self-end mb-0.5 border-t border-r border-stone-400" />
            </div>

            {/* Physical Wooden Shelf Ledge (Single continuous ledge) */}
            <div className="relative w-full z-10 mt-0">
              {/* Top Wooden Surface */}
              <div className="h-4 bg-gradient-to-r from-[#E5DEC9] via-[#F0EADB] to-[#DDD4BE] rounded-t-xs border-t border-[#D5C9AC] shadow-inner" />
              {/* Front Facing Wooden Lip / Bevel */}
              <div className="h-6 bg-gradient-to-b from-[#C9BC9B] to-[#AD9F7B] rounded-b-md border-b border-[#8C7E5E] shadow-[0_14px_28px_-4px_rgba(0,0,0,0.25)] flex items-center px-6 justify-between">
                <div className="w-1/3 h-[1px] bg-white/30" />
                <span className="text-[9px] font-sans uppercase tracking-widest text-[#574E38] font-bold">
                  CBSE CLASS X • NCERT 2026
                </span>
                <div className="w-1/3 h-[1px] bg-white/30" />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ========================================================
          3D INTERACTIVE BOOK MODAL: PULL OUT & OPEN ANIMATION
         ======================================================== */}
      {activeBook && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-all duration-500 ${
            bookStage === 'closed' ? 'bg-black/0 opacity-0 pointer-events-none' : 'bg-[#0F0D17]/75 backdrop-blur-md opacity-100'
          }`}
          onClick={handleCloseBook}
        >
          {/* Main Book Stage Container (stops background click propagation) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="perspective-book relative w-full max-w-2xl flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            
            {/* STAGE 1 & 2: 3D BOOK COVER VIEW (Facing or Angled Pullout) */}
            {(bookStage === 'pullout' || bookStage === 'facing') && (
              <div
                style={{
                  transform: bookStage === 'pullout' 
                    ? 'rotateY(-28deg) rotateX(4deg) translateZ(60px) scale(1.03)' 
                    : 'rotateY(0deg) scale(1)',
                  transformStyle: 'preserve-3d',
                }}
                className="relative w-[280px] sm:w-[330px] h-[390px] sm:h-[450px] max-h-[82vh] rounded-r-2xl rounded-l-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5),0_18px_36px_-18px_rgba(0,0,0,0.6)] cursor-pointer select-none"
                onClick={() => setBookStage('open')}
              >
                {/* 3D Spine Thickness (visible when angled in pullout stage) */}
                <div
                  style={{
                    backgroundColor: activeBook.colorScheme.coverBg,
                    transform: 'rotateY(-90deg) translateZ(0px)',
                    transformOrigin: 'left',
                  }}
                  className="absolute left-0 top-0 bottom-0 w-[42px] rounded-l-md bg-stone-900 shadow-inner flex flex-col justify-between py-6 px-1 items-center"
                >
                  <span
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    className="font-serif-editorial text-xs text-white/80 font-bold tracking-widest uppercase truncate max-h-[260px]"
                  >
                    {activeBook.shortTitle}
                  </span>
                </div>

                {/* Book Front Cover Face */}
                <div
                  style={{ backgroundColor: activeBook.colorScheme.coverBg }}
                  className="w-full h-full rounded-r-2xl rounded-l-md p-5 sm:p-6 flex flex-col justify-between border border-white/20 relative overflow-hidden"
                >
                  {/* Subtle leather / woven cover texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

                  {/* Embossed inner border frame */}
                  <div className="absolute inset-2.5 rounded-xl border border-white/25 pointer-events-none" />

                  {/* Top Subject Tag & Chapter */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] tracking-wider uppercase font-semibold text-white/80">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                      {activeBook.subject} • {activeBook.chapterNo}
                    </span>
                    <span>CBSE 10th</span>
                  </div>

                  {/* Center Editorial Woodcut / Geometric Illustration Box */}
                  <div className="relative z-10 w-full h-32 sm:h-40 bg-[#F6F3EC] rounded-lg border border-white/40 shadow-inner p-3 flex flex-col items-center justify-center my-auto overflow-hidden">
                    {/* Artistic Vector Motif depending on artType */}
                    {activeBook.artType === 'tree' && (
                      <svg width="85" height="85" viewBox="0 0 100 100" fill="none" className="text-[#3F3935]">
                        <path d="M50 85V55M50 55C40 45 25 45 15 35M50 55C60 45 75 45 85 35M50 40C42 30 35 20 30 10M50 40C58 30 65 20 70 10M50 30V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                        <circle cx="50" cy="85" r="4" fill="currentColor"/>
                        <path d="M30 85H70" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="15" cy="35" r="3" fill="#0284C7" />
                        <circle cx="85" cy="35" r="3" fill="#0284C7" />
                        <circle cx="50" cy="5" r="3" fill="#10B981" />
                      </svg>
                    )}

                    {activeBook.artType === 'atom' && (
                      <svg width="85" height="85" viewBox="0 0 100 100" fill="none" className="text-[#0369A1]">
                        <circle cx="50" cy="50" r="8" fill="#0284C7" />
                        <ellipse cx="50" cy="50" rx="38" ry="16" stroke="currentColor" strokeWidth="2" transform="rotate(30 50 50)" />
                        <ellipse cx="50" cy="50" rx="38" ry="16" stroke="currentColor" strokeWidth="2" transform="rotate(-30 50 50)" />
                        <ellipse cx="50" cy="50" rx="38" ry="16" stroke="currentColor" strokeWidth="2" transform="rotate(90 50 50)" />
                      </svg>
                    )}

                    {activeBook.artType === 'pillar' && (
                      <svg width="85" height="85" viewBox="0 0 100 100" fill="none" className="text-[#92400E]">
                        <path d="M20 85H80M25 80H75M30 30V80M45 30V80M55 30V80M70 30V80M20 30H80M50 15L20 30H80L50 15Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}

                    {activeBook.artType === 'neural' && (
                      <svg width="85" height="85" viewBox="0 0 100 100" fill="none" className="text-[#4338CA]">
                        <circle cx="30" cy="30" r="6" fill="currentColor"/>
                        <circle cx="70" cy="30" r="6" fill="currentColor"/>
                        <circle cx="50" cy="50" r="8" fill="#8B5CF6"/>
                        <circle cx="30" cy="70" r="6" fill="currentColor"/>
                        <circle cx="70" cy="70" r="6" fill="currentColor"/>
                        <path d="M30 30L50 50M70 30L50 50M30 70L50 50M70 70L50 50" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
                      </svg>
                    )}

                    {activeBook.artType === 'spiral' && (
                      <svg width="85" height="85" viewBox="0 0 100 100" fill="none" className="text-[#BE185D]">
                        <path d="M50 50 A5 5 0 0 1 55 50 A10 10 0 0 1 45 50 A15 15 0 0 1 60 50 A20 20 0 0 1 40 50 A25 25 0 0 1 65 50 A30 30 0 0 1 35 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    )}

                    {activeBook.artType === 'geometry' && (
                      <svg width="85" height="85" viewBox="0 0 100 100" fill="none" className="text-[#3730A3]">
                        <polygon points="50,15 85,75 15,75" stroke="currentColor" strokeWidth="2.5" fill="none" />
                        <circle cx="50" cy="55" r="20" stroke="#EC4899" strokeWidth="2" fill="none" />
                      </svg>
                    )}

                    <span className="text-[9px] uppercase font-sans tracking-widest text-[#78716C] mt-1.5 font-semibold">
                      CBSE CLASS 10 • {activeBook.exLibrisId}
                    </span>
                  </div>

                  {/* Bottom Book Info */}
                  <div className="relative z-10 pt-1">
                    <h3 className="font-serif-editorial text-lg sm:text-xl font-bold text-white tracking-tight leading-snug drop-shadow-sm">
                      {activeBook.title}
                    </h3>
                    <p className="font-serif-editorial italic text-xs text-white/80 mt-0.5">
                      {activeBook.author}
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-white/60 flex items-center justify-between font-sans">
                      <span>Click to open chapter</span>
                      <span>{activeBook.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3: OPEN TWO-PAGE SPREAD! (Fits Viewport Perfectly & Matches Rest of App) */}
            {bookStage === 'open' && (
              <div
                className="relative w-full max-w-3xl max-h-[85vh] bg-[#1E1B2E] p-2 sm:p-2.5 rounded-2xl shadow-[0_35px_70px_-15px_rgba(15,13,23,0.65)] border border-purple-900/40 transition-all duration-500 scale-100 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95"
              >
                {/* Top Right Quick Close Button */}
                <button
                  onClick={handleCloseBook}
                  className="absolute top-3 right-3 z-30 w-7 h-7 rounded-full bg-[#1E1B2E]/80 hover:bg-[#1E1B2E] text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md border border-white/10"
                  title="Close book (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Book Center Binding Crease Shadow */}
                <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/25 via-black/40 to-black/25 z-20 pointer-events-none" />

                {/* LEFT PAGE: Endpaper pattern + "EX LIBRIS" Bookplate Sticker */}
                <div className="flex-1 bg-[#F9F7FC] rounded-l-xl p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-0">
                  {/* Subtle purple dot endpaper texture */}
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#7C5CFF 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                    }}
                  />

                  {/* EX LIBRIS Bookplate Card */}
                  <div className="relative z-10 w-full max-w-[210px] bg-white rounded-xl p-4 shadow-[0_4px_16px_rgba(124,92,255,0.08)] border border-purple-100 text-center flex flex-col items-center">
                    <span className="text-[9px] font-bold tracking-widest text-[#7C5CFF] uppercase mb-2 font-sans">
                      CBSE CURRICULUM
                    </span>

                    {/* Whimsical squiggly signature art */}
                    <div className="my-1.5 text-purple-600/70">
                      <svg width="85" height="34" viewBox="0 0 100 42" fill="none">
                        <path d="M5 12C15 2 25 22 35 12C45 2 55 22 65 12C75 2 85 22 95 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 26C20 16 30 36 40 26C50 16 60 36 70 26C80 16 90 36 95 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>

                    <h4 className="font-serif-editorial italic text-sm sm:text-base font-bold text-[#1E1B2E] mt-0.5">
                      10th Grade Scholar
                    </h4>
                    <p className="text-[10px] font-medium text-[#64748B] mt-1.5 font-sans">
                      {activeBook.exLibrisId} • {activeBook.shelvedDate}
                    </p>
                  </div>

                  {/* Subject Badge at bottom of left page */}
                  <div className="relative z-10 mt-4 flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-xs rounded-full border border-purple-100 text-[11px] font-semibold text-[#1E1B2E] font-sans">
                    <Sparkles className="w-3 h-3 text-[#7C5CFF]" />
                    <span>{activeBook.subject} ({activeBook.chapterNo})</span>
                  </div>
                </div>

                {/* RIGHT PAGE: Reading Content & Action Card (Body text matching rest of app) */}
                <div className="flex-1 bg-white rounded-r-xl p-4 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh] min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-t md:border-t-0 md:border-l border-purple-100 font-sans">
                  <div>
                    {/* Top Tag & Reading Estimate */}
                    <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 pr-6 md:pr-0 font-sans">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span 
                          style={{ backgroundColor: activeBook.colorScheme.badgeBg, color: activeBook.colorScheme.badgeText }}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        >
                          {activeBook.subject} • {activeBook.topic}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-[#64748B] font-semibold">{activeBook.year}</span>
                      </div>
                      <span className="font-semibold text-[11px] text-[#64748B]">{activeBook.readTime}</span>
                    </div>

                    {/* Book Title (Editorial serif for title heading is preserved) */}
                    <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#1E1B2E] tracking-tight leading-snug">
                      {activeBook.title}
                    </h3>

                    {/* Author (Clean font-sans) */}
                    <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1 font-sans">
                      {activeBook.author} • <span className="font-semibold text-[#7C5CFF]">{activeBook.chapterNo}</span>
                    </p>

                    {/* Excerpt / Overview - Inside body matches rest of app! */}
                    <div className="mt-3 p-3 bg-purple-50/40 rounded-xl border border-purple-100 text-xs text-[#334155] leading-relaxed font-sans">
                      <div className="flex items-center gap-1.5 font-bold text-[#1E1B2E] mb-1">
                        <Volume2 className="w-3.5 h-3.5 text-[#7C5CFF]" />
                        <span>Core NCERT Concepts:</span>
                      </div>
                      <p className="line-clamp-4 text-[#475569]">{activeBook.excerpt}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 font-sans">
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1 text-[#64748B]">
                        <span>Board Prep Mastery</span>
                        <span className="text-[#1E1B2E] font-bold">{activeBook.progress > 0 ? `${activeBook.progress}%` : 'Not started'}</span>
                      </div>
                      <div className="h-1.5 bg-purple-50 rounded-full overflow-hidden border border-purple-100/50">
                        <div 
                          style={{ width: `${Math.max(activeBook.progress, 5)}%` }}
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Matches rest of app) */}
                  <div className="pt-3 mt-2 border-t border-purple-50 flex flex-col gap-2 shrink-0 font-sans">
                    
                    {/* Primary Button: Start Explaining with EXO */}
                    <button
                      onClick={() => {
                        if (onStartSession) {
                          onStartSession(`${activeBook.shortTitle} (Class 10 ${activeBook.subject})`);
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 transition-all hover:scale-[1.01]"
                    >
                      <span>Explain with EXO Voice</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>

                    {/* Footer Row: Put it back [Esc] */}
                    <div className="flex items-center justify-between pt-0.5 text-xs text-[#64748B]">
                      <span className="text-[11px] text-[#94A3B8]">
                        cbse.nic.in/{activeBook.id}
                      </span>

                      <button
                        onClick={handleCloseBook}
                        className="hover:text-[#1E1B2E] font-semibold flex items-center gap-1 transition-colors text-xs"
                      >
                        <span>Put it back</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-700 border border-purple-200/80 rounded-md font-sans font-medium">
                          Esc
                        </kbd>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
