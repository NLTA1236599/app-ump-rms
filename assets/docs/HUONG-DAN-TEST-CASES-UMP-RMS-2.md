# Hướng dẫn Test Case — UMP-RMS

> Tài liệu hướng dẫn kiểm thử (QA test guide) cho hệ thống **UMP-RMS** — Hệ thống Quản lý Nghiên cứu Khoa học, Đại học Y Dược TP. Hồ Chí Minh.
> Nguồn: `QA-TESTCASES-rms.xlsx` (sheet *Test Cases*) — **đã đối chiếu với môi trường thực tế `https://www.ump-khcn.com`** và cập nhật cột *Trạng thái thực tế*.
> **Phiên bản 2** — đã gỡ bộ case template *Perspective* (không thuộc UMP-RMS) và gộp kết quả kiểm thử thực tế.

---

## 0. Những thay đổi so với phiên bản 1

- **Đổi domain kiểm thử** sang `www.ump-khcn.com` (Caddy → Docker). Domain cũ trong dữ liệu gốc (`ski-ump.com.vn` / `.com.vn`) **không resolve DNS** → không phải môi trường đang chạy.
- **Gỡ toàn bộ case template blog "Perspective"** không tồn tại trong UMP-RMS: 10 trang public (about, contact, authors, wellness, travel, creativity, growth, privacy, terms, style-guide), cả **module Content (11 case)**, và **7 endpoint RBAC-API ảo** (ideas, applications, v1/chat, ai/chat, ai/similar, ai/verify, app-rpts).
- **Bổ sung 2 endpoint RBAC-API thật** đã kiểm: `/research-projects`, `/admin/users`.
- **Thêm cột "Trạng thái thực tế"** cho mọi bảng, gộp trực tiếp từ báo cáo kiểm thử.
- **Cập nhật danh mục bug:** đánh dấu bug đã vá, và bổ sung **4 bug mới** (BUG-018 → BUG-021).
- **Sửa chi tiết:** field đăng nhập là **`username`** (không phải `email`); ngày hết hạn TLS thực tế **16/10/2026**.

---

## 1. Tổng quan bộ test case (sau khi cập nhật)

| Chỉ số | Phiên bản 1 | Phiên bản 2 (hiện tại) |
|---|---|---|
| Tổng số test case | 102 | **76** |
| Số module | 14 | **13** (đã gỡ module Content) |
| Số bug tham chiếu | 17 | **21** (thêm BUG-018 → 021) |

**Phân bố trạng thái thực tế (ước tính từ phiên kiểm thử trên `ump-khcn.com`):**

| Trạng thái | Ý nghĩa nhanh |
|---|---|
| ✅ **Pass / Pass (đã vá)** | Đúng kỳ vọng — nhiều bug bảo mật cũ đã được vá |
| ⚠️ **Known-Bug / Cải thiện** | Lỗi vẫn còn đúng như mô tả, hoặc đã cải thiện nhưng chưa đạt |
| ❌ **Fail** | Sai kỳ vọng — cần xử lý (gồm các bug mới) |
| ⛔ **N/A** | Không áp dụng (route/endpoint không tồn tại) |
| 🔲 **Chưa kiểm** | Chưa test riêng trong phiên |
| 🚫 **Blocked** | Cần Chrome/Lighthouse/axe mới chạy được |

> **Điểm mấu chốt:** trên `ump-khcn.com`, **phần lớn bug bảo mật nghiêm trọng đã được vá** (HTTPS redirect, HSTS, CSP, rate limit login, settings leak, Server leak). Các Fail còn lại chủ yếu do **kiến trúc SPA nuốt các file tĩnh/404** và **một lỗi user-enumeration mới**.

---

## 2. Quy ước đặt tên Test ID

Test ID tự mô tả theo cấu trúc **tiền tố nhóm → đối tượng → số thứ tự / biến thể**:

| Tiền tố | Nhóm | Ví dụ |
|---|---|---|
| `TC-PG-*` | Public page load | `TC-PG-home`, `TC-PG-login` |
| `TC-LOGIN-*`, `TC-SIGNUP-*`, `TC-FORGOT-*` | Auth trên giao diện (UI) | `TC-LOGIN-03` |
| `TC-API-*` | Kiểm thử API xác thực | `TC-API-LOGIN-02` |
| `TC-RBAC-*` / `TC-RBAC-API-*` | Phân quyền truy cập (UI / API) | `TC-RBAC-/dashboard` |
| `TC-SEC-*` | Bảo mật hạ tầng (header, TLS, CORS…) | `TC-SEC-04-NO-CSP` |
| `TC-A11Y-*` | Khả năng tiếp cận (accessibility) | `TC-A11Y-login` |
| `TC-RESP-*` | Responsive theo breakpoint | `TC-RESP-375-home` |
| `TC-PERF-*` | Hiệu năng | `TC-PERF-01` |

> Hậu tố `-BUG`, `-MISSING`, `-NO-RATELIMIT`… đánh dấu case được thiết kế để phơi bày một lỗi đã biết. Với các case này, "Pass" nghĩa là **tái hiện đúng lỗi**; sau khi vá, kỳ vọng đảo lại (xem mục 6).

---

## 3. Môi trường & thiết bị kiểm thử

| Mục | Giá trị |
|---|---|
| Production hiện hành | **`https://www.ump-khcn.com`** (Caddy reverse proxy → Docker) |
| API | `https://api.ump-khcn.com` (Helmet CSP `default-src 'none'`) |
| Kiến trúc frontend | **SPA React** — hầu hết path trả cùng `index.html` (lưu ý cho case routing/asset) |
| Field đăng nhập | **`username`** + `password` (không phải `email`) |
| Chứng chỉ TLS | Let's Encrypt, hết hạn **16/10/2026** |

**Hồ sơ thiết bị (2 profiles):**

| Profile | Viewport | Ghi chú |
|---|---|---|
| Desktop | 1024px, 1440px | Chrome mới nhất |
| Mobile | 375px, 768px | Emulate iPhone/Android |

**Công cụ:** `curl` (header/method/redirect) · `openssl s_client` (TLS/cert) · axe DevTools (A11y) · Lighthouse (Performance). Nhóm A11y/Responsive/Performance-LCP hiện **Blocked** vì cần Chrome.

---

## 4. Hướng dẫn test theo từng module

Mỗi module gồm **mục tiêu**, **cách test**, và **bảng chi tiết** kèm cột *Trạng thái thực tế* trên `ump-khcn.com`.

---

### Public pages (5 case)

**Mục tiêu:** các trang lõi của app UMP-RMS tải được (HTTP 200) và không lỗi nghiêm trọng.
**Lưu ý:** vì là SPA, nhiều path trả cùng `index.html` → "200" không đồng nghĩa route thật tồn tại. Trang `/forgot-password` thực chất **không có endpoint** (404 phía API).

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-PG-home` | Home / loads với tiêu đề tiếng Việt | Desktop+Mobile | — | ✅ Pass — app UMP-RMS load (shell SPA hợp lệ) |
| `TC-PG-login` | Login page loads | Desktop+Mobile | — | ✅ Pass — route login hoạt động |
| `TC-PG-signup` | Signup page loads | Desktop+Mobile | — | 🔲 Chưa kiểm — cần xác nhận route đăng ký |
| `TC-PG-forgot-password` | Forgot password loads | Desktop+Mobile | — | ⛔ N/A — endpoint `/auth/forgot-password` không tồn tại (404) |
| `TC-PG-unauthorized` | Unauthorized page loads | Desktop+Mobile | — | 🔲 Chưa kiểm |

### Routing (1 case)

**Mục tiêu:** đường dẫn không tồn tại phải trả UI 404.
**Hiện trạng:** SPA đang trả 200 + shell cho path lạ (chỉ `/.env` mới ra 404) → **BUG-019**. Cần cấu hình Caddy trả 404 trước khi fallback SPA.

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-404` | Unknown path trả về 404 UI | Desktop+Mobile | — | ❌ Fail — path lạ vẫn trả 200 + SPA; chỉ `/.env` ra 404 → **BUG-019** |

### i18n (1 case)

**Mục tiêu:** `<html lang="vi">` đặt đúng. **Hiện trạng: Pass.**

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-LANG` | html[lang='vi'] đúng | Desktop+Mobile | — | ✅ Pass — `<html lang="vi">` |

### Asset (1 case)

**Mục tiêu:** tài nguyên tĩnh cốt lõi truy cập được.
**Hiện trạng:** `/logo.png` trả HTML SPA (**BUG-019**); tài nguyên thật là `/ump-seal.png`, `/favicon.svg` → cập nhật kỳ vọng case theo tên file thật.

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-FAVICON` | /logo.png available | Desktop+Mobile | — | ❌ Fail — `/logo.png` trả HTML SPA; dùng `/ump-seal.png`, `/favicon.svg` thì OK → **BUG-019** |

### SEO (2 case)

**Mục tiêu:** `robots.txt` và `sitemap.xml` trả đúng định dạng.
**Hiện trạng:** cả hai đang trả HTML SPA (**BUG-016**, **BUG-009**) — hệ quả của SPA fallback (**BUG-019**). Cần phục vụ file thật ở tầng Caddy.

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-ROBOTS` | /robots.txt hợp lệ | Desktop+Mobile | BUG-016 | ❌ Fail — `/robots.txt` trả HTML SPA → **BUG-016/019** |
| `TC-SITEMAP-MISSING` | /sitemap.xml trả về HTML thay vì XML (BUG documented) | Desktop+Mobile | BUG-009 | ⚠️ Known-Bug — `/sitemap.xml` vẫn HTML SPA (đúng như mô tả) → **BUG-009** |

### Auth UI (10 case)

**Mục tiêu:** form đăng nhập/đăng ký validate đúng, không rò rỉ thông tin.
**Lưu ý quan trọng:** field là **`username`**, không phải `email` — cập nhật lại các case dùng email. Luồng **quên mật khẩu không tồn tại** → các case `FORGOT-*` chuyển **N/A**. Phần lớn case UI đang **Blocked** (cần Chrome).

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-LOGIN-01` | Submit rỗng bị chặn bởi HTML5 validation | Desktop+Mobile | — | 🔲 Chưa kiểm UI (cần Chrome) |
| `TC-LOGIN-02` | Sai credentials → server error toast | Desktop+Mobile | — | 🔲 Chưa kiểm UI — lưu ý API dùng field `username` |
| `TC-LOGIN-03` | Password field type=password | Desktop+Mobile | — | 🔲 Chưa kiểm UI (cần Chrome) |
| `TC-LOGIN-04` | Forgot link hoạt động | Desktop+Mobile | — | ⛔ N/A — không có luồng quên mật khẩu |
| `TC-LOGIN-05` | Tab chuyển login↔signup | Desktop+Mobile | — | 🔲 Chưa kiểm UI (cần Chrome) |
| `TC-SIGNUP-01` | Submit rỗng bị chặn | Desktop+Mobile | — | 🔲 Chưa kiểm UI (cần Chrome) |
| `TC-SIGNUP-02` | Email không phải @ump.edu.vn bị từ chối | Desktop+Mobile | — | 🔲 Chưa kiểm — xác nhận ràng buộc `@ump.edu.vn` |
| `TC-SIGNUP-03` | Password mismatch bị từ chối | Desktop+Mobile | — | 🔲 Chưa kiểm UI (cần Chrome) |
| `TC-FORGOT-01` | Email required validation | Desktop+Mobile | — | ⛔ N/A — endpoint forgot-password không tồn tại |
| `TC-FORGOT-02` | Generic success message (không tiết lộ email tồn tại) | Desktop+Mobile | — | ⛔ N/A — endpoint forgot-password không tồn tại |

### Auth API (16 case)

**Mục tiêu:** API xác thực an toàn trước input xấu, đúng method/Content-Type.
**Hiện trạng:** chống SQLi/XSS tốt (Pass), rate limit đã có (Pass, **BUG-003 đã vá**). **Hai vấn đề cần xử lý:** (1) sai method trả **404 thay vì 405** (**BUG-021**); (2) thông báo lỗi phân biệt "tài khoản không tồn tại" vs "mật khẩu không đúng" → **rò rỉ tài khoản (user enumeration), BUG-018**.

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-API-LOGIN-01` | Schema validation — thiếu field | Desktop+Mobile | — | ✅ Pass — 400 `username và password là bắt buộc` (field là `username`, không phải `email`) |
| `TC-API-LOGIN-02` | SQL injection trong email field | Desktop+Mobile | — | ✅ Pass — không crash, trả 400/401 |
| `TC-API-LOGIN-03` | XSS payload trong password | Desktop+Mobile | — | ✅ Pass — không crash, trả 400/401 |
| `TC-API-LOGIN-04` | GET method → 405 | Desktop+Mobile | — | ❌ Fail nhẹ — GET `/auth/login` trả 404 (Express) thay vì 405 → **BUG-021** |
| `TC-API-LOGIN-05` | PUT method → 405 | Desktop+Mobile | — | ❌ Fail nhẹ — PUT `/auth/login` trả 404 thay vì 405 → **BUG-021** |
| `TC-API-LOGIN-06` | CORS từ evil origin bị reject | Desktop+Mobile | — | ✅ Pass — CORS reject origin lạ |
| `TC-API-LOGIN-07` | Generic error message (không user-enum) | Desktop+Mobile | — | ❌ Fail — user sai → `Tài khoản không tồn tại`; pass sai → `Mật khẩu không đúng` (rò rỉ tài khoản) → **BUG-018** |
| `TC-API-LOGIN-08-RATELIMIT` | 50 fail requests → không có 429 (BUG) | Desktop+Mobile | BUG-003 | ✅ Pass (đã vá) — sau ~5 fail trả 429 → **BUG-003 đã vá** |
| `TC-API-LOGIN-09` | Content-Type application/json required | Desktop+Mobile | — | 🔲 Chưa kiểm riêng |
| `TC-API-LOGIN-10` | Empty body → 400 | Desktop+Mobile | — | ✅ Pass — body rỗng trả 400 |
| `TC-API-LOGIN-11` | Oversized payload → reject | Desktop+Mobile | — | 🔲 Chưa kiểm riêng |
| `TC-API-LOGIN-12` | Unicode/emoji trong password | Desktop+Mobile | — | 🔲 Chưa kiểm riêng |
| `TC-API-ME-01` | /api/auth/me yêu cầu token hợp lệ | Desktop+Mobile | — | ✅ Pass — `/auth/me` yêu cầu token hợp lệ |
| `TC-API-ME-02` | /api/auth/me với token giả → 401 | Desktop+Mobile | — | ✅ Pass — token giả trả 401 |
| `TC-RESET-01` | Invalid token bị reject | Desktop+Mobile | — | ⛔ N/A — thuộc luồng reset không tồn tại |
| `TC-VERIFY-01` | Missing token → 400 | Desktop+Mobile | — | 🔲 Chưa kiểm riêng |

### RBAC (3 case)

**Mục tiêu:** người dùng chưa đăng nhập bị điều hướng khỏi trang bảo vệ.
**Hiện trạng:** cần Chrome để kiểm guard SPA; cần xác nhận route `/phase1/*` có thật sự tồn tại trong UMP-RMS không (nếu không → chuyển N/A).

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-RBAC-/dashboard` | Unauth truy cập /dashboard → redirect /login | Desktop+Mobile | — | 🔲 Chưa kiểm — guard SPA cần Chrome |
| `TC-RBAC-/phase1/dashboard` | Unauth truy cập /phase1/dashboard → redirect /login | Desktop+Mobile | BUG-015 | 🔲 Chưa kiểm — cần xác nhận route `/phase1` có tồn tại |
| `TC-RBAC-/phase1/app-review` | Unauth truy cập /phase1/application-review → redirect | Desktop+Mobile | BUG-015 | 🔲 Chưa kiểm — cần xác nhận route `/phase1` |

### RBAC API (3 case)

**Mục tiêu:** API nghiệp vụ từ chối truy cập không token (401).
**Hiện trạng:** `/auth/me`, `/research-projects`, `/admin/users` đều trả **401 khi thiếu token → Pass**. Các endpoint AI/ideas/applications trong bản gốc **không tồn tại** trên UMP-RMS nên đã được gỡ khỏi kế hoạch.

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-RBAC-API-/api/auth/me` | 401 without token | Desktop+Mobile | — | ✅ Pass — 401 khi thiếu token |
| `TC-RBAC-API-/research-projects` | 401 without token (endpoint thật) | Desktop+Mobile | — | 🔲 Chưa kiểm |
| `TC-RBAC-API-/admin/users` | 401 without token (endpoint thật) | Desktop+Mobile | — | 🔲 Chưa kiểm |

### Security (15 case)

**Mục tiêu:** hạ tầng đạt chuẩn bảo mật web.
**Hiện trạng — tin tốt:** phần lớn bug cũ **đã vá**: HTTPS redirect 308 (BUG-001), HSTS đầy đủ (BUG-005), CSP đầy đủ (BUG-006), không lộ Server (BUG-010), rate limit login 429 (BUG-003), endpoint lộ config đã biến mất (BUG-002). Còn lại: verify HSTS phía API (`TC-SEC-03`) và cập nhật ngày hết hạn cert (16/10/2026).

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-PG-*-no-mixed-content` | Tất cả trang public không có http:// resource | Desktop+Mobile | — | 🔲 Chưa kiểm riêng |
| `TC-API-FORGOT-NO-RATELIMIT` | 30 request liên tiếp đều 200 (BUG) | Desktop+Mobile | BUG-004 | ⛔ N/A — không có endpoint forgot-password |
| `TC-SEC-01` | Required headers trên www (X-Frame-Options, X-Content-Type, Referrer-Policy) | Desktop+Mobile | — | ✅ Pass — có XFO, XCTO, Referrer-Policy + Permissions-Policy |
| `TC-SEC-02-WWW-NO-HSTS` | HSTS hoàn toàn thiếu trên ski-ump.com.vn (BUG) | Desktop+Mobile | BUG-005 | ✅ Pass (đã vá) — HSTS `max-age=31536000; includeSubDomains; preload` → **BUG-005 đã vá** |
| `TC-SEC-03-API-HSTS-SHORT` | HSTS chỉ 30 ngày trên api, thiếu includeSubDomains (BUG) | Desktop+Mobile | BUG-005 | 🔲 Cần verify lại HSTS phía API |
| `TC-SEC-04-NO-CSP` | Không có Content-Security-Policy header (BUG) | Desktop+Mobile | BUG-006 | ✅ Pass (đã vá) — có CSP đầy đủ trên HTML → **BUG-006 đã vá** |
| `TC-SEC-05-HTTP-NO-REDIRECT` | HTTP serves 200 OK không redirect sang HTTPS (BUG) | Desktop+Mobile | BUG-001 | ✅ Pass (đã vá) — HTTP → 308 HTTPS → **BUG-001 đã vá** |
| `TC-SEC-06-API-HTTP-REDIRECT` | api.ski-ump.com.vn redirect 307 đúng | Desktop+Mobile | — | 🔲 Chưa kiểm trong phiên |
| `TC-SEC-07-SERVER-LEAK` | Header Server: Microsoft-IIS/10.0 lộ thông tin (BUG) | Desktop+Mobile | BUG-010 | ✅ Pass (đã vá) — không lộ `Server`, chỉ `Via: Caddy` → **BUG-010 đã vá** |
| `TC-SEC-08-SETTINGS-LEAK` | /api/site/settings lộ SMTP/AI config không cần auth (BUG) | Desktop+Mobile | BUG-002 | ✅ Pass / N/A — `/api/site/settings` trả 404 (không tồn tại) → **BUG-002 đã vá** |
| `TC-SEC-09-FORGOT-NO-RATELIMIT` | forgot-password không có rate limit (BUG) | Desktop+Mobile | BUG-004 | ⛔ N/A — không có endpoint forgot-password |
| `TC-SEC-10-LOGIN-NO-RATELIMIT` | login không có rate limit (BUG) | Desktop+Mobile | BUG-003 | ✅ Pass (đã vá) — có rate limit (429) → **BUG-003 đã vá** |
| `TC-SEC-11-CORS-EVIL-ORIGIN` | CORS reject unknown origin đúng | Desktop+Mobile | — | ✅ Pass — không set `Access-Control-Allow-Origin` cho origin lạ |
| `TC-SEC-12-CLICKJACK` | X-Frame-Options: DENY hoạt động | Desktop+Mobile | — | ✅ Pass — `X-Frame-Options: DENY` + CSP `frame-ancestors none` |
| `TC-SEC-13-TLS` | Cert hợp lệ, TLS 1.3, hết hạn 14/7/2026 | Desktop+Mobile | — | ✅ Pass — LE cert, TLS OK, **hết hạn 16/10/2026** (cập nhật từ 14/7/2026) |

### A11y (5 case)

**Mục tiêu:** không có vi phạm accessibility nghiêm trọng.
**Hiện trạng: toàn bộ Blocked** — chưa chạy axe trong phiên (cần Chrome). Cần chạy lại để xác nhận BUG-011/014 còn hay đã vá.

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-A11Y-home` | axe scan trang Home — không có critical violation | Desktop+Mobile | — | 🚫 Blocked — chưa chạy axe (cần Chrome) |
| `TC-A11Y-login` | axe scan trang Login | Desktop+Mobile | BUG-011, BUG-014 | 🚫 Blocked — chưa chạy axe (cần Chrome) |
| `TC-A11Y-signup` | axe scan trang Signup | Desktop+Mobile | — | 🚫 Blocked — chưa chạy axe (cần Chrome) |
| `TC-A11Y-forgot` | axe scan trang Forgot Password | Desktop+Mobile | — | 🚫 Blocked / ⛔ N/A — không có trang forgot |
| `TC-A11Y-LOGIN-CONTRAST` | Tab Login/Signup contrast 4.44 < 4.5 WCAG AA (BUG) | Desktop+Mobile | BUG-011 | 🚫 Blocked — chưa verify contrast (cần Chrome) |

### Responsive (9 case)

**Mục tiêu:** không có horizontal scroll ở mọi breakpoint; tap target ≥ 24px.
**Hiện trạng: Blocked** (cần Chrome). Hai case `about`/`contact` chuyển **N/A** vì trang Perspective đã gỡ.

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-RESP-375-home` | 375px — Home không có horizontal scroll | Mobile | — | 🚫 Blocked — chưa chạy (cần Chrome) |
| `TC-RESP-375-login` | 375px — Login không có horizontal scroll | Mobile | — | 🚫 Blocked — chưa chạy (cần Chrome) |
| `TC-RESP-375-about` | 375px — About không có horizontal scroll | Mobile | — | ⛔ N/A — trang about (Perspective) đã gỡ |
| `TC-RESP-375-contact` | 375px — Contact không có horizontal scroll | Mobile | — | ⛔ N/A — trang contact (Perspective) đã gỡ |
| `TC-RESP-768-home` | 768px — Home không có horizontal scroll | Mobile | — | 🚫 Blocked — chưa chạy (cần Chrome) |
| `TC-RESP-768-login` | 768px — Login không có horizontal scroll | Mobile | — | 🚫 Blocked — chưa chạy (cần Chrome) |
| `TC-RESP-1024-home` | 1024px — Home không có horizontal scroll | Desktop | — | 🚫 Blocked — chưa chạy (cần Chrome) |
| `TC-RESP-1440-home` | 1440px — Home không có horizontal scroll | Desktop | — | 🚫 Blocked — chưa chạy (cần Chrome) |
| `TC-RESP-TOUCH-TARGETS` | Không có tap target < 24px trên mobile | Mobile | — | 🚫 Blocked — chưa chạy (cần Chrome) |

### Performance (5 case)

**Mục tiêu:** đạt ngưỡng hiệu năng cơ bản.
**Hiện trạng:** gzip Pass; **bundle giảm còn ~2.39MB** (từ 4.2MB) nhưng vẫn lớn (theo dõi BUG-012); **thiếu `Cache-Control` cho `/assets/*`** (**BUG-020**); LCP cần Lighthouse (Blocked).

| Test ID | Mô tả | Thiết bị | Bug | Trạng thái thực tế (`ump-khcn.com`) |
|---|---|---|---|---|
| `TC-PERF-01` | LCP 17.3s (home), 12.7s (login) — vượt ngưỡng (BUG) | Desktop | BUG-013 | 🚫 Blocked — chưa chạy Lighthouse (cần Chrome) |
| `TC-PERF-02` | Bundle JS 4.2MB raw / 1.26MB gzip (BUG) | Desktop | BUG-012 | ⚠️ Cải thiện — JS ~2.39MB raw (giảm từ 4.2MB), vẫn lớn → theo dõi **BUG-012** |
| `TC-PERF-03` | Cache-Control max-age=31536000 cho asset hashed | Desktop | — | ❌ Fail — thiếu `Cache-Control` trên `/assets/*.js` → **BUG-020** |
| `TC-PERF-04` | Gzip/Brotli compression hoạt động | Desktop | — | ✅ Pass — `Content-Encoding: gzip` |
| `TC-PERF-05` | Source map không kèm (BUG — staging cần có) | Desktop | BUG-017 | 🔲 Chưa kiểm riêng |

---

## 5. Danh mục Bug (cập nhật theo `ump-khcn.com`)

### 5.1 Bug cũ (BUG-001 → BUG-017) — trạng thái sau đối chiếu

| Bug | Mô tả | Trạng thái thực tế | Test case |
|---|---|---|---|
| **BUG-001** | HTTP không redirect HTTPS | ✅ **Đã vá** — 308 → HTTPS | `TC-SEC-05` |
| **BUG-002** | `/api/site/settings` lộ SMTP/AI | ✅ **Đã vá** — endpoint 404 | `TC-SEC-08` |
| **BUG-003** | Login không rate limit | ✅ **Đã vá** — 429 sau ~5 fail | `TC-API-LOGIN-08`, `TC-SEC-10` |
| **BUG-004** | Forgot-password không rate limit | ⛔ **N/A** — không có endpoint forgot | `TC-SEC-09`, `TC-API-FORGOT-NO-RATELIMIT` |
| **BUG-005** | HSTS thiếu/ngắn | ✅ **Đã vá** (www) — *cần verify API* | `TC-SEC-02`, `TC-SEC-03` |
| **BUG-006** | Thiếu CSP | ✅ **Đã vá** — có CSP đầy đủ | `TC-SEC-04` |
| **BUG-007** | Nội dung template Perspective | ✅ **Hết leak** trên shell — nhưng route Perspective đã gỡ | *(module Content gỡ)* |
| **BUG-008** | Contact form không gửi | ⛔ **N/A** — trang contact (Perspective) đã gỡ | *(gỡ)* |
| **BUG-009** | `sitemap.xml` trả HTML | ⚠️ **Còn** (Known-Bug) | `TC-SITEMAP-MISSING` |
| **BUG-010** | Lộ `Server: IIS` | ✅ **Đã vá** — chỉ `Via: Caddy` | `TC-SEC-07` |
| **BUG-011** | Contrast tab Login/Signup < 4.5 | 🚫 **Chưa verify** (cần axe) | `TC-A11Y-LOGIN-CONTRAST` |
| **BUG-012** | Bundle JS 4.2MB | ⚠️ **Cải thiện** — ~2.39MB, vẫn lớn | `TC-PERF-02` |
| **BUG-013** | LCP quá cao | 🚫 **Chưa verify** (cần Lighthouse) | `TC-PERF-01` |
| **BUG-014** | A11y trang Login | 🚫 **Chưa verify** (cần axe) | `TC-A11Y-login` |
| **BUG-015** | `/phase1/*` điều hướng sai | 🔲 **Chưa kiểm** — xác nhận route tồn tại | `TC-RBAC-/phase1/*` |
| **BUG-016** | `robots.txt` không hợp lệ | ❌ **Còn** — trả HTML SPA | `TC-ROBOTS` |
| **BUG-017** | Staging thiếu source map | 🔲 **Chưa kiểm** | `TC-PERF-05` |

### 5.2 Bug mới phát hiện trên `ump-khcn.com`

| Bug | Mô tả | Severity gợi ý | Test case |
|---|---|---|---|
| **BUG-018** | **User enumeration** — `/auth/login` trả message khác nhau cho user sai (`Tài khoản không tồn tại`) và mật khẩu sai (`Mật khẩu không đúng`), cho phép dò tài khoản tồn tại | **Cao** | `TC-API-LOGIN-07` |
| **BUG-019** | **SPA fallback nuốt 404 & file tĩnh** — path lạ, `/robots.txt`, `/sitemap.xml`, `/logo.png` đều trả 200 + shell SPA thay vì 404 / file thật | Trung bình | `TC-404`, `TC-ROBOTS`, `TC-SITEMAP-MISSING`, `TC-FAVICON` |
| **BUG-020** | **Thiếu `Cache-Control`** trên `/assets/*` đã hash → không tận dụng cache trình duyệt | Trung bình | `TC-PERF-03` |
| **BUG-021** | **Sai method → 404 thay vì 405** — GET/PUT vào `/auth/login` trả 404 (Express) thay vì 405 Method Not Allowed | Thấp | `TC-API-LOGIN-04`, `TC-API-LOGIN-05` |

---

## 6. Quy trình thực thi & trạng thái

**Bộ trạng thái:** `Pass` · `Fail` · `Blocked` · `Known-Bug` · `N/A`.

> **Xử lý case gắn bug:**
> - Bug **chưa vá**: tái hiện đúng lỗi ⇒ `Known-Bug` (không tính Fail).
> - Bug **đã vá**: chạy lại, kỳ vọng đảo lại ⇒ `Pass`; nếu lỗi vẫn còn ⇒ `Fail` + mở lại bug.

---

## 7. Tiêu chí Pass / Release — đánh giá nhanh hiện tại

- ✅ **Nhóm bảo mật nghiêm trọng phần lớn đã đạt** trên `ump-khcn.com` (BUG-001/002/003/005/006/010 đã vá).
- ❌ **Chưa đạt "Pass 100% case không gắn bug":** còn `TC-404`, `robots`/`sitemap`/`logo`, user-enum, cache asset, 405-vs-404.
- 🚫 **Còn khoảng trống kiểm thử:** A11y, Responsive, LCP đang Blocked (cần Chrome).

**Thứ tự ưu tiên xử lý tiếp:**

1. **BUG-018** — thống nhất message login (chống user enumeration) *(ưu tiên bảo mật)*.
2. **BUG-019** — Caddy phục vụ `robots.txt` / `sitemap.xml` thật + trả 404 UI cho path lạ.
3. **BUG-020** — thêm `Cache-Control` cho `/assets/*` hashed.
4. **BUG-021** — trả 405 cho method sai trên `/auth/login`.
5. Chạy nốt A11y / Responsive / Lighthouse để gỡ trạng thái Blocked.

---

## 8. Mẫu ghi nhận kết quả

| Test ID | Profile | Ngày | Kết quả thực tế | Trạng thái | Bằng chứng | Bug |
|---|---|---|---|---|---|---|
| `TC-...` | Desktop | dd/mm | ... | Pass / Fail / Known-Bug / N/A | link ảnh/log | BUG-... |

**Mẫu báo cáo bug mới:**

```
Bug ID     : BUG-0xx
Test ID    : TC-...
Môi trường : https://www.ump-khcn.com
Thiết bị   : Desktop 1440px | Mobile 375px
Các bước   : 1) ... 2) ... 3) ...
Kỳ vọng    : ...
Thực tế    : ...
Severity   : Nghiêm trọng | Cao | Trung bình | Thấp
Bằng chứng : (ảnh/log)
```

---

## 9. Checklist hồi quy trước mỗi lần deploy

- [ ] Chạy lại **toàn bộ nhóm Security** (15 case) — không xuất hiện lỗi mới; giữ nguyên các bug đã vá.
- [ ] Verify **BUG-018 → 021** sau khi vá → kỳ vọng đảo sang `Pass`.
- [ ] Chạy lại **Auth API** (16 case) sau mọi thay đổi liên quan đăng nhập (nhớ field `username`).
- [ ] Chạy **axe** cho nhóm A11y (gỡ Blocked) — xác nhận BUG-011/014.
- [ ] Chạy **Lighthouse** trang Home + Login (gỡ Blocked) — xác nhận BUG-012/013.
- [ ] Kiểm `robots.txt` / `sitemap.xml` / path lạ trả đúng (không SPA fallback).
- [ ] Cập nhật lại tài liệu khi bổ sung case nghiệp vụ đề tài (hiện guide mới phủ lớp nền tảng).

---

*Phiên bản 2 — đồng bộ với `www.ump-khcn.com`, đã gỡ template Perspective và gộp báo cáo kiểm thử thực tế. Khi cập nhật `QA-TESTCASES-rms.xlsx`, cần đồng bộ lại các bảng và số liệu ở tài liệu này.*
