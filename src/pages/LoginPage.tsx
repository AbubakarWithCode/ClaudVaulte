import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Cloud,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export default function LoginPage({ initialMode = 'login' }: AuthPageProps) {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Mode: 'login' or 'register'
  const isRegisterParam = location.pathname === '/register' || searchParams.get('mode') === 'register' || initialMode === 'register';
  const [mode, setMode] = useState<'login' | 'register'>(isRegisterParam ? 'register' : 'login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickRegisterPrompt, setQuickRegisterPrompt] = useState<boolean>(false);
  const [isFirebaseConsoleNotice, setIsFirebaseConsoleNotice] = useState<boolean>(false);

  // Forgot password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Synchronize mode if path changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setQuickRegisterPrompt(false);
    setIsFirebaseConsoleNotice(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    if (mode === 'login') {
      try {
        await signInWithEmail(cleanEmail, password);
        // Navigation handled by useEffect
      } catch (err: any) {
        setLoading(false);
        const code = err?.code || '';
        if (code === 'auth/operation-not-allowed') {
          setIsFirebaseConsoleNotice(true);
          setError('Email/Password provider is not yet enabled in Firebase Console.');
        } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          setError('Invalid email or password.');
          setQuickRegisterPrompt(true);
        } else if (code === 'auth/too-many-requests') {
          setError('Too many failed attempts. Access temporarily locked. Please try again later.');
        } else {
          setError(err?.message || 'Login failed. Please verify credentials.');
        }
      }
    } else {
      // Register mode
      try {
        await signUpWithEmail(name.trim(), cleanEmail, password);
        // Navigation handled by useEffect
      } catch (err: any) {
        setLoading(false);
        const code = err?.code || '';
        if (code === 'auth/operation-not-allowed') {
          setIsFirebaseConsoleNotice(true);
          setError('Email/Password provider is not yet enabled in Firebase Console.');
        } else if (code === 'auth/email-already-in-use') {
          setError('This email already has an account. Please switch to Sign In.');
          setMode('login');
        } else if (code === 'auth/invalid-email') {
          setError('Please provide a valid email address.');
        } else if (code === 'auth/weak-password') {
          setError('Password is too weak. Please use at least 6 letters/numbers.');
        } else {
          setError(err?.message || 'Registration failed. Please try again.');
        }
      }
    }
  };

  // Instant 1-click registration when sign-in fails due to user not existing yet
  const handleQuickRegister = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    setQuickRegisterPrompt(false);
    setIsFirebaseConsoleNotice(false);

    const displayName = name.trim() || email.split('@')[0] || 'CloudVault User';
    try {
      await signUpWithEmail(displayName, email.trim(), password);
      // Navigation handled by useEffect
    } catch (err: any) {
      setLoading(false);
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setIsFirebaseConsoleNotice(true);
        setError('Email/Password sign-in method is currently disabled in Firebase Console.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters. Please choose a longer password.');
        setMode('register');
      } else {
        setError(err?.message || 'Could not auto-create account.');
      }
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setIsFirebaseConsoleNotice(false);
    try {
      await signInWithGoogle();
      // Navigation handled by useEffect
    } catch (err: any) {
      setLoading(false);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-in could not be completed.');
      }
    }
  };

  const handleSendForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    setForgotError(null);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotLoading(false);
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotLoading(false);
      if (err?.code === 'auth/operation-not-allowed') {
        setForgotError('Email/Password provider is not yet enabled in Firebase Console.');
      } else {
        setForgotError(err?.message || 'Failed to dispatch reset email.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Brand logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
          <Cloud className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Cloud<span className="text-blue-600">Vault</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login'
              ? 'Access your encrypted files, folders, and shared items'
              : 'Sign up now and get 5 GB free high-speed cloud storage'}
          </p>
        </div>

        {/* Seamless Tab Switcher (keeps entered data!) */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setQuickRegisterPrompt(false);
              setIsFirebaseConsoleNotice(false);
            }}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setQuickRegisterPrompt(false);
              setIsFirebaseConsoleNotice(false);
            }}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Google Sign In (Highlighted as instant & 100% active) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-2 border-blue-500/30 hover:border-blue-500/60 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer group"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>
              {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'} (Instant)
            </span>
          </button>
          <p className="text-[10px] text-center text-slate-400">
            ✓ Google Sign-In is pre-activated and works instantly in 1 click
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
            or with email & password
          </span>
        </div>

        {/* Notice if Email/Password is disabled in Firebase Console */}
        {isFirebaseConsoleNotice && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Firebase Email/Password Provider Disabled</span>
            </div>
            <div className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90 space-y-1">
              <p>
                Firebase project mein Google Login pehle se ON hai, lekin <strong>Email/Password sign-in method</strong> by default Google Console se disabled hota hai.
              </p>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Aap 2 tareeqon se access kar sakte hain:
              </p>
              <ol className="list-decimal list-inside space-y-0.5 pl-1">
                <li>
                  <strong>Tariqa 1 (Sabse Aasan):</strong> Upar diye gaye <strong>"Continue with Google"</strong> button par click karein. Yeh bina kisi setup ke foran kaam karta hai!
                </li>
                <li>
                  <strong>Tariqa 2 (Email/Password Enable):</strong> Firebase Console mein jakar "Email/Password" enable karein.
                </li>
              </ol>
            </div>
            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
              <a
                href="https://console.firebase.google.com/project/gen-lang-client-0622360064/authentication/providers"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 border border-amber-300 dark:border-amber-700 bg-white/60 dark:bg-slate-900/60 hover:bg-white text-amber-900 dark:text-amber-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 text-center"
              >
                <span>Enable in Console</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>
        )}

        {/* Quick Register Prompt if user tried to login without an account */}
        {quickRegisterPrompt && !isFirebaseConsoleNotice && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2.5 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account nahi mila ya password galat hai</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                  Agar aapne pehle se register nahi kiya, to isi email (<strong>{email}</strong>) aur password se foran naya account create kar sakte hain:
                </p>
              </div>
            </div>
            <div className="pt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleQuickRegister}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Create Account with this Email</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setForgotEmail(email);
                }}
                className="px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Reset Password
              </button>
            </div>
          </div>
        )}

        {/* Standard Error Notice */}
        {error && !quickRegisterPrompt && !isFirebaseConsoleNotice && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Abubakar Taj"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password {mode === 'register' && '(min 6 chars)'}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotEmail(email);
                    setForgotSuccess(false);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          {mode === 'login' ? (
            <>
              Don't have a CloudVault account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setQuickRegisterPrompt(false);
                }}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Register for Free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setQuickRegisterPrompt(false);
                }}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your email address and we will dispatch a password recovery link.
            </p>

            {forgotError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Password reset link sent! Check your email inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSendForgot} className="space-y-4">
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
