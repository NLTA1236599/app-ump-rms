# Login Component UI Analysis
**System:** Hệ thống Quản lý Dự án Khoa học Công nghệ UMP-RMS
**Institution:** Đại Học Y Dược TP. Hồ Chí Minh (University of Medicine and Pharmacy, HCMC)

---

## 1. Page Layout & Structure

- **Centered single-column layout**, vertically stacked, horizontally centered on the viewport.
- **Max-width:** ~420px card container.
- **Background:** Light neutral (off-white or very light gray), no image or pattern.
- **Vertical order (top → bottom):**
  1. Logo / Institution seal
  2. Page title ("Đăng nhập")
  3. Subtitle line 1 (system name)
  4. Subtitle line 2 (institution name)
  5. Card container (white, rounded, subtle shadow)
  6. Footer link ("← Quay về trang chủ")

---

## 2. Header / Branding Section

| Element | Details |
|---|---|
| **Logo** | Circular university seal/crest, ~64–72px diameter, centered above the title |
| **Page title** | `"Đăng nhập"` — large, bold, serif or semi-bold sans-serif, ~28–32px |
| **Subtitle 1** | `"Hệ thống Quản lý Dự án Khoa học Công nghệ UMP-RMS"` — medium weight, ~14–16px, muted gray |
| **Subtitle 2** | `"Đại Học Y Dược TP. Hồ Chí Minh"` — smaller, ~12–13px, lighter gray |

---

## 3. Card Container

- **Background:** White (`#ffffff`)
- **Border-radius:** ~12–16px
- **Box-shadow:** Soft, diffuse shadow (e.g. `0 4px 20px rgba(0,0,0,0.08)`)
- **Padding:** ~28–32px horizontal, ~24–28px vertical
- **Border:** None or very faint `1px solid #e5e7eb`

---

## 4. Tab Switcher (Đăng nhập / Đăng ký)

- **Type:** Segmented control / pill tab switcher — two tabs inside a rounded container.
- **Container background:** Light gray (`#f3f4f6` or similar), border-radius ~8–10px.
- **Active tab ("→ Đăng nhập"):**
  - White background
  - Box shadow (elevated appearance)
  - Full border-radius (pill shape)
  - Dark text, medium-bold weight
  - Prefix icon: right-arrow `→`
- **Inactive tab ("👤 Đăng ký"):**
  - No background (transparent)
  - Muted gray text
  - Prefix icon: person outline `👤` or similar
- **Width:** Tabs are equal width, full-width of the card.
- **Height:** ~40px

---

## 5. Form Section

### 5.1 Section Label

- Text: `"Đăng nhập"` — bold, ~15–16px, dark color, directly below the tab switcher.
- Sub-label: `"Nhập email và mật khẩu để truy cập hệ thống"` — small, ~13px, muted gray.

### 5.2 Email Field

| Property | Value |
|---|---|
| **Label** | `"Email"` — small, ~13px, medium weight, above the input |
| **Input type** | `type="email"` |
| **Placeholder / value** | `"nltanh@ump.edu.vn"` (pre-filled or placeholder) |
| **Border** | `1px solid #d1d5db`, border-radius ~8px |
| **Background** | White |
| **Padding** | ~10–12px horizontal, ~10px vertical |
| **Font size** | ~14–15px |
| **Focus state** | Border to primary or brand blue; subtle ring/glow |

### 5.3 Password Field

| Property | Value |
|---|---|
| **Label row** | `"Mật khẩu"` label on the left + `"Quên mật khẩu?"` link on the right (same row) |
| **Label style** | Same as Email label |
| **"Quên mật khẩu?" link** | Right-aligned, ~12–13px, muted gray, underline or hover underline, cursor pointer |
| **Input type** | `type="password"` |
| **Value** | 9 bullet characters (password is filled) |
| **Toggle icon** | Not visible in screenshot — may or may not have show/hide eye icon |
| **Border / size** | Same as Email field |

### 5.4 Role Selector ("Vai trò đăng nhập")

| Property | Value |
|---|---|
| **Label** | `"Vai trò đăng nhập"` — same label style as other fields |
| **Input type** | `<select>` dropdown |
| **Placeholder option** | `"Chọn vai trò"` (muted/gray placeholder text) |
| **Chevron icon** | Right-aligned chevron-down `∨`, custom styled or native |
| **Border / radius** | Same as other inputs |
| **Background** | White |

### 5.5 Warning / Info Message

- **Trigger:** Shown when the account has multiple roles (2 in this case).
- **Icon:** ⚠️ Warning triangle, amber/yellow color (~`#f59e0b`)
- **Text:** `"Tài khoản có 2 vai trò — chọn 1 để đăng nhập."` — small, ~12–13px, dark or amber text
- **Layout:** Icon + text inline, no background box — plain text with icon

### 5.6 Submit Button

| Property | Value |
|---|---|
| **Text** | `"Đăng nhập"` |
| **Width** | Full width of the form |
| **Height** | ~44–48px |
| **Background** | Medium-dark gray (`#6b7280` or `#4b5563`) — **not the active primary blue**, suggesting a disabled/inactive state because no role is selected yet |
| **Text color** | White |
| **Border-radius** | ~8px |
| **Font weight** | Medium-bold |
| **State logic** | Button appears disabled (grayed out) until a role is selected from the dropdown |
| **Hover state** | Darker shade when active; no change or cursor-not-allowed when disabled |

---

## 6. Footer Links (Inside Card)

- Text: `"Chưa có tài khoản?"` — normal weight, ~13px, gray
- Link: `"Chuyển sang tab Đăng ký →"` — inline, medium weight or underlined, slightly darker, clickable
- **Action:** Switches active tab to "Đăng ký" tab

---

## 7. Page Footer (Outside Card)

- Text/Link: `"← Quay về trang chủ"` — small, ~13px, muted gray, centered below the card
- **Action:** Navigates back to the home/landing page

---

## 8. Color Palette

> **Updated from UMP-RMS reference design** — the palette is now a clear blue-dominant brand identity, replacing the neutral gray scheme.

### 8.1 Core Brand Colors

| Role | Hex Value | Usage |
|---|---|---|
| **Brand Primary Blue** | `#1a6ec2` or `#1d6fc4` | Logo icon, submit button background, register link text |
| **Brand Primary Blue (hover)** | `#1558a8` | Submit button hover/active state |
| **Brand Primary Blue (light)** | `#e8f1fb` or `#dbeafe` | Logo background fill / icon accent ring |

### 8.2 Page & Surface Colors

| Role | Hex Value | Notes |
|---|---|---|
| **Page background** | `#d6e4f0` or `#c9ddf0` | Soft blurred blue-gray, appears to be a blurred photo with blue-cool tone |
| **Card background** | `#ffffff` | Pure white, high contrast against page bg |
| **Card border** | `#c8d8eb` or `#bfd4e8` | Faint blue-tinted border, ~1px solid |
| **Card box-shadow** | `rgba(30, 80, 160, 0.10)` | Subtle blue-tinted shadow for depth |

### 8.3 Text Colors

| Role | Hex Value | Usage |
|---|---|---|
| **Page title / Brand name** | `#1a1a2e` or `#0f172a` | "UMP-RMS" heading — very dark, near-black |
| **Subtitle / system name** | `#4a6fa5` or `#3b6ea8` | "HỆ THỐNG QUẢN LÝ DỰ ÁN KHCN UMP" — medium blue-gray |
| **Field labels** | `#374151` or `#4b5563` | "EMAIL", "MẬT KHẨU" — uppercase, dark gray |
| **Input placeholder text** | `#9ca3af` | `"ten@ump.edu.vn"`, `"••••••••"` |
| **Helper text** | `#6b7280` | "Chỉ email Đại học Y Dược..." below email field |
| **Helper text accent** | `#1a6ec2` | `@ump.edu.vn` and `@umc.edu.vn` — highlighted in primary blue |
| **Footer plain text** | `#6b7280` | "Chưa có tài khoản?" |
| **Footer link text** | `#1a6ec2` | "Đăng ký ngay" — primary blue, likely underlined on hover |

### 8.4 Input / Form Element Colors

| Role | Hex Value | Notes |
|---|---|---|
| **Input background** | `#ffffff` | White |
| **Input border (default)** | `#d1d5db` or `#c8d4e0` | Light gray, slightly blue-tinted |
| **Input border (focus)** | `#1a6ec2` | Primary blue ring on focus |
| **Input focus ring** | `rgba(26, 110, 194, 0.25)` | Outer glow on focus |
| **Input placeholder** | `#9ca3af` | Standard muted gray |

### 8.5 Button Colors

| Role | Hex Value | Notes |
|---|---|---|
| **Submit button background** | `#1a6ec2` or `#1d6fc4` | Vivid solid blue — **active/enabled state** (always enabled here, no role-select gate) |
| **Submit button text** | `#ffffff` | White, bold, uppercase `"ĐĂNG NHẬP"` |
| **Submit button hover** | `#1558a8` | Slightly darker blue |
| **Submit button border-radius** | ~10–12px | Rounded but not pill-shaped |

### 8.6 Full Palette Reference (CSS Variables)

```css
:root {
  /* Brand */
  --color-primary:          #1a6ec2;
  --color-primary-hover:    #1558a8;
  --color-primary-light:    #dbeafe;

  /* Page */
  --color-page-bg:          #c9ddf0;   /* blurred blue-gray backdrop */
  --color-card-bg:          #ffffff;
  --color-card-border:      #c8d8eb;
  --color-card-shadow:      rgba(30, 80, 160, 0.10);

  /* Text */
  --color-text-heading:     #0f172a;
  --color-text-subtitle:    #4a6fa5;
  --color-text-label:       #374151;
  --color-text-body:        #6b7280;
  --color-text-placeholder: #9ca3af;
  --color-text-link:        #1a6ec2;

  /* Inputs */
  --color-input-bg:         #ffffff;
  --color-input-border:     #d1d5db;
  --color-input-focus:      #1a6ec2;
  --color-input-ring:       rgba(26, 110, 194, 0.25);

  /* Button */
  --color-btn-primary-bg:   #1a6ec2;
  --color-btn-primary-text: #ffffff;
  --color-btn-primary-hover:#1558a8;
}

---

## 9. Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| Page title | 28–32px | Bold (700) | `#111827` |
| Subtitle 1 | 14–15px | Regular (400) | `#6b7280` |
| Subtitle 2 | 12–13px | Regular (400) | `#9ca3af` |
| Tab labels | 14px | Medium (500) | Active: `#111827`, Inactive: `#9ca3af` |
| Section label | 15–16px | SemiBold (600) | `#111827` |
| Section sublabel | 13px | Regular (400) | `#6b7280` |
| Field labels | 13px | Medium (500) | `#374151` |
| Input values | 14–15px | Regular (400) | `#111827` |
| Button text | 15px | Medium/SemiBold | `#ffffff` |
| Warning text | 12–13px | Regular (400) | `#374151` or `#b45309` |
| Footer links | 13px | Regular/Medium | `#6b7280` / `#374151` |

**Suggested font family:** A clean, modern sans-serif — e.g., `"Inter"`, `"Be Vietnam Pro"`, or system-ui. Given the Vietnamese content, a font with good Vietnamese diacritic support is essential (e.g., `Be Vietnam Pro`, `Nunito`, or `Source Sans Pro`).

---

## 10. Spacing & Sizing

| Element | Value |
|---|---|
| Card padding (H) | 28–32px |
| Card padding (V) | 24–28px |
| Gap between header and card | 24–32px |
| Gap between tab and form section | 20–24px |
| Gap between form section label and first field | 12–16px |
| Gap between fields | 16–20px |
| Label to input gap | 4–6px |
| Warning message top margin | 6–8px |
| Submit button top margin | 20–24px |
| Footer inside card top margin | 16px |

---

## 11. State Logic & Behavior

### Tab Switching
- Clicking "Đăng ký" tab switches the active tab and shows a registration form in the same card.
- Active tab has white pill background; inactive tab is transparent.

### Role Selector & Button Enable Logic
- If the user's account has only 1 role → role selector may be hidden or auto-selected.
- If the account has **2+ roles** → role selector is shown + warning message appears.
- Submit button is **disabled** (gray) until a role is selected.
- Once a role is selected → button becomes active (darker/branded color).

### "Forgot Password" Flow
- `"Quên mật khẩu?"` is a link, navigates to a separate forgot-password page or opens a modal.

### "Switch to Register" Link
- `"Chuyển sang tab Đăng ký →"` programmatically activates the Đăng ký tab (same as clicking it).

### Error States (inferred, not visible)
- Invalid email / wrong password → inline error message below the respective field, red border on input.
- API error → toast notification or inline error above the submit button.

---

## 12. Accessibility Notes

- All inputs should have associated `<label>` elements with matching `for`/`id`.
- The tab switcher should use `role="tablist"` / `role="tab"` with `aria-selected`.
- The disabled submit button should use `disabled` attribute (not just visual styling).
- Warning icon should include `aria-label` or `role="img"` with descriptive text for screen readers.
- Color contrast of muted gray text on white background should meet WCAG AA (≥4.5:1 for small text).

---

## 13. Component Tree (React/Vue reference)

```
<LoginPage>
  ├── <BrandingHeader>
  │     ├── <InstitutionLogo />
  │     ├── <PageTitle />         "Đăng nhập"
  │     ├── <SystemName />        "Hệ thống Quản lý Dự án Khoa học Công nghệ UMP-RMS..."
  │     └── <InstitutionName />   "Đại Học Y Dược..."
  │
  ├── <AuthCard>
  │     ├── <TabSwitcher>
  │     │     ├── <Tab active> "→ Đăng nhập"
  │     │     └── <Tab>        "👤 Đăng ký"
  │     │
  │     ├── <LoginForm>
  │     │     ├── <FormHeader>
  │     │     │     ├── <FormTitle />     "Đăng nhập"
  │     │     │     └── <FormSubtitle />  "Nhập email và mật khẩu..."
  │     │     │
  │     │     ├── <FormField label="Email">
  │     │     │     └── <Input type="email" />
  │     │     │
  │     │     ├── <FormField label="Mật khẩu" rightLabel={<ForgotPasswordLink />}>
  │     │     │     └── <Input type="password" />
  │     │     │
  │     │     ├── <FormField label="Vai trò đăng nhập">
  │     │     │     └── <Select placeholder="Chọn vai trò" />
  │     │     │
  │     │     ├── <RoleWarningMessage />  (conditional, shown if roles > 1)
  │     │     │
  │     │     ├── <SubmitButton disabled={!roleSelected}>
  │     │     │     "Đăng nhập"
  │     │     │
  │     │     └── <RegisterRedirectLink />
  │     │           "Chưa có tài khoản? Chuyển sang tab Đăng ký →"
  │
  └── <BackToHomeLink />  "← Quay về trang chủ"
```

---

## 14. Key Implementation Notes

1. **Multi-role detection** must come from the API response after email/password validation (or a pre-check). The role dropdown and warning are conditionally rendered based on this.
2. **Tab state** should be managed at the `<AuthCard>` level, shared between `<TabSwitcher>` and the footer "switch to register" link.
3. **Form validation** should prevent submission if email is empty, password is empty, or (when visible) no role is selected.
4. **Vietnamese font support** is critical — use a font that renders Vietnamese diacritics correctly (e.g., `Be Vietnam Pro` from Google Fonts).
5. The card should be **responsive** — on screens narrower than ~480px, it should take up most of the viewport width with reduced horizontal padding.
