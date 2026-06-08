/** Strips Vietnamese diacritics for case-insensitive title comparison. */
function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

/** Normalizes a title for strict duplicate detection. */
export function normalizeTitle(title: string | undefined): string {
  if (!title) return '';

  return stripDiacritics(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Order-independent word key for fuzzy duplicate detection. */
export function fuzzyNormalizeTitle(title: string | undefined): string {
  if (!title) return '';

  return normalizeTitle(title)
    .split(' ')
    .filter((w) => w.length > 2)
    .sort()
    .join('|');
}
