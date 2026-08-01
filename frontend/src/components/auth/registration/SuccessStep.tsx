type SuccessStepProps = {
  email: string;
  onGoToLogin: () => void;
};

export function SuccessStep({ email, onGoToLogin }: SuccessStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
        ✓
      </div>
      <h2 className="mb-2 text-[18px] font-semibold text-[#111827]">Xác minh thành công</h2>
      <p className="mb-6 max-w-sm text-[13px] leading-relaxed text-[#6b7280]">
        Email <span className="font-medium text-[#374151]">{email}</span> đã được xác minh. Bạn có thể
        đăng nhập vào hệ thống.
      </p>
      <button
        type="button"
        onClick={onGoToLogin}
        className="h-[52px] w-full rounded-[11px] bg-[#1a1a1a] text-[15px] font-semibold text-white outline-none transition-colors hover:bg-[#2d2d2d] focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-2"
      >
        Đến trang đăng nhập
      </button>
    </div>
  );
}
