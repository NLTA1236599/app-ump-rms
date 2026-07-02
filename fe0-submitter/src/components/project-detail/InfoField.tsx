import { formatDisplayDate } from './formatDisplayDate.js';
import { toInputDate } from './parseDate.js';
import type { InfoFieldProps } from './types.js';

function formatCurrency(value: unknown): string {
  const num = Number(value);
  if (Number.isNaN(num) || num === 0) return '---';
  return `${num.toLocaleString('vi-VN')} VNĐ`;
}

function displayValue(
  value: unknown,
  isCurrency?: boolean,
  isDate?: boolean,
): string {
  if (value == null || value === '') return '---';
  if (isCurrency) return formatCurrency(value);
  if (isDate) return formatDisplayDate(value as string | number);
  if (Array.isArray(value)) return value.length ? value.join(', ') : '---';
  return String(value);
}

export function InfoField({
  label,
  value,
  isEditing = false,
  type = 'text',
  onChange,
  className = '',
  isCurrency = false,
  isDate = false,
}: InfoFieldProps) {
  if (isEditing) {
    const inputValue = isDate ? toInputDate(value as string | number) : String(value ?? '');
    return (
      <div className={className}>
        <p className="text-[11px] font-bold uppercase tracking-tight text-slate-500">{label}</p>
        <input
          type={isDate ? 'date' : type}
          value={inputValue}
          onChange={(e) => onChange?.(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-semibold
                     focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  const text = displayValue(value, isCurrency, isDate);

  return (
    <div className={className}>
      <p className="text-[11px] font-bold uppercase tracking-tight text-slate-500">{label}</p>
      <p
        className={`mt-1 break-words font-semibold text-slate-700 ${
          isCurrency && text !== '---' ? 'font-mono text-blue-600' : ''
        }`}
      >
        {text}
      </p>
    </div>
  );
}
