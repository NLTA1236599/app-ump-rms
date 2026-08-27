import { extractReviewYear } from './reviewYear.js';

export const PROJECT_CODE_FIXED_PART = '03';

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

function formatProjectCodeSeq(seq: string | number): string {
  const digits = String(seq).replace(/\D/g, '');
  if (!digits) return '';
  const n = Number(digits);
  if (!Number.isInteger(n) || n < 1) return '';
  return String(n).padStart(3, '0');
}

export function formatProjectCode(
  year: string | number,
  unit: string | number,
  seq: string | number,
): string {
  const y = String(year).replace(/\D/g, '').slice(0, 4);
  const u = String(unit).replace(/\D/g, '').padStart(2, '0').slice(-2);
  const s = formatProjectCodeSeq(seq);
  if (y.length !== 4 || u.length !== 2 || !s) return '';
  return `${y}.${PROJECT_CODE_FIXED_PART}.${u}.${s}`;
}

/** Fill `projectCode` as `{năm}.03.{mã đơn vị}.{STT}` when sequence and unit are known. */
export function applyComposedProjectCode(data: Record<string, unknown>): void {
  const seq = Number(data.registrationSequenceNumber);
  const year =
    Number(data.registrationSequenceYear) ||
    extractReviewYear(String(data.reviewBatch ?? '')) ||
    NaN;
  const unit = facultyUnitToCodeFromDepartment(String(data.department ?? ''));
  if (!Number.isInteger(seq) || seq < 1 || !Number.isInteger(year) || year < 1990 || !unit) {
    return;
  }
  data.projectCode = formatProjectCode(year, unit, seq);
}
