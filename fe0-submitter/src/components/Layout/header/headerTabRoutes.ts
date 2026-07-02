import type { HeaderNavTabId } from './headerNav.js';

/** Shared copy for header tabs not yet implemented in the submitter portal. */
export const FEATURE_COMING_SOON_MESSAGE =
  'Tính năng này sẽ được cập nhật trong phiên bản tiếp theo';

/** Header tabs that show the coming-soon placeholder (all except Đề tài KHCN). */
export const COMING_SOON_HEADER_TAB_IDS = [
  'sang-kien',
  'ho-so-y-duc',
  'bai-bao-quoc-te',
  'gio-nckh',
  'hoi-nghi-hoi-thao',
  'thong-ke-so-lieu',
  'chuyen-giao-cong-nghe',
] as const satisfies readonly HeaderNavTabId[];

export const HEADER_TAB_ROUTE_MAP: Record<HeaderNavTabId, string> = {
  'de-tai-khcn': '/de-tai',
  'sang-kien': '/sang-kien',
  'ho-so-y-duc': '/ho-so-y-duc',
  'bai-bao-quoc-te': '/bai-bao-quoc-te',
  'gio-nckh': '/gio-nckh',
  'hoi-nghi-hoi-thao': '/hoi-nghi-hoi-thao',
  'thong-ke-so-lieu': '/thong-ke-so-lieu',
  'chuyen-giao-cong-nghe': '/chuyen-giao-cong-nghe',
};

export function resolveActiveTabFromPath(pathname: string): HeaderNavTabId | null {
  for (const tabId of COMING_SOON_HEADER_TAB_IDS) {
    const route = HEADER_TAB_ROUTE_MAP[tabId];
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return tabId;
    }
  }

  if (pathname.startsWith('/de-tai') || pathname.startsWith('/thong-bao')) {
    return 'de-tai-khcn';
  }

  return null;
}

export function isComingSoonHeaderPath(pathname: string): boolean {
  return COMING_SOON_HEADER_TAB_IDS.some((tabId) => {
    const route = HEADER_TAB_ROUTE_MAP[tabId];
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}
