export function LoginRegisterPrompt() {
  return (
    <p className="flex flex-wrap items-center justify-center gap-1 text-center text-[13px] text-ump-text-muted">
      Chưa có tài khoản?
      <a
        href="#register"
        className="ml-1 font-semibold text-ump-mid no-underline hover:underline focus-visible:underline focus-visible:outline-none"
      >
        Đăng ký ngay
      </a>
    </p>
  );
}
