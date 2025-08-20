import React, { useState } from 'react';
import { CloseIcon, CopyIcon, CheckIcon, TrashIcon, HistoryIcon } from './Icons';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: string[];
  onClearHistory: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onClearHistory }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 sticky top-0 bg-slate-800/80">
          <h2 className="text-xl font-bold text-sky-400">Historial de Transcripciones</h2>
          <div className="flex items-center gap-x-2">
            {history.length > 0 && (
                <button
                    onClick={onClearHistory}
                    className="flex items-center gap-x-2 px-3 py-2 text-sm rounded-lg text-red-400 bg-red-900/20 hover:bg-red-900/40 transition-colors"
                    title="Borrar historial"
                >
                    <TrashIcon className="w-4 h-4" />
                    <span>Borrar Todo</span>
                </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Cerrar modal"
            >
              <CloseIcon className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </header>

        <main className="p-6 flex-grow overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <HistoryIcon className="w-16 h-16 mb-4"/>
                <p className="text-lg">El historial está vacío.</p>
                <p>Las transcripciones aparecerán aquí después de que termines de grabar.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {history.map((text, index) => (
                <li key={index} className="bg-slate-900/50 p-4 rounded-lg flex items-start justify-between gap-x-4">
                  <p className="text-slate-300 flex-grow">{text}</p>
                  <button
                    onClick={() => handleCopy(text, index)}
                    className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors flex-shrink-0"
                    aria-label="Copiar texto"
                    title="Copiar"
                  >
                    {copiedIndex === index ? (
                      <CheckIcon className="w-5 h-5 text-green-400" />
                    ) : (
                      <CopyIcon className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default HistoryModal;