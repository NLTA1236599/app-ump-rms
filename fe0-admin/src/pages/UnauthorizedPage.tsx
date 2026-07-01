import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-md">
        <h1 className="mb-2 text-xl font-bold text-gray-800">Không có quyền truy cập</h1>
        <p className="mb-6 text-sm text-gray-600">
          Chỉ tài khoản có vai trò <strong>admin</strong> mới được phép vào trang quản trị.
        </p>
        <Link
          to="/login"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
