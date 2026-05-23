/** Map `pg` errors to HTTP-friendly Error instances (auth register/login). */
export function mapAuthDatabaseError(error: unknown): unknown {
  if (!error || typeof error !== 'object') return error;
  const code = 'code' in error ? (error as { code: unknown }).code : undefined;

  if (code === '23505') {
    const err = new Error(
      'Tài khoản với email này đã tồn tại. Vui lòng chuyển sang tab Đăng nhập hoặc dùng email khác.'
    );
    (err as Error & { status?: number }).status = 409;
    return err;
  }

  if (code === '42P01') {
    const err = new Error(
      'Cơ sở dữ liệu chưa được khởi tạo. Chạy: npm run migrate (từ thư mục gốc dự án).'
    );
    (err as Error & { status?: number }).status = 503;
    return err;
  }

  return error;
}
