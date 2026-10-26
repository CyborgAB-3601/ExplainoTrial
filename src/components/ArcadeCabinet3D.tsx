import React, { useState, useEffect, useRef, useCallback } from 'react';
import { arcadeAudio } from '../utils/arcadeAudio';
import { Volume2, VolumeX, ArrowRight, X } from 'lucide-react';
import arcadePovImg from '../assets/arcade_pov.png';

interface ArcadeCabinet3DProps {
  onEnterArcade: () => void;
  onClose?: () => void;
}

export const ArcadeCabinet3D: React.FC<ArcadeCabinet3DProps> = ({ onEnterArcade, onClose }) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [isHoveringScreen, setIsHoveringScreen] = useState<boolean>(false);

  // Retro Arcade Typewriter Effect for "PLAY TO LEARN"
  const fullText = 'PLAY TO LEARN';
  const [typedCount, setTypedCount] = useState<number>(0);

  useEffect(() => {
    let currentIdx = 0;
    let isDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!isDeleting) {
        currentIdx++;
        setTypedCount(currentIdx);
        if (currentIdx >= fullText.length) {
          timer = setTimeout(() => {
            isDeleting = true;
            tick();
          }, 3500);
          return;
        }
        timer = setTimeout(tick, 110);
      } else {
        currentIdx--;
        setTypedCount(currentIdx);
        if (currentIdx <= 0) {
          isDeleting = false;
          timer = setTimeout(tick, 600);
          return;
        }
        timer = setTimeout(tick, 50);
      }
    };

    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, []);

  const line1 = fullText.slice(0, Math.min(4, typedCount));
  const line2 = typedCount > 5 ? fullText.slice(5, typedCount) : '';
  const isTypingLine1 = typedCount <= 4;
  const isTypingLine2 = typedCount > 4;

  // Tactile button-press recoil state
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [activeBtnIndex, setActiveBtnIndex] = useState<number | null>(null);

  // Mouse reticle position on CRT screen (-1 to +1)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const cursorPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Lasers / Blasts on CRT screen
  const blastsRef = useRef<{ x: number; y: number; radius: number; opacity: number }[]>([]);

  // 3D Parallax Tilt for entire POV machine
  const [parallax, setParallax] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      arcadeAudio.setMuted(next);
      return next;
    });
  }, []);

  // Insert Coin
  const handleInsertCoin = useCallback(() => {
    arcadeAudio.playCoin();
  }, []);

  // Trigger Tactile Button Tap & Laser Blast
  const triggerButtonTap = useCallback((btnIndex: number = 0) => {
    arcadeAudio.playButton();
    setIsTapping(true);
    setActiveBtnIndex(btnIndex);

    // Spawn laser blast on CRT screen
    blastsRef.current.push({
      x: 0.48 + cursorPosRef.current.x * 0.25,
      y: 0.65 + cursorPosRef.current.y * 0.15,
      radius: 4,
      opacity: 1.0,
    });

    setTimeout(() => {
      setIsTapping(false);
      setActiveBtnIndex(null);
    }, 150);
  }, []);

  // Launch Arcade Page with Instant Navigation to Game Library
  const handleLaunchArcade = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      arcadeAudio.playWarp();
    } catch {
      // Audio error fallback
    }
    setIsWarping(true);
    onEnterArcade();
  }, [onEnterArcade]);

  // Mouse Move: Updates entire POV 3D parallax tilt & in-game screen crosshair
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    // Smooth POV camera tilt (+- 6 degrees)
    setParallax({
      rotateX: -ny * 6,
      rotateY: nx * 7,
    });

    // In-game screen crosshair
    const cx = Math.max(-1, Math.min(1, nx * 2.2));
    const cy = Math.max(-1, Math.min(1, ny * 2.2));
    setCursorPos({ x: cx, y: cy });
    cursorPosRef.current = { x: cx, y: cy };
  }, []);

  const handleMouseLeave = useCallback(() => {
    setParallax({ rotateX: 0, rotateY: 0 });
    setCursorPos({ x: 0, y: 0 });
    cursorPosRef.current = { x: 0, y: 0 };
    setIsHoveringScreen(false);
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLaunchArcade();
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        triggerButtonTap(0);
        return;
      }
      if (e.key.toLowerCase() === 'c') {
        handleInsertCoin();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        cursorPosRef.current.x = -0.8;
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        cursorPosRef.current.x = 0.8;
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        cursorPosRef.current.y = -0.8;
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        cursorPosRef.current.y = 0.8;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
        cursorPosRef.current.x = 0;
      }
      if (['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S'].includes(e.key)) {
        cursorPosRef.current.y = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleLaunchArcade, triggerButtonTap, handleInsertCoin]);

  // Animated CRT Canvas Rendering (Scanlines, Starfield, Retro Grid, Player Reticle)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let scanlineOffset = 0;
    let gridOffset = 0;

    const stars = Array.from({ length: 30 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.002 + Math.random() * 0.005,
      size: Math.random() * 2 + 1,
    }));

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. Transparent Clear (So the glowing screen & fingers show through naturally!)
      ctx.clearRect(0, 0, w, h);

      // 2. Animated Retro Synthwave Grid at bottom of monitor
      ctx.strokeStyle = 'rgba(217, 70, 239, 0.22)';
      ctx.lineWidth = 1.4;
      gridOffset = (gridOffset + 0.6) % 20;

      for (let y = h * 0.52; y < h; y += 12 + (y - h * 0.52) * 0.3) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const vanishX = w * 0.5 + cursorPosRef.current.x * 20;
      const vanishY = h * 0.42;
      for (let x = -w * 0.2; x <= w * 1.2; x += 32) {
        ctx.beginPath();
        ctx.moveTo(vanishX, vanishY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 3. Animated Starfield Particles
      ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
      stars.forEach((s) => {
        s.y += s.speed;
        if (s.y > 1) s.y = 0;
        ctx.fillRect(s.x * w, s.y * h, s.size, s.size);
      });

      // 4. Interactive Player Crosshair (Steered in real-time by the mouse cursor)
      const shipX = w * 0.48 + cursorPosRef.current.x * (w * 0.25);
      const shipY = h * 0.70 + cursorPosRef.current.y * (h * 0.15);

      // Neon reticle
      ctx.strokeStyle = '#D946EF';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(shipX, shipY, 11, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(shipX - 14, shipY);
      ctx.lineTo(shipX - 5, shipY);
      ctx.moveTo(shipX + 5, shipY);
      ctx.lineTo(shipX + 14, shipY);
      ctx.moveTo(shipX, shipY - 14);
      ctx.lineTo(shipX - 5, shipY - 5);
      ctx.moveTo(shipX + 5, shipY + 5);
      ctx.lineTo(shipX + 14, shipY);
      ctx.stroke();

      ctx.fillStyle = '#EC4899';
      ctx.beginPath();
      ctx.arc(shipX, shipY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 5. Expand laser blast ripple rings
      blastsRef.current = blastsRef.current.filter((b) => {
        b.radius += 2.5;
        b.opacity -= 0.045;
        if (b.opacity <= 0) return false;

        ctx.strokeStyle = `rgba(217, 70, 239, ${b.opacity})`;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(b.x * w, b.y * h, b.radius, 0, Math.PI * 2);
        ctx.stroke();
        return true;
      });

      // 6. Rolling Phosphor Cathode Scanline Beam
      scanlineOffset = (scanlineOffset + 1.4) % h;
      const scanBeam = ctx.createLinearGradient(0, scanlineOffset - 25, 0, scanlineOffset + 25);
      scanBeam.addColorStop(0, 'rgba(192, 38, 211, 0.0)');
      scanBeam.addColorStop(0.5, 'rgba(192, 38, 211, 0.16)');
      scanBeam.addColorStop(1, 'rgba(192, 38, 211, 0.0)');
      ctx.fillStyle = scanBeam;
      ctx.fillRect(0, 0, w, h);

      // Fine horizontal TV scanlines
      ctx.fillStyle = 'rgba(26, 8, 48, 0.06)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1.4);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    /* FIXED INSET-0: Spans the TRUE FULL SCREEN (100vw x 100vh), extending behind/beyond the floating navbar */
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 w-screen h-screen z-20 flex items-center justify-center overflow-hidden select-none bg-[#070512]"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #170C2D 0%, #0A0517 60%, #030208 100%)',
      }}
    >
      {/* Ambient Neon Atmosphere Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Marquee Glow */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-blue-600/20 blur-[120px] rounded-full" />
        {/* Center CRT Magenta Halo */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-fuchsia-600/30 blur-[130px] rounded-full" />
        {/* Bottom Ambient Glow */}
        <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-900/30 blur-[140px] rounded-full" />
      </div>

      {/* Top Floating Controls Bar */}
      <div className="absolute top-5 inset-x-6 flex items-center justify-end z-40 pointer-events-none">
        {/* Right Controls: Audio + Close */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="w-10 h-10 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-fuchsia-400" />}
          </button>

          {/* Close back to Home */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
              title="Return to Home"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Full-Screen POV Arcade View with 3D Parallax & Tactile Button Click Recoil */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1100px) rotateX(${parallax.rotateX}deg) rotateY(${parallax.rotateY}deg) scale(${isTapping ? 0.995 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Full-Bleed Scaling Container (Mathematical object-cover: zero letterboxing, zero side margins) */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            width: 'max(100vw, calc(100vh * 1.1187))',
            height: 'max(100vh, calc(100vw / 1.1187))',
          }}
        >
          {/* Layer 1: Seamless, Pristine, Complete Original Artwork (Hands 100% Unclipped, No Cut Lines!) */}
          <img
            src={arcadePovImg}
            alt="Arcade POV"
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />

          {/* ================= DEDICATED DIRECT UNCLIPPED HIT TARGET OVER CRT SCREEN ================= */}
          <button
            type="button"
            onClick={handleLaunchArcade}
            onMouseEnter={() => setIsHoveringScreen(true)}
            onMouseLeave={() => setIsHoveringScreen(false)}
            className="absolute z-30 cursor-pointer rounded-2xl focus:outline-none"
            style={{
              left: '21%',
              top: '32%',
              width: '58%',
              height: '40%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Click Screen to Start!"
            aria-label="Click Screen to Enter Game Library"
          />

          {/* ================= LAYER 2: INTERACTIVE DYNAMIC CRT SCREEN ================= */}
          <div
            onClick={handleLaunchArcade}
            onMouseEnter={() => setIsHoveringScreen(true)}
            onMouseLeave={() => setIsHoveringScreen(false)}
            className="absolute z-15 cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all duration-300"
            style={{
              left: '23.4%',
              top: '36.1%',
              width: '52.7%',
              height: '33.0%',
              clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
              transform: 'perspective(600px) rotateX(21deg)',
              transformOrigin: '50% 85%',
              cursor: 'pointer',
            }}
            title="Click Screen to Start!"
          >
            {/* Real Animated HTML5 Canvas CRT Effects (Transparent background) */}
            <canvas
              ref={canvasRef}
              width={512}
              height={384}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Glowing Retro Arcade Typography with Typewriter Effect */}
            <div
              onClick={handleLaunchArcade}
              className="relative z-10 flex flex-col items-center justify-center text-center -translate-y-2 select-none px-3 cursor-pointer"
            >
              
              {/* Line 1: PLAY */}
              <div
                className="font-black uppercase tracking-wider text-[#0A0315] flex items-center justify-center transition-transform duration-200"
                style={{
                  fontSize: 'clamp(30px, 4.8vw, 54px)',
                  lineHeight: 1.15,
                  fontFamily: '"Press Start 2P", monospace',
                  textShadow: '0 4px 0 #3B0764, 0 8px 18px rgba(0,0,0,0.35), 0 0 22px rgba(217,70,239,0.7)',
                  transform: isHoveringScreen ? 'scale(1.05)' : 'scale(1)',
                  minHeight: '1.2em',
                }}
              >
                <span>{line1 || '\u00A0'}</span>
                {isTypingLine1 && (
                  <span className="inline-block animate-pulse text-fuchsia-600 ml-1">_</span>
                )}
              </div>

              {/* Line 2: TO LEARN */}
              <div
                className="font-black uppercase tracking-wide mt-2.5 text-[#16052B] flex items-center justify-center transition-transform duration-200"
                style={{
                  fontSize: 'clamp(24px, 3.6vw, 42px)',
                  lineHeight: 1.15,
                  fontFamily: '"Press Start 2P", monospace',
                  textShadow: '0 3px 0 #1E1B4B, 0 6px 16px rgba(0,0,0,0.35), 0 0 20px rgba(99,102,241,0.7)',
                  transform: isHoveringScreen ? 'scale(1.05)' : 'scale(1)',
                  minHeight: '1.2em',
                }}
              >
                <span>{line2 || (typedCount > 4 ? '\u00A0' : '')}</span>
                {isTypingLine2 && (
                  <span className="inline-block animate-pulse text-cyan-500 ml-1">_</span>
                )}
              </div>

              {/* Action Prompt */}
              <div
                onClick={handleLaunchArcade}
                className="mt-3.5 flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/25 border border-purple-950/35 backdrop-blur-xs cursor-pointer hover:bg-purple-900/40 transition-colors"
              >
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#2D124D] font-mono">
                  CLICK SCREEN TO START
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2D124D] animate-bounce" />
              </div>
            </div>

            {/* CRT Glass Corner Glare */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/50 to-transparent pointer-events-none" />
          </div>

          {/* ================= LAYER 3: 4 CLICKABLE NEON DECK BUTTONS ================= */}
          {/* Button 1 (Top Left) */}
          <button
            onClick={() => triggerButtonTap(0)}
            className={`absolute z-22 rounded-full cursor-pointer transition-all duration-100 ${
              activeBtnIndex === 0 ? 'scale-90 ring-4 ring-fuchsia-400 bg-fuchsia-500 shadow-[0_0_25px_#D946EF]' : 'hover:scale-105'
            }`}
            style={{
              left: '48.5%',
              top: '79.2%',
              width: '6.2%',
              height: '4.2%',
              background: 'radial-gradient(circle, #C026D3 0%, #581C87 70%, #2E1065 100%)',
              border: '2px solid rgba(217, 70, 239, 0.7)',
              boxShadow: activeBtnIndex === 0 ? '0 0 30px #D946EF' : '0 4px 10px rgba(0,0,0,0.6)',
            }}
            title="Press Button 1 (Spacebar)"
          />

          {/* Button 2 (Top Right) */}
          <button
            onClick={() => triggerButtonTap(1)}
            className={`absolute z-22 rounded-full cursor-pointer transition-all duration-100 ${
              activeBtnIndex === 1 ? 'scale-90 ring-4 ring-fuchsia-400 bg-fuchsia-500 shadow-[0_0_25px_#D946EF]' : 'hover:scale-105'
            }`}
            style={{
              left: '64.0%',
              top: '78.5%',
              width: '6.2%',
              height: '4.2%',
              background: 'radial-gradient(circle, #C026D3 0%, #581C87 70%, #2E1065 100%)',
              border: '2px solid rgba(217, 70, 239, 0.7)',
              boxShadow: activeBtnIndex === 1 ? '0 0 30px #D946EF' : '0 4px 10px rgba(0,0,0,0.6)',
            }}
            title="Press Button 2"
          />

          {/* Button 3 (Bottom Left) */}
          <button
            onClick={() => triggerButtonTap(2)}
            className={`absolute z-22 rounded-full cursor-pointer transition-all duration-100 ${
              activeBtnIndex === 2 ? 'scale-90 ring-4 ring-cyan-400 bg-cyan-500 shadow-[0_0_25px_#06B6D4]' : 'hover:scale-105'
            }`}
            style={{
              left: '57.0%',
              top: '83.5%',
              width: '6.2%',
              height: '4.2%',
              background: 'radial-gradient(circle, #06B6D4 0%, #0E7490 70%, #164E63 100%)',
              border: '2px solid rgba(6, 182, 212, 0.7)',
              boxShadow: activeBtnIndex === 2 ? '0 0 30px #06B6D4' : '0 4px 10px rgba(0,0,0,0.6)',
            }}
            title="Press Button 3"
          />

          {/* Button 4 (Bottom Right) */}
          <button
            onClick={() => triggerButtonTap(3)}
            className={`absolute z-22 rounded-full cursor-pointer transition-all duration-100 ${
              activeBtnIndex === 3 ? 'scale-90 ring-4 ring-amber-400 bg-amber-500 shadow-[0_0_25px_#F59E0B]' : 'hover:scale-105'
            }`}
            style={{
              left: '74.5%',
              top: '82.8%',
              width: '6.2%',
              height: '4.2%',
              background: 'radial-gradient(circle, #F59E0B 0%, #B45309 70%, #78350F 100%)',
              border: '2px solid rgba(245, 158, 11, 0.7)',
              boxShadow: activeBtnIndex === 3 ? '0 0 30px #F59E0B' : '0 4px 10px rgba(0,0,0,0.6)',
            }}
            title="Press Button 4"
          />

        </div>
      </div>



      {/* Warp Transition Overlay */}
      {isWarping && (
        <div className="fixed inset-0 z-50 bg-[#120626] animate-in fade-in duration-700 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin shadow-[0_0_25px_rgba(217,70,239,0.8)]" />
            <span className="text-xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-200">
              ENTERING ARCADE ARENA...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
