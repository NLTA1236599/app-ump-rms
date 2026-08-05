# Bản mô tả kỹ thuật — Tính năng nhắc mail tự động theo mốc thời gian

**Hệ thống:** UMP-RMS (Research Management System)
**Module:** Reminder / Notification
**Stack:** Node.js + TypeScript, PostgreSQL, Nodemailer, node-cron, Docker Compose
**Đối tượng đọc:** Kỹ sư backend triển khai tính năng
**Phiên bản tài liệu:** 1.0

---

## 1. Mục tiêu & phạm vi

### 1.1. Mục tiêu
Tự động gửi email nhắc nhở tới **chủ nhiệm đề tài** và **chuyên viên phụ trách** khi một đề tài sắp đến các mốc thời gian quan trọng, giúp giảm trễ hạn và giảm thao tác thủ công.

### 1.2. Các mốc thời gian cần nhắc (milestone)
Tính năng phải hỗ trợ tối thiểu các loại mốc sau và **cho phép mở rộng thêm loại mới mà không sửa schema**:

| Mã (code) | Tên hiển thị (VI) |
|---|---|
| `PROGRESS_REPORT_1` | Báo cáo tiến độ lần 1 |
| `PROGRESS_REPORT_2` | Báo cáo tiến độ lần 2 |
| `PROGRESS_REPORT_3` | Báo cáo tiến độ lần 3 |
| `MIDTERM_REPORT` | Báo cáo giữa kỳ |
| `ACCEPTANCE` | Nghiệm thu |
| `ACCEPTANCE_EXTENSION` | Gia hạn nghiệm thu |
| `FINAL_ACCEPTANCE_DOC` | Nộp hồ sơ nghiệm thu cuối cùng |

### 1.3. Nguyên tắc thiết kế quan trọng
- **Mỗi mốc có thể có nhiều lần nhắc** (ví dụ nhắc trước 30 ngày, 7 ngày, 1 ngày).
- **Chống gửi trùng (idempotency):** mỗi tổ hợp (mốc × lần nhắc × người nhận) chỉ gửi đúng 1 lần.
- **Cấu hình động:** loại mốc và số ngày nhắc trước được quản lý trong DB (CRUD qua trang admin), không hard-code.
- **Không phụ thuộc uptime tuyệt đối:** nếu server tắt đúng ngày nhắc, job phải bắt được các nhắc bị bỏ lỡ (catch-up) trong cửa sổ cho phép.

### 1.4. Ngoài phạm vi (out of scope) — phiên bản này
- Nhắc qua SMS / Zalo / push notification.
- Giao diện soạn template email trực quan (dùng template code + biến).

---

## 2. Kiến trúc tổng quan

Bám theo Clean Architecture (Domain / Application / Infrastructure / Api).

```
┌─────────────────────────────────────────────────────────┐
│ Api layer                                                 │
│  - ReminderConfigController (CRUD loại mốc & lần nhắc)     │
│  - ProjectMilestoneController (CRUD mốc của đề tài)        │
│  - ReminderLogController (xem lịch sử gửi)                 │
└───────────────┬──────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────┐
│ Application layer                                          │
│  - SendDueRemindersUseCase  ← được cron gọi hằng ngày      │
│  - Manage*UseCase (CRUD cấu hình)                          │
└───────────────┬──────────────────────────────────────────┘
                │  (dùng qua interface)
┌───────────────▼──────────────────────────────────────────┐
│ Domain layer                                              │
│  Entities: MilestoneType, ReminderOffset,                 │
│            ProjectMilestone, ReminderLog                  │
│  Interfaces (ports): IReminderRepository, IEmailSender,    │
│            IReminderLogRepository, IRecipientResolver,     │
│            IClock                                          │
└───────────────┬──────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────┐
│ Infrastructure layer                                      │
│  - PgReminderRepository (PostgreSQL)                      │
│  - NodemailerEmailSender                                  │
│  - CronScheduler (node-cron)                              │
│  - SystemClock (Asia/Ho_Chi_Minh)                         │
└───────────────────────────────────────────────────────────┘
```

**Điểm mấu chốt:** `SendDueRemindersUseCase` chỉ phụ thuộc vào các interface trong Domain. node-cron và Nodemailer là chi tiết ở Infrastructure, được inject vào — thuận tiện cho unit test (mock được toàn bộ).

---

## 3. Mô hình dữ liệu (PostgreSQL)

### 3.1. Bảng `reminder_milestone_types` — danh mục loại mốc
```sql
CREATE TABLE reminder_milestone_types (
    id           SERIAL PRIMARY KEY,
    code         VARCHAR(64)  NOT NULL UNIQUE,   -- 'PROGRESS_REPORT_1', ...
    name_vi      VARCHAR(255) NOT NULL,          -- 'Báo cáo tiến độ lần 1'
    description  TEXT,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

### 3.2. Bảng `reminder_offsets` — các lần nhắc trước hạn cho mỗi loại
```sql
CREATE TABLE reminder_offsets (
    id                 SERIAL PRIMARY KEY,
    milestone_type_id  INT NOT NULL REFERENCES reminder_milestone_types(id) ON DELETE CASCADE,
    offset_days        INT NOT NULL,             -- số ngày TRƯỚC due_date (>= 0)
    label              VARCHAR(100),             -- 'Trước 30 ngày'
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_offset UNIQUE (milestone_type_id, offset_days),
    CONSTRAINT chk_offset_nonneg CHECK (offset_days >= 0)
);
```

### 3.3. Bảng `project_milestones` — mốc thực tế (có ngày) của từng đề tài
```sql
CREATE TABLE project_milestones (
    id                 SERIAL PRIMARY KEY,
    project_id         INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_type_id  INT NOT NULL REFERENCES reminder_milestone_types(id),
    due_date           DATE NOT NULL,            -- ngày đến hạn của mốc
    status             VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | DONE | CANCELLED
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_milestone UNIQUE (project_id, milestone_type_id)
);

CREATE INDEX idx_pm_due_date ON project_milestones (due_date) WHERE status = 'PENDING';
```

### 3.4. Bảng `reminder_logs` — lịch sử gửi + chống trùng
```sql
CREATE TABLE reminder_logs (
    id                    SERIAL PRIMARY KEY,
    project_milestone_id  INT NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
    offset_days           INT NOT NULL,
    recipient_email       VARCHAR(255) NOT NULL,
    recipient_role        VARCHAR(20)  NOT NULL,  -- 'LEADER' | 'SPECIALIST'
    status                VARCHAR(20)  NOT NULL,  -- 'SENT' | 'FAILED'
    error_message         TEXT,
    sent_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    -- Khóa chống gửi trùng: 1 người, 1 mốc, 1 lần nhắc → 1 lần duy nhất khi thành công
    CONSTRAINT uq_reminder_sent
        UNIQUE (project_milestone_id, offset_days, recipient_email)
);
```

> **Lưu ý về idempotency:** ràng buộc UNIQUE chỉ nên áp cho bản ghi `SENT`. Cách đơn giản và an toàn: chèn bản ghi log **trước khi gửi** với `status='SENT'` trong cùng transaction; nếu vi phạm UNIQUE → đã gửi rồi → bỏ qua. Nếu gửi thất bại → update `status='FAILED'` + `error_message` (bản ghi FAILED sẽ được job lần sau thử lại — xem §7).

### 3.5. Nguồn ngày cho `project_milestones`
Nếu các mốc hiện đang là cột rời trên bảng `projects` (ví dụ `report_deadline_1`, `acceptance_date`...), viết một **migration** đổ dữ liệu sang `project_milestones`, sau đó đồng bộ khi tạo/sửa đề tài. Không đọc trực tiếp từ cột rời trong job nhắc để tránh phụ thuộc chặt vào cấu trúc `projects`.

### 3.6. Seed dữ liệu mẫu
```sql
INSERT INTO reminder_milestone_types (code, name_vi) VALUES
  ('PROGRESS_REPORT_1',   'Báo cáo tiến độ lần 1'),
  ('PROGRESS_REPORT_2',   'Báo cáo tiến độ lần 2'),
  ('PROGRESS_REPORT_3',   'Báo cáo tiến độ lần 3'),
  ('MIDTERM_REPORT',      'Báo cáo giữa kỳ'),
  ('ACCEPTANCE',          'Nghiệm thu'),
  ('ACCEPTANCE_EXTENSION','Gia hạn nghiệm thu'),
  ('FINAL_ACCEPTANCE_DOC','Nộp hồ sơ nghiệm thu cuối cùng');

-- Ví dụ: mốc nghiệm thu nhắc trước 30, 7 và 1 ngày
INSERT INTO reminder_offsets (milestone_type_id, offset_days, label)
SELECT id, x.d, x.lbl
FROM reminder_milestone_types t,
     (VALUES (30,'Trước 30 ngày'),(7,'Trước 7 ngày'),(1,'Trước 1 ngày')) AS x(d,lbl)
WHERE t.code = 'ACCEPTANCE';
```

---

## 4. Logic tính thời điểm gửi

Định nghĩa:
```
trigger_date = due_date - offset_days
```

Một reminder cần gửi **hôm nay** khi:
1. `project_milestone.status = 'PENDING'`, và
2. `reminder_milestone_types.is_active = TRUE` và `reminder_offsets.is_active = TRUE`, và
3. `trigger_date` nằm trong khoảng `[today - CATCHUP_DAYS, today]` (cửa sổ catch-up, xem §1.3), và
4. chưa từng gửi thành công cho tổ hợp (mốc × offset × email).

Truy vấn gợi ý (chạy 1 lần/ngày, trả về danh sách cần gửi):
```sql
SELECT
    pm.id            AS project_milestone_id,
    pm.project_id,
    pm.due_date,
    ro.offset_days,
    mt.code          AS milestone_code,
    mt.name_vi       AS milestone_name
FROM project_milestones pm
JOIN reminder_milestone_types mt ON mt.id = pm.milestone_type_id AND mt.is_active
JOIN reminder_offsets ro         ON ro.milestone_type_id = mt.id AND ro.is_active
WHERE pm.status = 'PENDING'
  AND (pm.due_date - ro.offset_days)
        BETWEEN (CURRENT_DATE - $1::INT)   -- $1 = CATCHUP_DAYS
        AND      CURRENT_DATE;
```
Với mỗi dòng, resolve người nhận (§5) rồi kiểm tra `reminder_logs` để bỏ những email đã gửi.

**Múi giờ:** mọi phép so ngày dùng **Asia/Ho_Chi_Minh** (xem §9 về cấu hình cron & DB timezone).

---

## 5. Xác định người nhận (Recipient Resolver)

Với mỗi đề tài, lấy 2 nhóm người nhận:

| Vai trò (role) | Nguồn dữ liệu | Ghi chú |
|---|---|---|
| `LEADER` (chủ nhiệm đề tài) | `projects.leader_id → users.email` | Bắt buộc; nếu email null → log cảnh báo, bỏ qua người này |
| `SPECIALIST` (chuyên viên phụ trách) | `projects.specialist_id → users.email` | Nếu null → log cảnh báo |

Quy tắc:
- Loại bỏ email trùng nhau (nếu chủ nhiệm và chuyên viên là cùng người).
- Bỏ email không hợp lệ (regex cơ bản) và ghi log `FAILED` với `error_message = 'INVALID_EMAIL'`.
- Interface `IRecipientResolver.resolve(projectId): Recipient[]` để dễ thay đổi nguồn (ví dụ sau này lấy đồng chủ nhiệm).

---

## 6. Cấu trúc code & hợp đồng (interface)

### 6.1. Domain — entities & ports (TypeScript)
```typescript
// domain/entities
export interface DueReminder {
  projectMilestoneId: number;
  projectId: number;
  milestoneCode: string;
  milestoneName: string;
  dueDate: Date;
  offsetDays: number;
}

export interface Recipient {
  email: string;
  fullName: string;
  role: 'LEADER' | 'SPECIALIST';
}

// domain/ports
export interface IReminderRepository {
  findDueReminders(catchupDays: number): Promise<DueReminder[]>;
}

export interface IRecipientResolver {
  resolve(projectId: number): Promise<Recipient[]>;
}

export interface IReminderLogRepository {
  // Trả về true nếu chèn được (chưa gửi), false nếu đã tồn tại (đã gửi)
  tryClaim(milestoneId: number, offsetDays: number, email: string, role: string): Promise<boolean>;
  markFailed(milestoneId: number, offsetDays: number, email: string, error: string): Promise<void>;
}

export interface IEmailSender {
  send(to: string, subject: string, html: string): Promise<void>;
}

export interface IClock { today(): Date; }
```

### 6.2. Application — use case chính
```typescript
export class SendDueRemindersUseCase {
  constructor(
    private readonly reminders: IReminderRepository,
    private readonly recipients: IRecipientResolver,
    private readonly logs: IReminderLogRepository,
    private readonly mailer: IEmailSender,
    private readonly config: ReminderConfig, // { catchupDays, appBaseUrl, ... }
  ) {}

  async execute(): Promise<ReminderRunResult> {
    const due = await this.reminders.findDueReminders(this.config.catchupDays);
    let sent = 0, skipped = 0, failed = 0;

    for (const r of due) {
      const people = await this.recipients.resolve(r.projectId);
      for (const p of people) {
        // Claim trước để chống trùng (INSERT ... ON CONFLICT DO NOTHING)
        const claimed = await this.logs.tryClaim(
          r.projectMilestoneId, r.offsetDays, p.email, p.role,
        );
        if (!claimed) { skipped++; continue; }

        try {
          const { subject, html } = buildEmail(r, p, this.config);
          await this.mailer.send(p.email, subject, html);
          sent++;
        } catch (err) {
          await this.logs.markFailed(
            r.projectMilestoneId, r.offsetDays, p.email, String(err),
          );
          failed++;
        }
      }
    }
    return { total: due.length, sent, skipped, failed };
  }
}
```

### 6.3. Infrastructure — lịch chạy (node-cron)
```typescript
import cron from 'node-cron';

export function registerReminderCron(useCase: SendDueRemindersUseCase) {
  // Chạy mỗi ngày lúc 07:00 giờ Việt Nam
  cron.schedule('0 7 * * *', async () => {
    const result = await useCase.execute();
    logger.info('[Reminder] Đã chạy job nhắc mail', result);
  }, { timezone: 'Asia/Ho_Chi_Minh' });
}
```

> **Không tạo 3 job riêng lẻ** cho báo cáo/nghiệm thu/hồ sơ. Dùng **1 job duy nhất** quét theo cấu hình DB — dễ mở rộng, tránh trùng lặp logic (đúng DRY & Open/Closed).

---

## 7. Xử lý lỗi, retry & catch-up

- **Catch-up:** `CATCHUP_DAYS` (mặc định 3). Đảm bảo nếu server down đúng ngày nhắc thì trong 3 ngày kế tiếp vẫn gửi được (không bị nhân đôi nhờ `reminder_logs`).
- **Retry mail lỗi:** bản ghi `FAILED` không chiếm khóa UNIQUE `SENT`. Job hôm sau vẫn chọn lại tổ hợp đó (nếu còn trong cửa sổ) và thử gửi lại. Cân nhắc giới hạn số lần thử qua cột `retry_count` để tránh lặp vô hạn với email hỏng vĩnh viễn.
- **Lỗi SMTP tạm thời:** bọc `mailer.send` bằng retry ngắn (ví dụ 3 lần, backoff 2s/5s) trước khi đánh dấu `FAILED`.
- **Ghi log vận hành:** mỗi lần chạy log tổng `{ total, sent, skipped, failed }` để giám sát.
- **Bảo vệ chạy trùng (nếu scale nhiều instance):** dùng PostgreSQL advisory lock `pg_try_advisory_lock(<key>)` ở đầu job để chỉ 1 instance chạy.

---

## 8. Nội dung email (template)

- Định dạng HTML, tiếng Việt, gọn.
- Biến thay thế: `{{tenNguoiNhan}}`, `{{tenDeTai}}`, `{{maDeTai}}`, `{{tenMoc}}`, `{{dueDate}}`, `{{soNgayConLai}}`, `{{linkDeTai}}`.

Ví dụ tiêu đề & thân:
```
Tiêu đề: [UMP-RMS] Nhắc: {{tenMoc}} - đề tài "{{tenDeTai}}" còn {{soNgayConLai}} ngày

Kính gửi {{tenNguoiNhan}},

Đề tài "{{tenDeTai}}" (mã: {{maDeTai}}) sắp đến hạn:
- Nội dung: {{tenMoc}}
- Hạn cuối: {{dueDate}} (còn {{soNgayConLai}} ngày)

Vui lòng truy cập hệ thống để xử lý: {{linkDeTai}}

Trân trọng,
Hệ thống Quản lý Khoa học Công nghệ - UMP-RMS
```
> Đặt template trong file riêng (ví dụ `templates/reminder.hbs`) để dễ chỉnh mà không sửa code logic.

---

## 9. Biến môi trường (.env) & cấu hình

```dotenv
# SMTP (đã có sẵn cho Nodemailer)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="UMP-RMS <no-reply@ump-khcn.com>"

# Reminder
REMINDER_CRON=0 7 * * *
REMINDER_TIMEZONE=Asia/Ho_Chi_Minh
REMINDER_CATCHUP_DAYS=3
APP_BASE_URL=https://www.ump-khcn.com
```

**Docker / node-cron:**
- Đặt biến `TZ=Asia/Ho_Chi_Minh` cho service backend trong `docker-compose.yml` để container không chạy giờ UTC.
- Cron chạy trong tiến trình Node backend (không cần cron của OS). Đảm bảo service backend luôn chạy (restart policy `unless-stopped`).
- Nếu backend chạy nhiều replica → bật advisory lock (§7) để tránh gửi trùng.

---

## 10. API quản trị (CRUD — trang admin)

| Method | Endpoint | Chức năng |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/reminder-types` | Quản lý danh mục loại mốc |
| GET/POST/PUT/DELETE | `/api/reminder-types/:id/offsets` | Quản lý các lần nhắc (offset) của 1 loại |
| GET/POST/PUT/DELETE | `/api/projects/:id/milestones` | Quản lý mốc (ngày) của đề tài |
| GET | `/api/reminder-logs` | Xem lịch sử gửi (lọc theo đề tài/ngày/trạng thái) |
| POST | `/api/reminders/run` | (Admin) Chạy job thủ công để test |

Toàn bộ endpoint bảo vệ qua JWT + kiểm tra quyền trong `feature_permissions` (chỉ Admin được sửa cấu hình nhắc).

---

## 11. Kiểm thử

**Unit test (không cần DB/SMTP thật):**
- Mock `IReminderRepository` trả về danh sách mốc → assert `SendDueRemindersUseCase` gọi `mailer.send` đúng số lần.
- Test chống trùng: `tryClaim` trả `false` → không gửi, tăng `skipped`.
- Test lỗi SMTP: `mailer.send` throw → gọi `markFailed`, tăng `failed`.
- Test tính `trigger_date` với các offset khác nhau.

**Integration test (DB thật, SMTP giả lập bằng MailHog/Ethereal):**
- Seed 1 đề tài + mốc nghiệm thu due sau 7 ngày → chạy job → kiểm tra có 2 bản ghi `reminder_logs` (leader + specialist).
- Chạy job lần 2 cùng ngày → không phát sinh log mới (idempotent).
- Test catch-up: đặt `trigger_date` = hôm qua với `CATCHUP_DAYS=3` → vẫn gửi.

**Kiểm thử thủ công:** gọi `POST /api/reminders/run` trên môi trường staging, kiểm tra hộp thư MailHog.

---

## 12. Tuân thủ SOLID

- **S (Single Responsibility):** mỗi lớp một việc — `PgReminderRepository` chỉ truy vấn dữ liệu, `NodemailerEmailSender` chỉ gửi mail, `SendDueRemindersUseCase` chỉ điều phối luồng.
- **O (Open/Closed):** thêm loại mốc mới = thêm 1 dòng trong `reminder_milestone_types` (dữ liệu), **không sửa code job**. Đổi kênh gửi (thêm SMS) = thêm implementation mới của `IEmailSender`/notifier, không sửa use case.
- **L (Liskov):** mọi implementation của `IEmailSender`, `IReminderRepository`... thay thế được cho nhau trong use case và test.
- **I (Interface Segregation):** tách `IReminderRepository`, `IReminderLogRepository`, `IEmailSender`, `IRecipientResolver` thành các port nhỏ, không gộp thành một "god interface".
- **D (Dependency Inversion):** Application/Domain chỉ phụ thuộc interface; node-cron, Nodemailer, pg là chi tiết Infrastructure được inject vào — dễ mock khi test.

## 13. Tuân thủ CRUD

- **Create:** thêm loại mốc, thêm offset, thêm mốc cho đề tài (§10). Job tạo bản ghi `reminder_logs` khi gửi.
- **Read:** truy vấn mốc đến hạn (§4), đọc cấu hình, xem lịch sử gửi.
- **Update:** đổi tên/kích hoạt loại mốc, đổi `offset_days`, cập nhật `due_date`/`status` của mốc; cập nhật `reminder_logs.status` từ `SENT`→ hoặc ghi `FAILED`.
- **Delete:** xóa mềm bằng `is_active=FALSE` cho loại mốc/offset (khuyến nghị, để giữ lịch sử); xóa cứng mốc đề tài kèm cascade log khi đề tài bị xóa.

---

## 14. Checklist bàn giao cho kỹ sư

- [ ] Migration tạo 4 bảng (§3) + index + seed danh mục (§3.6).
- [ ] Migration đổ mốc từ cột rời trên `projects` sang `project_milestones` (nếu có) và đồng bộ khi tạo/sửa đề tài.
- [ ] Implement 4 port ở Infrastructure + `SendDueRemindersUseCase`.
- [ ] `RecipientResolver` lấy chủ nhiệm + chuyên viên, khử trùng & validate email.
- [ ] Đăng ký cron 1 job/ngày với timezone Asia/Ho_Chi_Minh + advisory lock.
- [ ] Template email Handlebars + biến thay thế.
- [ ] Endpoint CRUD cấu hình + `POST /api/reminders/run` để test.
- [ ] `.env` và `TZ` trong docker-compose.
- [ ] Unit + integration test (MailHog).
- [ ] Log vận hành mỗi lần chạy job.
