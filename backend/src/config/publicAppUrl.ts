const FALLBACK_PUBLIC_SITE = 'https://www.ump-khcn.com';

function isPublicHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
    if (host.endsWith('.local') || host.endsWith('.internal')) return false;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Public HTTPS origin for links/headers in outbound mail.
 * Localhost / private URLs are skipped — they are a strong junk-mail signal.
 */
export function publicAppBaseUrl(): string {
  const candidates = [
    process.env.APP_BASE_URL,
    ...(process.env.FRONTEND_ORIGIN ?? '').split(','),
    FALLBACK_PUBLIC_SITE,
  ];

  for (const raw of candidates) {
    const value = (raw ?? '').trim().replace(/\/$/, '');
    if (value && isPublicHttpsUrl(value)) return value;
  }

  return FALLBACK_PUBLIC_SITE;
}
