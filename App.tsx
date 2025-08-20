
import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { MicrophoneIcon, StopIcon } from './components/Icons';
import StatusIndicator from './components/StatusIndicator';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import CorrectionDisplay from './components/CorrectionDisplay';
import HistoryModal from './components/HistoryModal';

const App: React.FC = () => {
  const {
    isListening,
    startListening,
    stopListening,
    finalTranscript,
    interimTranscript,
    error: recognitionError,
    isSupported,
    clearTranscript,
  } = useSpeechRecognition({ lang: 'es-ES' });

  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const prevIsListening = useRef(false);

  // New state for correction
  const [correctedText, setCorrectedText] = useState('');
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  const handleCorrection = async (text: string) => {
    if (!text.trim()) return;

    setIsCorrecting(true);
    setCorrectionError(null);
    setCorrectedText('');

    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      setCorrectionError("La clave API no está configurada. Asegúrate de que la variable de entorno API_KEY esté definida.");
      setIsCorrecting(false);
      return;
    }

    const systemInstruction = "Eres un experto en gramática y estilo en español. Tu tarea es corregir el texto que te proporciona el usuario. Mejora la puntuación, la gramática y el estilo para que sea claro y profesional. No agregues introducciones, conclusiones ni ninguna explicación sobre los cambios; devuelve únicamente el texto corregido.";

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://transcriptor.app",
            "X-Title": "Transcriptor y Corrector IA",
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-20b:free",
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: text }
            ]
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Autenticación fallida. La clave de API proporcionada no es válida.");
        }
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || `La solicitud falló con el estado ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      const corrected = data.choices?.[0]?.message?.content;

      if (corrected) {
        setCorrectedText(corrected.trim());
      } else {
        throw new Error("No se recibió una corrección válida del servicio.");
      }

    } catch (err) {
      console.error("Error calling OpenRouter API:", err);
      if (err instanceof Error) {
        setCorrectionError(err.message);
      } else {
        setCorrectionError("Ocurrió un error desconocido durante la corrección.");
      }
    } finally {
      setIsCorrecting(false);
    }
  };


  useEffect(() => {
    // Save to history and trigger correction when listening stops
    if (prevIsListening.current && !isListening && finalTranscript.trim()) {
      const transcriptToProcess = finalTranscript.trim();
      setHistory(prev => [transcriptToProcess, ...prev].slice(0, 100));
      handleCorrection(transcriptToProcess);
    }
    prevIsListening.current = isListening;
  }, [isListening, finalTranscript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      // Clear everything for a fresh start
      clearTranscript();
      setCorrectedText('');
      setCorrectionError(null);
      startListening();
    }
  };

  const handleClearAll = () => {
    clearTranscript();
    setCorrectedText('');
    setCorrectionError(null);
  };
  
  const handleClearHistory = () => {
    setHistory([]);
    setIsHistoryOpen(false);
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-7xl h-[90vh] flex flex-col">
          <header className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-sky-400">
              Transcriptor y Corrector IA
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Habla en español, transcríbelo y mejóralo al instante.
            </p>
          </header>

          <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
            
            {/* Left Panel: Live Transcription */}
            <div className="bg-slate-800/50 rounded-2xl shadow-2xl shadow-sky-900/20 flex flex-col border border-slate-700 h-full">
              <header className="p-4 border-b border-slate-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-300">Transcripción en Vivo</h2>
              </header>
              <TranscriptionDisplay
                finalTranscript={finalTranscript}
                interimTranscript={interimTranscript}
                isSupported={isSupported}
              />
            </div>

            {/* Right Panel: AI Correction */}
            <CorrectionDisplay
              correctedText={correctedText}
              isCorrecting={isCorrecting}
              correctionError={correctionError}
              onClear={handleClearAll}
              onShowHistory={() => setIsHistoryOpen(true)}
              historyDisabled={history.length === 0}
            />

          </main>

          <footer className="mt-8 flex flex-col items-center justify-center space-y-4">
            <button
              onClick={toggleListening}
              disabled={!isSupported}
              className={`
                w-24 h-24 rounded-full flex items-center justify-center relative
                transition-all duration-300 ease-in-out
                focus:outline-none focus:ring-4 focus:ring-sky-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50'
                    : 'bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-500/50'
                }
              `}
              aria-label={isListening ? 'Detener transcripción' : 'Iniciar transcripción'}
            >
              {isListening ? (
                <StopIcon className="w-10 h-10 text-white" />
              ) : (
                <MicrophoneIcon className="w-10 h-10 text-white" />
              )}
              {isListening && (
                <span className="absolute w-24 h-24 bg-red-500 rounded-full animate-ping opacity-75"></span>
              )}
            </button>
            
            <StatusIndicator
              isListening={isListening}
              isSupported={isSupported}
              error={recognitionError}
            />
          </footer>
        </div>
      </div>
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onClearHistory={handleClearHistory}
      />
    </>
  );
};

export default App;
