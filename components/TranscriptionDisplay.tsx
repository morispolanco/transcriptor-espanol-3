
import React, { useEffect, useRef } from 'react';

interface TranscriptionDisplayProps {
  finalTranscript: string;
  interimTranscript: string;
  isSupported: boolean;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  finalTranscript,
  interimTranscript,
  isSupported,
}) => {
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef.current.scrollHeight;
    }
  }, [finalTranscript, interimTranscript]);

  if (!isSupported) {
    return (
        <div className="p-6 text-center text-yellow-400 text-lg flex-grow flex items-center justify-center">
            <p>La API de Reconocimiento de Voz no es compatible con este navegador.<br/>Por favor, intenta con Google Chrome.</p>
        </div>
    );
  }

  return (
    <div ref={displayRef} className="p-6 md:p-8 text-2xl md:text-3xl text-slate-200 flex-grow overflow-y-auto leading-relaxed">
      <span>{finalTranscript}</span>
      <span className="text-sky-300/70">{interimTranscript}</span>
    </div>
  );
};

export default TranscriptionDisplay;