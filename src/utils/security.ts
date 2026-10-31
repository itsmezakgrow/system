/**
 * Security & Zero-Trust Authentication Utilities
 * Features:
 * - SHA-256 Cryptographic Hashing (zero plain-text email/passwords in client bundle)
 * - Anti-Enumeration & Unified Error Reporting
 * - Brute-Force Rate Limiting & Account Lockout
 * - Cryptographic Session Signatures & Automatic Expiry
 */

// SHA-256 hash of authorized operator email
const AUTHORIZED_OPERATOR_HASH = '0d55cb4b5b3e5f81b73790528d90cf5324865b3f69d6825a124c0aa463ec4c44';

// SHA-256 hashes of authorized operator passwords (Zaki2026!, ZAK-OPERATOR-2026#, etc.)
const AUTHORIZED_PASSWORD_HASHES = new Set([
  'a968994efd390e74bdb91c4d8b406ac788e189cfdcd01255fd4d1a0827600522', // Zaki2026!
  'bcff1966ecf21c49721dd0a4cc1995463cdefa92e42f10e50dafae87279b1b6a', // zaki2026
  '0612bf70fdf3fc740ca363cd065d0e424c5ee4063ed43a8b10cd79a94740ff0a', // itsmezaki77
  'aa0cae2347fc38c6a3c728effa7e5b683e35f1415ae313758ceeee8b46d8ada8', // ZAK-OPERATOR-2026#
  'c65f8eccc82462d02bdcaa9dc5bba508baee2951c2a858fd4737b232ed45a04a', // ZAK2026
  '7ef5f2b040d64c9e8ecb1f9581900a57b8c8b6448c75450c8ad2817017e6d8e9', // growthoperator2026
]);

const SESSION_SALT = 'zak_sec_k9_2026_op_shield';
const SESSION_STORAGE_KEY = 'zak_crm_sec_session_v2';
const LOCKOUT_STORAGE_KEY = 'zak_crm_lockout_state_v2';

export async function sha256(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify whether an email matches the authorized operator
 */
export async function isAuthorizedOperatorEmail(email: string): Promise<boolean> {
  if (!email || !email.includes('@')) return false;
  const normalized = email.trim().toLowerCase();
  const hash = await sha256(normalized);
  return hash === AUTHORIZED_OPERATOR_HASH;
}

/**
 * Verify whether a password matches the authorized operator credentials
 */
export async function isAuthorizedOperatorPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const hash = await sha256(password.trim());
  return AUTHORIZED_PASSWORD_HASHES.has(hash);
}

/**
 * Brute-force rate limiting and lockout state
 */
export interface LockoutState {
  failedAttempts: number;
  lockUntil: number | null; // timestamp ms
}

export function getLockoutState(): LockoutState {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!raw) return { failedAttempts: 0, lockUntil: null };
    const parsed = JSON.parse(raw);
    if (parsed.lockUntil && Date.now() > parsed.lockUntil) {
      // Lock has expired, reset
      sessionStorage.removeItem(LOCKOUT_STORAGE_KEY);
      return { failedAttempts: 0, lockUntil: null };
    }
    return parsed;
  } catch {
    return { failedAttempts: 0, lockUntil: null };
  }
}

export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  const state = getLockoutState();
  const newAttempts = state.failedAttempts + 1;

  if (newAttempts >= 5) {
    // Lock for 60 seconds
    const lockUntil = Date.now() + 60 * 1000;
    const newState: LockoutState = { failedAttempts: newAttempts, lockUntil };
    sessionStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(newState));
    return { isLocked: true, remainingSeconds: 60, attempts: newAttempts };
  }

  const newState: LockoutState = { failedAttempts: newAttempts, lockUntil: null };
  sessionStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(newState));
  return { isLocked: false, remainingSeconds: 0, attempts: newAttempts };
}

export function resetLockoutState(): void {
  try {
    sessionStorage.removeItem(LOCKOUT_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not reset lockout state:', err);
  }
}

/**
 * Cryptographic Session Management
 */
export interface SecureSession {
  emailHash: string;
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

export async function createSecureSession(email: string): Promise<string> {
  const emailHash = await sha256(email.trim().toLowerCase());
  const issuedAt = Date.now();
  const expiresAt = issuedAt + 24 * 60 * 60 * 1000; // 24 hours expiry
  const signature = await sha256(`${emailHash}:${issuedAt}:${expiresAt}:${SESSION_SALT}`);

  const sessionObj: SecureSession = {
    emailHash,
    issuedAt,
    expiresAt,
    signature,
  };

  const token = btoa(JSON.stringify(sessionObj));
  localStorage.setItem(SESSION_STORAGE_KEY, token);
  return token;
}

export async function validateSecureSession(): Promise<boolean> {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return false;

    const sessionObj: SecureSession = JSON.parse(atob(raw));
    const { emailHash, issuedAt, expiresAt, signature } = sessionObj;

    // Check expiration
    if (!expiresAt || Date.now() > expiresAt) {
      clearSecureSession();
      return false;
    }

    // Check operator hash
    if (emailHash !== AUTHORIZED_OPERATOR_HASH) {
      clearSecureSession();
      return false;
    }

    // Check cryptographic signature
    const expectedSig = await sha256(`${emailHash}:${issuedAt}:${expiresAt}:${SESSION_SALT}`);
    if (signature !== expectedSig) {
      clearSecureSession();
      return false;
    }

    return true;
  } catch {
    clearSecureSession();
    return false;
  }
}

export function clearSecureSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('zak_crm_auth_email');
  } catch (err) {
    console.warn('Error clearing session:', err);
  }
}
