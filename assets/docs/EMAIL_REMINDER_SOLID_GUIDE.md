# Email Reminder Feature — SOLID Implementation Guide

> **Stack:** Node.js · TypeScript · PostgreSQL · node-cron · Nodemailer  
> **Feature:** Automated email reminders for project leaders and specialists at key project deadlines

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Project Structure](#2-project-structure)
3. [SOLID Principles — Applied](#3-solid-principles--applied)
4. [Step-by-Step Implementation](#4-step-by-step-implementation)
   - [Step 1 — Database Schema](#step-1--database-schema)
   - [Step 2 — Environment Configuration](#step-2--environment-configuration)
   - [Step 3 — Email Transport (SRP + DIP)](#step-3--email-transport-srp--dip)
   - [Step 4 — Email Templates (OCP)](#step-4--email-templates-ocp)
   - [Step 5 — Recipient Query Service (ISP)](#step-5--recipient-query-service-isp)
   - [Step 6 — Reminder Jobs (SRP + LSP)](#step-6--reminder-jobs-srp--lsp)
   - [Step 7 — Job Registry (OCP)](#step-7--job-registry-ocp)
   - [Step 8 — Register in App Entry Point](#step-8--register-in-app-entry-point)
5. [Full Trigger Summary](#5-full-trigger-summary)
6. [Testing](#6-testing)
7. [Checklist](#7-checklist)

---

## 1. Feature Overview

Three automated reminder jobs run every day at **08:00 AM**:

```
Every day at 08:00 AM
        │
        ├──► Job 1: Evaluation Report Deadline
        │         WHERE report_deadline = TODAY + 1 month
        │         TO: Project Leader + Specialists
        │         "Còn 1 tháng nộp Hồ sơ nghiệm thu đề tài"
        │
        ├──► Job 2: Acceptance Expiry — 3 months warning
        │         WHERE acceptance_expiry_date = TODAY + 3 months
        │         TO: Project Leader + Specialists
        │         "Còn 3 tháng hết hạn chấp thuận hồ sơ gia hạn đề tài"
        │
        └──► Job 3: Final Acceptance Documents — 1 month warning
                  WHERE acceptance_expiry_date = TODAY + 1 month
                  TO: Project Leader + Specialists
                  "Còn 1 tháng hoàn thiện hồ sơ nghiệm thu cuối cùng"
```

---

## 2. Project Structure

```
backend/src/
├── jobs/
│   ├── reminderJob.ts            # Cron schedule — registers all jobs
│   ├── checkReportDeadline.ts    # Job 1 logic
│   ├── checkAcceptanceExpiry.ts  # Job 2 logic
│   └── checkFinalAcceptance.ts   # Job 3 logic
│
├── services/
│   ├── email/
│   │   ├── IEmailSender.ts       # Interface — DIP contract
│   │   ├── nodemailerSender.ts   # Concrete implementation
│   │   ├── IEmailTemplate.ts     # Interface — OCP contract
│   │   └── templates/
│   │       ├── reportDeadlineTemplate.ts
│   │       ├── acceptanceExpiryTemplate.ts
│   │       └── finalAcceptanceTemplate.ts
│   │
│   └── reminder/
│       ├── IReminderQuery.ts     # Interface — ISP contract
│       └── reminderQueryService.ts
│
└── index.ts                      # App entry point
```

---

## 3. SOLID Principles — Applied

### S — Single Responsibility

Each file does exactly one thing:

| File | Single Responsibility |
|------|----------------------|
| `nodemailerSender.ts` | Send an email via SMTP |
| `reportDeadlineTemplate.ts` | Build the HTML for report deadline emails |
| `reminderQueryService.ts` | Query the DB for projects approaching deadlines |
| `checkReportDeadline.ts` | Orchestrate Job 1 end-to-end |
| `reminderJob.ts` | Register cron schedules |

Changing the email provider never touches templates. Changing template copy never touches DB queries.

---

### O — Open/Closed

New reminder types (e.g. "7 days before submission") are added by:
1. Creating a new template file
2. Creating a new job file
3. Registering it in `reminderJob.ts`

Zero existing files are modified.

---

### L — Liskov Substitution

`NodemailerSender` fully implements `IEmailSender`. Swapping it for `SendGridSender` or `ResendSender` requires no changes in the jobs that use it.

---

### I — Interface Segregation

`IReminderQuery` is split by concern — jobs only inject the query method they need, not a bloated service with unrelated methods.

---

### D — Dependency Inversion

Jobs depend on `IEmailSender` and `IReminderQuery` abstractions, not on `nodemailer` or `pg` directly. Concrete implementations are injected at startup.

---

## 4. Step-by-Step Implementation

### Step 1 — Database Schema

Confirm the required columns exist on your `projects` table:

```sql
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS report_deadline        DATE,
  ADD COLUMN IF NOT EXISTS acceptance_expiry_date DATE;
```

Specialists are linked via a join table:

```sql
CREATE TABLE IF NOT EXISTS project_specialists (
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);
```

Verify the query works manually before wiring it into code:

```sql
-- Test: projects with report_deadline exactly 1 month away
SELECT p.id, p.title, p.report_deadline
FROM projects p
WHERE p.report_deadline::date = (CURRENT_DATE + INTERVAL '1 month')::date;
```

---

### Step 2 — Environment Configuration

Install dependencies:

```bash
cd backend
npm install nodemailer node-cron
npm install -D @types/nodemailer @types/node-cron
```

Add to `backend/.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM="RMS System <your-email@gmail.com>"
```

Add to `docker-compose.yml` under the `backend` service:

```yaml
environment:
  MAIL_HOST: smtp.gmail.com
  MAIL_PORT: "587"
  MAIL_USER: your-email@gmail.com
  MAIL_PASS: your-app-password
  MAIL_FROM: "RMS System <your-email@gmail.com>"
```

---

### Step 3 — Email Transport (SRP + DIP)

**`src/services/email/IEmailSender.ts`**

```ts
export interface EmailPayload {
  to: string
  subject: string
  html: string
}

// Abstraction — jobs depend on this, never on nodemailer directly
export interface IEmailSender {
  send(payload: EmailPayload): Promise<void>
}
```

**`src/services/email/nodemailerSender.ts`**

```ts
import nodemailer from 'nodemailer'
import { IEmailSender, EmailPayload } from './IEmailSender'

export class NodemailerSender implements IEmailSender {
  private transporter = nodemailer.createTransport({
    host:   process.env.MAIL_HOST,
    port:   Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })

  async send(payload: EmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      payload.to,
      subject: payload.subject,
      html:    payload.html,
    })
  }
}
```

---

### Step 4 — Email Templates (OCP)

**`src/services/email/IEmailTemplate.ts`**

```ts
export interface ReminderTemplateData {
  recipientName:  string
  role:           string
  projectTitle:   string
  deadlineDate:   string   // pre-formatted date string
  daysOrMonths:   string   // e.g. "1 tháng", "3 tháng"
}

// Each template implements this — new templates never touch existing ones
export interface IEmailTemplate {
  subject(data: ReminderTemplateData): string
  html(data: ReminderTemplateData): string
}
```

**`src/services/email/templates/reportDeadlineTemplate.ts`**

```ts
import { IEmailTemplate, ReminderTemplateData } from '../IEmailTemplate'

export class ReportDeadlineTemplate implements IEmailTemplate {
  subject(data: ReminderTemplateData): string {
    return `[RMS] Nhắc nhở: Đề tài "${data.projectTitle}" còn ${data.daysOrMonths} nộp Hồ sơ nghiệm thu`
  }

  html(data: ReminderTemplateData): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;">
        <h2 style="color:#d97706;">⚠️ Nhắc nhở nộp Hồ sơ nghiệm thu đề tài</h2>
        <p>Kính gửi <strong>${data.recipientName}</strong> (${data.role}),</p>
        <p>
          Đề tài <strong>"${data.projectTitle}"</strong> còn
          <span style="color:red;font-weight:bold;">${data.daysOrMonths}</span>
          để nộp Hồ sơ nghiệm thu đề tài.
        </p>
        ${deadlineTable(data.deadlineDate)}
        <p>Vui lòng hoàn thành và nộp báo cáo trước thời hạn.</p>
        ${ctaButton('#d97706')}
        ${footer()}
      </div>
    `
  }
}
```

**`src/services/email/templates/acceptanceExpiryTemplate.ts`**

```ts
import { IEmailTemplate, ReminderTemplateData } from '../IEmailTemplate'

export class AcceptanceExpiryTemplate implements IEmailTemplate {
  subject(data: ReminderTemplateData): string {
    return `[RMS] Nhắc nhở: Đề tài "${data.projectTitle}" còn ${data.daysOrMonths} hết hạn chấp thuận gia hạn`
  }

  html(data: ReminderTemplateData): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;">
        <h2 style="color:#dc2626;">🔔 Nhắc nhở hết hạn chấp thuận hồ sơ gia hạn</h2>
        <p>Kính gửi <strong>${data.recipientName}</strong> (${data.role}),</p>
        <p>
          Đề tài <strong>"${data.projectTitle}"</strong> sẽ
          <span style="color:red;font-weight:bold;">hết hạn chấp thuận hồ sơ gia hạn trong ${data.daysOrMonths}</span>.
        </p>
        ${deadlineTable(data.deadlineDate)}
        <p>Vui lòng liên hệ P.KHCN để gia hạn hoặc hoàn tất thủ tục cần thiết.</p>
        ${ctaButton('#dc2626')}
        ${footer()}
      </div>
    `
  }
}
```

**`src/services/email/templates/finalAcceptanceTemplate.ts`**

```ts
import { IEmailTemplate, ReminderTemplateData } from '../IEmailTemplate'

export class FinalAcceptanceTemplate implements IEmailTemplate {
  subject(data: ReminderTemplateData): string {
    return `[RMS] Nhắc nhở: Đề tài "${data.projectTitle}" còn ${data.daysOrMonths} nộp hoàn thiện hồ sơ nghiệm thu cuối cùng`
  }

  html(data: ReminderTemplateData): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;">
        <h2 style="color:#7c3aed;">📋 Nhắc nhở hoàn thiện hồ sơ nghiệm thu cuối cùng</h2>
        <p>Kính gửi <strong>${data.recipientName}</strong> (${data.role}),</p>
        <p>
          Đề tài <strong>"${data.projectTitle}"</strong> còn
          <span style="color:red;font-weight:bold;">${data.daysOrMonths}</span>
          để hoàn thiện hồ sơ nghiệm thu cuối cùng.
        </p>
        ${deadlineTable(data.deadlineDate)}
        <p>Vui lòng chuẩn bị đầy đủ hồ sơ và nộp trước thời hạn.</p>
        ${ctaButton('#7c3aed')}
        ${footer()}
      </div>
    `
  }
}
```

**Shared HTML helpers** — put these at the bottom of a `templateHelpers.ts` file and import into each template:

```ts
// src/services/email/templates/templateHelpers.ts
export const deadlineTable = (date: string) => `
  <table style="border-collapse:collapse;width:100%;margin:16px 0;">
    <tr style="background:#fef3c7;">
      <td style="padding:8px 12px;border:1px solid #fcd34d;font-weight:bold;">Thời hạn</td>
      <td style="padding:8px 12px;border:1px solid #fcd34d;color:red;font-weight:bold;">${date}</td>
    </tr>
  </table>
`

export const ctaButton = (color: string) => `
  <a href="${process.env.FRONTEND_ORIGIN}"
     style="background:${color};color:#fff;padding:10px 20px;
            border-radius:5px;text-decoration:none;display:inline-block;margin-top:12px;">
    Vào hệ thống
  </a>
`

export const footer = () => `
  <p style="margin-top:24px;color:#6b7280;font-size:12px;">
    Email này được gửi tự động từ hệ thống RMS – UMP. Vui lòng không trả lời email này.
  </p>
`
```

---

### Step 5 — Recipient Query Service (ISP)

**`src/services/reminder/IReminderQuery.ts`**

```ts
export interface ProjectRecipient {
  projectId:    string
  projectTitle: string
  deadlineDate: Date
  leader: {
    email: string
    name:  string
  }
  specialists: Array<{
    email: string
    name:  string
  }>
}

// Three focused methods — jobs only import what they need
export interface IReminderQuery {
  getProjectsWithReportDeadlineIn1Month():    Promise<ProjectRecipient[]>
  getProjectsWithAcceptanceExpiryIn3Months(): Promise<ProjectRecipient[]>
  getProjectsWithAcceptanceExpiryIn1Month():  Promise<ProjectRecipient[]>
}
```

**`src/services/reminder/reminderQueryService.ts`**

```ts
import { db } from '../../db'
import { IReminderQuery, ProjectRecipient } from './IReminderQuery'

export class ReminderQueryService implements IReminderQuery {

  // ── Shared query builder ───────────────────────────────────────────────────
  private async queryProjects(
    dateColumn: string,
    interval: string
  ): Promise<ProjectRecipient[]> {

    // Step 1: Get matching projects + leader
    const projects = await db.query<{
      id: string; title: string; deadline: Date
      leader_email: string; leader_name: string
    }>(
      `SELECT
         p.id,
         p.title,
         p.${dateColumn}          AS deadline,
         leader.email             AS leader_email,
         leader.full_name         AS leader_name
       FROM projects p
       JOIN users leader ON p.leader_id = leader.id
       WHERE p.${dateColumn}::date = (CURRENT_DATE + INTERVAL '${interval}')::date`
    )

    if (projects.rows.length === 0) return []

    // Step 2: Get specialists for those projects
    const projectIds = projects.rows.map(r => r.id)
    const specialists = await db.query<{
      project_id: string; email: string; full_name: string
    }>(
      `SELECT ps.project_id, u.email, u.full_name
       FROM project_specialists ps
       JOIN users u ON ps.user_id = u.id
       WHERE ps.project_id = ANY($1)`,
      [projectIds]
    )

    // Step 3: Group specialists by project
    const specialistMap = new Map<string, Array<{ email: string; name: string }>>()
    for (const s of specialists.rows) {
      if (!specialistMap.has(s.project_id)) specialistMap.set(s.project_id, [])
      specialistMap.get(s.project_id)!.push({ email: s.email, name: s.full_name })
    }

    // Step 4: Assemble result
    return projects.rows.map(row => ({
      projectId:    row.id,
      projectTitle: row.title,
      deadlineDate: row.deadline,
      leader: {
        email: row.leader_email,
        name:  row.leader_name,
      },
      specialists: specialistMap.get(row.id) ?? [],
    }))
  }

  // ── Public methods ─────────────────────────────────────────────────────────
  getProjectsWithReportDeadlineIn1Month() {
    return this.queryProjects('report_deadline', '1 month')
  }

  getProjectsWithAcceptanceExpiryIn3Months() {
    return this.queryProjects('acceptance_expiry_date', '3 months')
  }

  getProjectsWithAcceptanceExpiryIn1Month() {
    return this.queryProjects('acceptance_expiry_date', '1 month')
  }
}
```

---

### Step 6 — Reminder Jobs (SRP + LSP)

Each job file is independent. All follow the same shape — easy to read, easy to test.

**`src/jobs/checkReportDeadline.ts`**

```ts
import { IEmailSender } from '../services/email/IEmailSender'
import { IReminderQuery } from '../services/reminder/IReminderQuery'
import { ReportDeadlineTemplate } from '../services/email/templates/reportDeadlineTemplate'

const template = new ReportDeadlineTemplate()

export const checkReportDeadline = async (
  query:  IReminderQuery,
  mailer: IEmailSender
) => {
  console.log('[Job1] Checking report deadlines (1 month)...')

  const projects = await query.getProjectsWithReportDeadlineIn1Month()

  for (const project of projects) {
    const deadlineDate = project.deadlineDate.toLocaleDateString('vi-VN')

    const recipients = [
      { ...project.leader, role: 'Chủ nhiệm đề tài' },
      ...project.specialists.map(s => ({ ...s, role: 'Chuyên viên' })),
    ]

    await Promise.all(
      recipients.map(r =>
        mailer.send({
          to:      r.email,
          subject: template.subject({
            recipientName: r.name,
            role:          r.role,
            projectTitle:  project.projectTitle,
            deadlineDate,
            daysOrMonths:  '1 tháng',
          }),
          html: template.html({
            recipientName: r.name,
            role:          r.role,
            projectTitle:  project.projectTitle,
            deadlineDate,
            daysOrMonths:  '1 tháng',
          }),
        })
      )
    )

    console.log(`[Job1] Sent report reminder for: ${project.projectTitle}`)
  }
}
```

**`src/jobs/checkAcceptanceExpiry.ts`**

```ts
import { IEmailSender } from '../services/email/IEmailSender'
import { IReminderQuery } from '../services/reminder/IReminderQuery'
import { AcceptanceExpiryTemplate } from '../services/email/templates/acceptanceExpiryTemplate'

const template = new AcceptanceExpiryTemplate()

export const checkAcceptanceExpiry = async (
  query:  IReminderQuery,
  mailer: IEmailSender
) => {
  console.log('[Job2] Checking acceptance expiry (3 months)...')

  const projects = await query.getProjectsWithAcceptanceExpiryIn3Months()

  for (const project of projects) {
    const deadlineDate = project.deadlineDate.toLocaleDateString('vi-VN')

    const recipients = [
      { ...project.leader, role: 'Chủ nhiệm đề tài' },
      ...project.specialists.map(s => ({ ...s, role: 'Chuyên viên' })),
    ]

    await Promise.all(
      recipients.map(r =>
        mailer.send({
          to:      r.email,
          subject: template.subject({
            recipientName: r.name,
            role:          r.role,
            projectTitle:  project.projectTitle,
            deadlineDate,
            daysOrMonths:  '3 tháng',
          }),
          html: template.html({
            recipientName: r.name,
            role:          r.role,
            projectTitle:  project.projectTitle,
            deadlineDate,
            daysOrMonths:  '3 tháng',
          }),
        })
      )
    )

    console.log(`[Job2] Sent expiry reminder for: ${project.projectTitle}`)
  }
}
```

**`src/jobs/checkFinalAcceptance.ts`**

```ts
import { IEmailSender } from '../services/email/IEmailSender'
import { IReminderQuery } from '../services/reminder/IReminderQuery'
import { FinalAcceptanceTemplate } from '../services/email/templates/finalAcceptanceTemplate'

const template = new FinalAcceptanceTemplate()

export const checkFinalAcceptance = async (
  query:  IReminderQuery,
  mailer: IEmailSender
) => {
  console.log('[Job3] Checking final acceptance deadline (1 month)...')

  const projects = await query.getProjectsWithAcceptanceExpiryIn1Month()

  for (const project of projects) {
    const deadlineDate = project.deadlineDate.toLocaleDateString('vi-VN')

    const recipients = [
      { ...project.leader, role: 'Chủ nhiệm đề tài' },
      ...project.specialists.map(s => ({ ...s, role: 'Chuyên viên' })),
    ]

    await Promise.all(
      recipients.map(r =>
        mailer.send({
          to:      r.email,
          subject: template.subject({
            recipientName: r.name,
            role:          r.role,
            projectTitle:  project.projectTitle,
            deadlineDate,
            daysOrMonths:  '1 tháng',
          }),
          html: template.html({
            recipientName: r.name,
            role:          r.role,
            projectTitle:  project.projectTitle,
            deadlineDate,
            daysOrMonths:  '1 tháng',
          }),
        })
      )
    )

    console.log(`[Job3] Sent final acceptance reminder for: ${project.projectTitle}`)
  }
}
```

---

### Step 7 — Job Registry (OCP)

**`src/jobs/reminderJob.ts`**

```ts
import cron from 'node-cron'
import { NodemailerSender } from '../services/email/nodemailerSender'
import { ReminderQueryService } from '../services/reminder/reminderQueryService'
import { checkReportDeadline }   from './checkReportDeadline'
import { checkAcceptanceExpiry } from './checkAcceptanceExpiry'
import { checkFinalAcceptance }  from './checkFinalAcceptance'

export const registerReminderJobs = () => {
  // Inject concretions once here — jobs only see abstractions
  const mailer = new NodemailerSender()
  const query  = new ReminderQueryService()

  // Runs every day at 08:00 AM server time
  cron.schedule('0 8 * * *', async () => {
    console.log('[ReminderJob] Running daily reminder checks...')

    await checkReportDeadline(query, mailer)    // Job 1
    await checkAcceptanceExpiry(query, mailer)  // Job 2
    await checkFinalAcceptance(query, mailer)   // Job 3

    console.log('[ReminderJob] All checks complete.')
  })

  console.log('[ReminderJob] Scheduled — runs daily at 08:00 AM')
}
```

> **Adding a new reminder:** Create the template, create the job, add one line here. Zero existing files modified. ✅

---

### Step 8 — Register in App Entry Point

**`src/index.ts`**

```ts
import 'dotenv/config'          // must be first
import express from 'express'
import { registerReminderJobs } from './jobs/reminderJob'

const app = express()

// ... your existing middleware and routes ...

app.listen(Number(process.env.PORT) || 3001, () => {
  console.log(`Server running on port ${process.env.PORT}`)

  // Start reminder scheduler after server is ready
  registerReminderJobs()
})
```

---

## 5. Full Trigger Summary

| Job | Date Column | Interval | Recipients | Vietnamese Message |
|-----|-------------|----------|------------|-------------------|
| 1 — Report Deadline | `report_deadline` | `+1 month` | Leader + Specialists | Còn 1 tháng nộp Hồ sơ nghiệm thu đề tài |
| 2 — Acceptance Expiry | `acceptance_expiry_date` | `+3 months` | Leader + Specialists | Còn 3 tháng hết hạn chấp thuận hồ sơ gia hạn đề tài |
| 3 — Final Acceptance | `acceptance_expiry_date` | `+1 month` | Leader + Specialists | Còn 1 tháng hoàn thiện hồ sơ nghiệm thu cuối cùng |

---

## 6. Testing

### Verify SMTP connection

```bash
cd backend
node -e "
require('dotenv').config();
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});
t.verify().then(() => console.log('✅ SMTP OK')).catch(console.error);
"
```

### Trigger jobs manually (without waiting for 08:00 AM)

Add a temporary test route in development:

```ts
// src/routes/testRoutes.ts  (dev only — remove before production)
import { Router } from 'express'
import { NodemailerSender } from '../services/email/nodemailerSender'
import { ReminderQueryService } from '../services/reminder/reminderQueryService'
import { checkReportDeadline }   from '../jobs/checkReportDeadline'
import { checkAcceptanceExpiry } from '../jobs/checkAcceptanceExpiry'
import { checkFinalAcceptance }  from '../jobs/checkFinalAcceptance'

const router = Router()
const mailer = new NodemailerSender()
const query  = new ReminderQueryService()

router.post('/test/reminders/report',      async (_, res) => { await checkReportDeadline(query, mailer);   res.json({ ok: true }) })
router.post('/test/reminders/expiry',      async (_, res) => { await checkAcceptanceExpiry(query, mailer); res.json({ ok: true }) })
router.post('/test/reminders/final',       async (_, res) => { await checkFinalAcceptance(query, mailer);  res.json({ ok: true }) })

export default router
```

```bash
# Trigger from terminal
curl -X POST http://localhost:3001/test/reminders/report
curl -X POST http://localhost:3001/test/reminders/expiry
curl -X POST http://localhost:3001/test/reminders/final
```

### Insert test data

```sql
-- Insert a project whose report_deadline is exactly 1 month from today
INSERT INTO projects (id, title, leader_id, report_deadline, acceptance_expiry_date, status)
VALUES (
  gen_random_uuid(),
  'Test Project Alpha',
  '<your-leader-user-id>',
  CURRENT_DATE + INTERVAL '1 month',
  CURRENT_DATE + INTERVAL '3 months',
  'accepted'
);
```

---

## 7. Checklist

### Infrastructure
- [ ] `nodemailer` and `node-cron` installed
- [ ] `.env` has all `MAIL_*` variables
- [ ] `docker-compose.yml` has `MAIL_*` environment variables
- [ ] SMTP connection verified with test script

### Database
- [ ] `report_deadline` column exists on `projects`
- [ ] `acceptance_expiry_date` column exists on `projects`
- [ ] `project_specialists` join table exists
- [ ] Manual SQL queries return expected results

### SOLID Compliance
- [ ] Jobs inject `IEmailSender` and `IReminderQuery` — never concrete classes (D)
- [ ] Each job file has exactly one reason to change (S)
- [ ] New reminder added without editing existing job files (O)
- [ ] `NodemailerSender` fully satisfies `IEmailSender` contract (L)
- [ ] No job imports methods it doesn't call (I)

### Email Templates
- [ ] All three templates implemented and exported
- [ ] `templateHelpers.ts` shared across all templates
- [ ] Vietnamese copy reviewed for accuracy

### Scheduler
- [ ] `registerReminderJobs()` called in `index.ts` after server starts
- [ ] Cron expression `0 8 * * *` confirmed for 08:00 AM server time
- [ ] Test routes work in development and removed before production deploy

---

*Generated for RMS – UMP project · June 2026*
