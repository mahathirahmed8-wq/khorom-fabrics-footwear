import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, hideToast } = useStore();

  useEffect(() => {
    if (!toastMessage) return;

    // Auto-dismiss within 5-6 seconds (5500ms)
    const timer = setTimeout(() => {
      hideToast();
    }, 5500);

    return () => clearTimeout(timer);
  }, [toastMessage, hideToast]);

  if (!toastMessage) return null;

  return (
    <div
      id="toast-notification"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-3 bg-slate-900 text-white pl-5 pr-3.5 py-3.5 rounded-xl shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[calc(100vw-32px)] sm:max-w-md"
    >
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
        <CheckCircle className="w-4 h-4" />
      </div>
      <p className="text-sm font-medium leading-snug flex-1 pr-1">{toastMessage}</p>
      <button
        id="close-toast-btn"
        onClick={hideToast}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
        title="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
