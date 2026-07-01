# Dashboard Overview Page UI Analysis
**System:** UMP-RMS — Hệ thống Quản lý Dự án KHCN  
**Institution:** Đại Học Y Dược TP. Hồ Chí Minh  
**Page:** Tổng quan (Overview / Home Dashboard)  
**Role shown:** Admin (`admin@ump....` / ADMIN)

---

## 1. Overall Page Layout & Structure

- **Two-column layout:** Fixed left sidebar + fluid main content area.
- **No top navigation bar** — the sidebar handles branding and nav entirely.
- **Main content area** scrolls vertically; sidebar is fixed/sticky.
- **Background:** Pure white `#ffffff` for both sidebar and main content. Very clean, no background color on the page body.
- **Viewport assumption:** Designed for desktop (≥1280px wide). Sidebar is ~200–220px wide; main content takes remaining width.

### High-level column structure:

```
┌─────────────────────┬──────────────────────────────────────────────────┐
│   Sidebar (~210px)  │         Main Content Area (fluid)                │
│                     │                                                  │
│  • Logo / Brand     │  Page Title                                      │
│  • Nav items        │  Module Card Grid (4-col × 2-row)                │
│  • User profile     │  Section: Tiến trình dự án (WIP list)            │
└─────────────────────┴──────────────────────────────────────────────────┘
```

---

## 2. Sidebar

### 2.1 Sidebar Container

| Property | Value |
|---|---|
| **Width** | ~200–220px, fixed |
| **Height** | 100vh, sticky/fixed |
| **Background** | White `#ffffff` |
| **Right border** | `1px solid #e5e7eb` — subtle separator from main content |
| **Padding** | ~16–20px horizontal, ~16px vertical |
| **Display** | Flex column, space-between (nav at top, user at bottom) |

### 2.2 Logo / Brand Row

| Element | Details |
|---|---|
| **Icon** | Small open-book icon `📖` — ~18px, blue `#1a6ec2` |
| **Brand name** | `"UMP-RMS"` — bold, ~16px, primary blue `#1a6ec2` |
| **Layout** | Icon + text inline, left-aligned, top of sidebar |
| **Margin bottom** | ~24–32px below brand before nav items |

### 2.3 Navigation Items

Navigation is a vertical list of items. Each item has an icon on the left and a label.

#### Active Item — "Tổng quan"

| Property | Value |
|---|---|
| **Background** | Light blue `#eff6ff` or `#dbeafe` |
| **Border-left** | `3–4px solid #1a6ec2` (left accent bar) |
| **Text color** | Primary blue `#1a6ec2` |
| **Font weight** | SemiBold (600) |
| **Border-radius** | ~6–8px |
| **Padding** | ~8–10px horizontal, ~8px vertical |
| **Icon** | Filled/solid style, blue `#1a6ec2` |

#### Inactive Nav Items

| Property | Value |
|---|---|
| **Background** | Transparent |
| **Text color** | Dark gray `#374151` |
| **Font weight** | Regular (400) |
| **Icon** | Outline style, gray `#6b7280` |
| **Hover state** | Light gray bg `#f9fafb`, text darkens |
| **Padding** | ~8–10px horizontal, ~8px vertical |

#### Full Nav Item List

| # | Icon type | Label |
|---|---|---|
| 1 | Filled square/grid (active) | **Tổng quan** |
| 2 | Home outline | Quản lý đề tài |
| 3 | Document/clipboard outline | Tiến độ thực hiện |
| 4 | List/lines outline | Dữ liệu nghiên cứu |
| 5 | Plus circle | Nhập dữ liệu mới |
| 6 | Workflow/diagram outline | Quy trình thực hiện |

- **Icon size:** ~18px
- **Label font size:** ~13–14px
- **Gap between icon and label:** ~8–10px
- **Gap between nav items:** ~2–4px

### 2.4 User Profile Row (Bottom of Sidebar)

| Element | Details |
|---|---|
| **Position** | Bottom of sidebar, `margin-top: auto` |
| **Avatar** | Circle avatar ~32–36px, gray background `#e5e7eb`, person icon outline — no photo |
| **Name** | `"admin2@ump...."` — truncated with ellipsis, ~13px, dark gray `#374151` |
| **Role badge** | `"ADMIN"` — small caps or uppercase, ~11px, muted gray `#6b7280` or blue accent |
| **Logout icon** | Right-aligned icon (arrow-out / door icon), ~18px, gray `#9ca3af`, clickable |
| **Layout** | Avatar + text stack (name above role) + logout icon, flex row, space-between |
| **Top border** | `1px solid #e5e7eb` separator above this row |
| **Padding top** | ~12–16px |

---

## 3. Main Content Area

### 3.1 Page Header

| Element | Details |
|---|---|
| **Page title** | `"Hệ thống quản lý Dự án KHCN"` |
| **Title color** | Primary blue `#1a6ec2` |
| **Title font size** | ~20–22px |
| **Title font weight** | SemiBold–Bold (600–700) |
| **Bottom border** | `1px solid #e5e7eb` horizontal rule spanning full content width, ~8–12px below title |
| **Padding** | ~20–24px top, ~16px bottom before the divider |

---

## 4. Module Card Grid

### 4.1 Grid Layout

| Property | Value |
|---|---|
| **Columns** | 4 equal columns |
| **Rows** | 2 rows (8 cards total) |
| **Gap** | ~16–20px between cards (both H and V) |
| **Padding** | ~20–24px from content edges |
| **Card width** | ~(content-width − 3×gap) / 4 |

### 4.2 Individual Card Design

| Property | Value |
|---|---|
| **Background** | White `#ffffff` |
| **Border** | `1px solid #e5e7eb` |
| **Border-radius** | ~12–14px |
| **Box-shadow** | Very subtle: `0 1px 4px rgba(0,0,0,0.06)` |
| **Padding** | ~20–24px |
| **Min-height** | ~180–200px |
| **Cursor** | Pointer (entire card is clickable) |
| **Hover state** | Slight shadow lift: `0 4px 12px rgba(0,0,0,0.10)`, possible border color darken |

### 4.3 Card Internal Layout (top → bottom)

```
┌──────────────────────────────┐
│  [Icon Circle]               │
│                              │
│  Card Title                  │
│  Card Subtitle (uppercase)   │
│                              │
│  [Optional CTA link]    [›]  │
└──────────────────────────────┘
```

#### Icon Circle

| Property | Value |
|---|---|
| **Shape** | Circle, ~48–52px diameter |
| **Background** | Unique color per module (see section 4.4) |
| **Icon** | White outline icon, ~22–24px, centered inside circle |
| **Margin bottom** | ~16px before card title |

#### Card Title

| Property | Value |
|---|---|
| **Font size** | ~15–16px |
| **Font weight** | SemiBold (600) |
| **Color** | Dark `#111827` or `#1f2937` |
| **Margin bottom** | ~4–6px |

#### Card Subtitle

| Property | Value |
|---|---|
| **Font size** | ~11–12px |
| **Font weight** | Regular (400) |
| **Color** | Muted gray `#9ca3af` |
| **Text transform** | Uppercase |
| **Letter spacing** | ~0.03–0.05em |
| **Line height** | ~1.4 (may wrap to 2 lines) |

#### CTA / Arrow Row (bottom of card)

| Property | Value |
|---|---|
| **Position** | Bottom of card, `margin-top: auto` |
| **Arrow icon** | `›` chevron-right, ~16px, muted gray `#9ca3af` |
| **Active card CTA** | First card ("Quản lý Dự án KHCN") shows a `"KHÁM PHÁ NGAY"` link in blue `#1a6ec2` + blue circle arrow button |
| **CTA button** | Blue circle ~28–32px, white `›` icon inside, background `#1a6ec2` |
| **Other cards** | Plain `›` chevron only, no text link |

### 4.4 Module Cards — Full Specification

#### Row 1

| # | Title | Subtitle | Icon | Icon bg color |
|---|---|---|---|---|
| 1 | **Quản lý Dự án KHCN** | THEO DÕI TIẾN TRÌNH, KINH PHÍ & SẢN PHẨM ĐỀ TÀI | Folder open | Blue `#1a6ec2` |
| 2 | **Quản lý Sáng kiến** | ĐĂNG KÝ VÀ XÉT DUYỆT CÁC SÁNG KIẾN CẢI TIẾN | Lightbulb | Teal/cyan `#0ea5e9` or `#06b6d4` |
| 3 | **Quản lý Hồ sơ Y đức** | THẨM ĐỊNH ĐẠO ĐỨC TRONG NGHIÊN CỨU Y SINH | Shield check | Green `#10b981` or `#059669` |
| 4 | **Quản lý bài báo quốc tế** | THỐNG KÊ ISI/SCOPUS VÀ KHEN THƯỞNG CÔNG BỐ | Book/journal | Purple `#7c3aed` or `#8b5cf6` |

#### Row 2

| # | Title | Subtitle | Icon | Icon bg color |
|---|---|---|---|---|
| 5 | **Quản lý giờ NCKH** | THEO DÕI GIỜ ĐỊNH MỨC VÀ THỰC TẾ CỦA GIẢNG VIÊN | Clock | Amber/orange `#f59e0b` |
| 6 | **Hội nghị hội thảo** | TỔ CHỨC VÀ QUẢN LÝ SỰ KIỆN KHOA HỌC CÔNG NGHỆ | People/group | Red/pink `#ef4444` or `#e11d48` |
| 7 | **Thống kê dữ liệu** | BÁO CÁO THÔNG MINH VÀ PHÂN TÍCH SỐ LIỆU TỔNG HỢP | Chart/pie | Dark gray/charcoal `#374151` or `#1f2937` |
| 8 | **Chuyển giao công nghệ** | QUẢN LÝ CHUYỂN GIAO KẾT QUẢ NGHIÊN CỨU & SỞ HỮU TRÍ TUỆ | Arrows/transfer | Purple `#7c3aed` (different shade from card 4) |

> **Note on card 1 active state:** The first card ("Quản lý Dự án KHCN") is visually emphasized as the primary/featured module — it has a `"KHÁM PHÁ NGAY"` CTA text link + a filled blue circle arrow button instead of the plain `›` other cards use. This may indicate it's the currently active module or the primary entry point.

> **Note on card 6:** A small yellow/amber dot or indicator is visible at the bottom of the "Hội nghị hội thảo" card — likely a notification badge or status dot.

---

## 5. "Tiến Trình Dự Án Hiện Tại" Section (Work-In-Progress List)

### 5.1 Section Header Row

| Element | Details |
|---|---|
| **Left accent** | `4px solid #1a6ec2` vertical bar, ~20px tall, left of title |
| **Section title** | `"TIẾN TRÌNH DỰ ÁN HIỆN TẠI (WORK-IN-PROGRESS)"` |
| **Title style** | Uppercase, bold (~700), ~14px, dark `#111827` |
| **Right link** | `"XEM DÒNG THỜI GIAN"` — small, uppercase, ~12px, muted gray `#9ca3af`, right-aligned, clickable |
| **Layout** | Flex row, space-between, aligned center |
| **Margin bottom** | ~16–20px before list |

### 5.2 Project List Item Design

Each project is a single row with these columns:

```
┌────┬───────────────────────────────────────────┬──────────┬────────┬───────────────┐
│ #  │ Project Title + Owner                     │ TIẾN ĐỘ  │   %   │  Status badge │
└────┴───────────────────────────────────────────┴──────────┴────────┴───────────────┘
```

#### Row Number Badge

| Property | Value |
|---|---|
| **Shape** | Circle or rounded square, ~24–28px |
| **Background** | Light gray `#f3f4f6` |
| **Text** | Number (1, 2, 3…), ~13px, dark gray `#374151` |
| **Font weight** | Medium (500) |

#### Project Title

| Property | Value |
|---|---|
| **Font size** | ~13–14px |
| **Font weight** | SemiBold (600) |
| **Color** | Dark `#111827` |
| **Text transform** | Uppercase |
| **Overflow** | Truncated with `…` at fixed column width |
| **Max-width** | ~60% of the row |

#### Project Owner

| Property | Value |
|---|---|
| **Prefix** | `"👤 Chủ nhiệm:"` — person icon + label |
| **Text** | Staff name (e.g., `"THS. ĐẶNG QUỐC PHONG"`) |
| **Font size** | ~12px |
| **Color** | Muted blue-gray `#6b7280` |
| **Text transform** | Uppercase |
| **Layout** | Below the project title, same cell |

#### "TIẾN ĐỘ" Column

| Property | Value |
|---|---|
| **Label** | `"TIẾN ĐỘ"` — small uppercase label, ~10–11px, muted gray `#9ca3af` |
| **Progress bar** | Horizontal bar below the label |
| **Bar height** | ~4–6px |
| **Bar background** | Light gray `#e5e7eb` (track) |
| **Bar fill** | Primary blue `#1a6ec2` |
| **Bar border-radius** | Fully rounded (pill), ~9999px |
| **Bar width** | Fixed column width ~120–160px |
| **Percentage text** | Shown right of the bar (or above), ~12px, gray |

#### Progress Values (from screenshot)

| Row | % | Visual bar fill |
|---|---|---|
| 1 | 5% | Very short fill (~5%) |
| 2 | 60% | ~60% fill |
| 3 | 5% | Very short fill (~5%) |

#### Status Badge

| Property | Value |
|---|---|
| **Text** | `"ĐANG THỰC HIỆN"` |
| **Font size** | ~11–12px |
| **Font weight** | Medium–SemiBold |
| **Color** | Blue `#1a6ec2` |
| **Background** | Light blue `#eff6ff` or `#dbeafe` |
| **Border** | `1px solid #bfdbfe` or none |
| **Border-radius** | ~4–6px (pill-ish) |
| **Padding** | ~2–4px vertical, ~8px horizontal |

#### Row Separator

- `1px solid #f3f4f6` or `#e5e7eb` hairline between each row
- **Row padding:** ~14–16px vertical per row

---

## 6. Color Palette

### 6.1 System / Brand Colors

| Role | Hex | Usage |
|---|---|---|
| **Brand primary** | `#1a6ec2` | Sidebar logo, active nav, page title, card CTA button, progress bar fill, status badge text, section accent bar |
| **Brand primary light** | `#dbeafe` / `#eff6ff` | Active nav bg, status badge bg |
| **Brand primary border** | `#bfdbfe` | Status badge border |

### 6.2 Surface Colors

| Role | Hex | Usage |
|---|---|---|
| **Page / sidebar bg** | `#ffffff` | Both sidebar and content bg |
| **Card bg** | `#ffffff` | Module cards |
| **Card border** | `#e5e7eb` | Module card outlines, sidebar border, dividers |
| **Row number bg** | `#f3f4f6` | Numbered badges in project list |
| **Hover bg** | `#f9fafb` | Nav item hover, row hover |

### 6.3 Text Colors

| Role | Hex | Usage |
|---|---|---|
| **Heading / title** | `#111827` | Card titles, project titles, section labels |
| **Body / label** | `#374151` | Nav items inactive, field labels |
| **Muted / helper** | `#6b7280` | Project owner text, subtitles |
| **Placeholder / caption** | `#9ca3af` | Card subtitles, "XEM DÒNG THỜI GIAN", TIẾN ĐỘ label |
| **Active / brand** | `#1a6ec2` | Logo, active nav text, page title, CTA text |

### 6.4 Module Icon Background Colors

| Module | Color | Hex |
|---|---|---|
| Quản lý Dự án KHCN | Blue | `#1a6ec2` |
| Quản lý Sáng kiến | Cyan / Sky | `#06b6d4` |
| Quản lý Hồ sơ Y đức | Emerald / Green | `#10b981` |
| Quản lý bài báo quốc tế | Purple | `#8b5cf6` |
| Quản lý giờ NCKH | Amber | `#f59e0b` |
| Hội nghị hội thảo | Red / Rose | `#ef4444` |
| Thống kê dữ liệu | Dark charcoal | `#374151` |
| Chuyển giao công nghệ | Violet | `#7c3aed` |

### 6.5 Progress Bar Colors

| Element | Hex |
|---|---|
| Track (unfilled) | `#e5e7eb` |
| Fill | `#1a6ec2` |

### 6.6 CSS Variables Reference

```css
:root {
  /* Brand */
  --color-primary:           #1a6ec2;
  --color-primary-light:     #dbeafe;
  --color-primary-lighter:   #eff6ff;
  --color-primary-border:    #bfdbfe;
  --color-primary-hover:     #1558a8;

  /* Surfaces */
  --color-bg:                #ffffff;
  --color-card-bg:           #ffffff;
  --color-card-border:       #e5e7eb;
  --color-row-num-bg:        #f3f4f6;
  --color-hover-bg:          #f9fafb;
  --color-divider:           #e5e7eb;

  /* Text */
  --color-text-heading:      #111827;
  --color-text-body:         #374151;
  --color-text-muted:        #6b7280;
  --color-text-caption:      #9ca3af;
  --color-text-brand:        #1a6ec2;

  /* Progress */
  --color-progress-track:    #e5e7eb;
  --color-progress-fill:     #1a6ec2;

  /* Module icon backgrounds */
  --icon-bg-khcn:            #1a6ec2;
  --icon-bg-sangkien:        #06b6d4;
  --icon-bg-yduc:            #10b981;
  --icon-bg-baibao:          #8b5cf6;
  --icon-bg-nckh:            #f59e0b;
  --icon-bg-hoinghi:         #ef4444;
  --icon-bg-thongke:         #374151;
  --icon-bg-chuyengiao:      #7c3aed;
}
```

---

## 7. Typography

| Element | Size | Weight | Color | Transform |
|---|---|---|---|---|
| Brand name "UMP-RMS" | 16px | Bold (700) | `#1a6ec2` | — |
| Nav items | 13–14px | Regular (400) / SemiBold active | `#374151` / `#1a6ec2` | — |
| Page title | 20–22px | SemiBold (600) | `#1a6ec2` | — |
| Module card title | 15–16px | SemiBold (600) | `#111827` | — |
| Module card subtitle | 11–12px | Regular (400) | `#9ca3af` | UPPERCASE |
| Card CTA text | 12–13px | Medium (500) | `#1a6ec2` | UPPERCASE |
| Section title (WIP) | 13–14px | Bold (700) | `#111827` | UPPERCASE |
| "XEM DÒNG THỜI GIAN" | 12px | Medium (500) | `#9ca3af` | UPPERCASE |
| Project title | 13–14px | SemiBold (600) | `#111827` | UPPERCASE |
| Project owner | 12px | Regular (400) | `#6b7280` | UPPERCASE |
| "TIẾN ĐỘ" label | 10–11px | Regular (400) | `#9ca3af` | UPPERCASE |
| Progress % | 12px | Medium (500) | `#374151` | — |
| Status badge | 11–12px | SemiBold (600) | `#1a6ec2` | UPPERCASE |
| User name | 13px | Medium (500) | `#374151` | — |
| User role | 11px | Regular (400) | `#6b7280` | UPPERCASE |

**Font family:** Clean geometric/humanist sans-serif. Consistent with system: `"Inter"`, `"Be Vietnam Pro"`, or similar. Full Vietnamese diacritic support required.

---

## 8. Spacing & Sizing

| Element | Value |
|---|---|
| Sidebar width | ~200–220px |
| Sidebar horizontal padding | ~16px |
| Sidebar nav item padding | 8–10px H / 8px V |
| Sidebar nav item gap | 2–4px |
| Brand row margin-bottom | 24–32px |
| Content area padding | ~20–24px |
| Page title margin-bottom | ~12–16px + divider |
| Module grid gap | ~16–20px |
| Module card padding | ~20–24px |
| Module card border-radius | ~12–14px |
| Icon circle diameter | ~48–52px |
| Icon circle margin-bottom | ~16px |
| Card title margin-bottom | 4–6px |
| Section header margin-top | ~28–36px |
| Section header margin-bottom | ~16–20px |
| Project row padding | ~14–16px vertical |
| Progress bar height | ~4–6px |
| Progress bar width | ~120–160px |
| Status badge padding | 2–4px V / 8px H |

---

## 9. State Logic & Behavior

### Active Navigation
- Only one nav item is active at a time.
- Active item: left blue accent bar + blue bg + blue text + bold.
- Clicking a nav item navigates to that section; active state updates.

### Module Card Click
- Each card is fully clickable — navigates to that module's page.
- Hover: slight shadow elevation.
- The "KHÁM PHÁ NGAY" CTA on card 1 likely fires the same navigation as clicking the card.

### Notification Dot (Card 6 — Hội nghị hội thảo)
- A small amber/yellow dot at the card bottom suggests a pending notification or new item.
- Likely implemented as an `::after` pseudo-element or a `<span>` badge, ~6–8px circle, `#f59e0b`.

### Project List — "XEM DÒNG THỜI GIAN"
- Right-side link navigates to a timeline/Gantt view of the same projects.

### Progress Bar
- Width driven by inline style: `style="width: {percent}%"` on the fill element.
- Percentage text rendered separately as a sibling span.

### User Profile
- Clicking the logout icon (arrow-out) triggers logout / session clear.
- Name is truncated — full email visible on hover (tooltip) or profile page.

### Responsive Behavior (inferred)
- Below ~768px: sidebar likely collapses to icon-only or hamburger menu.
- Module card grid: 4-col → 2-col → 1-col at smaller breakpoints.
- Project list rows: horizontal layout collapses, progress moves below title.

---

## 10. Accessibility Notes

- Sidebar nav items: use `<nav>` + `<ul>/<li>` with `aria-current="page"` on active item.
- Module cards: implement as `<a>` or `<button>` with descriptive `aria-label`.
- Progress bars: use `<div role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">`.
- Status badges: text is sufficient; no additional aria needed.
- Section headings: use semantic `<h2>` for "TIẾN TRÌNH DỰ ÁN HIỆN TẠI".
- Notification dot: include `aria-label="Có thông báo mới"` on the badge element.
- User logout button: `aria-label="Đăng xuất"` on the icon button.
- Truncated text: provide full text via `title` attribute or tooltip.

---

## 11. Component Tree (React reference)

```
<DashboardPage>
  ├── <Sidebar>
  │     ├── <BrandLogo />                    "📖 UMP-RMS"
  │     ├── <Nav>
  │     │     ├── <NavItem active icon="grid">    Tổng quan
  │     │     ├── <NavItem icon="home">           Quản lý đề tài
  │     │     ├── <NavItem icon="clipboard">      Tiến độ thực hiện
  │     │     ├── <NavItem icon="list">           Dữ liệu nghiên cứu
  │     │     ├── <NavItem icon="plus-circle">    Nhập dữ liệu mới
  │     │     └── <NavItem icon="workflow">       Quy trình thực hiện
  │     └── <UserProfile>
  │           ├── <Avatar />
  │           ├── <UserInfo name="admin2@ump...." role="ADMIN" />
  │           └── <LogoutButton />
  │
  └── <MainContent>
        ├── <PageHeader title="Hệ thống quản lý Dự án KHCN" />
        │
        ├── <ModuleCardGrid>                  4-col CSS grid
        │     ├── <ModuleCard
        │     │     icon="folder" iconBg="#1a6ec2"
        │     │     title="Quản lý Dự án KHCN"
        │     │     subtitle="THEO DÕI TIẾN TRÌNH..."
        │     │     cta="KHÁM PHÁ NGAY" featured />
        │     ├── <ModuleCard icon="lightbulb" iconBg="#06b6d4" title="Quản lý Sáng kiến" ... />
        │     ├── <ModuleCard icon="shield" iconBg="#10b981" title="Quản lý Hồ sơ Y đức" ... />
        │     ├── <ModuleCard icon="book" iconBg="#8b5cf6" title="Quản lý bài báo quốc tế" ... />
        │     ├── <ModuleCard icon="clock" iconBg="#f59e0b" title="Quản lý giờ NCKH" ... />
        │     ├── <ModuleCard icon="users" iconBg="#ef4444" title="Hội nghị hội thảo" hasNotification />
        │     ├── <ModuleCard icon="chart-pie" iconBg="#374151" title="Thống kê dữ liệu" ... />
        │     └── <ModuleCard icon="arrows" iconBg="#7c3aed" title="Chuyển giao công nghệ" ... />
        │
        └── <WIPSection>
              ├── <SectionHeader
              │     title="TIẾN TRÌNH DỰ ÁN HIỆN TẠI (WORK-IN-PROGRESS)"
              │     action="XEM DÒNG THỜI GIAN" />
              └── <ProjectList>
                    ├── <ProjectRow
                    │     index={1}
                    │     title="LỖ HỔNG BẢO MẬT NGHIÊM TRỌNG..."
                    │     owner="THS. ĐẶNG QUỐC PHONG"
                    │     progress={5}
                    │     status="ĐANG THỰC HIỆN" />
                    ├── <ProjectRow index={2} progress={60} owner="THS. LÊ VIỆT TÙNG" ... />
                    └── <ProjectRow index={3} progress={5} owner="THS. HỒ TẤT BẰNG" ... />
```

---

## 12. Key Implementation Notes

1. **Sidebar is fixed, not sticky** — use `position: fixed; height: 100vh` with `overflow-y: auto` to handle long nav lists.
2. **Main content offset** — apply `margin-left: 210px` (sidebar width) to the main content wrapper.
3. **Module card grid** — use CSS Grid: `grid-template-columns: repeat(4, 1fr)` with `gap: 16–20px`. Each card uses `display: flex; flex-direction: column` with `justify-content: space-between` so the arrow always stays at the bottom.
4. **Icon circles** — `border-radius: 50%`, fixed size (~50px), `display: flex; align-items: center; justify-content: center`. Icons inside are white SVGs.
5. **Featured card (card 1)** — conditionally renders a `"KHÁM PHÁ NGAY"` text link + a filled blue circle `›` button instead of the plain `›` chevron. This can be a `featured` boolean prop.
6. **Notification dot (card 6)** — small absolute-positioned circle in the bottom-left or bottom-center of the card. Use `position: relative` on card, `position: absolute; bottom: 12px; left: 20px` on the dot.
7. **Progress bars** — avoid `<progress>` HTML element for cross-browser style consistency; use a `<div>` track + `<div>` fill with inline `width` style.
8. **Section accent bar** — left blue bar on "TIẾN TRÌNH" heading: `border-left: 4px solid #1a6ec2; padding-left: 10px` on the heading wrapper.
9. **Text truncation** — project titles are long. Apply `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` with a `max-width` constraint on the title column.
10. **Vietnamese uppercase text** — `text-transform: uppercase` in CSS; do not store text as uppercase in the data layer (makes it inaccessible and harder to manage).
11. **Font** — `"Inter"` or `"Be Vietnam Pro"` with full Vietnamese Unicode support. Load via Google Fonts with the `vietnamese` subset specified.
