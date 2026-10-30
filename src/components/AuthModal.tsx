import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  Clock,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { signIn, signUp, resetPassword, resendConfirmation } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  // Resend Cooldown Timer (60s)
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  // Help Guide Accordion
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  // Cooldown countdown tick
  useEffect(() => {
    let timer: any = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg(null);
    setErrorCode(undefined);
    setSuccessMsg(null);
    setEmailConfirmationRequired(false);
    setResendFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate rapid clicks

    resetMessages();
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn(email, password);
        if (!result.success) {
          setErrorMsg(result.error);
          setErrorCode(result.errorCode);
        } else {
          setSuccessMsg('Successfully signed in.');
          setTimeout(() => onClose(), 800);
        }
      } else if (mode === 'register') {
        if (!fullName.trim()) {
          setErrorMsg('Full name is required.');
          setLoading(false);
          return;
        }

        const result = await signUp(email, password, fullName, phone);
        if (!result.success) {
          setErrorMsg(result.error);
          setErrorCode(result.errorCode);
        } else {
          if (result.requiresEmailConfirmation) {
            setEmailConfirmationRequired(true);
            setSuccessMsg(
              `Registration recorded! A confirmation email has been dispatched to ${email}. Please verify your email before signing in.`
            );
          } else {
            setSuccessMsg('Account registered successfully! You are now logged in.');
            setTimeout(() => onClose(), 1200);
          }
        }
      } else if (mode === 'forgot') {
        const result = await resetPassword(email);
        if (!result.success) {
          setErrorMsg(result.error);
          setErrorCode(result.errorCode);
        } else {
          setSuccessMsg(`Password reset instructions dispatched to ${email}.`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !email) return;
    setResending(true);
    setResendFeedback(null);

    try {
      const result = await resendConfirmation(email);
      if (!result.success) {
        setResendFeedback(result.error || 'Failed to resend confirmation.');
      } else {
        setResendFeedback('Verification email resent. Please check your inbox and spam folder.');
        setResendCooldown(60); // 60-second cooldown
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#059669] flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                {mode === 'login' && 'Sign In to CivicAI'}
                {mode === 'register' && 'Citizen Registration'}
                {mode === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-300">
                Official Municipal Civic Action Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                resetMessages();
              }}
              className={`flex-1 py-3 text-center transition ${
                mode === 'login'
                  ? 'border-b-2 border-[#059669] text-[#059669] bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                resetMessages();
              }}
              className={`flex-1 py-3 text-center transition ${
                mode === 'register'
                  ? 'border-b-2 border-[#059669] text-[#059669] bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </div>

              {/* Actionable shortcuts for known conditions */}
              {errorCode === 'rate_limit_exceeded' && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-rose-700">Account may already exist:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      resetMessages();
                    }}
                    className="font-bold underline text-rose-900 hover:text-rose-950"
                  >
                    Try Logging In &rarr;
                  </button>
                </div>
              )}

              {errorCode === 'user_already_exists' && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-rose-700">Switch to login screen:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      resetMessages();
                    }}
                    className="font-bold underline text-rose-900 hover:text-rose-950"
                  >
                    Sign In with Password &rarr;
                  </button>
                </div>
              )}

              {errorCode === 'email_not_confirmed' && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-rose-700">Need another confirmation link?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || resending}
                    onClick={handleResend}
                    className="font-bold underline text-rose-900 hover:text-rose-950 disabled:opacity-50"
                  >
                    {resendCooldown > 0
                      ? `Wait ${resendCooldown}s`
                      : resending
                      ? 'Resending...'
                      : 'Resend Confirmation Email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success / Pending Confirmation Message Box */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{successMsg}</span>
              </div>

              {emailConfirmationRequired && (
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || resending}
                    onClick={handleResend}
                    className="text-emerald-700 hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <Clock className="w-3 h-3" />
                    {resendCooldown > 0
                      ? `Resend available in ${resendCooldown}s`
                      : resending
                      ? 'Dispatching...'
                      : 'Resend confirmation link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      resetMessages();
                    }}
                    className="font-bold text-emerald-800 underline"
                  >
                    Go to Sign In &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Resend Feedback message */}
          {resendFeedback && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded text-xs">
              {resendFeedback}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Narayan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-[#CBD5E1] focus:border-[#0F172A] focus:outline-none disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (Optional for SMS alerts)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98450 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-[#CBD5E1] focus:border-[#0F172A] focus:outline-none disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="citizen@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-[#CBD5E1] focus:border-[#0F172A] focus:outline-none disabled:bg-slate-100"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        resetMessages();
                      }}
                      className="text-[11px] text-[#059669] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-[#CBD5E1] focus:border-[#0F172A] focus:outline-none disabled:bg-slate-100"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#059669] hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing with Supabase...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Complete Registration'}
                    {mode === 'forgot' && 'Send Password Reset Email'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetMessages();
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 underline"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </form>

          {/* Developer / Admin Supabase Email Setting Guide Accordion */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowConfigHelp(!showConfigHelp)}
              className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-700 py-1"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#059669]" />
                How to resolve Supabase email rate limits
              </span>
              {showConfigHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showConfigHelp && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 space-y-2 leading-relaxed">
                <p>
                  <strong>Why does this happen?</strong> Supabase's built-in default email service has a strict test limit of <strong>3 emails per hour</strong> across signups, password resets, and invites.
                </p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">To remove email limits during testing:</p>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Open your Supabase Project Dashboard.</li>
                    <li>Go to <strong>Authentication &rarr; Providers &rarr; Email</strong>.</li>
                    <li>Turn <strong>OFF</strong> the toggle for <strong>"Confirm email"</strong>.</li>
                    <li>Click <strong>Save</strong>. New accounts will log in immediately without sending emails!</li>
                  </ol>
                </div>
                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <p className="font-semibold text-slate-800">For production unlimited sending:</p>
                  <p>Configure a custom SMTP provider (e.g. Resend, SendGrid, Amazon SES) in <strong>Project Settings &rarr; Authentication &rarr; SMTP Settings</strong>.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          Protected by Supabase Auth with Row Level Security (RLS)
        </div>
      </div>
    </div>
  );
};
