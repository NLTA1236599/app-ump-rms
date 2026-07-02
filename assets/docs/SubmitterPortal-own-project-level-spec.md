# "Người Nộp Đề Tài" Portal — Complete UI Rebuild Specification
**Role:** Người nộp đề tài (Research Project Submitter)
**Port:** Separate frontend port from the admin system (e.g. `localhost:5175` / `app-submitter`)
**Source:** Screenshot of the "Đề tài của tôi" page after login with "Người nộp đề tài" account
**Engineer level:** 10 years experience — every pixel, interaction, and state is documented

---

## 1. System Architecture Note — Why a Separate Port

This portal runs as a **separate Vite app** from the admin portal:

```
┌─────────────────────────┐     ┌──────────────────────────────┐
│  Admin Portal           │     │  Người Nộp Đề Tài Portal     │
│  Port: 5173             │     │  Port: 5175                  │
│  Roles: Admin, Manager  │     │  Role: Người nộp đề tài      │
│  Full DataTable         │     │  Restricted: own projects only│
│  All management tools   │     │  Register + track only       │
└─────────────────────────┘     └──────────────────────────────┘
        │                                     │
        └─────────────── Same Backend API ────┘
                    (Node.js / Firestore)
```

**Routing difference:** The same backend API is shared. Role is enforced both at the API level (JWT claim `role: 'submitter'`) and at the frontend — the submitter portal has no routes to admin pages.

---

## 2. Full Page Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (left, fixed, ~220px)                                             │
├──────────────────────────────────────────────────────────────────────────  │
│  MAIN CONTENT AREA (fluid, right of sidebar)                               │
│                                                                            │
│  ┌── PAGE HEADER ROW ─────────────────────────────────────────────────┐   │
│  │  [🧪] Đề tài của tôi             [+ Đăng ký đề tài mới] button    │   │
│  │  Đăng ký thuyết minh và quản lý tiến độ đề tài nghiên cứu.        │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌── TABLE CARD ───────────────────────────────────────────────────────┐  │
│  │  Danh sách đề tài              [🔍 Tìm mã số, tên đề tài, cấp...] │  │
│  │  1 đề tài                                                          │  │
│  │                                                                     │  │
│  │  [Tất cả 1] [Bản thảo 0] [Chờ phê duyệt 0] [Đã phê duyệt 1] [Bị từ chối 0] │
│  │                                                                     │  │
│  │  ─────────────────────────────────────────────────────────────     │  │
│  │  Mã số  │  Tên đề tài           │  Cấp      │  Thời gian │  Trạng thái  │  Thao tác │
│  │  ─────────────────────────────────────────────────────────────     │  │
│  │  —      │  📄 Ứng dụng AI ...   │  cấp cơ sở│  24 tháng  │  Đã phê duyệt│  Mở ↗    │
│  └─────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

**Background:** Light blue-gray `#c9ddf0` or `#f0f6fb` — consistent with the main system's blue palette (matching `BHXH-header-analysis.md` page canvas).

---

## 3. Sidebar

### 3.1 Sidebar Container

| Property | Value |
|---|---|
| **Width** | `~220px`, fixed |
| **Height** | `100vh` |
| **Background** | White `#ffffff` |
| **Border-right** | `1px solid #e5e7eb` |
| **Position** | `fixed left-0 top-0` |
| **Padding** | `px-4 py-5` |

> **Note:** The sidebar is not fully visible in the screenshot (cropped left edge), but the layout clearly shows a left sidebar with navigation items. Based on the submitter role context and the design system established in `BHXH-sidebar-analysis.md`, the sidebar follows the same pattern.

### 3.2 Sidebar Navigation Items for "Người Nộp Đề Tài"

Restricted to only the submitter's own scope — no admin tools:

| # | Icon | Label | Route | Notes |
|---|---|---|---|---|
| 1 | `BeakerIcon` | **Đề tài của tôi** | `/de-tai` | **Active** in screenshot |
| 2 | `DocumentPlusIcon` | Đăng ký mới | `/de-tai/dang-ky` | Quick access to registration form |
| 3 | `ClockIcon` | Tiến độ | `/de-tai/tien-do` | Workflow progress of own projects |
| 4 | `BellIcon` | Thông báo | `/thong-bao` | Deadline alerts for own projects |

### 3.3 Active Nav Item Style

| Property | Value |
|---|---|
| **Background** | `bg-blue-50` or `#eff6ff` — light blue tint |
| **Border-left** | `4px solid #1a6ec2` — primary blue accent bar |
| **Text color** | `text-blue-700 font-semibold` |
| **Border-radius** | `rounded-lg` |

### 3.4 Inactive Nav Item Style

| Property | Value |
|---|---|
| **Background** | `transparent` |
| **Text color** | `text-slate-500` |
| **Hover** | `hover:bg-blue-50 hover:text-blue-600` |

---

## 4. Page Header Row

### 4.1 Layout

| Property | Value |
|---|---|
| **Display** | `flex items-start justify-between` |
| **Margin bottom** | `~24–28px` before the table card |

### 4.2 Left — Title Block

#### Icon + Title

| Property | Value |
|---|---|
| **Icon** | Flask/beaker `🧪` SVG — `w-7 h-7 text-blue-600` |
| **Title text** | `"Đề tài của tôi"` |
| **Title font size** | `text-2xl` or `text-3xl` (~28–32px) — confirmed: large and prominent |
| **Title font weight** | `font-bold` (700) |
| **Title color** | `text-blue-700` — primary blue, consistent with admin portal heading style |
| **Layout** | `flex items-center gap-3` |

#### Subtitle

| Property | Value |
|---|---|
| **Text** | `"Đăng ký thuyết minh và quản lý tiến độ đề tài nghiên cứu."` |
| **Font size** | `text-sm` (~14px) |
| **Font weight** | `font-normal` (400) |
| **Color** | `text-slate-500` |
| **Margin top** | `mt-1` below the title |

```tsx
// ✅ Page header left block
<div>
  <div className="flex items-center gap-3">
    <BeakerIcon className="w-7 h-7 text-blue-600" />
    <h1 className="text-2xl font-bold text-blue-700">Đề tài của tôi</h1>
  </div>
  <p className="text-sm text-slate-500 mt-1 ml-10">
    Đăng ký thuyết minh và quản lý tiến độ đề tài nghiên cứu.
  </p>
</div>
```

### 4.3 Right — "Đăng Ký Đề Tài Mới" Button

This is the primary CTA of the entire portal — the most prominent interactive element.

| Property | Confirmed Value |
|---|---|
| **Text** | `"+ Đăng ký đề tài mới"` |
| **Prefix icon** | `+` — bold, slightly larger, part of the button text |
| **Background** | Primary blue `#1a6ec2` — confirmed: main blue, consistent with admin portal primary |
| **Text color** | `text-white` |
| **Font size** | `text-sm` (~14px) |
| **Font weight** | `font-semibold` (600) |
| **Padding** | `px-5 py-3` |
| **Border-radius** | `rounded-xl` (~12px) — confirmed: noticeably rounded |
| **Shadow** | `shadow-md shadow-blue-200` — blue-tinted shadow |
| **Hover** | `hover:bg-blue-700` — slightly darker blue |
| **Transition** | `transition-colors duration-150` |
| **Action** | Navigates to registration form (`/de-tai/dang-ky`) or opens `DataEntry`-style form modal |

```tsx
// ✅ CTA button
<button
  onClick={() => navigate('/de-tai/dang-ky')}
  className="flex items-center gap-2 bg-[#1a6ec2] hover:bg-blue-700 text-white
             text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-blue-200
             transition-colors duration-150"
>
  <PlusIcon className="w-4 h-4" />
  Đăng ký đề tài mới
</button>
```

---

## 5. Table Card — Container

| Property | Confirmed Value |
|---|---|
| **Background** | `bg-white` |
| **Border-radius** | `rounded-2xl` (~16px) — confirmed: generous rounding |
| **Border** | `border border-slate-200` — subtle outline visible |
| **Shadow** | `shadow-sm` — very subtle |
| **Padding** | `p-6` (24px) |

---

## 6. Table Card — Header Row

### 6.1 Layout

`flex items-start justify-between` — title+count on left, search on right.

### 6.2 Left — Title + Count

| Element | Style |
|---|---|
| **"Danh sách đề tài"** | `text-base font-bold text-slate-800` — confirmed: medium-bold, not heavy |
| **"1 đề tài"** | `text-sm text-slate-400` — muted count below title, `mt-0.5` |

```tsx
<div>
  <h2 className="text-base font-bold text-slate-800">Danh sách đề tài</h2>
  <p className="text-sm text-slate-400 mt-0.5">{totalCount} đề tài</p>
</div>
```

### 6.3 Right — Search Input

| Property | Confirmed Value |
|---|---|
| **Placeholder** | `"Tìm mã số, tên đề tài, cấp..."` |
| **Icon** | `🔍` magnifying glass, left-inside, `text-slate-400` |
| **Width** | `~280px` (`w-72`) |
| **Background** | `bg-white` or very light gray |
| **Border** | `border border-slate-200 rounded-xl` |
| **Padding** | `pl-9 pr-3 py-2` |
| **Font size** | `text-sm` |
| **Focus** | `focus:outline-none focus:ring-2 focus:ring-blue-400` |

```tsx
<div className="relative">
  <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
  <input
    type="text"
    placeholder="Tìm mã số, tên đề tài, cấp..."
    className="w-72 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
  />
</div>
```

---

## 7. Status Filter Tabs

A horizontal row of pill/tab filters below the header row. **One active at a time.**

### 7.1 Confirmed Tabs

| # | Label | Count shown | State in screenshot |
|---|---|---|---|
| 1 | **Tất cả** | `1` | **Active** (dark filled pill) |
| 2 | **Bản thảo** | `0` | Inactive |
| 3 | **Chờ phê duyệt** | `0` | Inactive |
| 4 | **Đã phê duyệt** | `1` | Inactive |
| 5 | **Bị từ chối** | `0` | Inactive |

### 7.2 Tab Container

| Property | Value |
|---|---|
| **Layout** | `flex items-center gap-2` |
| **Margin** | `mt-5 mb-4` — between header row and divider |

### 7.3 Active Tab Design — "Tất cả 1"

| Property | Confirmed Value |
|---|---|
| **Background** | `bg-[#1a6ec2]` — primary blue |
| **Text color** | `text-white` |
| **Font size** | `text-sm` |
| **Font weight** | `font-semibold` (600) |
| **Padding** | `px-4 py-1.5` |
| **Border-radius** | `rounded-full` — fully pill-shaped |
| **Count** | Inline after label: `"Tất cả 1"` — count is PART of the label text, not a separate badge |

### 7.4 Inactive Tab Design

| Property | Confirmed Value |
|---|---|
| **Background** | `bg-transparent` |
| **Text color** | `text-slate-500` — muted gray |
| **Font size** | `text-sm` |
| **Font weight** | `font-normal` (400) |
| **Padding** | `px-3 py-1.5` |
| **Border-radius** | `rounded-full` |
| **Hover** | `hover:bg-blue-50 hover:text-blue-600` |
| **Count** | Inline: `"Bản thảo 0"` — gray count after label |

```tsx
// ✅ Status filter tabs
const STATUS_TABS = [
  { id: 'all',      label: 'Tất cả',        statusValue: null },
  { id: 'draft',    label: 'Bản thảo',      statusValue: 'DRAFT' },
  { id: 'pending',  label: 'Chờ phê duyệt', statusValue: 'PENDING' },
  { id: 'approved', label: 'Đã phê duyệt',  statusValue: 'APPROVED' },
  { id: 'rejected', label: 'Bị từ chối',    statusValue: 'REJECTED' },
];

{STATUS_TABS.map(tab => {
  const count = getCountForStatus(tab.statusValue, projects);
  const isActive = activeStatus === tab.id;
  return (
    <button
      key={tab.id}
      onClick={() => setActiveStatus(tab.id)}
      className={`text-sm px-4 py-1.5 rounded-full transition-colors duration-150
        ${isActive
          ? 'bg-[#1a6ec2] text-white font-semibold'
          : 'text-slate-500 font-normal hover:bg-blue-50 hover:text-blue-600'
        }`}
    >
      {tab.label} {count}
    </button>
  );
})}
```

---

## 8. Table Divider

Between the filter tabs and the column headers:

```
border-t border-slate-200
```

Thin horizontal rule, full-width inside the card, `mt-2 mb-0`.

---

## 9. Table Column Headers

### 9.1 Header Row

| Property | Value |
|---|---|
| **Display** | `grid` with defined column widths (see §9.2) |
| **Padding** | `px-0 py-3` |
| **Border-bottom** | `border-b border-slate-100` |
| **Background** | `bg-white` (same as card — no separate header bg) |

### 9.2 Column Definitions — Confirmed from Screenshot

| # | Column label | Confirmed | Width | Alignment |
|---|---|---|---|---|
| 1 | `Mã số` | ✅ | `w-24` (~96px) | Left |
| 2 | `Tên đề tài` | ✅ | Fluid (fills remaining) | Left |
| 3 | `Cấp` | ✅ | `w-28` (~112px) | Left |
| 4 | `Thời gian` | ✅ | `w-28` (~112px) | Left |
| 5 | `Trạng thái` | ✅ | `w-36` (~144px) | Left |
| 6 | `Thao tác` | ✅ | `w-24` (~96px) | Left / Center |

### 9.3 Column Header Style

| Property | Value |
|---|---|
| **Font size** | `text-sm` (~14px) |
| **Font weight** | `font-normal` (400) — confirmed: NOT bold, intentionally lightweight |
| **Color** | `text-slate-500` — muted gray |
| **Letter spacing** | Normal (no `tracking-wider`) |

```tsx
// ✅ Grid template for 6 columns
<div className="grid gap-4 py-3 text-sm text-slate-500"
     style={{ gridTemplateColumns: '96px 1fr 112px 112px 144px 96px' }}>
  <span>Mã số</span>
  <span>Tên đề tài</span>
  <span>Cấp</span>
  <span>Thời gian</span>
  <span>Trạng thái</span>
  <span>Thao tác</span>
</div>
```

---

## 10. Table Data Rows

### 10.1 Row Container

| Property | Value |
|---|---|
| **Layout** | Same grid as header — `gridTemplateColumns: '96px 1fr 112px 112px 144px 96px'` |
| **Padding** | `py-4` — comfortable vertical spacing |
| **Border-bottom** | `border-b border-slate-100` |
| **Background** | `bg-white` |
| **Hover** | `hover:bg-blue-50/50` — subtle blue tint on hover |
| **Vertical align** | `items-center` — all cells vertically centered |

### 10.2 Cell 1 — Mã Số

| Property | Confirmed Value |
|---|---|
| **Value shown** | `"—"` (em-dash) — project has no code assigned yet |
| **Font** | `text-sm text-slate-400` — muted, since it's empty/pending |
| **Note** | When a code IS assigned, render in `font-mono font-semibold text-slate-700` |

### 10.3 Cell 2 — Tên Đề Tài

| Property | Confirmed Value |
|---|---|
| **Icon** | `📄` Document icon — `w-4 h-4 text-slate-500`, inline left of title text |
| **Text** | `"Ứng dụng AI trong nghiên cứu khoa học và"` — truncated with `...` (title is long) |
| **Font size** | `text-sm` |
| **Font weight** | `font-normal` (400) — confirmed: not bold |
| **Color** | `text-slate-700` |
| **Overflow** | `truncate` — single line, ellipsis |
| **Layout** | `flex items-center gap-2` |
| **Cursor** | `cursor-pointer` — implied (clickable to open detail) |
| **Hover color** | `hover:text-blue-700` |

```tsx
<div className="flex items-center gap-2 truncate">
  <DocumentTextIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
  <span className="text-sm text-slate-700 truncate">{project.title}</span>
</div>
```

### 10.4 Cell 3 — Cấp

| Property | Confirmed Value |
|---|---|
| **Value** | `"cấp cơ sở"` — confirmed |
| **Font size** | `text-sm` |
| **Color** | `text-slate-600` |
| **Font weight** | `font-normal` |
| **Casing** | Sentence case (not uppercase) |

### 10.5 Cell 4 — Thời Gian

| Property | Confirmed Value |
|---|---|
| **Value** | `"24 tháng"` — duration in months |
| **Font size** | `text-sm` |
| **Color** | `text-slate-600` |

### 10.6 Cell 5 — Trạng Thái

| Property | Confirmed Value |
|---|---|
| **Value shown** | `"Đã phê duyệt"` — green pill badge |
| **Background** | Light green — `bg-emerald-50` or `#ecfdf5` |
| **Text color** | `text-emerald-600` or `text-emerald-700` — confirmed: green text |
| **Border** | `border border-emerald-200` — subtle green outline |
| **Border-radius** | `rounded-full` — pill shape |
| **Padding** | `px-3 py-1` |
| **Font size** | `text-xs` (~12px) |
| **Font weight** | `font-medium` (500) |

#### All status badge variants:

| Status | Background | Text | Border |
|---|---|---|---|
| `Bản thảo` | `bg-slate-100` | `text-slate-600` | `border-slate-200` |
| `Chờ phê duyệt` | `bg-amber-50` | `text-amber-600` | `border-amber-200` |
| `Đã phê duyệt` | `bg-emerald-50` | `text-emerald-600` | `border-emerald-200` |
| `Bị từ chối` | `bg-red-50` | `text-red-600` | `border-red-200` |

```tsx
const STATUS_BADGE_CONFIG = {
  DRAFT:    { label: 'Bản thảo',       bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-200'  },
  PENDING:  { label: 'Chờ phê duyệt',  bg: 'bg-amber-50',   text: 'text-amber-600',  border: 'border-amber-200'  },
  APPROVED: { label: 'Đã phê duyệt',   bg: 'bg-emerald-50', text: 'text-emerald-600',border: 'border-emerald-200'},
  REJECTED: { label: 'Bị từ chối',     bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200'    },
};

function StatusBadge({ status }: { status: keyof typeof STATUS_BADGE_CONFIG }) {
  const cfg = STATUS_BADGE_CONFIG[status];
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}
```

### 10.7 Cell 6 — Thao Tác

| Property | Confirmed Value |
|---|---|
| **Content** | `"Mở"` text + `↗` external-link/open icon |
| **Layout** | `flex items-center gap-1` |
| **"Mở" text** | `text-sm font-semibold text-blue-600` |
| **Icon** | `ArrowTopRightOnSquareIcon` — `w-4 h-4 text-slate-600` |
| **Cursor** | `cursor-pointer` |
| **Hover** | `hover:text-blue-700` |
| **Action** | Opens project detail view (see §11) |

```tsx
<button
  onClick={() => onOpenProject(project)}
  className="flex items-center gap-1 text-sm font-semibold text-blue-600
             hover:text-blue-800 transition-colors"
>
  Mở
  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
</button>
```

---

## 11. Row Click Behavior — Open Project Detail

Clicking "Mở ↗" in the Thao tác column opens the project detail. For the submitter portal, this is a **read-mostly view** of their own project — they can see all the information but editing is restricted to draft/revision states only.

```
Navigates to: /de-tai/{projectId}
```

The detail page for the submitter role reuses the `ProjectDetail-CRM-concrete-spec.md` layout but with **restricted actions**:
- **No delete button** — submitters cannot delete their own projects once submitted
- **No "Chỉnh sửa thông tin"** button if status is `APPROVED` or `PENDING`
- **Edit only allowed** when status is `DRAFT` or `REJECTED`
- **Workflow step changes disabled** — only admins can advance workflow

---

## 12. Empty State

When the submitter has no projects yet (new account):

```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <BeakerIcon className="w-16 h-16 text-slate-200 mb-4" />
  <p className="text-base font-semibold text-slate-600">Chưa có đề tài nào</p>
  <p className="text-sm text-slate-400 mt-1">
    Hãy đăng ký đề tài đầu tiên của bạn.
  </p>
  <button
    onClick={() => navigate('/de-tai/dang-ky')}
    className="mt-6 flex items-center gap-2 bg-[#1a6ec2] text-white text-sm font-semibold
               px-5 py-3 rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors"
  >
    <PlusIcon className="w-4 h-4" />
    Đăng ký đề tài mới
  </button>
</div>
```

---

## 13. State Management

All state is local — no global store needed for the list page.

| State variable | Type | Default | Purpose |
|---|---|---|---|
| `activeStatus` | `'all' \| 'draft' \| 'pending' \| 'approved' \| 'rejected'` | `'all'` | Active filter tab |
| `searchTerm` | `string` | `''` | Global title/code search |
| `projects` | `SubmitterProject[]` | `[]` | Fetched on mount for current user |
| `isLoading` | `boolean` | `true` | Loading skeleton state |

### Filtered list computation:

```typescript
const filteredProjects = useMemo(() => {
  return projects
    // Filter by status tab
    .filter(p => {
      if (activeStatus === 'all') return true;
      const statusMap = {
        draft: 'DRAFT', pending: 'PENDING',
        approved: 'APPROVED', rejected: 'REJECTED',
      };
      return p.status === statusMap[activeStatus];
    })
    // Filter by search term
    .filter(p => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.title?.toLowerCase().includes(term) ||
        p.projectCode?.toLowerCase().includes(term) ||
        p.level?.toLowerCase().includes(term)
      );
    });
}, [projects, activeStatus, searchTerm]);

// Count per status for tab labels
const getCountForStatus = (statusValue: string | null) => {
  if (!statusValue) return projects.length;
  return projects.filter(p => p.status === statusValue).length;
};
```

---

## 14. Data Type — SubmitterProject

A narrower type than `ResearchProject` (ISP compliance) — only the fields the submitter list page needs:

```typescript
// src/types/submitter.ts
export interface SubmitterProject {
  id: string;
  title: string;
  projectCode?: string;          // "—" if not yet assigned
  level: string;                 // "cấp cơ sở" | "cấp trường" | etc.
  durationMonths: number;        // shown as "24 tháng"
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;             // ISO date string
  submittedBy: string;           // current user's ID
}
```

---

## 15. Color Palette — Confirmed From Screenshot

This page uses the **main blue palette** consistent with the admin portal:

| Role | Hex | Tailwind | Usage |
|---|---|---|---|
| Page canvas | `#c9ddf0` or `#f0f6fb` | `bg-blue-50` or light blue-gray | Page background |
| Card background | `#ffffff` | `bg-white` | Table card, header row |
| Card border | `#e5e7eb` | `border-slate-200` | Card outline |
| Page title | `#1a6ec2` | `text-blue-700` | "Đề tài của tôi" |
| Subtitle | `#64748b` | `text-slate-500` | "Đăng ký thuyết minh..." |
| Table header text | `#64748b` | `text-slate-500` | Column headers |
| Row text | `#374151` | `text-slate-700` | Project title |
| Muted text | `#9ca3af` | `text-slate-400` | Count, empty mã số |
| CTA button bg | `#1a6ec2` | `bg-[#1a6ec2]` | "Đăng ký đề tài mới" |
| CTA button text | `#ffffff` | `text-white` | Button label |
| Active tab bg | `#1a6ec2` | `bg-[#1a6ec2]` | "Tất cả" active pill |
| Active tab text | `#ffffff` | `text-white` | Active tab label |
| Status: approved bg | `#ecfdf5` | `bg-emerald-50` | "Đã phê duyệt" badge |
| Status: approved text | `#059669` | `text-emerald-600` | "Đã phê duyệt" badge |
| Row divider | `#f1f5f9` | `border-slate-100` | Hairline between rows |
| Search icon | `#9ca3af` | `text-slate-400` | Magnifying glass |

---

## 16. Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| Page title "Đề tài của tôi" | `text-2xl` 28px | `font-bold` 700 | `text-blue-700` |
| Page subtitle | `text-sm` 14px | `font-normal` 400 | `text-slate-500` |
| CTA button | `text-sm` 14px | `font-semibold` 600 | `text-white` |
| Card title "Danh sách đề tài" | `text-base` 16px | `font-bold` 700 | `text-slate-800` |
| Count "1 đề tài" | `text-sm` 14px | `font-normal` 400 | `text-slate-400` |
| Active tab | `text-sm` 14px | `font-semibold` 600 | `text-white` |
| Inactive tab | `text-sm` 14px | `font-normal` 400 | `text-slate-500` |
| Column headers | `text-sm` 14px | `font-normal` 400 | `text-slate-500` |
| Project title | `text-sm` 14px | `font-normal` 400 | `text-slate-700` |
| Cấp / Thời gian values | `text-sm` 14px | `font-normal` 400 | `text-slate-600` |
| Status badge | `text-xs` 12px | `font-medium` 500 | Per status color |
| Thao tác "Mở" | `text-sm` 14px | `font-semibold` 600 | `text-blue-600` |

**Font family:** `"Inter"`, `"Be Vietnam Pro"`, or system-ui — Vietnamese diacritic support required. Use the same font as the admin portal for visual consistency across both systems.

---

## 17. Spacing & Sizing

| Element | Value |
|---|---|
| Page content padding | `px-8 py-8` |
| Page header margin-bottom | `mb-6` |
| Card padding | `p-6` |
| Tab row margin | `mt-5 mb-3` |
| Table row padding | `py-4` |
| Between tab buttons | `gap-2` |
| Between header icon and title | `gap-3` |
| Search input width | `w-72` (288px) |
| CTA button padding | `px-5 py-3` |
| Status badge padding | `px-3 py-1` |
| Column grid gap | `gap-4` |

---

## 18. Component Tree

```
<SubmitterPortal>             {/* separate Vite app, port 5175 */}
  ├── <AppRouter>
  │     ├── /login            → <LoginPage> (shared design system)
  │     ├── /de-tai           → <MyProjectsPage>    ← this spec
  │     ├── /de-tai/dang-ky   → <RegisterProjectPage>
  │     ├── /de-tai/:id       → <ProjectDetailPage> (read-mostly)
  │     └── /thong-bao        → <NotificationsPage>
  │
  └── <Layout>               {/* wraps all authenticated pages */}
        ├── <Sidebar>
        └── <MainContent>
              └── {children}  ← route renders here

<MyProjectsPage>
  ├── <PageHeader>
  │     ├── Left: icon + title + subtitle
  │     └── Right: <CTA button "Đăng ký đề tài mới">
  │
  └── <ProjectListCard>
        ├── <CardHeader>
        │     ├── Left: "Danh sách đề tài" + count
        │     └── Right: <SearchInput>
        ├── <StatusFilterTabs activeStatus onChange />
        ├── <Divider />
        ├── <TableHeader />   (column names)
        └── {filteredProjects.length === 0
              ? <EmptyState />
              : filteredProjects.map(p => <ProjectRow key={p.id} project={p} />)
            }
```

---

## 19. Key Implementation Notes

1. **Separate Vite project** — Do not add submitter routes to the admin portal's router. Create `apps/submitter/` (or `fe-submitter/`) as a separate `vite.config.ts` instance pointing to the same backend.

2. **JWT role enforcement** — On login, the backend returns `role: 'submitter'`. The submitter portal checks this on every protected route. If role is `admin`, redirect to the admin portal. If not authenticated, redirect to login.

3. **Data scope** — All API calls from the submitter portal include the user's JWT. The backend enforces: `WHERE submittedBy = currentUser.id` — a submitter can never see other users' projects.

4. **"Mã số" shown as `"—"` for pending projects** — The mã số (project code) is only assigned by admin after approval. Until then, render an em-dash `—` in `text-slate-400`, not an empty cell.

5. **"Thời gian" unit** — Always rendered as `"{N} tháng"` (months), not as a date range. This is derived from `project.durationMonths` or calculated from `startDate` to `endDate`.

6. **Tab count updates reactively** — The count in each tab (`Tất cả 1`, `Đã phê duyệt 1`, etc.) must re-derive from the fetched `projects` array, not from separate API calls. Use `useMemo` to count per status.

7. **Search does NOT filter tab counts** — Searching "AI" narrows the visible rows but the tab counts still reflect the full dataset. If your UX wants search to also affect counts, that is a separate decision — document it explicitly.

8. **"Đã phê duyệt 1" tab click** — Sets `activeStatus = 'approved'` and shows only the 1 approved project. The search input still works on top of this filter.

9. **Blue palette shared with admin** — The page canvas uses the same blue-tinted background  /  as the main admin portal, creating visual consistency for users who switch between portals.

10. **CTA button color** — The "Đăng ký đề tài mới" button uses the primary blue  (), consistent with the main system's blue identity established in . The active filter tab also uses this same blue.
