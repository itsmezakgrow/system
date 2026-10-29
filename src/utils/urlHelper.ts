export function parseSocialHandle(input: string, platform: 'Instagram' | 'TikTok' | 'YouTube' | 'X' = 'Instagram'): {
  handle: string;
  profileUrl: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { handle: '', profileUrl: '' };
  }

  // If full URL was pasted
  if (trimmed.includes('instagram.com/')) {
    const match = trimmed.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
    if (match && match[1]) {
      const username = match[1].replace(/\/$/, '');
      return {
        handle: `@${username}`,
        profileUrl: `https://instagram.com/${username}`,
      };
    }
  }

  if (trimmed.includes('tiktok.com/@')) {
    const match = trimmed.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/);
    if (match && match[1]) {
      const username = match[1].replace(/\/$/, '');
      return {
        handle: `@${username}`,
        profileUrl: `https://tiktok.com/@${username}`,
      };
    }
  }

  if (trimmed.includes('youtube.com/@') || trimmed.includes('youtube.com/c/')) {
    const match = trimmed.match(/youtube\.com\/(?:@|c\/)([a-zA-Z0-9._-]+)/);
    if (match && match[1]) {
      const username = match[1].replace(/\/$/, '');
      return {
        handle: `@${username}`,
        profileUrl: `https://youtube.com/@${username}`,
      };
    }
  }

  // Otherwise, it's a plain name or handle like "@zaki_fit" or "zaki_fit"
  const cleanUsername = trimmed.replace(/^@+/, '').replace(/\/+$/, '').trim();
  const handle = `@${cleanUsername}`;

  let baseUrl = 'https://instagram.com/';
  if (platform === 'TikTok') baseUrl = 'https://tiktok.com/@';
  if (platform === 'YouTube') baseUrl = 'https://youtube.com/@';
  if (platform === 'X') baseUrl = 'https://x.com/';

  return {
    handle,
    profileUrl: `${baseUrl}${cleanUsername}`,
  };
}
