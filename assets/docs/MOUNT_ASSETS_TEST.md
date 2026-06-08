# MOUNT_ASSETS_TEST — Deployment Guide

Mount the `assets-test` directory from the host machine into the frontend container so the React app can access Excel files at runtime.

---

## Prerequisites

- Docker + Docker Compose installed
- Project root: `app-ump-rms/`
- The `assets-test/` folder exists on the host (see structure below)

---

## 1. Directory Structure

Create the `assets-test` folder at the project root if it does not already exist:

```
app-ump-rms/
├── assets-test/                 ← host directory (mount source)
│   ├── template_import.xlsx
│   └── ...other Excel files...
├── backend/
├── frontend/
└── docker-compose.yml
```

```bash
mkdir -p assets-test
```

Place all Excel files that the frontend needs inside this folder.

---

## 2. Frontend Dockerfile

The frontend is served by Nginx inside the container. The Excel files must be copied into a location Nginx can serve statically.

Add a volume mount point to the Dockerfile **or** rely entirely on the Compose bind mount (recommended — no Dockerfile change needed).

**`frontend/Dockerfile`** — ensure Nginx serves from `/usr/share/nginx/html`:

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

# Mount target directory must exist
RUN mkdir -p /usr/share/nginx/html/assets-test

EXPOSE 80
```

The `RUN mkdir -p` ensures the mount target exists before Docker binds the host directory.

---

## 3. docker-compose.yml

Add a `volumes` bind mount to the `frontend` service:

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
    environment:
      PORT: "3001"
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_NAME: ump_rms_db
      DB_USER: ump_rms_user
      DB_PASSWORD: change_me
      JWT_SECRET: change-this-to-a-long-random-string
      FRONTEND_ORIGIN: http://localhost:5173,http://127.0.0.1:5173,http://rms-fe:5173
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
      - ./assets-test:/usr/share/nginx/html/assets-test:ro   # ← ADD THIS
    depends_on:
      - backend

volumes:
  ump_rms_pgdata:
```

### Volume flag explained

| Part | Meaning |
|------|---------|
| `./assets-test` | Host path — relative to `docker-compose.yml` |
| `/usr/share/nginx/html/assets-test` | Container path — Nginx serves files from here |
| `:ro` | Read-only — container cannot modify host files |

---

## 4. Nginx Configuration

Ensure Nginx is configured to serve static files from the mount path.

**`frontend/nginx.conf`:**

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Serve assets-test files directly
    location /assets-test/ {
        alias /usr/share/nginx/html/assets-test/;
        autoindex off;
        add_header Content-Disposition "attachment";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

After this, Excel files are accessible at:
```
http://localhost:5173/assets-test/template_import.xlsx
```

---

## 5. Accessing Files from React

Fetch or trigger a download of Excel files using their public path:

```ts
// Direct download link
const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/assets-test/template_import.xlsx'
  link.download = 'template_import.xlsx'
  link.click()
}

// Or read with fetch (e.g. for SheetJS parsing)
import * as XLSX from 'xlsx'

const loadExcel = async (filename: string) => {
  const res = await fetch(`/assets-test/${filename}`)
  const buffer = await res.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  return workbook
}
```

---

## 6. Deploy

```bash
# Rebuild and restart only the frontend container
docker compose up -d --build frontend

# Verify the mount is active
docker exec rms-fe ls /usr/share/nginx/html/assets-test

# Test access in browser
curl http://localhost:5173/assets-test/template_import.xlsx -I
```

Expected response header:
```
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

---

## 7. Adding New Excel Files

No container rebuild is needed. Because the mount is a **bind mount**, any file added to `assets-test/` on the host is **immediately available** inside the container.

```bash
# Add a new file on the host
cp new_template.xlsx app-ump-rms/assets-test/

# Instantly accessible at:
# http://localhost:5173/assets-test/new_template.xlsx
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `404` on `/assets-test/file.xlsx` | Mount not applied | Run `docker compose up -d --build frontend` |
| `403 Forbidden` | Nginx `autoindex` or permissions | Check `nginx.conf`; ensure files are readable |
| Files not updating | Named volume cached old data | Use bind mount (`:ro`), not a named volume |
| `mkdir` error in Dockerfile | Target path conflict | Ensure `RUN mkdir -p` is in the Dockerfile |
