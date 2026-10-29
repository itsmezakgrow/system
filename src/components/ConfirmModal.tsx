import React from 'react';
import { AlertTriangle, LogOut, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'signout';
  isDarkMode: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes, Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isDarkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-md border-2 p-6 rounded-lg relative transition-all ${
          isDarkMode 
            ? 'bg-[#1C1B19] border-neutral-700 text-[#F4F2ED] shadow-2xl' 
            : 'bg-[#FAF8F5] border-neutral-900 text-[#111111] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        }`}
      >
        {/* Top header bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-current opacity-70">
          <span className="font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            {variant === 'signout' ? (
              <>
                <LogOut className="w-3.5 h-3.5 text-amber-500" />
                <span>CONFIRM WORKSPACE SIGNOUT</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>CONFIRM ACTION // SECURITY CHECK</span>
              </>
            )}
          </span>
          <button 
            onClick={onClose} 
            className="p-1 hover:opacity-100 opacity-60 transition-opacity"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="font-serif text-xl font-bold mb-2">
            {title}
          </h3>
          <p className="text-xs font-sans opacity-80 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-dashed border-current">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
              isDarkMode 
                ? 'bg-neutral-800 border-neutral-700 hover:border-neutral-500 text-neutral-300' 
                : 'bg-white border-neutral-400 hover:border-neutral-900 text-neutral-800'
            }`}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider border flex items-center gap-2 transition-all ${
              variant === 'danger'
                ? isDarkMode
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-md'
                  : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : variant === 'signout'
                  ? isDarkMode
                    ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 shadow-md'
                    : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : isDarkMode
                    ? 'bg-white text-black hover:bg-neutral-200 border-white'
                    : 'bg-neutral-950 text-white hover:bg-neutral-800 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            {variant === 'danger' && <Trash2 className="w-3.5 h-3.5" />}
            {variant === 'signout' && <LogOut className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
