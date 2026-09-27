import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ArrowLeft,
  User,
  Package,
  Coins,
  ShieldCheck,
  LogOut,
  Key,
  Globe,
  DollarSign,
  Gift,
  ChevronRight,
  Mail,
  Lock,
  Sparkles,
  ExternalLink,
  Crown,
  Phone,
} from 'lucide-react';

interface MobileAccountScreenProps {
  onBackToHome: () => void;
}

export const MobileAccountScreen: React.FC<MobileAccountScreenProps> = ({ onBackToHome }) => {
  const {
    language,
    toggleLanguage,
    currency,
    toggleCurrency,
    currentUser,
    loginWithGoogle,
    loginWithPassword,
    registerWithPassword,
    requestLogout,
    userCoins,
    coinSettings,
    setIsOrderTrackingOpen,
    setIsAdminPanelOpen,
    setIsCoinHistoryModalOpen,
    setIsOffersModalOpen,
    setIsResetPasswordOpen,
    showToast,
  } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে ইমেল ও পাসওয়ার্ড পূরণ করুন।' : 'Please fill in email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await loginWithPassword(email.trim(), password.trim());
      if (!res?.success && res?.message) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg(language === 'bn' ? 'সকল ফিল্ড পূরণ করুন।' : 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await registerWithPassword(name.trim(), email.trim(), password.trim());
      if (!res?.success && res?.message) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="khorom-mobile-account-screen"
      className="min-h-screen bg-[#050811] text-slate-100 px-3.5 pt-3 pb-24 animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <button
            id="account-back-to-home-btn"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-[#0a0f1d] border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-[#faf8f5] font-serif">
              {language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account'}
            </h1>
            <p className="text-[11px] text-slate-400">
              {currentUser
                ? language === 'bn'
                  ? 'খড়ম জেন্টস ক্লাব সদস্য'
                  : 'Khorom Gents Lounge Member'
                : language === 'bn'
                ? 'লগইন বা সাইন আপ করুন'
                : 'Sign in or register'}
            </p>
          </div>
        </div>

        {/* Language & Currency Pill */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded-lg bg-[#0a0f1d] border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-[#dfb76c] transition cursor-pointer"
          >
            {language === 'bn' ? 'ENG' : 'বাংলা'}
          </button>
          <button
            onClick={toggleCurrency}
            className="px-2 py-1 rounded-lg bg-[#0a0f1d] border border-slate-800 text-[11px] font-bold text-[#dfb76c] hover:bg-slate-800 transition cursor-pointer"
          >
            {currency}
          </button>
        </div>
      </div>

      {/* Authenticated State */}
      {currentUser ? (
        <div className="space-y-4">
          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#070b14] border border-[#dfb76c]/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfb76c]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#dfb76c] ring-2 ring-[#dfb76c]/20"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#dfb76c] to-[#c59e4b] text-slate-950 font-black text-xl flex items-center justify-center border-2 border-slate-900 shadow-md">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#050811] border border-[#dfb76c]/50 flex items-center justify-center text-[#dfb76c]">
                  <Crown className="w-3 h-3" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#faf8f5] truncate font-serif">
                    {currentUser.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-[#dfb76c]/15 text-[#dfb76c] border border-[#dfb76c]/30 shrink-0">
                    {currentUser.role === 'admin' ? 'Royal Admin' : 'VIP Member'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </p>
                {currentUser.phone && (
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{currentUser.phone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Loyalty Coins Balance Card */}
          {coinSettings.enabled && (
            <div
              onClick={() => setIsCoinHistoryModalOpen(true)}
              className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-amber-500/25 hover:border-amber-500/40 flex items-center justify-between cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                    {language === 'bn' ? 'খড়ম লয়্যালটি কয়েন' : 'Khorom Loyalty Coins'}
                  </span>
                  <span className="text-base font-black text-slate-100">
                    {userCoins}{' '}
                    <span className="text-xs text-amber-400 font-bold">
                      (৳{(userCoins * coinSettings.coinValueBdt).toFixed(0)})
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>{language === 'bn' ? 'হিস্ট্রি' : 'History'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Account Action Menu */}
          <div className="space-y-1.5 p-1 rounded-2xl bg-[#0a0f1d] border border-slate-800">
            {/* Track Order */}
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-slate-900/80 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {language === 'bn' ? 'অর্ডার ট্র্যাকিং ও হিস্ট্রি' : 'Order Tracking & History'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'চলমান অর্ডারের স্ট্যাটাস দেখুন' : 'Check status of recent orders'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Exclusive Offers */}
            <button
              onClick={() => setIsOffersModalOpen(true)}
              className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-slate-900/80 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#dfb76c]/10 border border-[#dfb76c]/20 text-[#dfb76c] flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {language === 'bn' ? 'স্পেশাল কুপন ও অফার' : 'Exclusive Coupons & Offers'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'জেন্টস ক্লাবের বিশেষ অফার সমূহ' : 'Active discounts and promos'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Change Password / Security */}
            <button
              onClick={() => setIsResetPasswordOpen(true)}
              className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-slate-900/80 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'অ্যাকাউন্ট সিকিউরিটি আপডেট করুন' : 'Update account security'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Admin Panel (if admin) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="w-full p-3 rounded-xl flex items-center justify-between bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-200">
                      {language === 'bn' ? 'খড়ম অ্যাডমিন ড্যাশবোর্ড' : 'Khorom Admin Control'}
                    </h4>
                    <p className="text-[10px] text-purple-300/80">
                      {language === 'bn' ? 'পণ্য, অর্ডার ও কাস্টমাইজেশন ম্যানেজ করুন' : 'Manage products, orders & settings'}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-300" />
              </button>
            )}

            {/* Log Out */}
            <button
              onClick={requestLogout}
              className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">
                    {language === 'bn' ? 'লগআউট করুন' : 'Sign Out'}
                  </h4>
                  <p className="text-[10px] text-rose-400/70">
                    {language === 'bn' ? 'ডিভাইস থেকে সাইন আউট করুন' : 'Log out from current session'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      ) : (
        /* Guest / Not Logged In State */
        <div className="space-y-4 max-w-sm mx-auto">
          {/* Welcoming Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#070b14] border border-[#dfb76c]/30 text-center space-y-2 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#dfb76c]/15 border border-[#dfb76c]/30 text-[#dfb76c] flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-[#faf8f5] font-serif">
              {language === 'bn' ? 'খড়ম জেন্টস ক্লাবে স্বাগতম' : 'Welcome to KHOROM Gents Lounge'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'লগইন করে আপনার অর্ডার ট্র্যাক করুন, উইশলিস্ট সংরক্ষণ করুন এবং প্রতিটি অর্ডারে খড়ম লয়্যালটি কয়েন অর্জন করুন।'
                : 'Sign in to track orders, save bespoke favorites, and earn loyalty rewards on every order.'}
            </p>
          </div>

          {/* Social Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{language === 'bn' ? 'Google দিয়ে প্রবেশ করুন' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] uppercase font-bold text-slate-500">
              {language === 'bn' ? 'অথবা ইমেল দিয়ে' : 'or with email'}
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Inline Auth Form */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-3">
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#dfb76c] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'bn' ? 'লগইন' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#dfb76c] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'bn' ? 'রেজিস্টার' : 'Register'}
              </button>
            </div>

            {errorMsg && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form
              onSubmit={authMode === 'login' ? handleEmailLogin : handleEmailRegister}
              className="space-y-2.5"
            >
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {language === 'bn' ? 'আপনার নাম' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম লিখুন' : 'e.g. Tanvir Ahmed'}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-[#dfb76c]/50 transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {language === 'bn' ? 'ইমেল অ্যাড্রেস' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-[#dfb76c]/50 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setIsResetPasswordOpen(true)}
                      className="text-[10px] text-[#dfb76c] hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'ভুলে গেছেন?' : 'Forgot?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-[#dfb76c]/50 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl gold-gradient-btn border border-[#dfb76c]/40 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-3"
              >
                {loading ? (
                  <span>{language === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...'}</span>
                ) : authMode === 'login' ? (
                  <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                ) : (
                  <span>{language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Create Account & Join'}</span>
                )}
              </button>
            </form>
          </div>

          {/* Quick Guest Utilities */}
          <div className="p-3 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-1.5">
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="w-full p-2.5 rounded-xl flex items-center justify-between hover:bg-slate-900 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-medium text-slate-300">
                  {language === 'bn' ? 'লগইন ছাড়াই অর্ডার ট্র্যাক করুন' : 'Track Order (No login needed)'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => setIsOffersModalOpen(true)}
              className="w-full p-2.5 rounded-xl flex items-center justify-between hover:bg-slate-900 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Gift className="w-4 h-4 text-[#dfb76c]" />
                <span className="text-xs font-medium text-slate-300">
                  {language === 'bn' ? 'চলমান বিশেষ ডিসকাউন্টসমূহ' : 'View Ongoing Promotions'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
