type LoginEmailUnverifiedNoticeProps = {
  message: string;
};

/**
 * Shown when login returns 403: password accepted but `email_verified` is still false
 * (OTP wizard incomplete). Styling distinct from generic form errors.
 */
export function LoginEmailUnverifiedNotice({ message }: LoginEmailUnverifiedNoticeProps) {
  return (
    <div
      role="alert"
      className="mb-6 rounded-[10px] border border-amber-200/90 bg-amber-50/95 px-3 py-2.5 text-center text-[13px] leading-snug text-amber-950"
    >
      <p className="font-semibold">Chưa xác minh email</p>
      <p className="mt-1 text-amber-900/90">{message}</p>
      <p className="mt-2 text-[12px] text-amber-900/85">
        Hoàn tất nhập mã OTP từ email hoặc dùng gửi lại mã trong quy trình đăng ký.
      </p>
      <p className="mt-2">
        <a
          href="#register"
          className="font-semibold text-ump-mid no-underline hover:underline focus-visible:underline focus-visible:outline-none"
        >
          Quay lại bước đăng ký / xác minh
        </a>
      </p>
    </div>
  );
}
