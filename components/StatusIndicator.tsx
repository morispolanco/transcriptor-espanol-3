
import React from 'react';

interface StatusIndicatorProps {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isListening,
  isSupported,
  error,
}) => {
  let statusMessage = 'Haz clic en el micrófono para empezar a transcribir';
  let colorClass = 'text-slate-400';

  if (!isSupported) {
    statusMessage = 'Tu navegador no soporta el reconocimiento de voz.';
    colorClass = 'text-yellow-500';
  } else if (error) {
    statusMessage = error;
    colorClass = 'text-red-500';
  } else if (isListening) {
    statusMessage = 'Escuchando...';
    colorClass = 'text-sky-400';
  }

  return (
    <p className={`text-center text-lg transition-colors duration-300 ${colorClass}`}>
      {statusMessage}
    </p>
  );
};

export default StatusIndicator;