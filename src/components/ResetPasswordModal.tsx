import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { verifyResetCode, confirmResetPassword } from '../lib/firebase';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export const ResetPasswordModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Manual code input if arrived at /reset-password without code
  const [manualCode, setManualCode] = useState('');

  // Check URL parameters for reset code on mount and on popstate/hashchange
  useEffect(() => {
    const parseUrl = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);

        const code =
          searchParams.get('oobCode') ||
          hashParams.get('oobCode') ||
          searchParams.get('code') ||
          hashParams.get('code');
        const mode = searchParams.get('mode') || hashParams.get('mode');
        const pathname = window.location.pathname;
        const isResetRoute = pathname.includes('reset-password');

        if (code && (mode === 'resetPassword' || !mode || isResetRoute)) {
          setOobCode(code);
          setIsOpen(true);
          handleVerify(code);
        } else if (isResetRoute || mode === 'resetPassword') {
          setIsOpen(true);
        }
      } catch (e) {
        console.warn('Error reading reset URL parameters:', e);
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    window.addEventListener('hashchange', parseUrl);
    return () => {
      window.removeEventListener('popstate', parseUrl);
      window.removeEventListener('hashchange', parseUrl);
    };
  }, []);

  const handleVerify = async (codeToVerify: string) => {
    setIsVerifying(true);
    setVerifyError(null);
    setSubmitError(null);

    const res = await verifyResetCode(codeToVerify);
    setIsVerifying(false);

    if (res.success && res.email) {
      setTargetEmail(res.email);
      setVerifyError(null);
    } else {
      setVerifyError(res.error || 'This password reset link is invalid or has expired.');
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    // Extract oobCode if user pasted whole URL
    let code = manualCode.trim();
    if (code.includes('oobCode=')) {
      const match = code.match(/oobCode=([^&]+)/);
      if (match) code = match[1];
    }
    setOobCode(code);
    handleVerify(code);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!oobCode) {
      setSubmitError('Missing password reset action code.');
      return;
    }

    if (newPassword.length < 6) {
      setSubmitError('Password should be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setIsSubmitting(true);
    const res = await confirmResetPassword(oobCode, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      // Clean URL params quietly
      try {
        window.history.replaceState({}, document.title, window.location.pathname.replace('/reset-password', '') || '/');
      } catch {}
    } else {
      setSubmitError(res.error || 'Failed to reset password. Please try again.');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setOobCode(null);
    setTargetEmail('');
    setVerifyError(null);
    setSubmitError(null);
    setIsSuccess(false);
    setNewPassword('');
    setConfirmPassword('');
    try {
      window.history.replaceState({}, document.title, window.location.pathname.replace('/reset-password', '') || '/');
    } catch {}
  };

  const handleGoToLogin = () => {
    handleClose();
    setIsAuthModalOpen(true);
  };

  const handleRequestNewLink = () => {
    handleClose();
    setIsAuthModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div
      id="reset-password-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="reset-password-card"
        className="w-full max-w-md bg-stone-900 border border-amber-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-stone-100 relative overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-stone-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-100 tracking-wide">
              Reset Your Password
            </h2>
            <p className="text-xs text-stone-400">
              KHOROM Secure Authentication
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-auto text-stone-400 hover:text-stone-200 transition-colors text-xl font-bold p-1 leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Verifying State */}
        {isVerifying && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-stone-300 font-medium">Verifying password reset code...</p>
            <p className="text-xs text-stone-400 mt-1">Please wait while we validate your link.</p>
          </div>
        )}

        {/* Verification Failed State */}
        {!isVerifying && verifyError && (
          <div className="py-6 space-y-6">
            <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 flex items-start gap-3 text-red-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Invalid or Expired Link</h4>
                <p className="text-xs text-red-300/90 mt-1">{verifyError}</p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Password reset links are valid for a single use and expire after a limited time.
              You can easily request a new reset email below.
            </p>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleRequestNewLink}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <Mail className="w-4 h-4" />
                Request a New Reset Link
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 text-xs text-stone-400 hover:text-stone-200 transition-colors"
              >
                Cancel and return to store
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isVerifying && isSuccess && (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-emerald-300">
                Password Reset Successful!
              </h3>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                Password reset successful. You can now sign in with your new password.
              </p>
            </div>

            <div className="bg-stone-800/70 border border-stone-700/60 rounded-xl p-3 text-left">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Your new credentials are fully active across your KHOROM account.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoToLogin}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              Sign In with New Password
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Manual Code Input State (if arrived at /reset-password without oobCode) */}
        {!isVerifying && !verifyError && !targetEmail && !isSuccess && (
          <form onSubmit={handleManualVerify} className="py-4 space-y-4">
            <div className="bg-stone-800/60 border border-stone-700 rounded-xl p-4 text-xs text-stone-300 leading-relaxed">
              If you received a password reset link by email, paste the complete link or the reset code below to continue.
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Reset Link or Code
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Paste code or link here..."
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-colors text-sm flex items-center justify-center gap-2"
            >
              Continue to Reset Password
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleRequestNewLink}
                className="text-xs text-amber-400 hover:underline"
              >
                Don't have a link? Send reset email
              </button>
            </div>
          </form>
        )}

        {/* Password Reset Form State (Code Verified) */}
        {!isVerifying && !verifyError && targetEmail && !isSuccess && (
          <form onSubmit={handleResetSubmit} className="space-y-4 pt-1">
            {/* Target Email Notice */}
            <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-3 flex items-center gap-2 text-xs text-stone-300">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-stone-400">Account:</span>{' '}
                <strong className="text-stone-200">{targetEmail}</strong>
              </div>
            </div>

            {/* Clear Guidance Note */}
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
              <strong>Important Notice:</strong> Your KHOROM account uses the password you created during Sign Up.
              Please set a new secure password for your KHOROM account.
            </div>

            {submitError && (
              <div className="bg-red-950/50 border border-red-800/60 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* New Password Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  minLength={6}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Match Status */}
              {confirmPassword.length > 0 && (
                <div className="mt-1.5 text-xs flex items-center gap-1.5">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || newPassword.length < 6 || newPassword !== confirmPassword}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
