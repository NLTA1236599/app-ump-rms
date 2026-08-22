/** Strips Vietnamese diacritics for case-insensitive title comparison. */
function stripDiacritics(text: string): string {
  return text
    .normalize('NFC')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
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

/** Significant words used for relative matching (drops particles like "ve", "cua"). */
export function significantWords(title: string | undefined): string[] {
  return normalizeTitle(title)
    .split(' ')
    .filter((w) => w.length > 2);
}

/** Order-independent word key for exact-set grouping. */
export function fuzzyNormalizeTitle(title: string | undefined): string {
  if (!title) return '';

  return significantWords(title).sort().join('|');
}

/**
 * Overlap coefficient |A ∩ B| / min(|A|, |B|).
 * 1 = one title's words are fully contained in the other; 0 = no shared words.
 */
export function titleOverlap(a: string | undefined, b: string | undefined): number {
  const wordsA = new Set(significantWords(a));
  const wordsB = new Set(significantWords(b));

  if (wordsA.size === 0 || wordsB.size === 0) {
    const na = normalizeTitle(a);
    const nb = normalizeTitle(b);
    return na && na === nb ? 1 : 0;
  }

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection += 1;
  }

  return intersection / Math.min(wordsA.size, wordsB.size);
}
