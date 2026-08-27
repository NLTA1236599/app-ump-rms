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
}): string {
  if (form.contractAppendixYear.trim()) return form.contractAppendixYear.trim();
  const fromBatch = extractReviewYear(form.reviewBatch);
  if (fromBatch) return String(fromBatch);
  const fromContract = form.contractYear.trim() || form.sequenceYear.trim();
  if (fromContract) return fromContract;
  const parsed = parseContractAppendix(form.contractAppendix).year;
  if (parsed) return parsed;
  return String(new Date().getFullYear());
}
