type PgErrorLike = { code?: string };

export function isUniqueViolation(err: unknown): boolean {
  return Boolean(err && typeof err === 'object' && (err as PgErrorLike).code === '23505');
}

export function httpError(message: string, status: number): Error & { status: number } {
  return Object.assign(new Error(message), { status });
}
