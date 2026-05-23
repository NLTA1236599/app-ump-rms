# BHXH Vietnam Portal — Header UI Rebuild Specification
**Site:** `dichvucong.baohiemxahoi.gov.vn`
**Component:** Site-wide Header (`<header>`)
**Scope:** Top identity bar (logo + institution name + user account) and primary navigation bar
**Source:** Screenshot of dịch vụ công trực tuyến page

> This document provides a complete, engineer-ready specification to rebuild the header exactly. Every measurement, color, and interaction is derived from the screenshot.
> **Note:** The yellow circle in the source image was a user annotation to highlight the area of interest — it is NOT part of the actual UI.

---

## 1. Header Architecture — Two-Layer Stack

The header consists of exactly **two horizontal zones** stacked vertically:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Layer 1 — Top Identity Bar (dark blue bg)                                  │
│  Logo + Institution name left │ User account info right                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Layer 2 — Navigation Bar (medium blue bg)                                  │
│  Home icon │ Tab links │ Active tab highlighted                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Total header height:** ~106–110px
**Position:** `position: sticky; top: 0; z-index: 100` (sticky on scroll)

---

## 2. Layer 1 — Top Identity Bar

### 2.1 Container

| Property | Value |
|---|---|
| **Background** | Dark navy blue `#005b8e` or `#00558a` — deep government blue |
| **Height** | ~64–68px |
| **Width** | `100%` |
| **Display** | `flex justify-between items-center` |
| **Padding** | `px-6` or `px-8` — consistent with page content padding |

### 2.2 Left Section — Logo + Institution Name

**Layout:** `flex items-center gap-3`

#### Logo / Seal Icon

| Property | Value |
|---|---|
| **Type** | Circular logo/seal — white lotus/bird emblem on blue circle |
| **Size** | ~42–48px diameter |
| **Shape** | Circle (`border-radius: 50%`) |
| **Background** | White circle with blue emblem inside |
| **Margin right** | `~12px` before text block |

#### Text Block (stacked, left-aligned)

| Element | Value |
|---|---|
| **Line 1** | `"Đại học Y Dược Thành Phố Hồ Chí Minh"` |
| **Line 1 font size** | `text-xs` (~11–12px) |
| **Line 1 weight** | `font-normal` (400) |
| **Line 1 color** | `text-white` with reduced opacity — `text-white/80` |
| **Line 1 transform** | None — mixed case, natural Vietnamese sentence case |
| **Line 1 letter-spacing** | `tracking-normal` |
| **Line 2** | `"HỆ THỐNG QUẢN LÝ DỮ LIỆU KHOA HỌC CÔNG NGHỆ"` |
| **Line 2 font size** | `text-xl` or `text-2xl` (~20–22px) |
| **Line 2 weight** | `font-black` (900) or `font-extrabold` (800) |
| **Line 2 color** | `text-white` — full opacity, high contrast |
| **Line 2 transform** | `uppercase` |
| **Line 2 letter-spacing** | `tracking-tight` |

### 2.3 Right Section — User Account Info

**Layout:** `flex items-center gap-4`

#### Company/Account Display

| Property | Value |
|---|---|
| **Text** | Dynamically rendered from auth context — the currently logged-in account's name/email |
| **Example value** | `"admin2@ump.edu.vn"` or `"Nguyễn Văn A"` — whatever the session provides |
| **Text style** | `text-sm text-white font-medium` |
| **Overflow** | `truncate` with `max-width: ~200px` — long names ellipsis gracefully |
| **Source** | `currentUser.name` or `currentUser.email` from auth store / session context |

```tsx
// ✅ Render logged-in user name dynamically
const { currentUser } = useAuth(); // or useSession(), useUser(), etc.

<span className="text-sm text-white font-medium truncate max-w-[200px]">
  {currentUser?.name ?? currentUser?.email ?? 'Tài khoản'}
</span>
```

#### Log Out Button

| Property | Value |
|---|---|
| **Text** | `"Đăng xuất"` |
| **Icon** | Arrow-right-from-bracket / logout icon `→` or `⎋`, left of text |
| **Background** | `bg-transparent` or `bg-white/10` |
| **Border** | `border border-white/20` |
| **Border-radius** | `rounded-full` or `rounded-lg` |
| **Padding** | `px-3 py-1.5` |
| **Font size** | `text-sm` |
| **Font weight** | `font-medium` |
| **Color** | `text-white` |
| **Cursor** | `cursor-pointer` |
| **Hover** | `hover:bg-red-500/80 hover:border-red-400` — shifts to red on hover to signal destructive action |
| **Transition** | `transition-all duration-150` |
| **Action** | Calls `logout()` / `signOut()` → clears session → redirects to `/login` |

```tsx
// ✅ Logout button
const { logout } = useAuth();

<button
  onClick={logout}
  className="flex items-center gap-2 border border-white/20 rounded-full px-3 py-1.5 text-sm font-medium text-white bg-transparent hover:bg-red-500/80 hover:border-red-400 transition-all duration-150"
  aria-label="Đăng xuất khỏi hệ thống"
>
  <LogOutIcon className="w-4 h-4" />
  Đăng xuất
</button>
```

---

## 3. Layer 2 — Navigation Bar

### 3.1 Container

| Property | Value |
|---|---|
| **Background** | Medium blue `#0072bc` or `#0076c0` — brighter/lighter than identity bar |
| **Height** | ~38–42px |
| **Width** | `100%` |
| **Display** | `flex items-center` |
| **Padding** | `px-6` or `px-8` — same as identity bar |

### 3.2 Navigation Items

**Layout:** `flex items-center` — horizontal row, left-aligned

#### Home Icon (First Item)

| Property | Value |
|---|---|
| **Type** | House/home icon — SVG or icon font |
| **Size** | ~16–18px |
| **Color** | `text-white` |
| **Background on active** | Slightly darker blue or `bg-black/10` |
| **Padding** | `px-3 py-2` |
| **Border-radius** | None or minimal |
| **Cursor** | `cursor-pointer` |
| **Action** | Navigates to homepage |

#### Text Navigation Tabs

**8 tabs total.** Exactly one tab is active at a time — the active tab renders with a white background and dark blue text. All others render as transparent with white text.

| # | Label | Default state |
|---|---|---|
| 1 | `"Đề tài KHCN"` | **Active** (white/highlighted) |
| 2 | `"Sáng kiến"` | Inactive |
| 3 | `"Hồ sơ Y đức"` | Inactive |
| 4 | `"Bài báo quốc tế"` | Inactive |
| 5 | `"Giờ NCKH"` | Inactive |
| 6 | `"Hội nghị - Hội thảo"` | Inactive |
| 7 | `"Thống kê số liệu"` | Inactive |
| 8 | `"Chuyển giao công nghệ"` | Inactive |

> **Note:** Tab labels 6–8 are inferred names for the additional slots — replace with the actual labels from the system. The visual design rules below apply identically to all 8 tabs.

#### Tab Design — Inactive State

| Property | Value |
|---|---|
| **Font size** | `text-sm` (~13–14px) |
| **Font weight** | `font-medium` (500) |
| **Color** | `text-white` with slight transparency — `text-white/90` |
| **Background** | `transparent` |
| **Padding** | `px-4 py-2.5` |
| **Hover bg** | `hover:bg-white/10` |
| **Cursor** | `cursor-pointer` |
| **Transition** | `transition-colors duration-150` |

#### Tab Design — Active State

| Property | Value |
|---|---|
| **Background** | `bg-white` — confirmed: white/highlighted |
| **Text color** | `text-[#005b8e]` — dark blue on white |
| **Font weight** | `font-semibold` (600) |
| **Border-radius** | `rounded-t-md` — top corners only, bottom flush with nav bar |
| **Padding** | `px-4 py-2.5` — same as inactive |
| **Effect** | "Raised tab" — white bg appears to lift out of the nav bar into the content area below |

> **Active tab visual effect:** The white background on the active tab creates a "tab sticking up into the content area" effect — the bottom of the nav bar visually connects to the page content for the active section. If page content is not white, add `margin-bottom: -1px; border-bottom: 1px solid #ffffff` to close the gap.

#### Active State Logic (React / state-driven)

```tsx
// ✅ Single activeTab state drives all 8 tabs
const TABS = [
  { id: 'de-tai-khcn',           label: 'Đề tài KHCN' },
  { id: 'sang-kien',             label: 'Sáng kiến' },
  { id: 'ho-so-y-duc',           label: 'Hồ sơ Y đức' },
  { id: 'bai-bao-quoc-te',       label: 'Bài báo quốc tế' },
  { id: 'gio-nckh',              label: 'Giờ NCKH' },
  { id: 'hoi-nghi-hoi-thao',     label: 'Hội nghị - Hội thảo' },
  { id: 'thong-ke-so-lieu',      label: 'Thống kê số liệu' },
  { id: 'chuyen-giao-cong-nghe', label: 'Chuyển giao công nghệ' },
];

// Tab 1 is active by default
const [activeTab, setActiveTab] = useState('de-tai-khcn');

// Render:
{TABS.map(tab => (
  <a
    key={tab.id}
    href={`/${tab.id}`}
    onClick={() => setActiveTab(tab.id)}
    aria-current={activeTab === tab.id ? 'page' : undefined}
    className={
      activeTab === tab.id
        ? 'px-4 py-2.5 text-sm font-semibold bg-white text-[#005b8e] rounded-t-md transition-colors'
        : 'px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors'
    }
  >
    {tab.label}
  </a>
))}
```

#### Tab Gap / Separator

| Property | Value |
|---|---|
| **Between tabs** | No visible separator — padding creates visual spacing |
| **Gap** | `gap-0` — tabs sit flush, active tab's white bg provides visual separation |

---

## 4. Complete Color Palette

### 4.1 Header-Specific Colors

| Role | Hex | Usage |
|---|---|---|
| **Identity bar bg** | `#005b8e` | Top dark navy strip |
| **Nav bar bg** | `#0072bc` | Navigation strip |
| **Text on dark blue** | `#ffffff` | Logo text, nav links, account info |
| **Text muted on dark blue** | `rgba(255,255,255,0.80)` | Sub-label "GIAO DỊCH ĐIỆN TỬ" |
| **Active tab bg** | `#ffffff` | "Dịch vụ công" active tab |
| **Active tab text** | `#005b8e` | Text on active white tab |
| **Hover overlay** | `rgba(0,0,0,0.10)` | Tab/button hover |
| **Account button border** | `rgba(255,255,255,0.20)` | Account button outline |

### 4.2 CSS Variables

```css
:root {
  --bhxh-dark-blue:      #005b8e;
  --bhxh-nav-blue:       #0072bc;
  --bhxh-white:          #ffffff;
  --bhxh-text-muted:     rgba(255, 255, 255, 0.80);
  --bhxh-hover-overlay:  rgba(0, 0, 0, 0.10);
  --bhxh-border-subtle:  rgba(255, 255, 255, 0.20);
}
```

---

## 5. Typography

| Element | Font size | Weight | Color | Transform | Tracking |
|---|---|---|---|---|---|
| "Đại học Y Dược Thành Phố Hồ Chí Minh" | `11–12px` | 400 | `rgba(255,255,255,0.80)` | None (sentence case) | `tracking-normal` |
| "HỆ THỐNG QUẢN LÝ DỮ LIỆU KHOA HỌC CÔNG NGHỆ" | `20–22px` | 900 | `#ffffff` | `uppercase` | `tracking-tight` |
| Company name (truncated) | `13–14px` | 500 | `#ffffff` | — | — |
| Account number | `13–14px` | 500 | `#ffffff` | — | — |
| Nav tabs (inactive) | `13–14px` | 500 | `rgba(255,255,255,0.90)` | — | — |
| Nav tab (active) | `13–14px` | 600 | `#005b8e` | — | — |

**Font family:** Vietnamese system font stack or `"Roboto"` / `"Source Sans Pro"` — standard government portal font. Full Vietnamese diacritic support required.

---

## 6. Spacing & Sizing

| Element | Value |
|---|---|
| Identity bar height | `64–68px` |
| Nav bar height | `38–42px` |
| Total header height | `~106–110px` |
| Logo diameter | `42–48px` |
| Logo-to-text gap | `12px` |
| Content horizontal padding | `24–32px` |
| Tab padding | `px-4 py-2.5` (16px H / 10px V) |
| Account button padding | `px-3 py-1.5` |
| Between company text and button | `gap-4` (16px) |

---

## 7. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Desktop (≥1280px) | Full layout as specified |
| Tablet (768–1279px) | Company name truncates further; tabs may compress padding |
| Mobile (<768px) | Nav tabs likely collapse to hamburger menu; identity bar compresses |

---

## 8. Accessibility Notes

- Logo and institution name: wrap in `<a href="/">` with `aria-label="Trang chủ Đại học Y Dược TP. Hồ Chí Minh"`
- Nav tabs: use `<nav>` element with `role="navigation"` and `aria-label="Menu chính"`
- Active tab: `aria-current="page"` on the active link
- Log out button: `aria-label="Đăng xuất khỏi hệ thống"` — describes the destructive action clearly

---

## 9. Canonical HTML Structure

```html
<header class="sticky top-0 z-50">

  <!-- Layer 1: Identity Bar -->
  <div class="identity-bar" style="background: #005b8e;">
    <div class="container flex justify-between items-center px-8 h-16">

      <!-- Left: Logo + Name -->
      <a href="/" class="flex items-center gap-3" aria-label="Trang chủ BHXH Việt Nam">
        <img src="/logo-bhxh.png" alt="Logo BHXH" class="w-12 h-12 rounded-full" />
        <div class="flex flex-col">
          <span class="text-[11px] font-normal text-white/80">
            Đại học Y Dược Thành Phố Hồ Chí Minh
          </span>
          <span class="text-xl font-black text-white uppercase tracking-tight">
            HỆ THỐNG QUẢN LÝ DỮ LIỆU KHOA HỌC CÔNG NGHỆ
          </span>
        </div>
      </a>

      <!-- Right: Account Info -->
      <div class="flex items-center gap-4">
        <!-- Logged-in user name — rendered dynamically from auth context -->
        <span class="text-sm text-white font-medium truncate max-w-[200px]">
          {currentUser.name}
        </span>

        <!-- Log Out Button -->
        <button
          onclick="logout()"
          class="flex items-center gap-2 border border-white/20 rounded-full px-3 py-1.5 text-sm font-medium text-white bg-transparent hover:bg-red-500/80 hover:border-red-400 transition-all duration-150"
          aria-label="Đăng xuất khỏi hệ thống"
        >
          <svg><!-- logout / arrow-right-from-bracket icon --></svg>
          Đăng xuất
        </button>
      </div>

    </div>
  </div>

  <!-- Layer 2: Navigation Bar -->
  <nav style="background: #0072bc;" aria-label="Menu chính">
    <div class="container flex items-center px-8 h-10">

      <!-- Home icon -->
      <a href="/" class="px-3 py-2 text-white hover:bg-black/10 transition-colors rounded-sm">
        <svg><!-- home icon --></svg>
      </a>

      <!-- Nav Tabs — 8 total, Tab 1 active by default -->

      <!-- Tab 1: Active -->
      <a href="/de-tai-khcn"
         class="px-4 py-2.5 text-sm font-semibold bg-white text-[#005b8e] rounded-t-md"
         aria-current="page">
        Đề tài KHCN
      </a>

      <a href="/sang-kien"
         class="px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
        Sáng kiến
      </a>

      <a href="/ho-so-y-duc"
         class="px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
        Hồ sơ Y đức
      </a>

      <a href="/bai-bao-quoc-te"
         class="px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
        Bài báo quốc tế
      </a>

      <a href="/gio-nckh"
         class="px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
        Giờ NCKH
      </a>

      <a href="/hoi-nghi-hoi-thao"
         class="px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
        Hội nghị - Hội thảo
      </a>

      <a href="/thong-ke-so-lieu"
         class="px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
        Thống kê số liệu
      </a>

      <a href="/chuyen-giao-cong-nghe"
         class="px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
        Chuyển giao công nghệ
      </a>

    </div>
  </nav>

</header>
```

---

## 10. Canonical CSS (if not using Tailwind)

```css
/* ===== HEADER ===== */
header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

/* Layer 1 — Identity Bar */
.identity-bar {
  background-color: #005b8e;
  height: 68px;
  display: flex;
  align-items: center;
  padding: 0 32px;
  justify-content: space-between;
}

/* Logo */
.logo-img {
  width: 46px;
  height: 46px;
  border-radius: 50%;
}

/* Institution name block */
.institution-name {
  display: flex;
  flex-direction: column;
}
.institution-name .sub-label {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.80);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.institution-name .main-label {
  font-size: 20px;
  font-weight: 900;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

/* Log Out Button */
.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.20);
  border-radius: 9999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}
.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.80);  /* red-500/80 */
  border-color: rgba(248, 113, 113, 0.80);     /* red-400/80 */
}

/* Layer 2 — Navigation Bar */
.nav-bar {
  background-color: #0072bc;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 32px;
}

/* Nav tabs */
.nav-tab {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.90);
  text-decoration: none;
  transition: background-color 0.15s;
  border-radius: 0;
}
.nav-tab:hover {
  background-color: rgba(0, 0, 0, 0.10);
}

/* Active tab */
.nav-tab.active {
  background-color: #ffffff;
  color: #005b8e;
  font-weight: 600;
  border-radius: 6px 6px 0 0;    /* Top corners rounded only */
}

/* Home icon tab */
.nav-home {
  padding: 8px 12px;
  color: #ffffff;
  border-radius: 4px;
  transition: background-color 0.15s;
}
.nav-home:hover {
  background-color: rgba(0, 0, 0, 0.10);
}
```

---

## 11. Key Implementation Notes

1. **Active tab bottom edge** — the active tab's white background should visually merge with the page content background below it. If the page content area is also white, no extra styling is needed. If not, apply `margin-bottom: -1px` and `border-bottom: 1px solid white` to the active tab.

2. **Two distinct blues** — `#005b8e` (darker, identity bar) and `#0072bc` (lighter/brighter, nav bar) are both present. Cursor will try to use one blue for both. They must be different values.

3. **`tracking-tight` on system name** — "HỆ THỐNG QUẢN LÝ DỮ LIỆU KHOA HỌC CÔNG NGHỆ" is a long uppercase string; `tracking-tight` prevents it from overflowing the identity bar at typical desktop widths.

4. **Line 1 is sentence case** — `"Đại học Y Dược Thành Phố Hồ Chí Minh"` renders in natural mixed case with no `text-transform`. Do NOT apply `uppercase` to it — the visual contrast between the muted sentence-case sub-label and the bold uppercase main title is intentional.

5. **Company name truncation** — the right-side company name (`"TZ7284V - CÔNG TY TNHH PHÚC TÂM..."`) is truncated dynamically. Use `overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px`.

6. **Log out button turns red on hover** — `hover:bg-red-500/80` signals a destructive action without being alarming in its default state. The default appearance (transparent + white border) blends into the dark identity bar; the red only appears on intentional hover.

7. **Sticky positioning** — the entire `<header>` (both layers as one element) is sticky. Do not make each layer independently sticky.

8. **Vietnamese font** — both institution name and nav labels contain Vietnamese diacritics. Use a font with full Unicode Vietnamese support. `"Roboto"` or `"Be Vietnam Pro"` from Google Fonts are appropriate for government portal aesthetics.

9. **Logo is NOT a simple favicon** — it is a detailed circular seal/emblem (lotus + bird emblem of BHXH). It should be an `<img>` loaded from the asset server, not an icon font glyph.
