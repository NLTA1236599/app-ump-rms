type LoginRegisterFooterPromptProps = {
  onSwitchToRegister: () => void;
};

/** Analysis §6 — switches register tab programmatically. */
export function LoginRegisterFooterPrompt({ onSwitchToRegister }: LoginRegisterFooterPromptProps) {
  return (
    <p className="mt-4 flex flex-wrap items-center justify-center gap-1 text-center text-[13px] text-[#6b7280]">
      Chưa có tài khoản?
      <button
        type="button"
        onClick={onSwitchToRegister}
        className="font-medium text-[#1a6ec2] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6ec2] focus-visible:ring-offset-1"
      >
        Chuyển sang tab Đăng ký →
      </button>
    </p>
  );
}
