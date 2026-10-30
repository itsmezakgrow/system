export function parseSocialHandle(input: string, platform: 'Instagram' | 'TikTok' | 'YouTube' | 'X' = 'Instagram'): {
  handle: string;
  profileUrl: string;
  cleanUsername: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { handle: '', profileUrl: '', cleanUsername: '' };
  }

  // Remove tracking parameters if present (e.g., ?igsh=..., ?utm_source=...)
  const sanitized = trimmed.split('?')[0].replace(/\/+$/, '');

  // If full URL was pasted
  if (sanitized.includes('instagram.com/')) {
    const match = sanitized.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
    if (match && match[1]) {
      const username = match[1].replace(/\/$/, '');
      return {
        handle: `@${username}`,
        profileUrl: `https://instagram.com/${username}`,
        cleanUsername: username,
      };
    }
  }

  if (sanitized.includes('tiktok.com/@')) {
    const match = sanitized.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/);
    if (match && match[1]) {
      const username = match[1].replace(/\/$/, '');
      return {
        handle: `@${username}`,
        profileUrl: `https://tiktok.com/@${username}`,
        cleanUsername: username,
      };
    }
  }

  if (sanitized.includes('youtube.com/@') || sanitized.includes('youtube.com/c/')) {
    const match = sanitized.match(/youtube\.com\/(?:@|c\/)([a-zA-Z0-9._-]+)/);
    if (match && match[1]) {
      const username = match[1].replace(/\/$/, '');
      return {
        handle: `@${username}`,
        profileUrl: `https://youtube.com/@${username}`,
        cleanUsername: username,
      };
    }
  }

  // Otherwise, it's a plain name or handle like "@coach_yassine" or "saad.khaledd"
  const cleanUsername = sanitized.replace(/^@+/, '').replace(/\/+$/, '').trim();
  const handle = cleanUsername ? `@${cleanUsername}` : '';

  let baseUrl = 'https://instagram.com/';
  if (platform === 'TikTok') baseUrl = 'https://tiktok.com/@';
  if (platform === 'YouTube') baseUrl = 'https://youtube.com/@';
  if (platform === 'X') baseUrl = 'https://x.com/';

  return {
    handle,
    profileUrl: cleanUsername ? `${baseUrl}${cleanUsername}` : '',
    cleanUsername,
  };
}

/**
 * Automatically extracts and formats a human-readable coach/creator name
 * from an Instagram handle or profile URL.
 * e.g.:
 * - 'coach_yassine_mouhcine' -> 'Coach Yassine Mouhcine'
 * - 'https://www.instagram.com/saad.khaledd/' -> 'Saad Khaledd'
 * - 'trainwithamine' -> 'Train With Amine'
 * - 'yassir_zineelabidine' -> 'Yassir Zineelabidine'
 */
export function deriveNameFromHandle(input: string): string {
  if (!input) return '';
  const parsed = parseSocialHandle(input);
  let raw = parsed.cleanUsername || input.trim();

  if (!raw) return '';

  // Remove leading @ if still present
  raw = raw.replace(/^@+/, '');

  // Handle common compound prefixes like 'trainwith', 'fitwith', 'coach', etc.
  raw = raw.replace(/^trainwith([a-zA-Z0-9])/i, 'Train With $1');
  raw = raw.replace(/^fitwith([a-zA-Z0-9])/i, 'Fit With $1');
  raw = raw.replace(/^coachingby([a-zA-Z0-9])/i, 'Coaching By $1');

  // Split by common delimiters (dots, underscores, hyphens, spaces)
  const tokens = raw
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((word) => {
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

  return tokens.join(' ').trim();
}

/**
 * Parses user input for followers, supporting:
 * - '20K', '20k' -> 20,000
 * - '20' (with K unit default) -> 20,000
 * - '25.5k' -> 25,500
 * - '1.2M' -> 1,200,000
 * - '20000' -> 20,000
 */
export function parseFollowerInput(input: string | number, isKDefault: boolean = true): number {
  if (typeof input === 'number') {
    return isNaN(input) || input < 0 ? 0 : Math.round(input);
  }

  const clean = String(input).trim().replace(/,/g, '').toLowerCase();
  if (!clean) return 0;

  // Check for 'm' suffix (Millions)
  if (clean.includes('m')) {
    const num = parseFloat(clean.replace('m', ''));
    return isNaN(num) ? 0 : Math.round(num * 1_000_000);
  }

  // Check for 'k' suffix (Thousands)
  if (clean.includes('k')) {
    const num = parseFloat(clean.replace('k', ''));
    return isNaN(num) ? 0 : Math.round(num * 1_000);
  }

  const rawNum = parseFloat(clean);
  if (isNaN(rawNum) || rawNum < 0) return 0;

  // If isKDefault is true and user typed a small number (< 1000, like '20' or '55.5'),
  // treat it as Thousands (20K = 20,000)
  if (isKDefault && rawNum < 1000) {
    return Math.round(rawNum * 1_000);
  }

  return Math.round(rawNum);
}

/**
 * Formats a numeric follower count into readable K/M shorthand or full string.
 */
export function formatFollowersDisplay(num: number): string {
  if (!num || isNaN(num) || num <= 0) return '0';
  if (num >= 1_000_000) {
    const millions = (num / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${millions}M`;
  }
  if (num >= 1_000) {
    const thousands = (num / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${thousands}K`;
  }
  return num.toLocaleString();
}

