import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
              <AlertTriangle className="w-5 height-5" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 height-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{message}</p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-5 bg-zinc-50 dark:bg-zinc-900/30 border-t border-border-light dark:border-border-dark">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-border-light dark:border-border-dark text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-lg ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-500 shadow-red-500/10' 
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/10'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
