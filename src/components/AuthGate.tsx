import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Sun, Moon, ArrowRight, Mail, Key, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';

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
  const AUTHORIZED_EMAIL = 'itsmezaki77@gmail.com';

  // Step 1: 'identity' (Email check)
  // Step 2: 'authenticate' (Authentication Options: Password or Google)
  const [step, setStep] = useState<'identity' | 'authenticate'>('identity');

  // Step 1 Input (Email only)
  const [emailInput, setEmailInput] = useState('');

  // Step 2 Inputs & Method
  const [authMethod, setAuthMethod] = useState<'password' | 'google'>('password');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Accepted passwords for the authorized operator
  const isPasswordValid = (pass: string) => {
    const p = pass.trim();
    return (
      p === AUTHORIZED_EMAIL ||
      p === 'itsmezaki77' ||
      p === 'Zaki2026!' ||
      p === 'zaki2026'
    );
  };

  // Step 1: Initial Gate Verification
  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter your operator email address. / يرجى إدخال البريد الإلكتروني.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Security check: Only allow authorized operator email to proceed
      if (cleanEmail === AUTHORIZED_EMAIL.toLowerCase()) {
        setErrorMsg(null);
        setStep('authenticate');
      } else {
        setErrorMsg(
          `Access Denied: The identity "${cleanEmail}" is not recognized as an authorized Growth Operator. / هذا البريد غير مصرح له بالدخول للنظام.`
        );
      }
    }, 450);
  };

  // Step 2: Password Sign In
  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsLoading(false);
      if (isPasswordValid(passwordInput)) {
        onSuccessLogin(AUTHORIZED_EMAIL);
      } else {
        setErrorMsg('Invalid password. Please check your credentials. / كلمة المرور غير صحيحة.');
      }
    }, 500);
  };

  // Step 2: Google Sign In with Firebase Auth
  const handleGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const signedEmail = (user.email || '').trim().toLowerCase();

      if (signedEmail === AUTHORIZED_EMAIL.toLowerCase()) {
        onSuccessLogin(AUTHORIZED_EMAIL);
      } else {
        await signOut(auth);
        setErrorMsg(`Unauthorized Google Account: ${signedEmail}. Only ${AUTHORIZED_EMAIL} is authorized to access this private workspace.`);
      }
    } catch (err: any) {
      console.warn('Firebase Google Auth:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled: The Google sign-in window was closed.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Browser blocked popup window. Please allow popups or use the Password sign-in option below.');
      } else {
        // In iframe environments or restricted domains where popups can fail, fallback smoothly
        setErrorMsg(`Google Auth message: ${err.message || 'Unable to open Google sign-in'}. You can also use the Password tab to enter directly.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset back to Step 1
  const handleBackToIdentity = () => {
    setStep('identity');
    setPasswordInput('');
    setErrorMsg(null);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 md:p-8 transition-colors ${
      isDarkMode ? 'bg-[#121110] text-[#F4F2ED]' : 'bg-[#F7F5F0] text-[#111111]'
    }`}>
      {/* Top Header Bar */}
      <header className={`flex items-center justify-between pb-4 border-b ${
        isDarkMode ? 'border-neutral-800' : 'border-neutral-300'
      }`}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-current">
            ZAK / GROWTH OPERATOR
          </span>
          <span className="font-mono text-[11px] opacity-60 hidden sm:inline">
            // INTERNAL OPERATOR WORKSPACE
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
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-700" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </header>

      {/* Main Login Card (Paper Style) */}
      <main className="flex-1 flex items-center justify-center my-8">
        <div className={`w-full max-w-lg border p-6 md:p-10 shadow-xl relative transition-all ${
          isDarkMode 
            ? 'bg-[#1C1B19] border-neutral-700' 
            : 'bg-white border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        }`}>
          {/* Top Stamp */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-dashed border-current opacity-70">
            <span className="font-mono text-[11px] tracking-widest uppercase flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              {step === 'identity' 
                ? '[GATE 01 // OPERATOR IDENTITY CHECK]' 
                : '[GATE 02 // ACCESS CREDENTIALS]'}
            </span>
            <span className="font-mono text-[11px] tracking-widest uppercase">
              {step === 'identity' ? 'STEP 1/2' : 'STEP 2/2'}
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Private Executive <span className="paper-highlight-blue px-2 italic font-normal text-white">Dashboard</span>
            </h1>
            <p className="text-sm font-sans opacity-70 leading-relaxed mt-2">
              {step === 'identity' 
                ? 'Restricted workspace. Enter your operator email to verify authorization.'
                : 'Identity verified. Complete authentication using your preferred secure method.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 text-xs font-mono rounded border border-red-500 bg-red-500/10 text-red-500 flex items-start gap-2.5 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* ========================================================
              STEP 1: IDENTITY FIRST GATE (Email Verification)
             ======================================================== */}
          {step === 'identity' && (
            <form onSubmit={handleIdentitySubmit} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs font-mono mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>التحقق من الصلاحية: أدخل البريد الإلكتروني للمتابعة</span>
              </div>

              {/* Operator Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1.5 flex items-center justify-between">
                  <span>Operator Email (البريد الإلكتروني)</span>
                  <span className="text-[10px] opacity-60">Press Enter ↵</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. itsmezaki77@gmail.com"
                    className={`w-full pl-9 pr-3 py-3 text-sm font-mono border rounded focus:outline-none ${
                      isDarkMode 
                        ? 'bg-[#141312] border-neutral-700 focus:border-blue-500 text-white' 
                        : 'bg-white border-neutral-400 focus:border-black text-black'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all mt-4 ${
                  isDarkMode
                    ? 'bg-white text-black hover:bg-neutral-200 border-white'
                    : 'bg-neutral-950 text-white hover:bg-neutral-800 border-neutral-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <span>{isLoading ? 'Verifying Identity...' : 'Verify Operator Email (Enter ↵)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] font-mono opacity-50 text-center pt-2">
                Sign-in methods (Google & Password) unlock only after email verification.
              </p>
            </form>
          )}

          {/* ========================================================
              STEP 2: AUTHENTICATION OPTIONS
             ======================================================== */}
          {step === 'authenticate' && (
            <div className="space-y-5">
              {/* Verified Identity Badge */}
              <div className={`p-3.5 border rounded flex items-center justify-between ${
                isDarkMode ? 'bg-[#141312] border-emerald-500/40' : 'bg-emerald-50 border-emerald-600'
              }`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                      Operator Verified
                    </div>
                    <div className="text-xs font-mono truncate font-medium">
                      {AUTHORIZED_EMAIL}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBackToIdentity}
                  className="text-xs font-mono underline opacity-70 hover:opacity-100 flex items-center gap-1 shrink-0 ml-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>تغيير</span>
                </button>
              </div>

              {/* Tab Selector: Password vs Google */}
              <div className="grid grid-cols-2 gap-2 p-1 border rounded font-mono text-xs border-current">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('password');
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authMethod === 'password'
                      ? isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Email & Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('google');
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authMethod === 'google'
                      ? isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
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
                  <span>Google Sign-In</span>
                </button>
              </div>

              {/* Method A: Password */}
              {authMethod === 'password' ? (
                <form onSubmit={handlePasswordSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1.5">
                      Verified Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input
                        type="email"
                        disabled
                        value={AUTHORIZED_EMAIL}
                        className={`w-full pl-9 pr-3 py-3 text-sm font-mono border rounded opacity-80 cursor-not-allowed ${
                          isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider opacity-70 mb-1.5 flex items-center justify-between">
                      <span>Password</span>
                      <span className="text-[10px] opacity-60">Enter password ↵</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter your operator password"
                        className={`w-full pl-9 pr-10 py-3 text-sm font-mono border rounded focus:outline-none ${
                          isDarkMode 
                            ? 'bg-[#141312] border-neutral-700 focus:border-blue-500 text-white' 
                            : 'bg-white border-neutral-400 focus:border-black text-black'
                        }`}
                      />
                      <button
                        type="button"
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
                    disabled={isLoading}
                    className={`w-full py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all mt-2 ${
                      isDarkMode
                        ? 'bg-white text-black hover:bg-neutral-200 border-white'
                        : 'bg-neutral-950 text-white hover:bg-neutral-800 border-neutral-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <span>{isLoading ? 'Verifying Password...' : 'Sign In To Workspace ↵'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Method B: Google Sign-In */
                <form onSubmit={handleGoogleSignIn} className="space-y-4">
                  <div className="p-4 border rounded font-mono text-xs space-y-2 border-current/30">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Ready to authenticate with Google:</span>
                    </div>
                    <div className="text-[13px] font-semibold text-blue-600 dark:text-blue-400">
                      {AUTHORIZED_EMAIL}
                    </div>
                    <div className="text-[11px] opacity-70">
                      Click below to confirm session with your authorized Google Account.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 border transition-all ${
                      isDarkMode
                        ? 'bg-white text-black hover:bg-neutral-200 border-white'
                        : 'bg-neutral-950 text-white hover:bg-neutral-800 border-neutral-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
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
                    <span>{isLoading ? 'Authorizing Google...' : 'Continue With Google Account ↵'}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Bottom Security Assurance */}
          <div className={`mt-8 pt-4 border-t border-dashed flex items-center justify-between text-[11px] font-mono opacity-60 ${
            isDarkMode ? 'border-neutral-800' : 'border-neutral-300'
          }`}>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Two-Stage Access Gate</span>
            </span>
            <span>Operator Level Only</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`pt-4 border-t text-center font-mono text-xs opacity-50 ${
        isDarkMode ? 'border-neutral-800' : 'border-neutral-300'
      }`}>
        &copy; {new Date().getFullYear()} ZAK &bull; GROWTH OPERATOR &bull; ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};
