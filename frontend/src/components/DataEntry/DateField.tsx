import { useEffect, useState } from 'react';
import { isoToDisplay, isValidDdMmYyyy, ddMmYyyyToIso } from './dateHelpers.js';
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

/** spec §13 — `dd/mm/yyyy` display, `YYYY-MM-DD` storage */
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

  useEffect(() => {
    setText(isoToDisplay(valueIso));
  }, [valueIso]);

  const showParseError = touched && text.trim() !== '' && !isValidDdMmYyyy(text);

  const commit = () => {
    setTouched(true);
    if (!text.trim()) {
      onChangeIso('');
      return;
    }
    if (!isValidDdMmYyyy(text)) return;
    onChangeIso(ddMmYyyyToIso(text));
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
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/yyyy"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        className={`${inputBase} ${error || showParseError ? inputError : ''}`}
        aria-invalid={Boolean(error || showParseError)}
        aria-label={noLabel ? label : undefined}
      />
      {error ? <p className="mt-1 text-[10px] text-red-500">{error}</p> : null}
      {showParseError && !error ? (
        <p className="mt-1 text-[10px] text-red-500">Định dạng dd/mm/yyyy</p>
      ) : null}
    </div>
  );
}
