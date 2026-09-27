import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  User,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  LogIn,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    registerWithPassword,
    loginWithPassword,
    sendPasswordReset,
    requestLogout,
    language,
    setIsAdminPanelOpen,
  } = useStore();

  // Modes: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const switchMode = (mode: 'login' | 'register' | 'forgot') => {
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // 1. Email & Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage(
        language === 'bn' ? 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড উভয়ই পূরণ করুন।' : 'Please enter both email and password.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await loginWithPassword(email.trim(), password);
    setIsSubmitting(false);

    if (!result.success && result.message) {
      setErrorMessage(result.message);
    }
  };

  // 2. Account Registration with Confirm Password Validation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMessage(language === 'bn' ? 'ইমেইল এবং পাসওয়ার্ড আবশ্যক।' : 'Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না! পুনরায় যাচাই করুন।'
          : 'Passwords do not match. Please verify.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await registerWithPassword(name.trim(), email.trim(), password, 'customer');
    setIsSubmitting(false);

    if (!result.success && result.message) {
      setErrorMessage(result.message);
    }
  };

  // 3. Password Reset via Firebase Auth
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage(
        language === 'bn' ? 'আপনার রেজিস্টার্ড ইমেইল ঠিকানা দিন।' : 'Please enter your registered email address.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await sendPasswordReset(email.trim());
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(
        res.message ||
          (language === 'bn'
            ? 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।'
            : 'Password reset link sent to your email. Check inbox or spam folder.')
      );
    } else {
      setErrorMessage(res.error || (language === 'bn' ? 'পাসওয়ার্ড রিসেট লিংক পাঠাতে ত্রুটি হয়েছে।' : 'Failed to send reset link.'));
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => !isSubmitting && setIsAuthModalOpen(false)}
    >
      <div
        id="auth-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0d1424] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={() => setIsAuthModalOpen(false)}
          disabled={isSubmitting}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/60"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="relative pt-7 pb-4 px-6 text-center border-b border-slate-800/80">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 mb-2.5 border border-amber-300/40">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white tracking-wide">
            {language === 'bn' ? 'খড়ম এক্সক্লুসিভ অ্যাকাউন্ট' : 'Khorom Bespoke Account'}
          </h2>
          <p className="text-xs text-amber-300/80 mt-0.5 font-medium">
            {language === 'bn'
              ? 'ফায়ারবেস অথেন্টিকেশনে নিরাপদ সেন্ট্রাল লগইন ও রেজিস্ট্রেশন'
              : 'Secure Firebase authentication & member access'}
          </p>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/80 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{currentUser.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {currentUser.role === 'admin' ? 'Royal Admin' : 'VIP Member'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn' ? 'সফলভাবে লগইন আছেন' : 'Logged in securely'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  id="auth-go-to-admin-btn"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setIsAdminPanelOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Open Admin Panel'}</span>
                </button>
              )}
              <button
                type="button"
                id="auth-logout-btn"
                onClick={requestLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{language === 'bn' ? 'লগআউট করুন' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Mode Tabs (Login / Register / Forgot) */}
            <div className="grid grid-cols-2 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                id="auth-tab-login"
                onClick={() => switchMode('login')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগইন' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                id="auth-tab-register"
                onClick={() => switchMode('register')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রেজিস্ট্রেশন' : 'Sign Up'}</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Clear Account Guidance Note */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {language === 'bn'
                      ? 'আপনার খড়ম অ্যাকাউন্টটি সাইন আপের সময় তৈরি করা পাসওয়ার্ড ব্যবহার করে।'
                      : 'Your KHOROM account uses the password you created during Sign Up.'}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      id="login-email-input"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      {language === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition-colors"
                    >
                      {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password-input"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="email-password-login-btn"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer mt-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'প্রবেশ করা হচ্ছে...' : 'Signing in...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In with Email'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    {language === 'bn'
                      ? 'নতুন অ্যাকাউন্ট প্রয়োজন? এখানে রেজিস্ট্রেশন করুন'
                      : "Don't have an account? Sign up here"}
                  </button>
                </div>
              </form>
            )}

            {/* 2. SIGN UP (REGISTRATION) FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      id="register-name-input"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'bn' ? 'আমরান ইজাজ' : 'Amran Izaz'}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      id="register-email-input"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'Password (min 6 chars) *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="register-password-input"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                      title={showPassword ? 'Hide' : 'Show'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      {language === 'bn' ? 'কনফার্ম পাসওয়ার্ড *' : 'Confirm Password *'}
                    </label>
                    {confirmPassword && (
                      <span
                        className={`text-[10px] font-bold ${
                          password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {password === confirmPassword
                          ? language === 'bn'
                            ? '✓ পাসওয়ার্ড মিলেছে'
                            : '✓ Match'
                          : language === 'bn'
                          ? '✕ মিলছে না'
                          : '✕ Mismatch'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="register-confirm-password-input"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-10 py-2.5 text-xs bg-slate-900/90 border rounded-xl text-white placeholder-slate-500 focus:outline-none ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-slate-700 focus:border-amber-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                      title={showConfirmPassword ? 'Hide' : 'Show'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="email-password-register-btn"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer mt-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>{language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    {language === 'bn'
                      ? 'ইতিমধ্যেই অ্যাকাউন্ট আছে? এখানে লগইন করুন'
                      : 'Already have an account? Sign in here'}
                  </button>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FLOW */}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
                  <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {language === 'bn'
                      ? 'আপনার রেজিস্ট্রেশন করা ইমেইল দিলে আমরা সাথে সাথে অফিসিয়াল পাসওয়ার্ড রিসেট লিংক পাঠিয়ে দেব।'
                      : 'Enter your registered email and we will send a secure password reset link immediately.'}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'রেজিস্টার্ড ইমেইল *' : 'Registered Email *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      id="forgot-password-email-input"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="forgot-password-submit-btn"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer mt-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending link...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>{language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Privilege Highlights */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {language === 'bn'
                  ? 'রেজিস্ট্রেশন বা লগইন থাকলে যেকোনো সময় আপনার ব্যক্তিগত অর্ডার হিস্ট্রি ট্র্যাক করতে পারবেন।'
                  : 'Logged-in members can track individual orders and maintain personal purchase history.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
