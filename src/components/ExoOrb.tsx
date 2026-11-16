import React, { useState, useEffect, useRef } from 'react';

export type OrbMood = 'idle' | 'happy' | 'winking' | 'thinking' | 'excited' | 'spinning';

interface ExoOrbProps {
  speechBubbleTitle?: string;
  speechBubbleSubtitle?: string;
  speechBubbleEmoji?: string;
  showSpeechBubble?: boolean;
  subLabel?: string;
  showPedestal?: boolean;
  isInspectingEmail?: boolean;
  inspectingEmailText?: string;
  isPasswordMode?: boolean;
  showPassword?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  initialMood?: OrbMood;
  speechBubblePosition?: 'top-right' | 'top-left' | 'top';
  className?: string;
  isListening?: boolean;
  listeningVolume?: number;
  accessory?: 'none' | 'headphones' | 'controller';
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const ExoOrb: React.FC<ExoOrbProps> = React.memo(({
  speechBubbleTitle = "Hi! I'm EXO",
  speechBubbleSubtitle = "Explain it to me",
  speechBubbleEmoji = "✨",
  showSpeechBubble = true,
  subLabel = "Your AI learning companion",
  isInspectingEmail = false,
  inspectingEmailText = '',
  isPasswordMode = false,
  showPassword = false,
  showPedestal = true,
  size = 'md',
  interactive = true,
  speechBubblePosition = 'top-right',
  className = '',
  isListening = false,
  listeningVolume = 0,
  accessory = 'none',
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
}) => {
  const orbRef = useRef<HTMLDivElement>(null);
  
  // Interactive mouse offset (-1 to 1)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const mouseOffsetRef = useRef({ x: 0, y: 0 });

  // Expressions & Actions
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [showBlush, setShowBlush] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Continuous 3D Spherical Revolution Turn State
  const [revolving, setRevolving] = useState(false);
  const [revolveProgress, setRevolveProgress] = useState(0); // 0 to 1
  const startAngleRef = useRef(0);
  const startYRef = useRef(0);
  const revolveRafRef = useRef<number | null>(null);
  
  const [demoListening, setDemoListening] = useState(false);
  const [isInternalHolding, setIsInternalHolding] = useState(false);
  const holdTimerRef = useRef<number>(0);
  const effectiveListening = isListening || demoListening || isInternalHolding;
  const effectiveListeningRef = useRef(effectiveListening);
  effectiveListeningRef.current = effectiveListening;

  // Immediately cancel any in-flight revolution when listening starts so it never gets stuck
  useEffect(() => {
    if (effectiveListening) {
      if (revolveRafRef.current) {
        cancelAnimationFrame(revolveRafRef.current);
        revolveRafRef.current = null;
      }
      setRevolving(false);
      setRevolveProgress(0);
    }
  }, [effectiveListening]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (revolveRafRef.current) {
        cancelAnimationFrame(revolveRafRef.current);
      }
    };
  }, []);

  // Silky 60-144fps audio smoothing RAF loop (Zero React re-renders, zero jitter)
  const targetVolumeRef = useRef(0);
  targetVolumeRef.current = listeningVolume;
  const smoothVolumeRef = useRef(0);
  const audioStageRef = useRef<HTMLDivElement>(null);
  const audioRafRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const tickAudio = () => {
      if (!active) return;

      const target = effectiveListeningRef.current ? targetVolumeRef.current : 0;
      const current = smoothVolumeRef.current;

      // Asymmetric organic lerp: quick attack (0.22) + graceful soft decay (0.09)
      const rate = target > current ? 0.22 : 0.09;
      const next = current + (target - current) * rate;
      const resolved = Math.abs(next - target) < 0.0008 ? target : next;
      smoothVolumeRef.current = resolved;

      if (audioStageRef.current) {
        audioStageRef.current.style.setProperty('--orb-vol', resolved.toFixed(4));
      }

      // If finished easing down to 0 while not listening, pause loop to save resources
      if (!effectiveListeningRef.current && resolved === 0) {
        audioRafRef.current = null;
        return;
      }

      audioRafRef.current = requestAnimationFrame(tickAudio);
    };

    if (effectiveListening || smoothVolumeRef.current > 0 || listeningVolume > 0) {
      if (!audioRafRef.current) {
        audioRafRef.current = requestAnimationFrame(tickAudio);
      }
    }

    return () => {
      active = false;
      if (audioRafRef.current) {
        cancelAnimationFrame(audioRafRef.current);
        audioRafRef.current = null;
      }
    };
  }, [effectiveListening, listeningVolume]);
  
  const [isPeeking, setIsPeeking] = useState(false);

  // Password look-away & peeking animation cycle:
  // Looks away politely, then sneaks a cheeky peek, then quickly looks away!
  useEffect(() => {
    if (!isPasswordMode) {
      setIsPeeking(false);
      return;
    }

    let peekTimeout: ReturnType<typeof setTimeout>;
    let resetTimeout: ReturnType<typeof setTimeout>;

    const runPeekCycle = () => {
      // Look away for 2.2s, then peek for 1.1s
      peekTimeout = setTimeout(() => {
        setIsPeeking(true);
        resetTimeout = setTimeout(() => {
          setIsPeeking(false);
          runPeekCycle();
        }, 1100);
      }, 2200);
    };

    runPeekCycle();

    return () => {
      clearTimeout(peekTimeout);
      clearTimeout(resetTimeout);
    };
  }, [isPasswordMode]);

  const [speechText, setSpeechText] = useState({
    title: speechBubbleTitle,
    subtitle: speechBubbleSubtitle,
    emoji: speechBubbleEmoji,
  });

  // Synchronize speech bubble when inspecting email, password mode, or when props change
  useEffect(() => {
    if (isInspectingEmail) {
      if (inspectingEmailText && inspectingEmailText.length > 0) {
        const preview = inspectingEmailText.length > 18 
          ? inspectingEmailText.slice(0, 16) + '...' 
          : inspectingEmailText;
        setSpeechText({
          title: "Reading your email...",
          subtitle: `"${preview}"`,
          emoji: "🔍",
        });
      } else {
        setSpeechText({
          title: "Checking your email...",
          subtitle: "Let me inspect that! 🔍",
          emoji: "🧐",
        });
      }
    } else if (isPasswordMode) {
      if (showPassword) {
        setSpeechText({
          title: "Password is revealed!",
          subtitle: "Covering my eyes! 🙈",
          emoji: "🫣",
        });
      } else if (isPeeking) {
        setSpeechText({
          title: "Just a tiny peek...",
          subtitle: "I promise I didn't see! 🫣",
          emoji: "👀",
        });
      } else {
        setSpeechText({
          title: "Shh... Secret password!",
          subtitle: "I'm looking away! 🙈",
          emoji: "🙈",
        });
      }
    } else {
      setSpeechText({
        title: speechBubbleTitle,
        subtitle: speechBubbleSubtitle,
        emoji: speechBubbleEmoji,
      });
    }
  }, [isInspectingEmail, inspectingEmailText, isPasswordMode, isPeeking, showPassword, speechBubbleTitle, speechBubbleSubtitle, speechBubbleEmoji]);

  // Track global mouse position relative to orb center
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!orbRef.current) return;
      const rect = orbRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      const clampedX = Math.max(-1, Math.min(1, dx));
      const clampedY = Math.max(-1, Math.min(1, dy));

      mouseOffsetRef.current = { x: clampedX, y: clampedY };
      setMouseOffset({ x: clampedX, y: clampedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Periodic natural blinking
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const blinkInterval = setInterval(() => {
      if (!revolving) {
        setIsBlinking(true);
        blinkTimeout = setTimeout(() => {
          setIsBlinking(false);
        }, 160);
      }
    }, 3800);

    return () => {
      clearInterval(blinkInterval);
      clearTimeout(blinkTimeout);
    };
  }, [revolving]);

  // Periodic Full 3D Revolution Turn (every 7.2s)
  useEffect(() => {
    if (!interactive || isListening) return;

    const interval = setInterval(() => {
      if (!revolving && !isJumping && !isInspectingEmail && !isPasswordMode && !isListening) {
        triggerFullTurn();
      }
    }, 7200);

    return () => clearInterval(interval);
  }, [interactive, revolving, isJumping, isInspectingEmail, isPasswordMode, isListening]);

  // Occasional cute winking
  useEffect(() => {
    if (isListening) return;

    const winkInterval = setInterval(() => {
      if (!revolving && !isJumping && !isInspectingEmail && !isPasswordMode && !isListening && Math.random() > 0.45) {
        setIsWinking(true);
        setShowBlush(true);
        setTimeout(() => {
          setIsWinking(false);
          setShowBlush(false);
        }, 1300);
      }
    }, 9000);

    return () => clearInterval(winkInterval);
  }, [revolving, isJumping, isInspectingEmail, isPasswordMode, isListening]);

  // Trigger smooth 3D spherical revolution turn starting from the CURRENT mouse gaze position
  const triggerFullTurn = () => {
    if (revolving || effectiveListeningRef.current) return;

    // Calculate current gaze angle offset from mouse position:
    // When mouse is right (e.g. x = 0.8), current gaze angle is around +0.36 rad (~20 deg).
    const currentMouseX = mouseOffsetRef.current.x;
    const currentMouseY = mouseOffsetRef.current.y;
    
    // Exact starting angle on the sphere so it starts seamlessly with 0 jump:
    startAngleRef.current = Math.asin(Math.max(-0.85, Math.min(0.85, currentMouseX * 0.45)));
    startYRef.current = currentMouseY * 9;

    setRevolving(true);

    const startTime = performance.now();
    const duration = 2100; // 2.1s for a luxurious, silky 360° turn

    const step = (currentTime: number) => {
      if (effectiveListeningRef.current) {
        setRevolving(false);
        setRevolveProgress(0);
        revolveRafRef.current = null;
        return;
      }

      const elapsed = currentTime - startTime;
      const p = Math.min(1, elapsed / duration);

      // Smooth quintic / cubic ease-in-out curve
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setRevolveProgress(eased);

      if (p < 1) {
        revolveRafRef.current = requestAnimationFrame(step);
      } else {
        revolveRafRef.current = null;
        setRevolving(false);
        setRevolveProgress(0);
        // Cute blink right after landing back at current mouse state
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 160);
      }
    };

    revolveRafRef.current = requestAnimationFrame(step);
  };

  const handleOrbClick = () => {
    if (demoListening) {
      setDemoListening(false);
      setSpeechText({
        title: speechBubbleTitle,
        subtitle: speechBubbleSubtitle,
        emoji: speechBubbleEmoji,
      });
      return;
    }
    setDemoListening(true);
    setSpeechText({ 
      title: "I'm listening!", 
      subtitle: "Listening closely... ✨", 
      emoji: "🔮" 
    });
    setTimeout(() => {
      setDemoListening(false);
      setSpeechText({
        title: speechBubbleTitle,
        subtitle: speechBubbleSubtitle,
        emoji: speechBubbleEmoji,
      });
    }, 4500);
  };

  const handleInternalPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (onPointerDown) {
      onPointerDown(e);
      return;
    }
    holdTimerRef.current = performance.now();
    setIsInternalHolding(true);
    setSpeechText({ 
      title: "I'm listening!", 
      subtitle: "Hold to talk, release when done ✨", 
      emoji: "🔮" 
    });
  };

  const handleInternalPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (onPointerUp) {
      onPointerUp(e);
      return;
    }
    const pressDuration = performance.now() - holdTimerRef.current;
    setIsInternalHolding(false);
    if (pressDuration < 280) {
      handleOrbClick();
    } else {
      setSpeechText({
        title: speechBubbleTitle,
        subtitle: speechBubbleSubtitle,
        emoji: speechBubbleEmoji,
      });
    }
  };

  const handleInternalPointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsHovered(false);
    if (onPointerLeave) {
      onPointerLeave(e);
      return;
    }
    if (isInternalHolding) {
      setIsInternalHolding(false);
      setSpeechText({
        title: speechBubbleTitle,
        subtitle: speechBubbleSubtitle,
        emoji: speechBubbleEmoji,
      });
    }
  };

  // Dimensions based on size prop
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52',
    lg: 'w-52 h-52 sm:w-56 sm:h-56 md:w-60 md:h-60',
  }[size];

  const orbRadius = {
    sm: 64,
    md: 96,
    lg: 110,
  }[size];

  // ================= 3D SPHERICAL PROJECTION MATH =================
  // Effective gaze target:
  // - Email inspecting: looks towards the email field
  // - Password mode: looks away to top-left, and periodically peeks right towards the input!
  // - Idle: tracks mouse cursor
  const effectiveGaze = isInspectingEmail
    ? { x: 0.28, y: 0.28 }
    : isPasswordMode
    ? isPeeking
      ? { x: 0.62, y: 0.32 } // Sneak peek at password field
      : { x: -0.75, y: -0.45 } // Look away politely to top-left
    : mouseOffset;

  // Current gaze target angle
  const currentTargetAngle = Math.asin(Math.max(-0.85, Math.min(0.85, effectiveGaze.x * 0.45)));
  const currentTargetY = effectiveGaze.y * 9;

  let finalEyeX = 0;
  let finalEyeY = 0;
  let finalScaleX = 1;
  let finalOpacity = 1;

  if (revolving) {
    // Rotation starts from whatever position it is (startAngleRef)
    // and seamlessly transitions to current mouse state at the end:
    // angle = lerp(startAngle, currentTargetAngle, p) + (p * 2 * PI)
    const baseAngle = (1 - revolveProgress) * startAngleRef.current + revolveProgress * currentTargetAngle;
    const currentAngle = baseAngle + revolveProgress * (2 * Math.PI);

    // Spherical position: x = R * sin(angle)
    finalEyeX = Math.sin(currentAngle) * (orbRadius * 0.72);

    // Smooth Y blending so it also follows mouse state vertically without jump
    finalEyeY = (1 - revolveProgress) * startYRef.current + revolveProgress * currentTargetY;

    // 3D foreshortening: scaleX = |cos(angle)|
    const cosAngle = Math.cos(currentAngle);
    finalScaleX = Math.max(0.04, Math.abs(cosAngle));

    // Natural occlusion: visible on front hemisphere (cosAngle > -0.12)
    const isFront = cosAngle > -0.12;
    finalOpacity = isFront ? Math.min(1, (cosAngle + 0.12) * 3) : 0;
  } else {
    // When idle: eyes smoothly look at mouse or email field
    finalEyeX = Math.sin(currentTargetAngle) * (orbRadius * 0.72);
    finalEyeY = currentTargetY;
    finalScaleX = 1;
    finalOpacity = 1;
  }

  // Parallax for internal cyan/pink glows during turn, mouse hover, or email inspection
  const colorCycle = revolving ? revolveProgress * 2 * Math.PI : 0;
  const cyanShiftX = effectiveGaze.x * 7 + (revolving ? Math.sin(colorCycle) * 8 : 0);
  const cyanShiftY = effectiveGaze.y * 7 + (revolving ? Math.cos(colorCycle) * 4 : 0);
  const pinkShiftX = -effectiveGaze.x * 7 - (revolving ? Math.sin(colorCycle) * 8 : 0);
  const pinkShiftY = -effectiveGaze.y * 7 - (revolving ? Math.cos(colorCycle) * 4 : 0);

  return (
    <div className={`relative w-full flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* Ambient Floating Glowing Bokeh (matches screenshot) */}
      <div className="absolute -left-16 sm:-left-24 top-6 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-tr from-[#D8B4FE]/35 to-[#F472B6]/25 blur-[2px] opacity-80 animate-float pointer-events-none" />
      <div className="absolute -left-8 sm:-left-12 bottom-10 w-9 h-9 rounded-full bg-gradient-to-br from-[#C084FC]/30 to-[#38BDF8]/35 blur-[1.5px] opacity-70 animate-float pointer-events-none" style={{ animationDelay: '1.2s' }} />
      <div className="absolute -right-16 sm:-right-24 top-4 w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-gradient-to-bl from-[#F472B6]/35 to-[#C084FC]/25 blur-[2px] opacity-80 animate-float pointer-events-none" style={{ animationDelay: '0.7s' }} />

      {/* Main Interactive Stage */}
      <div 
        ref={orbRef}
        onPointerDown={handleInternalPointerDown}
        onPointerUp={handleInternalPointerUp}
        onPointerLeave={handleInternalPointerLeave}
        onPointerCancel={(e) => {
          setIsInternalHolding(false);
          onPointerCancel?.(e);
        }}
        onMouseEnter={() => setIsHovered(true)}
        className="relative flex flex-col items-center justify-center cursor-pointer group"
      >
        
        {/* Floating Speech Bubble - Hidden during listening */}
        {showSpeechBubble && !effectiveListening && Boolean(speechText.title || speechText.subtitle) && (
          <div 
            className={`absolute z-30 transition-all duration-300 transform group-hover:scale-105 pointer-events-none ${
              speechBubblePosition === 'top-right' 
                ? '-top-3 sm:-top-5 right-0 sm:-right-8 md:-right-16' 
                : speechBubblePosition === 'top-left'
                ? '-top-4 sm:-top-6 left-0 sm:-left-8 md:-left-14'
                : '-top-10 left-1/2 -translate-x-1/2'
            }`}
          >
            <div className="relative bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-[0_10px_25px_rgba(124,92,255,0.14),0_2px_6px_rgba(0,0,0,0.04)] border border-purple-100/70">
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-bold text-[#1E1B2E] tracking-tight leading-tight flex items-center gap-1">
                  {speechText.title}
                </span>
                <span className="text-[12px] font-medium text-[#6B7280] flex items-center gap-1 mt-0.5 whitespace-nowrap">
                  {speechText.subtitle} <span className="text-[#C084FC] text-[13px]">{speechText.emoji}</span>
                </span>
              </div>
              {/* Speech bubble tail */}
              {speechBubblePosition === 'top-right' ? (
                <div className="absolute bottom-2 -left-1.5 w-3 h-3 bg-white rotate-45 border-l border-b border-purple-100/70" />
              ) : speechBubblePosition === 'top-left' ? (
                <div className="absolute bottom-2 -right-1.5 w-3 h-3 bg-white rotate-45 border-r border-t border-purple-100/70" />
              ) : (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-purple-100/70" />
              )}
            </div>
          </div>
        )}

        {/* Vertical Float & Squishy Jump Wrapper */}
        <div 
          className={`relative ${sizeClasses} flex items-center justify-center ${
            effectiveListening ? '' : isJumping ? 'animate-orb-jump' : 'animate-orb-float'
          }`}
          style={{
            transform: effectiveListening
              ? 'translateY(-6px) scale(1.18)'
              : undefined,
            transformOrigin: '50% 50%',
            transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: effectiveListening ? 35 : 10,
            willChange: 'transform',
          }}
        >
          {/* Audio Reactivity Wrapper (Continuous GPU-interpolated pulse, zero interrupted transitions) */}
          <div
            ref={audioStageRef}
            className="relative w-full h-full flex items-center justify-center pointer-events-none"
            style={{
              transform: effectiveListening
                ? 'scale(calc(1 + var(--orb-vol, 0) * 0.12))'
                : 'scale(1)',
              willChange: 'transform',
            }}
          >
          
            {/* Outer Luminous Neon Aura Glow (Atmospheric ultraviolet & cyan bloom) */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
              style={{
                background: effectiveListening
                  ? 'radial-gradient(circle, rgba(111, 50, 233, 0.88) 0%, rgba(97, 131, 239, 0.55) 45%, rgba(56, 189, 248, 0.35) 70%, transparent 85%)'
                  : 'radial-gradient(circle, rgba(168, 85, 247, 0.78) 0%, rgba(236, 72, 153, 0.55) 45%, rgba(56, 189, 248, 0.4) 70%, transparent 85%)',
                transform: effectiveListening 
                  ? 'scale(calc(1.32 + var(--orb-vol, 0) * 0.14))'
                  : isHovered 
                  ? 'scale(1.2)' 
                  : 'scale(1.1)',
                opacity: effectiveListening ? 0.98 : isHovered ? 0.9 : 0.7,
                transition: 'opacity 0.22s ease-out',
                willChange: 'transform, opacity',
              }}
            />

            {/* ================= REFERENCE BACKGROUND WARP & HARMONIC LIVING AURAS ================= */}
            <div 
              className="absolute pointer-events-none overflow-visible flex items-center justify-center transition-opacity duration-200"
              style={{
                inset: -70,
                zIndex: 4, // Behind orb body (zIndex: 20)
                opacity: effectiveListening ? 1 : 0,
              }}
            >
              {/* Layer 1: Atmospheric Outer Harmonic Expansion Bloom */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: -24,
                  background: 'radial-gradient(circle, transparent 48%, rgba(111, 50, 233, 0.52) 66%, rgba(97, 131, 239, 0.42) 78%, rgba(56, 189, 248, 0.22) 90%, transparent 98%)',
                  transform: 'scale(calc(1.12 + var(--orb-vol, 0) * 0.38))',
                  opacity: 'calc(0.65 + var(--orb-vol, 0) * 0.35)',
                  filter: 'blur(22px)',
                  willChange: 'transform, opacity',
                }}
              />

              {/* Layer 2: Mid-Field Fluid Resonant Gradient Halo */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: 4,
                  background: 'radial-gradient(circle, transparent 50%, rgba(133, 62, 242, 0.68) 68%, rgba(97, 131, 239, 0.5) 82%, transparent 99%)',
                  transform: 'scale(calc(1.08 + var(--orb-vol, 0) * 0.28))',
                  opacity: 'calc(0.78 + var(--orb-vol, 0) * 0.22)',
                  filter: 'blur(16px)',
                  willChange: 'transform, opacity',
                }}
              />

              {/* Layer 3: Rotating Liquid Conic Aurora Shimmer */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: 16,
                  background: 'conic-gradient(from 0deg, rgba(97, 131, 239, 0.48), rgba(111, 50, 233, 0.65), rgba(168, 85, 247, 0.52), rgba(56, 189, 248, 0.48), rgba(97, 131, 239, 0.48))',
                  maskImage: 'radial-gradient(circle, transparent 54%, black 70%, transparent 92%)',
                  WebkitMaskImage: 'radial-gradient(circle, transparent 54%, black 70%, transparent 92%)',
                  transform: 'scale(calc(1.04 + var(--orb-vol, 0) * 0.22))',
                  opacity: 'calc(0.8 + var(--orb-vol, 0) * 0.2)',
                  filter: 'blur(14px)',
                  animation: 'spin 16s linear infinite',
                  willChange: 'transform, opacity',
                }}
              />

              {/* Layer 4: Close-Hugging Vibrant Voice Ripple Pulse */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: 28,
                  background: 'radial-gradient(circle, transparent 52%, rgba(111, 50, 233, 0.75) 74%, rgba(97, 131, 239, 0.55) 86%, transparent 96%)',
                  transform: 'scale(calc(1.02 + var(--orb-vol, 0) * 0.16))',
                  opacity: 'calc(0.85 + var(--orb-vol, 0) * 0.15)',
                  filter: 'blur(8px)',
                  willChange: 'transform, opacity',
                }}
              />
            </div>

            {/* ================= EXACT ETHEREAL GLOWING ORB BODY ================= */}
            <div 
              className={`relative w-full h-full overflow-hidden rounded-full ${
                effectiveListening
                  ? 'animate-[fluidOrbMorph_7.5s_ease-in-out_infinite]'
                  : ''
              } ${
                accessory === 'headphones' && !effectiveListening
                  ? 'animate-[headphoneGroove_2.2s_ease-in-out_infinite]'
                  : accessory === 'controller' && !effectiveListening
                  ? 'animate-[gamerWiggle_1.8s_ease-in-out_infinite]'
                  : ''
              }`}
              style={{
                position: 'relative',
                zIndex: 20, // Orb body is in FRONT of all background gradients (zIndex: 4)
                transform: isHovered && !effectiveListening
                  ? 'scale(1.03)' 
                  : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform',
              }}
            >
              {/* IDLE MODE BASE SKIN (Instant GPU Crossfade) */}
              <div 
                className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-200"
                style={{
                  opacity: effectiveListening ? 0 : 1,
                  background: `radial-gradient(circle at 50% 18%, #FFFFFF 0%, #FDF2F8 12%, #E879F9 35%, #A855F7 58%, #818CF8 80%, #60A5FA 98%)`,
                  boxShadow: `
                    0 0 45px rgba(192, 132, 252, 0.55),
                    0 0 85px rgba(244, 114, 182, 0.35),
                    inset 0 0 25px rgba(255, 255, 255, 0.85),
                    inset 0 -18px 30px rgba(96, 165, 250, 0.5),
                    inset 0 15px 25px rgba(255, 255, 255, 0.7)
                  `,
                  border: '2px solid rgba(255, 255, 255, 0.75)',
                  willChange: 'opacity',
                }}
              />

              {/* LISTENING MODE BASE SKIN (Exact Reference Deep Violet with GPU Crossfade) */}
              <div 
                className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-200"
                style={{
                  opacity: effectiveListening ? 1 : 0,
                  background: `radial-gradient(circle at 45% 38%, #853EF2 0%, #6F32E9 36%, #6128E7 62%, #5123E8 84%, #3B0764 100%)`,
                  boxShadow: `
                    0 0 38px rgba(111, 50, 233, 0.88),
                    0 0 78px rgba(97, 131, 239, 0.55),
                    0 0 115px rgba(133, 62, 242, 0.35),
                    inset 0 0 28px rgba(97, 131, 239, 0.65),
                    inset 14px 12px 32px rgba(133, 62, 242, 0.65),
                    inset -12px -12px 30px rgba(81, 35, 232, 0.85)
                  `,
                  border: '2px solid rgba(133, 62, 242, 0.75)',
                  willChange: 'opacity',
                }}
              />

              {/* LISTENING MODE INTERNAL COLOR ACCENTS (Exact Reference Match) */}
              {/* Luminous Cyan Rim Glow on Left & Perimeter */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                style={{
                  background: 'radial-gradient(circle at 16% 46%, rgba(97, 131, 239, 0.92) 0%, rgba(56, 189, 248, 0.5) 30%, transparent 60%)',
                  opacity: effectiveListening ? 1 : 0,
                  mixBlendMode: 'screen',
                }}
              />

              {/* Soft Specular Violet/Lavender Sheen on Top */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                style={{
                  background: 'radial-gradient(ellipse at 44% 18%, rgba(216, 180, 254, 0.6) 0%, rgba(168, 85, 247, 0.25) 45%, transparent 70%)',
                  opacity: effectiveListening ? 1 : 0,
                }}
              />

              {/* Deep Ultraviolet Core Depth */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                style={{
                  background: 'radial-gradient(circle at 80% 70%, rgba(81, 35, 232, 0.65) 0%, transparent 55%)',
                  opacity: effectiveListening ? 1 : 0,
                }}
              />

              {/* IDLE MODE LAYERS */}
              {/* Layer 1: Soft Cyan/Blue Glow on bottom-left */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none transition-all duration-200"
                style={{
                  background: 'radial-gradient(circle at 22% 78%, rgba(96, 165, 250, 0.85) 0%, transparent 52%)',
                  transform: `translate(${cyanShiftX}px, ${cyanShiftY}px)`,
                  opacity: effectiveListening ? 0 : 1,
                }}
              />

              {/* Layer 2: Soft Peach-Pink Glow on right */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none transition-all duration-200"
                style={{
                  background: 'radial-gradient(circle at 84% 60%, rgba(244, 114, 182, 0.85) 0%, transparent 50%)',
                  transform: `translate(${pinkShiftX}px, ${pinkShiftY}px)`,
                  opacity: effectiveListening ? 0 : 1,
                }}
              />

              {/* Layer 3: Top Diffuse Specular Arc Highlight */}
              <div 
                className="absolute top-2 left-6 right-6 h-14 bg-gradient-to-b from-white/90 via-white/30 to-transparent rounded-full blur-[1px] transform -rotate-12 pointer-events-none transition-opacity duration-200"
                style={{
                  transform: `rotate(-12deg) translate(${-mouseOffset.x * 4}px, ${-mouseOffset.y * 3}px)`,
                  opacity: effectiveListening ? 0 : 1,
                }}
              />

              {/* Layer 4: Frosted Glass Translucency Overlay */}
              <div className="absolute inset-0 rounded-full backdrop-blur-[2px] pointer-events-none" />

              {/* Cute Cheek Blush (only when not listening) */}
              <div 
                className={`absolute bottom-9 inset-x-6 flex justify-between px-3 transition-opacity duration-200 pointer-events-none ${
                  !effectiveListening && (showBlush || isPasswordMode || accessory === 'headphones') ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="w-5 h-3 rounded-full bg-pink-300/80 blur-[2px]" />
                <div className="w-5 h-3 rounded-full bg-pink-300/80 blur-[2px]" />
              </div>

              {/* ================= EXO'S GLOWING EYES (Crossfading Containers) ================= */}
              {/* 1. Listening Arch Eyes */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-200 ease-out"
                style={{
                  transform: `translate(${effectiveGaze.x * 6}px, ${effectiveGaze.y * 5 - 2}px) ${
                    effectiveListening ? 'scale(1)' : 'scale(0.85)'
                  }`,
                  opacity: effectiveListening ? 1 : 0,
                  willChange: 'opacity, transform',
                }}
              >
                {/* Outer Breathing Animation Container */}
                <div className="animate-[listeningEyeBreathe_3.2s_ease-in-out_infinite]">
                  {/* Inner Voice-Reactive Volume Scaling Container (Zero transition conflict) */}
                  <div 
                    className="flex items-center gap-5 sm:gap-6 transform -translate-y-1"
                    style={{
                      transform: 'translateY(-2px) scale(calc(1 + var(--orb-vol, 0) * 0.1))',
                      willChange: 'transform',
                    }}
                  >
                    {/* Left Eye */}
                    <div 
                      style={{
                        filter: `
                          drop-shadow(0 0 6px #FFFFFF)
                          drop-shadow(0 0 16px rgba(216, 180, 254, 0.95))
                          drop-shadow(0 0 32px rgba(111, 50, 233, 0.85))
                        `,
                      }}
                    >
                      <svg 
                        width="34" 
                        height="34" 
                        viewBox="0 0 34 34" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M 6.5 25 C 6 14, 11 4, 17 4 C 23 4, 28 14, 27.5 25 C 27.5 27.2, 25 28.2, 23 26.2 C 20 22.5, 14 22.5, 11 26.2 C 9 28.2, 6.5 27.2, 6.5 25 Z" 
                          fill="#FFFFFF" 
                        />
                      </svg>
                    </div>

                    {/* Right Eye */}
                    <div 
                      style={{
                        filter: `
                          drop-shadow(0 0 6px #FFFFFF)
                          drop-shadow(0 0 16px rgba(216, 180, 254, 0.95))
                          drop-shadow(0 0 32px rgba(111, 50, 233, 0.85))
                        `,
                      }}
                    >
                      <svg 
                        width="34" 
                        height="34" 
                        viewBox="0 0 34 34" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M 6.5 25 C 6 14, 11 4, 17 4 C 23 4, 28 14, 27.5 25 C 27.5 27.2, 25 28.2, 23 26.2 C 20 22.5, 14 22.5, 11 26.2 C 9 28.2, 6.5 27.2, 6.5 25 Z" 
                          fill="#FFFFFF" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Normal Idle Eyes (Chevrons / Winking / Blinking) */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-200 ease-out"
                style={{
                  transform: `translate(${finalEyeX}px, ${finalEyeY}px) scaleX(${finalScaleX}) ${
                    effectiveListening ? 'scale(0.85)' : 'scale(1)'
                  }`,
                  opacity: effectiveListening ? 0 : finalOpacity,
                  transition: revolving ? 'none' : 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease-out',
                  willChange: 'opacity, transform',
                }}
              >
                <div className="flex items-center gap-5 sm:gap-6 transform -translate-y-1">
                  {/* Left Eye: Exact Thick Upward Chevron with Magical Purple Neon Bloom */}
                  <div 
                    className={`transition-all duration-200 ${
                      isBlinking || (isPasswordMode && showPassword) 
                        ? 'scale-y-[0.08]' 
                        : ''
                    }`}
                    style={{
                      filter: `
                        drop-shadow(0 0 6px #FFFFFF)
                        drop-shadow(0 0 14px rgba(255, 255, 255, 0.9))
                        drop-shadow(0 0 24px rgba(216, 180, 254, 0.95))
                        drop-shadow(0 0 38px rgba(168, 85, 247, 0.85))
                        drop-shadow(0 0 50px rgba(236, 72, 153, 0.6))
                      `,
                    }}
                  >
                    <svg 
                      width="32" 
                      height="26" 
                      viewBox="0 0 32 26" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M5.5 21L16 6L26.5 21" 
                        stroke="#FFFFFF" 
                        strokeWidth="6.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>

                  {/* Right Eye: Upward Chevron or Wink Curve */}
                  <div 
                    className={`transition-all duration-200 ${
                      isBlinking || isWinking || (isPasswordMode && isPeeking) || (isPasswordMode && showPassword) 
                        ? 'scale-y-[0.12] translate-y-1' 
                        : ''
                    }`}
                    style={{
                      opacity: isInspectingEmail ? 0 : 1,
                      filter: `
                        drop-shadow(0 0 6px #FFFFFF)
                        drop-shadow(0 0 14px rgba(255, 255, 255, 0.9))
                        drop-shadow(0 0 24px rgba(216, 180, 254, 0.95))
                        drop-shadow(0 0 38px rgba(168, 85, 247, 0.85))
                        drop-shadow(0 0 50px rgba(236, 72, 153, 0.6))
                      `,
                    }}
                  >
                    {isWinking ? (
                      <svg 
                        width="32" 
                        height="26" 
                        viewBox="0 0 32 26" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M5 10C9 18 23 18 27 10" 
                          stroke="#FFFFFF" 
                          strokeWidth="6.5" 
                          strokeLinecap="round" 
                        />
                      </svg>
                    ) : (
                      <svg 
                        width="32" 
                        height="26" 
                        viewBox="0 0 32 26" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M5.5 21L16 6L26.5 21" 
                          stroke="#FFFFFF" 
                          strokeWidth="6.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Inner Glass Rim Highlight */}
              <div 
                className="absolute inset-0 rounded-full border border-white/50 pointer-events-none transition-opacity duration-200" 
                style={{ opacity: effectiveListening ? 0.3 : 1 }}
              />
            </div>

          {/* ================= EXACT METALLIC MAGNIFYING GLASS OVERLAY ================= */}
          <div 
            className={`absolute z-30 pointer-events-none transition-all duration-500 ease-out flex items-center justify-center ${
              isInspectingEmail 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-40 pointer-events-none'
            }`}
            style={{
              // Positioned cleanly over the right eye area without 3D warping, matching reference image
              transform: isInspectingEmail 
                ? 'translate(36px, -2px) scale(1)' 
                : 'translate(65px, 35px) scale(0.3)',
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div className="relative">
              
              {/* Metallic Handle & Joint Connector (Diagonal down-right at ~45 degrees) */}
              <div 
                className="absolute z-10 origin-top pointer-events-none"
                style={{
                  top: size === 'sm' ? '60px' : size === 'lg' ? '86px' : '76px',
                  left: size === 'sm' ? '60px' : size === 'lg' ? '86px' : '76px',
                  transform: 'rotate(-45deg)',
                }}
              >
                {/* Silver Metal Ferrule / Collar Connector */}
                <div 
                  className="w-4.5 h-3 mx-auto rounded-[2px] shadow-sm"
                  style={{
                    background: 'linear-gradient(to right, #475569 0%, #94A3B8 25%, #FFFFFF 50%, #CBD5E1 75%, #334155 100%)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                  }}
                />
                
                {/* Joint ring spacer */}
                <div 
                  className="w-3.5 h-1 mx-auto my-[1px] rounded-xs"
                  style={{
                    background: 'linear-gradient(to right, #1E293B, #94A3B8, #0F172A)',
                  }}
                />

                {/* Sleek Chrome Cylindrical Handle */}
                <div 
                  className={`mx-auto rounded-full shadow-2xl relative overflow-hidden ${
                    size === 'sm' ? 'w-3.5 h-20' : size === 'lg' ? 'w-5 h-28' : 'w-4 h-24'
                  }`}
                  style={{
                    background: 'linear-gradient(to right, #334155 0%, #64748B 15%, #E2E8F0 42%, #FFFFFF 55%, #94A3B8 78%, #1E293B 100%)',
                    boxShadow: '4px 8px 18px rgba(0, 0, 0, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.9)',
                  }}
                >
                  {/* Chrome Light Reflection Stripe along handle */}
                  <div className="absolute top-0 bottom-0 left-1 w-0.5 bg-white/75 blur-[0.4px]" />
                  {/* Subtle handle ridge grip accent */}
                  <div className="absolute top-4 inset-x-0 h-0.5 bg-black/20" />
                  <div className="absolute top-6 inset-x-0 h-0.5 bg-black/20" />
                  {/* Metallic End Cap */}
                  <div 
                    className="absolute bottom-0 inset-x-0 h-4 rounded-full"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, #1E293B)',
                    }}
                  />
                </div>
              </div>

              {/* Circular Chrome Frame / Bezel */}
              <div 
                className={`relative rounded-full p-[4.5px] sm:p-[5.5px] ${
                  size === 'sm' ? 'w-22 h-22' : size === 'lg' ? 'w-30 h-30' : 'w-26 h-26 sm:w-28 sm:h-28'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 20%, #94A3B8 48%, #FFFFFF 65%, #64748B 85%, #334155 100%)',
                  boxShadow: `
                    0 16px 36px rgba(0,0,0,0.35),
                    0 4px 12px rgba(124, 92, 255, 0.2),
                    inset 0 1px 2px rgba(255,255,255,0.95),
                    inset 0 -1px 2px rgba(0,0,0,0.4)
                  `,
                }}
              >
                {/* Inner Dark Groove & Secondary Silver Bezel */}
                <div 
                  className="w-full h-full rounded-full p-[2.5px] relative"
                  style={{
                    background: 'linear-gradient(135deg, #334155 0%, #0F172A 35%, #475569 70%, #94A3B8 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -1px 2px rgba(255,255,255,0.6)',
                  }}
                >
                  
                  {/* Glass Lens (Convex Magnification & Frosted Violet Optics) */}
                  <div 
                    className="w-full h-full rounded-full relative overflow-hidden flex items-center justify-center"
                    style={{
                      background: `
                        radial-gradient(circle at 45% 38%, rgba(255, 255, 255, 0.4) 0%, rgba(244, 114, 182, 0.35) 25%, rgba(168, 85, 247, 0.5) 60%, rgba(126, 34, 206, 0.75) 100%)
                      `,
                      boxShadow: 'inset 0 0 20px rgba(147, 51, 234, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {/* Top Specular Arc Highlight (matches glass curvature) */}
                    <div 
                      className="absolute top-1.5 left-2 right-4 h-9 rounded-[100%] border-t-[2.5px] border-l-[1.5px] border-white/85 pointer-events-none transform -rotate-12 blur-[0.4px]"
                    />

                    {/* Secondary lens edge rim reflection */}
                    <div className="absolute inset-0 rounded-full border border-white/40 pointer-events-none" />

                    {/* ============= MAGNIFIED EYE (CENTERED INSIDE LENS) ============= */}
                    <div 
                      className="relative transform scale-[1.5] flex items-center justify-center transition-transform duration-200"
                      style={{
                        filter: `
                          drop-shadow(0 0 6px #FFFFFF)
                          drop-shadow(0 0 14px rgba(255, 255, 255, 1))
                          drop-shadow(0 0 26px rgba(216, 180, 254, 1))
                          drop-shadow(0 0 42px rgba(168, 85, 247, 0.95))
                          drop-shadow(0 0 60px rgba(236, 72, 153, 0.8))
                        `,
                      }}
                    >
                      <svg 
                        width="32" 
                        height="26" 
                        viewBox="0 0 32 26" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M5.5 21L16 6L26.5 21" 
                          stroke="#FFFFFF" 
                          strokeWidth="6.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* ================= EXACT HEADPHONES OVERLAY (LISTENING ANIMATION) ================= */}
          <div 
            className={`absolute inset-0 pointer-events-none transition-all duration-500 ease-out z-30 flex items-center justify-center ${sizeClasses} ${
              accessory === 'headphones' ? 'animate-[headphoneGroove_2.2s_ease-in-out_infinite]' : ''
            }`}
            style={{
              opacity: accessory === 'headphones' ? 1 : 0,
              transform: accessory === 'headphones' ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(-10px)',
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* Floating Animated Musical Notes & Soundwaves */}
              {accessory === 'headphones' && (
                <>
                  {/* Note 1 (Left): ♪ */}
                  <span
                    className="absolute -left-4 sm:-left-6 top-1 text-pink-300 font-extrabold text-sm drop-shadow-[0_0_8px_rgba(244,114,182,0.85)] pointer-events-none"
                    style={{
                      animation: 'musicNoteFloat 2.2s ease-out infinite',
                      '--drift-x': '-12px',
                      '--drift-rot': '-18deg',
                    } as React.CSSProperties}
                  >
                    ♪
                  </span>

                  {/* Note 2 (Right high): ♫ */}
                  <span
                    className="absolute -right-4 sm:-right-6 top-0 text-cyan-300 font-extrabold text-xs drop-shadow-[0_0_8px_rgba(103,232,249,0.85)] pointer-events-none"
                    style={{
                      animation: 'musicNoteFloat 2.6s ease-out infinite 0.7s',
                      '--drift-x': '14px',
                      '--drift-rot': '20deg',
                    } as React.CSSProperties}
                  >
                    ♫
                  </span>

                  {/* Note 3 (Right mid): ♩ */}
                  <span
                    className="absolute -right-6 sm:-right-8 top-10 text-amber-300 font-extrabold text-sm drop-shadow-[0_0_8px_rgba(252,211,77,0.85)] pointer-events-none"
                    style={{
                      animation: 'musicNoteFloat 2.1s ease-out infinite 1.3s',
                      '--drift-x': '16px',
                      '--drift-rot': '-15deg',
                    } as React.CSSProperties}
                  >
                    ♩
                  </span>

                  {/* Soundwave Pulse Rings around earcups */}
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-16 rounded-full border border-cyan-400/50 animate-ping opacity-35 pointer-events-none" style={{ animationDuration: '2s' }} />
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-16 rounded-full border border-pink-400/50 animate-ping opacity-35 pointer-events-none" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
                </>
              )}

              {/* Premium Ergonomic Headphones Frame (Mathematically Concentric Arc R=68) */}
              <svg 
                viewBox="0 0 128 128"
                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              >
                <defs>
                  {/* Metal band gradient */}
                  <linearGradient id="exoHeadbandMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="25%" stopColor="#94A3B8" />
                    <stop offset="50%" stopColor="#FFFFFF" />
                    <stop offset="75%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>

                  {/* Neon top rim highlight */}
                  <linearGradient id="exoHeadbandNeon" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="50%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#F472B6" />
                  </linearGradient>

                  {/* Left Cup Gradient */}
                  <linearGradient id="exoCupLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="50%" stopColor="#0F172A" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>

                  {/* Right Cup Gradient */}
                  <linearGradient id="exoCupRight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="50%" stopColor="#0F172A" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>

                  {/* Cyan Glow Filter */}
                  <filter id="exoCyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22D3EE" floodOpacity="0.9" />
                  </filter>

                  {/* Pink Glow Filter */}
                  <filter id="exoPinkGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F472B6" floodOpacity="0.9" />
                  </filter>
                </defs>

                {/* 1. Outer Base Headband Arch (Mathematically Concentric Circle Arc R=68 over sphere crown) */}
                <path 
                  d="M -2,47.6 A 68,68 0 0,1 130,47.6" 
                  fill="none" 
                  stroke="#090D16" 
                  strokeWidth="8.5" 
                  strokeLinecap="round" 
                  style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.55))' }}
                />

                {/* 2. Metallic Outer Finish Rail */}
                <path 
                  d="M -2,47.6 A 68,68 0 0,1 130,47.6" 
                  fill="none" 
                  stroke="url(#exoHeadbandMetal)" 
                  strokeWidth="5" 
                  strokeLinecap="round" 
                />

                {/* 3. Glowing Neon Accent Line */}
                <path 
                  d="M 8,36 A 68,68 0 0,1 120,36" 
                  fill="none" 
                  stroke="url(#exoHeadbandNeon)" 
                  strokeWidth="2.4" 
                  strokeLinecap="round" 
                  opacity="0.9"
                />

                {/* 4. Top Padded Headband Cushion (Concentric arch resting on top crown) */}
                <path 
                  d="M 32,4 A 68,68 0 0,1 96,4" 
                  fill="none" 
                  stroke="#0F172A" 
                  strokeWidth="12" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 34,4 A 68,68 0 0,1 94,4" 
                  fill="none" 
                  stroke="#334155" 
                  strokeWidth="7" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 44,-1 A 68,68 0 0,1 84,-1" 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.45)" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                />

                {/* 5. Left Swivel Joint Bracket */}
                <rect 
                  x="-6" 
                  y="43" 
                  width="8" 
                  height="9" 
                  rx="2.5" 
                  fill="url(#exoHeadbandMetal)" 
                  stroke="rgba(255,255,255,0.4)" 
                  strokeWidth="0.8" 
                />

                {/* 6. Right Swivel Joint Bracket */}
                <rect 
                  x="126" 
                  y="43" 
                  width="8" 
                  height="9" 
                  rx="2.5" 
                  fill="url(#exoHeadbandMetal)" 
                  stroke="rgba(255,255,255,0.4)" 
                  strokeWidth="0.8" 
                />

                {/* 7. Left Earcup: Clamped snugly on left side */}
                <g transform="rotate(2, -4, 64)">
                  {/* Leather Cushion Base */}
                  <ellipse cx="-4" cy="64" rx="9" ry="22" fill="#090D16" stroke="#1E293B" strokeWidth="2" />
                  {/* Outer Metallic Shell */}
                  <ellipse cx="-5" cy="64" rx="7" ry="19" fill="url(#exoCupLeft)" stroke="#334155" strokeWidth="1" />
                  {/* Glowing Cyan LED Ring */}
                  <ellipse cx="-5" cy="64" rx="4" ry="13" fill="none" stroke="#22D3EE" strokeWidth="2.5" filter="url(#exoCyanGlow)" />
                  {/* Core Bright Light */}
                  <ellipse cx="-5" cy="64" rx="1.8" ry="7" fill="#38BDF8" opacity="0.95" />
                </g>

                {/* 8. Right Earcup: Clamped snugly on right side */}
                <g transform="rotate(-2, 132, 64)">
                  {/* Leather Cushion Base */}
                  <ellipse cx="132" cy="64" rx="9" ry="22" fill="#090D16" stroke="#1E293B" strokeWidth="2" />
                  {/* Outer Metallic Shell */}
                  <ellipse cx="133" cy="64" rx="7" ry="19" fill="url(#exoCupRight)" stroke="#334155" strokeWidth="1" />
                  {/* Glowing Pink LED Ring */}
                  <ellipse cx="133" cy="64" rx="4" ry="13" fill="none" stroke="#F472B6" strokeWidth="2.5" filter="url(#exoPinkGlow)" />
                  {/* Core Bright Light */}
                  <ellipse cx="133" cy="64" rx="1.8" ry="7" fill="#EC4899" opacity="0.95" />
                </g>
              </svg>

            </div>
          </div>

          {/* ================= EXACT GAME CONTROLLER OVERLAY (PLAYING ANIMATION) ================= */}
          <div 
            className={`absolute inset-0 pointer-events-none transition-all duration-500 ease-out z-30 flex items-center justify-center ${sizeClasses}`}
            style={{
              opacity: accessory === 'controller' ? 1 : 0,
              transform: accessory === 'controller' 
                ? 'scale(1) translateY(0)' 
                : 'scale(0.8) translateY(14px)',
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* Floating Game Sparkle / Pop Stars */}
              {accessory === 'controller' && (
                <>
                  <span
                    className="absolute -top-3 -left-3 text-emerald-300 text-xs font-bold pointer-events-none drop-shadow-[0_0_6px_rgba(52,211,153,0.85)]"
                    style={{ animation: 'gameSparklePop 1.8s ease-out infinite' }}
                  >
                    ✦
                  </span>
                  <span
                    className="absolute -top-5 right-1 text-cyan-300 text-sm font-bold pointer-events-none drop-shadow-[0_0_6px_rgba(103,232,249,0.85)]"
                    style={{ animation: 'gameSparklePop 2.2s ease-out infinite 0.7s' }}
                  >
                    ★
                  </span>
                  <span
                    className="absolute -top-2 -right-3 text-amber-300 text-[10px] font-bold pointer-events-none drop-shadow-[0_0_6px_rgba(252,211,77,0.85)]"
                    style={{ animation: 'gameSparklePop 1.5s ease-out infinite 1.2s' }}
                  >
                    ✦
                  </span>
                </>
              )}

              {/* Sleek Mini Gamepad Body held in front */}
              <div 
                className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-11 sm:h-12 rounded-2xl p-1 flex items-center justify-between shadow-[0_12px_28px_rgba(0,0,0,0.65),0_0_18px_rgba(16,185,129,0.3)] border border-emerald-400/50"
                style={{
                  background: 'linear-gradient(135deg, #1A1333 0%, #0F172A 60%, #061917 100%)',
                }}
              >
                {/* Top Edge Glowing RGB Lightbar */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]" />

                {/* Left Grip: Directional Pad (D-Pad) with Tapping Left Thumb */}
                <div className="relative pl-1 flex flex-col items-center justify-center">
                  {/* D-Pad cross */}
                  <div className="relative w-5 h-5">
                    {/* Vertical bar */}
                    <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-1.5 bg-slate-700/95 rounded-xs border border-white/20 shadow-xs" />
                    {/* Horizontal bar */}
                    <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1.5 bg-slate-700/95 rounded-xs border border-white/20 shadow-xs" />
                    {/* Center core */}
                    <div className="absolute inset-1 rounded-full bg-slate-900 border border-emerald-400/40" />
                  </div>

                  {/* Animated Left Thumb Tapping the D-Pad */}
                  <div 
                    className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-purple-400 to-pink-300 border border-white/70 shadow-[0_2px_4px_rgba(0,0,0,0.4)] pointer-events-none"
                    style={{ animation: 'thumbTapLeft 0.65s ease-in-out infinite' }}
                  />
                </div>

                {/* Center: Mini Status / Logo Screen */}
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="w-2 h-2 rounded-full bg-black/60 border border-emerald-400/50 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-0.5 rounded-full bg-slate-600" />
                    <div className="w-1 h-0.5 rounded-full bg-slate-600" />
                  </div>
                </div>

                {/* Right Grip: 4 Action Buttons with Tapping Right Thumb */}
                <div className="relative pr-1 flex items-center justify-center">
                  {/* 4 Diamond Action Buttons (X, Y, A, B) */}
                  <div className="relative w-5.5 h-5.5">
                    {/* Top Button (Y - Yellow) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 border border-white/60 shadow-[0_0_4px_rgba(251,191,36,0.85)]" />
                    {/* Left Button (X - Blue) */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-1.5 rounded-full bg-cyan-400 border border-white/60 shadow-[0_0_4px_rgba(34,211,238,0.85)]" />
                    {/* Right Button (B - Red) */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1.5 h-1.5 rounded-full bg-rose-400 border border-white/60 shadow-[0_0_4px_rgba(244,63,94,0.85)]" />
                    {/* Bottom Button (A - Green) */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-white/60 shadow-[0_0_4px_rgba(52,211,153,0.85)]" />
                  </div>

                  {/* Animated Right Thumb Tapping the buttons */}
                  <div 
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-purple-400 to-pink-300 border border-white/70 shadow-[0_2px_4px_rgba(0,0,0,0.4)] pointer-events-none"
                    style={{ animation: 'thumbTapRight 0.48s ease-in-out infinite' }}
                  />
                </div>

                {/* Glossy top edge highlight */}
                <div className="absolute inset-x-2 top-0.5 h-1 rounded-t-xl bg-white/20 pointer-events-none blur-[0.2px]" />
              </div>

            </div>
          </div>
        </div>
      </div>

        {/* Concentric Stage Pedestal & Floor Reflection */}
        {showPedestal && (
          <div className="relative -mt-6 sm:-mt-8 flex flex-col items-center pointer-events-none w-full max-w-lg">
            <div className="w-56 sm:w-64 md:w-72 h-12 rounded-[100%] bg-gradient-to-t from-purple-300/35 via-pink-200/40 to-transparent blur-md transform scale-y-50" />
            <div className="absolute top-2 w-72 sm:w-80 md:w-96 h-16 rounded-[100%] border border-purple-200/60 bg-gradient-to-b from-white/70 via-purple-50/20 to-transparent shadow-[0_8px_32px_rgba(147,51,234,0.08)] transform scale-y-40 animate-pedestal" />
            <div className="absolute top-4 w-96 sm:w-[440px] md:w-[480px] h-20 rounded-[100%] border border-purple-100/45 bg-gradient-to-b from-white/40 via-indigo-50/15 to-transparent transform scale-y-35 opacity-70" />
          </div>
        )}

        {/* Sub-label */}
        {subLabel && (
          <div className="mt-8 sm:mt-9 text-center pointer-events-none">
            <p className="text-[13px] font-semibold text-[#6B7280] tracking-wide">
              {subLabel}
            </p>
          </div>
        )}

      </div>
    </div>
  );
});

ExoOrb.displayName = 'ExoOrb';
