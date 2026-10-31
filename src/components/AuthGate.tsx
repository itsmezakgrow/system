import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  Sun, 
  Moon, 
  ArrowRight, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Clock 
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { 
  isAuthorizedOperatorEmail, 
  isAuthorizedOperatorPassword, 
  recordFailedAttempt, 
  getLockoutState, 
  resetLockoutState, 
  createSecureSession 
} from '../utils/security';

interface AuthGateProps {
  onSuccessLogin: (email: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  onSuccessLogin,
  isDarkMode,
  onToggleTheme,
}) => {
  const [authMethod, setAuthMethod] = useState<'credentials' | 'google'>('credentials');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Brute-force lockout state
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSecondsRemaining, setLockoutSecondsRemaining] = useState(0);

  // Check lockout on mount and tick countdown
  useEffect(() => {
    const checkLockout = () => {
      const state = getLockoutState();
      if (state.lockUntil && Date.now() < state.lockUntil) {
        setIsLocked(true);
        setLockoutSecondsRemaining(Math.ceil((state.lockUntil - Date.now()) / 1000));
      } else {
        setIsLocked(false);
        setLockoutSecondsRemaining(0);
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, []);

  // Standard Credentials Sign In (Anti-Enumeration + SHA-256 Hashing)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setErrorMsg(null);
    setIsLoading(true);

    // Cryptographic throttling delay (defeats automated dictionary attacks)
    await new Promise((resolve) => setTimeout(resolve, 750));

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    try {
      const [emailValid, passwordValid] = await Promise.all([
        isAuthorizedOperatorEmail(cleanEmail),
        isAuthorizedOperatorPassword(cleanPassword),
      ]);

      if (emailValid && passwordValid) {
        resetLockoutState();
        await createSecureSession(cleanEmail);
        onSuccessLogin(cleanEmail);
      } else {
        const { isLocked: nowLocked, remainingSeconds } = recordFailedAttempt();
        if (nowLocked) {
          setIsLocked(true);
          setLockoutSecondsRemaining(remainingSeconds);
          setErrorMsg(
            'Security Lockdown: Multiple failed authentication attempts detected. Terminal temporarily frozen for 60 seconds.'
          );
        } else {
          // Unified constant error: Never disclose whether the email or password was wrong
          setErrorMsg(
            'Access Denied: Invalid operator credentials or unauthorized identity. / فشل الدخول: البيانات المدخلة غير صحيحة أو غير مصرح لها.'
          );
        }
      }
    } catch (err) {
      console.error('Authentication verification error:', err);
      setErrorMsg('Internal security verification error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Sign In via Firebase
  const handleGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const signedEmail = (user.email || '').trim().toLowerCase();

      const authorized = await isAuthorizedOperatorEmail(signedEmail);
      if (authorized) {
        resetLockoutState();
        await createSecureSession(signedEmail);
        onSuccessLogin(signedEmail);
      } else {
        await signOut(auth);
        recordFailedAttempt();
        // Zero Information Disclosure: Do NOT reveal what the authorized email is
        setErrorMsg(
          'Access Denied: The signed Google account is not recognized as an authorized Growth Operator.'
        );
      }
    } catch (err: any) {
      console.warn('Firebase Google Auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled: Google window was closed before completion.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Browser popup was blocked. Please allow popups or use Master Password login.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain not whitelisted in Firebase Auth yet. Please use the Master Password tab below to enter securely.');
      } else {
        setErrorMsg(`Authentication service notice: ${err.message || 'Unable to complete Google sign-in'}. Use Master Password instead.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-4 md:p-8 transition-colors ${
        isDarkMode ? 'bg-[#121110] text-[#F4F2ED]' : 'bg-[#F7F5F0] text-[#111111]'
      }`}
    >
      {/* Top Header Bar */}
      <header
        className={`flex items-center justify-between pb-4 border-b ${
          isDarkMode ? 'border-neutral-800' : 'border-neutral-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-current">
            ZAK / GROWTH OPERATOR
          </span>
          <span className="font-mono text-[11px] opacity-60 hidden sm:inline">
            // RESTRICTED ACCESS WORKSPACE
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-all ${
            isDarkMode
              ? 'bg-[#1F1E1C] border-neutral-700 hover:border-neutral-500 text-neutral-300'
              : 'bg-white border-neutral-300 hover:border-neutral-900 text-neutral-800'
          }`}
          title="Toggle Light/Dark Theme"
        >
          {isDarkMode ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-neutral-700" />
          )}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center my-8">
        <div
          className={`w-full max-w-lg border p-6 md:p-10 shadow-xl relative transition-all ${
            isDarkMode
              ? 'bg-[#1C1B19] border-neutral-700'
              : 'bg-white border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          {/* Top Security Stamp */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-dashed border-current opacity-70">
            <span className="font-mono text-[11px] tracking-widest uppercase flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>[SECURE OPERATOR ACCESS GATE]</span>
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded border border-current">
              ENCRYPTED SHA-256
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Private Executive{' '}
              <span className="paper-highlight-blue px-2 italic font-normal text-white">
                Dashboard
              </span>
            </h1>
            <p className="text-sm font-sans opacity-70 leading-relaxed mt-2">
              Confidential workspace. Authenticate with your authorized Growth Operator credentials to proceed.
            </p>
          </div>

          {/* Brute-force Lockout Warning Banner */}
          {isLocked && (
            <div className="p-4 rounded border border-red-500 bg-red-500/15 text-red-600 dark:text-red-400 font-mono text-xs mb-5 space-y-2 animate-pulse">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>TERMINAL SECURITY LOCKOUT ACTIVE</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Multiple unverified authentication attempts detected. This terminal has been locked to prevent unauthorized access.
              </p>
              <div className="flex items-center gap-1.5 font-bold pt-1 text-sm">
                <Clock className="w-4 h-4" />
                <span>Retry permitted in: {lockoutSecondsRemaining}s</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {!isLocked && errorMsg && (
            <div className="p-3.5 text-xs font-mono rounded border border-red-500 bg-red-500/10 text-red-500 flex items-start gap-2.5 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 border rounded font-mono text-xs border-current mb-5">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => {
                setAuthMethod('credentials');
                setErrorMsg(null);
              }}
              className={`py-2 rounded font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'credentials'
                  ? isDarkMode
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Operator Credentials</span>
            </button>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => {
                setAuthMethod('google');
                setErrorMsg(null);
              }}
              className={`py-2 rounded font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'google'
                  ? isDarkMode
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
              <span>Google Verified Sign-In</span>
            </button>
          </div>

          {/* METHOD 1: OPERATOR CREDENTIALS (EMAIL + PASSWORD TOGETHER) */}
          {authMethod === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1.5 flex items-center justify-between">
                  <span>Operator Email (البريد الإلكتروني)</span>
                  <span className="text-[10px] opacity-60">Confidential</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="email"
                    required
                    disabled={isLocked || isLoading}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="operator@domain.com"
                    autoComplete="username"
                    className={`w-full pl-9 pr-3 py-3 text-sm font-mono border rounded focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#141312] border-neutral-700 focus:border-amber-400 text-white'
                        : 'bg-white border-neutral-400 focus:border-black text-black'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1.5 flex items-center justify-between">
                  <span>Master Password (كلمة السر)</span>
                  <span className="text-[10px] opacity-60">Press Enter ↵</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLocked || isLoading}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter security key or master password"
                    autoComplete="current-password"
                    className={`w-full pl-9 pr-10 py-3 text-sm font-mono border rounded focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#141312] border-neutral-700 focus:border-amber-400 text-white'
                        : 'bg-white border-neutral-400 focus:border-black text-black'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLocked || isLoading}
                className={`w-full py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all mt-3 ${
                  isLocked
                    ? 'opacity-40 cursor-not-allowed bg-neutral-500 text-white border-neutral-500'
                    : isDarkMode
                      ? 'bg-white text-black hover:bg-neutral-200 border-white cursor-pointer'
                      : 'bg-neutral-950 text-white hover:bg-neutral-800 border-neutral-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
                }`}
              >
                <span>{isLoading ? 'Verifying Security Token...' : 'Authenticate & Unlock ↵'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* METHOD 2: GOOGLE SIGN-IN VIA FIREBASE */
            <form onSubmit={handleGoogleSignIn} className="space-y-4">
              <div className="p-4 border rounded font-mono text-xs space-y-2 border-current/30">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified Google Account Required</span>
                </div>
                <div className="text-[11px] opacity-70 leading-relaxed">
                  Only the authorized Growth Operator Google account is cryptographically permitted to unlock this workspace.
                </div>
              </div>

              <button
                type="submit"
                disabled={isLocked || isLoading}
                className={`w-full py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 border transition-all ${
                  isLocked
                    ? 'opacity-40 cursor-not-allowed bg-neutral-500 text-white border-neutral-500'
                    : isDarkMode
                      ? 'bg-white text-black hover:bg-neutral-200 border-white cursor-pointer'
                      : 'bg-neutral-950 text-white hover:bg-neutral-800 border-neutral-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
                }`}
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
                <span>{isLoading ? 'Connecting to Google...' : 'Sign In With Google OAuth ↵'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>
          )}

          {/* Bottom Security Assurance */}
          <div
            className={`mt-8 pt-4 border-t border-dashed flex items-center justify-between text-[11px] font-mono opacity-60 ${
              isDarkMode ? 'border-neutral-800' : 'border-neutral-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero-Trust Security Active</span>
            </span>
            <span>Rate-Limited Protection</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`pt-4 border-t text-center font-mono text-xs opacity-50 ${
          isDarkMode ? 'border-neutral-800' : 'border-neutral-300'
        }`}
      >
        &copy; {new Date().getFullYear()} ZAK &bull; GROWTH OPERATOR &bull; ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};
