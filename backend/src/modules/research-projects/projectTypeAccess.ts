/** Canonical project type tags — same list as Data Entry on port 5173. */
export const PROJECT_TYPE_TAGS = [
  'Loại A',
  'Loại B',
  'Loại C',
  'Loại D',
  'Tự túc kinh phí',
  'Sinh viên',
  'Khác',
] as const;

export type ProjectTypeTag = (typeof PROJECT_TYPE_TAGS)[number];

const ALLOWED = new Set<string>(PROJECT_TYPE_TAGS);

export function sanitizeProjectTypes(values: unknown[]): string[] {
  return [...new Set(values.map((value) => String(value).trim()).filter((tag) => ALLOWED.has(tag)))];
}

export function parseProjectCategories(categories: unknown): string[] {
  if (typeof categories !== 'string' || !categories.trim()) return [];
  return categories
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Empty allowed set = every type. Otherwise the project must include at least one allowed tag. */
export function projectMatchesAllowedTypes(
  categories: unknown,
  allowed: Set<string>,
): boolean {
  if (allowed.size === 0) return true;
  const tags = parseProjectCategories(categories);
  if (tags.length === 0) return false;
  return tags.some((tag) => allowed.has(tag));
}
