# fe0-admin — Frontend Admin for Access Permission Management

> **Repo:** https://github.com/NLTA1236599/app-ump-rms  
> **Stack:** React + Vite + TypeScript · Port **5174** (separate from `fe0` on 5173)  
> **Purpose:** Admin dashboard to manage users, roles, and feature-level access permissions

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Step 1 — Scaffold the Admin Frontend](#step-1--scaffold-the-admin-frontend)
4. [Step 2 — Configure Vite](#step-2--configure-vite)
5. [Step 3 — Backend — Permission APIs](#step-3--backend--permission-apis)
6. [Step 4 — Database Schema](#step-4--database-schema)
7. [Step 5 — Auth & JWT Guard](#step-5--auth--jwt-guard)
8. [Step 6 — Pages & Components](#step-6--pages--components)
9. [Step 7 — API Service Layer](#step-7--api-service-layer)
10. [Step 8 — Docker Integration](#step-8--docker-integration)
11. [Step 9 — Update CORS in Backend](#step-9--update-cors-in-backend)
12. [Step 10 — Run & Verify](#step-10--run--verify)
13. [Checklist](#checklist)

---

## 1. Architecture Overview

```
┌──────────────────────┐     ┌──────────────────────┐
│  fe0  (User app)     │     │  fe0-admin (NEW)      │
│  React + Vite        │     │  React + Vite         │
│  localhost:5173      │     │  localhost:5174        │
└──────────┬───────────┘     └──────────┬────────────┘
           │  JWT (role=user)            │  JWT (role=admin)
           └──────────────┬─────────────┘
                          ▼
             ┌────────────────────────┐
             │      backend  :3001    │
             │  Node.js + PostgreSQL  │
             └────────────────────────┘
```

**Key rules:**
- `fe0-admin` is a completely separate Vite project in `frontend-admin/`
- Both frontends share the same backend — no new backend service needed
- Only users with `role = 'admin'` can log into `fe0-admin`
- JWT tokens are the same format; the admin frontend just enforces `role` check on login

---

## 2. Project Structure

```
app-ump-rms/
├── backend/
├── frontend/                    ← existing user app (fe0)
├── frontend-admin/              ← NEW admin app (fe0-admin)
│   ├── src/
│   │   ├── api/
│   │   │   ├── httpClient.ts
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   └── permissionService.ts
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   └── PermissionsPage.tsx
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── assets-test/
├── docker-compose.yml
└── .gitignore
```

---

## Step 1 — Scaffold the Admin Frontend

Run from the project root:

```bash
cd app-ump-rms

# Scaffold new Vite + React + TypeScript project
npm create vite@latest frontend-admin -- --template react-ts

cd frontend-admin

# Install dependencies
npm install

# Install routing, HTTP, state management
npm install react-router-dom axios zustand

# Install UI (Tailwind CSS)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure Tailwind in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 2 — Configure Vite

**`frontend-admin/vite.config.ts`:**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,                         // different port from fe0 (5173)
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

---

## Step 3 — Backend — Permission APIs

Add these endpoints to the existing backend. Create a new route file:

**`backend/src/routes/adminRoutes.ts`:**

```ts
import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth'
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/adminUserController'
import {
  getPermissions,
  updatePermission,
} from '../controllers/permissionController'

const router = Router()

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin)

// User management
router.get('/users',                getAllUsers)
router.patch('/users/:id/role',     updateUserRole)
router.delete('/users/:id',         deleteUser)

// Permission management
router.get('/permissions',          getPermissions)
router.put('/permissions/:feature', updatePermission)

export default router
```

Register in `backend/src/index.ts`:

```ts
import adminRoutes from './routes/adminRoutes'

app.use('/api/v1/admin', adminRoutes)
```

**`backend/src/middleware/auth.ts`** — add `requireAdmin`:

```ts
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}
```

**`backend/src/controllers/adminUserController.ts`:**

```ts
import { Request, Response } from 'express'
import { db } from '../db'

export const getAllUsers = async (_req: Request, res: Response) => {
  const result = await db.query(
    `SELECT id, email, full_name, role, created_at
     FROM users
     ORDER BY created_at DESC`
  )
  res.json({ users: result.rows })
}

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params
  const { role } = req.body

  const allowed = ['admin', 'user', 'specialist', 'leader']
  if (!allowed.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }

  await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, id])
  res.json({ message: 'Role updated' })
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params
  await db.query('DELETE FROM users WHERE id = $1', [id])
  res.json({ message: 'User deleted' })
}
```

**`backend/src/controllers/permissionController.ts`:**

```ts
import { Request, Response } from 'express'
import { db } from '../db'

export const getPermissions = async (_req: Request, res: Response) => {
  const result = await db.query(
    'SELECT feature, allowed_roles FROM feature_permissions ORDER BY feature'
  )
  res.json({ permissions: result.rows })
}

export const updatePermission = async (req: Request, res: Response) => {
  const { feature } = req.params
  const { allowed_roles } = req.body   // string[]

  await db.query(
    `INSERT INTO feature_permissions (feature, allowed_roles)
     VALUES ($1, $2)
     ON CONFLICT (feature) DO UPDATE SET allowed_roles = $2`,
    [feature, allowed_roles]
  )
  res.json({ message: 'Permission updated' })
}
```

---

## Step 4 — Database Schema

Run this migration against your PostgreSQL container:

```bash
docker exec -it $(docker compose ps -q postgres) \
  psql -U ump_rms_user -d ump_rms_db << 'EOF'

-- Feature permission table
CREATE TABLE IF NOT EXISTS feature_permissions (
  feature       TEXT        PRIMARY KEY,
  allowed_roles TEXT[]      NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default permissions for existing features
INSERT INTO feature_permissions (feature, allowed_roles) VALUES
  ('project.create',        ARRAY['admin', 'leader']),
  ('project.view',          ARRAY['admin', 'leader', 'specialist', 'user']),
  ('project.edit',          ARRAY['admin', 'leader']),
  ('project.delete',        ARRAY['admin']),
  ('project.upload',        ARRAY['admin', 'leader']),
  ('report.view',           ARRAY['admin', 'leader', 'specialist']),
  ('report.export',         ARRAY['admin']),
  ('admin.users',           ARRAY['admin']),
  ('admin.permissions',     ARRAY['admin'])
ON CONFLICT (feature) DO NOTHING;

EOF
```

---

## Step 5 — Auth & JWT Guard

**`frontend-admin/src/store/authStore.ts`:**

```ts
import { create } from 'zustand'

interface AdminUser {
  id: string
  email: string
  role: string
  token: string
}

interface AuthStore {
  user: AdminUser | null
  setUser: (user: AdminUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem('admin_user') ?? 'null'),

  setUser: (user) => {
    localStorage.setItem('admin_user', JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('admin_user')
    set({ user: null })
  },
}))
```

**`frontend-admin/src/api/httpClient.ts`:**

```ts
import axios from 'axios'

export const httpClient = axios.create({
  baseURL: '/api/v1',
})

httpClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('admin_user')
  if (stored) {
    const { token } = JSON.parse(stored)
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
```

**`frontend-admin/src/components/ProtectedRoute.tsx`:**

```tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />

  return <>{children}</>
}
```

---

## Step 6 — Pages & Components

**`frontend-admin/src/App.tsx`:**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout }    from './components/Layout/AdminLayout'
import { LoginPage }      from './pages/LoginPage'
import { DashboardPage }  from './pages/DashboardPage'
import { UsersPage }      from './pages/UsersPage'
import { PermissionsPage } from './pages/PermissionsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index           element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<DashboardPage />} />
          <Route path="users"       element={<UsersPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

**`frontend-admin/src/pages/LoginPage.tsx`:**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { httpClient } from '../api/httpClient'
import { useAuthStore } from '../store/authStore'

export const LoginPage = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const { setUser } = useAuthStore()
  const navigate    = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await httpClient.post('/auth/login', { email, password })
      const { token, user } = res.data

      if (user.role !== 'admin') {
        setError('Tài khoản này không có quyền truy cập trang quản trị.')
        return
      }

      setUser({ ...user, token })
      navigate('/dashboard')
    } catch {
      setError('Email hoặc mật khẩu không đúng.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2 text-blue-700">
          RMS Admin
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Trang quản trị hệ thống
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  )
}
```

**`frontend-admin/src/components/Layout/AdminLayout.tsx`:**

```tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export const AdminLayout = () => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 overflow-auto p-8">
      <Outlet />
    </main>
  </div>
)
```

**`frontend-admin/src/components/Layout/Sidebar.tsx`:**

```tsx
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const links = [
  { to: '/dashboard',   label: 'Dashboard' },
  { to: '/users',       label: 'Quản lý người dùng' },
  { to: '/permissions', label: 'Phân quyền tính năng' },
]

export const Sidebar = () => {
  const { logout } = useAuthStore()

  return (
    <aside className="w-60 bg-blue-800 text-white flex flex-col">
      <div className="px-6 py-5 text-xl font-bold tracking-wide border-b border-blue-700">
        RMS Admin
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-blue-700">
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-700 rounded-lg transition"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
```

**`frontend-admin/src/pages/UsersPage.tsx`:**

```tsx
import { useEffect, useState } from 'react'
import { httpClient } from '../api/httpClient'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

const ROLES = ['admin', 'leader', 'specialist', 'user']

export const UsersPage = () => {
  const [users, setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    const res = await httpClient.get('/admin/users')
    setUsers(res.data.users)
    setLoading(false)
  }

  const handleRoleChange = async (id: string, role: string) => {
    await httpClient.patch(`/admin/users/${id}/role`, { role })
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xoá người dùng này?')) return
    await httpClient.delete(`/admin/users/${id}`)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  useEffect(() => { fetchUsers() }, [])

  if (loading) return <p className="text-gray-500">Đang tải...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý người dùng</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Họ tên</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Vai trò</th>
              <th className="px-6 py-3 text-left">Ngày tạo</th>
              <th className="px-6 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{user.full_name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**`frontend-admin/src/pages/PermissionsPage.tsx`:**

```tsx
import { useEffect, useState } from 'react'
import { httpClient } from '../api/httpClient'

interface Permission {
  feature: string
  allowed_roles: string[]
}

const ALL_ROLES = ['admin', 'leader', 'specialist', 'user']

export const PermissionsPage = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading]         = useState(true)
  const [saved, setSaved]             = useState<string | null>(null)

  useEffect(() => {
    httpClient.get('/admin/permissions').then(res => {
      setPermissions(res.data.permissions)
      setLoading(false)
    })
  }, [])

  const toggleRole = (feature: string, role: string) => {
    setPermissions(prev =>
      prev.map(p => {
        if (p.feature !== feature) return p
        const has = p.allowed_roles.includes(role)
        return {
          ...p,
          allowed_roles: has
            ? p.allowed_roles.filter(r => r !== role)
            : [...p.allowed_roles, role],
        }
      })
    )
  }

  const handleSave = async (feature: string, allowed_roles: string[]) => {
    await httpClient.put(`/admin/permissions/${feature}`, { allowed_roles })
    setSaved(feature)
    setTimeout(() => setSaved(null), 2000)
  }

  if (loading) return <p className="text-gray-500">Đang tải...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Phân quyền tính năng</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Tính năng</th>
              {ALL_ROLES.map(r => (
                <th key={r} className="px-4 py-3 text-center">{r}</th>
              ))}
              <th className="px-6 py-3 text-left">Lưu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {permissions.map(p => (
              <tr key={p.feature} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-gray-700">{p.feature}</td>
                {ALL_ROLES.map(role => (
                  <td key={role} className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={p.allowed_roles.includes(role)}
                      onChange={() => toggleRole(p.feature, role)}
                      className="w-4 h-4 accent-blue-600"
                    />
                  </td>
                ))}
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleSave(p.feature, p.allowed_roles)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition"
                  >
                    {saved === p.feature ? '✓ Đã lưu' : 'Lưu'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## Step 7 — API Service Layer

**`frontend-admin/src/api/authService.ts`:**

```ts
import { httpClient } from './httpClient'

export const login = (email: string, password: string) =>
  httpClient.post('/auth/login', { email, password })
```

**`frontend-admin/src/api/permissionService.ts`:**

```ts
import { httpClient } from './httpClient'

export const getPermissions    = ()                                      => httpClient.get('/admin/permissions')
export const updatePermission  = (feature: string, roles: string[])      => httpClient.put(`/admin/permissions/${feature}`, { allowed_roles: roles })
```

**`frontend-admin/src/api/userService.ts`:**

```ts
import { httpClient } from './httpClient'

export const getUsers      = ()                              => httpClient.get('/admin/users')
export const updateRole    = (id: string, role: string)      => httpClient.patch(`/admin/users/${id}/role`, { role })
export const deleteUser    = (id: string)                    => httpClient.delete(`/admin/users/${id}`)
```

---

## Step 8 — Docker Integration

**`frontend-admin/Dockerfile`:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**`frontend-admin/nginx.conf`:**

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Update `docker-compose.yml`** — add the admin frontend service:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ump_rms_user
      POSTGRES_PASSWORD: change_me
      POSTGRES_DB: ump_rms_db
    ports:
      - "5432:5432"
    volumes:
      - ump_rms_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ump_rms_user -d ump_rms_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: rms-be
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./uploads:/app/uploads
    environment:
      PORT: "3001"
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_NAME: ump_rms_db
      DB_USER: ump_rms_user
      DB_PASSWORD: change_me
      JWT_SECRET: change-this-to-a-long-random-string
      # Add 5174 for the admin frontend
      FRONTEND_ORIGIN: >-
        http://localhost:5173,http://127.0.0.1:5173,http://rms-fe:5173,
        http://localhost:5174,http://127.0.0.1:5174,http://rms-admin:5174
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:3001/api/v1
    container_name: rms-fe
    restart: unless-stopped
    ports:
      - "5173:80"
    volumes:
      - ./assets-test:/usr/share/nginx/html/assets-test:ro
    depends_on:
      - backend

  # ── NEW: Admin frontend ─────────────────────────────────────────────────────
  frontend-admin:
    build:
      context: ./frontend-admin
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:3001/api/v1
    container_name: rms-admin
    restart: unless-stopped
    ports:
      - "5174:80"               # different port from fe0
    depends_on:
      - backend

volumes:
  ump_rms_pgdata:
```

---

## Step 9 — Update CORS in Backend

Find where CORS is configured in `backend/src/index.ts` and add port `5174`:

```ts
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked: ${origin}`))
    }
  },
  credentials: true,
}))
```

The `FRONTEND_ORIGIN` env var in `docker-compose.yml` already includes `5174` after Step 8.

For local dev without Docker, add to `backend/.env`:

```env
FRONTEND_ORIGIN=http://localhost:5173,http://localhost:5174
```

---

## Step 10 — Run & Verify

### Local development

```bash
# Terminal 1 — start backend + postgres
docker compose up -d postgres backend

# Terminal 2 — start user frontend
cd frontend && npm run dev          # http://localhost:5173

# Terminal 3 — start admin frontend
cd frontend-admin && npm run dev    # http://localhost:5174
```

### Docker (full stack)

```bash
# Run migration first
docker compose up -d postgres
docker exec -it $(docker compose ps -q postgres) \
  psql -U ump_rms_user -d ump_rms_db -c "
    CREATE TABLE IF NOT EXISTS feature_permissions (
      feature TEXT PRIMARY KEY,
      allowed_roles TEXT[] NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    INSERT INTO feature_permissions (feature, allowed_roles) VALUES
      ('project.create', ARRAY['admin','leader']),
      ('project.view',   ARRAY['admin','leader','specialist','user']),
      ('project.delete', ARRAY['admin']),
      ('admin.users',    ARRAY['admin']),
      ('admin.permissions', ARRAY['admin'])
    ON CONFLICT (feature) DO NOTHING;
  "

# Build and start everything
docker compose up -d --build

# Verify both frontends are up
curl -I http://localhost:5173   # fe0 user app
curl -I http://localhost:5174   # fe0-admin admin app
```

### Verify admin login

1. Open `http://localhost:5174`
2. Log in with an admin account (e.g. `nltanh@ump.edu.vn`)
3. A non-admin account should be rejected with "Tài khoản này không có quyền truy cập trang quản trị"
4. Navigate to **Quản lý người dùng** → change a user's role
5. Navigate to **Phân quyền tính năng** → toggle checkboxes and save

---

## Checklist

### Setup
- [ ] `frontend-admin/` scaffolded with `npm create vite@latest`
- [ ] Tailwind CSS installed and configured
- [ ] `vite.config.ts` sets port `5174` and proxies `/api` to `:3001`

### Backend
- [ ] `feature_permissions` table created and seeded
- [ ] `/api/v1/admin/users` endpoints working
- [ ] `/api/v1/admin/permissions` endpoints working
- [ ] `requireAdmin` middleware applied to all `/admin` routes
- [ ] `FRONTEND_ORIGIN` includes `localhost:5174`

### Frontend Admin
- [ ] Login page rejects non-admin roles
- [ ] `ProtectedRoute` redirects unauthenticated users to `/login`
- [ ] Users page loads, role dropdown updates correctly
- [ ] Permissions page loads, checkboxes reflect DB state, Save works
- [ ] Logout clears token and redirects to `/login`

### Docker
- [ ] `frontend-admin` service added to `docker-compose.yml`
- [ ] Port `5174:80` mapped correctly
- [ ] `docker compose up -d --build` starts all 4 services
- [ ] `http://localhost:5174` responds with the admin login page

---

*Generated for RMS – UMP project · June 2026*
