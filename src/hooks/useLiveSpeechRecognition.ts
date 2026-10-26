import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseLiveSpeechRecognitionResult {
  interimTranscript: string;
  finalTranscript: string;
  fullTranscript: string;
  finalLines: string[];
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useLiveSpeechRecognition(active: boolean = false): UseLiveSpeechRecognitionResult {
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalLines, setFinalLines] = useState<string[]>([]);
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const interimRef = useRef<string>('');
  const finalTranscriptRef = useRef<string>('');
  const activeRef = useRef<boolean>(active);
  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExplicitlyStoppedRef = useRef<boolean>(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const reset = useCallback(() => {
    interimRef.current = '';
    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    setFinalLines([]);
  }, []);

  const stop = useCallback(() => {
    isExplicitlyStoppedRef.current = true;
    setIsListening(false);

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    // Flush any pending interim transcript into finalLines so words are not dropped
    if (interimRef.current.trim()) {
      const textToFlush = interimRef.current.trim();
      interimRef.current = '';
      setInterimTranscript('');
      setFinalLines((prev) => {
        const next = [...prev, textToFlush];
        finalTranscriptRef.current = next.join(' ');
        setFinalTranscript(finalTranscriptRef.current);
        return next;
      });
    }
  }, []);

  const start = useCallback(() => {
    isExplicitlyStoppedRef.current = false;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Clean up previous instance cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        const newFinals: string[] = [];

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            const trimmed = text.trim();
            if (trimmed) {
              newFinals.push(trimmed);
            }
          } else {
            currentInterim += text;
          }
        }

        if (newFinals.length > 0) {
          interimRef.current = currentInterim.trim();
          setInterimTranscript(interimRef.current);
          setFinalLines((prev) => {
            const next = [...prev, ...newFinals];
            finalTranscriptRef.current = next.join(' ');
            setFinalTranscript(finalTranscriptRef.current);
            return next;
          });
        } else {
          interimRef.current = currentInterim;
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (e: any) => {
        // 'no-speech' is completely normal when the user pauses
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition warning:', e.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;

        // Auto-restart if we should still be active and were not explicitly stopped
        if (activeRef.current && !isExplicitlyStoppedRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (activeRef.current && !isExplicitlyStoppedRef.current) {
              start();
            }
          }, 120);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      console.warn('Web Speech recognition start failed:', err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (active) {
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [active, start, stop]);

  const fullTranscript = [finalTranscript, interimTranscript].filter(Boolean).join(' ').trim();

  return {
    interimTranscript,
    finalTranscript,
    fullTranscript,
    finalLines,
    isListening,
    isSupported,
    start,
    stop,
    reset,
  };
}
