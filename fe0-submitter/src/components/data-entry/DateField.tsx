import { useEffect, useRef, useState } from 'react';

import {
  ddMmYyyyToIso,
  formatDateInputMask,
  isoToDisplay,
  isValidDdMmYyyy,
} from './dateHelpers.js';
import { inputBase, inputError } from './formStyles.js';

type DateFieldProps = {
  label: string;
  valueIso: string;
  onChangeIso: (next: string) => void;
  required?: boolean;
  error?: string;
  id: string;
  /** Parent supplies visible label — hide built-in label but keep a11y */
  noLabel?: boolean;
};

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function openNativeDatePicker(input: HTMLInputElement | null) {
  if (!input) return;
  if ('showPicker' in input && typeof input.showPicker === 'function') {
    try {
      input.showPicker();
      return;
    } catch {
      // Fallback below when showPicker is blocked.
    }
  }
  input.click();
}

/** spec §13 — `dd/mm/yyyy` display, `YYYY-MM-DD` storage, native calendar on focus */
export function DateField({
  label,
  valueIso,
  onChangeIso,
  required,
  error,
  id,
  noLabel,
}: DateFieldProps) {
  const [text, setText] = useState(() => isoToDisplay(valueIso));
  const [touched, setTouched] = useState(false);
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(isoToDisplay(valueIso));
  }, [valueIso]);

  const showParseError = touched && text.trim() !== '' && !isValidDdMmYyyy(text);

  const commitText = (nextText: string) => {
    setTouched(true);
    if (!nextText.trim()) {
      onChangeIso('');
      return;
    }
    if (!isValidDdMmYyyy(nextText)) return;
    onChangeIso(ddMmYyyyToIso(nextText));
  };

  const handleTextChange = (raw: string) => {
    const masked = formatDateInputMask(raw);
    setText(masked);
    if (!masked.trim()) {
      onChangeIso('');
      return;
    }
    if (isValidDdMmYyyy(masked)) {
      onChangeIso(ddMmYyyyToIso(masked));
      setTouched(true);
    }
  };

  const handlePickerChange = (iso: string) => {
    onChangeIso(iso);
    setText(isoToDisplay(iso));
    setTouched(true);
  };

  const handleFocus = () => {
    if (pickerRef.current) {
      pickerRef.current.value = valueIso;
    }
    openNativeDatePicker(pickerRef.current);
  };

  return (
    <div>
      {!noLabel ? (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-600">
          {label}
          {required ? <span className="ml-0.5 text-red-500">*</span> : null}
        </label>
      ) : (
        <span className="sr-only">
          {label}
          {required ? ' (bắt buộc)' : ''}
        </span>
      )}

      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/yyyy"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={() => commitText(text)}
          onFocus={handleFocus}
          maxLength={10}
          className={`${inputBase} pr-10 ${error || showParseError ? inputError : ''}`}
          aria-invalid={Boolean(error || showParseError)}
          aria-label={noLabel ? label : undefined}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => openNativeDatePicker(pickerRef.current)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400
                     transition-colors hover:bg-slate-100 hover:text-blue-600"
          aria-label={`Chọn ngày cho ${label}`}
        >
          <CalendarIcon />
        </button>

        <input
          ref={pickerRef}
          type="date"
          value={valueIso}
          onChange={(e) => handlePickerChange(e.target.value)}
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-0 w-0 opacity-0"
        />
      </div>

      {error ? <p className="mt-1 text-[10px] text-red-500">{error}</p> : null}
      {showParseError && !error ? (
        <p className="mt-1 text-[10px] text-red-500">Định dạng dd/mm/yyyy</p>
      ) : null}
    </div>
  );
}
