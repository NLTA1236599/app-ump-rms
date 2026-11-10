# HƯỚNG DẪN KHẮC PHỤC LỖI BẢO MẬT UMP-RMS (DÀNH CHO CURSOR)

> **Nguồn:** Báo cáo kiểm thử bảo mật & hiệu năng `https://www.ump-khcn.com` ngày 28/08/2026.
> **Mục tiêu:** Khắc phục toàn bộ lỗ hổng trong báo cáo theo thứ tự ưu tiên, mỗi lỗi có phạm vi, các bước làm và tiêu chí nghiệm thu rõ ràng.

---

## 0. QUY TẮC LÀM VIỆC CHO CURSOR (ĐỌC TRƯỚC KHI SỬA)

1. **Không đoán đường dẫn file.** Dùng tìm kiếm trong repo (grep / codebase search) để xác định đúng file trước khi sửa. Các từ khóa gợi ý có trong từng task.
2. **Mỗi task = 1 nhánh + 1 commit riêng**, đặt tên `fix/sec-<mã task>-<mô tả ngắn>` (ví dụ `fix/sec-t03-upgrade-xlsx`). Không gộp nhiều lỗi vào một commit.
3. **Phân biệt 2 loại việc:**
   - 🧑‍💻 **[REPO]** — sửa code/cấu hình trong repo: Cursor làm được.
   - 🖥️ **[VPS]** — thao tác trực tiếp trên máy chủ (UFW, sshd, pg_hba, chạy SQL trên DB production): **Cursor KHÔNG tự chạy**, chỉ soạn lệnh/tài liệu để người vận hành (Annie) thực hiện thủ công.
4. **Không bao giờ** commit file `.env`, mật khẩu, JWT secret, SMTP credentials. Dùng `.env.example` với giá trị giả.
5. **Giữ kiến trúc:** Clean Architecture (Domain / Application / Infrastructure / Api), SOLID. Middleware, rate-limit, error handler đặt ở lớp **Api**; truy cập DB đặt ở **Infrastructure**; quy tắc nghiệp vụ (chính sách mật khẩu, khóa tài khoản) đặt ở **Domain/Application**.
6. **Thay đổi response API** phải cập nhật đồng thời **cả hai frontend** (app chính và `/admin/`) cùng test liên quan.
7. Thông báo hiển thị cho người dùng viết bằng **tiếng Việt**.
8. Sau mỗi task chạy đủ: `typecheck` → `lint` → `test` → `build`. Chỉ báo hoàn thành khi tất cả đều pass.
9. Nếu gặp điểm chưa chắc chắn (tên bảng, tên biến môi trường, cách đang dùng một thư viện) → **hỏi lại**, không tự suy diễn.

---

## 1. BỐI CẢNH HỆ THỐNG

| Thành phần | Công nghệ |
|---|---|
| Frontend chính | React 18.3.1 + TypeScript + Vite (SPA) |
| Admin panel | React SPA riêng tại `/admin/`, token lưu ở `localStorage.admin_user` |
| Backend | Node.js + Express + TypeScript, prefix `/api/v1` |
| Reverse proxy | Caddy (HTTPS tự động) — Express nằm **sau Caddy** |
| Database | PostgreSQL (SCRAM-SHA-256), chạy trong Docker Compose |
| Xác thực | JWT (`auth_token` trong localStorage) + OTP 6 số qua email (SMTP) |
| Hạ tầng | Ubuntu 24.04, OpenSSH 9.6p1, Docker Compose v2, UFW |

---

## 2. BẢNG TỔNG HỢP & THỨ TỰ THỰC HIỆN

| Mã | Ưu tiên | Vấn đề | Phạm vi | Giai đoạn |
|---|---|---|---|---|
| T01 | 🔴 | PostgreSQL port 5432 lộ ra internet, không SSL | 🧑‍💻 repo + 🖥️ VPS | **1 – Làm ngay** |
| T02 | 🔴 | `xlsx` 0.18.5 dính CVE-2023-30533, CVE-2024-22363 | 🧑‍💻 repo | **1 – Làm ngay** |
| T03 | 🟠 | SSH đang bật đăng nhập bằng mật khẩu | 🖥️ VPS | **1 – Làm ngay** |
| T04 | 🟠 | Lộ thông tin nội bộ (lệnh Docker, OTP, framework Express) | 🧑‍💻 repo | 2 |
| T05 | ⚠️ | Xác nhận production không ghi OTP vào log | 🧑‍💻 repo + 🖥️ VPS | 2 |
| T06 | 🟠 | `axios` (admin), `elliptic`, `lodash`, `react-router` có CVE/chưa rõ version | 🧑‍💻 repo | 2 |
| T07 | 🟡 | User enumeration qua `register` | 🧑‍💻 repo | 3 |
| T08 | 🟡 | Không rate-limit riêng cho login / verify-otp | 🧑‍💻 repo | 3 |
| T09 | 🟡 | Chính sách mật khẩu yếu | 🧑‍💻 repo | 3 |
| T10 | 🟡 | Chưa kiểm chứng phân quyền endpoint admin | 🧑‍💻 repo | 3 |
| T11 | 🧹 | Dọn 3 tài khoản test khỏi DB | 🖥️ VPS | 3 |
| T12 | 🟡 | JWT trong localStorage → httpOnly cookie | 🧑‍💻 repo | 4 – **cần Annie duyệt trước** |
| T13 | 🔵 | Cải thiện nhất quán lỗi/UX (tùy chọn) | 🧑‍💻 repo | 4 |

---

# GIAI ĐOẠN 1 — LÀM NGAY

## T01 — 🔴 PostgreSQL port 5432 lộ ra internet

**Vấn đề:** Port 5432 truy cập được từ internet và server trả `N` cho SSLRequest (chưa bật SSL). Nguyên nhân gốc: `docker-compose.yml` publish port ra mọi interface, và **Docker ghi thẳng vào chuỗi `DOCKER` của iptables nên quy tắc `ufw deny 5432` không có tác dụng**. Vì vậy phải sửa ở `docker-compose.yml`, không phải ở UFW.

### T01.1 — 🧑‍💻 [REPO] Sửa `docker-compose.yml`

Tìm service PostgreSQL (từ khóa: `postgres`, `5432`, `ports:`).

- **Phương án khuyến nghị:** backend và DB cùng mạng Docker Compose nên backend kết nối qua tên service (ví dụ `db:5432`), **không cần publish port**. Xóa hẳn mục `ports` của service DB.
- **Nếu cần truy cập từ máy host** (chạy migration, backup): chỉ bind vào loopback.

```yaml
services:
  db:
    image: postgres:16        # giữ nguyên image/version hiện có
    # ❌ XÓA dòng publish ra mọi interface:
    # ports:
    #   - "5432:5432"
    #
    # ✅ Chỉ khi thật sự cần truy cập từ host:
    ports:
      - "127.0.0.1:5432:5432"
```

- Rà soát **toàn bộ** các service khác trong compose: mọi `ports:` dạng `"HOST:CONTAINER"` không có `127.0.0.1` đều đang mở ra internet. Chỉ Caddy (80/443) được phép như vậy.
- Kiểm tra chuỗi kết nối của backend (từ khóa `DATABASE_URL`, `PGHOST`, `new Pool`) để chắc chắn dùng tên service, không dùng IP public `103.159.50.23`.

### T01.2 — 🧑‍💻 [REPO] Bật SSL cho PostgreSQL (phòng thủ nhiều lớp)

Sau khi đóng port, SSL không còn là yêu cầu cấp bách nhưng vẫn nên bật để mã hóa dữ liệu giữa backend ↔ DB.

```yaml
  db:
    command: >
      postgres
      -c ssl=on
      -c ssl_cert_file=/certs/server.crt
      -c ssl_key_file=/certs/server.key
    volumes:
      - ./certs/db:/certs:ro     # cert/key KHÔNG commit vào git → thêm vào .gitignore
```

- File key phải có quyền `600` và thuộc user `postgres` trong container (thường uid 999).
- Backend: thêm `?sslmode=require` vào connection string, hoặc cấu hình `ssl` trong `pg` Pool (nếu dùng cert tự ký nội bộ thì cấu hình CA tương ứng, không tắt kiểm tra một cách vô điều kiện ở production).
- Cung cấp script/ghi chú hướng dẫn tạo cert tự ký (`openssl req -new -x509 -days 3650 -nodes ...`) trong `docs/`, **không** commit cert thật.

### T01.3 — 🧑‍💻 [REPO] Chuẩn bị `pg_hba.conf` giới hạn truy cập

Soạn file mẫu `docker/postgres/pg_hba.conf` và mount vào container (`-c hba_file=...`):

```
# TYPE   DATABASE  USER  ADDRESS          METHOD
local    all       all                    scram-sha-256
hostssl  all       all   172.16.0.0/12    scram-sha-256   # mạng Docker nội bộ — chỉnh theo subnet thực tế
host     all       all   0.0.0.0/0        reject
```

> Gợi ý: đặt subnet cố định cho network trong compose để dòng `hostssl` chính xác thay vì dùng dải rộng.

### T01.4 — 🖥️ [VPS] Việc thủ công cho người vận hành (Cursor chỉ viết lại thành checklist trong `docs/`)

1. Deploy lại: `docker compose up -d` (chỉ recreate service DB bị đổi).
2. **Xoay (rotate) mật khẩu** `postgres` và user ứng dụng, vì DB từng mở ra internet; cập nhật `.env` trên VPS. Cân nhắc thêm xoay `JWT_SECRET` (lưu ý: sẽ đăng xuất toàn bộ người dùng) và mật khẩu SMTP.
3. Xem log PostgreSQL để rà các kết nối lạ trong thời gian cổng mở.
4. Nếu cần truy cập DB từ máy cá nhân: dùng **SSH tunnel** (`ssh -L 5432:127.0.0.1:5432 user@103.159.50.23`), không mở lại cổng.
5. (Tùy chọn) Đặt thêm quy tắc chặn ở chuỗi `DOCKER-USER` của iptables để các port Docker mở nhầm sau này không lọt ra ngoài.

### ✅ Nghiệm thu T01

- Từ máy **bên ngoài** VPS: `nc -zv 103.159.50.23 5432` hoặc `nmap -p 5432 103.159.50.23` → **closed/filtered**.
- Trên VPS: `ss -tlnp | grep 5432` → không có `0.0.0.0:5432`; nếu còn thì chỉ là `127.0.0.1:5432`.
- Ứng dụng vẫn đăng nhập, tạo/đọc đề tài bình thường.
- `docker compose config` không còn `published` nào ngoài 80/443 (và loopback nếu có).

---

## T02 — 🔴 Thư viện `xlsx` 0.18.5 (SheetJS) có CVE

**Vấn đề:** CVE-2023-30533 (Prototype Pollution, ảnh hưởng < 0.19.3) và CVE-2024-22363 (ReDoS, ảnh hưởng < 0.20.2). Được kích hoạt khi người dùng tải lên file Excel độc hại ở tính năng **import đề tài**. Gói `xlsx` trên npm bị đóng băng ở 0.18.5; bản vá chỉ có trên CDN chính thức của SheetJS.

### Bước 1 — Tìm nơi dùng

Tìm trong **cả frontend chính, admin và backend**: `from 'xlsx'`, `require('xlsx')`, `XLSX.read`, `XLSX.utils`, `sheet_to_json`. Liệt kê các file bị ảnh hưởng trước khi sửa.

### Bước 2 — Chọn một trong hai phương án

**Phương án A (nhanh, ít rủi ro hành vi — khuyến nghị làm trước):** nâng lên bản vá từ CDN SheetJS. API giữ nguyên tên gói `xlsx`.

```jsonc
// package.json (đường dẫn gồm đúng số phiên bản; kiểm tra bản mới nhất tại https://cdn.sheetjs.com)
"dependencies": {
  "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"
}
```

- Chạy `npm install` để cập nhật `package-lock.json`.
- Lưu ý: bước build Docker phải truy cập được `cdn.sheetjs.com`; nếu build trong môi trường chặn mạng, cần vendor file `.tgz` vào repo (thư mục `vendor/`) rồi trỏ `file:./vendor/xlsx-0.20.3.tgz`.

**Phương án B (dài hạn, giảm phụ thuộc):** chuyển phần đọc Excel sang `exceljs` (đã có trong bundle, báo cáo ghi là sạch CVE), gỡ hẳn `xlsx`. Chỉ làm khi có thời gian test lại toàn bộ mẫu file import hiện hành.

### Bước 3 — Gia cố bất kể chọn phương án nào

Ở chỗ nhận file import:

- Giới hạn **kích thước** (ví dụ ≤ 5 MB) và **đuôi/MIME** (`.xlsx` chỉ), từ chối trước khi parse.
- Parse trong `try/catch`, trả lỗi tiếng Việt thân thiện, không lộ stack trace.
- Khi ánh xạ tiêu đề cột → thuộc tính đối tượng, **chặn các khóa** `__proto__`, `constructor`, `prototype`; ưu tiên dùng `Map` hoặc `Object.create(null)`.

```ts
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const safeKey = (k: string) => (FORBIDDEN_KEYS.has(k) ? null : k);
```

- Giới hạn số dòng/số sheet được xử lý để tránh ReDoS/tốn tài nguyên.

### ✅ Nghiệm thu T02

- `npm ls xlsx` hiển thị phiên bản ≥ 0.20.2 (hoặc không còn nếu chọn phương án B).
- `npm audit` không còn cảnh báo cao/nghiêm trọng liên quan `xlsx`.
- Import thử các file mẫu đề tài thật: kết quả giống trước khi nâng cấp.
- File > giới hạn kích thước, file sai định dạng, file có cột tên `__proto__` đều bị từ chối/bỏ qua an toàn (viết test).

---

## T03 — 🟠 SSH cho phép đăng nhập bằng mật khẩu

**Phạm vi: 🖥️ [VPS]** — Cursor chỉ soạn thành tài liệu `docs/ssh-hardening.md`, không tự chạy.

> ⚠️ **Rủi ro tự khóa mình ra khỏi máy chủ.** Luôn giữ **một phiên SSH đang mở** trong lúc thay đổi, và test đăng nhập bằng key ở phiên **thứ hai** trước khi tắt mật khẩu.

Các bước:

1. Đảm bảo đã có SSH key đăng nhập được (`~/.ssh/authorized_keys`).
2. Tạo `/etc/ssh/sshd_config.d/99-hardening.conf`:

```
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
```

3. Ubuntu 24.04 có thể có file khác (ví dụ `50-cloud-init.conf`) đặt lại `PasswordAuthentication yes`. Kiểm tra giá trị hiệu lực: `sudo sshd -T | grep -i -E "passwordauthentication|permitrootlogin"`.
4. `sudo sshd -t` (kiểm tra cú pháp) rồi `sudo systemctl reload ssh`.
5. Cài chống brute-force: `sudo apt install fail2ban`, bật jail `sshd` trong `/etc/fail2ban/jail.local` (ví dụ `maxretry = 5`, `bantime = 1h`), `sudo systemctl enable --now fail2ban`.

### ✅ Nghiệm thu T03

- `ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no user@103.159.50.23` → bị từ chối (`Permission denied (publickey)`), không còn `password` trong danh sách.
- Đăng nhập bằng key vẫn hoạt động.
- `sudo fail2ban-client status sshd` hiển thị jail đang chạy.

---

# GIAI ĐOẠN 2

## T04 — 🟠 Lộ thông tin nội bộ

**Vấn đề (3 chỗ):**
1. Lỗi của `register` có đoạn *"…rebuild frontend (`docker compose up -d --build frontend`)"* → lộ Docker Compose, tên service, lệnh vận hành.
2. Response `register` trả `otpTtlSeconds: 600` và `otpDeliveryChannel: "smtp"`.
3. Route 404 trả HTML mặc định `Cannot GET /api/v1/...` của Express → lộ framework.

### Việc cần làm [REPO]

**(a) Xóa thông điệp lỗi chứa thông tin vận hành.** Tìm: `docker compose`, `rebuild frontend`, `--build`. Thay bằng thông báo chung, ví dụ *"Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau."* Chi tiết kỹ thuật chỉ ghi vào **log server**, không đưa vào response.

**(b) Rút gọn response `register`.** Tìm: `otpTtlSeconds`, `otpDeliveryChannel`. Chỉ trả:

```json
{ "message": "Nếu thông tin hợp lệ, mã OTP đã được gửi tới email của bạn." }
```

Sau đó `grep` cả hai frontend xem có chỗ nào đang đọc 2 trường trên không; nếu có, hiển thị chuỗi cố định ("mã có hiệu lực 10 phút") thay vì đọc từ response.

**(c) Ẩn dấu vết Express và chuẩn hóa 404/lỗi toàn cục** (đặt ở lớp Api, sau khi đăng ký toàn bộ router):

```ts
app.disable('x-powered-by');

// 404 cho mọi route API không tồn tại — trả JSON, không phải HTML
app.use('/api', (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy tài nguyên.' } });
});

// Error handler toàn cục — luôn là middleware cuối cùng
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = Number(err?.status) || 500;
  logger.error({ err }, 'Unhandled error');           // chi tiết chỉ ở log
  res.status(status).json({
    error: {
      code: status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message: status >= 500 ? 'Đã xảy ra lỗi hệ thống.' : String(err?.message ?? 'Yêu cầu không hợp lệ.'),
    },
  });
});
```

- Kiểm tra Caddy có thêm header `Server`/`X-Powered-By` không; nếu có thì loại bỏ trong `Caddyfile` bằng `header -Server` / `header -X-Powered-By`.
- Rà thêm: không trả `err.stack` hay thông điệp lỗi SQL/DB trong bất kỳ response nào.

### ✅ Nghiệm thu T04

- `curl -i https://www.ump-khcn.com/api/v1/khong-ton-tai` → `404` + JSON, **không** chứa "Cannot GET", "Express".
- `curl -sI https://www.ump-khcn.com/` → không có `X-Powered-By`.
- Response `register` không còn `otpTtlSeconds`/`otpDeliveryChannel`; frontend vẫn chạy đúng luồng OTP.
- `grep -ri "docker compose" src/` (backend + frontend) → không còn trong chuỗi hiển thị cho người dùng.

---

## T05 — ⚠️ Xác nhận production không ghi OTP vào log

**Vấn đề:** Bundle có chuỗi *"môi trường phát triển: mã OTP được ghi vào log máy chủ"*. Nếu production chạy chế độ này, OTP bị lộ ra log.

### Việc cần làm [REPO]

- Tìm: `OTP` kết hợp `console.log`, `logger`, `dev`, và chuỗi *"ghi vào log máy chủ"*.
- Chỉ cho phép ghi OTP khi **đồng thời** `NODE_ENV === 'development'` **và** một biến cờ tường minh (ví dụ `LOG_OTP_FOR_DEV=true`). Mặc định tắt.
- Thêm kiểm tra khởi động: nếu `NODE_ENV === 'production'` mà cờ bật → **dừng ứng dụng** với thông báo lỗi.
- Xóa chuỗi mô tả "môi trường phát triển…" khỏi **mã frontend** (bundle công khai không nên chứa gợi ý này).
- Đảm bảo `docker-compose.yml` (bản production) đặt `NODE_ENV=production`.

### 🖥️ [VPS] Xác nhận thủ công

- Kiểm tra `.env` production không có cờ trên; chạy `docker compose logs backend | grep -i otp` và xác nhận không có mã OTP dạng 6 số.
- Nếu SMTP chưa cấu hình mà hệ thống "rơi về" ghi log, sửa để **báo lỗi gửi mail** thay vì ghi OTP.

### ✅ Nghiệm thu T05

- Test: khi `NODE_ENV=production` và cờ bật → app không khởi động.
- Log production sau một lần đăng ký thử không chứa mã OTP.

---

## T06 — 🟠 Phụ thuộc có CVE: axios (admin), elliptic, lodash, react-router

Làm lần lượt, mỗi thư viện một commit.

1. **Kiểm kê phiên bản thực tế** (báo cáo ghi "chưa xác định" nhiều mục): chạy trong từng package (frontend, admin, backend):
   `npm ls axios elliptic lodash react-router react-router-dom`
   và `npm audit --omit=dev`. Ghi kết quả vào mô tả PR.
2. **axios (chỉ admin):** nâng lên bản mới nhất (báo cáo khuyến nghị ≥ 1.18). App chính dùng `fetch` nên không ảnh hưởng. Chạy lại toàn bộ chức năng admin sau khi nâng.
3. **elliptic 6.5.4 (transitive, nghi là code chết):** chạy `npm why elliptic` để biết gói nào kéo vào.
   - Nếu gói cha không thực sự cần → gỡ gói cha.
   - Nếu không gỡ được → nâng gói cha, hoặc dùng `overrides` trong `package.json` để ép phiên bản đã vá.
   - Xác nhận bằng cách `grep` bundle build xem còn mã `elliptic` hay không.
4. **lodash:** nâng lên bản 4.17.x mới nhất (liên quan CVE-2025-13465 – `_.unset`/`_.omit`). Nếu code không dùng hai hàm này thì rủi ro thấp, nhưng vẫn nâng.
5. **react-router:** nếu xác định được version, đối chiếu CVE theo version đó và nâng lên bản vá nếu có.

### ✅ Nghiệm thu T06

- `npm audit --omit=dev` ở cả 3 package: không còn mức **high/critical** (hoặc có ghi chú giải thích cho các mục chấp nhận rủi ro).
- Build và smoke test (đăng nhập, danh sách đề tài, trang admin) đều pass.

---

# GIAI ĐOẠN 3

## T07 — 🟡 User enumeration qua `register`

**Vấn đề:** Email đã tồn tại → `409 "Tài khoản với email này đã tồn tại"`, kẻ tấn công dò được email nào đã đăng ký.

### Việc cần làm [REPO]

- Với **mọi** email hợp lệ (đã tồn tại hay chưa), trả cùng một mã trạng thái và cùng nội dung, ví dụ `202 Accepted`:
  `{ "message": "Nếu thông tin hợp lệ, mã OTP đã được gửi tới email của bạn." }`
- Email **chưa có**: tạo tài khoản + gửi OTP như hiện tại.
- Email **đã có**: không tạo mới; gửi email thông báo cho chủ tài khoản ("Có người đăng ký bằng email của bạn; nếu là bạn hãy đăng nhập"). Không cần gửi OTP.
- Giữ thời gian xử lý gần nhau giữa hai nhánh (gửi mail chạy bất đồng bộ/hàng đợi, không `await` trong request) để tránh lộ qua độ trễ.
- Các lỗi định dạng (sai domain `@ump.edu.vn` / `@umc.edu.vn`, thiếu trường) **vẫn trả 400** — không liên quan đến việc email có tồn tại hay không.
- Cập nhật frontend: đăng ký xong luôn chuyển sang bước nhập OTP với thông điệp trung tính.
- Giữ nguyên hành vi **login sai chỉ có một thông báo chung** (đang đúng).

### ✅ Nghiệm thu T07

- Đăng ký cùng một email lần 1 (mới) và lần 2 (đã tồn tại) → status code và body **giống hệt nhau**.
- Có test tự động cho cả hai nhánh.

---

## T08 — 🟡 Rate-limit riêng cho login & verify-otp

**Vấn đề:** Login dùng chung giới hạn 40 req/15 phút/IP với toàn API; không khóa theo tài khoản. Mặt khác 40/15 phút cho cả API khá thấp với người dùng bình thường.

### Việc cần làm [REPO]

**(a) Bảo đảm Express nhận đúng IP client** — Express đang đứng sau Caddy, nếu thiếu `trust proxy` thì mọi người dùng chung 1 IP (của Caddy) và rate-limit sai:

```ts
app.set('trust proxy', 1);   // 1 hop = Caddy; kiểm tra bằng cách log req.ip
```

**(b) Tách limiter** (dùng `express-rate-limit`; kiểm tra version đang dùng — bản mới yêu cầu bọc IP bằng `ipKeyGenerator` để xử lý IPv6):

```ts
// Giới hạn chung — nới lên mức hợp lý cho thao tác thông thường
export const apiLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false });

// Login — chặt, tính theo IP + email, chỉ đếm lần thất bại
export const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}|${String(req.body?.email ?? '').toLowerCase()}`,
  message: { error: { code: 'TOO_MANY_ATTEMPTS', message: 'Bạn thử quá nhiều lần. Vui lòng thử lại sau 15 phút.' } },
});

// verify-otp / resend-otp
export const otpLimiter = rateLimit({ windowMs: 10 * 60_000, limit: 5, /* tương tự */ });
```

Gắn `loginLimiter` vào `POST /auth/login`, `otpLimiter` vào `verify-otp` và `resend-otp`.

**(c) Khóa tài khoản tạm thời (lớp Domain/Application):**
- Thêm cột `failed_login_attempts` (int, mặc định 0) và `locked_until` (timestamptz, null) vào bảng người dùng bằng **migration mới** (không sửa migration cũ).
- Sai ≥ 5 lần liên tiếp → khóa 15 phút; đăng nhập đúng → reset bộ đếm.
- Thông báo khi bị khóa **vẫn dùng thông điệp chung** của login sai, để không tạo thêm kênh lộ thông tin.
- Với OTP: giới hạn **số lần nhập sai trên mỗi mã** (ví dụ 5), vượt quá thì vô hiệu hóa mã và yêu cầu gửi lại.

### ✅ Nghiệm thu T08

- Gọi login sai 11 lần liên tiếp với cùng email → lần thứ 11 nhận `429`.
- Người dùng bình thường thao tác trong 15 phút không chạm trần ở các endpoint khác.
- Test tự động cho khóa tạm thời và reset bộ đếm khi đăng nhập thành công.

---

## T09 — 🟡 Chính sách mật khẩu yếu

**Vấn đề:** Chỉ yêu cầu độ dài ≥ 8.

### Việc cần làm [REPO]

- Đặt **một nguồn sự thật duy nhất** cho quy tắc mật khẩu ở lớp Domain/Application; áp dụng ở backend (bắt buộc) và hiển thị gợi ý ở frontend.
- Quy tắc đề xuất: tối thiểu 8 ký tự (Annie có thể nâng lên 10), tối đa 128; có chữ thường, chữ hoa, chữ số và ký tự đặc biệt; không chứa phần local của email.

```ts
export const passwordSchema = z.string()
  .min(8, 'Mật khẩu tối thiểu 8 ký tự')
  .max(128, 'Mật khẩu tối đa 128 ký tự')
  .regex(/[a-z]/, 'Cần ít nhất 1 chữ thường')
  .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
  .regex(/\d/, 'Cần ít nhất 1 chữ số')
  .regex(/[^A-Za-z0-9]/, 'Cần ít nhất 1 ký tự đặc biệt');
```

*(Nếu dự án không dùng `zod`, viết hàm tương đương bằng thư viện validate đang có.)*

- Quy tắc chỉ áp dụng khi **đăng ký / đổi mật khẩu**, không làm hỏng đăng nhập của tài khoản cũ.
- Frontend: hiển thị checklist điều kiện theo thời gian thực dưới ô mật khẩu, tiếng Việt.

### ✅ Nghiệm thu T09

- `abcdefgh`, `Abcdefg1`, `abcdefg1!` đều bị từ chối với thông báo đúng; `Abcdef1!` (ví dụ hợp lệ) được chấp nhận.
- Có test đơn vị cho schema.

---

## T10 — 🟡 Kiểm chứng phân quyền endpoint admin

**Vấn đề:** Báo cáo xác nhận các endpoint admin trả 401 khi chưa đăng nhập, nhưng **chưa kiểm chứng** được việc chặn *user thường* (cần token hợp lệ).

Endpoint cần kiểm tra:

```
GET    /admin/permissions            PUT    /admin/permissions/{feature}
GET    /admin/users                  PATCH  /admin/users/{id}/role
PATCH  /admin/users/{id}/allowed-units   PATCH /admin/users/{id}/grant-access
DELETE /admin/users/{id}
```

### Việc cần làm [REPO]

- Rà soát từng route: bắt buộc có middleware xác thực **và** middleware phân quyền (ví dụ `requireRole('admin')`).
- Middleware phân quyền nên **đối chiếu vai trò từ DB** (hoặc nguồn tin cậy phía server), không chỉ tin claim `role` trong JWT, để thay đổi vai trò có hiệu lực ngay.
- Chặn các thao tác nguy hiểm: admin không tự xóa/hạ quyền chính mình đến mức hệ thống không còn admin; không cho `PATCH role` nhận giá trị ngoài danh sách vai trò hợp lệ.
- Viết **integration test** ma trận: [không token → 401], [token user thường → 403], [token admin → thành công] cho từng endpoint trên.

### ✅ Nghiệm thu T10

- Toàn bộ test ma trận pass; không endpoint admin nào trả 2xx cho user thường.

---

## T11 — 🧹 Dọn dữ liệu test

**Phạm vi: 🖥️ [VPS]** — người vận hành chạy trên DB production. Cursor chỉ soạn script mẫu, **không tự chạy**.

3 tài khoản test (chưa verify email) cần xóa: `x@ump.edu.vn`, `roletest@ump.edu.vn`, `roletest2@ump.edu.vn`.

Script mẫu (đổi tên bảng/cột theo schema thực tế, và **xem trước khi xóa**):

```sql
-- 1) Xem trước
SELECT id, email, role, created_at FROM users
WHERE email IN ('x@ump.edu.vn', 'roletest@ump.edu.vn', 'roletest2@ump.edu.vn');

-- 2) Xóa trong transaction
BEGIN;
DELETE FROM users
WHERE email IN ('x@ump.edu.vn', 'roletest@ump.edu.vn', 'roletest2@ump.edu.vn');
-- kiểm tra số dòng bị xóa = 3 rồi mới:
COMMIT;   -- hoặc ROLLBACK;
```

- Xóa luôn dữ liệu liên quan (mã OTP, phiên) nếu khóa ngoại không tự `CASCADE`.
- Làm **sau khi** đã backup DB.

---

# GIAI ĐOẠN 4 — DÀI HẠN

## T12 — 🟡 JWT trong localStorage → httpOnly cookie

> ⛔ **Cursor: KHÔNG tự bắt tay làm task này.** Đây là thay đổi kiến trúc xác thực ảnh hưởng cả hai frontend và backend. Hãy lập kế hoạch chi tiết, đưa Annie duyệt, rồi mới triển khai. Rủi ro hiện tại đã được giảm nhẹ nhờ CSP `script-src 'self'`.

Hướng thiết kế đề xuất để lập kế hoạch:

- Backend đặt token qua `Set-Cookie`: `HttpOnly; Secure; SameSite=Strict` (cookie host-only cho domain API). `www`, `admin`, `api` cùng site `ump-khcn.com` nên SameSite=Strict vẫn hoạt động.
- CORS: `credentials: true` và **liệt kê origin cụ thể** (không dùng wildcard); frontend gọi `fetch(..., { credentials: 'include' })`.
- Chống CSRF: token CSRF (double-submit hoặc header tùy biến) cho các request ghi (POST/PUT/PATCH/DELETE).
- Frontend: bỏ hoàn toàn `localStorage.auth_token` và `localStorage.admin_user` (phần chứa token), cả app chính lẫn admin; thêm endpoint `logout` xóa cookie.
- Kế hoạch chuyển đổi: hỗ trợ song song một thời gian ngắn, sau đó tắt đường cũ.

---

## T13 — 🔵 Nhất quán lỗi & UX (tùy chọn, làm sau cùng)

- 404 API trả HTML còn 405 trả JSON → đã xử lý ở T04; kiểm tra thêm 405 cùng định dạng lỗi JSON.
- `/register` trả 404 (đăng ký nằm trong tab của `/login`) → thêm redirect `/register` → `/login?tab=register` cho nhất quán.
- Chưa có endpoint **quên/đổi mật khẩu** (hiện chỉ có login / register / verify-otp / resend-otp). Nếu triển khai: dùng token đặt lại mật khẩu dùng một lần, hết hạn ngắn, có rate-limit riêng, và **không** tiết lộ email có tồn tại hay không (cùng nguyên tắc T07).

---

# 3. CHECKLIST NGHIỆM THU CUỐI CÙNG

Đánh dấu khi đã kiểm chứng trên **production**:

- [ ] Port 5432 đóng với bên ngoài; DB vẫn hoạt động (T01)
- [ ] Mật khẩu DB (và các secret liên quan) đã xoay (T01.4)
- [ ] `xlsx` ≥ 0.20.2 hoặc đã gỡ; import Excel chạy đúng, có giới hạn file (T02)
- [ ] SSH chỉ đăng nhập bằng key, `fail2ban` chạy (T03)
- [ ] Không còn lộ thông tin Docker/OTP/Express trong response (T04)
- [ ] Production không ghi OTP vào log (T05)
- [ ] `npm audit --omit=dev` sạch mức high/critical ở 3 package (T06)
- [ ] Đăng ký email mới/đã tồn tại cho response giống nhau (T07)
- [ ] Login/OTP có rate-limit riêng và khóa tạm thời (T08)
- [ ] Chính sách mật khẩu mới hoạt động ở backend + frontend (T09)
- [ ] Test phân quyền admin pass (T10)
- [ ] 3 tài khoản test đã xóa (T11)
- [ ] Kế hoạch T12 đã được Annie duyệt (hoặc ghi nhận hoãn)

## 4. LỆNH KIỂM TRA NHANH

```bash
# Từ máy bên ngoài VPS
nmap -Pn -p 22,80,443,5432 103.159.50.23
curl -i https://www.ump-khcn.com/api/v1/khong-ton-tai
curl -sI https://www.ump-khcn.com/ | grep -i -E "x-powered-by|server"

# Trong repo (mỗi package)
npm ls xlsx axios elliptic lodash react-router
npm audit --omit=dev
npm run typecheck && npm run lint && npm test && npm run build

# Trên VPS
ss -tlnp | grep -E "5432|22"
sudo sshd -T | grep -i passwordauthentication
docker compose config | grep -n -B1 -A3 "published"
```

---

*Tài liệu được lập từ "Báo cáo kiểm thử bảo mật & hiệu năng ngày 28/08/2026". Các điểm báo cáo ghi "chưa xác định" (phiên bản axios, lodash, react-router; nghi vấn `elliptic` là code chết; cơ chế chặn user thường ở endpoint admin) đã được chuyển thành bước kiểm kê/kiểm chứng trong T06 và T10.*
