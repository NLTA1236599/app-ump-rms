import { LoginMoleculeIcon } from './LoginMoleculeIcon.js';

export function LoginCardHeader() {
  return (
    <header className="flex w-full flex-col items-center text-center">
      <LoginMoleculeIcon className="mb-4" />
      <h1 className="mb-1.5 text-[28px] font-bold tracking-normal text-ump-navy">UMP-RMS</h1>
      <p className="mb-8 text-[11px] font-normal uppercase leading-snug tracking-[0.08em] text-ump-text-muted">
        Hệ thống quản lý dự án KHCN UMP
      </p>
    </header>
  );
}
