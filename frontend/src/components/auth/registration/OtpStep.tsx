import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type FormEvent } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext.js';
import {
  DEFAULT_OTP_TTL_SECONDS,
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  deliveryChannelHelp,
  type OtpDeliveryChannel,
} from './constants.js';

type OtpStepProps = {
  email: string;
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
  onVerified: () => void;
  onBackToForm: () => void;
};

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function useCountdown(initial: number) {
  const [left, setLeft] = useState(initial);

  useEffect(() => {
    setLeft(initial);
  }, [initial]);

  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);

  return [left, setLeft] as const;
}

export function OtpStep({
  email,
  otpTtlSeconds,
  otpDeliveryChannel,
  onVerified,
  onBackToForm,
}: OtpStepProps) {
  const { verifyOtp, resendOtp } = useAuthContext();
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, () => ''));
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(() => deliveryChannelHelp(otpDeliveryChannel));
  const [busy, setBusy] = useState(false);
  const [ttlLeft, setTtlLeft] = useCountdown(otpTtlSeconds || DEFAULT_OTP_TTL_SECONDS);
  const [cooldown, setCooldown] = useCountdown(RESEND_COOLDOWN_SECONDS);
  const [channel, setChannel] = useState(otpDeliveryChannel);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => digits.join(''), [digits]);
  const canSubmit = code.length === OTP_LENGTH && !busy;

  const setDigitAt = (index: number, value: string) => {
    const d = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = d;
      return next;
    });
    if (d && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => text[i] ?? '');
    setDigits(next);
    const focusIdx = Math.min(text.length, OTP_LENGTH - 1);
    inputsRef.current[focusIdx]?.focus();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    const result = await verifyOtp(email, code);
    setBusy(false);
    if (result.ok) {
      onVerified();
      return;
    }
    setError(result.message);
    setDigits(Array.from({ length: OTP_LENGTH }, () => ''));
    inputsRef.current[0]?.focus();
  };

  const onResend = async () => {
    if (cooldown > 0 || busy) return;
    setError(null);
    setBusy(true);
    const result = await resendOtp(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setChannel(result.otpDeliveryChannel);
    setInfo(deliveryChannelHelp(result.otpDeliveryChannel) ?? 'Đã gửi lại mã OTP.');
    setTtlLeft(result.otpTtlSeconds || DEFAULT_OTP_TTL_SECONDS);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setDigits(Array.from({ length: OTP_LENGTH }, () => ''));
    inputsRef.current[0]?.focus();
  };

  return (
    <div className="flex flex-col">
      <h2 className="mb-1 text-center text-[18px] font-semibold text-[#111827]">Xác minh email</h2>
      <p className="mb-5 text-center text-[13px] leading-relaxed text-[#6b7280]">
        Nhập mã {OTP_LENGTH} số đã gửi tới <span className="font-medium text-[#374151]">{email}</span>
      </p>

      {info ? (
        <p
          role="status"
          className="mb-4 rounded-[10px] border border-sky-200/90 bg-sky-50/95 px-3 py-2.5 text-center text-[12px] text-sky-900"
        >
          {info}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="flex flex-col" noValidate>
        <div className="mb-3 flex justify-center gap-2" onPaste={onPaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              aria-label={`OTP chữ số ${i + 1}`}
              onChange={(e) => setDigitAt(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[i] && i > 0) {
                  inputsRef.current[i - 1]?.focus();
                }
              }}
              className="h-12 w-10 rounded-[10px] border border-[#e5e7eb] bg-white text-center text-[18px] font-semibold text-[#111827] outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#93c5fd]"
            />
          ))}
        </div>

        <p className="mb-4 text-center text-[12px] text-[#6b7280]">
          Mã hết hạn sau <span className="font-semibold text-[#374151]">{formatMmSs(ttlLeft)}</span>
          {channel === 'smtp' ? ' · đã gửi qua email' : null}
        </p>

        {error ? (
          <p role="alert" className="mb-4 text-center text-[13px] text-[#ef4444]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-[52px] w-full rounded-[11px] bg-[#1a1a1a] text-[15px] font-semibold text-white outline-none transition-[background,opacity] enabled:hover:bg-[#2d2d2d] enabled:focus-visible:ring-2 enabled:focus-visible:ring-[#1a1a1a] enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {busy ? 'Đang xác minh…' : 'Xác minh'}
        </button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-2 text-[13px]">
        <button
          type="button"
          disabled={cooldown > 0 || busy}
          onClick={() => void onResend()}
          className="font-medium text-[#1d4ed8] underline-offset-2 enabled:hover:underline disabled:cursor-not-allowed disabled:text-[#9ca3af]"
        >
          {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : 'Gửi lại mã'}
        </button>
        <button
          type="button"
          onClick={onBackToForm}
          className="text-[#6b7280] underline-offset-2 hover:underline"
        >
          Quay lại form đăng ký
        </button>
      </div>
    </div>
  );
}
