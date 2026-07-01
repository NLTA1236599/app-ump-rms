# Fix: Uploaded File Data Lost After Re-login

> **Bug:** Excel files uploaded to the app disappear after logging out and logging back in with the admin account.  
> **Root cause:** Uploaded files are saved inside the Docker container's ephemeral filesystem — data is wiped on every container restart.

---

## Table of Contents

1. [Root Cause Analysis](#1-root-cause-analysis)
2. [Fix 1 — Persist Upload Folder with Bind Mount](#2-fix-1--persist-upload-folder-with-bind-mount)
3. [Fix 2 — Save File Metadata to PostgreSQL](#3-fix-2--save-file-metadata-to-postgresql)
4. [Fix 3 — Verify PostgreSQL Volume](#4-fix-3--verify-postgresql-volume)
5. [Complete docker-compose.yml](#5-complete-docker-composeyml)
6. [Verify the Fix](#6-verify-the-fix)
7. [Checklist](#7-checklist)

---

## 1. Root Cause Analysis

```
User uploads file
       ↓
Backend saves to /app/uploads/file.xlsx   ← inside Docker container
       ↓
User logs out → container restarts
       ↓
/app/uploads/ is wiped ❌  (container filesystem is ephemeral)
       ↓
Admin logs back in → file is gone
```

There are three places where data can be lost. Check all three:

| # | Cause | How to Identify |
|---|-------|----------------|
| 1 | Files saved inside the container, no bind mount | `docker-compose.yml` has no `volumes` under `backend` |
| 2 | File metadata not saved to PostgreSQL | Upload handler only calls `fs.writeFile`, no `db.query` |
| 3 | PostgreSQL volume not declared | `volumes:` block missing or incomplete in `docker-compose.yml` |

---

## 2. Fix 1 — Persist Upload Folder with Bind Mount

This is the **primary fix**. Map the container's upload folder to a folder on the host machine so files survive container restarts.

### Step 1 — Create the uploads folder on the host

Run this at the project root (same level as `docker-compose.yml`):

```bash
mkdir -p uploads
```

### Step 2 — Add the bind mount to docker-compose.yml

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    container_name: rms-be
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./uploads:/app/uploads        # ← ADD THIS LINE
    environment:
      # ... your existing env vars
```

### Step 3 — Confirm the upload path in your backend

Make sure your Multer (or equivalent) config points to `/app/uploads`:

```ts
// backend/src/config/multer.ts
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? '/app/uploads'

// Ensure directory exists on startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}-${file.originalname}`)
  },
})

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['.xlsx', '.xls']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) return cb(null, true)
    cb(new Error('Only Excel files are allowed'))
  },
})
```

Add `UPLOAD_DIR` to your `.env`:

```env
UPLOAD_DIR=/app/uploads
```

And in `docker-compose.yml` under the `backend` environment block:

```yaml
environment:
  UPLOAD_DIR: /app/uploads
```

### Step 4 — Rebuild and restart

```bash
docker compose up -d --build backend
```

---

## 3. Fix 2 — Save File Metadata to PostgreSQL

Saving the file to disk is not enough. The file's **path, name, and association to a project** must be stored in the database so the app can find it after restart.

### Step 1 — Create the database table

```sql
CREATE TABLE IF NOT EXISTS project_files (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename     TEXT        NOT NULL,
  original_name TEXT       NOT NULL,
  file_path    TEXT        NOT NULL,
  uploaded_by  UUID        NOT NULL REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Run this migration:

```bash
# If using db.query directly
docker exec -it $(docker compose ps -q postgres) \
  psql -U ump_rms_user -d ump_rms_db -c "
    CREATE TABLE IF NOT EXISTS project_files (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id    UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      filename      TEXT        NOT NULL,
      original_name TEXT        NOT NULL,
      file_path     TEXT        NOT NULL,
      uploaded_by   UUID        NOT NULL REFERENCES users(id),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  "
```

### Step 2 — Update the upload controller

```ts
// backend/src/controllers/uploadController.ts
import { Request, Response } from 'express'
import { db } from '../db'

export const uploadProjectFile = async (req: Request, res: Response) => {
  const file = req.file

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  const { projectId } = req.body
  const uploadedBy    = (req as any).user.id  // from JWT middleware

  try {
    // ✅ Save metadata to DB — survives container restarts
    const result = await db.query(
      `INSERT INTO project_files
         (project_id, filename, original_name, file_path, uploaded_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, original_name, created_at`,
      [projectId, file.filename, file.originalname, file.path, uploadedBy]
    )

    return res.status(201).json({
      message: 'File uploaded successfully',
      file:    result.rows[0],
    })
  } catch (error) {
    console.error('[Upload] DB insert failed:', error)
    return res.status(500).json({ message: 'Failed to save file record' })
  }
}

// GET: Retrieve files for a project
export const getProjectFiles = async (req: Request, res: Response) => {
  const { projectId } = req.params

  const result = await db.query(
    `SELECT id, original_name, file_path, created_at
     FROM project_files
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [projectId]
  )

  return res.json({ files: result.rows })
}
```

### Step 3 — Register the routes

```ts
// backend/src/routes/uploadRoutes.ts
import { Router } from 'express'
import { upload } from '../config/multer'
import { uploadProjectFile, getProjectFiles } from '../controllers/uploadController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/',            authenticate, upload.single('file'), uploadProjectFile)
router.get('/:projectId',  authenticate, getProjectFiles)

export default router
```

```ts
// backend/src/index.ts
import uploadRoutes from './routes/uploadRoutes'

app.use('/api/v1/files', uploadRoutes)
```

---

## 4. Fix 3 — Verify PostgreSQL Volume

If PostgreSQL itself loses data on restart, the named volume may be missing or misconfigured.

### Check the current state

```bash
# List existing Docker volumes
docker volume ls | grep ump_rms
```

Expected output:
```
local     app-ump-rms_ump_rms_pgdata
```

If nothing appears, the volume was never created and all DB data is lost on restart.

### Ensure the volume is declared correctly

```yaml
# docker-compose.yml — bottom of file
volumes:
  ump_rms_pgdata:    # ← must be declared here at the top level
```

AND referenced under the `postgres` service:

```yaml
services:
  postgres:
    volumes:
      - ump_rms_pgdata:/var/lib/postgresql/data   # ← named volume, not bind mount
```

> **Important:** A named volume (`ump_rms_pgdata:`) persists data permanently.  
> A bind mount (`./data:/var/lib/...`) also works but requires the host folder to exist first.

---

## 5. Complete docker-compose.yml

Here is the full corrected file with all three fixes applied:

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
      - ump_rms_pgdata:/var/lib/postgresql/data   # Fix 3: named volume
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
      - ./uploads:/app/uploads                    # Fix 1: bind mount for uploads
    environment:
      PORT: "3001"
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_NAME: ump_rms_db
      DB_USER: ump_rms_user
      DB_PASSWORD: change_me
      JWT_SECRET: change-this-to-a-long-random-string
      UPLOAD_DIR: /app/uploads
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
      - ./assets-test:/usr/share/nginx/html/assets-test:ro
    depends_on:
      - backend

volumes:
  ump_rms_pgdata:                                 # Fix 3: top-level volume declaration
```

---

## 6. Verify the Fix

### Step 1 — Apply all changes and restart

```bash
# Create the uploads folder on host
mkdir -p uploads

# Rebuild and restart
docker compose down
docker compose up -d --build

# Run DB migration for project_files table
docker exec -it $(docker compose ps -q postgres) \
  psql -U ump_rms_user -d ump_rms_db -f /dev/stdin << 'EOF'
CREATE TABLE IF NOT EXISTS project_files (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename      TEXT        NOT NULL,
  original_name TEXT        NOT NULL,
  file_path     TEXT        NOT NULL,
  uploaded_by   UUID        NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
EOF
```

### Step 2 — Test the fix end-to-end

```bash
# 1. Upload a file via the app UI

# 2. Check the file exists on the HOST machine (not just inside container)
ls -la uploads/

# 3. Check the record exists in the database
docker exec -it $(docker compose ps -q postgres) \
  psql -U ump_rms_user -d ump_rms_db -c "SELECT * FROM project_files;"

# 4. Restart the backend container
docker compose restart backend

# 5. Check the file is still on disk
ls -la uploads/

# 6. Log back in as admin and verify the file is still visible
```

### Step 3 — Confirm the bind mount is active

```bash
# Inspect the backend container's mounts
docker inspect rms-be --format '{{ json .Mounts }}' | python3 -m json.tool
```

Expected output includes:
```json
{
  "Type": "bind",
  "Source": "/mnt/c/Users/Admin/Documents/GitHub/app-ump-rms/uploads",
  "Destination": "/app/uploads",
  "Mode": "",
  "RW": true
}
```

---

## 7. Checklist

### Docker
- [ ] `./uploads:/app/uploads` bind mount added to `backend` service
- [ ] `uploads/` folder created on host machine
- [ ] `ump_rms_pgdata` named volume declared at top level of `docker-compose.yml`
- [ ] `docker compose down && docker compose up -d --build` run after changes

### Backend
- [ ] Multer `destination` points to `process.env.UPLOAD_DIR` (`/app/uploads`)
- [ ] `UPLOAD_DIR=/app/uploads` added to `.env` and `docker-compose.yml`
- [ ] Upload controller saves file metadata to `project_files` table
- [ ] `getProjectFiles` endpoint returns files from DB, not from scanning the folder

### Database
- [ ] `project_files` table created with migration
- [ ] Upload inserts a row with `file_path`, `original_name`, `project_id`, `uploaded_by`
- [ ] Query returns correct files after container restart

### End-to-End Test
- [ ] Upload Excel file → visible in app ✅
- [ ] Restart backend container → file still on disk ✅
- [ ] Log out and log back in → file still visible in app ✅
- [ ] Admin account sees all uploaded files ✅

---

*Generated for RMS – UMP project · June 2026*
