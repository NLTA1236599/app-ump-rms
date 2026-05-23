import { useState } from 'react';
import { LoginMoleculeIcon } from '../features/auth/LoginMoleculeIcon.js';

type AuthPageVariant = 'login' | 'register';

type LoginBrandingHeaderProps = {
  /** `register`: title + subtitles per `register-component-analysis.md` §2; logo optional §1. */
  variant?: AuthPageVariant;
};

/** Shared branding above auth card (login + register tabs). */
export function LoginBrandingHeader({ variant = 'login' }: LoginBrandingHeaderProps) {
  const [sealOk, setSealOk] = useState(true);
  const showLogo = variant === 'login';

  return (
    <header className="flex w-full flex-col items-center text-center">
      {showLogo ? (
        <div className="mb-3 flex size-[72px] shrink-0 items-center justify-center">
          {sealOk ? (
            <img
              src="/ump-seal.png"
              alt="Logo Đại học Y Dược TP. Hồ Chí Minh"
              width={72}
              height={72}
              className="size-[72px] rounded-full object-cover shadow-[0_2px_12px_rgba(30,80,160,0.12)]"
              onError={() => setSealOk(false)}
            />
          ) : (
            <LoginMoleculeIcon className="size-[68px]" aria-hidden />
          )}
        </div>
      ) : null}
      <h1 className="mb-1 text-[clamp(26px,4vw,32px)] font-bold leading-tight tracking-tight text-[#1a1a1a]">
        {variant === 'register' ? 'Đăng ký tài khoản' : 'Đăng nhập'}
      </h1>
      <p
        className={`mb-0.5 max-w-[min(100%,520px)] text-[14px] font-normal leading-snug ${
          variant === 'register' ? 'text-[#78716c]' : 'text-[#4a6fa5]'
        }`}
      >
        Hệ thống Quản lý Dự án Khoa học Công nghệ UMP-RMS
      </p>
      <p className="text-[12px] font-normal leading-snug text-[#9ca3af]">Đại Học Y Dược TP. Hồ Chí Minh</p>
    </header>
  );
}
