import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f6fb] px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-800">Không có quyền truy cập</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Tài khoản của bạn không thuộc vai trò người nộp đề tài hoặc bạn đang dùng tài khoản quản trị.
      </p>
      <Link
        to="/login"
        className="mt-6 rounded-lg bg-[#1a6ec2] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
