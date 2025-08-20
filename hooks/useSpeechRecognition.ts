
import { useState, useRef, useEffect, useCallback } from 'react';

// --- START: Type definitions for Web Speech API ---
// These types are not included in the default TS DOM library.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}
// --- END: Type definitions for Web Speech API ---


interface SpeechRecognitionOptions {
  lang?: string;
}

interface SpeechRecognitionHook {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  finalTranscript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  clearTranscript: () => void;
}

const getSpeechRecognition = (): SpeechRecognitionStatic | null => {
  if (typeof window !== 'undefined') {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }
  return null;
};

const SpeechRecognitionAPI = getSpeechRecognition();

export const useSpeechRecognition = (
  options: SpeechRecognitionOptions = {}
): SpeechRecognitionHook => {
  const { lang = 'en-US' } = options;
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setFinalTranscript('');
        setInterimTranscript('');
        setError(null);
        recognitionRef.current.start();
      } catch (err) {
         if (err instanceof DOMException && err.name === 'InvalidStateError') {
            // Already started, ignore. This can happen with fast clicks.
         } else {
            console.error(err);
            setError('No se pudo iniciar el reconocimiento de voz.');
         }
      }
    }
  }, [isListening]);

  const clearTranscript = useCallback(() => {
    setFinalTranscript('');
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognitionRef.current = recognition;

    const handleResult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setFinalTranscript((prev) => prev + final + ' ');
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setError(event.error === 'no-speech' ? 'No se detectó voz.' : `Error: ${event.error}`);
      setIsListening(false);
    };

    const handleStart = () => {
      setIsListening(true);
    };

    const handleEnd = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.addEventListener('result', handleResult as EventListener);
    recognition.addEventListener('error', handleError as EventListener);
    recognition.addEventListener('start', handleStart);
    recognition.addEventListener('end', handleEnd);

    return () => {
      recognition.removeEventListener('result', handleResult as EventListener);
      recognition.removeEventListener('error', handleError as EventListener);
      recognition.removeEventListener('start', handleStart);
      recognition.removeEventListener('end', handleEnd);
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return {
    isListening,
    startListening,
    stopListening,
    finalTranscript,
    interimTranscript,
    error,
    isSupported: !!SpeechRecognitionAPI,
    clearTranscript,
  };
};
