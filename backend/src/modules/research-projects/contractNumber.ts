import { extractReviewYear } from './reviewYear.js';

export const CONTRACT_FIXED_PART = 'HĐ-ĐHYD';

export function formatContractNumber(
  seq: number | string,
  year: number | string,
  dateDisplay: string,
): string {
  const base = `${String(seq).trim()}/${String(year).trim()}/${CONTRACT_FIXED_PART}`;
  const date = dateDisplay.trim();
  return date ? `${base} ký ngày ${date}` : base;
}

export function isoToDdMmYyyy(raw: string): string {
  const text = raw.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (!dmy) return '';
  return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`;
}

/** Fill `contractId` as `{stt}/{năm}/HĐ-ĐHYD ký ngày dd/mm/yyyy` when sequence is known. */
export function applyComposedContractId(data: Record<string, unknown>): void {
  const seq = Number(data.registrationSequenceNumber);
  const year =
    Number(data.registrationSequenceYear) ||
    extractReviewYear(String(data.reviewBatch ?? '')) ||
    NaN;
  if (!Number.isInteger(seq) || seq < 1 || !Number.isInteger(year) || year < 1990) return;
  data.contractId = formatContractNumber(seq, year, isoToDdMmYyyy(String(data.contractDate ?? '')));
}
