/** Map `pg` errors to HTTP-friendly Error instances (auth register/login). */
export function mapAuthDatabaseError(error: unknown): unknown {
  if (!error || typeof error !== 'object') return error;
  const code = 'code' in error ? (error as { code: unknown }).code : undefined;

  if (code === '23505') {
    const err = new Error('Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.');
    (err as Error & { status?: number }).status = 500;
    console.error('[Auth] unique constraint collision');
    return err;
  }

  if (code === '42P01') {
    const err = new Error('Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.');
    (err as Error & { status?: number }).status = 503;
    console.error('[Auth] missing relation — run migrations');
    return err;
  }

  return error;
}
