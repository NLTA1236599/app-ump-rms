type RegisterLoginRedirectLinkProps = {
  onSwitchToLogin: () => void;
};

/** §12 — switch back to login tab. */
export function RegisterLoginRedirectLink({ onSwitchToLogin }: RegisterLoginRedirectLinkProps) {
  return (
    <p className="mt-4 text-center text-[13px] text-[#6b7280]">
      Đã có tài khoản?{' '}
      <button
        type="button"
        onClick={onSwitchToLogin}
        className="font-medium text-[#374151] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2"
      >
        — Quay lại tab Đăng nhập
      </button>
    </p>
  );
}
