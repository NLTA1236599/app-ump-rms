import { formatDate } from '../DataTable/formatDate.js';

const MIN_YEAR = 1990;
const MAX_YEAR = 2100;

function isPlausibleYear(year: number): boolean {
  return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;
}

function yearsFromText(raw: string): number[] {
  const academic = raw.match(/^(\d{4})\s*[-–\/]\s*(\d{4})$/);
  if (academic) {
    return [Number(academic[1]), Number(academic[2])].filter(isPlausibleYear);
  }

  const found = [...raw.matchAll(/\b(19|20)\d{2}\b/g)]
    .map((m) => Number(m[0]))
    .filter(isPlausibleYear);

  return [...new Set(found)];
}

/** Extracts every plausible 4-digit year from dates, academic years, or free text. */
export function extractYears(value: string | number | null | undefined): number[] {
  if (value == null || value === '') return [];

  if (typeof value === 'number') {
    if (isPlausibleYear(value)) return [value];
    const formatted = formatDate(value);
    return formatted ? yearsFromText(formatted) : [];
  }

  const raw = String(value).trim();
  if (!raw) return [];

  if (/^\d{4}$/.test(raw)) {
    const year = Number(raw);
    return isPlausibleYear(year) ? [year] : [];
  }

  const fromRaw = yearsFromText(raw);
  if (fromRaw.length > 0) return fromRaw;

  const formatted = formatDate(raw);
  return formatted && formatted !== raw ? yearsFromText(formatted) : [];
}

/** Extracts a 4-digit year from project dates or acceptance year fields. */
export function extractYear(value: string | number | null | undefined): number | null {
  return extractYears(value)[0] ?? null;
}

type ProjectYearSource = {
  startDate?: string | number | null;
  endDate?: string | number | null;
  acceptanceYear?: string;
  acceptanceAcademicYear?: string;
  contractDate?: string;
  reviewBatch?: string;
  acceptanceMeetingDate?: string | number | null;
};

function yearSourceValues(project: ProjectYearSource): Array<string | number | null | undefined> {
  return [
    project.startDate,
    project.endDate,
    project.acceptanceYear,
    project.acceptanceAcademicYear,
    project.contractDate,
    project.reviewBatch,
    project.acceptanceMeetingDate,
  ];
}

/** All years associated with a project (start, end, academic year, …). */
export function getProjectYears(project: ProjectYearSource): number[] {
  const years = new Set<number>();
  for (const value of yearSourceValues(project)) {
    for (const year of extractYears(value)) years.add(year);
  }
  return [...years].sort((a, b) => a - b);
}

export function getProjectYear(project: ProjectYearSource): number | null {
  for (const value of yearSourceValues(project)) {
    const year = extractYear(value);
    if (year !== null) return year;
  }
  return null;
}
