import React, { useEffect, useRef } from 'react';
import { VoiceFeedbackStatus } from './SphericalDotsBackground';

interface WaveformCirclesProps {
  voiceLevel: number; // 0 to 1
  feedbackStatus?: VoiceFeedbackStatus;
  className?: string;
  onClick?: () => void;
}

export const WaveformCircles: React.FC<WaveformCirclesProps> = ({
  voiceLevel = 0,
  feedbackStatus = 'normal',
  className = '',
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const voiceLevelRef = useRef(voiceLevel);
  const statusRef = useRef(feedbackStatus);

  useEffect(() => {
    voiceLevelRef.current = voiceLevel;
  }, [voiceLevel]);

  useEffect(() => {
    statusRef.current = feedbackStatus;
  }, [feedbackStatus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let smoothedVoice = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = 240;
    const height = 90;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 7 harmonic smaller circles
    const NUM_CIRCLES = 7;
    const CIRCLE_RADIUS = 6.5; // 13px diameter
    const SPACING = 26; // horizontal spacing between centers
    const weights = [0.45, 0.75, 1.05, 1.3, 1.05, 0.75, 0.45];

    // Signature Chromatic Colors (Antigravity spectrum)
    const normalColors = [
      '#38BDF8', // Cyan/Sky
      '#6366F1', // Indigo
      '#8B5CF6', // Purple
      '#A855F7', // Violet
      '#EC4899', // Pink
      '#F43F5E', // Rose
      '#F97316', // Coral Amber
    ];

    const render = () => {
      // Smooth attack/release filter
      const targetVol = voiceLevelRef.current;
      const rate = targetVol > smoothedVoice ? 0.35 : 0.15;
      smoothedVoice += (targetVol - smoothedVoice) * rate;
      if (smoothedVoice < 0.005) smoothedVoice = 0;

      // Only advance phase time when voice is present
      if (smoothedVoice > 0.01) {
        time += 0.12;
      }

      ctx.clearRect(0, 0, width, height);

      const status = statusRef.current;
      const centerY = height / 2;
      const totalWidth = (NUM_CIRCLES - 1) * SPACING;
      const startX = (width - totalWidth) / 2;

      for (let i = 0; i < NUM_CIRCLES; i++) {
        const x = startX + i * SPACING;
        const w = weights[i];

        let color = normalColors[i];
        if (status === 'correct') color = '#10B981';
        if (status === 'wrong') color = '#EF4444';

        // When NO voice: blank baseline circles (0 displacement, 0 vertical stretch)
        // When voice is detected: bounce UP & DOWN and elongate into fluid sound capsules
        let yOffset = 0;
        let halfHeight = CIRCLE_RADIUS;
        let opacity = 0.55;

        if (smoothedVoice > 0.02) {
          // Harmonic wave displacement: up and down
          const bounce = Math.sin(time * 6 + i * 0.95) * (smoothedVoice * 22 * w);
          // Vertical capsule height expansion
          const stretch = Math.abs(Math.cos(time * 5 + i * 0.8)) * (smoothedVoice * 28 * w);

          yOffset = bounce;
          halfHeight = CIRCLE_RADIUS + stretch;
          opacity = Math.min(1, 0.65 + smoothedVoice * 0.35);
        }

        const topY = centerY + yOffset - halfHeight;
        const capsuleH = halfHeight * 2;
        const radius = CIRCLE_RADIUS;

        ctx.save();

        // Glow when voice is audible or on feedback
        if (smoothedVoice > 0.05 || status !== 'normal') {
          ctx.shadowColor = color;
          ctx.shadowBlur = (status !== 'normal' ? 14 : 6 + smoothedVoice * 14);
        }

        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;

        // Draw smooth capsule or resting circle
        ctx.beginPath();
        ctx.roundRect(x - radius, topY, radius * 2, capsuleH, radius);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none ${className}`}
      title={voiceLevel > 0.05 ? 'Hearing your voice' : 'Waiting for your voice...'}
    >
      {/* Background Soft Glow Halo behind smaller circles */}
      <div
        className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-200"
        style={{
          background:
            feedbackStatus === 'correct'
              ? 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)'
              : feedbackStatus === 'wrong'
              ? 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)'
              : voiceLevel > 0.05
              ? `radial-gradient(circle, rgba(168,85,247,${0.25 + voiceLevel * 0.4}) 0%, rgba(236,72,153,${0.15 + voiceLevel * 0.25}) 40%, transparent 70%)`
              : 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 60%)',
          transform: `scale(${1 + voiceLevel * 0.25})`,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{ width: 240, height: 90 }}
        className="relative z-10"
      />

      {/* Voice Activity Status indicator text */}
      <div className="text-center mt-1">
        <span
          className="text-xs font-semibold tracking-wide transition-all duration-200"
          style={{
            color:
              feedbackStatus === 'correct'
                ? '#059669'
                : feedbackStatus === 'wrong'
                ? '#DC2626'
                : voiceLevel > 0.05
                ? '#7C3AED'
                : '#9CA3AF',
          }}
        >
          {feedbackStatus === 'correct'
            ? '✓ Correct answer!'
            : feedbackStatus === 'wrong'
            ? '✗ Deviation detected'
            : voiceLevel > 0.05
            ? 'Hearing you speak... 🎙️'
            : 'Speak now (silence = blank)'}
        </span>
      </div>
    </div>
  );
};
