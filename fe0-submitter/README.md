# fe0-submitter — Người nộp đề tài Portal

Separate Vite app for research project submitters (`role: user` or `submitter`).

## Development

```bash
cd fe0-submitter
npm install
npm run dev
```

Runs at [http://localhost:5175](http://localhost:5175) with API proxy to `http://127.0.0.1:3001`.

## Routes

| Route | Page |
|---|---|
| `/login` | Login |
| `/de-tai` | Đề tài của tôi (project list) |
| `/de-tai/dang-ky` | Register new project (placeholder) |
| `/de-tai/:id` | Project detail (placeholder) |
| `/de-tai/tien-do` | Progress tracking (placeholder) |
| `/thong-bao` | Notifications (placeholder) |

## Docker

```bash
docker compose up fe0-submitter
```

Served at [http://localhost:5175](http://localhost:5175).
