import { isoToDisplay } from './dateHelpers.js';
import { extractReviewYear } from './reviewYear.js';

export const CONTRACT_FIXED_PART = 'HĐ-ĐHYD';

const CONTRACT_PATTERN =
  /^(\d+)\s*\/\s*(\d{4})\s*\/\s*H[ĐD]-ĐHYD(?:\s*[,;]?\s*(?:ký|kỳ)\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4}))?/i;

export type ParsedContractNumber = {
  seq: string;
  year: string;
  dateDisplay: string;
};

/** `303/2026/HĐ-ĐHYD ký ngày 20/03/2026` */
export function formatContractNumber(
  seq: string | number,
  year: string | number,
  dateDisplay: string,
): string {
  const base = `${String(seq).trim()}/${String(year).trim()}/${CONTRACT_FIXED_PART}`;
  const date = dateDisplay.trim();
  return date ? `${base} ký ngày ${date}` : base;
}

/** Accepts `20/3/2023` or `20/03/2023` → padded `dd/mm/yyyy`. */
export function padDdMmYyyy(raw: string): string {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw.trim());
  if (!match) return '';
  return `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
}

export function parseContractNumber(raw: string | null | undefined): ParsedContractNumber {
  const text = (raw ?? '').trim();
  if (!text) return { seq: '', year: '', dateDisplay: '' };

  const match = CONTRACT_PATTERN.exec(text);
  if (!match) return { seq: '', year: '', dateDisplay: '' };

  return {
    seq: match[1] ?? '',
    year: match[2] ?? '',
    dateDisplay: match[3] ? padDdMmYyyy(match[3]) : '',
  };
}

export function composeContractNumber(parts: {
  seq: string;
  year: string;
  dateIso: string;
}): string {
  if (!parts.seq.trim() || !parts.year.trim()) return '';
  return formatContractNumber(parts.seq, parts.year, isoToDisplay(parts.dateIso));
}

export function resolveContractSeq(form: {
  sequenceNumber: string;
  contractSeq: string;
}): string {
  return form.sequenceNumber.trim() || form.contractSeq.trim();
}

export function resolveContractYear(form: {
  reviewBatch: string;
  contractYear: string;
  sequenceYear: string;
}): string {
  const fromBatch = extractReviewYear(form.reviewBatch);
  if (fromBatch) return String(fromBatch);
  return form.contractYear.trim() || form.sequenceYear.trim();
}

const APPENDIX_PATTERN =
  /^PL\s*(\d+)\s*\/\s*(\d{4})\s*\/\s*H[ĐD]-ĐHYD(?:\s*[,;]?\s*(?:ký|kỳ)\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4}))?/i;

export type ParsedContractAppendix = {
  seq: string;
  year: string;
  dateDisplay: string;
};

/** `1` → `01`, `12` → `12`. */
export function formatAppendixSeq(seq: string | number): string {
  const digits = String(seq).replace(/\D/g, '');
  if (!digits) return '';
  const n = Number(digits);
  if (!Number.isInteger(n) || n < 1) return '';
  return String(n).padStart(2, '0');
}

/** `PL01/2026/HĐ-ĐHYD ký ngày 20/03/2026` */
export function formatContractAppendix(
  seq: string | number,
  year: string | number,
  dateDisplay = '',
): string {
  const s = formatAppendixSeq(seq);
  const y = String(year).replace(/\D/g, '').slice(0, 4);
  if (!s || y.length !== 4) return '';
  const base = `PL${s}/${y}/${CONTRACT_FIXED_PART}`;
  const date = dateDisplay.trim();
  return date ? `${base} ký ngày ${date}` : base;
}

export function parseContractAppendix(raw: string | null | undefined): ParsedContractAppendix {
  const text = (raw ?? '').trim();
  if (!text) return { seq: '', year: '', dateDisplay: '' };

  const match = APPENDIX_PATTERN.exec(text);
  if (match) {
    return {
      seq: match[1] ?? '',
      year: match[2] ?? '',
      dateDisplay: match[3] ? padDdMmYyyy(match[3]) : '',
    };
  }

  const loose = /^PL\s*(\d+)/i.exec(text);
  if (loose) return { seq: loose[1] ?? '', year: '', dateDisplay: '' };

  return { seq: '', year: '', dateDisplay: '' };
}

function splitAppendixChunks(text: string): string[] {
  const byLookahead = text
    .split(/(?=PL\s*\d+)/i)
    .map((chunk) => chunk.replace(/^[\s;|,]+|[\s;|,]+$/g, '').trim())
    .filter(Boolean);
  if (byLookahead.length > 1) return byLookahead;
  return text
    .split(/[;\n]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function parseContractAppendices(raw: string | null | undefined): ParsedContractAppendix[] {
  const text = (raw ?? '').trim();
  if (!text) return [];
  return splitAppendixChunks(text)
    .map((chunk) => parseContractAppendix(chunk))
    .filter((parsed) => parsed.seq);
}

export function newAppendixId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `appendix-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export function createEmptyAppendix(seq = ''): {
  id: string;
  seq: string;
  year: string;
  signedAt: string;
} {
  return { id: newAppendixId(), seq, year: '', signedAt: '' };
}

export function nextAppendixSeq(items: Array<{ seq: string }>): string {
  const nums = items
    .map((item) => Number(String(item.seq).replace(/\D/g, '')))
    .filter((n) => Number.isInteger(n) && n > 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return formatAppendixSeq(max + 1);
}

export function defaultAppendixYear(form: {
  reviewBatch: string;
  contractYear: string;
  sequenceYear: string;
}): string {
  const fromBatch = extractReviewYear(form.reviewBatch);
  if (fromBatch) return String(fromBatch);
  const fromContract = form.contractYear.trim() || form.sequenceYear.trim();
  if (fromContract) return fromContract;
  return String(new Date().getFullYear());
}

export function composeContractAppendix(parts: {
  seq: string;
  year: string;
  dateIso: string;
}): string {
  if (!parts.seq.trim() || !parts.year.trim()) return '';
  return formatContractAppendix(parts.seq, parts.year, isoToDisplay(parts.dateIso));
}

/** Editable year: stored value first, else review-batch / calendar year as a default. */
export function resolveAppendixYear(form: {
  contractAppendixYear: string;
  reviewBatch: string;
  contractYear: string;
  sequenceYear: string;
  contractAppendix: string;
  contractAppendices?: Array<{ year: string }>;
}): string {
  const firstItemYear = form.contractAppendices?.[0]?.year?.trim();
  if (firstItemYear) return firstItemYear;
  if (form.contractAppendixYear.trim()) return form.contractAppendixYear.trim();
  const parsed = parseContractAppendix(form.contractAppendix).year;
  if (parsed) return parsed;
  return defaultAppendixYear(form);
}

export function getFormAppendices(form: {
  contractAppendices?: Array<{ id: string; seq: string; year: string; signedAt: string }>;
  contractAppendixSeq: string;
  contractAppendixYear: string;
  contractAppendixSignedAt: string;
}): Array<{ id: string; seq: string; year: string; signedAt: string }> {
  if (form.contractAppendices && form.contractAppendices.length > 0) return form.contractAppendices;
  return [
    {
      id: 'legacy-appendix',
      seq: form.contractAppendixSeq,
      year: form.contractAppendixYear,
      signedAt: form.contractAppendixSignedAt,
    },
  ];
}
