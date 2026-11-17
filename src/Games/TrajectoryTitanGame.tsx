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
}

const LEVELS: GameLevel[] = [
  {
    id: 1,
    title: 'Level 1: The 45° Sweet Spot',
    conceptName: 'Maximum Range Angle',
    conceptFormula: 'R = (v₀² · sin(2θ)) / g',
    hint: 'Aim close to 45°! Since sin(2 · 45°) = sin(90°) = 1, 45° delivers maximum horizontal distance for any given pull.',
    explanation: 'Physics Proof: Horizontal range is proportional to sin(2θ). The sine function peaks at 90°, meaning 2θ = 90° → θ = 45° produces the absolute maximum distance possible on level ground.',
    gravity: 9.8,
    targetX: 740,
    targetY: 420,
    obstacles: [
      { x: 720, y: 440, w: 50, h: 40, type: 'wood', health: 30 },
      { x: 730, y: 400, w: 30, h: 40, type: 'glass', health: 15 },
    ],
    parScore: 1000,
    maxShots: 3,
  },
  {
    id: 2,
    title: 'Level 2: Complementary Angles',
    conceptName: 'Equal Range, Different Flight Paths',
    conceptFormula: 'R(θ) = R(90° - θ)',
    hint: 'A wall blocks the flat 30° shot! Try shooting at its complementary angle (60°) to achieve the exact same distance while lobbing high over the wall.',
    explanation: 'Physics Proof: sin(2 · 30°) = sin(60°) = √3/2, and sin(2 · 60°) = sin(120°) = √3/2. Any two launch angles that add up to 90° land at the exact same horizontal distance, but the higher angle spends much longer in the air!',
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
  },
  {
    id: 3,
    title: 'Level 3: The High Apex Lob',
    conceptName: 'Peak Height (H_max)',
    conceptFormula: 'H = (v₀² · sin²θ) / (2g)',
    hint: 'The target is nestled in a deep bunker surrounded by stone towers. Use a steep angle (~70°–75°) so your projectile plunges vertically downward!',
    explanation: 'Physics Proof: Vertical apex height depends on the vertical velocity component (v₀ · sinθ). Steep angles convert nearly all kinetic energy into vertical altitude, allowing vertical bunker drops.',
    gravity: 9.8,
    targetX: 750,
    targetY: 430,
    obstacles: [
      // Left high stone wall
      { x: 670, y: 220, w: 28, h: 260, type: 'stone', health: 999 },
      // Right backstop
      { x: 800, y: 220, w: 28, h: 260, type: 'stone', health: 999 },
      // Bunker base
      { x: 705, y: 450, w: 90, h: 30, type: 'wood', health: 40 },
    ],
    parScore: 1500,
    maxShots: 3,
  },
  {
    id: 4,
    title: 'Level 4: Lunar Gravity Warp',
    conceptName: 'Inverse Gravity Scaling',
    conceptFormula: 'R ∝ 1/g  |  g_moon = 1.62 m/s²',
    hint: 'You are now on the Moon! With gravity reduced from 9.8 to 1.62 m/s², low launch speeds float massive distances in slow motion.',
    explanation: 'Physics Proof: Because range R is inversely proportional to gravity g, reducing g by a factor of 6 multiplies both your hang time and flight distance by roughly 6x!',
    gravity: 1.62,
    targetX: 830,
    targetY: 420,
    obstacles: [
      { x: 500, y: 350, w: 30, h: 130, type: 'wood', health: 25 },
      { x: 810, y: 440, w: 50, h: 40, type: 'glass', health: 15 },
    ],
    parScore: 1600,
    maxShots: 3,
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

  const level = LEVELS[currentLevelIndex];

  // Slingshot base anchor in canvas pixels
  const SLING_X = 140;
  const SLING_Y = 380;
  const GROUND_Y = 480;

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragPosRef = useRef({ x: SLING_X, y: SLING_Y });

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

  const playSound = useCallback((type: 'stretch' | 'launch' | 'hit_wood' | 'hit_target' | 'victory') => {
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
    dragPosRef.current = { x: SLING_X, y: SLING_Y };
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

  // Convert slingshot pull vector to angle and launch velocity
  const calculateLaunchParameters = () => {
    const dx = SLING_X - dragPosRef.current.x;
    const dy = dragPosRef.current.y - SLING_Y; // canvas Y is inverted
    const pullDist = Math.min(Math.hypot(dx, dy), 90);
    // Angle in degrees above horizontal
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = Math.round((angleRad * 180) / Math.PI);
    if (angleDeg < 0) angleDeg = 0;
    if (angleDeg > 88) angleDeg = 88;

    // Launch speed scale (0 to ~32 m/s)
    const velocity = Number(((pullDist / 90) * 32).toFixed(1));

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
      theoreticalRange,
      theoreticalApex,
    };
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
      const currentDrag = isDraggingRef.current ? dragPosRef.current : { x: SLING_X, y: SLING_Y - 8 };
      ctx.save();
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(leftForkX, leftForkY);
      ctx.lineTo(currentDrag.x - 6, currentDrag.y);
      ctx.stroke();
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 5. CHALK TRAJECTORY PREDICTION (KINEMATIC GUIDANCE ARC)
      // ─────────────────────────────────────────────────────────────
      if (isDraggingRef.current) {
        const { angleRad, velocity } = calculateLaunchParameters();
        const simVx = velocity * Math.cos(angleRad) * 1.55;
        const simVy = -velocity * Math.sin(angleRad) * 1.55; // upward is negative in canvas
        const simG = (level.gravity / 9.8) * 0.42;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([4, 6]);

        let currX = SLING_X;
        let currY = SLING_Y;
        let currVx = simVx;
        let currVy = simVy;

        // Draw dotted flight trajectory prediction points
        for (let step = 0; step < 38; step++) {
          currX += currVx;
          currVy += simG;
          currY += currVy;

          if (currY >= GROUND_Y) break;

          ctx.beginPath();
          ctx.arc(currX, currY, step % 2 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ─────────────────────────────────────────────────────────────
      // 6. HERO CHARACTER (EXO SCOUT WITH AVIATOR GOGGLES)
      // ─────────────────────────────────────────────────────────────
      const heroPos = isDraggingRef.current
        ? dragPosRef.current
        : projectileRef.current
        ? { x: projectileRef.current.x, y: projectileRef.current.y }
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
      ctx.lineTo(currentDrag.x + 6, currentDrag.y);
      ctx.stroke();
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
            obs.health -= 25;
            proj.vx *= 0.45;
            proj.vy *= 0.45;
            spawnParticles(proj.x, proj.y, obs.type === 'wood' ? '#B47B49' : obs.type === 'glass' ? '#BAE6FD' : '#848C9E', 14);
            playSound('hit_wood');
            if (obs.health <= 0) {
              setScore(s => s + 250);
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
    if (distToSling < 60) {
      isDraggingRef.current = true;
      dragPosRef.current = { x, y };
      playSound('stretch');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 960;
    const rawY = ((e.clientY - rect.top) / rect.height) * 540;

    // Restrict pull backward and downward
    const dx = rawX - SLING_X;
    const dy = rawY - SLING_Y;
    const dist = Math.hypot(dx, dy);
    const maxPull = 90;

    if (dist > maxPull) {
      const angle = Math.atan2(dy, dx);
      dragPosRef.current = {
        x: SLING_X + Math.cos(angle) * maxPull,
        y: SLING_Y + Math.sin(angle) * maxPull,
      };
    } else {
      dragPosRef.current = { x: rawX, y: rawY };
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const params = calculateLaunchParameters();
    // Only launch if pulled with minimum intention
    if (params.pullDist > 14) {
      const simVx = params.velocity * Math.cos(params.angleRad) * 1.55;
      const simVy = -params.velocity * Math.sin(params.angleRad) * 1.55; // upward is negative in canvas

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

      playSound('launch');
    } else {
      dragPosRef.current = { x: SLING_X, y: SLING_Y };
    }
  };

  const liveParams = calculateLaunchParameters();

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
      <div className="flex-1 relative flex items-center justify-center p-4 bg-[#1E1916] overflow-hidden">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#4E392B] bg-[#5D7BA6] max-w-5xl w-full aspect-[16/9]">
          
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

          {/* Subtle Pull Instruction Banner on First Launch */}
          {!isDraggingRef.current && shotsLeft === level.maxShots && !projectileRef.current && (
            <div className="pointer-events-none absolute bottom-16 left-12 px-4 py-2 rounded-2xl bg-[#2A1F17]/85 backdrop-blur-md border border-amber-800/80 text-amber-100 text-xs font-semibold shadow-lg animate-bounce flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Drag the slingshot backward & release to test launch angles!</span>
            </div>
          )}

          {/* Physics Tip Ribbon at Top Center */}
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#2A1F17]/80 backdrop-blur-md border border-amber-800/60 text-amber-200 text-[11px] font-bold shadow-md tracking-wide">
            {level.hint}
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
