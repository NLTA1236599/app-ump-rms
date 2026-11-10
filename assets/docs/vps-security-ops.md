# Checklist vận hành bảo mật VPS (T01.4, T05, T11)

Cursor không tự SSH/chạy SQL trên production. Người vận hành thực hiện sau khi đã `git pull` bản sửa trong repo.

## T01.4 — Postgres không còn lộ ra internet + xoay secret

1. Đồng bộ `docker-compose.yml` (port `127.0.0.1:5432` / `3001` / `5173`–`5175`) và `deploy/postgres/pg_hba.conf`.
2. Áp dụng schema (thêm cột khóa đăng nhập `failed_login_attempts` / `locked_until`):

```bash
docker compose exec backend npm run migrate
```

3. Recreate:

```bash
cd /path/to/app-ump-rms
docker compose up -d
docker compose config | grep -n -B1 -A3 "published"
ss -tlnp | grep -E "5432|3001|5173"
```

Từ máy **bên ngoài** VPS: `nc -zv <public-ip> 5432` phải **closed/filtered**. Trên VPS không được thấy `0.0.0.0:5432`.

4. **Xoay mật khẩu** vì DB từng mở ra internet:

```bash
# Trong container Postgres
docker compose exec postgres psql -U ump_rms_user -d ump_rms_db -c "ALTER USER ump_rms_user WITH PASSWORD 'điền-mật-khẩu-mới';"
```

Cập nhật `DB_PASSWORD` (và `POSTGRES_PASSWORD`) trên VPS, rồi recreate backend. Cân nhắc xoay `JWT_SECRET` (sẽ đăng xuất toàn bộ người dùng) và mật khẩu SMTP.

5. Truy cập DB từ máy cá nhân: **SSH tunnel**, không mở lại cổng:

```bash
ssh -L 5432:127.0.0.1:5432 deploy@103.159.50.23
```

6. (Tùy chọn) TLS nội bộ Postgres: tạo cert tự ký **không commit**:

```bash
mkdir -p certs/db
openssl req -new -x509 -days 3650 -nodes \
  -subj "/CN=postgres" \
  -out certs/db/server.crt \
  -keyout certs/db/server.key
chmod 600 certs/db/server.key
```

Sau đó bật `ssl=on` trong command Postgres, mount `./certs/db:/certs:ro`, và đặt `DB_SSLMODE=require` cho backend. File `certs/` đã nằm trong `.gitignore`.

## T05 — Production không ghi OTP vào log

```bash
grep -n LOG_OTP_FOR_DEV .env || true
docker compose logs backend --tail=200 | grep -i otp
```

Không được thấy mã OTP 6 số. Nếu SMTP chưa cấu hình, backend **fail closed** (không fallback ghi OTP).

## T11 — Xóa 3 tài khoản test

Xem `assets/docs/cleanup-test-users.sql`. **Backup DB trước**, xem trước rồi mới `COMMIT`.
