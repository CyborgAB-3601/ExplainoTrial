import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  HelpCircle,
  ChevronRight,
  Award,
  Play,
  Minus,
  Plus,
  Compass,
  Zap,
  Target
} from 'lucide-react';

export interface TrajectoryTitanGameProps {
  onBack?: () => void;
  className?: string;
}

// Level definition with real kinematic concepts
interface GameLevel {
  id: number;
  title: string;
  conceptName: string;
  conceptFormula: string;
  hint: string;
  explanation: string;
  gravity: number; // m/s^2
  targetX: number;
  targetY: number;
  obstacles: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    type: 'wood' | 'stone' | 'glass';
    health: number;
  }>;
  parScore: number;
  maxShots: number;
  optimalAngle: number;
  optimalMin: number;
  optimalMax: number;
  optimalPower: number;
  optimalPowerMin: number;
  optimalPowerMax: number;
  optimalLabel: string;
}

const LEVELS: GameLevel[] = [
  {
    id: 1,
    title: 'Level 1: The 45° Sweet Spot',
    conceptName: 'Maximum Range Angle & Tension',
    conceptFormula: 'R = (v₀² · sin(2θ)) / g',
    hint: 'Aim at 45° with 74% pull tension! Both optimal angle AND the right power are required to reach the target.',
    explanation: 'Physics Proof: Horizontal range R = (v₀² · sin 2θ) / g. Range depends on both the angle factor sin(2θ) (peaking at 45°) and launch kinetic energy (v₀²). Even at 45°, under-pulling falls short and over-pulling overshoots!',
    gravity: 9.8,
    targetX: 740,
    targetY: 420,
    obstacles: [
      { x: 720, y: 440, w: 50, h: 40, type: 'wood', health: 30 },
      { x: 730, y: 400, w: 30, h: 40, type: 'glass', health: 15 },
    ],
    parScore: 1000,
    maxShots: 3,
    optimalAngle: 45,
    optimalMin: 43,
    optimalMax: 47,
    optimalPower: 74,
    optimalPowerMin: 71,
    optimalPowerMax: 77,
    optimalLabel: '45° @ 74% Power — Max Earth Reach',
  },
  {
    id: 2,
    title: 'Level 2: Complementary Angles',
    conceptName: 'Equal Range, Different Flight Paths',
    conceptFormula: 'R(θ) = R(90° - θ)',
    hint: 'A 210px wall blocks the flat 30° shot! Shoot at its complementary angle (60°) with 79% power to lob high over the wall.',
    explanation: 'Physics Proof: sin(2 · 30°) = sin(60°) = √3/2, and sin(2 · 60°) = sin(120°) = √3/2. Launching at 60° with 79% power achieves the exact same ground reach as 30° while reaching 3× higher peak altitude to clear the stone barrier.',
    gravity: 9.8,
    targetX: 720,
    targetY: 430,
    obstacles: [
      // Tall barrier blocking low-angle flat shots
      { x: 420, y: 270, w: 24, h: 210, type: 'stone', health: 999 },
      // Target structure
      { x: 700, y: 440, w: 45, h: 40, type: 'wood', health: 30 },
      { x: 710, y: 400, w: 25, h: 40, type: 'glass', health: 15 },
    ],
    parScore: 1200,
    maxShots: 3,
    optimalAngle: 60,
    optimalMin: 58,
    optimalMax: 62,
    optimalPower: 79,
    optimalPowerMin: 76,
    optimalPowerMax: 82,
    optimalLabel: '60° @ 79% Power — High Barrier Lob',
  },
  {
    id: 3,
    title: 'Level 3: The High Apex Lob',
    conceptName: 'Peak Height & Steep Drop',
    conceptFormula: 'H = (v₀² · sin²θ) / (2g)',
    hint: 'The target is shielded inside a sunken stone bunker. Pull 93% tension at a steep 73° angle so your shot plunges vertically between the towers!',
    explanation: 'Physics Proof: Apex height H = (v₀² · sin²θ) / (2g). At a steep 73° angle, 91% of kinetic energy is directed upward. With 93% power, the shot climbs high above the 220px towers and drops straight into the sunken chamber.',
    gravity: 9.8,
    targetX: 640,
    targetY: 430,
    obstacles: [
      // Left high stone wall
      { x: 565, y: 260, w: 22, h: 220, type: 'stone', health: 999 },
      // Right backstop
      { x: 715, y: 260, w: 22, h: 220, type: 'stone', health: 999 },
      // Bunker base
      { x: 595, y: 450, w: 110, h: 30, type: 'wood', health: 40 },
    ],
    parScore: 1500,
    maxShots: 3,
    optimalAngle: 73,
    optimalMin: 71,
    optimalMax: 75,
    optimalPower: 93,
    optimalPowerMin: 90,
    optimalPowerMax: 96,
    optimalLabel: '73° @ 93% Power — Bunker Apex Drop',
  },
  {
    id: 4,
    title: 'Level 4: Lunar Gravity Warp',
    conceptName: 'Inverse Gravity Scaling',
    conceptFormula: 'R ∝ 1/g  |  g_moon = 1.62 m/s²',
    hint: 'On the Moon (g = 1.62 m/s²), high power will launch you into deep space! Draw only ~33% low tension at 45° to float gracefully to the target.',
    explanation: 'Physics Proof: Range R is inversely proportional to gravity g. Because lunar gravity is 6× weaker than Earth, shots travel 6× farther with the same velocity. High tension overshoots completely—gentle 33% power at 45° is all that is needed.',
    gravity: 1.62,
    targetX: 830,
    targetY: 420,
    obstacles: [
      { x: 500, y: 350, w: 30, h: 130, type: 'wood', health: 25 },
      { x: 810, y: 440, w: 50, h: 40, type: 'glass', health: 15 },
    ],
    parScore: 1600,
    maxShots: 3,
    optimalAngle: 45,
    optimalMin: 43,
    optimalMax: 47,
    optimalPower: 33,
    optimalPowerMin: 30,
    optimalPowerMax: 36,
    optimalLabel: '45° @ 33% Power — Gentle Lunar Float',
  },
];

export const TrajectoryTitanGame: React.FC<TrajectoryTitanGameProps> = ({ onBack, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shotsLeft, setShotsLeft] = useState(3);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [lastTelemetry, setLastTelemetry] = useState<{ angle: number; velocity: number; range: number; apex: number } | null>(null);

  // Controlled precision angle (degrees) & launch power (percentage)
  const [controlAngle, setControlAngle] = useState(45);
  const [controlPower, setControlPower] = useState(75);

  // Aiming status: false = natural rest in fork (no pulling shown); true = stretched & aiming
  const [isAiming, setIsAiming] = useState(false);

  const level = LEVELS[currentLevelIndex];

  // Slingshot base anchor in canvas pixels
  const SLING_X = 140;
  const SLING_Y = 380;
  const GROUND_Y = 480;

  // Real-time synchronization refs for 60 FPS animation loop
  const controlAngleRef = useRef(45);
  const controlPowerRef = useRef(75);
  const isAimingRef = useRef(false);
  const hasLockedSoundPlayedRef = useRef(false);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragPosRef = useRef({ x: SLING_X, y: SLING_Y - 8 });

  // Sync angle and power to the physical slingshot coordinate position
  const syncSlingPosition = useCallback((angle: number, power: number) => {
    const pullDist = (Math.max(15, Math.min(100, power)) / 100) * 90;
    const rad = (Math.max(5, Math.min(88, angle)) * Math.PI) / 180;
    dragPosRef.current = {
      x: SLING_X - pullDist * Math.cos(rad),
      y: SLING_Y + pullDist * Math.sin(rad),
    };
  }, [SLING_X, SLING_Y]);

  // Active projectile in flight
  interface Projectile {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    trail: Array<{ x: number; y: number; alpha: number }>;
    active: boolean;
    rotation: number;
  }
  const projectileRef = useRef<Projectile | null>(null);

  // Active obstacles with live health & destructibility
  const obstaclesRef = useRef(level.obstacles.map(o => ({ ...o })));

  // Target orb status
  const targetRef = useRef({
    x: level.targetX,
    y: level.targetY,
    radius: 18,
    alive: true,
    scale: 1,
    wobble: 0,
  });

  // Splinter / Star particles
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    alpha: number;
    life: number;
    rotation: number;
    vRot: number;
  }
  const particlesRef = useRef<Particle[]>([]);

  // Clouds for atmospheric parallax
  const cloudsRef = useRef([
    { x: 50, y: 70, w: 90, h: 32, speed: 0.15 },
    { x: 300, y: 120, w: 120, h: 40, speed: 0.2 },
    { x: 600, y: 60, w: 100, h: 35, speed: 0.12 },
    { x: 820, y: 100, w: 140, h: 44, speed: 0.18 },
  ]);

  // Audio synthesizer for organic indie sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: 'stretch' | 'launch' | 'hit_wood' | 'hit_target' | 'victory' | 'lock') => {
    if (!soundEnabled) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'stretch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'launch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'hit_wood') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'hit_target') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'lock') {
        // High melodic target lock chime (A5 -> D6 harmonic)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174.66, now + 0.06);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'victory') {
        // Melodic celebratory arpeggio (C5 - E5 - G5 - C6)
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, now + i * 0.1);
          noteGain.gain.setValueAtTime(0.22, now + i * 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
          noteOsc.start(now + i * 0.1);
          noteOsc.stop(now + i * 0.1 + 0.35);
        });
      }
    } catch {
      // AudioContext safety fallback
    }
  }, [soundEnabled]);

  // Audio trigger when entering both optimal angle AND optimal power window
  const checkAndTriggerOptimalSound = useCallback((angle: number, power: number) => {
    const isAngleOk = angle >= level.optimalMin && angle <= level.optimalMax;
    const isPowerOk = power >= level.optimalPowerMin && power <= level.optimalPowerMax;
    const isOptimal = isAngleOk && isPowerOk;

    if (isOptimal) {
      if (!hasLockedSoundPlayedRef.current) {
        hasLockedSoundPlayedRef.current = true;
        playSound('lock');
      }
    } else {
      hasLockedSoundPlayedRef.current = false;
    }
  }, [level.optimalMin, level.optimalMax, level.optimalPowerMin, level.optimalPowerMax, playSound]);

  const handleAngleChange = (newAngle: number) => {
    const clamped = Math.max(5, Math.min(88, newAngle));
    controlAngleRef.current = clamped;
    isAimingRef.current = true;
    setControlAngle(clamped);
    setIsAiming(true);
    syncSlingPosition(clamped, controlPowerRef.current);
    checkAndTriggerOptimalSound(clamped, controlPowerRef.current);
  };

  const handlePowerChange = (newPower: number) => {
    const clamped = Math.max(15, Math.min(100, newPower));
    controlPowerRef.current = clamped;
    isAimingRef.current = true;
    setControlPower(clamped);
    setIsAiming(true);
    syncSlingPosition(controlAngleRef.current, clamped);
    checkAndTriggerOptimalSound(controlAngleRef.current, clamped);
  };

  // Reset or load level
  const loadLevel = useCallback((lvlIndex: number) => {
    const lvl = LEVELS[lvlIndex];
    obstaclesRef.current = lvl.obstacles.map(o => ({ ...o }));
    targetRef.current = {
      x: lvl.targetX,
      y: lvl.targetY,
      radius: 18,
      alive: true,
      scale: 1,
      wobble: 0,
    };
    projectileRef.current = null;
    particlesRef.current = [];
    isDraggingRef.current = false;
    hasLockedSoundPlayedRef.current = false;
    const defaultAngle = lvl.optimalAngle;
    const defaultPower = lvl.optimalPower;
    controlAngleRef.current = defaultAngle;
    controlPowerRef.current = defaultPower;
    isAimingRef.current = false;
    setControlAngle(defaultAngle);
    setControlPower(defaultPower);
    setIsAiming(false); // Slingshot starts at rest (no pulling shown on load)
    dragPosRef.current = { x: SLING_X, y: SLING_Y - 8 }; // Sit at neutral rest in fork
    setShotsLeft(lvl.maxShots);
    setShowLevelComplete(false);
  }, [SLING_X, SLING_Y]);

  useEffect(() => {
    loadLevel(currentLevelIndex);
  }, [currentLevelIndex, loadLevel]);

  // Spawn visual splinter / explosion particles
  const spawnParticles = (x: number, y: number, color: string, count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        size: Math.random() * 4 + 2,
        alpha: 1,
        life: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }
  };

  // Dynamic physics explainer: explains why specific angles produce their respective flight paths
  const getAngleInsight = (angle: number, currentLvl: GameLevel) => {
    const sin2 = Math.sin((2 * angle * Math.PI) / 180);
    const sinSq = Math.pow(Math.sin((angle * Math.PI) / 180), 2);

    if (angle >= 43 && angle <= 47) {
      return {
        title: '45° Optimal Maximum Range Sweet Spot',
        badge: '★ OPTIMAL RANGE',
        badgeColor: 'bg-emerald-950/80 border-emerald-500 text-emerald-300',
        tagline: 'sin(2θ) = sin(90°) = 1.00 — Absolute Maximum Ground Distance',
        explanation:
          'Why use 45°? The range equation R = (v₀² · sin(2θ)) / g proves horizontal travel is strictly governed by sin(2θ). Because 90° is the absolute mathematical peak of the sine function (sin 90° = 1.0), setting 2θ = 90° (θ = 45°) achieves the maximum possible ground distance for any launch energy.',
        strategy:
          currentLvl.id === 1
            ? 'Level 1 Strategy: Essential! The open-field target is situated at maximum distance. 45° gives maximum reach.'
            : 'Great for open ground, but carries an intermediate apex height.',
      };
    } else if (angle >= 25 && angle <= 35) {
      return {
        title: '30° Flat Low-Trajectory Drive',
        badge: 'FLAT DRIVE',
        badgeColor: 'bg-amber-950/80 border-amber-500 text-amber-300',
        tagline: 'High horizontal speed, but minimal apex height',
        explanation:
          'Why use 30°? Low launch angles keep 87% of initial velocity in the horizontal direction (vx = v₀ · cos 30°), leading to rapid forward flight. However, vertical velocity vy = 0.5 v₀ cuts flight hang-time in half and caps apex altitude to just 25% of potential height.',
        strategy:
          currentLvl.id === 2
            ? 'Level 2 Warning: The 210px stone tower will block this 30° shot! Use the complementary 60° angle to lob over it!'
            : 'Fast flight, but easily blocked by intermediate walls.',
      };
    } else if (angle >= 55 && angle <= 65) {
      return {
        title: '60° High Lob (Complementary to 30°)',
        badge: '★ HIGH BARRIER CLEARANCE',
        badgeColor: 'bg-cyan-950/80 border-cyan-500 text-cyan-300',
        tagline: 'Equal Ground Range to 30°, but 3× Higher Apex (H)!',
        explanation:
          'Why use 60°? The Complementary Angle Principle states that any two angles adding to 90° (30° + 60° = 90°) land at the EXACT same horizontal distance because sin(2 · 30°) = sin(60°) = √3/2, and sin(2 · 60°) = sin(120°) = √3/2. But 60° reaches 300% higher apex height, arcing completely over barriers!',
        strategy:
          currentLvl.id === 2
            ? 'Level 2 Solution: 60° achieves the same range as 30° while clearing the tall stone barrier effortlessly!'
            : 'Use this whenever a high barrier blocks a direct flat line of sight.',
      };
    } else if (angle >= 70 && angle <= 80) {
      return {
        title: '75° High Apex Bunker Plunge',
        badge: '★ VERTICAL BUNKER DROP',
        badgeColor: 'bg-indigo-950/80 border-indigo-500 text-indigo-300',
        tagline: 'sin²(75°) ≈ 0.93 — 93% Kinetic Energy Converted to Vertical Altitude',
        explanation:
          'Why use 75°? Apex height formula H = (v₀² · sin²θ) / (2g). At steep angles (~75°), over 93% of launch energy is channeled upward into altitude. At the arc peak, horizontal speed drops to a crawl, causing the projectile to plunge nearly straight down.',
        strategy:
          currentLvl.id === 3
            ? 'Level 3 Solution: Flanked by high granite walls, the target orb is shielded inside a sunken bunker. Only a ~75° vertical plunge can drop in!'
            : 'Ideal for dropping behind backstops and into recessed chambers.',
      };
    } else if (angle < 25) {
      return {
        title: `${angle}° Ultra-Shallow Launch`,
        badge: '⚠ TOO SHALLOW',
        badgeColor: 'bg-rose-950/80 border-rose-500 text-rose-300',
        tagline: 'Insufficient air hang time',
        explanation:
          'Why avoid this angle? Total flight time is T = (2 v₀ sin θ) / g. At under 25°, the projectile has so little vertical velocity that gravity pulls it into the dirt in under a second before it can travel forward.',
        strategy: 'Increase your angle to at least 40° for greater horizontal reach.',
      };
    } else {
      return {
        title: `${angle}° Custom Parabolic Arc`,
        badge: 'CUSTOM TRAJECTORY',
        badgeColor: 'bg-purple-950/80 border-purple-500 text-purple-300',
        tagline: `Range Efficiency: ${(sin2 * 100).toFixed(0)}% | Apex Factor: ${(sinSq * 100).toFixed(0)}%`,
        explanation: `At ${angle}°, the launch partitions kinetic energy into ${(Math.cos((angle * Math.PI) / 180) * 100).toFixed(0)}% horizontal drift and ${(Math.sin((angle * Math.PI) / 180) * 100).toFixed(0)}% vertical climb. Range is ${(sin2 * 100).toFixed(0)}% of the theoretical 45° maximum.`,
        strategy: 'Tune toward 45° for max distance, or 60°+ to clear high obstacles.',
      };
    }
  };

  // Convert slingshot pull vector to angle and launch velocity
  const calculateLaunchParameters = () => {
    const dx = SLING_X - dragPosRef.current.x;
    const dy = dragPosRef.current.y - SLING_Y; // canvas Y is inverted
    const pullDist = Math.min(Math.hypot(dx, dy), 90);
    // Angle in degrees above horizontal
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = Math.round((angleRad * 180) / Math.PI);
    if (angleDeg < 5) angleDeg = 5;
    if (angleDeg > 88) angleDeg = 88;

    // Launch speed scale (0 to ~32 m/s)
    const velocity = Number(((pullDist / 90) * 32).toFixed(1));
    const power = Math.max(15, Math.min(100, Math.round((pullDist / 90) * 100)));

    // Theoretical kinematic predictions on flat ground:
    // R = v^2 * sin(2*theta) / g
    const g = level.gravity;
    const rad = (angleDeg * Math.PI) / 180;
    const theoreticalRange = Number(((velocity * velocity * Math.sin(2 * rad)) / g).toFixed(1));
    const theoreticalApex = Number(((velocity * velocity * Math.sin(rad) * Math.sin(rad)) / (2 * g)).toFixed(1));

    return {
      pullDist,
      angleDeg,
      angleRad: rad,
      velocity,
      power,
      theoreticalRange,
      theoreticalApex,
    };
  };

  // Fire the slingshot with current angle & power settings
  const fireCurrentShot = () => {
    if (projectileRef.current && projectileRef.current.active) return;
    if (shotsLeft <= 0) return;

    syncSlingPosition(controlAngle, controlPower);
    const params = calculateLaunchParameters();

    const LAUNCH_SPEED_SCALE = 0.65;
    const simVx = params.velocity * Math.cos(params.angleRad) * LAUNCH_SPEED_SCALE;
    const simVy = -params.velocity * Math.sin(params.angleRad) * LAUNCH_SPEED_SCALE;

    projectileRef.current = {
      x: SLING_X,
      y: SLING_Y - 8,
      vx: simVx,
      vy: simVy,
      radius: 14,
      trail: [],
      active: true,
      rotation: 0,
    };

    setLastTelemetry({
      angle: params.angleDeg,
      velocity: params.velocity,
      range: params.theoreticalRange,
      apex: params.theoreticalApex,
    });

    setIsAiming(false);
    dragPosRef.current = { x: SLING_X, y: SLING_Y - 8 };
    playSound('launch');
  };

  // Main 60 FPS Physics & Indie Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // ─────────────────────────────────────────────────────────────
      // 1. HAND-CRAFTED INDIE ART: SKY & CLOUDS
      // ─────────────────────────────────────────────────────────────
      // Warm storybook gradient sky (apricot sunrise to lavender twilight)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#5D7BA6'); // Soft slate blue
      skyGrad.addColorStop(0.45, '#9BA7C0');
      skyGrad.addColorStop(0.72, '#E8A588'); // Warm peach horizon
      skyGrad.addColorStop(0.85, '#FCE4D6');
      skyGrad.addColorStop(1, '#F8EFEA');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Low morning sun with gentle atmospheric aura
      ctx.save();
      const sunGrad = ctx.createRadialGradient(820, 220, 10, 820, 220, 140);
      sunGrad.addColorStop(0, 'rgba(255, 248, 220, 0.9)');
      sunGrad.addColorStop(0.4, 'rgba(255, 225, 175, 0.4)');
      sunGrad.addColorStop(1, 'rgba(255, 225, 175, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(820, 220, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Drifting stylized clouds (subtle parallax)
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      cloudsRef.current.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > width + 100) cloud.x = -150;
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.w * 0.5, cloud.h * 0.45, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x + cloud.w * 0.22, cloud.y - cloud.h * 0.2, cloud.w * 0.35, cloud.h * 0.35, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x - cloud.w * 0.2, cloud.y + cloud.h * 0.1, cloud.w * 0.3, cloud.h * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Distant rolling mountain silhouette (Layer 1)
      ctx.save();
      ctx.fillStyle = '#8B8FA8';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, 320);
      ctx.bezierCurveTo(180, 250, 280, 310, 420, 280);
      ctx.bezierCurveTo(580, 240, 700, 330, 860, 270);
      ctx.lineTo(width, 290);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Midground forested hill silhouette (Layer 2)
      ctx.fillStyle = '#6E768E';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, 380);
      ctx.bezierCurveTo(140, 340, 320, 390, 520, 350);
      ctx.bezierCurveTo(680, 320, 820, 370, width, 340);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 2. LAYERED GROUND & GRASS STRATA
      // ─────────────────────────────────────────────────────────────
      // Earth cliff base
      ctx.save();
      ctx.fillStyle = '#6B4A34'; // Rich soil brown
      ctx.fillRect(0, GROUND_Y, width, height - GROUND_Y);

      // Deep earth strata stripes
      ctx.fillStyle = '#543926';
      ctx.fillRect(0, GROUND_Y + 22, width, 18);
      ctx.fillRect(0, GROUND_Y + 54, width, 24);

      // Top lush meadow grass band
      ctx.fillStyle = '#5B8C3A'; // Grass green
      ctx.fillRect(0, GROUND_Y, width, 12);
      ctx.fillStyle = '#73A849'; // Bright grass lip
      ctx.fillRect(0, GROUND_Y, width, 4);

      // Little grass tufts & wildflowers along ground
      ctx.strokeStyle = '#436B28';
      ctx.lineWidth = 2;
      for (let gx = 15; gx < width; gx += 45) {
        ctx.beginPath();
        ctx.moveTo(gx, GROUND_Y);
        ctx.lineTo(gx - 3, GROUND_Y - 7);
        ctx.moveTo(gx, GROUND_Y);
        ctx.lineTo(gx + 3, GROUND_Y - 8);
        ctx.stroke();
      }
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 3. TARGET KNOWLEDGE CITADEL & DESTRUCTIBLE OBSTACLES
      // ─────────────────────────────────────────────────────────────
      obstaclesRef.current.forEach(obs => {
        if (obs.health <= 0) return;
        ctx.save();
        if (obs.type === 'wood') {
          // Warm timber grain plank
          ctx.fillStyle = '#B47B49';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = '#7C4F2B';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          // Wood grain line & nail pegs
          ctx.beginPath();
          ctx.moveTo(obs.x + 4, obs.y + obs.h / 2);
          ctx.lineTo(obs.x + obs.w - 4, obs.y + obs.h / 2);
          ctx.stroke();
          ctx.fillStyle = '#4A2F1B';
          ctx.fillRect(obs.x + 3, obs.y + 3, 2, 2);
          ctx.fillRect(obs.x + obs.w - 5, obs.y + obs.h - 5, 2, 2);
        } else if (obs.type === 'stone') {
          // Chiseled granite pillar
          ctx.fillStyle = '#848C9E';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = '#535A69';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          // Stone crack texture
          ctx.strokeStyle = '#414754';
          ctx.beginPath();
          ctx.moveTo(obs.x + 4, obs.y + 12);
          ctx.lineTo(obs.x + obs.w * 0.45, obs.y + 24);
          ctx.lineTo(obs.x + obs.w * 0.75, obs.y + 18);
          ctx.stroke();
        } else if (obs.type === 'glass') {
          // Translucent ice/glass block
          ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = '#7DD3FC';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          // Specular diagonal glare
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.moveTo(obs.x + 4, obs.y + obs.h - 4);
          ctx.lineTo(obs.x + obs.w - 4, obs.y + 4);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Target Entity (The Target Knowledge Orb / Gremlin atop the tower)
      const target = targetRef.current;
      if (target.alive) {
        ctx.save();
        ctx.translate(target.x, target.y);
        // Idle gentle breathing wobble
        target.wobble += 0.05;
        const wobbleScale = 1 + Math.sin(target.wobble) * 0.03;
        ctx.scale(wobbleScale, wobbleScale);

        // Target body (cute golden/emerald creature)
        const tGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, target.radius);
        tGrad.addColorStop(0, '#FEF08A');
        tGrad.addColorStop(0.5, '#F59E0B');
        tGrad.addColorStop(1, '#B45309');
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#78350F';
        ctx.stroke();

        // Cute target eyes (curiously watching the slingshot)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-5, -3, 4, 0, Math.PI * 2);
        ctx.arc(5, -3, 4, 0, Math.PI * 2);
        ctx.fill();

        // Looking left towards slingshot
        ctx.fillStyle = '#1E1B2E';
        ctx.beginPath();
        ctx.arc(-6.5, -3, 2, 0, Math.PI * 2);
        ctx.arc(3.5, -3, 2, 0, Math.PI * 2);
        ctx.fill();

        // Crown / Antenna indicator
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(0, -target.radius - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ─────────────────────────────────────────────────────────────
      // 4. THE WOODEN SLINGSHOT & TENSION ELASTIC BANDS
      // ─────────────────────────────────────────────────────────────
      const leftForkX = SLING_X - 12;
      const leftForkY = SLING_Y - 28;
      const rightForkX = SLING_X + 14;
      const rightForkY = SLING_Y - 26;

      // Slingshot wooden fork trunk
      ctx.save();
      ctx.strokeStyle = '#5C381E'; // Dark bark
      ctx.fillStyle = '#8B5A2B'; // Wood core
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Base post into ground
      ctx.beginPath();
      ctx.moveTo(SLING_X, GROUND_Y);
      ctx.lineTo(SLING_X, SLING_Y);
      ctx.stroke();

      // Two prongs
      ctx.beginPath();
      ctx.moveTo(SLING_X, SLING_Y);
      ctx.lineTo(leftForkX, leftForkY);
      ctx.moveTo(SLING_X, SLING_Y);
      ctx.lineTo(rightForkX, rightForkY);
      ctx.stroke();
      ctx.restore();

      // Back rubber band (drawn behind hero character)
      // Only stretched when player is actively aiming or dragging!
      const isHeroArmed = (isAimingRef.current || isDraggingRef.current) && !projectileRef.current && shotsLeft > 0;
      const currentDrag = isHeroArmed ? dragPosRef.current : { x: SLING_X, y: SLING_Y - 8 };

      ctx.save();
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(leftForkX, leftForkY);
      ctx.lineTo(currentDrag.x - (isHeroArmed ? 6 : 0), currentDrag.y);
      ctx.stroke();
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 5. CHALK TRAJECTORY PREDICTION (KINEMATIC GUIDANCE ARC) & PROTRACTOR HUD
      // ─────────────────────────────────────────────────────────────
      // Only render trajectory projection arc when actively aiming!
      if (isHeroArmed) {
        const { angleRad, angleDeg, velocity, power } = calculateLaunchParameters();
        const isAngleOk = angleDeg >= level.optimalMin && angleDeg <= level.optimalMax;
        const isPowerOk = power >= level.optimalPowerMin && power <= level.optimalPowerMax;
        const isOptimal = isAngleOk && isPowerOk;

        const LAUNCH_SPEED_SCALE = 0.65;
        const simVx = velocity * Math.cos(angleRad) * LAUNCH_SPEED_SCALE;
        const simVy = -velocity * Math.sin(angleRad) * LAUNCH_SPEED_SCALE; // upward is negative in canvas
        const simG = (level.gravity / 9.8) * 0.42;

        ctx.save();
        ctx.setLineDash([4, 6]);

        let currX = SLING_X;
        let currY = SLING_Y - 8;
        let currVx = simVx;
        let currVy = simVy;

        // Draw flight trajectory prediction points
        for (let step = 0; step < 110; step++) {
          currX += currVx;
          currVy += simG;
          currY += currVy;

          if (currY >= GROUND_Y) break;

          ctx.beginPath();
          if (isOptimal) {
            ctx.fillStyle = step % 2 === 0 ? '#34D399' : '#FDE68A';
            ctx.shadowColor = '#10B981';
            ctx.shadowBlur = step % 2 === 0 ? 8 : 4;
            ctx.arc(currX, currY, step % 2 === 0 ? 3.5 : 2.2, 0, Math.PI * 2);
          } else if (isAngleOk) {
            // Angle is aligned, power still needs adjusting
            ctx.fillStyle = step % 2 === 0 ? '#FBBF24' : '#FDE68A';
            ctx.shadowBlur = 0;
            ctx.arc(currX, currY, step % 2 === 0 ? 2.8 : 1.8, 0, Math.PI * 2);
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.shadowBlur = 0;
            ctx.arc(currX, currY, step % 2 === 0 ? 3 : 1.8, 0, Math.PI * 2);
          }
          ctx.fill();
        }
        ctx.restore();

        // ─────────────────────────────────────────────────────────────
        // 5B. INTERACTIVE PROTRACTOR & REAL-TIME ANGLE READOUT
        // ─────────────────────────────────────────────────────────────
        const protractorR = 54;
        ctx.save();

        // Protractor background subtle fan
        ctx.fillStyle = 'rgba(38, 28, 22, 0.4)';
        ctx.beginPath();
        ctx.moveTo(SLING_X, SLING_Y);
        ctx.arc(SLING_X, SLING_Y, protractorR + 10, 0, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fill();

        // Protractor horizontal baseline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(SLING_X, SLING_Y);
        ctx.lineTo(SLING_X + protractorR + 20, SLING_Y);
        ctx.stroke();

        // Optimal Angle Target Wedge Highlight
        const optMinRad = (level.optimalMin * Math.PI) / 180;
        const optMaxRad = (level.optimalMax * Math.PI) / 180;
        ctx.setLineDash([]);
        ctx.fillStyle = isOptimal ? 'rgba(16, 185, 129, 0.38)' : isAngleOk ? 'rgba(52, 211, 153, 0.25)' : 'rgba(52, 211, 153, 0.15)';
        ctx.beginPath();
        ctx.moveTo(SLING_X, SLING_Y);
        ctx.arc(SLING_X, SLING_Y, protractorR + 8, -optMinRad, -optMaxRad, true);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = isOptimal ? '#10B981' : isAngleOk ? '#34D399' : 'rgba(52, 211, 153, 0.6)';
        ctx.lineWidth = isOptimal ? 2.5 : 1.5;
        ctx.stroke();

        // Optimal Wedge Target Label
        const optMidRad = (level.optimalAngle * Math.PI) / 180;
        const optDist = protractorR + 22;
        const optLX = SLING_X + Math.cos(optMidRad) * optDist;
        const optLY = SLING_Y - Math.sin(optMidRad) * optDist;
        ctx.fillStyle = isOptimal ? '#34D399' : isAngleOk ? '#6EE7B7' : '#A7F3D0';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`★${level.optimalAngle}°`, optLX, optLY);

        // Degree Tick Marks (15, 30, 45, 60, 75)
        [15, 30, 45, 60, 75].forEach(deg => {
          const r = (deg * Math.PI) / 180;
          const x1 = SLING_X + Math.cos(r) * (protractorR - 2);
          const y1 = SLING_Y - Math.sin(r) * (protractorR - 2);
          const x2 = SLING_X + Math.cos(r) * (protractorR + 5);
          const y2 = SLING_Y - Math.sin(r) * (protractorR + 5);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = deg === 45 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          if (deg === 30 || deg === 45 || deg === 60 || deg === 75) {
            const tx = SLING_X + Math.cos(r) * (protractorR - 12);
            const ty = SLING_Y - Math.sin(r) * (protractorR - 12);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${deg}°`, tx, ty);
          }
        });

        // Current Launch Angle Arc
        ctx.strokeStyle = isOptimal ? '#34D399' : isAngleOk ? '#6EE7B7' : '#FBBF24';
        ctx.lineWidth = isOptimal ? 3.5 : 2.5;
        if (isOptimal) {
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 12;
        }
        ctx.beginPath();
        ctx.arc(SLING_X, SLING_Y, protractorR, 0, -angleRad, true);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Launch Vector Direction Arrow
        const arrowLen = protractorR + 18;
        const arrowX = SLING_X + Math.cos(angleRad) * arrowLen;
        const arrowY = SLING_Y - Math.sin(angleRad) * arrowLen;
        ctx.strokeStyle = isOptimal ? '#10B981' : isAngleOk ? '#34D399' : '#F59E0B';
        ctx.lineWidth = isOptimal ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(SLING_X, SLING_Y);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();

        // Arrowhead
        const headLen = 8;
        ctx.fillStyle = isOptimal ? '#10B981' : isAngleOk ? '#34D399' : '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - headLen * Math.cos(angleRad - Math.PI / 6),
          arrowY + headLen * Math.sin(angleRad - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - headLen * Math.cos(angleRad + Math.PI / 6),
          arrowY + headLen * Math.sin(angleRad + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // ─────────────────────────────────────────────────────────────
        // 5E. SLINGSHOT TENSION POWER GAUGE
        // ─────────────────────────────────────────────────────────────
        const gaugeX = SLING_X - 64;
        const gaugeY = SLING_Y - 55;
        const gaugeW = 10;
        const gaugeH = 75;

        ctx.save();
        // Gauge track frame
        ctx.fillStyle = 'rgba(26, 20, 16, 0.75)';
        ctx.strokeStyle = 'rgba(120, 80, 50, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(gaugeX, gaugeY, gaugeW, gaugeH, 4);
        else ctx.rect(gaugeX, gaugeY, gaugeW, gaugeH);
        ctx.fill();
        ctx.stroke();

        // Target Power Sweet Spot Zone
        const optPwrMinFrac = level.optimalPowerMin / 100;
        const optPwrMaxFrac = level.optimalPowerMax / 100;
        const optPwrTop = gaugeY + gaugeH * (1 - optPwrMaxFrac);
        const optPwrH = gaugeH * (optPwrMaxFrac - optPwrMinFrac);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.fillRect(gaugeX + 1, optPwrTop, gaugeW - 2, optPwrH);
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gaugeX, optPwrTop, gaugeW, optPwrH);

        // Power Fill Bar
        const fillFrac = power / 100;
        const fillH = gaugeH * fillFrac;
        const fillTop = gaugeY + gaugeH - fillH;

        ctx.fillStyle = isPowerOk ? '#10B981' : power > level.optimalPowerMax ? '#EF4444' : '#F59E0B';
        if (isPowerOk) {
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(gaugeX + 1.5, fillTop, gaugeW - 3, fillH, 3);
        else ctx.rect(gaugeX + 1.5, fillTop, gaugeW - 3, fillH);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label above tension bar
        ctx.fillStyle = isPowerOk ? '#34D399' : '#FEF3C7';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${power}%`, gaugeX + gaugeW / 2, gaugeY - 6);
        ctx.restore();

        // ─────────────────────────────────────────────────────────────
        // 5C. DYNAMIC FLOATING HUD PILL DIRECTLY ABOVE USER'S DRAG POSITION
        // ─────────────────────────────────────────────────────────────
        const hudX = currentDrag.x;
        const hudY = currentDrag.y - 42;

        let hudTitle = `θ = ${angleDeg}°  |  Power = ${power}%`;
        let hudSubtitle = `Target: ${level.optimalAngle}° @ ${level.optimalPower}%`;
        let hudBg = 'rgba(30, 24, 20, 0.94)';
        let hudBorder = 'rgba(217, 119, 6, 0.8)';
        let hudTextColor = '#FEF3C7';

        if (isOptimal) {
          hudTitle = `★ SWEET SPOT LOCKED! [ ${angleDeg}° @ ${power}% ]`;
          hudSubtitle = `[ ${level.optimalLabel} ]`;
          hudBg = 'rgba(6, 78, 59, 0.96)';
          hudBorder = '#34D399';
          hudTextColor = '#6EE7B7';
        } else if (isAngleOk && !isPowerOk) {
          if (power < level.optimalPowerMin) {
            hudTitle = `★ ${angleDeg}° Angle OK! ⚠ Power Too Weak (${power}%)`;
            hudSubtitle = `Pull back harder to reach ~${level.optimalPower}% Power!`;
            hudBg = 'rgba(120, 53, 15, 0.95)';
            hudBorder = '#FBBF24';
            hudTextColor = '#FEF08A';
          } else {
            hudTitle = `★ ${angleDeg}° Angle OK! ⚠ Overpowered (${power}%)`;
            hudSubtitle = `Ease forward to reach ~${level.optimalPower}% Power!`;
            hudBg = 'rgba(127, 29, 29, 0.95)';
            hudBorder = '#F87171';
            hudTextColor = '#FECACA';
          }
        } else if (!isAngleOk && isPowerOk) {
          hudTitle = `⚡ ${power}% Power OK! ⚠ Adjust Angle (${angleDeg}°)`;
          hudSubtitle = `Target Angle: ~${level.optimalAngle}° (Current: ${angleDeg}°)`;
          hudBg = 'rgba(120, 53, 15, 0.95)';
          hudBorder = '#FBBF24';
          hudTextColor = '#FEF08A';
        } else if (level.id === 2 && angleDeg < 50) {
          hudTitle = `⚠ ${angleDeg}° WILL HIT WALL!`;
          hudSubtitle = `Lob ~60° @ ~79% Power to clear barrier`;
          hudBg = 'rgba(127, 29, 29, 0.92)';
          hudBorder = '#F87171';
          hudTextColor = '#FECACA';
        } else if (level.id === 3 && angleDeg < 70) {
          hudTitle = `⚠ ${angleDeg}° TOO FLAT FOR BUNKER!`;
          hudSubtitle = `Use ~73° steep plunge @ ~93% Power`;
          hudBg = 'rgba(127, 29, 29, 0.92)';
          hudBorder = '#F87171';
          hudTextColor = '#FECACA';
        } else if (Math.abs(angleDeg - level.optimalAngle) <= 6) {
          hudTitle = `${angleDeg}° — Near Angle Target!`;
          hudSubtitle = `Align to ${level.optimalAngle}° @ ${level.optimalPower}% Power`;
          hudBg = 'rgba(120, 53, 15, 0.92)';
          hudBorder = '#FBBF24';
          hudTextColor = '#FEF08A';
        }

        ctx.save();
        ctx.font = 'bold 12px sans-serif';
        const titleWidth = ctx.measureText(hudTitle).width;
        ctx.font = 'bold 10px sans-serif';
        const subWidth = hudSubtitle ? ctx.measureText(hudSubtitle).width : 0;
        const pillW = Math.max(titleWidth, subWidth) + 24;
        const pillH = hudSubtitle ? 36 : 24;
        const pillX = hudX - pillW / 2;
        const pillY = hudY - pillH / 2;

        if (isOptimal) {
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 14;
        }
        ctx.fillStyle = hudBg;
        ctx.strokeStyle = hudBorder;
        ctx.lineWidth = isOptimal ? 2 : 1.5;

        // Rounded pill box
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(pillX, pillY, pillW, pillH, 8);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pointer triangle towards pouch
        ctx.fillStyle = hudBorder;
        ctx.beginPath();
        ctx.moveTo(hudX - 5, pillY + pillH);
        ctx.lineTo(hudX + 5, pillY + pillH);
        ctx.lineTo(hudX, pillY + pillH + 6);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = hudTextColor;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(hudTitle, hudX, hudSubtitle ? pillY + 12 : pillY + pillH / 2);

        if (hudSubtitle) {
          ctx.fillStyle = isOptimal ? '#FDE68A' : 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(hudSubtitle, hudX, pillY + 25);
        }
        ctx.restore();

        // ─────────────────────────────────────────────────────────────
        // 5D. TARGET ORB LOCK-ON RETICLE WHEN OPTIMAL ANGLE & POWER REACHED
        // ─────────────────────────────────────────────────────────────
        if (isOptimal && targetRef.current.alive) {
          ctx.save();
          const targetObj = targetRef.current;
          const pulse = Math.sin(Date.now() / 120) * 3;
          const lockR = targetObj.radius + 10 + pulse;

          // Rotating Lock Ring
          const spin = Date.now() / 400;
          ctx.save();
          ctx.translate(targetObj.x, targetObj.y);
          ctx.rotate(spin);
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.shadowColor = '#34D399';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, lockR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // 4 Corner Brackets
          const bSize = 8;
          const bOffset = targetObj.radius + 14;
          ctx.strokeStyle = '#34D399';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 8;

          // Top-left
          ctx.beginPath();
          ctx.moveTo(targetObj.x - bOffset, targetObj.y - bOffset + bSize);
          ctx.lineTo(targetObj.x - bOffset, targetObj.y - bOffset);
          ctx.lineTo(targetObj.x - bOffset + bSize, targetObj.y - bOffset);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(targetObj.x + bOffset - bSize, targetObj.y - bOffset);
          ctx.lineTo(targetObj.x + bOffset, targetObj.y - bOffset);
          ctx.lineTo(targetObj.x + bOffset, targetObj.y - bOffset + bSize);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(targetObj.x - bOffset, targetObj.y + bOffset - bSize);
          ctx.lineTo(targetObj.x - bOffset, targetObj.y + bOffset);
          ctx.lineTo(targetObj.x - bOffset + bSize, targetObj.y + bOffset);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(targetObj.x + bOffset - bSize, targetObj.y + bOffset);
          ctx.lineTo(targetObj.x + bOffset, targetObj.y + bOffset);
          ctx.lineTo(targetObj.x + bOffset, targetObj.y + bOffset - bSize);
          ctx.stroke();

          // Floating Lock Badge above target
          const badgeY = targetObj.y - bOffset - 14;
          ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 1.5;
          const lockTxt = `[ ⌖ TARGET LOCKED: ${level.optimalAngle}° @ ${level.optimalPower}% ]`;
          ctx.font = 'bold 10px monospace';
          const lockW = ctx.measureText(lockTxt).width + 16;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(targetObj.x - lockW / 2, badgeY - 9, lockW, 18, 6);
          } else {
            ctx.rect(targetObj.x - lockW / 2, badgeY - 9, lockW, 18);
          }
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#6EE7B7';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(lockTxt, targetObj.x, badgeY);

          ctx.restore();
        } else if (isAngleOk && !isPowerOk && targetRef.current.alive) {
          // Soft amber indicator showing angle is locked, but power needs adjustment
          ctx.save();
          const targetObj = targetRef.current;
          const badgeY = targetObj.y - targetObj.radius - 20;
          ctx.fillStyle = 'rgba(120, 53, 15, 0.9)';
          ctx.strokeStyle = '#FBBF24';
          ctx.lineWidth = 1;
          const hintTxt = `⚠ SET POWER TO ~${level.optimalPower}%`;
          ctx.font = 'bold 9px monospace';
          const hintW = ctx.measureText(hintTxt).width + 12;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(targetObj.x - hintW / 2, badgeY - 8, hintW, 16, 4);
          else ctx.rect(targetObj.x - hintW / 2, badgeY - 8, hintW, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FEF08A';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(hintTxt, targetObj.x, badgeY);
          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 6. HERO CHARACTER (EXO SCOUT WITH AVIATOR GOGGLES)
      // ─────────────────────────────────────────────────────────────
      const heroPos = projectileRef.current
        ? { x: projectileRef.current.x, y: projectileRef.current.y }
        : isHeroArmed
        ? dragPosRef.current
        : { x: SLING_X, y: SLING_Y - 8 };

      ctx.save();
      ctx.translate(heroPos.x, heroPos.y);

      // Character rotation in flight
      if (projectileRef.current) {
        ctx.rotate(projectileRef.current.rotation);
      }

      // Hero Body (Cute Frosted Lilac EXO companion)
      const heroRadius = 14;
      const heroGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, heroRadius);
      heroGrad.addColorStop(0, '#FFFFFF');
      heroGrad.addColorStop(0.35, '#C4B5FD');
      heroGrad.addColorStop(1, '#7C5CFF');
      ctx.fillStyle = heroGrad;
      ctx.beginPath();
      ctx.arc(0, 0, heroRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#5B21B6';
      ctx.stroke();

      // Aviator Leather Cap & Goggles
      ctx.fillStyle = '#854D0E';
      ctx.beginPath();
      ctx.arc(0, -3, heroRadius, Math.PI, 0);
      ctx.fill();

      // Goggle Strap
      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, -1, heroRadius + 0.5, Math.PI * 0.9, Math.PI * 0.1, true);
      ctx.stroke();

      // Goggle Lenses
      ctx.fillStyle = '#38BDF8';
      ctx.strokeStyle = '#0369A1';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-4, -1, 4, 0, Math.PI * 2);
      ctx.arc(4, -1, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Goggle Glare
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-5, -2, 1.2, 0, Math.PI * 2);
      ctx.arc(3, -2, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Fluttering Red Scarf
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.ellipse(-7, 8, 6, 2.5, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Front rubber band (drawn over hero pouch)
      ctx.save();
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rightForkX, rightForkY);
      ctx.lineTo(currentDrag.x + (isHeroArmed ? 6 : 0), currentDrag.y);
      ctx.stroke();

      // Slingshot leather pouch (only rendered when armed & stretched)
      if (isHeroArmed) {
        ctx.fillStyle = '#3F2212';
        ctx.beginPath();
        ctx.ellipse(currentDrag.x, currentDrag.y, 8, 12, (controlAngle * Math.PI) / 180, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 7. ACTIVE PROJECTILE MOTION SIMULATION
      // ─────────────────────────────────────────────────────────────
      const proj = projectileRef.current;
      if (proj && proj.active) {
        // Physics integration step
        proj.x += proj.vx;
        // Gravity acceleration (scaled to canvas coordinate space)
        const gStep = (level.gravity / 9.8) * 0.42;
        proj.vy += gStep;
        proj.y += proj.vy;
        proj.rotation += 0.08;

        // Add flight dust trail particle
        proj.trail.push({ x: proj.x, y: proj.y, alpha: 0.65 });
        if (proj.trail.length > 22) proj.trail.shift();

        // Check Collision with Ground
        if (proj.y + proj.radius >= GROUND_Y) {
          proj.y = GROUND_Y - proj.radius;
          proj.active = false;
          spawnParticles(proj.x, proj.y, '#5B8C3A', 10);
          playSound('hit_wood');
          checkTurnEnd();
        }

        // Check Collision with Obstacles
        obstaclesRef.current.forEach(obs => {
          if (obs.health <= 0) return;
          if (
            proj.x + proj.radius >= obs.x &&
            proj.x - proj.radius <= obs.x + obs.w &&
            proj.y + proj.radius >= obs.y &&
            proj.y - proj.radius <= obs.y + obs.h
          ) {
            if (obs.type === 'stone') {
              // Heavy granite barrier recoil - repels low shots backward
              proj.vx = -Math.abs(proj.vx) * 0.45;
              proj.vy = Math.min(proj.vy, -1) + 2.5;
              spawnParticles(proj.x, proj.y, '#848C9E', 14);
              playSound('hit_wood');
            } else {
              obs.health -= 25;
              proj.vx *= 0.55;
              proj.vy *= 0.55;
              spawnParticles(proj.x, proj.y, obs.type === 'wood' ? '#B47B49' : '#BAE6FD', 14);
              playSound('hit_wood');
              if (obs.health <= 0) {
                setScore(s => s + 250);
              }
            }
          }
        });

        // Check Collision with Target
        if (target.alive) {
          const distToTarget = Math.hypot(proj.x - target.x, proj.y - target.y);
          if (distToTarget <= proj.radius + target.radius) {
            target.alive = false;
            proj.active = false;
            spawnParticles(target.x, target.y, '#F59E0B', 30);
            spawnParticles(target.x, target.y, '#FFFFFF', 15);
            playSound('hit_target');
            playSound('victory');
            setScore(s => s + 1000 + shotsLeft * 250);
            setCoinsEarned(c => c + 150);
            setTimeout(() => {
              setShowLevelComplete(true);
            }, 750);
          }
        }
      }

      // Draw projectile flight dust trail
      if (proj && proj.trail.length > 0) {
        ctx.save();
        proj.trail.forEach((pt, i) => {
          pt.alpha *= 0.94;
          ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (i / proj.trail.length) * 3 + 1, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // ─────────────────────────────────────────────────────────────
      // 8. PARTICLE EFFECTS (SPLINTERS & STAR CONFETTI)
      // ─────────────────────────────────────────────────────────────
      ctx.save();
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity on debris
        p.alpha -= 0.025;
        p.rotation += p.vRot;

        if (p.alpha <= 0 || p.y >= GROUND_Y) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [level, playSound, shotsLeft]);

  // Turn ending evaluation
  const checkTurnEnd = () => {
    setTimeout(() => {
      setShotsLeft(prev => {
        const remaining = prev - 1;
        if (remaining <= 0 && targetRef.current.alive) {
          // Out of shots: prompt retry
          setTimeout(() => {
            loadLevel(currentLevelIndex);
          }, 1200);
        }
        return remaining;
      });
      projectileRef.current = null;
      isAimingRef.current = false;
      setIsAiming(false);
      dragPosRef.current = { x: SLING_X, y: SLING_Y - 8 };
    }, 400);
  };

  // Mouse & Touch Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (projectileRef.current && projectileRef.current.active) return;
    if (shotsLeft <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 960;
    const y = ((e.clientY - rect.top) / rect.height) * 540;

    // Check click near slingshot anchor
    const distToSling = Math.hypot(x - SLING_X, y - SLING_Y);
    if (distToSling < 75) {
      isDraggingRef.current = true;
      isAimingRef.current = true;
      setIsAiming(true);
      hasLockedSoundPlayedRef.current = false;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // pointer capture fallback
      }
      dragPosRef.current = { x, y };
      playSound('stretch');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 960;
    const rawY = ((e.clientY - rect.top) / rect.height) * 540;

    // Slingshot anchor is at (SLING_X, SLING_Y)
    // To aim forward & up, user pulls backward (rawX < SLING_X) and downward (rawY > SLING_Y)
    const pullX = SLING_X - rawX;
    const pullY = rawY - SLING_Y;

    // Disallow pulling forward ahead of slingshot fork
    const validPullX = Math.max(8, pullX);
    const validPullY = Math.max(4, pullY);

    const pullDist = Math.hypot(validPullX, validPullY);
    const maxPull = 90;
    const clampedDist = Math.min(maxPull, Math.max(14, pullDist));

    const angleRad = Math.atan2(validPullY, validPullX);
    let deg = Math.round((angleRad * 180) / Math.PI);
    if (deg < 8) deg = 8;
    if (deg > 86) deg = 86;

    const pwr = Math.round((clampedDist / maxPull) * 100);

    // Physically accurate slingshot coordinate
    const actualX = SLING_X - Math.cos(angleRad) * clampedDist;
    const actualY = SLING_Y + Math.sin(angleRad) * clampedDist;

    const clampedPwr = Math.max(15, Math.min(100, pwr));
    dragPosRef.current = { x: actualX, y: actualY };
    isAimingRef.current = true;
    controlAngleRef.current = deg;
    controlPowerRef.current = clampedPwr;

    setControlAngle(deg);
    setControlPower(clampedPwr);
    setIsAiming(true);
    checkAndTriggerOptimalSound(deg, clampedPwr);
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // pointer release fallback
      }
    }

    const params = calculateLaunchParameters();
    // Only launch if pulled with minimum intention
    if (params.pullDist > 16) {
      fireCurrentShot();
    } else {
      isAimingRef.current = false;
      setIsAiming(false);
      dragPosRef.current = { x: SLING_X, y: SLING_Y - 8 };
    }
  };

  const liveParams = calculateLaunchParameters();
  const angleInsight = getAngleInsight(controlAngle, level);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#2A2421] text-[#2C2936] font-sans select-none ${className}`}>
      
      {/* ── TOP INDIE BARBAR WITH WOODEN VIBES & LIVE TELEMETRY ── */}
      <header className="h-14 px-6 bg-[#3D2E24] border-b border-[#5C4535] text-amber-100 flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-full bg-[#523E30] hover:bg-[#634C3C] text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-900/60 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Arcade</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-amber-800/80 mx-1" />

          {/* Level Title & Concept Badge */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-amber-100 tracking-tight">
              {level.title}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#5A3F28] text-amber-300 border border-amber-700/60">
              {level.conceptName}
            </span>
          </div>
        </div>

        {/* Center Live Kinematics Telemetry Pill */}
        <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-[#2A1F17] border border-amber-900/60 text-xs shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400/80 font-bold">Angle (θ):</span>
            <span className={`font-mono font-extrabold ${liveParams.angleDeg >= 43 && liveParams.angleDeg <= 47 ? 'text-emerald-400' : 'text-amber-100'}`}>
              {liveParams.angleDeg}°
            </span>
          </div>
          <div className="h-3 w-[1px] bg-amber-900" />
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400/80 font-bold">Velocity (v₀):</span>
            <span className="font-mono font-extrabold text-amber-100">{liveParams.velocity} m/s</span>
          </div>
          <div className="h-3 w-[1px] bg-amber-900" />
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400/80 font-bold">Pred. Range:</span>
            <span className="font-mono font-extrabold text-amber-200">{liveParams.theoreticalRange} m</span>
          </div>
          <div className="h-3 w-[1px] bg-amber-900" />
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400/80 font-bold">Apex (H):</span>
            <span className="font-mono font-extrabold text-amber-200">{liveParams.theoreticalApex} m</span>
          </div>
        </div>

        {/* Right HUD: Shots Left, Sound, Info */}
        <div className="flex items-center gap-3">
          {/* Shots Remaining Indicator */}
          <div className="flex items-center gap-1 bg-[#2A1F17] px-3 py-1.5 rounded-xl border border-amber-900/60">
            <span className="text-xs text-amber-300/80 font-medium mr-1">Cores:</span>
            {Array.from({ length: level.maxShots }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  i < shotsLeft
                    ? 'bg-gradient-to-tr from-purple-500 to-indigo-400 shadow-sm shadow-purple-500/50'
                    : 'bg-amber-950/60 border border-amber-900'
                }`}
              />
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(s => !s)}
            className="p-2 rounded-xl bg-[#523E30] hover:bg-[#634C3C] text-amber-200 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Physics Concept Formula Button */}
          <button
            onClick={() => setShowConceptModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Formula</span>
          </button>
        </div>
      </header>

      {/* ── MAIN INDIE CANVAS STAGE ── */}
      <div className="flex-1 relative flex flex-col items-center justify-start p-4 sm:p-5 bg-[#1E1916] overflow-y-auto space-y-4">
        {/* Canvas Game Stage */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#4E392B] bg-[#5D7BA6] max-w-5xl w-full aspect-[16/9] shrink-0">
          
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full cursor-crosshair touch-none"
          />

          {/* Dynamic Aim Status & Instructions Banner */}
          {!projectileRef.current && (
            <div className={`pointer-events-none absolute bottom-12 left-8 px-4 py-2 rounded-2xl backdrop-blur-md border text-xs font-semibold shadow-xl flex items-center gap-2.5 transition-all ${
              controlAngle >= level.optimalMin && controlAngle <= level.optimalMax && controlPower >= level.optimalPowerMin && controlPower <= level.optimalPowerMax
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-950/80 ring-2 ring-emerald-400/40'
                : 'bg-[#2A1F17]/90 border-amber-800/80 text-amber-100 shadow-amber-950/80'
            }`}>
              {isAiming ? (
                controlAngle >= level.optimalMin && controlAngle <= level.optimalMax && controlPower >= level.optimalPowerMin && controlPower <= level.optimalPowerMax ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>
                      <strong className="text-emerald-300 font-black">★ {controlAngle}° @ {controlPower}% SWEET SPOT LOCKED!</strong>{' '}
                      Release slingshot or tap Fire to strike target!
                    </span>
                  </>
                ) : controlAngle >= level.optimalMin && controlAngle <= level.optimalMax ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span>
                      Angle <strong className="text-emerald-400 font-mono">{controlAngle}°</strong> is Perfect!{' '}
                      <span className="text-amber-200">Set Power to ~<strong className="text-yellow-300 font-mono">{level.optimalPower}%</strong> (Current: {controlPower}%)</span>
                    </span>
                  </>
                ) : controlPower >= level.optimalPowerMin && controlPower <= level.optimalPowerMax ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span>
                      Power <strong className="text-emerald-400 font-mono">{controlPower}%</strong> is Perfect!{' '}
                      <span className="text-amber-200">Adjust Angle to ~<strong className="text-yellow-300 font-mono">{level.optimalAngle}°</strong> (Current: {controlAngle}°)</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span>
                      Aiming: <strong className="text-yellow-300 font-mono">{controlAngle}°</strong> at{' '}
                      <strong className="text-yellow-300 font-mono">{controlPower}%</strong> tension{' '}
                      <span className="text-amber-300/80">(Need: {level.optimalAngle}° @ {level.optimalPower}%)</span>
                    </span>
                  </>
                )
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Pull slingshot on canvas OR adjust Angle & Power below to aim!</span>
                </>
              )}
            </div>
          )}

          {/* Physics Tip Ribbon at Top Center */}
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#2A1F17]/80 backdrop-blur-md border border-amber-800/60 text-amber-200 text-[11px] font-bold shadow-md tracking-wide">
            {level.hint}
          </div>
        </div>

        {/* ── PRECISION ANGLE & POWER KINEMATICS CONSOLE ── */}
        <div className="max-w-5xl w-full bg-[#2A1F17] rounded-3xl border-2 border-amber-900/80 p-4 sm:p-5 shadow-2xl shrink-0 text-amber-100 space-y-4">
          
          {/* ── INTERACTIVE "WHY WE USE THIS ANGLE" KINEMATICS EXPLAINER MODULE ── */}
          <div className="p-4 rounded-2xl bg-[#1C1510] border-2 border-amber-800/70 shadow-inner space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/60 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-amber-950 font-black shadow-md shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-extrabold text-white tracking-tight">
                      {angleInsight.title}
                    </h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${angleInsight.badgeColor}`}>
                      {angleInsight.badge}
                    </span>
                  </div>
                  <p className="text-xs text-amber-300/80 font-medium">{angleInsight.tagline}</p>
                </div>
              </div>

              {/* Quick Stance Control: Idle vs Aim Stretched */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (!isAiming) {
                      setIsAiming(true);
                      syncSlingPosition(controlAngle, controlPower);
                    } else {
                      setIsAiming(false);
                      dragPosRef.current = { x: SLING_X, y: SLING_Y - 8 };
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isAiming
                      ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-sm'
                      : 'bg-[#2A1F17] hover:bg-[#3D2E24] text-amber-200 border-amber-800/60'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{isAiming ? 'Aim Mode Active' : 'Engage Aim Stance'}</span>
                </button>
              </div>
            </div>

            {/* Kinematic Reason Paragraph & Level Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
              <div className="p-3 rounded-xl bg-[#261C15] border border-amber-900/50 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Physics Reason for θ = {controlAngle}°</span>
                </div>
                <p className="text-amber-100/90 font-serif-editorial">
                  {angleInsight.explanation}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#261C15] border border-amber-900/50 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Level {level.id} Strategic Insight</span>
                </div>
                <p className="text-amber-100/90 font-serif-editorial">
                  {angleInsight.strategy}
                </p>
              </div>
            </div>

            {/* Live Equation Substitution Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-[#140E0A] border border-amber-950 text-[11px] font-mono text-amber-300/90">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">Range Formula:</span>
                <span>
                  R = ({liveParams.velocity}² · sin(2 × {controlAngle}°)) / {level.gravity} ={' '}
                  <strong className="text-yellow-300 font-black">{liveParams.theoreticalRange}m</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">Apex Altitude:</span>
                <span>
                  H = ({liveParams.velocity}² · sin²({controlAngle}°)) / (2 × {level.gravity}) ={' '}
                  <strong className="text-cyan-300 font-black">{liveParams.theoreticalApex}m</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ── CONTROLS ROW: ANGLE SLIDER, POWER SLIDER, FIRE BUTTON ── */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* 1. Angle Control Module */}
            <div className="flex-1 bg-[#1F1711] rounded-2xl p-3.5 border border-amber-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black tracking-wide uppercase text-amber-200">Launch Angle (θ)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black border transition-all ${
                    controlAngle >= level.optimalMin && controlAngle <= level.optimalMax
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50 shadow-md shadow-emerald-950'
                      : 'bg-amber-950 border-amber-800 text-amber-300'
                  }`}>
                    {controlAngle}°
                  </span>
                  {controlAngle >= level.optimalMin && controlAngle <= level.optimalMax && (
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-900/90 border border-emerald-500/80 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      ★ SWEET SPOT LOCKED
                    </span>
                  )}
                </div>
              </div>

              {/* Steppers & Slider */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAngleChange(controlAngle - 1)}
                  className="w-8 h-8 rounded-xl bg-[#3D2E24] hover:bg-[#523E30] active:scale-95 text-amber-200 flex items-center justify-center font-bold text-sm border border-amber-800/60 transition-all cursor-pointer shadow-sm"
                  title="Decrease Angle 1°"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min="5"
                  max="88"
                  step="1"
                  value={controlAngle}
                  onChange={(e) => handleAngleChange(Number(e.target.value))}
                  className="flex-1 accent-amber-500 h-2 bg-[#3D2E24] rounded-lg cursor-pointer"
                />

                <button
                  onClick={() => handleAngleChange(controlAngle + 1)}
                  className="w-8 h-8 rounded-xl bg-[#3D2E24] hover:bg-[#523E30] active:scale-95 text-amber-200 flex items-center justify-center font-bold text-sm border border-amber-800/60 transition-all cursor-pointer shadow-sm"
                  title="Increase Angle 1°"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Angle Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {[
                  { deg: 45, label: '45° Max Range', isTarget: level.optimalAngle === 45 },
                  { deg: 30, label: '30° Flat', isTarget: level.optimalAngle === 30 },
                  { deg: 60, label: '60° High Lob', isTarget: level.optimalAngle === 60 },
                  { deg: 74, label: '74° Bunker Drop', isTarget: level.optimalAngle === 74 || level.optimalAngle === 75 },
                ].map((preset) => (
                  <button
                    key={preset.deg}
                    onClick={() => handleAngleChange(preset.deg)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                      controlAngle === preset.deg
                        ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-sm'
                        : preset.isTarget
                        ? 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border-emerald-600/70 ring-1 ring-emerald-500/30'
                        : 'bg-[#2A1F17] hover:bg-[#3D2E24] text-amber-300/90 border-amber-900/60'
                    }`}
                  >
                    {preset.isTarget && <span className="text-emerald-400">★</span>}
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Tension / Power Module */}
            <div className="flex-1 bg-[#1F1711] rounded-2xl p-3.5 border border-amber-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black tracking-wide uppercase text-amber-200">Tension Power (v₀)</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
                  <span className={`px-2.5 py-0.5 rounded-lg border transition-all ${
                    controlPower >= level.optimalPowerMin && controlPower <= level.optimalPowerMax
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50 shadow-md shadow-emerald-950'
                      : 'bg-amber-950 border-amber-800 text-amber-300'
                  }`}>
                    {controlPower}%
                  </span>
                  {controlPower >= level.optimalPowerMin && controlPower <= level.optimalPowerMax && (
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-900/90 border border-emerald-500/80 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      ★ SWEET POWER
                    </span>
                  )}
                  <span className="text-amber-400/80 text-[11px]">
                    ({((controlPower / 100) * 32).toFixed(1)} m/s)
                  </span>
                </div>
              </div>

              {/* Steppers & Slider */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePowerChange(controlPower - 5)}
                  className="w-8 h-8 rounded-xl bg-[#3D2E24] hover:bg-[#523E30] active:scale-95 text-amber-200 flex items-center justify-center font-bold text-sm border border-amber-800/60 transition-all cursor-pointer shadow-sm"
                  title="Decrease Power 5%"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min="15"
                  max="100"
                  step="1"
                  value={controlPower}
                  onChange={(e) => handlePowerChange(Number(e.target.value))}
                  className="flex-1 accent-amber-500 h-2 bg-[#3D2E24] rounded-lg cursor-pointer"
                />

                <button
                  onClick={() => handlePowerChange(controlPower + 5)}
                  className="w-8 h-8 rounded-xl bg-[#3D2E24] hover:bg-[#523E30] active:scale-95 text-amber-200 flex items-center justify-center font-bold text-sm border border-amber-800/60 transition-all cursor-pointer shadow-sm"
                  title="Increase Power 5%"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Power Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {[
                  { pwr: level.optimalPower, label: `${level.optimalPower}% Target`, isTarget: true },
                  { pwr: 40, label: '40% Short', isTarget: level.optimalPower === 40 },
                  { pwr: 75, label: '75% Mid', isTarget: level.optimalPower === 75 },
                  { pwr: 95, label: '95% Max', isTarget: level.optimalPower === 95 },
                ]
                  .filter((p, idx, arr) => arr.findIndex(x => x.pwr === p.pwr) === idx)
                  .map((preset) => (
                    <button
                      key={preset.pwr}
                      onClick={() => handlePowerChange(preset.pwr)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                        controlPower === preset.pwr
                          ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-sm'
                          : preset.isTarget
                          ? 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border-emerald-600/70 ring-1 ring-emerald-500/30'
                          : 'bg-[#2A1F17] hover:bg-[#3D2E24] text-amber-300/90 border-amber-900/60'
                      }`}
                    >
                      {preset.isTarget && <span className="text-emerald-400">★</span>}
                      <span>{preset.label}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* 3. Launch Fire Button & Live Prediction */}
            <div className="w-full lg:w-64 bg-[#1F1711] rounded-2xl p-3.5 border border-amber-900/60 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between text-[11px] text-amber-300/80 font-mono">
                <span>Pred Range: <strong className="text-yellow-300">{liveParams.theoreticalRange}m</strong></span>
                <span>Apex: <strong className="text-yellow-300">{liveParams.theoreticalApex}m</strong></span>
              </div>

              <button
                onClick={fireCurrentShot}
                disabled={Boolean(projectileRef.current?.active) || shotsLeft <= 0}
                className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  Boolean(projectileRef.current?.active) || shotsLeft <= 0
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    : controlAngle >= level.optimalMin &&
                      controlAngle <= level.optimalMax &&
                      controlPower >= level.optimalPowerMin &&
                      controlPower <= level.optimalPowerMax
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white border-2 border-emerald-300 shadow-xl shadow-emerald-950/70 hover:scale-[1.02] active:scale-95 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-amber-950 border border-yellow-300 shadow-amber-950/60 hover:scale-[1.02] active:scale-95'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>
                  {projectileRef.current?.active
                    ? 'IN FLIGHT...'
                    : shotsLeft <= 0
                    ? 'NO CORES LEFT'
                    : controlAngle >= level.optimalMin &&
                      controlAngle <= level.optimalMax &&
                      controlPower >= level.optimalPowerMin &&
                      controlPower <= level.optimalPowerMax
                    ? '★ FIRE SWEET SPOT! [ ⌖ LOCKED ]'
                    : controlAngle >= level.optimalMin && controlAngle <= level.optimalMax
                    ? `FIRE (${controlPower}% Power — Need ~${level.optimalPower}%)`
                    : controlPower >= level.optimalPowerMin && controlPower <= level.optimalPowerMax
                    ? `FIRE (${controlAngle}° — Need ~${level.optimalAngle}°)`
                    : 'FIRE SLINGSHOT'}
                </span>
              </button>

              <div className="text-center text-[10px] text-amber-400/60 font-semibold tracking-wider uppercase">
                {shotsLeft} / {level.maxShots} Shots Remaining
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── LEVEL COMPLETE CELEBRATION MODAL ── */}
      {showLevelComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#3D2E24] border-2 border-amber-700/80 text-amber-100 shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-amber-950 shadow-lg shadow-amber-500/30">
                <Trophy className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">Target Destroyed!</h2>
              <p className="text-xs text-amber-200/80">You mastered this projectile motion challenge.</p>
            </div>

            {/* Kinematic Insight Card */}
            <div className="p-4 rounded-2xl bg-[#2A1F17] border border-amber-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Kinematics Debrief</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed font-serif-editorial">
                {level.explanation}
              </p>
              {lastTelemetry && (
                <div className="pt-2 border-t border-amber-900/60 flex items-center justify-between text-[11px] font-mono text-amber-300">
                  <span>Shot Angle: {lastTelemetry.angle}°</span>
                  <span>Launch Velocity: {lastTelemetry.velocity} m/s</span>
                </div>
              )}
            </div>

            {/* Score & Rewards */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#523E30] text-xs font-bold">
              <span>Score: <strong className="text-yellow-300">{score}</strong></span>
              <span className="flex items-center gap-1 text-yellow-400">
                🪙 +{coinsEarned} Coins
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => loadLevel(currentLevelIndex)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#523E30] hover:bg-[#634C3C] text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Angle</span>
              </button>

              <button
                onClick={() => {
                  if (currentLevelIndex < LEVELS.length - 1) {
                    setCurrentLevelIndex(i => i + 1);
                  } else {
                    onBack && onBack();
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition-all cursor-pointer"
              >
                <span>{currentLevelIndex < LEVELS.length - 1 ? 'Next Level' : 'Finish Arcade'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHYSICS FORMULA & CONCEPT MODAL ── */}
      {showConceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#3D2E24] border-2 border-amber-700/80 text-amber-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="font-extrabold text-base text-white">Projectile Motion Reference</h3>
              </div>
              <button
                onClick={() => setShowConceptModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-amber-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-amber-100/90">
              <div className="p-3 rounded-xl bg-[#2A1F17] border border-amber-900/60 space-y-1">
                <span className="font-bold text-amber-300">1. Maximum Range (Level Ground)</span>
                <p className="font-mono text-yellow-200 text-sm">R = (v₀² · sin(2θ)) / g</p>
                <p className="text-[11px] text-amber-200/70">Occurs at exactly 45° where sin(2 · 45°) = sin(90°) = 1.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#2A1F17] border border-amber-900/60 space-y-1">
                <span className="font-bold text-amber-300">2. Complementary Angle Rule</span>
                <p className="font-mono text-yellow-200 text-sm">R(θ) = R(90° - θ)</p>
                <p className="text-[11px] text-amber-200/70">For any angle pair summing to 90° (e.g., 30° & 60°), horizontal range is identical!</p>
              </div>

              <div className="p-3 rounded-xl bg-[#2A1F17] border border-amber-900/60 space-y-1">
                <span className="font-bold text-amber-300">3. Maximum Peak Height (Apex)</span>
                <p className="font-mono text-yellow-200 text-sm">H_max = (v₀² · sin²θ) / (2g)</p>
                <p className="text-[11px] text-amber-200/70">Steeper angles create higher parabolic arcs to plunge into bunkers.</p>
              </div>
            </div>

            <button
              onClick={() => setShowConceptModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs cursor-pointer shadow-md transition-all"
            >
              Resume Physics Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
