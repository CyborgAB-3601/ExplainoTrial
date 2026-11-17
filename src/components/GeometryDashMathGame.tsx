import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Trophy,
  Zap,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Gamepad2
} from 'lucide-react';

interface Question {
  prompt: string;
  subtext: string;
  options: [string, string]; // [Left Option, Right Option]
  correctIndex: 0 | 1; // 0 = Left, 1 = Right
  explanation: string;
}

const ALGEBRA_QUESTIONS: Question[] = [
  { prompt: '2x + 6 = 16', subtext: 'Solve for x', options: ['x = 5', 'x = 8'], correctIndex: 0, explanation: '2x = 10 ➔ x = 5' },
  { prompt: '3x - 5 = 16', subtext: 'Solve for x', options: ['x = 9', 'x = 7'], correctIndex: 1, explanation: '3x = 21 ➔ x = 7' },
  { prompt: 'x² = 64 (x > 0)', subtext: 'Find positive root', options: ['x = 8', 'x = 6'], correctIndex: 0, explanation: '√64 = 8' },
  { prompt: 'x / 4 = 7', subtext: 'Solve for x', options: ['x = 21', 'x = 28'], correctIndex: 1, explanation: 'x = 7 × 4 = 28' },
  { prompt: '5x + 15 = 45', subtext: 'Solve for x', options: ['x = 6', 'x = 8'], correctIndex: 0, explanation: '5x = 30 ➔ x = 6' },
  { prompt: '4x - 8 = 24', subtext: 'Solve for x', options: ['x = 6', 'x = 8'], correctIndex: 1, explanation: '4x = 32 ➔ x = 8' },
  { prompt: '2x + 9 = 27', subtext: 'Solve for x', options: ['x = 9', 'x = 11'], correctIndex: 0, explanation: '2x = 18 ➔ x = 9' },
  { prompt: 'x² - 25 = 0 (x > 0)', subtext: 'Find positive value', options: ['x = 4', 'x = 5'], correctIndex: 1, explanation: 'x² = 25 ➔ x = 5' },
  { prompt: '6x + 6 = 48', subtext: 'Solve for x', options: ['x = 7', 'x = 9'], correctIndex: 0, explanation: '6x = 42 ➔ x = 7' },
  { prompt: '3x + 12 = 39', subtext: 'Solve for x', options: ['x = 7', 'x = 9'], correctIndex: 1, explanation: '3x = 27 ➔ x = 9' },
  { prompt: 'If y = 4, 3y + 5 = ?', subtext: 'Evaluate expression', options: ['17', '19'], correctIndex: 0, explanation: '3(4) + 5 = 17' },
  { prompt: '8x - 16 = 32', subtext: 'Solve for x', options: ['x = 4', 'x = 6'], correctIndex: 1, explanation: '8x = 48 ➔ x = 6' },
  { prompt: 'x / 5 + 3 = 9', subtext: 'Solve for x', options: ['x = 30', 'x = 25'], correctIndex: 0, explanation: 'x/5 = 6 ➔ x = 30' },
  { prompt: '7x - 7 = 42', subtext: 'Solve for x', options: ['x = 5', 'x = 7'], correctIndex: 1, explanation: '7x = 49 ➔ x = 7' },
];

export interface GeometryDashMathGameProps {
  onExit: () => void;
  userName?: string;
  gameTitle?: string;
  gameSubtitle?: string;
  gameCategory?: string;
  gameTopic?: string;
  gameBadge?: string;
}

export const GeometryDashMathGame: React.FC<GeometryDashMathGameProps> = ({
  onExit,
  userName = 'Abhinav',
  gameTitle = 'Geometry Dash : Dimensions',
  gameSubtitle = 'Algebra Highway Runner',
  gameCategory = 'Math',
  gameTopic = 'Algebra & Coordinate Geometry',
  gameBadge = 'TOP HIT'
}) => {
  // Game Flow States
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'paused' | 'gameover'>('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [speedMph, setSpeedMph] = useState(55);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentLane, setCurrentLane] = useState<-1 | 1>(-1); // -1 = Left, 1 = Right
  const [feedbackEffect, setFeedbackEffect] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('nilo_geometry_highscore') || '450', 10);
  });

  // Track game state in ref for animation loop
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // DOM ref for buttery smooth 60fps gate distance bar
  const approachBarRef = useRef<HTMLDivElement | null>(null);

  // Canvas & Three.js Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const gatesGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Gameplay coordinates & logic refs (Paced for comfortable mental math)
  const targetLaneXRef = useRef<-2.6 | 2.6>(-2.6);
  const currentLaneXRef = useRef<number>(-2.6);
  const carTiltRef = useRef<number>(0);
  const roadSegmentsRef = useRef<THREE.Group[]>([]);
  const wheelMeshesRef = useRef<THREE.Mesh[]>([]);
  const thrustersRef = useRef<THREE.Mesh[]>([]);
  const speedStreaksRef = useRef<THREE.Points | null>(null);
  const gateZRef = useRef<number>(-130);
  const roadSpeedRef = useRef<number>(20);
  const questionIndexRef = useRef<number>(0);
  const isGateEvaluatingRef = useRef<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  // Synchronized refs for stutter-free audio & scoring
  const streakRef = useRef(streak);
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  const isSoundMutedRef = useRef(isSoundMuted);
  useEffect(() => {
    isSoundMutedRef.current = isSoundMuted;
  }, [isSoundMuted]);

  // ---------------------------------------------------------------------
  // WEB AUDIO SYNTHESIZER (Zero external download dependencies)
  // ---------------------------------------------------------------------
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSynthSound = useCallback((type: 'swipe' | 'correct' | 'wrong' | 'gameover' | 'start') => {
    if (isSoundMutedRef.current) return;
    try {
      if (!audioCtxRef.current) initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'swipe') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(880, now + 0.16);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // Audio fallback silent
    }
  }, []);

  // ---------------------------------------------------------------------
  // LOADING SCREEN PROGRESS (Engaging ~1.5s boot sequence)
  // ---------------------------------------------------------------------
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 6;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setGameState('playing');
          playSynthSound('start');
        }, 450);
      }
      setLoadProgress((prev) => Math.min(100, Math.max(prev, current)));
    }, 85);

    return () => clearInterval(interval);
  }, [playSynthSound]);

  // ---------------------------------------------------------------------
  // TEXTURE HELPER: High-Res Neon Cyber Gate Billboard
  // ---------------------------------------------------------------------
  const createGateCanvasTexture = (text: string, isLeft: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark cyber background with subtle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 512, 256);
      if (isLeft) {
        bgGrad.addColorStop(0, 'rgba(6, 18, 48, 0.96)');
        bgGrad.addColorStop(1, 'rgba(10, 36, 80, 0.96)');
      } else {
        bgGrad.addColorStop(0, 'rgba(48, 6, 28, 0.96)');
        bgGrad.addColorStop(1, 'rgba(80, 10, 50, 0.96)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 512, 256);

      // Scanline grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let y = 0; y < 256; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Glowing Neon Border
      ctx.lineWidth = 10;
      ctx.strokeStyle = isLeft ? '#00E5FF' : '#FF007F';
      ctx.shadowColor = isLeft ? '#00E5FF' : '#FF007F';
      ctx.shadowBlur = 20;
      ctx.strokeRect(12, 12, 488, 232);

      // Corner brackets
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FFFFFF';
      ctx.strokeRect(8, 8, 30, 30);
      ctx.strokeRect(474, 8, 30, 30);
      ctx.strokeRect(8, 218, 30, 30);
      ctx.strokeRect(474, 218, 30, 30);

      // Lane Tag Badge Header
      ctx.shadowBlur = 0;
      ctx.fillStyle = isLeft ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 0, 127, 0.25)';
      ctx.fillRect(36, 26, 440, 50);

      ctx.font = '900 28px monospace';
      ctx.fillStyle = isLeft ? '#00E5FF' : '#FF007F';
      ctx.textAlign = 'center';
      ctx.shadowColor = isLeft ? '#00E5FF' : '#FF007F';
      ctx.shadowBlur = 16;
      ctx.fillText(isLeft ? '◄ LANE A  [SELECT]' : '[SELECT]  LANE B ►', 256, 60);

      // Answer Text (Super crisp with dual glow)
      ctx.font = '900 84px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = isLeft ? '#00E5FF' : '#FF007F';
      ctx.shadowBlur = 32;
      ctx.fillText(text, 256, 178);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // ---------------------------------------------------------------------
  // BUILD 3D SYNTHWAVE WORLD & VEHICLE
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    // 1. SCENE WITH SYNTHWAVE HORIZON FOG
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0C081A, 0.008);
    sceneRef.current = scene;

    // 2. PERSPECTIVE CAMERA
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 450);
    camera.position.set(0, 3.8, 8.5);
    camera.lookAt(0, 1.8, -28);
    cameraRef.current = camera;

    // 3. WEBGL RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    // 4. LIGHTING
    const ambientLight = new THREE.AmbientLight(0x9333EA, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFF5500, 1.5);
    dirLight.position.set(6, 25, -20);
    scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x00E5FF, 3.0, 50);
    cyanPoint.position.set(-6, 5, 0);
    scene.add(cyanPoint);

    // 5. STARRY SKY DOME
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 350;
      starPos[i + 1] = Math.random() * 90 + 10;
      starPos[i + 2] = -Math.random() * 250 - 30;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 1.3,
      transparent: true,
      opacity: 0.85
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 6. DISTANT CYBERPUNK CITY SKYLINE
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, 0, -190);
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMatA = new THREE.MeshStandardMaterial({
      color: 0x1E1438,
      roughness: 0.5,
      metalness: 0.6
    });
    const buildingMatB = new THREE.MeshStandardMaterial({
      color: 0x2A1A4E,
      roughness: 0.5,
      metalness: 0.6
    });

    for (let i = -16; i <= 16; i++) {
      if (Math.abs(i) <= 2) continue; // Gap for the highway horizon
      const bHeight = Math.random() * 38 + 16;
      const bWidth = Math.random() * 6 + 4;
      const bDepth = Math.random() * 6 + 4;
      const mesh = new THREE.Mesh(buildingGeo, i % 2 === 0 ? buildingMatA : buildingMatB);
      mesh.scale.set(bWidth, bHeight, bDepth);
      mesh.position.set(i * 7.5, bHeight / 2 - 2, (Math.random() - 0.5) * 20);
      cityGroup.add(mesh);
    }
    scene.add(cityGroup);

    // 7. SYNTHWAVE GROUND GRID (Elevated Skyway Floor at y = -2.2)
    const groundGrid = new THREE.GridHelper(300, 60, 0x00E5FF, 0x581C87);
    groundGrid.position.set(0, -2.2, -80);
    scene.add(groundGrid);

    // 8. SPEED STREAK PARTICLES
    const streakCount = 60;
    const streakGeo = new THREE.BufferGeometry();
    const streakPositions = new Float32Array(streakCount * 3);
    for (let i = 0; i < streakCount; i++) {
      streakPositions[i * 3] = (Math.random() - 0.5) * 35;
      streakPositions[i * 3 + 1] = Math.random() * 7 + 0.5;
      streakPositions[i * 3 + 2] = -Math.random() * 200;
    }
    streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
    const streakMat = new THREE.PointsMaterial({
      color: 0x00F0FF,
      size: 1.0,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const speedStreaks = new THREE.Points(streakGeo, streakMat);
    scene.add(speedStreaks);
    speedStreaksRef.current = speedStreaks;

    // 9. SOLID CONTINUOUS ELEVATED HIGHWAY (4 Segments of length 55 = 220 units)
    const roadSegments: THREE.Group[] = [];
    const roadSegmentLength = 55;
    const totalSegments = 4;

    for (let s = 0; s < totalSegments; s++) {
      const segment = new THREE.Group();
      segment.position.z = -s * roadSegmentLength;

      // Asphalt Road Surface
      const roadGeo = new THREE.PlaneGeometry(12.6, roadSegmentLength);
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x110F20,
        roughness: 0.4,
        metalness: 0.3
      });
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      segment.add(roadMesh);

      // Center Dashed Cyan Lane Markings
      const dashesPerSeg = 5;
      for (let d = 0; d < dashesPerSeg; d++) {
        const dashGeo = new THREE.PlaneGeometry(0.35, 5.5);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
        const dashMesh = new THREE.Mesh(dashGeo, dashMat);
        dashMesh.rotation.x = -Math.PI / 2;
        dashMesh.position.set(0, 0.02, -roadSegmentLength / 2 + d * 11 + 5.5);
        segment.add(dashMesh);
      }

      // Glowing Neon Guardrails (Left: Cyan laser beam, Right: Hot Pink laser beam)
      const railGeo = new THREE.BoxGeometry(0.35, 0.5, roadSegmentLength);
      const leftRail = new THREE.Mesh(railGeo, new THREE.MeshBasicMaterial({ color: 0x00E5FF }));
      leftRail.position.set(-6.3, 0.25, 0);
      segment.add(leftRail);

      const rightRail = new THREE.Mesh(railGeo, new THREE.MeshBasicMaterial({ color: 0xFF007F }));
      rightRail.position.set(6.3, 0.25, 0);
      segment.add(rightRail);

      // Roadside Neon Light Bollards
      for (let p = -20; p <= 20; p += 20) {
        const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8);
        const postL = new THREE.Mesh(postGeo, new THREE.MeshBasicMaterial({ color: 0x00F0FF }));
        postL.position.set(-6.6, 0.6, p);
        segment.add(postL);

        const postR = new THREE.Mesh(postGeo, new THREE.MeshBasicMaterial({ color: 0xFF1493 }));
        postR.position.set(6.6, 0.6, p);
        segment.add(postR);
      }

      scene.add(segment);
      roadSegments.push(segment);
    }
    roadSegmentsRef.current = roadSegments;

    // 10. SCULPTED EXOTIC HYPERCAR (High-Fidelity 3D Cyberpunk Supercar)
    const carGroup = new THREE.Group();
    carGroup.position.set(-2.6, 0, 0);

    // Dedicated Overhead Follow Light (Brilliantly illuminates roof, rear fastback, and cockpit)
    const carFollowLight = new THREE.PointLight(0xFFFFFF, 5.0, 22);
    carFollowLight.position.set(0, 3.5, 2.0);
    carGroup.add(carFollowLight);

    // Materials
    const bodyPaintMat = new THREE.MeshStandardMaterial({
      color: 0xFF1E56,
      emissive: 0x3A0012,
      emissiveIntensity: 0.35,
      roughness: 0.14,
      metalness: 0.85
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x111318,
      roughness: 0.25,
      metalness: 0.9
    });

    const canopyGlassMat = new THREE.MeshStandardMaterial({
      color: 0x00E5FF,
      emissive: 0x005577,
      emissiveIntensity: 0.55,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.88
    });

    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });

    // Main Sculpted Lower Fuselage (Tapered aerodynamic monocoque)
    const lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.36, 4.3),
      bodyPaintMat
    );
    lowerBody.position.y = 0.34;
    carGroup.add(lowerBody);

    // Aerodynamic Sloped Hood / Nose
    const hoodGeo = new THREE.BoxGeometry(1.7, 0.22, 1.6);
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyPaintMat);
    hoodMesh.position.set(0, 0.32, -1.5);
    hoodMesh.rotation.x = 0.08;
    carGroup.add(hoodMesh);

    // Front Carbon Fiber Splitter & Corner Winglets (Canards)
    const splitter = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.06, 0.7),
      carbonMat
    );
    splitter.position.set(0, 0.14, -2.15);
    carGroup.add(splitter);

    const canardL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.3), carbonMat);
    canardL.position.set(-1.06, 0.22, -2.1);
    canardL.rotation.y = 0.2;
    carGroup.add(canardL);

    const canardR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.3), carbonMat);
    canardR.position.set(1.06, 0.22, -2.1);
    canardR.rotation.y = -0.2;
    carGroup.add(canardR);

    // Flared Muscular Wheel Arches (Fenders)
    // Front Fenders
    const frontFenderL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 1.3), bodyPaintMat);
    frontFenderL.position.set(-0.98, 0.38, -1.25);
    carGroup.add(frontFenderL);

    const frontFenderR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 1.3), bodyPaintMat);
    frontFenderR.position.set(0.98, 0.38, -1.25);
    carGroup.add(frontFenderR);

    // Rear Muscular Haunches (Wide exotic hypercar hips)
    const rearFenderL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.44, 1.6), bodyPaintMat);
    rearFenderL.position.set(-1.04, 0.42, 1.25);
    carGroup.add(rearFenderL);

    const rearFenderR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.44, 1.6), bodyPaintMat);
    rearFenderR.position.set(1.04, 0.42, 1.25);
    carGroup.add(rearFenderR);

    // Side Air Intake Scoops (NACA Ducts feeding engine bay)
    const scoopL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.8), carbonMat);
    scoopL.position.set(-1.02, 0.36, 0.35);
    scoopL.rotation.y = 0.08;
    carGroup.add(scoopL);

    const scoopR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.8), carbonMat);
    scoopR.position.set(1.02, 0.36, 0.35);
    scoopR.rotation.y = -0.08;
    carGroup.add(scoopR);

    // Aerodynamic Side Mirrors
    const mirrorStemL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.06), carbonMat);
    mirrorStemL.position.set(-0.95, 0.62, -0.6);
    carGroup.add(mirrorStemL);

    const mirrorCapL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.22), bodyPaintMat);
    mirrorCapL.position.set(-1.08, 0.64, -0.6);
    carGroup.add(mirrorCapL);

    const mirrorStemR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.06), carbonMat);
    mirrorStemR.position.set(0.95, 0.62, -0.6);
    carGroup.add(mirrorStemR);

    const mirrorCapR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.22), bodyPaintMat);
    mirrorCapR.position.set(1.08, 0.64, -0.6);
    carGroup.add(mirrorCapR);

    // Tapered Cockpit Greenhouse (Curved Canopy Profile)
    const cabin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.85, 2.0, 8),
      canopyGlassMat
    );
    cabin.rotation.x = Math.PI / 2;
    cabin.scale.set(1.05, 1.0, 0.42);
    cabin.position.set(0, 0.72, -0.15);
    carGroup.add(cabin);

    // Roof Center Spine (Aerodynamic Shark Fin with Neon Light)
    const roofSpine = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.14, 1.8),
      neonCyanMat
    );
    roofSpine.position.set(0, 0.85, 0.1);
    carGroup.add(roofSpine);

    // Hood Neon Light Bars
    const hoodLineL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 1.3), neonCyanMat);
    hoodLineL.position.set(-0.55, 0.42, -1.4);
    hoodLineL.rotation.x = 0.08;
    carGroup.add(hoodLineL);

    const hoodLineR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 1.3), neonCyanMat);
    hoodLineR.position.set(0.55, 0.42, -1.4);
    hoodLineR.rotation.x = 0.08;
    carGroup.add(hoodLineR);

    // Carbon Fiber Side Skirts
    const sideSkirtL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 3.4), carbonMat);
    sideSkirtL.position.set(-1.06, 0.18, 0);
    carGroup.add(sideSkirtL);

    const sideSkirtR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 3.4), carbonMat);
    sideSkirtR.position.set(1.06, 0.18, 0);
    carGroup.add(sideSkirtR);

    // Sculpted Swan-Neck GT Rear Wing
    const wingBlade = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.06, 0.42),
      carbonMat
    );
    wingBlade.position.set(0, 0.98, 1.95);
    carGroup.add(wingBlade);

    const wingEndplateL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.46), neonCyanMat);
    wingEndplateL.position.set(-1.06, 1.0, 1.95);
    carGroup.add(wingEndplateL);

    const wingEndplateR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.46), neonCyanMat);
    wingEndplateR.position.set(1.06, 1.0, 1.95);
    carGroup.add(wingEndplateR);

    // Swan-neck curved wing struts
    const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.12), carbonMat);
    strutL.position.set(-0.55, 0.8, 1.95);
    strutL.rotation.x = 0.2;
    carGroup.add(strutL);

    const strutR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.12), carbonMat);
    strutR.position.set(0.55, 0.8, 1.95);
    strutR.rotation.x = 0.2;
    carGroup.add(strutR);

    // Aggressive Rear Aero Diffuser (with 4 vertical strakes)
    const diffuserBase = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.7), carbonMat);
    diffuserBase.position.set(0, 0.16, 1.85);
    carGroup.add(diffuserBase);

    [-0.6, -0.2, 0.2, 0.6].forEach((dx) => {
      const strake = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.65), carbonMat);
      strake.position.set(dx, 0.2, 1.9);
      carGroup.add(strake);
    });

    // F1-Style Central Flashing Rain Light
    const f1Light = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.06), new THREE.MeshBasicMaterial({ color: 0xFF0033 }));
    f1Light.position.set(0, 0.22, 2.18);
    carGroup.add(f1Light);

    // Dual Projector LED Headlights with Chevron DRLs
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.1), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
    hlL.position.set(-0.62, 0.36, -2.18);
    hlL.rotation.y = 0.15;
    carGroup.add(hlL);

    const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.1), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
    hlR.position.set(0.62, 0.36, -2.18);
    hlR.rotation.y = -0.15;
    carGroup.add(hlR);

    // High-Power Headlight Spotlights illuminating the road ahead
    const spotL = new THREE.SpotLight(0x00E5FF, 4.0, 35, Math.PI / 5, 0.4);
    spotL.position.set(-0.62, 0.45, -2.0);
    spotL.target.position.set(-0.62, 0, -22);
    carGroup.add(spotL);
    carGroup.add(spotL.target);

    const spotR = new THREE.SpotLight(0x00E5FF, 4.0, 35, Math.PI / 5, 0.4);
    spotR.position.set(0.62, 0.45, -2.0);
    spotR.target.position.set(0.62, 0, -22);
    carGroup.add(spotR);
    carGroup.add(spotR.target);

    // Continuous 3D Neon Horizon Taillight Bar
    const tailBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.1, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xFF0044 })
    );
    tailBar.position.set(0, 0.46, 2.18);
    carGroup.add(tailBar);

    const tailUpperCyan = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.04, 0.08),
      neonCyanMat
    );
    tailUpperCyan.position.set(0, 0.52, 2.18);
    carGroup.add(tailUpperCyan);

    // Natural Point Light Underglow (Zero flat polygon rectangles!)
    const underglowLight = new THREE.PointLight(0x00F0FF, 4.5, 8);
    underglowLight.position.set(0, 0.18, 0);
    carGroup.add(underglowLight);

    // Quad Titanium Exhaust Outlets
    const exhaustGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.4, 16);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.95, roughness: 0.1 });
    const innerPlasmaMat = new THREE.MeshBasicMaterial({ color: 0x00FFFF });

    const thrusterMeshes: THREE.Mesh[] = [];
    [-0.55, -0.35, 0.35, 0.55].forEach((exX) => {
      const exMesh = new THREE.Mesh(exhaustGeo, exhaustMat);
      exMesh.position.set(exX, 0.36, 2.22);
      carGroup.add(exMesh);

      // Glowing plasma core
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.01, 0.3, 12), innerPlasmaMat);
      core.rotation.x = Math.PI / 2;
      core.position.set(exX, 0.36, 2.26);
      carGroup.add(core);
      thrusterMeshes.push(core);
    });
    thrustersRef.current = thrusterMeshes;

    // 4 Realistic Wheels with 5-Spoke Alloys & Brembo Red Brake Calipers
    const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.26, 20);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.8, metalness: 0.1 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.95, roughness: 0.15 });
    const caliperMat = new THREE.MeshBasicMaterial({ color: 0xFF1E27 });

    const wheels: THREE.Mesh[] = [];
    const wheelPositions = [
      [-1.02, 0.36, -1.25],
      [1.02, 0.36, -1.25],
      [-1.05, 0.36, 1.25],
      [1.05, 0.36, 1.25],
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheelHub = new THREE.Group();
      wheelHub.position.set(x, y, z);

      // Outer Tire
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      wheelHub.add(tire);

      // Silver Rim Center & 5 Spokes
      const rimCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.28, 16), rimMat);
      rimCenter.rotation.z = Math.PI / 2;
      wheelHub.add(rimCenter);

      // Red Brake Caliper inside
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.14), caliperMat);
      caliper.position.set(x > 0 ? -0.06 : 0.06, 0.12, 0);
      wheelHub.add(caliper);

      // Glowing Outer Rim Ring
      const rimRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 16), neonCyanMat);
      rimRing.position.x = x > 0 ? 0.14 : -0.14;
      rimRing.rotation.y = Math.PI / 2;
      wheelHub.add(rimRing);

      carGroup.add(wheelHub);
      wheels.push(tire);
    });
    wheelMeshesRef.current = wheels;

    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // 11. QUESTION CHOICE GATES (A on Left, B on Right)
    const gatesGroup = new THREE.Group();
    gatesGroup.position.z = -130;
    gateZRef.current = -130;

    const initialQ = ALGEBRA_QUESTIONS[0];
    const leftTexture = createGateCanvasTexture(initialQ.options[0], true);
    const rightTexture = createGateCanvasTexture(initialQ.options[1], false);

    const gateBillboardGeo = new THREE.PlaneGeometry(5.6, 2.8);

    const leftGateMesh = new THREE.Mesh(gateBillboardGeo, new THREE.MeshBasicMaterial({ map: leftTexture, transparent: true }));
    leftGateMesh.name = 'leftBillboard';
    leftGateMesh.position.set(-3.1, 2.4, 0);
    gatesGroup.add(leftGateMesh);

    const rightGateMesh = new THREE.Mesh(gateBillboardGeo, new THREE.MeshBasicMaterial({ map: rightTexture, transparent: true }));
    rightGateMesh.name = 'rightBillboard';
    rightGateMesh.position.set(3.1, 2.4, 0);
    gatesGroup.add(rightGateMesh);

    // Glowing Overhead Gantry Arch
    const archBarGeo = new THREE.BoxGeometry(0.35, 4.4, 0.35);
    const archTopGeo = new THREE.BoxGeometry(13.0, 0.45, 0.35);

    const archLeft = new THREE.Mesh(archBarGeo, new THREE.MeshBasicMaterial({ color: 0x00E5FF }));
    archLeft.position.set(-6.3, 2.2, 0);
    gatesGroup.add(archLeft);

    const archRight = new THREE.Mesh(archBarGeo, new THREE.MeshBasicMaterial({ color: 0xFF007F }));
    archRight.position.set(6.3, 2.2, 0);
    gatesGroup.add(archRight);

    const archCenter = new THREE.Mesh(archBarGeo, new THREE.MeshBasicMaterial({ color: 0x8B5CF6 }));
    archCenter.position.set(0, 2.2, 0);
    gatesGroup.add(archCenter);

    const archTop = new THREE.Mesh(archTopGeo, new THREE.MeshBasicMaterial({ color: 0x00E5FF }));
    archTop.position.set(0, 4.4, 0);
    gatesGroup.add(archTop);

    scene.add(gatesGroup);
    gatesGroupRef.current = gatesGroup;

    // Handle Window Resize
    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ---------------------------------------------------------------------
    // ANIMATION RENDER LOOP
    // ---------------------------------------------------------------------
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.08);
      lastTime = time;

      // Freeze updates when paused, loading, or game over
      if (gameStateRef.current !== 'playing') {
        renderer.render(scene, camera);
        return;
      }

      const speed = roadSpeedRef.current;

      // 1. Move Road Segments (Smooth continuous highway loop)
      roadSegmentsRef.current.forEach((segment) => {
        segment.position.z += speed * delta;
        if (segment.position.z >= roadSegmentLength) {
          segment.position.z -= roadSegmentLength * totalSegments;
        }
      });

      // 2. Animate Speed Streaks Particles
      if (speedStreaksRef.current) {
        const geo = speedStreaksRef.current.geometry;
        const pos = geo.attributes.position.array as Float32Array;
        for (let i = 0; i < streakCount; i++) {
          pos[i * 3 + 2] += speed * delta * 1.5;
          if (pos[i * 3 + 2] > 10) {
            pos[i * 3 + 2] = -200;
            pos[i * 3] = (Math.random() - 0.5) * 35;
            pos[i * 3 + 1] = Math.random() * 7 + 0.5;
          }
        }
        geo.attributes.position.needsUpdate = true;
      }

      // 3. Smooth Car Lane Physics (Damped glide with banking roll)
      const targetX = targetLaneXRef.current;
      currentLaneXRef.current += (targetX - currentLaneXRef.current) * 14 * delta;

      const velocityX = targetX - currentLaneXRef.current;
      carTiltRef.current += (-velocityX * 0.45 - carTiltRef.current) * 12 * delta;

      if (carGroupRef.current) {
        carGroupRef.current.position.x = currentLaneXRef.current;
        carGroupRef.current.rotation.z = carTiltRef.current; // Bank roll
        carGroupRef.current.rotation.y = velocityX * 0.12; // Slight yaw
      }

      // 4. Spin Wheels & Pulse Jet Thrusters
      wheelMeshesRef.current.forEach((wheel) => {
        wheel.rotation.x += speed * delta * 2.4;
      });
      thrustersRef.current.forEach((thruster, idx) => {
        thruster.scale.z = 1.0 + Math.sin(time * 0.03 + idx) * 0.25;
      });

      // 5. Dynamic Camera Follow
      if (cameraRef.current) {
        cameraRef.current.position.x += ((currentLaneXRef.current * 0.45) - cameraRef.current.position.x) * 10 * delta;
        cameraRef.current.position.y = 3.8 + Math.sin(time * 0.006) * 0.04;
        cameraRef.current.position.z = 8.5;
        cameraRef.current.rotation.z = -carTiltRef.current * 0.25;
        cameraRef.current.lookAt(currentLaneXRef.current * 0.2, 1.8, -28);
      }

      // 6. Move Question Gates Toward Player
      if (gatesGroupRef.current) {
        gateZRef.current += speed * delta;
        gatesGroupRef.current.position.z = gateZRef.current;

        // Update 60fps gate distance countdown bar
        if (approachBarRef.current) {
          const spawnDist = 130;
          const currentDist = Math.max(0, -gateZRef.current);
          const progress = Math.max(0, Math.min(100, ((spawnDist - currentDist) / spawnDist) * 100));
          approachBarRef.current.style.width = `${progress}%`;
        }

        // Collision & Answer Detection Zone (Passing through gate at z ≈ -2)
        if (gateZRef.current >= -2 && !isGateEvaluatingRef.current) {
          isGateEvaluatingRef.current = true;

          const chosenLaneIndex = currentLaneXRef.current < 0 ? 0 : 1; // 0 = Left, 1 = Right
          const qIndex = questionIndexRef.current;
          const currentQ = ALGEBRA_QUESTIONS[qIndex % ALGEBRA_QUESTIONS.length];
          const isCorrect = chosenLaneIndex === currentQ.correctIndex;

          if (isCorrect) {
            playSynthSound('correct');
            setScore((prev) => prev + 100 + streakRef.current * 20);
            setStreak((prev) => prev + 1);
            setFeedbackEffect({ text: `+100 PTS! PERFECT`, isCorrect: true });
            roadSpeedRef.current = Math.min(roadSpeedRef.current + 0.6, 32);
            setSpeedMph((prev) => Math.min(prev + 2, 85));
          } else {
            playSynthSound('wrong');
            setStreak(0);
            setLives((prev) => {
              const updated = prev - 1;
              if (updated <= 0) {
                setGameState('gameover');
                playSynthSound('gameover');
              }
              return updated;
            });
            setFeedbackEffect({ text: `WRONG! ${currentQ.explanation}`, isCorrect: false });
          }

          setTimeout(() => setFeedbackEffect(null), 1800);

          // Reset gate ahead for next algebra question
          setTimeout(() => {
            const nextIndex = (questionIndexRef.current + 1) % ALGEBRA_QUESTIONS.length;
            questionIndexRef.current = nextIndex;
            setCurrentQuestionIndex(nextIndex);

            const nextQ = ALGEBRA_QUESTIONS[nextIndex];
            const nextLTex = createGateCanvasTexture(nextQ.options[0], true);
            const nextRTex = createGateCanvasTexture(nextQ.options[1], false);

            const leftMesh = gatesGroupRef.current?.getObjectByName('leftBillboard') as THREE.Mesh;
            const rightMesh = gatesGroupRef.current?.getObjectByName('rightBillboard') as THREE.Mesh;

            if (leftMesh) (leftMesh.material as THREE.MeshBasicMaterial).map = nextLTex;
            if (rightMesh) (rightMesh.material as THREE.MeshBasicMaterial).map = nextRTex;

            gateZRef.current = -130;
            if (gatesGroupRef.current) gatesGroupRef.current.position.z = -130;
            isGateEvaluatingRef.current = false;
          }, 350);
        }
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, [playSynthSound]);

  // Update High Score in localStorage
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('nilo_geometry_highscore', score.toString());
    }
  }, [score, highScore]);

  // ---------------------------------------------------------------------
  // SWIPE & KEYBOARD INPUT CONTROLS
  // ---------------------------------------------------------------------
  const swipeToLane = useCallback((lane: -1 | 1) => {
    if (gameState !== 'playing') return;
    setCurrentLane(lane);
    targetLaneXRef.current = lane === -1 ? -2.6 : 2.6;
    playSynthSound('swipe');
  }, [gameState, playSynthSound]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          swipeToLane(-1);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          swipeToLane(1);
        } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          setGameState('paused');
        }
      } else if (gameState === 'paused' && (e.key === 'Escape' || e.key === 'p' || e.key === 'P')) {
        setGameState('playing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, swipeToLane]);

  // Touch Swipe Handlers for mobile & trackpad
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartXRef.current = clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartXRef.current === null) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = clientX - touchStartXRef.current;

    if (Math.abs(diff) > 25) {
      if (diff > 0) swipeToLane(1); // Swipe right
      else swipeToLane(-1); // Swipe left
    }
    touchStartXRef.current = null;
  };

  // Restart Game
  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setLives(3);
    setSpeedMph(55);
    roadSpeedRef.current = 20;
    questionIndexRef.current = 0;
    setCurrentQuestionIndex(0);
    gateZRef.current = -130;
    isGateEvaluatingRef.current = false;
    targetLaneXRef.current = -2.6;
    currentLaneXRef.current = -2.6;
    setCurrentLane(-1);
    setGameState('playing');
    playSynthSound('start');
  };

  // Stylized title decomposition for cinematic sci-fi presentation
  const titleParts = gameTitle.includes(':')
    ? gameTitle.split(':').map((s) => s.trim())
    : gameTitle.includes('-')
    ? gameTitle.split('-').map((s) => s.trim())
    : [gameTitle];

  const primaryTitle = titleParts[0];
  const secondaryTitle = titleParts.length > 1 ? titleParts.slice(1).join(' : ') : null;

  const getLoadingStatus = (progress: number) => {
    if (progress < 25) return 'SYNCHRONIZING HIGHWAY MATRIX...';
    if (progress < 50) return 'LOADING 3D NEON ASSETS & SHADERS...';
    if (progress < 75) return 'CALIBRATING CAR V8 TURBO TELEMETRY...';
    if (progress < 95) return 'GENERATING MATH EQUATION GATES...';
    return 'ALL SYSTEMS READY // LAUNCHING!';
  };

  const currentQ = ALGEBRA_QUESTIONS[currentQuestionIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#070512] text-white flex flex-col overflow-hidden select-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
    >
      {/* 3D WebGL Canvas for Synthwave Highway */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* ================= TOP HUD: QUESTION, SCORE, LIVES, SPEED ================= */}
      <div className="relative z-20 w-full px-4 sm:px-8 pt-4 pb-2 flex flex-col gap-3 pointer-events-none">
        
        {/* Row 1: Header Bar (Exit, Speed, Lives, Sound, Pause) */}
        <div className="flex items-center justify-between gap-3">
          {/* Back to Arcade Button */}
          <button
            onClick={onExit}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-400" />
            <span>Arcade</span>
          </button>

          {/* Center Stats: Speed & Streak */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/30 text-xs font-black text-cyan-300 shadow-md">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{speedMph} MPH</span>
            </div>

            {streak > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/80 to-rose-500/80 backdrop-blur-md border border-amber-400/50 text-xs font-black text-white shadow-lg animate-bounce">
                <Flame className="w-3.5 h-3.5 text-yellow-200 fill-current" />
                <span>{streak}x STREAK</span>
              </div>
            )}
          </div>

          {/* Right Controls: Lives + Sound + Pause */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            {/* 3 Lives Hearts */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-rose-500/30">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 transition-transform ${
                    heartIndex <= lives
                      ? 'text-rose-500 fill-current scale-100'
                      : 'text-gray-600 fill-transparent scale-90 opacity-40'
                  }`}
                />
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="w-9 h-9 rounded-xl bg-black/60 hover:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
              title={isSoundMuted ? 'Unmute' : 'Mute'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Pause Button */}
            <button
              onClick={() => setGameState('paused')}
              className="w-9 h-9 rounded-xl bg-black/60 hover:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Pause Game"
            >
              <Pause className="w-4 h-4 text-purple-300" />
            </button>
          </div>
        </div>

        {/* Row 2: Central Holographic Algebra Question Banner */}
        <div className="mx-auto w-full max-w-xl">
          <div className="relative rounded-2xl bg-gradient-to-r from-purple-950/90 via-indigo-950/95 to-purple-950/90 backdrop-blur-xl border-2 border-cyan-400/50 p-3 sm:p-4 text-center shadow-[0_0_35px_rgba(6,182,212,0.35)] flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-cyan-300/90">
              {currentQ.subtext} • Swipe To Choose Lane
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-wide drop-shadow-md">
              {currentQ.prompt}
            </h2>

            {/* Score Pill */}
            <div className="absolute right-3 top-3 px-2.5 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-400/40 text-[11px] font-black text-cyan-200">
              {score} PTS
            </div>

            {/* Approach Progress Indicator Bar */}
            <div className="w-full mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden border border-white/10 relative">
              <div
                ref={approachBarRef}
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 rounded-full transition-none shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                style={{ width: '0%' }}
              />
            </div>
            <div className="flex items-center justify-between w-full text-[9px] sm:text-[10px] text-gray-400 font-semibold tracking-wider pt-0.5 px-0.5">
              <span className="text-cyan-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                READ & SOLVE
              </span>
              <span className="text-purple-300">SWIPE BEFORE GATE</span>
            </div>
          </div>
        </div>

      </div>

      {/* ================= FLOATING HIT/FEEDBACK TOAST ================= */}
      {feedbackEffect && (
        <div className="absolute top-36 sm:top-40 inset-x-0 mx-auto w-max z-30 pointer-events-none animate-in zoom-in-75 duration-200">
          <div
            className={`px-5 py-2 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase shadow-2xl backdrop-blur-md flex items-center gap-2 border ${
              feedbackEffect.isCorrect
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.6)]'
                : 'bg-rose-950/90 text-rose-300 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.6)]'
            }`}
          >
            {feedbackEffect.isCorrect ? <Sparkles className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-rose-400" />}
            <span>{feedbackEffect.text}</span>
          </div>
        </div>
      )}

      {/* ================= BOTTOM LANE TOUCH CONTROLS (Mobile & Desktop Touch) ================= */}
      <div className="absolute bottom-6 inset-x-0 px-4 sm:px-8 z-20 flex items-center justify-between pointer-events-auto">
        {/* Left Lane Swipe Button */}
        <button
          onClick={() => swipeToLane(-1)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl backdrop-blur-xl border-2 transition-all transform active:scale-95 cursor-pointer shadow-xl ${
            currentLane === -1
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.5)] scale-105'
              : 'bg-black/60 border-white/20 text-gray-300 hover:border-cyan-400/60'
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-cyan-400" />
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Lane A</span>
            <span className="text-xs sm:text-sm font-black">{currentQ.options[0]}</span>
          </div>
        </button>

        {/* Center Swipe Guide */}
        <div className="hidden sm:flex flex-col items-center gap-0.5 text-center text-[11px] text-gray-400 font-medium">
          <span>Swipe or Use ◄ ► Arrow Keys</span>
          <span className="text-cyan-400 font-bold">Automatic Throttle</span>
        </div>

        {/* Right Lane Swipe Button */}
        <button
          onClick={() => swipeToLane(1)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl backdrop-blur-xl border-2 transition-all transform active:scale-95 cursor-pointer shadow-xl ${
            currentLane === 1
              ? 'bg-rose-500/30 border-rose-400 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.5)] scale-105'
              : 'bg-black/60 border-white/20 text-gray-300 hover:border-rose-400/60'
          }`}
        >
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Lane B</span>
            <span className="text-xs sm:text-sm font-black">{currentQ.options[1]}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-400" />
        </button>
      </div>

      {/* ================= MODAL 1: HIGH-IMPACT STYLIZED LOADING SCREEN ================= */}
      {gameState === 'loading' && (
        <div className="absolute inset-0 z-50 bg-[#06040F] flex flex-col items-center justify-between p-6 sm:p-10 text-center select-none overflow-hidden animate-in fade-in duration-300">
          
          {/* Ambient Cosmic Neon Background Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-purple-700/15 rounded-full blur-[160px]" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/20 rounded-full blur-[140px] animate-pulse" />
            {/* Subtle retro horizontal scanline overlay */}
            <div 
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, #00ffff 0px, #00ffff 1px, transparent 2px, transparent 4px)',
                backgroundSize: '100% 4px'
              }}
            />
          </div>

          {/* Top HUD Bar */}
          <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-xs font-mono text-cyan-400/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold tracking-widest uppercase">SYS_INITIALIZE // {gameCategory.toUpperCase()}</span>
            </div>
            {gameBadge && (
              <span className="px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-[10px] font-black tracking-widest text-purple-200 uppercase shadow-sm">
                {gameBadge}
              </span>
            )}
            <button
              onClick={onExit}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-semibold cursor-pointer border border-white/10"
            >
              EXIT
            </button>
          </div>

          {/* Center Main Stage: Stylized Title, Holographic Icon & Progress */}
          <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center space-y-7 my-auto">
            
            {/* Glowing Retro Arcade Hologram Icon */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-600 to-rose-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0F0A24] border-2 border-cyan-400/50 p-1 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.5)]">
                <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-[#180E38] to-[#0A0618] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.25)_0%,transparent_70%)]" />
                  <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.9)] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Stylized Game Title in Futuristic Orbitron Font */}
            <div className="space-y-3">
              <div className="inline-block relative px-4">
                <h1 className="font-orbitron text-3xl sm:text-5xl md:text-6xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-200 to-rose-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.7)] leading-tight">
                  {primaryTitle}
                </h1>
              </div>

              {secondaryTitle ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-cyan-400/80" />
                  <p className="font-orbitron text-xs sm:text-base font-bold tracking-[0.3em] text-cyan-300 uppercase drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                    {secondaryTitle}
                  </p>
                  <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-cyan-400/80" />
                </div>
              ) : (
                <p className="font-orbitron text-xs sm:text-sm font-bold tracking-[0.3em] text-cyan-300/80 uppercase">
                  {gameSubtitle}
                </p>
              )}
              
              <p className="text-[11px] sm:text-xs font-mono text-purple-300/80 tracking-wider">
                {gameTopic}
              </p>
            </div>

            {/* High-Tech Cyber Progress Bar */}
            <div className="w-full max-w-md space-y-2.5 pt-2">
              {/* Outer cyber frame with corner accents */}
              <div className="relative w-full h-4 sm:h-5 rounded-full bg-[#110D27] p-1 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] transition-all duration-150 ease-out relative"
                  style={{ width: `${loadProgress}%` }}
                >
                  {/* Sliding light gleam */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                </div>
              </div>

              {/* Status and Percentage */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300 tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  {getLoadingStatus(loadProgress)}
                </span>
                <span className="font-orbitron text-sm sm:text-base font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  {loadProgress}%
                </span>
              </div>
            </div>

            {/* Quick How-To Card */}
            <div className="w-full max-w-md px-4 py-3 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-center text-xs text-gray-300 space-y-1">
              <p className="text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
                🎮 How to Play
              </p>
              <p className="text-gray-300">
                Solve the algebra equation on top. <span className="text-white font-semibold">SWIPE</span> or use <span className="text-cyan-300 font-bold font-mono">[A / D]</span> or <span className="text-cyan-300 font-bold font-mono">[← / →]</span> to steer your car into the correct answer lane!
              </p>
            </div>

          </div>

          {/* Bottom Footer Info */}
          <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-[11px] font-mono text-gray-500">
            <span>DRIVER: <strong className="text-gray-300">{userName.toUpperCase()}</strong></span>
            <span>AUDIO ENGINE: <strong className="text-emerald-400">SYNTH_ONLINE</strong></span>
            <span>SIMULATION: <strong className="text-cyan-400">HIGHWAY_V8</strong></span>
          </div>

        </div>
      )}

      {/* ================= MODAL 2: PAUSE MENU ================= */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#140C2E]/95 border-2 border-purple-500/40 p-6 sm:p-8 text-center shadow-2xl space-y-6">
            <h2 className="text-2xl font-black tracking-wide text-white">GAME PAUSED</h2>

            <div className="space-y-3">
              {/* Resume Button */}
              <button
                onClick={() => setGameState('playing')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME RACE</span>
              </button>

              {/* Restart Button */}
              <button
                onClick={handleRestart}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART</span>
              </button>

              {/* Quit to Arcade */}
              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
              >
                EXIT TO ARCADE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: GAME OVER / RETRY SCREEN ================= */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className="w-full max-w-md rounded-3xl bg-[#160B30]/95 border-2 border-rose-500/50 p-6 sm:p-8 text-center shadow-2xl space-y-6">
            {/* Trophy Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-[0_0_30px_rgba(244,63,94,0.5)]">
              <div className="w-full h-full rounded-[14px] bg-[#120826] flex items-center justify-center">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                RACE COMPLETED!
              </h2>
              <p className="text-xs text-gray-400 mt-1">Great mathematical reflexes on the road, {userName}!</p>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/40 border border-white/10 text-left">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Final Score</span>
                <p className="text-xl font-black text-cyan-300">{score} PTS</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">High Score</span>
                <p className="text-xl font-black text-amber-300">{highScore} PTS</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Best Speed</span>
                <p className="text-base font-bold text-white">{speedMph} MPH</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Max Streak</span>
                <p className="text-base font-bold text-white">{streak} In a Row</p>
              </div>
            </div>

            {/* Retry & Exit Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-cyan-500 hover:from-rose-400 hover:to-cyan-400 text-white font-black text-sm tracking-wide shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
              >
                <RotateCcw className="w-4 h-4 fill-current" />
                <span>PLAY AGAIN</span>
              </button>

              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
              >
                BACK TO ARCADE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
