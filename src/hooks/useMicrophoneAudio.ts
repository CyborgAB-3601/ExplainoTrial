import { useState, useEffect, useRef, useCallback } from 'react';

export type MicPermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

export interface UseMicrophoneAudioResult {
  volume: number; // 0 to 1 smoothed voice level (throttled for 60fps-smooth rendering)
  rawVolume: number;
  permissionStatus: MicPermissionStatus;
  errorMessage: string | null;
  start: () => Promise<void>;
  stop: () => void;
  isAudioDetected: boolean;
}

export function useMicrophoneAudio(active: boolean = false): UseMicrophoneAudioResult {
  const [volume, setVolume] = useState<number>(0);
  const [rawVolume, setRawVolume] = useState<number>(0);
  const [permissionStatus, setPermissionStatus] = useState<MicPermissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAudioDetected, setIsAudioDetected] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const smoothedVolumeRef = useRef<number>(0);
  const lastUpdateTimestampRef = useRef<number>(0);
  const lastDispatchedVolumeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const stop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    smoothedVolumeRef.current = 0;
    lastDispatchedVolumeRef.current = 0;

    if (isMountedRef.current) {
      setVolume(0);
      setRawVolume(0);
      setIsAudioDetected(false);
    }
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionStatus('unsupported');
      setErrorMessage('Your browser does not support microphone access.');
      return;
    }

    setPermissionStatus('requesting');
    setErrorMessage(null);

    try {
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

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      mediaStreamRef.current = stream;

      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtxClass) {
        setPermissionStatus('unsupported');
        return;
      }

      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume().catch(() => {});
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75; // smooth audio hardware averaging to eliminate flutter
      source.connect(analyser);
      analyserRef.current = analyser;

      setPermissionStatus('granted');

      const resumeListener = () => {
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
      };
      window.addEventListener('click', resumeListener, { once: true });
      window.addEventListener('touchstart', resumeListener, { once: true });

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.frequencyBinCount);

      const processAudio = (timestamp: number) => {
        if (!analyserRef.current || !isMountedRef.current) return;

        analyserRef.current.getByteFrequencyData(freqData);
        analyserRef.current.getByteTimeDomainData(timeData);

        // 1. Vocal speech frequencies (approx 85Hz - 4kHz)
        let vocalSum = 0;
        let vocalMax = 0;
        const maxBin = Math.min(freqData.length, 64);
        for (let i = 1; i < maxBin; i++) {
          const val = freqData[i];
          vocalSum += val;
          if (val > vocalMax) vocalMax = val;
        }
        const vocalAvg = vocalSum / Math.max(1, maxBin - 1);

        // 2. Waveform time-domain peak & RMS
        let peakDev = 0;
        let sumSq = 0;
        for (let i = 0; i < timeData.length; i++) {
          const norm = (timeData[i] - 128) / 128;
          const absNorm = Math.abs(norm);
          if (absNorm > peakDev) peakDev = absNorm;
          sumSq += norm * norm;
        }
        const rms = Math.sqrt(sumSq / timeData.length);

        // 3. Highly sensitive, responsive vocal signal (scales 0 to 1 with voice)
        const freqSignal = Math.max(0, (vocalAvg - 1.8) / 15);
        const peakSignal = Math.max(0, (peakDev - 0.01) / 0.09);
        const rmsSignal = Math.max(0, (rms - 0.003) / 0.028);
        let rawScore = Math.min(1, Math.max(freqSignal, peakSignal, rmsSignal) * 1.7);

        // Noise gate: cleanly zero out low ambient room noise to eliminate jitter
        if (rawScore < 0.035) {
          rawScore = 0;
        }

        // 4. Smooth organic attack and graceful, natural release
        const rate = rawScore > smoothedVolumeRef.current ? 0.28 : 0.09;
        smoothedVolumeRef.current += (rawScore - smoothedVolumeRef.current) * rate;
        if (smoothedVolumeRef.current < 0.004) {
          smoothedVolumeRef.current = 0;
        }

        const currentVol = Math.round(smoothedVolumeRef.current * 100) / 100;

        // Controlled dispatch (~32ms / ~30fps) with instantaneous boundary triggers:
        // Keeps UI silky smooth and prevents React re-render lagging when voice modules are active
        const elapsed = timestamp - lastUpdateTimestampRef.current;
        const isBoundary =
          (currentVol === 0 && lastDispatchedVolumeRef.current > 0) ||
          (currentVol > 0.02 && lastDispatchedVolumeRef.current === 0);

        if (elapsed >= 32 || isBoundary) {
          if (Math.abs(currentVol - lastDispatchedVolumeRef.current) >= 0.015 || isBoundary) {
            lastDispatchedVolumeRef.current = currentVol;
            lastUpdateTimestampRef.current = timestamp;
            setVolume(currentVol);
            setRawVolume(Math.round(rawScore * 100) / 100);
            setIsAudioDetected(currentVol > 0.03);
          }
        }

        animFrameRef.current = requestAnimationFrame(processAudio);
      };

      animFrameRef.current = requestAnimationFrame(processAudio);
    } catch (err) {
      console.error('Microphone error:', err);
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      setPermissionStatus(isDenied ? 'denied' : 'unsupported');
      setErrorMessage(
        isDenied
          ? 'Microphone access was denied. Please allow microphone permissions in your browser.'
          : 'Unable to access microphone device.'
      );
      stop();
    }
  }, [stop]);

  useEffect(() => {
    isMountedRef.current = true;
    if (active) {
      start();
    } else {
      stop();
    }

    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [active, start, stop]);

  return {
    volume,
    rawVolume,
    permissionStatus,
    errorMessage,
    start,
    stop,
    isAudioDetected,
  };
}
