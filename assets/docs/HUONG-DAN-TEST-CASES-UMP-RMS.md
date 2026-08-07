# Hướng dẫn Test Case — UMP-RMS

> Tài liệu hướng dẫn kiểm thử (QA test guide) cho hệ thống **UMP-RMS** — Hệ thống Quản lý Nghiên cứu Khoa học, Đại học Y Dược TP. Hồ Chí Minh.
> Nguồn dữ liệu: `QA-TESTCASES-rms.xlsx` (sheet *Test Cases*).

---

## 1. Tổng quan bộ test case

Bộ test hiện tại tập trung vào **phần public + xác thực + hạ tầng bảo mật** của hệ thống, chưa đi sâu vào nghiệp vụ quản lý đề tài. Đây là lớp kiểm thử nền tảng cần **pass 100%** trước khi mở kiểm thử các luồng nghiệp vụ chuyên sâu (đề tài, hội đồng, nghiệm thu…).

| Chỉ số | Giá trị |
|---|---|
| Tổng số test case (trong file) | **102** |
| Số module | **14** |
| Số case chạy trên Desktop + Mobile | 88 |
| Số case chỉ Mobile | 7 |
| Số case chỉ Desktop | 7 |
| Tổng lượt thực thi (execution) | **190** |
| Số case đang gắn với bug đã ghi nhận | **39** |
| Số bug được tham chiếu | **17** (BUG-001 → BUG-017) |

> **Lưu ý về con số:** tiêu đề trong file ghi *“132 cases × 2 profiles = 264 executions”*, nhưng danh sách STT thực tế chỉ liệt kê **102 case**. Con số 132/264 nên hiểu là *mục tiêu tổng* của kế hoạch test; phần chênh lệch là các case chưa được nhập vào sheet (ví dụ luồng nghiệp vụ đăng nhập bằng tài khoản thật của từng role). Cần thống nhất lại con số này với team trước khi báo cáo tiến độ.

> **Lưu ý về domain:** dữ liệu test tham chiếu domain **`ump-khcn.com.vn`** / **`api.ump-khcn.com.vn`** (môi trường đang được kiểm thử), khác với `ump-khcn.com` trong tài liệu hạ tầng. Cần xác nhận đây là môi trường staging hay production hiện hành trước khi chạy.

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
| `TC-CONTENT-*` | Nội dung / bản địa hoá | `TC-CONTENT-about-BUG` |
| `TC-A11Y-*` | Khả năng tiếp cận (accessibility) | `TC-A11Y-login` |
| `TC-RESP-*` | Responsive theo breakpoint | `TC-RESP-375-home` |
| `TC-PERF-*` | Hiệu năng | `TC-PERF-01` |

> Hậu tố `-BUG`, `-MISSING`, `-NO-RATELIMIT`… đánh dấu **case được thiết kế để phơi bày một lỗi đã biết**. Với các case này, “Pass” nghĩa là **tái hiện đúng lỗi như mô tả** cho tới khi bug được vá; sau khi vá, kỳ vọng của case sẽ đảo lại (xem mục 6).

---

## 3. Môi trường & thiết bị kiểm thử

**Hồ sơ thiết bị (2 profiles):**

| Profile | Viewport khuyến nghị | Ghi chú |
|---|---|---|
| Desktop | 1024px, 1440px | Chrome mới nhất; dùng cho toàn bộ case `Desktop+Mobile` và `Desktop` |
| Mobile | 375px, 768px | Emulate iPhone/Android; bắt buộc cho case `Mobile` và phần mobile của `Desktop+Mobile` |

**Chuẩn bị trước khi chạy:**

- Trình duyệt Chrome + DevTools (tab Network, Lighthouse).
- Công cụ dòng lệnh: `curl` (kiểm tra header, method, redirect), `openssl s_client` (kiểm tra TLS/cert).
- Extension **axe DevTools** hoặc thư viện `@axe-core` cho nhóm A11y.
- Tài khoản test hợp lệ đuôi `@ump.edu.vn` cho luồng đăng ký/đăng nhập.
- Xác nhận URL môi trường (staging vs production) và ghi vào phần đầu báo cáo.

---

## 4. Hướng dẫn test theo từng module

Mỗi module dưới đây gồm **mục tiêu**, **cách thực hiện**, và **bảng test case chi tiết** trích từ file.

---

### Public pages (15 case)

**Mục tiêu:** mọi trang public tải được (HTTP 200), render đúng, không lỗi console nghiêm trọng.
**Cách test:** mở lần lượt từng route trên cả Desktop và Mobile → xác nhận trang hiển thị, tiêu đề đúng tiếng Việt, không có tài nguyên `http://` (mixed content). Các case gắn `BUG-007` sẽ *load được nhưng còn nội dung template tiếng Anh* — xem chi tiết ở module Content.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-PG-home` | Home / loads với tiêu đề tiếng Việt | Desktop+Mobile | — |
| `TC-PG-about` | About /about loads | Desktop+Mobile | BUG-007 |
| `TC-PG-contact` | Contact /contact loads | Desktop+Mobile | BUG-007, BUG-008 |
| `TC-PG-authors` | Authors /authors loads | Desktop+Mobile | BUG-007 |
| `TC-PG-wellness` | Wellness /wellness loads | Desktop+Mobile | BUG-007 |
| `TC-PG-travel` | Travel /travel loads | Desktop+Mobile | BUG-007 |
| `TC-PG-creativity` | Creativity /creativity loads | Desktop+Mobile | BUG-007 |
| `TC-PG-growth` | Growth /growth loads | Desktop+Mobile | BUG-007 |
| `TC-PG-style-guide` | Style guide loads | Desktop+Mobile | — |
| `TC-PG-privacy` | Privacy loads | Desktop+Mobile | BUG-007 |
| `TC-PG-terms` | Terms loads | Desktop+Mobile | BUG-007 |
| `TC-PG-login` | Login page loads | Desktop+Mobile | — |
| `TC-PG-signup` | Signup page loads | Desktop+Mobile | — |
| `TC-PG-forgot-password` | Forgot password loads | Desktop+Mobile | — |
| `TC-PG-unauthorized` | Unauthorized page loads | Desktop+Mobile | — |

### Routing (1 case)

**Mục tiêu:** đường dẫn không tồn tại phải trả về UI 404 thân thiện, không phải trang trắng hay lỗi server.
**Cách test:** truy cập một path ngẫu nhiên không tồn tại → xác nhận hiển thị màn hình 404.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-404` | Unknown path trả về 404 UI | Desktop+Mobile | — |

### i18n (1 case)

**Mục tiêu:** thẻ `<html lang="vi">` được đặt đúng để hỗ trợ SEO và screen reader tiếng Việt.
**Cách test:** kiểm tra thuộc tính `lang` trên thẻ `html` qua DevTools.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-LANG` | html[lang='vi'] đúng | Desktop+Mobile | — |

### Asset (1 case)

**Mục tiêu:** tài nguyên tĩnh cốt lõi (logo/favicon) truy cập được.
**Cách test:** mở trực tiếp `/logo.png` → kỳ vọng HTTP 200.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-FAVICON` | /logo.png available | Desktop+Mobile | — |

### SEO (2 case)

**Mục tiêu:** `robots.txt` hợp lệ và `sitemap.xml` trả về đúng định dạng XML.
**Cách test:** `curl` từng file và kiểm tra `Content-Type`. `TC-SITEMAP-MISSING` hiện đang phơi bày **BUG-009** (sitemap trả HTML thay vì XML) — Pass = tái hiện đúng lỗi cho tới khi vá.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-ROBOTS` | /robots.txt hợp lệ | Desktop+Mobile | BUG-016 |
| `TC-SITEMAP-MISSING` | /sitemap.xml trả về HTML thay vì XML (BUG documented) | Desktop+Mobile | BUG-009 |

### Auth UI (10 case)

**Mục tiêu:** form đăng nhập / đăng ký / quên mật khẩu validate đúng phía client và không rò rỉ thông tin.
**Cách test:** thử submit rỗng (phải bị chặn), sai định dạng email (chỉ chấp nhận `@ump.edu.vn`), mật khẩu không khớp, ẩn ký tự mật khẩu (`type=password`), và xác nhận thông báo “quên mật khẩu” **chung chung** (không tiết lộ email có tồn tại hay không).

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-LOGIN-01` | Submit rỗng bị chặn bởi HTML5 validation | Desktop+Mobile | — |
| `TC-LOGIN-02` | Sai credentials → server error toast | Desktop+Mobile | — |
| `TC-LOGIN-03` | Password field type=password | Desktop+Mobile | — |
| `TC-LOGIN-04` | Forgot link hoạt động | Desktop+Mobile | — |
| `TC-LOGIN-05` | Tab chuyển login↔signup | Desktop+Mobile | — |
| `TC-SIGNUP-01` | Submit rỗng bị chặn | Desktop+Mobile | — |
| `TC-SIGNUP-02` | Email không phải @ump.edu.vn bị từ chối | Desktop+Mobile | — |
| `TC-SIGNUP-03` | Password mismatch bị từ chối | Desktop+Mobile | — |
| `TC-FORGOT-01` | Email required validation | Desktop+Mobile | — |
| `TC-FORGOT-02` | Generic success message (không tiết lộ email tồn tại) | Desktop+Mobile | — |

### Auth API (16 case)

**Mục tiêu:** API xác thực an toàn trước input xấu và tuân thủ HTTP method/Content-Type.
**Cách test (dùng `curl`/Postman):** gửi thiếu field, payload SQL injection / XSS / Unicode-emoji, sai method (GET/PUT → 405), body rỗng (→ 400), payload quá lớn (→ reject), token giả (→ 401). `TC-API-LOGIN-08-RATELIMIT` phơi bày **BUG-003** (không có 429 sau 50 lần fail).

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-API-LOGIN-01` | Schema validation — thiếu field | Desktop+Mobile | — |
| `TC-API-LOGIN-02` | SQL injection trong email field | Desktop+Mobile | — |
| `TC-API-LOGIN-03` | XSS payload trong password | Desktop+Mobile | — |
| `TC-API-LOGIN-04` | GET method → 405 | Desktop+Mobile | — |
| `TC-API-LOGIN-05` | PUT method → 405 | Desktop+Mobile | — |
| `TC-API-LOGIN-06` | CORS từ evil origin bị reject | Desktop+Mobile | — |
| `TC-API-LOGIN-07` | Generic error message (không user-enum) | Desktop+Mobile | — |
| `TC-API-LOGIN-08-RATELIMIT` | 50 fail requests → không có 429 (BUG) | Desktop+Mobile | BUG-003 |
| `TC-API-LOGIN-09` | Content-Type application/json required | Desktop+Mobile | — |
| `TC-API-LOGIN-10` | Empty body → 400 | Desktop+Mobile | — |
| `TC-API-LOGIN-11` | Oversized payload → reject | Desktop+Mobile | — |
| `TC-API-LOGIN-12` | Unicode/emoji trong password | Desktop+Mobile | — |
| `TC-API-ME-01` | /api/auth/me yêu cầu token hợp lệ | Desktop+Mobile | — |
| `TC-API-ME-02` | /api/auth/me với token giả → 401 | Desktop+Mobile | — |
| `TC-RESET-01` | Invalid token bị reject | Desktop+Mobile | — |
| `TC-VERIFY-01` | Missing token → 400 | Desktop+Mobile | — |

### RBAC (3 case)

**Mục tiêu:** người dùng chưa đăng nhập không vào được trang bảo vệ, bị điều hướng về `/login`.
**Cách test:** ở chế độ ẩn danh (chưa có token), truy cập các route bảo vệ → kỳ vọng redirect. `TC-RBAC-/phase1/*` gắn **BUG-015** (điều hướng chưa đúng).

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-RBAC-/dashboard` | Unauth truy cập /dashboard → redirect /login | Desktop+Mobile | — |
| `TC-RBAC-/phase1/dashboard` | Unauth truy cập /phase1/dashboard → redirect /login | Desktop+Mobile | BUG-015 |
| `TC-RBAC-/phase1/app-review` | Unauth truy cập /phase1/application-review → redirect | Desktop+Mobile | BUG-015 |

### RBAC API (8 case)

**Mục tiêu:** API nghiệp vụ từ chối truy cập không token (401) và đúng method (405 cho endpoint POST-only).
**Cách test:** gọi endpoint không kèm Authorization header → kỳ vọng 401/404; gọi sai method với nhóm `/api/ai/*` → kỳ vọng 405.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-RBAC-API-/api/auth/me` | 401 without token | Desktop+Mobile | — |
| `TC-RBAC-API-/api/v1/ideas` | 401 without token | Desktop+Mobile | — |
| `TC-RBAC-API-/api/applications` | 401 without token | Desktop+Mobile | — |
| `TC-RBAC-API-/api/v1/chat` | 401 without token | Desktop+Mobile | — |
| `TC-RBAC-API-/api/ai/chat` | 405 (POST only) | Desktop+Mobile | — |
| `TC-RBAC-API-/api/ai/similar` | 405 (POST only) | Desktop+Mobile | — |
| `TC-RBAC-API-/api/ai/verify` | 405 (POST only) | Desktop+Mobile | — |
| `TC-RBAC-API-/api/v1/app-rpts` | 404/401 without token | Desktop+Mobile | — |

### Security (15 case)

**Mục tiêu:** hạ tầng đạt chuẩn bảo mật web (header, HSTS, CSP, HTTPS redirect, CORS, TLS, không rò rỉ thông tin).
**Cách test:** dùng `curl -I` kiểm tra header; `openssl s_client` kiểm tra chứng chỉ/TLS 1.3. **Đây là module có mật độ bug cao nhất** — 8 case đang đánh dấu lỗi (BUG-001, 002, 003, 004, 005, 006, 010). Đọc kỹ cột Bug để biết case nào kỳ vọng “pass đúng” và case nào “tái hiện lỗi”.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-PG-*-no-mixed-content` | Tất cả trang public không có http:// resource | Desktop+Mobile | — |
| `TC-API-FORGOT-NO-RATELIMIT` | 30 request liên tiếp đều 200 (BUG) | Desktop+Mobile | BUG-004 |
| `TC-SEC-01` | Required headers trên www (X-Frame-Options, X-Content-Type, Referrer-Policy) | Desktop+Mobile | — |
| `TC-SEC-02-WWW-NO-HSTS` | HSTS hoàn toàn thiếu trên ump-khcn.com.vn (BUG) | Desktop+Mobile | BUG-005 |
| `TC-SEC-03-API-HSTS-SHORT` | HSTS chỉ 30 ngày trên api, thiếu includeSubDomains (BUG) | Desktop+Mobile | BUG-005 |
| `TC-SEC-04-NO-CSP` | Không có Content-Security-Policy header (BUG) | Desktop+Mobile | BUG-006 |
| `TC-SEC-05-HTTP-NO-REDIRECT` | HTTP serves 200 OK không redirect sang HTTPS (BUG) | Desktop+Mobile | BUG-001 |
| `TC-SEC-06-API-HTTP-REDIRECT` | api.ump-khcn.com.vn redirect 307 đúng | Desktop+Mobile | — |
| `TC-SEC-07-SERVER-LEAK` | Header Server: Microsoft-IIS/10.0 lộ thông tin (BUG) | Desktop+Mobile | BUG-010 |
| `TC-SEC-08-SETTINGS-LEAK` | /api/site/settings lộ SMTP/AI config không cần auth (BUG) | Desktop+Mobile | BUG-002 |
| `TC-SEC-09-FORGOT-NO-RATELIMIT` | forgot-password không có rate limit (BUG) | Desktop+Mobile | BUG-004 |
| `TC-SEC-10-LOGIN-NO-RATELIMIT` | login không có rate limit (BUG) | Desktop+Mobile | BUG-003 |
| `TC-SEC-11-CORS-EVIL-ORIGIN` | CORS reject unknown origin đúng | Desktop+Mobile | — |
| `TC-SEC-12-CLICKJACK` | X-Frame-Options: DENY hoạt động | Desktop+Mobile | — |
| `TC-SEC-13-TLS` | Cert hợp lệ, TLS 1.3, hết hạn 14/7/2026 | Desktop+Mobile | — |

### Content (11 case)

**Mục tiêu:** toàn bộ nội dung đã được bản địa hoá sang tiếng Việt, gỡ bỏ template gốc (brand *Perspective*, tác giả *Emma Thompson*, email `hello@perspective.blog`, số điện thoại `+1(555)`…).
**Cách test:** mở từng trang và tìm chuỗi tiếng Anh/thương hiệu template còn sót. **Toàn bộ module này gắn BUG-007/BUG-008** — hiện đang phơi bày lỗi. Sau khi nội dung được thay bằng tiếng Việt, các case này phải chuyển sang “không còn tìm thấy chuỗi template”.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-CONTENT-about-BUG` | EN template 'Our Story' còn trên /about (BUG) | Desktop+Mobile | BUG-007 |
| `TC-CONTENT-contact-BUG` | hello@perspective.blog, +1(555) còn trên /contact (BUG) | Desktop+Mobile | BUG-007 |
| `TC-CONTENT-authors-BUG` | Emma Thompson template còn trên /authors (BUG) | Desktop+Mobile | BUG-007 |
| `TC-CONTENT-wellness-BUG` | Nội dung tiếng Anh còn trên /wellness (BUG) | Desktop+Mobile | BUG-007 |
| `TC-CONTENT-travel-BUG` | Nội dung tiếng Anh còn trên /travel (BUG) | Desktop+Mobile | BUG-007 |
| `TC-CONTENT-creativity-BUG` | Nội dung tiếng Anh còn trên /creativity (BUG) | Desktop+Mobile | BUG-007 |
| `TC-CONTENT-growth-BUG` | Nội dung tiếng Anh còn trên /growth (BUG) | Desktop+Mobile | BUG-007 |
| `TC-CONTENT-privacy-BUG` | Brand Perspective còn trên /privacy (BUG) | Desktop+Mobile | BUG-007 |
| `TC-CONTENT-terms-BUG` | Brand Perspective còn trên /terms (BUG) | Desktop+Mobile | BUG-007 |
| `TC-CONTENT-CONTACT-FORM` | Form /contact không phát sinh POST request (BUG) | Desktop+Mobile | BUG-008 |
| `TC-CONTENT-MIXED-LANG` | /about không được localize sang tiếng Việt (BUG) | Desktop+Mobile | BUG-007 |

### A11y (5 case)

**Mục tiêu:** không có vi phạm accessibility nghiêm trọng (WCAG).
**Cách test:** chạy quét **axe** trên từng trang. `TC-A11Y-LOGIN-CONTRAST` gắn **BUG-011** (độ tương phản tab Login/Signup 4.44 < 4.5 — dưới chuẩn WCAG AA); `TC-A11Y-login` còn gắn thêm **BUG-014**.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-A11Y-home` | axe scan trang Home — không có critical violation | Desktop+Mobile | — |
| `TC-A11Y-login` | axe scan trang Login | Desktop+Mobile | BUG-011, BUG-014 |
| `TC-A11Y-signup` | axe scan trang Signup | Desktop+Mobile | — |
| `TC-A11Y-forgot` | axe scan trang Forgot Password | Desktop+Mobile | — |
| `TC-A11Y-LOGIN-CONTRAST` | Tab Login/Signup contrast 4.44 < 4.5 WCAG AA (BUG) | Desktop+Mobile | BUG-011 |

### Responsive (9 case)

**Mục tiêu:** không có cuộn ngang (horizontal scroll) ở mọi breakpoint và không có vùng chạm < 24px trên mobile.
**Cách test:** đặt viewport lần lượt 375 / 768 / 1024 / 1440px, kiểm tra `document.scrollWidth <= clientWidth`; kiểm tra kích thước tap target trên mobile.

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-RESP-375-home` | 375px — Home không có horizontal scroll | Mobile | — |
| `TC-RESP-375-login` | 375px — Login không có horizontal scroll | Mobile | — |
| `TC-RESP-375-about` | 375px — About không có horizontal scroll | Mobile | — |
| `TC-RESP-375-contact` | 375px — Contact không có horizontal scroll | Mobile | — |
| `TC-RESP-768-home` | 768px — Home không có horizontal scroll | Mobile | — |
| `TC-RESP-768-login` | 768px — Login không có horizontal scroll | Mobile | — |
| `TC-RESP-1024-home` | 1024px — Home không có horizontal scroll | Desktop | — |
| `TC-RESP-1440-home` | 1440px — Home không có horizontal scroll | Desktop | — |
| `TC-RESP-TOUCH-TARGETS` | Không có tap target < 24px trên mobile | Mobile | — |

### Performance (5 case)

**Mục tiêu:** đạt ngưỡng hiệu năng cơ bản (LCP, kích thước bundle, cache, nén).
**Cách test:** chạy Lighthouse. Hai case đang phơi bày lỗi nặng: **BUG-013** (LCP 17.3s trang Home — quá cao) và **BUG-012** (bundle JS 4.2MB raw). `TC-PERF-05` gắn **BUG-017** (staging thiếu source map).

| Test ID | Mô tả | Thiết bị | Bug |
|---|---|---|---|
| `TC-PERF-01` | LCP 17.3s (home), 12.7s (login) — vượt ngưỡng (BUG) | Desktop | BUG-013 |
| `TC-PERF-02` | Bundle JS 4.2MB raw / 1.26MB gzip (BUG) | Desktop | BUG-012 |
| `TC-PERF-03` | Cache-Control max-age=31536000 cho asset hashed | Desktop | — |
| `TC-PERF-04` | Gzip/Brotli compression hoạt động | Desktop | — |
| `TC-PERF-05` | Source map không kèm (BUG — staging cần có) | Desktop | BUG-017 |

---

## 5. Danh mục Bug tham chiếu (BUG-001 → BUG-017)

Bảng dưới đây tổng hợp các bug được các test case chỉ ra, kèm mức độ đề xuất và test case liên quan. Mức độ (Severity) là **gợi ý ưu tiên xử lý**, cần hội đồng QA/Dev xác nhận lại.

| Bug | Mô tả ngắn | Severity gợi ý | Test case liên quan |
|---|---|---|---|
| **BUG-001** | HTTP không redirect sang HTTPS (serve 200 trên http) | Cao | `TC-SEC-05-HTTP-NO-REDIRECT` |
| **BUG-002** | `/api/site/settings` lộ cấu hình SMTP/AI khi không cần auth | **Nghiêm trọng** | `TC-SEC-08-SETTINGS-LEAK` |
| **BUG-003** | Login không có rate limit (không trả 429) | Cao | `TC-API-LOGIN-08-RATELIMIT`, `TC-SEC-10-LOGIN-NO-RATELIMIT` |
| **BUG-004** | Forgot-password không có rate limit | Cao | `TC-API-FORGOT-NO-RATELIMIT`, `TC-SEC-09-FORGOT-NO-RATELIMIT` |
| **BUG-005** | HSTS thiếu (www) / quá ngắn 30 ngày, thiếu includeSubDomains (api) | Trung bình | `TC-SEC-02-WWW-NO-HSTS`, `TC-SEC-03-API-HSTS-SHORT` |
| **BUG-006** | Thiếu Content-Security-Policy header | Trung bình | `TC-SEC-04-NO-CSP` |
| **BUG-007** | Nội dung template tiếng Anh (brand *Perspective*) chưa localize | Cao | 19 case nhóm Public/Content |
| **BUG-008** | Form Contact không phát sinh POST (không gửi được) | Cao | `TC-PG-contact`, `TC-CONTENT-CONTACT-FORM` |
| **BUG-009** | `/sitemap.xml` trả HTML thay vì XML | Thấp | `TC-SITEMAP-MISSING` |
| **BUG-010** | Header `Server: Microsoft-IIS/10.0` lộ thông tin công nghệ | Thấp | `TC-SEC-07-SERVER-LEAK` |
| **BUG-011** | Contrast tab Login/Signup 4.44 < 4.5 (WCAG AA) | Trung bình | `TC-A11Y-login`, `TC-A11Y-LOGIN-CONTRAST` |
| **BUG-012** | Bundle JS 4.2MB raw / 1.26MB gzip — quá lớn | Cao | `TC-PERF-02` |
| **BUG-013** | LCP 17.3s (home) / 12.7s (login) — vượt ngưỡng | Cao | `TC-PERF-01` |
| **BUG-014** | Vi phạm A11y trên trang Login (bổ sung) | Trung bình | `TC-A11Y-login` |
| **BUG-015** | Route `/phase1/*` điều hướng chưa đúng khi chưa auth | Trung bình | `TC-RBAC-/phase1/dashboard`, `TC-RBAC-/phase1/app-review` |
| **BUG-016** | `robots.txt` có vấn đề hợp lệ | Thấp | `TC-ROBOTS` |
| **BUG-017** | Staging thiếu source map | Thấp | `TC-PERF-05` |

---

## 6. Quy trình thực thi & trạng thái

**Vòng đời một test case:**

1. **Chuẩn bị** — xác nhận môi trường, thiết bị, dữ liệu tài khoản.
2. **Thực thi** — làm đúng bước mô tả trên **cả hai profile** nếu case ghi `Desktop+Mobile`.
3. **So sánh** kết quả thực tế với kỳ vọng.
4. **Ghi nhận** trạng thái + bằng chứng (ảnh chụp, log `curl`, báo cáo Lighthouse/axe).
5. **Liên kết bug** nếu phát hiện lỗi mới hoặc case đang gắn bug đã biết.

**Bộ trạng thái đề xuất:**

| Trạng thái | Ý nghĩa |
|---|---|
| `Pass` | Kết quả đúng kỳ vọng |
| `Fail` | Kết quả sai kỳ vọng (mở/ cập nhật bug) |
| `Blocked` | Không chạy được do phụ thuộc/môi trường |
| `Known-Bug` | Case phơi bày lỗi đã biết, **tái hiện đúng** như mô tả |
| `N/A` | Không áp dụng cho profile hiện tại |

> **Xử lý case gắn hậu tố `-BUG` / cột Bug có giá trị:**
> - **Khi bug CHƯA vá:** tái hiện đúng lỗi ⇒ ghi `Known-Bug` (không tính là Fail của lần test).
> - **Sau khi bug ĐÃ vá:** kỳ vọng đảo lại (lỗi biến mất) ⇒ chạy lại, kỳ vọng `Pass`. Nếu lỗi vẫn còn ⇒ `Fail` và mở lại bug.

---

## 7. Tiêu chí Pass / Release

Bộ test nền tảng này được xem là **đạt để phát hành** khi:

- **100%** case KHÔNG gắn bug đạt `Pass` trên cả Desktop và Mobile.
- Toàn bộ bug **Nghiêm trọng/Cao** (đặc biệt `BUG-002` lộ SMTP/AI config, `BUG-003`/`BUG-004` thiếu rate limit, `BUG-007`/`BUG-008` nội dung & form, `BUG-001` HTTPS redirect, `BUG-012`/`BUG-013` hiệu năng) đã được vá và verify lại.
- Không phát sinh critical violation mới ở nhóm A11y.
- Không có horizontal scroll ở mọi breakpoint.

**Thứ tự ưu tiên xử lý gợi ý:** Bảo mật (Security/Auth API) → Nội dung & bản địa hoá (BUG-007/008) → Hiệu năng (BUG-012/013) → Accessibility → SEO/Asset.

---

## 8. Mẫu ghi nhận kết quả

Sao chép bảng sau cho mỗi lần chạy (một dòng / một lượt thực thi profile):

| Test ID | Profile | Ngày | Kết quả thực tế | Trạng thái | Bằng chứng | Bug |
|---|---|---|---|---|---|---|
| `TC-...` | Desktop | dd/mm | ... | Pass / Fail / Known-Bug | link ảnh/log | BUG-... |
| `TC-...` | Mobile | dd/mm | ... | ... | ... | ... |

**Mẫu báo cáo bug mới:**

```
Bug ID     : BUG-0xx
Test ID    : TC-...
Môi trường : staging | production (URL)
Thiết bị   : Desktop 1440px | Mobile 375px
Các bước   : 1) ... 2) ... 3) ...
Kỳ vọng    : ...
Thực tế    : ...
Severity   : Nghiêm trọng | Cao | Trung bình | Thấp
Bằng chứng : (ảnh/log)
```

---

## 9. Checklist hồi quy (regression) trước mỗi lần deploy

- [ ] Chạy lại **toàn bộ nhóm Security** (15 case) — không được xuất hiện lỗi mới.
- [ ] Verify các bug đã vá trong sprint → kỳ vọng đảo sang `Pass`.
- [ ] Chạy lại nhóm **Auth UI + Auth API** (26 case) sau mọi thay đổi liên quan đăng nhập.
- [ ] Quét **axe** lại 5 trang A11y sau thay đổi giao diện.
- [ ] Chạy **Lighthouse** lại trang Home + Login sau thay đổi build/bundle.
- [ ] Kiểm tra `Desktop+Mobile` đầy đủ cho case public page.
- [ ] Cập nhật lại con số tổng (102 hiện tại) khi bổ sung case nghiệp vụ.

---

*Tài liệu sinh từ `QA-TESTCASES-rms.xlsx`. Khi cập nhật test case trong file Excel, cần đồng bộ lại các bảng và số liệu ở tài liệu này.*
