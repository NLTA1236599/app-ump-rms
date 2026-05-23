# Refactor guide: auth, registration, login UI, and user management

This document is the **implementation spec** for refactoring authentication. It replaces an earlier “as-is only” description with **ordered instructions** informed by [`auth-implementation-feedback.md`](./auth-implementation-feedback.md). Use it when changing **`fe0` login/registration UI** (`Login.tsx`, `AuthContext`, `auth-service`) and the supporting **`be0`** + **PostgreSQL** behavior.

---

## 1. Non‑negotiable: security

**Blocker:** The registration endpoint **`POST /api/v1/auth/register`** currently persists **`UserRoleRow(role=body.role)`** where `role` is **client-supplied**. That is **privilege escalation**: anyone who can call the API with a valid `@ump.edu.vn`-style address can send `"admin"` and become **Quản trị viên**. Email validation is not a substitute for server-side role authority.

**Instruction:** Before any cosmetic UI work, **stop trusting `role` from the client on register**. Derive roles **only** on the server (see §5). Treat closing this hole as **P0**; remaining items are hygiene by comparison.

---

## 2. Product rules (target behavior)

1. **Email domains:** `{name}@umc.edu.vn` **or** `{name}@ump.edu.vn` only (normalize: trim, lowercase; **server is authoritative**; client validation is UX only).

2. **Roles from identity (no user-facing role picker on login or register):**
   - A configurable set of emails maps to **Quản trị viên** (`admin` in `fe0/src/lib/permissions.ts`).
   - Every other allowed email gets **Người nộp đơn** (`viewer`) on **first registration**.
   - **Hội đồng** (`editor`) is **not** self-service: grant/revoke via **admin UserManagement** (API), not registration.

3. **User management:** Admins can **list** users and roles, **grant** Hội đồng, **revoke** it, and **deactivate** accounts as needed. The page must be **CRUD-capable from day one** (read-only listing alone is insufficient).

---

## 3. Current implementation (baseline to remove or replace)

### 3.1 Backend (`be0/src/auth_api.py`)

- **`_normalize_ump_email` / `UMP_EMAIL_RE`:** only `@ump.edu.vn` — **reject** `@umc.edu.vn` today.
- **Register:** inserts `User` + `UserRoleRow(role=body.role)` — **trusted client role (bug).**
- **Login:** returns `roles` from DB; **no** role in HTTP body — correct for API shape, but the **frontend** then forces a **role Select** and `buildUserWithSelectedRole(user, selectedRole)`, which **fails** if the user picks the wrong row. That is **not** “no role picker”; it is an **inverted** UX (identity should drive role; users should not see a selector).

### 3.2 Frontend

- **`fe0/src/pages/Login.tsx`:** `validateUmpEmail` — UMP only; **`loginRole` / `regRole`** Selects; register sends **`role`** in JSON.
- **`fe0/src/contexts/AuthContext.tsx`:** After login/register, **`buildUserWithSelectedRole(..., selectedRole)`** (and after register, **`payload.role`**) — **circular** with today’s register bug: client chooses → server stores → client “confirms” the same choice. After server-derived roles, this must become **trust `user.roles` from the API** (see §6).
- **`fe0/src/lib/auth-service.ts`:** Register payload includes **`role`** — remove once API ignores it.
- **`/dashboard/users`:** linked from `DashboardSidebar.tsx` / `admin/DashboardSidebar.tsx` but **no route** in `fe0/src/app/router/routes.tsx` → **404**.

### 3.3 Database

- **`user_role` enum** (`001_initiative_schema.sql`): `applicant`, `council_member`, `editor`, `admin`, `viewer` — **five values**; auth code only reads/writes **three**. Collapsing `applicant`↔`viewer` and `council_member`↔`editor` (or standardizing on one pair) is a **design decision** — do not leave five values with only three “real” forever (see §8).

### 3.4 JWT

- Roles are **embedded in the JWT** at issue time. If an admin **changes** `user_roles` in DB, the user sees new permissions only after **refresh** (or re-login). **Acceptable**, but: surface this in **UserManagement** or docs (e.g. “changes apply on next refresh”) and optionally trigger refresh after admin actions on the **same** browser session if you add that flow later.

---

## 4. Configuration: admin emails (avoid brittle hardcoding)

**Feedback:** Hardcoding the five institutional emails in source is brittle.

**Instruction:** Load the admin allow-list from **environment** (e.g. comma-separated `AUTH_ADMIN_EMAILS`) **and/or** a **seeded DB table** (e.g. `admin_emails` with audit columns). The server’s derivation logic must use **one** resolved list (env merged with DB, or DB only after migration — pick one approach and document it).

Frontend must **not** duplicate the list for **authorization**; at most duplicate **domain regex** for UX (§5.1).

---

## 5. Backend refactor instructions (`be0`)

### 5.1 Email allow-list

- Replace “UMP-only” normalization with a function that accepts **`@ump.edu.vn`** **or** **`@umc.edu.vn`** (same local-part rules as today unless product says otherwise).
- **Reject** everything else with **400** and a clear message.
- **Ship server change before or with** client regex update; server must stay correct if the client is bypassed.

### 5.2 Registration: derive role; ignore client `role`

- **Remove** `role` from the public contract **or** accept but **ignore** it (document deprecation); **never** insert `UserRoleRow` from the client.
- On register: if normalized email ∈ admin list → ensure **`admin`** in `user_roles` (and **not** `viewer`-only self-service for those accounts — product: admins are allow-listed); else → insert **`viewer`** only.
- **Do not** assign **`editor`** at registration.

### 5.3 Login and refresh: **mandatory** role reconciliation

**Feedback:** “Optionally reconcile on login” is too weak; **make it mandatory**.

On **every** `login` and **`refresh`** (and ideally before issuing JWT in those handlers):

1. **Admin by email rule:** If email ∈ admin list and user **lacks** `admin` → **add** `admin` row in `user_roles`.
2. **Removal:** If email **∉** admin list and user’s `admin` was **only** from the email rule → **remove** `admin`.  
   **Critical:** If you later add **`admin` grants via UserManagement** (not email-derived), you **must not** strip those when reconciling. Implement **one** of:
   - **Two sources of truth:** e.g. column `users.is_admin_by_policy BOOLEAN` vs `admin` from grants table; or
   - **Tag rows:** e.g. separate table `user_role_grants(source='email_policy'|'admin_ui')` before mutating; or
   - **Rule:** only auto-remove `admin` if it was created by the policy sync marker you define.

Document the chosen rule in code comments and in this doc.

3. **Default applicant:** If user has **no** `viewer` and is not only admin-only (decide product: admins also `viewer` or not), apply your migration policy — usually new users get `viewer`; existing users need a **data migration** (§8).

### 5.4 Rate limiting

- Add **basic rate limiting** on **`/auth/register`** (per IP or per email) once role assignment is fixed — still an unauthenticated write.

### 5.5 Admin API (read **and** write)

Minimum surface for a real UserManagement product:

| Method | Path (example) | Purpose |
|--------|----------------|---------|
| `GET` | `/api/v1/admin/users` | List users: id, email, full_name, roles[], is_active, … |
| `POST` | `/api/v1/admin/users/:id/roles` | Grant **Hội đồng** (`editor`) — body may specify role |
| `DELETE` | `/api/v1/admin/users/:id/roles/:role` | Revoke `editor` (and optionally other roles per policy) |
| `PATCH` | `/api/v1/admin/users/:id` | e.g. `is_active` — deactivate without deleting |

Protect with existing admin checks (e.g. JWT must include `admin`, `_require_admin_user` pattern in `be0/main.py`).

**Why writes matter:** Viewers never become Hội đồng via registration or the email list; without grant/revoke APIs, the UserManagement page is a **read-only museum**.

### 5.6 Password reset (self-service)

- **`POST /api/v1/auth/forgot-password`** — body `{ "email" }`. Email is normalized with the same institutional rules as register. For valid domains, the JSON response is **always** the same generic success message whether or not the account exists (**enumeration-safe**). Bodies **must not** carry `role` or any privilege field (models use `extra="ignore"`).
- **`POST /api/v1/auth/reset-password`** — `{ "token", "newPassword", "newPasswordConfirm" }`. One-time token stored only as a **hash** in `password_reset_tokens`, short TTL (see `be0/src/auth_api.py`).
- **Rate limiting:** forgot (per normalized email + per client IP) and reset (per IP), implemented in `be0/src/auth_rate_limit.py`.
- **Outbound mail:** configure **`SMTP_HOST`**, **`SMTP_PORT`** (default 587), **`SMTP_USER`**, **`SMTP_PASSWORD`**, **`AUTH_MAIL_FROM`**, **`SMTP_USE_TLS`** (default on), or use **`AUTH_MAIL_LOG_ONLY=1`** to log reset links (development). Set **`AUTH_PUBLIC_WEB_ORIGIN`** or **`PUBLIC_WEB_ORIGIN`** so email links point at the SPA (default `http://localhost:8081`).
- **JWT `cv` (credential version):** column `users.credential_version` increments on password **`/change-password`** and **`/reset-password`**; middleware in `be0/main.py` plus **`/auth/refresh`** reject tokens whose `cv` no longer matches. Apply **`be0/migrations/012_password_reset.sql`**.

Admins **do not** set plaintext passwords; a future “Gửi email đặt lại mật khẩu” in UserManagement should call the same forgot-password logic server-side.

---

## 6. Frontend refactor instructions (`fe0`) — login components

### 6.1 `Login.tsx`

**Remove:**

- All **`<Vai trò đăng nhập>`** / **`loginRole`** state and `Select`.
- All **`regRole`** state and registration **role** `Select`.
- Imports only used for role pickers (`ROLE_DISPLAY_NAMES`, role icons, extra `Select` pieces) — prune dead imports.

**Keep / adjust:**

- Email + password fields; copy should say **UMP or UMC** once regex allows both.
- Replace `validateUmpEmail` with something like `validateInstitutionalEmail` matching **both** domains (still **UX**; server validates for real).

**Behavior:**

- **`handleLogin`:** call `login(email, password)` **without** a role argument (update `AuthContext` signature — §6.2).
- **`handleRegister`:** call `register({ fullName, email, password, passwordConfirm })` **without** `role` (update types and `auth-service`).

**Post-login navigation:** Keep using `resolvePostLoginPath`, but pass the **resolved active role** from context (single derived role — §6.2), e.g. `resolvePostLoginPath(user.roles[0], fromPathname)` or a small helper `getPrimaryRole(user)`.

### 6.2 `AuthContext.tsx`

**`login`:** Change to `login(email, password)` only. After `authService.login`, build session user from **`result.user.roles` returned by the server** — **no** second argument from the UI.

**`register`:** Same: **no** `role` in payload; after success, **trust** `result.user.roles` from API.

**`buildUserWithSelectedRole`:** Refactor or replace:

- **Preferred:** `buildUserFromAuthPayload(authUser)` that sets **one** active role using a **deterministic rule**:
  - If multiple roles exist (e.g. `admin` + `editor`), use **highest privilege** (e.g. `admin` > `editor` > `viewer`) for `user.roles` / permissions in the shell, **or**
  - Keep `availableRoles` for a future **internal** switcher only if product requires it — but **not** on the login screen.
- **Remove** reliance on `localStorage['auth-active-role']` for **login/register** flows unless you keep it **only** for intentional in-app role switching between **already granted** roles (optional follow-up).
- Eliminate error paths like “wrong role selected” for login — users never select.

**Session restore (`refreshSession`):** Same as login: **no** client-selected role; apply the same deterministic mapping from API `roles`.

### 6.3 `auth-service.ts`

- **`register`:** Omit `role` from JSON body once API ignores it.
- Types: `AuthUser` unchanged if API still returns `roles: Role[]`.

### 6.4 Routes and UserManagement page

- Add a real route for **`/dashboard/users`** (or move link to **`/dashboard/admin/users`** and update sidebars consistently).
- Implement **`UserManagement`** with `ProtectedRoute` requiring **`admin.users`** (or equivalent): **table + actions** calling the admin API from §5.5.
- Plan the UI as **list + grant editor + revoke editor + deactivate** from **day one**.

### 6.5 Callers of `login` / `register`

- Grep for `login(` and `register(` across `fe0` (e.g. tests, `SignUpModal.tsx`) and update signatures.

---

## 7. Target data flow (after refactor)

```mermaid
sequenceDiagram
  participant UI as Login.tsx
  participant Ctx as AuthContext
  participant API as auth-service.ts
  participant BE as be0 auth_api
  participant DB as PostgreSQL

  Note over UI,DB: Register (no client role)
  UI->>Ctx: register({ fullName, email, passwords })
  Ctx->>API: POST /api/v1/auth/register (no role)
  API->>BE: body without trusted role
  BE->>BE: derive admin vs viewer from email list
  BE->>DB: INSERT users + user_roles (server only)
  BE-->>API: JWT + user.roles
  Ctx->>Ctx: buildUserFromAuthPayload(user)

  Note over UI,DB: Login (no role picker)
  UI->>Ctx: login(email, password)
  Ctx->>API: POST /api/v1/auth/login
  API->>BE: email + password
  BE->>DB: load user; reconcile policy roles
  BE-->>API: JWT + user.roles
  Ctx->>Ctx: buildUserFromAuthPayload(user)
```

---

## 8. Data migration and enum cleanup

**One-time migration** after fixing register:

- For each `users` row: if email ∈ admin list → ensure `admin` (per reconciliation rules); else if no explicit **editor** grant from admin tooling → normalize to **`viewer`** only as per product.
- **Existing `editor` rows:** **Preserve** as Hội đồng unless product says to wipe and re-grant.
- **Users who became `admin` via the old bug:** Migration should **align** with email policy: if not in admin list, **remove** spurious `admin` (with the same caution as §5.3 if you introduce UI-granted admin later).

**Enum (`applicant` / `council_member`):**

- Decide: **aliases** of `viewer` / `editor` vs **canonical** names.
- Ship a migration that **consolidates** rows and **narrows** the enum or renames consistently. Do **not** finish the auth refactor while five enum values exist but only three are meaningful.

---

## 9. Tests (mandatory for rules that regress silently)

Table-driven tests (Python **or** TS — preferably backend for authority):

- Each admin-configured email → effective roles include **`admin`** (after register and after login).
- `user@ump.edu.vn` (not admin) → **`viewer`** only.
- `user@umc.edu.vn` (not admin) → **`viewer`** only; invalid domain → **400**.
- Case and whitespace on email → **normalized** to same key as policy list.
- Register **ignores** injected `role: "admin"` in JSON for non-admin email (or rejects body field entirely).

---

## 10. Suggested order of work

Aligned with [`auth-implementation-feedback.md`](./auth-implementation-feedback.md):

1. **Fix register:** ignore client `role`; derive roles server-side (**closes privilege escalation**). Ship alone if needed.
2. **Allow `@umc.edu.vn`** on server, then update client regex/copy.
3. **Remove** login/register role selectors; simplify **`AuthContext`** / **`buildUserWithSelectedRole`** → **`buildUserFromAuthPayload`** with a deterministic multi-role rule.
4. **Implement admin API** (list + grant/revoke + patch `is_active`) with authz.
5. **Build UserManagement** page and **add** `/dashboard/users` route; fix sidebar 404.
6. **Data migration + enum cleanup.**
7. **Rate limiting** on register; **tests** from §9.

Steps **1–3** are mostly **deletion and server logic** on the login path. Steps **4–5** are the bulk of **new** code.

---

## 11. File index

| Area | File(s) |
|------|---------|
| Login / register UI | `fe0/src/pages/Login.tsx` |
| Session + role resolution | `fe0/src/contexts/AuthContext.tsx` |
| HTTP client | `fe0/src/lib/auth-service.ts` |
| Permissions / labels | `fe0/src/lib/permissions.ts` |
| Post-login paths | `fe0/src/lib/dashboardNavigation.ts` |
| Routes | `fe0/src/app/router/routes.tsx` |
| Sidebars (dead link) | `fe0/src/components/DashboardSidebar.tsx`, `fe0/src/components/admin/DashboardSidebar.tsx` |
| Auth API | `be0/src/auth_api.py` |
| Password reset mail + rate limits + JWT cv middleware | `be0/src/auth_mail.py`, `be0/src/auth_rate_limit.py`, `be0/src/auth_credential_middleware.py` |
| ORM / enum | `be0/src/initiative_db/models.py`, `be0/migrations/001_initiative_schema.sql` |
| Admin guard patterns | `be0/main.py` (`_require_admin_user`, etc.) |

---

## 12. Evaluation notes incorporated from feedback

| Topic | Handling in this refactor |
|-------|---------------------------|
| Client `role` on register | **Privilege escalation — fix first** |
| Login role Select | **Inverted spec — remove** |
| `buildUserWithSelectedRole` after register | **Circular — trust server `roles`** |
| Email allow-list “sharing” | **Server canonical**; duplicate small regex on client if needed |
| Reconcile on login | **Mandatory**, with **safe rule** for non-email admin grants |
| Admin emails in source | **Env or DB table** |
| Admin API | **Read + write** (grant/revoke/deactivate) |
| UserManagement UI | **CRUD from day one** |
| JWT staleness | **Document**; optional future refresh UX |
| Migration / enum | **Explicit steps** §8 |
| Rate limit register | **§5.4** |
| Tests | **§9** |
