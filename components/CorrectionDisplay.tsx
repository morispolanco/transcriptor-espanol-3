
import React, { useState } from 'react';
import { CopyIcon, CheckIcon, TrashIcon, HistoryIcon, SparklesIcon, AlertTriangleIcon, KeyIcon } from './Icons';

interface ApiKeySetupProps {
  onSaveApiKey: (key: string) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onSaveApiKey }) => {
    const [keyValue, setKeyValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveApiKey(keyValue);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
            <KeyIcon className="w-12 h-12 mb-4 text-yellow-400"/>
            <p className="text-lg font-semibold mb-2">Configuración Requerida</p>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
                Por favor, introduce tu clave de API de OpenRouter para activar la corrección por IA. Tu clave se guardará de forma segura en tu navegador.
            </p>
            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center">
                <input
                    type="password"
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value)}
                    placeholder="Pega tu clave de API aquí"
                    className="w-full px-4 py-2 text-center bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="OpenRouter API Key"
                />
                <button
                    type="submit"
                    disabled={!keyValue.trim()}
                    className="mt-4 w-full px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-sky-500/50"
                >
                    Guardar Clave
                </button>
            </form>
        </div>
    );
};


interface CorrectionDisplayProps {
  apiKey: string | null;
  onSaveApiKey: (key: string) => void;
  correctedText: string;
  isCorrecting: boolean;
  correctionError: string | null;
  onClear: () => void;
  onShowHistory: () => void;
  historyDisabled: boolean;
}

const CorrectionDisplay: React.FC<CorrectionDisplayProps> = ({
  apiKey,
  onSaveApiKey,
  correctedText,
  isCorrecting,
  correctionError,
  onClear,
  onShowHistory,
  historyDisabled,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!correctedText.trim() || copied) return;
    navigator.clipboard.writeText(correctedText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (!apiKey) {
      return <ApiKeySetup onSaveApiKey={onSaveApiKey} />;
    }
    if (isCorrecting) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <SparklesIcon className="w-12 h-12 animate-pulse text-sky-400" />
          <p className="mt-4 text-lg">Corrigiendo y mejorando el texto...</p>
        </div>
      );
    }
    if (correctionError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center">
            <AlertTriangleIcon className="w-12 h-12 mb-4" />
            <p className="text-lg font-semibold">Error en la Corrección</p>
            <p className="text-sm text-red-400/80 mt-2 max-w-md">{correctionError}</p>
        </div>
      );
    }
    if (correctedText) {
      return <p className="whitespace-pre-wrap">{correctedText}</p>;
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <SparklesIcon className="w-16 h-16 mb-4" />
        <p className="text-lg text-center">La corrección de tu transcripción aparecerá aquí.</p>
      </div>
    );
  };

  const showHeaderActions = !!apiKey;

  return (
    <div className="bg-slate-800/50 rounded-2xl shadow-2xl shadow-sky-900/20 flex flex-col border border-slate-700 h-full">
      <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-x-3">
          {apiKey ? <SparklesIcon className="w-6 h-6 text-sky-400" /> : <KeyIcon className="w-6 h-6 text-yellow-400" />}
          <h2 className={`text-xl font-bold ${apiKey ? 'text-sky-400' : 'text-yellow-400'}`}>
            {apiKey ? 'Corrección y Estilo' : 'Configuración Requerida'}
          </h2>
        </div>
        {showHeaderActions && (
          <div className="flex items-center gap-x-2">
            <button
              onClick={onShowHistory}
              disabled={historyDisabled}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Ver historial"
              title="Historial"
            >
              <HistoryIcon className="w-5 h-5 text-slate-300" />
            </button>
            <button
              onClick={handleCopy}
              disabled={!correctedText.trim()}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Copiar corrección"
              title="Copiar"
            >
              {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-slate-300" />}
            </button>
            <button
              onClick={onClear}
              disabled={!correctedText.trim() && !correctionError}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Borrar corrección"
              title="Borrar"
            >
              <TrashIcon className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        )}
      </header>
      <div className="p-6 md:p-8 text-xl md:text-2xl text-slate-200 flex-grow overflow-y-auto leading-relaxed">
        {renderContent()}
      </div>
    </div>
  );
};

export default CorrectionDisplay;
