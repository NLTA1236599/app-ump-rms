import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../api/authService.js';
import { useAuthStore } from '../store/authStore.js';
import { loginIdentifierToUsername } from '../utils/loginIdentifier.js';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const username = loginIdentifierToUsername(email);
      const { token, user } = await login(username, password);

      if (user.role !== 'admin') {
        setError('Tài khoản này không có quyền truy cập trang quản trị.');
        return;
      }

      setUser({ ...user, token });
      navigate('/dashboard');
    } catch {
      setError('Email hoặc mật khẩu không đúng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-blue-700">RMS Admin</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Trang quản trị hệ thống (fe0-admin)</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@ump.edu.vn"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
