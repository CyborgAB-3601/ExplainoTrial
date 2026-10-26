import React, { useEffect, useRef } from 'react';

export type VoiceFeedbackStatus = 'normal' | 'correct' | 'wrong';

interface SphericalDotsBackgroundProps {
  status: VoiceFeedbackStatus;
  isSpeaking?: boolean;
  audioVolume?: number; // 0 to 1 manual voice volume override if provided
  listenToMic?: boolean; // automatically sample real microphone voice
  onVolumeChange?: (volume: number) => void;
  onStatusReset?: () => void;
  className?: string;
}

interface SpherePoint {
  baseX: number;
  baseY: number;
  baseZ: number;
  // Natural chromatic spectrum (RGB)
  baseR: number;
  baseG: number;
  baseB: number;
  // Deviation vector when wrong
  devDirX: number;
  devDirY: number;
  devDirZ: number;
  phase: number;
  speed: number;
  length: number;
  width: number;
}

export const SphericalDotsBackground: React.FC<SphericalDotsBackgroundProps> = React.memo(({
  status = 'normal',
  isSpeaking = true,
  audioVolume,
  listenToMic = true,
  onVolumeChange,
  onStatusReset,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Status tracking refs for smooth animation transitions
  const statusRef = useRef<VoiceFeedbackStatus>(status);
  const colorModeRef = useRef<number>(0); // 0 = normal (chromatic), 1 = correct (green), 2 = wrong (red)
  const colorProgressRef = useRef(0);
  const deviationRef = useRef(0); // 0 (sphere) to 1 (chaotic deviation)
  const isSpeakingRef = useRef(isSpeaking);
  const manualVolumeRef = useRef<number | undefined>(audioVolume);
  const onVolumeChangeRef = useRef(onVolumeChange);
  const onStatusResetRef = useRef(onStatusReset);
  const lastSentVolumeRef = useRef(0);

  // Live microphone audio processing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const hasLiveMicRef = useRef<boolean>(false);
  const smoothedVolumeRef = useRef<number>(0);

  useEffect(() => {
    statusRef.current = status;
    if (status === 'wrong') {
      deviationRef.current = 1.0;
      colorModeRef.current = 2; // red
    } else if (status === 'correct') {
      colorModeRef.current = 1; // green
    } else {
      colorModeRef.current = 0; // normal
    }
  }, [status]);

  useEffect(() => {
    onStatusResetRef.current = onStatusReset;
  }, [onStatusReset]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
    if (!isSpeaking) {
      smoothedVolumeRef.current = 0;
    }
  }, [isSpeaking]);

  useEffect(() => {
    manualVolumeRef.current = audioVolume;
  }, [audioVolume]);

  useEffect(() => {
    onVolumeChangeRef.current = onVolumeChange;
  }, [onVolumeChange]);

  // Connect strictly to live microphone input via Web Audio API when listening
  useEffect(() => {
    if (!isSpeaking || !listenToMic) {
      return;
    }

    let isMounted = true;

    const initAudio = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          return;
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioCtxClass) return;

        const audioCtx = new AudioCtxClass();
        audioContextRef.current = audioCtx;

        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.2;
        source.connect(analyser);

        analyserRef.current = analyser;
        hasLiveMicRef.current = true;
      } catch {
        hasLiveMicRef.current = false;
      }
    };

    initAudio();

    return () => {
      isMounted = false;
      hasLiveMicRef.current = false;
      smoothedVolumeRef.current = 0;
      analyserRef.current = null;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isSpeaking, listenToMic]);

  // Main canvas render loop — strictly reacts to voice only, NOT text or mouse
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const newWidth = Math.round(rect.width);
      const newHeight = Math.round(rect.height);
      if (width === newWidth && height === newHeight) return;
      width = newWidth;
      height = newHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Generate points distributed across a vast spherical field
    const NUM_POINTS = 580;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle
    const points: SpherePoint[] = [];

    for (let i = 0; i < NUM_POINTS; i++) {
      const y = 1 - (i / (NUM_POINTS - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Assign chromatic spectrum based on coordinate angles:
      // Left/Bottom-left: Blue / Indigo / Purple
      // Top-left/Top: Magenta / Pink / Rose
      // Right/Bottom-right: Coral / Orange / Golden Amber
      const angle = Math.atan2(y, x); // -PI to PI
      const normAngle = (angle + Math.PI) / (Math.PI * 2); // 0 to 1

      let r = 99, g = 102, b = 241;
      if (normAngle < 0.3) {
        const t = normAngle / 0.3;
        r = Math.round(37 + t * (99 - 37));
        g = Math.round(99 + t * (102 - 99));
        b = Math.round(235 + t * (241 - 235));
      } else if (normAngle < 0.55) {
        const t = (normAngle - 0.3) / 0.25;
        r = Math.round(139 + t * (236 - 139));
        g = Math.round(92 + t * (72 - 92));
        b = Math.round(246 + t * (153 - 246));
      } else if (normAngle < 0.78) {
        const t = (normAngle - 0.55) / 0.23;
        r = Math.round(244 + t * (249 - 244));
        g = Math.round(63 + t * (115 - 63));
        b = Math.round(94 - t * (94 - 22));
      } else {
        const t = (normAngle - 0.78) / 0.22;
        r = Math.round(249 - t * (249 - 234));
        g = Math.round(115 + t * (179 - 115));
        b = Math.round(22 - t * (22 - 8));
      }

      // Random chaotic direction for deviation animation when wrong
      const devTheta = Math.random() * Math.PI * 2;
      const devPhi = (Math.random() - 0.5) * Math.PI;
      const devMag = 1.0 + Math.random() * 1.2;

      points.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        baseR: r,
        baseG: g,
        baseB: b,
        devDirX: Math.cos(devTheta) * Math.cos(devPhi) * devMag,
        devDirY: Math.sin(devPhi) * devMag,
        devDirZ: Math.sin(devTheta) * Math.cos(devPhi) * devMag,
        phase: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 2.5,
        length: 5 + Math.random() * 5,
        width: 2.2 + Math.random() * 1.2,
      });
    }

    // Rotation angles
    let angleX = 0.15;
    let angleY = 0;
    let angleZ = 0.05;
    let time = 0;
    let frameCount = 0;

    const freqDataBuffer = new Uint8Array(128);
    const timeDataBuffer = new Uint8Array(128);

    const render = () => {
      time += 0.02;
      frameCount++;

      // ── Detect strictly live voice volume (zero if silence or no voice) ──
      let rawVoiceInput = 0;

      if (hasLiveMicRef.current && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqDataBuffer);
        analyserRef.current.getByteTimeDomainData(timeDataBuffer);

        // Sample speech vocal frequency bins (approx. 85Hz to 3.8kHz)
        let vocalSum = 0;
        let vocalMax = 0;
        const maxBin = Math.min(freqDataBuffer.length, 45);
        for (let i = 1; i < maxBin; i++) {
          const val = freqDataBuffer[i];
          vocalSum += val;
          if (val > vocalMax) vocalMax = val;
        }
        const vocalAvg = vocalSum / Math.max(1, maxBin - 1);

        // Compute peak deviation and RMS time-domain volume
        let peakDev = 0;
        let sumSq = 0;
        for (let i = 0; i < timeDataBuffer.length; i++) {
          const norm = (timeDataBuffer[i] - 128) / 128;
          const absNorm = Math.abs(norm);
          if (absNorm > peakDev) peakDev = absNorm;
          sumSq += norm * norm;
        }
        const rms = Math.sqrt(sumSq / timeDataBuffer.length);

        // Sensitive voice detection (catches any mic input, silence is 0.0)
        const freqSignal = Math.max(0, (vocalAvg - 3.5) / 24);
        const peakSignal = Math.max(0, (peakDev - 0.012) / 0.12);
        const rmsSignal = Math.max(0, (rms - 0.0035) / 0.035);
        rawVoiceInput = Math.min(1, Math.max(freqSignal, peakSignal, rmsSignal) * 1.55);
      } else if (typeof manualVolumeRef.current === 'number') {
        rawVoiceInput = Math.min(1, Math.max(0, manualVolumeRef.current));
      } else {
        // Absolutely NO synthetic pulse or cadence! Strict 0 when no voice is spoken.
        rawVoiceInput = 0;
      }

      // Smooth attack and release filter for fluid organic motion
      // Graceful organic attack & decay filter for silky-smooth motion
      const attackRate = rawVoiceInput > smoothedVolumeRef.current ? 0.16 : 0.08;
      smoothedVolumeRef.current += (rawVoiceInput - smoothedVolumeRef.current) * attackRate;
      if (smoothedVolumeRef.current < 0.002) {
        smoothedVolumeRef.current = 0;
      }
      const liveVolume = Math.min(1, Math.max(0, smoothedVolumeRef.current));

      // Periodically inform parent of voice volume for syncing with threshold check (only when using internal mic)
      if (listenToMic && frameCount % 6 === 0 && onVolumeChangeRef.current) {
        if (
          Math.abs(liveVolume - lastSentVolumeRef.current) > 0.03 ||
          (liveVolume === 0 && lastSentVolumeRef.current > 0)
        ) {
          lastSentVolumeRef.current = liveVolume;
          onVolumeChangeRef.current(liveVolume);
        }
      }

      // 3D constant graceful revolving motion with subtle vocal swell
      const voiceSpeedBoost = 1 + liveVolume * 0.3;
      angleY += 0.0035 * voiceSpeedBoost;
      angleX += 0.0018 * voiceSpeedBoost;
      angleZ += 0.0010 * voiceSpeedBoost;

      // Expansive radius that spans across the background canvas
      const baseRadius = Math.max(width, height) * 0.58;
      const centerX = width / 2;
      const centerY = height / 2;

      // Smooth color mode transitions
      const targetMode = colorModeRef.current;
      colorProgressRef.current += (1 - colorProgressRef.current) * 0.08;

      // Decay deviation physics smoothly back to normal
      if (deviationRef.current > 0.005) {
        deviationRef.current *= 0.965;
      } else {
        deviationRef.current = 0;
        if (statusRef.current === 'wrong' && onStatusResetRef.current) {
          onStatusResetRef.current();
        }
      }

      // Clear canvas (clean pure white background)
      ctx.clearRect(0, 0, width, height);

      // Voice volume pulsation wave: smooth expansion strictly by voice
      const voicePulse = liveVolume * 0.16;

      // Harmonic expansion when correct
      const correctPulse = statusRef.current === 'correct' ? Math.sin(time * 3) * 0.04 : 0;

      const dynamicRadius = baseRadius * (1 + voicePulse + correctPulse);

      // Pure 3D rotation angles — NO mouse tilting, NO text reaction
      const effAngleX = angleX;
      const effAngleY = angleY;
      const effAngleZ = angleZ;

      // Rotation matrix precomputations
      const cosY = Math.cos(effAngleY), sinY = Math.sin(effAngleY);
      const cosX = Math.cos(effAngleX), sinX = Math.sin(effAngleX);
      const cosZ = Math.cos(effAngleZ), sinZ = Math.sin(effAngleZ);

      interface ProjectedItem {
        px: number;
        py: number;
        pz: number;
        scale: number;
        length: number;
        width: number;
        angle: number;
        r: number;
        g: number;
        b: number;
        alpha: number;
      }

      const projectedList: ProjectedItem[] = [];
      const focalLength = 650;
      const dev = deviationRef.current;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Graceful harmonic surface wave driven smoothly by voice (zero glitch/jitter)
        const acousticWave = Math.sin(p.baseY * 2.8 + time * 2.2 + p.phase) * (liveVolume * 0.065);

        // Deviation offset only when wrong (smooth laminar drift)
        const devDispX = p.devDirX * 1.2 * dev;
        const devDispY = p.devDirY * 1.2 * dev;
        const devDispZ = p.devDirZ * 1.2 * dev;

        // Current 3D position
        const curR = dynamicRadius * (1 + acousticWave);
        const x0 = p.baseX * curR + devDispX * baseRadius * 0.4;
        const y0 = p.baseY * curR + devDispY * baseRadius * 0.4;
        const z0 = p.baseZ * curR + devDispZ * baseRadius * 0.4;

        // Rotate Y
        const x1 = x0 * cosY - z0 * sinY;
        const z1 = x0 * sinY + z0 * cosY;

        // Rotate X
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        // Rotate Z
        const x3 = x1 * cosZ - y2 * sinZ;
        const y3 = x1 * sinZ + y2 * cosZ;
        const z3 = z2;

        // Perspective projection
        const depth = focalLength + z3;
        if (depth > 50) {
          const scale = focalLength / depth;
          const px = centerX + x3 * scale;
          const py = centerY + y3 * scale;

          // Normalized depth -1 to 1 for alpha & size
          const normZ = z3 / (baseRadius * 1.2);
          const alpha = Math.max(0.18, Math.min(0.98, 0.55 + normZ * 0.4 + liveVolume * 0.22));

          // Tangential dash/pill stretches strictly in response to voice energy
          const pWidth = Math.max(1.2, p.width * scale * (1 + liveVolume * 0.35));
          const pLength = Math.max(
            2.5,
            p.length * scale * (1 + liveVolume * 2.2 + (dev > 0 ? dev * 0.5 : 0))
          );

          // Tangential dash angle — smooth harmonic flow without random jitter
          const flowAngle =
            Math.atan2(py - centerY, px - centerX) +
            Math.PI / 2 +
            (dev > 0 ? Math.sin(p.phase + time * 2) * dev * 0.6 : 0);

          // Color interpolation
          let pr = p.baseR;
          let pg = p.baseG;
          let pb = p.baseB;

          if (targetMode === 1) {
            pr = 16;
            pg = 185;
            pb = 129;
          } else if (targetMode === 2) {
            pr = 239;
            pg = 68;
            pb = 68;
          }

          projectedList.push({
            px,
            py,
            pz: z3,
            scale,
            length: pLength,
            width: pWidth,
            angle: flowAngle,
            r: pr,
            g: pg,
            b: pb,
            alpha,
          });
        }
      }

      // Sort by depth (painter's algorithm)
      projectedList.sort((a, b) => a.pz - b.pz);

      // Fast, lag-free draw without expensive shadowBlur raster overhead
      for (let i = 0; i < projectedList.length; i++) {
        const item = projectedList[i];
        ctx.save();
        ctx.translate(item.px, item.py);
        ctx.rotate(item.angle);

        ctx.fillStyle = `rgba(${item.r}, ${item.g}, ${item.b}, ${item.alpha})`;

        // Draw smooth rounded pill / dash with safe radius
        const halfLen = Math.max(1, item.length / 2);
        const radius = Math.max(0.5, Math.min(item.width / 2, halfLen));
        ctx.beginPath();
        ctx.roundRect(-halfLen, -radius, halfLen * 2, radius * 2, radius);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []); // Mount once on load and persist smoothly without ever re-mounting when lyrics/text change

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      style={{ display: 'block' }}
    />
  );
});
