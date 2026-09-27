import React from 'react';
import { useStore } from '../context/StoreContext';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export const LogoutConfirmModal: React.FC = () => {
  const {
    isLogoutConfirmOpen,
    cancelLogout,
    confirmLogout,
    currentUser,
    language,
  } = useStore();

  if (!isLogoutConfirmOpen) return null;

  return (
    <div
      id="logout-confirm-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={cancelLogout}
    >
      <div
        id="logout-confirm-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-[#0d1424] border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-slate-200 text-center animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          id="close-logout-modal-btn"
          onClick={cancelLogout}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
          <LogOut className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-white tracking-wide mb-1">
          {language === 'bn' ? 'লগআউট নিশ্চিতকরণ' : 'Confirm Sign Out'}
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {language === 'bn'
            ? currentUser?.name
              ? `জনাব ${currentUser.name}, আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?`
              : 'আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?'
            : 'Are you sure you want to sign out of your account?'}
        </p>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 mb-5 flex items-center gap-2 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {language === 'bn'
              ? 'লগআউট করলে পুনরায় পাসওয়ার্ড দিয়ে লগইন না করা পর্যন্ত ব্যক্তিগত অর্ডার হিস্ট্রি দেখা যাবে না।'
              : 'You will need to sign in again to view your personal orders and purchase history.'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="cancel-logout-btn"
            onClick={cancelLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer border border-slate-700"
          >
            {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
          </button>

          <button
            type="button"
            id="confirm-logout-btn"
            onClick={confirmLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'হ্যাঁ, লগআউট' : 'Yes, Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
