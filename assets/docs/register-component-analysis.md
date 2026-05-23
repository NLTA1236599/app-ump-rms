# Register Component UI Analysis
**System:** Hệ thống Quản lý Dự án Khoa học Công nghệ UMP-RMS
**Institution:** Đại Học Y Dược TP. Hồ Chí Minh (University of Medicine and Pharmacy, HCMC)
**Page:** Đăng ký tài khoản (Account Registration)

> This component lives on the same route/page as the Login component and is activated via the "Đăng ký" tab. It shares the same outer shell (branding header, card container, tab switcher, page footer) with the Login form. Only the card body content differs.

---

## 1. Page Layout & Structure

- **Centered single-column layout**, vertically stacked, horizontally centered on the viewport.
- **Max-width:** ~640–660px card container (wider than the login card to accommodate the multi-field form).
- **Background:** Warm off-white / light cream (`#f5f0eb` or `#f7f3ef`) — consistent with the Login page background.
- **Vertical order (top → bottom):**
  1. Page title (`"Đăng ký tài khoản"`)
  2. Subtitle line 1 (system name)
  3. Subtitle line 2 (institution name)
  4. Card container (white/cream, rounded, subtle shadow)

> **Note:** No institution logo/seal visible above the title on this screen (may be hidden on scroll or absent for the register view).

---

## 2. Header / Branding Section

| Element | Details |
|---|---|
| **Page title** | `"Đăng ký tài khoản"` — large, bold, ~28–32px, dark near-black (`#1a1a1a`), centered |
| **Subtitle 1** | `"Hệ thống Quản lý Dự án Khoa học Công nghệ UMP-RMS"` — ~14px, regular weight, muted warm gray, centered |
| **Subtitle 2** | `"Đại Học Y Dược TP. Hồ Chí Minh"` — ~12–13px, lighter warm gray, centered |
| **Font style** | Appears to use a humanist or slightly serif-influenced sans-serif; the title `"Đăng ký tài khoản"` has a refined, editorial feel |

---

## 3. Card Container

- **Background:** White or very light warm white (`#ffffff` or `#fdfcfb`)
- **Border-radius:** ~14–16px
- **Border:** `1px solid #e2d9ce` — warm beige/tan tint, not neutral gray
- **Box-shadow:** Very soft, warm-tinted: `0 2px 16px rgba(120, 90, 60, 0.07)`
- **Padding:** ~28–32px horizontal, ~24–28px vertical
- **Width:** ~640px max; stretches to ~90vw on smaller screens

---

## 4. Tab Switcher (Đăng nhập / Đăng ký)

Shared with the Login component. In this view, **"Đăng ký" is the active tab**.

| Property | Đăng nhập (inactive) | Đăng ký (active) |
|---|---|---|
| **Background** | Transparent | White / slightly elevated |
| **Text** | `"→ Đăng nhập"` | `"👤 Đăng ký"` |
| **Text color** | Muted gray `#9ca3af` | Dark `#1a1a1a` |
| **Font weight** | Regular | Medium–SemiBold |
| **Border-radius** | — | Pill/rounded (~20px) |
| **Box shadow** | None | Subtle elevation shadow |

- **Tab container:** Full-width of the card, light warm gray background (`#f0ece6`), border-radius ~10px, height ~42px
- **Prefix icons:** Arrow `→` for login, person silhouette `👤` for register

---

## 5. Form Section Header (Below Tabs)

- **Title:** `"Đăng ký tài khoản"` — bold, ~15–16px, dark `#1a1a1a`
- **Subtitle:** `"Tạo tài khoản mới — cần xác nhận qua email trước khi đăng nhập"` — ~13px, muted gray `#6b7280`, regular weight
- **Margin below:** ~20–24px before first section group

---

## 6. Form Section Groups

The form is divided into **three named section groups**, each visually separated by a section header row containing an icon + label + sublabel.

### Section Header Row Design

| Property | Value |
|---|---|
| **Background** | Light warm gray `#f5f0eb` or `#f0ebe4` |
| **Border-radius** | ~8px |
| **Padding** | ~10–12px horizontal, ~10px vertical |
| **Icon** | Left-aligned, ~20px, muted warm gray fill; uses outline-style icon |
| **Label** | Bold, ~14px, dark `#1a1a1a` |
| **Sub-label** | Regular, ~12px, muted gray `#9ca3af`, below the label |
| **Margin** | ~16–20px top margin from previous field group; ~16px bottom margin before first field |

---

## 7. Section Group 1 — Thông tin tài khoản

**Section header icon:** Envelope / mail icon `✉`
**Section label:** `"Thông tin tài khoản"`
**Section sub-label:** `"Email + mật khẩu để đăng nhập"`

### 7.1 Email Trường Field

| Property | Value |
|---|---|
| **Label** | `"Email trường"` + red asterisk `*` for required |
| **Label style** | ~13px, medium weight, dark gray `#374151` |
| **Required indicator** | Red `*` inline after label text, color `#ef4444` |
| **Input type** | `type="email"` |
| **Placeholder** | `"ten.ho@ump.edu.vn"` — muted gray |
| **Helper text** | `"Chấp nhận: @ump.edu.vn, @umc.edu.vn"` — small ~12px, muted gray `#9ca3af`, below input |
| **Border** | `1px solid #d6cfc6`, border-radius ~8px |
| **Background** | White |
| **Full width** | Yes — spans full card width |

### 7.2 Mật Khẩu Field

| Property | Value |
|---|---|
| **Label** | `"Mật khẩu"` + red `*` |
| **Input type** | `type="password"` |
| **Placeholder** | `"Tối thiểu 8 ký tự"` — muted gray |
| **Helper text** | None visible |
| **Full width** | Yes |

### 7.3 Nhập Lại Mật Khẩu Field

| Property | Value |
|---|---|
| **Label** | `"Nhập lại mật khẩu"` + red `*` |
| **Input type** | `type="password"` |
| **Placeholder** | `"Nhập lại mật khẩu"` |
| **Validation** | Must match password field; error shown if mismatch |
| **Full width** | Yes |

---

## 8. Section Group 2 — Thông tin cá nhân

**Section header icon:** Person / user silhouette icon `👤`
**Section label:** `"Thông tin cá nhân"`
**Section sub-label:** `"Họ tên + nhận dạng nhân sự"`

### 8.1 Họ và Tên Field

| Property | Value |
|---|---|
| **Label** | `"Họ và tên"` + red `*` |
| **Input type** | `type="text"` |
| **Placeholder** | `"Nguyễn Văn A"` |
| **Full width** | Yes |

### 8.2 Two-Column Row: Mã Số Nhân Sự + Số Điện Thoại

- **Layout:** Two equal-width inputs side by side (`~50% / 50%`), with a gap of ~12–16px.
- **On mobile:** Likely stacks to full-width single column.

| Field | Label | Placeholder | Type |
|---|---|---|---|
| Left | `"Mã số nhân sự"` | `"vd NS001"` | `type="text"` |
| Right | `"Số điện thoại"` | `"0901234567"` | `type="tel"` |

- Neither field shows a required `*` — both are optional.

### 8.3 Học Hàm, Học Vị Cao Nhất Field

| Property | Value |
|---|---|
| **Label** | `"Học hàm, học vị cao nhất"` — no required `*` (optional) |
| **Input type** | `<select>` dropdown |
| **Placeholder option** | `"Chọn trình độ..."` — muted gray |
| **Chevron icon** | Native browser or custom double-arrow `⇕` on the right |
| **Full width** | Yes |

---

## 9. Section Group 3 — Thông tin công tác

**Section header icon:** Building / office icon `🏢`
**Section label:** `"Thông tin công tác"`
**Section sub-label:** `"Đơn vị + chức vụ hiện tại"`

### 9.1 Đơn Vị Công Tác Field

| Property | Value |
|---|---|
| **Label** | `"Đơn vị công tác"` — no required `*` shown (likely required) |
| **Input type** | `<select>` dropdown |
| **Placeholder option** | `"Chọn đơn vị công tác..."` — muted gray |
| **Chevron icon** | Custom double-arrow `⇕` or `∨` on right |
| **Full width** | Yes |

### 9.2 Chức Vụ Field

| Property | Value |
|---|---|
| **Label** | `"Chức vụ"` — no required `*` |
| **Input type** | `type="text"` |
| **Placeholder** | `"vd Trưởng khoa, Giảng viên, Bác sĩ..."` — muted gray |
| **Full width** | Yes |

---

## 10. Section Group 4 — Vai Trò

**Section header icon:** Person with key / role icon `👤🔑`
**Section label:** `"Vai trò"`
**Section sub-label:** `"Chọn ít nhất 1 vai trò"`

### 10.1 Role Selection Cards

Roles are presented as **selectable cards**, not a dropdown or radio buttons.

#### Role Card Design

| Property | Value |
|---|---|
| **Container** | Rounded card, ~8–10px border-radius |
| **Border (unselected)** | `1px solid #e2d9ce` |
| **Border (selected)** | `1px solid #374151` or dark accent |
| **Background (unselected)** | White or very light cream |
| **Background (selected)** | Slightly warm tinted white |
| **Padding** | ~12–14px horizontal, ~12px vertical |
| **Layout** | Full width; icon + text block on the left, checkmark on the right when selected |

#### "Người nộp đơn" Card (selected state shown)

| Element | Value |
|---|---|
| **Left icon** | Eye icon `👁` — outlined, ~20px, dark |
| **Title** | `"Người nộp đề tài"` — bold, ~14px, dark `#1a1a1a` |
| **Sub-title** | `"Chủ nhiệm đề tài / Thư ký khoa học"` — ~12px, muted gray |
| **Right checkmark** | Filled circle with white checkmark `✓` — dark background `#1a1a1a` or `#374151`, ~20px |
| **Selected state** | Checkmark visible + border darkens |

#### Info Message Below Role Cards

- Text: `"Đã chọn 1 vai trò. Có thể có nhiều vai trò cùng lúc — khi đăng nhập sẽ chọn vai trò cho session."`
- Style: ~12–13px, muted gray `#6b7280`, regular weight
- Layout: Plain text, no background box, below the role cards

> **Note:** Multiple roles can be selected simultaneously. The count updates dynamically ("Đã chọn **N** vai trò").

---

## 11. Submit Button

| Property | Value |
|---|---|
| **Text** | `"Đăng ký tài khoản"` |
| **Width** | Full width of the form |
| **Height** | ~48–52px |
| **Background** | Near-black / very dark gray `#1a1a1a` or `#111111` |
| **Text color** | White `#ffffff` |
| **Font weight** | Medium–SemiBold |
| **Font size** | ~15–16px |
| **Border-radius** | ~10–12px |
| **Hover state** | Slightly lighter dark, e.g. `#2d2d2d` |
| **Disabled state** | Not visible; inferred: lighter gray when required fields incomplete |
| **Margin top** | ~24px from last form element |

> **Contrast with Login:** The Login submit button used blue (`#1a6ec2`). The Register button uses **near-black** (`#1a1a1a`), which matches the warm neutral palette of this form and the tab/card aesthetic.

---

## 12. Footer Links (Inside Card)

- Text: `"Đã có tài khoản?"` — ~13px, muted gray `#6b7280`, regular weight
- Link: `"— Quay lại tab Đăng nhập"` — inline, slightly bolder or same weight, dark gray or muted link color
- **Action:** Switches active tab back to "Đăng nhập"
- **Layout:** Centered below the submit button, ~16px margin top

---

## 14. Color Palette

### 14.1 Core Colors

> **Updated to match the UMP-RMS blue palette** — replacing the warm beige/cream scheme with a blue-dominant brand identity consistent with the broader system design.

| Role | Hex Value | Usage |
|---|---|---|
| **Page background** | `#c9ddf0` | Soft blurred blue-gray backdrop (out-of-focus photo tone, not flat color) |
| **Card background** | `#ffffff` | Pure white card surface, high contrast against page bg |
| **Card border** | `#c8d8eb` | Blue-tinted border, ~1px solid |
| **Card box-shadow** | `rgba(30, 80, 160, 0.10)` | Subtle blue-tinted shadow for depth |
| **Section group bg** | `#e8f1fb` or `#dbeafe` | Light blue tint for section header rows (replaces warm beige) |
| **Brand primary** | `#1a6ec2` | Logo icon, submit button, links, focus rings |
| **Brand primary hover** | `#1558a8` | Submit button hover/active state |
| **Brand primary light** | `#dbeafe` | Section header bg / icon accent fill |

### 14.2 Text Colors

| Role | Hex Value | Usage |
|---|---|---|
| **Page title** | `#1a1a1a` | "Đăng ký tài khoản" heading |
| **Subtitle** | `#78716c` or `#8c8178` | System/institution names below title |
| **Field labels** | `#374151` | "Email trường", "Mật khẩu", etc. |
| **Placeholder text** | `#9ca3af` or `#b0a89e` | All input placeholder text |
| **Helper text** | `#9ca3af` | Below-field hints |
| **Body / info text** | `#6b7280` | Role count info message, footer text |
| **Link text** | `#374151` or `#4b5563` | Footer "Quay lại tab Đăng nhập" |
| **Required asterisk** | `#ef4444` | `*` after required field labels |

### 14.3 Input Colors

| Role | Hex Value |
|---|---|
| Input background | `#ffffff` |
| Input border (default) | `#d6cfc6` — warm gray-beige |
| Input border (focus) | `#374151` or `#5a5248` — dark warm gray |
| Input focus ring | `rgba(55, 65, 81, 0.15)` |

### 14.4 Button & Interactive Colors

| Role | Hex Value |
|---|---|
| Submit button bg | `#1a1a1a` |
| Submit button text | `#ffffff` |
| Submit button hover | `#2d2d2d` |
| Role card border (selected) | `#1a1a1a` |
| Role card checkmark bg | `#1a1a1a` |
| Role card checkmark icon | `#ffffff` |

### 14.5 CSS Variables Reference

```css
:root {
  /* Page */
  --color-page-bg:              #c9ddf0;   /* blurred blue-gray backdrop */
  --color-card-bg:              #ffffff;
  --color-card-border:          #c8d8eb;
  --color-card-shadow:          rgba(30, 80, 160, 0.10);
  --color-section-header-bg:    #dbeafe;   /* light blue tint */

  /* Brand */
  --color-primary:              #1a6ec2;
  --color-primary-hover:        #1558a8;
  --color-primary-light:        #dbeafe;

  /* Text */
  --color-text-heading:         #1a1a1a;
  --color-text-subtitle:        #78716c;
  --color-text-label:           #374151;
  --color-text-placeholder:     #9ca3af;
  --color-text-helper:          #9ca3af;
  --color-text-body:            #6b7280;
  --color-text-link:            #374151;
  --color-required:             #ef4444;

  /* Inputs */
  --color-input-bg:             #ffffff;
  --color-input-border:         #d6cfc6;
  --color-input-border-focus:   #374151;
  --color-input-ring:           rgba(55, 65, 81, 0.15);

  /* Button */
  --color-btn-bg:               #1a1a1a;
  --color-btn-text:             #ffffff;
  --color-btn-hover:            #2d2d2d;

  /* Role card */
  --color-role-border-selected: #1a1a1a;
  --color-role-check-bg:        #1a1a1a;
}
```

---

## 15. Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| Page title | 28–32px | Bold (700) | `#1a1a1a` |
| Subtitle 1 | 14px | Regular (400) | `#78716c` |
| Subtitle 2 | 12–13px | Regular (400) | `#9ca3af` |
| Tab labels | 14px | Active: 600, Inactive: 400 | Active: `#1a1a1a`, Inactive: `#9ca3af` |
| Form section title | 15–16px | SemiBold (600) | `#1a1a1a` |
| Form section subtitle | 13px | Regular (400) | `#6b7280` |
| Section group label | 14px | Bold (700) | `#1a1a1a` |
| Section group sub-label | 12px | Regular (400) | `#9ca3af` |
| Field labels | 13px | Medium (500) | `#374151` |
| Input values / placeholders | 14px | Regular (400) | `#9ca3af` (placeholder) / `#1a1a1a` (value) |
| Helper text | 12px | Regular (400) | `#9ca3af` |
| Role card title | 14px | SemiBold (600) | `#1a1a1a` |
| Role card subtitle | 12px | Regular (400) | `#6b7280` |
| Role info message | 12–13px | Regular (400) | `#6b7280` |
| Submit button | 15–16px | SemiBold (600) | `#ffffff` |
| Footer links | 13px | Regular (400) / Medium (500) | `#6b7280` / `#374151` |

**Font family recommendation:** A humanist sans-serif with excellent Vietnamese diacritic support. Options: `"Be Vietnam Pro"`, `"Nunito"`, `"Mulish"`, or `"Source Sans 3"` from Google Fonts.

---

## 16. Spacing & Sizing

| Element | Value |
|---|---|
| Card max-width | ~640px |
| Card padding (H) | 28–32px |
| Card padding (V) | 24–28px |
| Gap: header branding → card | 24–32px |
| Gap: tabs → form header | 20px |
| Gap: form header → first section group | 20–24px |
| Gap: between section groups | 20–24px |
| Section group header height | ~44–48px |
| Gap: section header → first field | 14–16px |
| Gap: between fields | 16–20px |
| Label → input gap | 4–6px |
| Helper text top margin | 4–6px |
| Two-column row gap | 12–16px |
| Role card padding | 12–14px H / 12px V |
| Gap between role cards | 8–10px |
| Role info message top margin | 8px |
| Submit button top margin | 24px |
| Footer link top margin | 16px |

---

## 17. State Logic & Behavior

### Tab Switching
- "Đăng ký" tab is active; clicking "Đăng nhập" switches to the login form.
- Tab state managed at the shared `<AuthCard>` level.

### Required Fields
- Required fields marked with red `*` after the label.
- Required fields: Email trường, Mật khẩu, Nhập lại mật khẩu, Họ và tên.
- Optional fields: Mã số nhân sự, Số điện thoại, Học hàm/học vị, Đơn vị công tác, Chức vụ.

### Password Confirmation Validation
- "Nhập lại mật khẩu" must match "Mật khẩu".
- On mismatch: red border on the confirm field + inline error message below it.

### Email Domain Validation
- Only `@ump.edu.vn` and `@umc.edu.vn` are accepted.
- Client-side regex validation before submit.
- Error: red border + inline message if invalid domain entered.

### Role Selection
- At least 1 role must be selected (enforced at submit).
- Multiple roles can be selected simultaneously.
- Each role is a toggleable card (click to select/deselect).
- Dynamic counter: `"Đã chọn N vai trò."` updates in real time.
- Currently only 1 role visible: "Người nộp đơn". More roles may appear depending on user type or be added later.

### Submit Button State
- **Enabled:** All required fields filled + at least 1 role selected.
- **Disabled:** Any required field empty or no role selected → button grayed out, `cursor: not-allowed`.
- After submit: likely shows a loading spinner inside the button, then redirects to a confirmation/success screen.

### Post-Registration Flow
- Email confirmation required before login (per form subtitle).
- After submission → success message or redirect to a "check your email" page.

### Error States
- Per-field inline errors: red border on input + small error message below (`~12px`, `#ef4444`).
- Global API error: banner or toast above the submit button.

---

## 18. Accessibility Notes

- All `<input>` and `<select>` elements need `<label>` with matching `for`/`id`.
- Required fields: use `required` attribute + `aria-required="true"`.
- Error messages: use `aria-describedby` linking input to its error element.
- Role cards: implement as `<button role="checkbox" aria-checked="true/false">` or as `<input type="checkbox">` with custom styling.
- Section group headers are decorative — use `role="presentation"` or wrap in `<fieldset>` + `<legend>` for semantic grouping.
- Two-column layout: must reflow to single column on viewports < 480px.
- Submit button: use `disabled` attribute when not submittable, not just visual opacity.

---

## 19. Component Tree (React/Vue reference)

```
<RegisterPage>
  ├── <BrandingHeader>
  │     ├── <PageTitle />         "Đăng ký tài khoản"
  │     ├── <SystemName />        "Hệ thống Quản lý Dự án Khoa học Công nghệ UMP-RMS..."
  │     └── <InstitutionName />   "Đại Học Y Dược..."
  │
  ├── <AuthCard>
  │     ├── <TabSwitcher>
  │     │     ├── <Tab>        "→ Đăng nhập"
  │     │     └── <Tab active> "👤 Đăng ký"
  │     │
  │     ├── <RegisterForm>
  │     │     ├── <FormHeader>
  │     │     │     ├── <FormTitle />    "Đăng ký tài khoản"
  │     │     │     └── <FormSubtitle /> "Tạo tài khoản mới..."
  │     │     │
  │     │     ├── <SectionGroup icon="mail" label="Thông tin tài khoản" sub="Email + mật khẩu...">
  │     │     │     ├── <FormField label="Email trường" required helper="Chấp nhận: @ump...">
  │     │     │     │     └── <Input type="email" />
  │     │     │     ├── <FormField label="Mật khẩu" required>
  │     │     │     │     └── <Input type="password" placeholder="Tối thiểu 8 ký tự" />
  │     │     │     └── <FormField label="Nhập lại mật khẩu" required>
  │     │     │           └── <Input type="password" />
  │     │     │
  │     │     ├── <SectionGroup icon="user" label="Thông tin cá nhân" sub="Họ tên + nhận dạng...">
  │     │     │     ├── <FormField label="Họ và tên" required>
  │     │     │     │     └── <Input type="text" />
  │     │     │     ├── <TwoColumnRow>
  │     │     │     │     ├── <FormField label="Mã số nhân sự">
  │     │     │     │     │     └── <Input type="text" />
  │     │     │     │     └── <FormField label="Số điện thoại">
  │     │     │     │           └── <Input type="tel" />
  │     │     │     └── <FormField label="Học hàm, học vị cao nhất">
  │     │     │           └── <Select placeholder="Chọn trình độ..." />
  │     │     │
  │     │     ├── <SectionGroup icon="building" label="Thông tin công tác" sub="Đơn vị + chức vụ...">
  │     │     │     ├── <FormField label="Đơn vị công tác">
  │     │     │     │     └── <Select placeholder="Chọn đơn vị công tác..." />
  │     │     │     └── <FormField label="Chức vụ">
  │     │     │           └── <Input type="text" placeholder="vd Trưởng khoa..." />
  │     │     │
  │     │     ├── <SectionGroup icon="role" label="Vai trò" sub="Chọn ít nhất 1 vai trò">
  │     │     │     ├── <RoleCard
  │     │     │     │     icon="eye"
  │     │     │     │     title="Người nộp đề tài"
  │     │     │     │     subtitle="Chủ nhiệm đề tài / Thư ký khoa học"
  │     │     │     │     selected={true} />
  │     │     │     └── <RoleInfoMessage count={selectedRoles.length} />
  │     │     │
  │     │     ├── <SubmitButton disabled={!isFormValid}>
  │     │     │     "Đăng ký tài khoản"
  │     │     │
  │     │     └── <LoginRedirectLink />
  │     │           "Đã có tài khoản? — Quay lại tab Đăng nhập"
```

---

## 20. Key Implementation Notes

1. **Shared shell with Login:** The `<AuthCard>`, `<TabSwitcher>`, `<BrandingHeader>`, and page footer are identical to the Login component. Only the inner form body changes per tab.
2. **Section groups as fieldsets:** Each `<SectionGroup>` should semantically wrap its fields in a `<fieldset>` with a `<legend>` for screen reader support, even if visually styled differently.
3. **Two-column grid:** The Mã số nhân sự / Số điện thoại row uses CSS Grid (`grid-template-columns: 1fr 1fr`) with a gap. Collapse to `1fr` below 480px.
4. **Role cards as checkboxes:** Use visually-hidden `<input type="checkbox">` with a custom-styled `<label>` wrapper for each role card. This gives free keyboard navigation and accessibility.
5. **Dynamic role counter:** Store selected roles in state (array). Derive the count for the info message reactively.
6. **Email domain validation:** Implement as a custom validator — check that the value ends with `@ump.edu.vn` or `@umc.edu.vn` before allowing form submission.
7. **Vietnamese font:** Use `Be Vietnam Pro` or `Nunito` — both cover full Vietnamese Unicode range with proper diacritics.
8. **Warm color theme:** This form uses a warm beige/cream palette (not neutral cool gray). All borders, backgrounds, and shadows should use warm-tinted values, not pure `#f3f4f6` or `#d1d5db`.
9. **Submit button color differs from Login:** Login uses blue (`#1a6ec2`); Register uses near-black (`#1a1a1a`). This is intentional — the two forms have a distinct visual hierarchy.
10. **Scroll behavior:** The form is long (two-screen height). Ensure the card does not have a fixed height — it should grow with content and the page scrolls naturally.
