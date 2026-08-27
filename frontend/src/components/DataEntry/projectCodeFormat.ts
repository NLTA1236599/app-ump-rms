import { extractReviewYear } from './reviewYear.js';

/** Fixed second segment of mã đề tài. */
export const PROJECT_CODE_FIXED_PART = '03';

/** Canonical: `{năm}.03.{mã đơn vị}.{số thứ tự}` e.g. `2026.03.01.303`. */
export const PROJECT_CODE_PATTERN = /^\d{4}\.03\.\d{2}\.\d{3,}$/;

const PARSE_PATTERN = /^(\d{4})\.(\d{2})\.(\d{2})\.(\d+)$/;

export type ParsedProjectCode = {
  year: string;
  fixed: string;
  unit: string;
  seq: string;
};

/** Named khoa/trường → 2-digit unit code. Longer names first. */
const NAMED_UNIT_CODES: Array<[string, string]> = [
  ['Trường Điều dưỡng', '05'],
  ['Khoa Răng Hàm Mặt', '02'],
  ['Khoa Y học cổ truyền', '04'],
  ['Khoa Y tế công cộng', '06'],
  ['Khoa học cơ bản', '07'],
  ['Trường Dược', '03'],
  ['Trường Y', '01'],
];

function foldUnitName(value: string): string {
  return value.replace(/[–—−]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Map Khoa/Đơn vị name to the 2-digit unit segment [3]. */
export function facultyUnitToCode(unit: string | null | undefined): string {
  const raw = (unit ?? '').trim();
  if (!raw) return '';

  if (/^bệnh viện\s+đhyd/i.test(raw) || (/bệnh viện/i.test(raw) && /\bCS\s*[123]\b/i.test(raw))) {
    return '08';
  }
  if (/^trung tâm/i.test(raw)) return '10';
  if (/^phòng/i.test(raw)) return '09';

  const folded = foldUnitName(raw);
  for (const [name, code] of NAMED_UNIT_CODES) {
    const needle = foldUnitName(name);
    if (folded === needle || folded.includes(needle)) return code;
  }

  return '09';
}

export function facultyUnitToCodeFromDepartment(department: string | null | undefined): string {
  const first = (department ?? '').split(/[;,/]/)[0]?.trim() ?? '';
  return facultyUnitToCode(first);
}

export function parseProjectCode(raw: string | null | undefined): ParsedProjectCode {
  const match = PARSE_PATTERN.exec((raw ?? '').trim());
  if (!match) return { year: '', fixed: '', unit: '', seq: '' };
  return {
    year: match[1] ?? '',
    fixed: match[2] ?? '',
    unit: match[3] ?? '',
    seq: match[4] ?? '',
  };
}

/** Pad sequence to at least 3 digits (`5` → `005`, `303` → `303`). */
export function formatProjectCodeSeq(seq: string | number): string {
  const digits = String(seq).replace(/\D/g, '');
  if (!digits) return '';
  const n = Number(digits);
  if (!Number.isInteger(n) || n < 1) return '';
  return String(n).padStart(3, '0');
}

export function formatProjectCodeUnit(unit: string | number): string {
  const digits = String(unit).replace(/\D/g, '');
  if (!digits) return '';
  return digits.padStart(2, '0').slice(-2);
}

export function formatProjectCode(
  year: string | number,
  unit: string | number,
  seq: string | number,
): string {
  const y = String(year).replace(/\D/g, '').slice(0, 4);
  const u = formatProjectCodeUnit(unit);
  const s = formatProjectCodeSeq(seq);
  if (y.length !== 4 || !u || !s) return '';
  return `${y}.${PROJECT_CODE_FIXED_PART}.${u}.${s}`;
}

export function composeProjectCode(parts: { year: string; unit: string; seq: string }): string {
  return formatProjectCode(parts.year, parts.unit, parts.seq);
}

export function isCompleteProjectCode(value: string): boolean {
  return PROJECT_CODE_PATTERN.test(value.trim());
}

export function resolveProjectCodeYear(form: {
  reviewBatch: string;
  contractYear: string;
  sequenceYear: string;
  projectCode: string;
}): string {
  const fromBatch = extractReviewYear(form.reviewBatch);
  if (fromBatch) return String(fromBatch);
  const fallback = form.contractYear.trim() || form.sequenceYear.trim();
  if (fallback) return fallback;
  return parseProjectCode(form.projectCode).year;
}

export function resolveProjectCodeUnit(form: {
  facultyUnits: string[];
  projectCode: string;
}): string {
  const fromFaculty = facultyUnitToCode(form.facultyUnits[0] ?? '');
  if (fromFaculty) return fromFaculty;
  return parseProjectCode(form.projectCode).unit;
}

export function resolveProjectCodeSeq(form: {
  sequenceNumber: string;
  contractSeq: string;
  projectCode: string;
}): string {
  const live = form.sequenceNumber.trim() || form.contractSeq.trim();
  if (live) return live;
  return parseProjectCode(form.projectCode).seq;
}
