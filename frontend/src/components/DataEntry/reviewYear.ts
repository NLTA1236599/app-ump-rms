const MIN_YEAR = 1990;
const MAX_YEAR = 2100;
const TRAILING_YEAR_RE = /(\d{4})\s*$/;

/** Year of a review batch such as `Đợt 2/2026` → 2026. */
export function extractReviewYear(reviewBatch: string | null | undefined): number | null {
  if (!reviewBatch) return null;
  const match = TRAILING_YEAR_RE.exec(reviewBatch.trim());
  if (!match) return null;
  const year = Number(match[1]);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) return null;
  return year;
}
