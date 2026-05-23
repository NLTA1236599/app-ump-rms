const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

/** Thrown on non-OK responses; preserves HTTP status for auth flows (e.g. login 403 when email unverified). */
export class ApiHttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const url = `${BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch (e) {
    const cause = e instanceof Error ? e.message : String(e);
    const usingViteProxy = !import.meta.env.VITE_API_URL;
    const devHint =
      import.meta.env.DEV && usingViteProxy
        ? ' Hãy chạy backend (ví dụ: tại thư mục gốc repo `npm run dev` hoặc `npm run dev --prefix backend`) và đảm bảo API lắng nghe cổng 3001 như proxy Vite.'
        : import.meta.env.DEV
          ? ' Kiểm tra biến môi trường VITE_API_URL và xem máy chủ API có đang chạy không.'
          : '';
    throw new Error(`Không kết nối được tới máy chủ.${devHint} (${cause})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    throw new ApiHttpError(body.error ?? response.statusText, response.status);
  }

  return body as T;
}

export const httpClient = {
  get: <T>(path: string, opts?: RequestInit) =>
    request<T>(path, { method: 'GET', ...opts }),

  post: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      ...opts,
    }),

  put: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, {
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
      ...opts,
    }),

  patch: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
      ...opts,
    }),

  delete: <T>(path: string, opts?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...opts }),
};
