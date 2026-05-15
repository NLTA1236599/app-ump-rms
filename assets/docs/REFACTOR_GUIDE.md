# Hướng Dẫn Refactor App QLKHCN

> **Mục tiêu:** Chuyển từ Firebase + Supabase + Vercel sang **NhanHoa VPS + PostgreSQL + Nginx**, đồng thời tái cấu trúc toàn bộ codebase theo nguyên lý **SOLID** để code dễ đọc, dễ bảo trì và dễ mở rộng.

---

## Mục Lục

1. [Tổng Quan Thay Đổi](#1-tổng-quan-thay-đổi)
2. [Chuẩn Bị VPS & Domain NhanHoa](#2-chuẩn-bị-vps--domain-nhanhoa)
3. [Xây Dựng Backend API (Node.js + Express + PostgreSQL)](#3-xây-dựng-backend-api-nodejs--express--postgresql)
4. [Cấu Trúc Thư Mục Sau Refactor](#4-cấu-trúc-thư-mục-sau-refactor)
5. [Áp Dụng SOLID Principles](#5-áp-dụng-solid-principles)
   - [S — Single Responsibility](#s--single-responsibility-principle)
   - [O — Open/Closed](#o--openclosed-principle)
   - [L — Liskov Substitution](#l--liskov-substitution-principle)
   - [I — Interface Segregation](#i--interface-segregation-principle)
   - [D — Dependency Inversion](#d--dependency-inversion-principle)
6. [Refactor Frontend: Services Layer](#6-refactor-frontend-services-layer)
7. [Refactor Frontend: State Management](#7-refactor-frontend-state-management)
8. [Refactor Frontend: Components](#8-refactor-frontend-components)
9. [Deploy Lên NhanHoa VPS](#9-deploy-lên-nhanhoa-vps)
10. [Nginx & SSL Config](#10-nginx--ssl-config)
11. [CI/CD Với GitHub Actions](#11-cicd-với-github-actions)
12. [Checklist Hoàn Thành](#12-checklist-hoàn-thành)

---

## 1. Tổng Quan Thay Đổi

### Trước (Cloud-vendor lock-in)

```
Frontend (Vite/React)
    ├── Firebase Auth       → Xác thực người dùng
    ├── Firebase Firestore  → Lưu workflow, history
    └── Supabase (PostgreSQL) → Lưu ResearchProject

Deploy: Vercel (serverless, auto)
```

### Sau (Self-hosted, SOLID)

```
Frontend (Vite/React) — NhanHoa Domain
    └── REST API calls (/api/v1/...)

Backend (Node.js + Express) — NhanHoa VPS
    ├── JWT Authentication  → Thay Firebase Auth
    ├── PostgreSQL          → Thay Supabase & Firestore
    └── Bcrypt password hash

Nginx (Reverse proxy + SSL Let's Encrypt)
PM2 (Process manager)
```

### Lý Do Chọn Stack Này

| Tiêu chí | Firebase/Supabase/Vercel | NhanHoa VPS + Node.js |
|---|---|---|
| Chi phí | Phụ thuộc usage, có thể tăng | Cố định theo tháng |
| Dữ liệu | Lưu nước ngoài | Lưu trong nước (tuân thủ pháp luật VN) |
| Kiểm soát | Hạn chế | Toàn quyền |
| Vendor lock-in | Cao | Không có |
| Offline/Intranet | Không hỗ trợ | Hỗ trợ |

---

## 2. Chuẩn Bị VPS & Domain NhanHoa

### 2.1 Mua VPS

Truy cập [nhanhoa.com](https://nhanhoa.com) → **VPS Linux** → chọn gói phù hợp (khuyến nghị tối thiểu **2 CPU / 2GB RAM / 40GB SSD**).

Sau khi mua, bạn nhận được:
- IP VPS (ví dụ: `103.x.x.x`)
- User root + mật khẩu SSH

### 2.2 Mua & Trỏ Domain

1. Mua domain tại NhanHoa (ví dụ: `qlkhcn.truong.edu.vn`)
2. Vào **DNS Manager** → thêm record:

```
Type    Name     Value
A       @        103.x.x.x       (trỏ domain chính về VPS)
A       api      103.x.x.x       (trỏ subdomain API)
CNAME   www      @
```

3. Chờ DNS propagate (~5–30 phút).

### 2.3 Kết Nối & Bảo Mật SSH

```bash
# Kết nối VPS
ssh root@103.x.x.x

# Cập nhật hệ thống
apt update && apt upgrade -y

# Tạo user riêng (không dùng root để chạy app)
adduser deploy
usermod -aG sudo deploy

# Chuyển sang user deploy
su - deploy
```

### 2.4 Cài Đặt Môi Trường

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Nginx
sudo apt install -y nginx

# PM2 (process manager)
sudo npm install -g pm2

# Certbot (SSL miễn phí)
sudo apt install -y certbot python3-certbot-nginx
```

### 2.5 Tạo Database PostgreSQL

```bash
sudo -u postgres psql

-- Trong psql shell:
CREATE USER qlkhcn_user WITH PASSWORD 'MatKhauManh123!';
CREATE DATABASE qlkhcn_db OWNER qlkhcn_user;
GRANT ALL PRIVILEGES ON DATABASE qlkhcn_db TO qlkhcn_user;
\q
```

---

## 3. Xây Dựng Backend API (Node.js + Express + PostgreSQL)

Tạo thư mục riêng cho backend (tách hoàn toàn khỏi frontend):

```bash
mkdir ~/qlkhcn-backend && cd ~/qlkhcn-backend
npm init -y
npm install express pg bcryptjs jsonwebtoken cors dotenv helmet express-rate-limit
npm install -D typescript @types/express @types/pg @types/bcryptjs @types/jsonwebtoken ts-node-dev
```

### 3.1 Cấu Trúc Backend

```
qlkhcn-backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Kết nối PostgreSQL pool
│   ├── middleware/
│   │   ├── auth.ts           # Xác thực JWT
│   │   └── errorHandler.ts   # Xử lý lỗi tập trung
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.routes.ts
│   │   └── projects/
│   │       ├── project.controller.ts
│   │       ├── project.service.ts
│   │       ├── project.repository.ts
│   │       └── project.routes.ts
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── .env
├── package.json
└── tsconfig.json
```

### 3.2 Kết Nối Database (`src/config/database.ts`)

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Pool tái sử dụng kết nối — không tạo connection mới mỗi request
export const pool = new Pool({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     ?? 'qlkhcn_db',
  user:     process.env.DB_USER     ?? 'qlkhcn_user',
  password: process.env.DB_PASSWORD ?? '',
  max: 20,          // tối đa 20 kết nối đồng thời
  idleTimeoutMillis: 30000,
});
```

### 3.3 Schema PostgreSQL

```sql
-- Chạy file này trên VPS: psql -U qlkhcn_user -d qlkhcn_db -f schema.sql

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,           -- bcrypt hash
  role        VARCHAR(50)  NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE projects (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code          VARCHAR(100),
  contract_id           VARCHAR(100),
  contract_date         DATE,
  title                 TEXT NOT NULL,
  lead_author           VARCHAR(255),
  members               TEXT,
  research_field        VARCHAR(255),
  research_type         VARCHAR(100),
  department            VARCHAR(255),
  sub_department        VARCHAR(255),
  status                VARCHAR(100) DEFAULT 'Đang thực hiện',
  progress_status       VARCHAR(100),
  budget                NUMERIC(15,2),
  start_date            DATE,
  end_date              DATE,
  description           TEXT,
  categories            TEXT[],
  expected_products     JSONB DEFAULT '[]',
  actual_products       JSONB DEFAULT '[]',
  actual_product_details TEXT,
  history               JSONB DEFAULT '[]',
  workflow_step         INTEGER DEFAULT 0,
  workflow_status       VARCHAR(100),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.4 Auth Service (`src/modules/auth/auth.service.ts`)

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database';
import type { User } from '../../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';
const SALT_ROUNDS = 12;

export class AuthService {
  async register(username: string, password: string, role: string): Promise<User> {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1,$2,$3) RETURNING id, username, role',
      [username, hash, role]
    );
    return rows[0];
  }

  async login(username: string, password: string): Promise<string> {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const user = rows[0];
    if (!user) throw new Error('Tài khoản không tồn tại');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Mật khẩu không đúng');

    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
  }
}
```

### 3.5 Project Repository (`src/modules/projects/project.repository.ts`)

```typescript
import { pool } from '../../config/database';
import type { ResearchProject } from '../../types';

// Repository chỉ chịu trách nhiệm TRUY CẬP DỮ LIỆU — không có business logic
export class ProjectRepository {
  async findAll(): Promise<ResearchProject[]> {
    const { rows } = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    return rows.map(this.toModel);
  }

  async findById(id: string): Promise<ResearchProject | null> {
    const { rows } = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return rows[0] ? this.toModel(rows[0]) : null;
  }

  async upsert(project: ResearchProject): Promise<ResearchProject> {
    const { rows } = await pool.query(`
      INSERT INTO projects (id, project_code, title, lead_author, status, budget,
        start_date, end_date, department, research_field, members, description,
        expected_products, actual_products, history, categories, workflow_step)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, status = EXCLUDED.status,
        budget = EXCLUDED.budget, history = EXCLUDED.history,
        expected_products = EXCLUDED.expected_products,
        actual_products = EXCLUDED.actual_products,
        updated_at = NOW()
      RETURNING *
    `, [
      project.id, project.projectCode, project.title, project.leadAuthor,
      project.status, project.budget, project.startDate, project.endDate,
      project.department, project.researchField, project.members,
      project.description, JSON.stringify(project.expectedProducts),
      JSON.stringify(project.actualProducts), JSON.stringify(project.history),
      project.categories, project.workflowStep ?? 0,
    ]);
    return this.toModel(rows[0]);
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  }

  // Ánh xạ snake_case (DB) → camelCase (TypeScript model)
  private toModel(row: Record<string, unknown>): ResearchProject {
    return {
      id:               row.id as string,
      projectCode:      row.project_code as string,
      title:            row.title as string,
      leadAuthor:       row.lead_author as string,
      members:          row.members as string,
      researchField:    row.research_field as string,
      researchType:     row.research_type as string,
      department:       row.department as string,
      subDepartment:    row.sub_department as string,
      status:           row.status as any,
      budget:           Number(row.budget),
      startDate:        row.start_date as string,
      endDate:          row.end_date as string,
      description:      row.description as string,
      categories:       row.categories as string[],
      expectedProducts: row.expected_products as any,
      actualProducts:   row.actual_products as any,
      history:          row.history as any,
      workflowStep:     row.workflow_step as number,
      contractId: '', contractDate: '', title2: '',
    } as ResearchProject;
  }
}
```

### 3.6 Auth Middleware (`src/middleware/auth.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Chưa đăng nhập' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!roles.includes(user?.role)) {
      return res.status(403).json({ error: 'Không có quyền thực hiện thao tác này' });
    }
    next();
  };
}
```

### 3.7 Express App (`src/app.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRoutes }    from './modules/auth/auth.routes';
import { projectRoutes } from './modules/projects/project.routes';

const app = express();

// Security headers
app.use(helmet());

// CORS — chỉ cho phép domain của bạn
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting — chống brute force
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

app.use(express.json({ limit: '2mb' }));

// Routes
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/projects', projectRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
```

### 3.8 File `.env` Backend

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qlkhcn_db
DB_USER=qlkhcn_user
DB_PASSWORD=MatKhauManh123!
JWT_SECRET=mot-chuoi-bi-mat-rat-dai-va-ngau-nhien-123456
FRONTEND_ORIGIN=https://qlkhcn.truong.edu.vn
```

> **Quan trọng:** Không bao giờ commit file `.env` lên Git. Thêm `.env` vào `.gitignore`.

---

## 4. Cấu Trúc Thư Mục Sau Refactor

```
app-qlKHCN2/                     ← Frontend (React)
├── src/
│   ├── types/
│   │   └── index.ts             ← Tất cả interfaces & enums (không đổi)
│   │
│   ├── services/                ← SOLID: Dependency Inversion
│   │   ├── interfaces/
│   │   │   ├── IAuthService.ts  ← Contract cho auth
│   │   │   └── IProjectRepository.ts ← Contract cho data
│   │   ├── api/
│   │   │   ├── httpClient.ts    ← Axios wrapper (1 nơi duy nhất gọi fetch)
│   │   │   ├── authService.ts   ← Implements IAuthService
│   │   │   └── projectService.ts ← Implements IProjectRepository
│   │   └── index.ts             ← Export service instances
│   │
│   ├── hooks/                   ← SOLID: SRP cho stateful logic
│   │   ├── useAuth.ts           ← Auth state + handlers
│   │   ├── useProjects.ts       ← Project CRUD state
│   │   └── useNotification.ts   ← Toast notification state
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx      ← React Context cho user state
│   │
│   ├── components/
│   │   ├── ui/                  ← Dumb components (chỉ render)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/              ← Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── features/            ← Smart components (feature logic)
│   │       ├── auth/
│   │       │   └── Login.tsx
│   │       ├── dashboard/
│   │       │   └── Dashboard.tsx
│   │       ├── projects/
│   │       │   ├── DataTable.tsx
│   │       │   ├── DataEntry.tsx
│   │       │   └── ProjectDetail.tsx
│   │       └── tracking/
│   │           ├── ProgressTracking.tsx
│   │           └── WorkflowProcess.tsx
│   │
│   ├── App.tsx                  ← Chỉ còn orchestration logic
│   └── main.tsx
│
qlkhcn-backend/                  ← Backend (Node.js + Express)
│   (như mục 3)
```

---

## 5. Áp Dụng SOLID Principles

### S — Single Responsibility Principle

> **Mỗi module/class chỉ có một lý do để thay đổi.**

**Vấn đề trong code cũ:** `App.tsx` làm quá nhiều việc — xác thực, fetch data, xử lý CRUD, quản lý routing, hiển thị notification, xử lý import Excel — tất cả trong một file 370 dòng.

**Cách sửa:** Tách ra thành các custom hooks, mỗi hook chỉ quản lý một trách nhiệm.

```typescript
// src/hooks/useAuth.ts
// Trách nhiệm DUY NHẤT: quản lý trạng thái xác thực
import { useState, useEffect } from 'react';
import { authService } from '../services';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  // Kiểm tra token còn hạn khi app khởi động
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authService.getProfile(token)
        .then(setUser)
        .catch(() => localStorage.removeItem('auth_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { token, user } = await authService.login(username, password);
      localStorage.setItem('auth_token', token);
      setUser(user);
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return { user, isLoading, login, logout };
}
```

```typescript
// src/hooks/useProjects.ts
// Trách nhiệm DUY NHẤT: quản lý danh sách project và các thao tác CRUD
import { useState, useCallback } from 'react';
import { projectService } from '../services';
import type { ResearchProject } from '../types';

export function useProjects() {
  const [projects, setProjects]   = useState<ResearchProject[]>([]);
  const [isLoading, setLoading]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (e) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const save = async (project: ResearchProject): Promise<void> => {
    const saved = await projectService.upsert(project);
    setProjects(prev => {
      const exists = prev.some(p => p.id === saved.id);
      return exists
        ? prev.map(p => p.id === saved.id ? saved : p)
        : [saved, ...prev];
    });
  };

  const remove = async (id: string): Promise<void> => {
    await projectService.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return { projects, isLoading, error, fetchAll, save, remove };
}
```

```typescript
// src/hooks/useNotification.ts
// Trách nhiệm DUY NHẤT: hiển thị thông báo tạm thời
import { useState, useCallback } from 'react';

export function useNotification(durationMs = 4000) {
  const [message, setMessage] = useState<string | null>(null);

  const notify = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), durationMs);
  }, [durationMs]);

  const dismiss = useCallback(() => setMessage(null), []);

  return { message, notify, dismiss };
}
```

Kết quả: `App.tsx` giờ chỉ còn ~60 dòng, chỉ làm đúng một việc là **kết hợp các hooks và điều hướng view**:

```typescript
// src/App.tsx — chỉ orchestration, không có business logic
import { useEffect, useState } from 'react';
import { useAuth }         from './hooks/useAuth';
import { useProjects }     from './hooks/useProjects';
import { useNotification } from './hooks/useNotification';
// ... import components

const App: React.FC = () => {
  const { user, isLoading: authLoading, login, logout } = useAuth();
  const { projects, fetchAll, save, remove }            = useProjects();
  const { message, notify, dismiss }                    = useNotification();
  const [currentView, setCurrentView]   = useState<ViewType>('dashboard');
  const [editingProject, setEditing]    = useState<ResearchProject | null>(null);

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <Login onLogin={login} />;

  return (
    <MainLayout
      user={user}
      onLogout={logout}
      currentView={currentView}
      onNavigate={setCurrentView}
      notification={message}
      onDismissNotification={dismiss}
    >
      <ViewRouter
        currentView={currentView}
        projects={projects}
        editingProject={editingProject}
        onSave={save}
        onDelete={remove}
        onEdit={setEditing}
        onNavigate={setCurrentView}
        onNotify={notify}
      />
    </MainLayout>
  );
};
```

---

### O — Open/Closed Principle

> **Mở để mở rộng, đóng để sửa đổi.** Thêm tính năng mới không nên sửa code cũ.

**Vấn đề:** Hiện tại `DataTable.tsx` có switch-case hoặc if-else cứng để render từng trạng thái dự án khác nhau. Mỗi lần thêm trạng thái mới phải vào sửa file.

**Cách sửa:** Dùng **config object** thay vì conditionals.

```typescript
// src/components/features/projects/statusConfig.ts
// Để thêm trạng thái mới: CHỈ cần thêm vào object này, không đụng vào component
import { ProjectStatus } from '../../../types';

interface StatusConfig {
  label:     string;
  bgClass:   string;
  textClass: string;
  dotClass:  string;
}

export const STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  [ProjectStatus.ONGOING]: {
    label:     'Đang thực hiện',
    bgClass:   'bg-blue-100',
    textClass: 'text-blue-800',
    dotClass:  'bg-blue-500',
  },
  [ProjectStatus.OVERDUE]: {
    label:     'Quá hạn',
    bgClass:   'bg-red-100',
    textClass: 'text-red-800',
    dotClass:  'bg-red-500',
  },
  [ProjectStatus.COMPLETED]: {
    label:     'Nghiệm thu',
    bgClass:   'bg-green-100',
    textClass: 'text-green-800',
    dotClass:  'bg-green-500',
  },
  [ProjectStatus.LIQUIDATED]: {
    label:     'Thanh lý',
    bgClass:   'bg-gray-100',
    textClass: 'text-gray-700',
    dotClass:  'bg-gray-400',
  },
};

// Component dùng config — không có if/else
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span>{status}</span>;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bgClass} ${cfg.textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}
```

---

### L — Liskov Substitution Principle

> **Subtype phải thay thế được supertype mà không làm hỏng chương trình.**

**Áp dụng:** Bất kỳ implementation nào của `IAuthService` phải hoạt động giống nhau từ góc nhìn của caller.

```typescript
// src/services/interfaces/IAuthService.ts
export interface IAuthService {
  login(username: string, password: string): Promise<{ token: string; user: User }>;
  register(username: string, password: string, role: string): Promise<User>;
  getProfile(token: string): Promise<User>;
  logout(): void;
}
```

```typescript
// src/services/api/authService.ts  — production implementation
import { httpClient } from './httpClient';
import type { IAuthService } from '../interfaces/IAuthService';

export class ApiAuthService implements IAuthService {
  async login(username: string, password: string) {
    return httpClient.post('/auth/login', { username, password });
  }
  async register(username: string, password: string, role: string) {
    return httpClient.post('/auth/register', { username, password, role });
  }
  async getProfile(token: string) {
    return httpClient.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  }
  logout() {
    localStorage.removeItem('auth_token');
  }
}
```

```typescript
// src/services/mock/mockAuthService.ts  — test/dev implementation
// Thay thế hoàn toàn ApiAuthService mà không cần đổi hook useAuth
import type { IAuthService } from '../interfaces/IAuthService';

export class MockAuthService implements IAuthService {
  async login(username: string, _password: string) {
    return {
      token: 'mock-token',
      user:  { username, role: 'admin' as const },
    };
  }
  async register(username: string, _password: string, role: string) {
    return { username, role: role as any };
  }
  async getProfile(_token: string) {
    return { username: 'test@test.com', role: 'admin' as const };
  }
  logout() {}
}
```

---

### I — Interface Segregation Principle

> **Không ép client phụ thuộc vào methods mà nó không dùng.**

**Vấn đề:** Nếu dùng một `IDataService` khổng lồ chứa cả auth lẫn CRUD, component `Login` sẽ phụ thuộc vào `getProjects`, `deleteProject`... dù nó không cần.

**Cách sửa:** Tách thành nhiều interface nhỏ, mỗi cái phục vụ một nhóm consumer.

```typescript
// src/services/interfaces/IProjectRepository.ts
// Chỉ những thứ liên quan đến Project CRUD
export interface IProjectRepository {
  getAll():                           Promise<ResearchProject[]>;
  getById(id: string):               Promise<ResearchProject | null>;
  upsert(p: ResearchProject):        Promise<ResearchProject>;
  delete(id: string):                Promise<void>;
}

// src/services/interfaces/IAuthService.ts
// Chỉ những thứ liên quan đến xác thực
export interface IAuthService {
  login(username: string, password: string): Promise<{ token: string; user: User }>;
  register(u: string, p: string, role: string): Promise<User>;
  getProfile(token: string): Promise<User>;
  logout(): void;
}

// src/services/interfaces/IExportService.ts
// Chỉ những thứ liên quan đến xuất/nhập file
export interface IExportService {
  exportToExcel(projects: ResearchProject[]): void;
  importFromExcel(file: File): Promise<Partial<ResearchProject>[]>;
}
```

Nhờ tách nhỏ như vậy:
- `Login.tsx` chỉ nhận `IAuthService` — không biết gì về project
- `DataTable.tsx` chỉ nhận `IProjectRepository` + `IExportService`
- Dễ mock từng phần khi viết test

---

### D — Dependency Inversion Principle

> **Module cấp cao không phụ thuộc vào module cấp thấp. Cả hai phụ thuộc vào abstraction.**

**Vấn đề cũ:** `App.tsx` import trực tiếp `firebaseService` và `dbService` — coupled chặt với vendor cụ thể.

```typescript
// ❌ Cũ — tightly coupled với Firebase & Supabase
import { firebaseService } from './services/firebaseService';
import { dbService }       from './services/db';
```

**Cách sửa:** Tạo `httpClient` (abstraction), tất cả services đều dùng nó. Toàn bộ app chỉ biết về **interface**, không biết về implementation.

```typescript
// src/services/api/httpClient.ts
// Lớp duy nhất biết về URL gốc của API — tất cả nơi khác dùng qua đây
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error ?? 'Lỗi không xác định');
  }

  return response.json();
}

export const httpClient = {
  get:    <T>(path: string, opts?: RequestInit) =>
            request<T>(path, { method: 'GET', ...opts }),
  post:   <T>(path: string, body: unknown, opts?: RequestInit) =>
            request<T>(path, { method: 'POST',   body: JSON.stringify(body), ...opts }),
  put:    <T>(path: string, body: unknown, opts?: RequestInit) =>
            request<T>(path, { method: 'PUT',    body: JSON.stringify(body), ...opts }),
  delete: <T>(path: string, opts?: RequestInit) =>
            request<T>(path, { method: 'DELETE', ...opts }),
};
```

```typescript
// src/services/index.ts
// ĐIỂM DUY NHẤT khởi tạo services — đổi implementation ở đây không cần đổi gì khác
import { ApiAuthService }    from './api/authService';
import { ApiProjectService } from './api/projectService';
import { ExcelExportService } from './excel/excelService';

// Để test/dev, đổi sang:
// import { MockAuthService } from './mock/mockAuthService';

export const authService:    IAuthService       = new ApiAuthService();
export const projectService: IProjectRepository = new ApiProjectService();
export const exportService:  IExportService     = new ExcelExportService();
```

---

## 6. Refactor Frontend: Services Layer

### 6.1 Project Service (`src/services/api/projectService.ts`)

```typescript
import { httpClient }  from './httpClient';
import type { IProjectRepository } from '../interfaces/IProjectRepository';
import type { ResearchProject }    from '../../types';

export class ApiProjectService implements IProjectRepository {
  async getAll(): Promise<ResearchProject[]> {
    return httpClient.get<ResearchProject[]>('/projects');
  }

  async getById(id: string): Promise<ResearchProject | null> {
    return httpClient.get<ResearchProject>(`/projects/${id}`);
  }

  async upsert(project: ResearchProject): Promise<ResearchProject> {
    return project.id
      ? httpClient.put<ResearchProject>(`/projects/${project.id}`, project)
      : httpClient.post<ResearchProject>('/projects', project);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/projects/${id}`);
  }
}
```

### 6.2 Excel Service (`src/services/excel/excelService.ts`)

```typescript
import * as XLSX from 'xlsx';
import type { IExportService } from '../interfaces/IExportService';
import type { ResearchProject } from '../../types';

// Trách nhiệm DUY NHẤT: xử lý file Excel
export class ExcelExportService implements IExportService {
  exportToExcel(projects: ResearchProject[]): void {
    const rows = projects.map(p => ({
      'Mã đề tài':       p.projectCode,
      'Tên đề tài':      p.title,
      'Chủ nhiệm':       p.leadAuthor,
      'Đơn vị':          p.department,
      'Trạng thái':      p.status,
      'Kinh phí (VNĐ)':  p.budget,
      'Bắt đầu':         p.startDate,
      'Kết thúc':        p.endDate,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Đề tài');
    XLSX.writeFile(wb, `QLKHCN_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  async importFromExcel(file: File): Promise<Partial<ResearchProject>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const wb   = XLSX.read(data, { type: 'array' });
          const ws   = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
          resolve(rows.map(this.rowToProject));
        } catch (err) {
          reject(new Error('File Excel không đúng định dạng'));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  private rowToProject(row: Record<string, unknown>): Partial<ResearchProject> {
    return {
      projectCode:  row['Mã đề tài']  as string,
      title:        row['Tên đề tài'] as string,
      leadAuthor:   row['Chủ nhiệm']  as string,
      department:   row['Đơn vị']     as string,
      budget:       Number(row['Kinh phí (VNĐ)']) || 0,
      startDate:    row['Bắt đầu']    as string,
      endDate:      row['Kết thúc']   as string,
      expectedProducts: [],
      actualProducts:   [],
      history:          [],
      categories:       [],
    };
  }
}
```

---

## 7. Refactor Frontend: State Management

### Auth Context (`src/contexts/AuthContext.tsx`)

```typescript
// Tách user state ra Context để tránh prop drilling qua nhiều tầng component
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

interface AuthContextValue {
  user:      User | null;
  isLoading: boolean;
  login:     (username: string, password: string) => Promise<boolean>;
  logout:    () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Custom hook để dùng context — ném lỗi rõ ràng nếu dùng ngoài Provider
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext phải dùng bên trong <AuthProvider>');
  return ctx;
}
```

---

## 8. Refactor Frontend: Components

### Nguyên Tắc Phân Chia Component

```
UI Components (src/components/ui/)       — "Dumb", nhận props, không có state phức tạp
Layout Components (src/components/layout/) — Cấu trúc trang
Feature Components (src/components/features/) — "Smart", dùng hooks, có logic
```

### Ví Dụ: Button Component Tái Sử Dụng

```typescript
// src/components/ui/Button.tsx
// Open/Closed: thêm variant mới chỉ cần thêm vào VARIANT_CLASSES
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize    = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
  danger:    'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-400',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm:  'px-3 py-1.5 text-xs',
  md:  'px-4 py-2 text-sm',
  lg:  'px-6 py-3 text-base',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', isLoading, children, className, disabled, ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className ?? ''}
      `}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
```

### Ví Dụ: DataTable Sau Refactor

```typescript
// src/components/features/projects/DataTable.tsx
// Component chỉ quan tâm đến hiển thị và gọi callbacks — không tự fetch data
interface DataTableProps {
  projects:  ResearchProject[];
  onEdit:    (p: ResearchProject) => void;
  onDelete:  (id: string) => void;
  onView:    (p: ResearchProject) => void;
  onExport:  () => void;
  onImport:  (file: File) => Promise<void>;
  userRole:  string;
}

export function DataTable({ projects, onEdit, onDelete, onView, onExport, onImport, userRole }: DataTableProps) {
  const [search, setSearch]     = useState('');
  const [statusFilter, setFilter] = useState<string>('');

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.leadAuthor?.toLowerCase().includes(search.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên, chủ nhiệm, mã đề tài..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-72 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onExport}>
            Xuất Excel
          </Button>
          <ImportButton onImport={onImport} />  {/* Tách ra component riêng */}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Mã ĐT', 'Tên đề tài', 'Chủ nhiệm', 'Trạng thái', 'Kinh phí', 'Thao tác'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(p => (
              <ProjectRow
                key={p.id}
                project={p}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                canDelete={userRole === 'admin'}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-slate-400">Không tìm thấy đề tài nào</p>
        )}
      </div>
    </div>
  );
}
```

---

## 9. Deploy Lên NhanHoa VPS

### 9.1 Build Frontend

```bash
# Trong thư mục frontend
VITE_API_URL=https://api.qlkhcn.truong.edu.vn/api/v1 npm run build
# Kết quả: thư mục dist/
```

### 9.2 Upload Lên VPS

```bash
# Upload frontend build
scp -r dist/ deploy@103.x.x.x:/var/www/qlkhcn/frontend/

# Upload backend
scp -r qlkhcn-backend/ deploy@103.x.x.x:/var/www/qlkhcn/backend/
```

### 9.3 Chạy Backend Với PM2

```bash
# SSH vào VPS
ssh deploy@103.x.x.x

cd /var/www/qlkhcn/backend

# Cài dependencies
npm install --production

# Build TypeScript
npm run build

# Khởi động với PM2
pm2 start dist/server.js --name qlkhcn-api --env production

# Tự khởi động khi VPS reboot
pm2 save
pm2 startup
```

---

## 10. Nginx & SSL Config

### 10.1 Config Nginx

```bash
sudo nano /etc/nginx/sites-available/qlkhcn
```

```nginx
# /etc/nginx/sites-available/qlkhcn

# Frontend
server {
    listen 80;
    server_name qlkhcn.truong.edu.vn www.qlkhcn.truong.edu.vn;

    root /var/www/qlkhcn/frontend;
    index index.html;

    # SPA routing — tất cả route trả về index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets tĩnh
    location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API
server {
    listen 80;
    server_name api.qlkhcn.truong.edu.vn;

    location / {
        proxy_pass         http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Kích hoạt config
sudo ln -s /etc/nginx/sites-available/qlkhcn /etc/nginx/sites-enabled/
sudo nginx -t      # kiểm tra syntax
sudo systemctl reload nginx
```

### 10.2 Cài SSL Miễn Phí (Let's Encrypt)

```bash
# Cài SSL cho cả 2 domain cùng lúc
sudo certbot --nginx \
  -d qlkhcn.truong.edu.vn \
  -d www.qlkhcn.truong.edu.vn \
  -d api.qlkhcn.truong.edu.vn

# Certbot tự động sửa Nginx config để dùng HTTPS + redirect HTTP → HTTPS
# Tự động gia hạn mỗi 90 ngày
sudo certbot renew --dry-run   # test thử
```

---

## 11. CI/CD Với GitHub Actions

Tạo file `.github/workflows/deploy.yml` trong repo:

```yaml
name: Deploy to NhanHoa VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install & Build Frontend
        working-directory: .
        run: |
          npm ci
          VITE_API_URL=${{ secrets.API_URL }} npm run build

      - name: Install & Build Backend
        working-directory: ./qlkhcn-backend
        run: |
          npm ci
          npm run build

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host:     ${{ secrets.VPS_HOST }}
          username: deploy
          key:      ${{ secrets.VPS_SSH_KEY }}
          script: |
            # Deploy frontend
            rsync -avz --delete dist/ /var/www/qlkhcn/frontend/

            # Deploy backend
            rsync -avz --delete qlkhcn-backend/dist/ /var/www/qlkhcn/backend/dist/
            cp qlkhcn-backend/package.json /var/www/qlkhcn/backend/
            cd /var/www/qlkhcn/backend && npm ci --production

            # Restart backend
            pm2 restart qlkhcn-api

            echo "Deploy thành công!"
```

**Thêm Secrets vào GitHub repo** (Settings → Secrets → Actions):

| Secret | Giá trị |
|---|---|
| `VPS_HOST` | IP VPS của NhanHoa |
| `VPS_SSH_KEY` | Nội dung private key SSH |
| `API_URL` | `https://api.qlkhcn.truong.edu.vn/api/v1` |

---

## 12. Checklist Hoàn Thành

### Hạ Tầng NhanHoa

- [ ] VPS đã mua và SSH được
- [ ] Domain đã trỏ A record về IP VPS
- [ ] PostgreSQL đã cài, database và user đã tạo
- [ ] Schema SQL đã chạy thành công
- [ ] Nginx đã config và reload không lỗi
- [ ] SSL Let's Encrypt đã cài cho cả 2 subdomain
- [ ] PM2 đã chạy backend, `pm2 list` hiện `online`

### Backend

- [ ] File `.env` đã điền đủ và đúng
- [ ] `POST /api/v1/auth/login` trả về token
- [ ] `GET /api/v1/projects` (có Bearer token) trả về array
- [ ] `POST`, `PUT`, `DELETE` /projects hoạt động đúng
- [ ] Rate limiting hoạt động (thử gửi 21 request login liên tiếp)

### Frontend Refactor

- [ ] Xóa `firebase` và `@supabase/supabase-js` khỏi `package.json`
- [ ] `VITE_API_URL` đã set đúng trong build
- [ ] `useAuth`, `useProjects`, `useNotification` đã tạo và hoạt động
- [ ] `AuthContext` đã bọc toàn bộ app trong `main.tsx`
- [ ] `httpClient.ts` là điểm duy nhất gọi `fetch`
- [ ] Không còn import trực tiếp `firebaseService` hoặc `supabaseClient` trong components
- [ ] `StatusBadge` dùng config object, không có if/else
- [ ] `Button` component tái sử dụng ở tất cả nơi
- [ ] `App.tsx` dưới 80 dòng

### SOLID

- [ ] **S:** Mỗi hook chỉ quản lý một loại state
- [ ] **O:** Thêm ProjectStatus mới không cần sửa component
- [ ] **L:** `MockAuthService` thay thế được `ApiAuthService`
- [ ] **I:** Login component chỉ nhận `IAuthService`, không nhận `IProjectRepository`
- [ ] **D:** App không import trực tiếp implementation, chỉ import từ `services/index.ts`

### CI/CD

- [ ] GitHub Actions secrets đã thêm đủ
- [ ] Push lên `main` trigger deploy tự động
- [ ] Deploy thành công, app chạy trên domain NhanHoa

---

> **Ghi chú:** Tài liệu này dựa trên codebase tại `github.com/NLTA1236599/app-qlKHCN2`. Stack mới: Node.js 20 + Express + PostgreSQL 16 + Nginx + PM2 + Let's Encrypt, hosted trên NhanHoa VPS.
