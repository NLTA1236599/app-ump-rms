# "Lọc Trùng Đề Tài" — New Tab & Page Full Specification
**Feature:** Dedicated tab for detecting and reviewing research project titles that repeat across academic years
**Location:** Nav bar Tab + Sidebar menu item in the UMP-RMS portal
**Depends on:** `duplicate-title-filter-guide.md` (core detection logic)

---

## 1. Where This Tab Lives — System Integration

### 1.1 Nav Bar — Add Tab 9

Add a 9th tab to the navigation bar (currently has 8 tabs per `BHXH-header-analysis.md`):

| # | Label | State |
|---|---|---|
| 1 | Đề tài KHCN | Inactive |
| 2 | Sáng kiến | Inactive |
| 3 | Hồ sơ Y đức | Inactive |
| 4 | Bài báo quốc tế | Inactive |
| 5 | Giờ NCKH | Inactive |
| 6 | Hội nghị - Hội thảo | Inactive |
| 7 | Thống kê số liệu | Inactive |
| 8 | Chuyển giao công nghệ | Inactive |
| **9** | **Lọc Trùng Đề Tài** | **New tab** |

> **Alternative placement:** Rather than a top-level nav tab, this feature can live as a **sidebar menu item** under "Đề tài KHCN" (Tab 1). See Section 1.2 for both options.

### 1.2 Option A — Top-Level Nav Tab (Standalone Page)

Add to `TABS` config:

```tsx
// src/config/navTabs.ts
{ id: 'loc-trung-de-tai', label: 'Lọc Trùng Đề Tài' }
```

Tab styling when active:
```tsx
// Active: bg-white text-[#005b8e] font-semibold rounded-t-md
// Inactive: text-white/90 hover:bg-white/10
```

### 1.3 Option B — Sidebar Menu Item Under "Đề tài KHCN" (Recommended)

Add as the **6th item** in the "Đề tài KHCN" sidebar menu config:

```typescript
// src/config/sidebarMenus.ts — update TAB_SIDEBARS for 'de-tai-khcn'
{
  id: 'loc-trung-de-tai',
  label: 'Lọc Trùng Đề Tài',
  icon: 'DocumentDuplicateIcon',
  href: '/de-tai-khcn/loc-trung',
}
```

**Updated sidebar menu list for "Đề tài KHCN":**

| # | Label | State | Icon |
|---|---|---|---|
| 1 | Tổng quan | Active | LayoutDashboard |
| 2 | Tiến độ thực hiện | Inactive | ChartBar |
| 3 | Dữ liệu đề tài | Inactive | Folder |
| 4 | Nhập mới dữ liệu | Inactive | PlusCircle |
| 5 | Kê khai hồ sơ | Inactive | DocumentText |
| **6** | **Lọc Trùng Đề Tài** | **New** | **DocumentDuplicate** |

**Icon badge on sidebar item** — show count of duplicate groups:

```tsx
<div className="flex items-center justify-between w-full">
  <span className="text-sm font-medium truncate">Lọc Trùng Đề Tài</span>
  {duplicateGroupCount > 0 && (
    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-black
                     bg-violet-100 text-violet-700 flex-shrink-0">
      {duplicateGroupCount}
    </span>
  )}
</div>
```

---

## 2. Page Layout & Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│  BREADCRUMB                                                            │
│  Trang chủ > Đề tài KHCN > Lọc Trùng Đề Tài                         │
├────────────────────────────────────────────────────────────────────────┤
│  PAGE TITLE BAR (gray strip)                                           │
│  "Lọc Trùng Đề Tài"                                                   │
├────────────────────────────────────────────────────────────────────────┤
│  SUMMARY STATS STRIP                                                   │
│  [N nhóm trùng] [M đề tài bị trùng] [P năm có trùng]                 │
├────────────────────────────────────────────────────────────────────────┤
│  TOOLBAR                                                               │
│  [Year range filter] [Strict/fuzzy toggle] [XUẤT EXCEL] [RESET]       │
├────────────────────────────────────────────────────────────────────────┤
│  DUPLICATE GROUPS LIST                                                 │
│  ┌─ Group 1: "Nghiên cứu về X..." ──────────────────────────────────┐ │
│  │  Appears in: 2022, 2024                                           │ │
│  │  ┌── Project row (2022) ────────────────────────────────────┐    │ │
│  │  └── Project row (2024) ────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌─ Group 2: "Đánh giá hiệu quả..." ─────────────────────────────────┐ │
│  │  ...                                                              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Breadcrumb

| Item | Style | Behavior |
|---|---|---|
| `"Trang chủ"` | `text-slate-500 hover:text-blue-600` | Navigate to `/` |
| `">"` | `text-slate-400 mx-1` | Non-interactive |
| `"Đề tài KHCN"` | `text-slate-500 hover:text-blue-600` | Navigate to `/de-tai-khcn` |
| `">"` | `text-slate-400 mx-1` | Non-interactive |
| `"Lọc Trùng Đề Tài"` | `text-blue-600 font-medium cursor-default` | Active, non-clickable |

```tsx
const BREADCRUMBS: BreadcrumbItem[] = [
  { label: 'Trang chủ',         href: '/' },
  { label: 'Đề tài KHCN',       href: '/de-tai-khcn' },
  { label: 'Lọc Trùng Đề Tài' },
];
```

---

## 4. Page Title Bar

| Property | Value |
|---|---|
| **Background** | `bg-gray-100` |
| **Text** | `"Lọc Trùng Đề Tài"` |
| **Font size** | `text-sm` |
| **Font weight** | `font-normal` (400) |
| **Color** | `text-slate-700` |
| **Padding** | `px-4 py-3` |
| **Width** | `w-full` |

---

## 5. Summary Stats Strip

Three stat cards in a horizontal row, auto-computed from the duplicate detection result.

### 5.1 Container

```
flex items-center gap-4 px-4 py-4
```

### 5.2 Stat Card Design

| Property | Value |
|---|---|
| **Background** | `bg-white` |
| **Border** | `border border-slate-200` |
| **Border-radius** | `rounded-xl` |
| **Padding** | `px-5 py-4` |
| **Shadow** | `shadow-sm` |
| **Display** | `flex flex-col` |

#### Stat Card 1 — Số nhóm trùng

| Property | Value |
|---|---|
| **Label** | `"Số nhóm trùng"` |
| **Value** | Count of unique normalized titles with `≥ 2` years |
| **Value color** | `text-violet-600` |
| **Icon bg** | `bg-violet-100` |
| **Icon** | `DocumentDuplicateIcon` — `text-violet-600` |

#### Stat Card 2 — Đề tài bị trùng

| Property | Value |
|---|---|
| **Label** | `"Đề tài bị trùng"` |
| **Value** | Total count of projects that belong to any duplicate group |
| **Value color** | `text-amber-600` |
| **Icon bg** | `bg-amber-100` |
| **Icon** | `DocumentTextIcon` — `text-amber-600` |

#### Stat Card 3 — Năm có trùng

| Property | Value |
|---|---|
| **Label** | `"Năm có trùng"` |
| **Value** | Count of distinct years that contain at least one duplicated project |
| **Value color** | `text-blue-600` |
| **Icon bg** | `bg-blue-100` |
| **Icon** | `CalendarIcon` — `text-blue-600` |

```tsx
// ✅ Canonical stat card
function StatCard({
  label, value, iconBg, iconColor, Icon
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm flex items-center gap-4 flex-1">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-2xl font-black ${iconColor}`}>{value}</p>
      </div>
    </div>
  );
}
```

---

## 6. Toolbar

### 6.1 Container

| Property | Value |
|---|---|
| **Background** | `bg-white` |
| **Border** | `border border-slate-200` |
| **Border-radius** | `rounded-xl` |
| **Shadow** | `shadow-sm` |
| **Padding** | `px-4 py-3` |
| **Display** | `flex items-center gap-3 flex-wrap` |

### 6.2 Year Range Filter (Two dropdowns)

**Label:** `"Lọc năm:"` — `text-sm font-medium text-slate-700 flex-shrink-0`

**"Từ năm" dropdown:**

| Property | Value |
|---|---|
| **Type** | `<select>` |
| **Placeholder** | `"Từ năm..."` |
| **Options** | Distinct years extracted from all projects, sorted ascending |
| **Border** | `border-b border-slate-400 bg-transparent` (underline style) |
| **Width** | `w-28` |
| **Binding** | `value={yearFrom}` / `onChange={e => setYearFrom(Number(e.target.value))}` |

**"Đến năm" dropdown:**

| Property | Value |
|---|---|
| **Type** | `<select>` |
| **Placeholder** | `"Đến năm..."` |
| **Options** | Same list, filtered to only show years `≥ yearFrom` |
| **Border** | Same underline style |
| **Width** | `w-28` |
| **Binding** | `value={yearTo}` / `onChange={e => setYearTo(Number(e.target.value))}` |

```tsx
// ✅ Derives available years from data — OCP compliant
const availableYears = useMemo(() => {
  const years = new Set<number>();
  projects.forEach(p => {
    const y = extractYear(p.startDate) ?? extractYear(p.acceptanceYear);
    if (y) years.add(y);
  });
  return [...years].sort((a, b) => a - b);
}, [projects]);
```

### 6.3 Match Mode Toggle

Two mutually exclusive options controlling how title similarity is assessed:

| Mode | Label | Behavior |
|---|---|---|
| `strict` | `"Khớp chính xác"` | Exact match after `normalizeTitle()` (default) |
| `fuzzy` | `"Khớp tương đối"` | Matches titles sharing `≥ 80%` of words (for minor wording variations) |

**Design:** Segmented control — same pattern as the Kanban/Lịch toggle in ProgressTracking:

```tsx
<div className="bg-slate-100 rounded-lg p-0.5 flex text-xs">
  <button
    onClick={() => setMatchMode('strict')}
    className={matchMode === 'strict'
      ? 'bg-white text-slate-800 font-semibold shadow-sm rounded-md px-3 py-1.5'
      : 'text-slate-500 px-3 py-1.5 hover:text-slate-700'}
  >
    Khớp chính xác
  </button>
  <button
    onClick={() => setMatchMode('fuzzy')}
    className={matchMode === 'fuzzy'
      ? 'bg-white text-slate-800 font-semibold shadow-sm rounded-md px-3 py-1.5'
      : 'text-slate-500 px-3 py-1.5 hover:text-slate-700'}
  >
    Khớp tương đối
  </button>
</div>
```

### 6.4 "XUẤT EXCEL" Button

| Property | Value |
|---|---|
| **Text** | `"XUẤT EXCEL"` |
| **Background** | `bg-emerald-600 hover:bg-emerald-700` |
| **Text color** | `text-white` |
| **Font** | `text-xs font-black uppercase tracking-widest` |
| **Padding** | `px-3 py-2` |
| **Border-radius** | `rounded-lg` |
| **Shadow** | `shadow-md shadow-emerald-200` |
| **Action** | Exports the current duplicate groups view as `.xlsx` |

### 6.5 "RESET" Button

| Property | Value |
|---|---|
| **Text** | `"RESET"` |
| **Background** | `bg-red-50 hover:bg-red-100` |
| **Text color** | `text-red-600` |
| **Border** | `border border-red-200` |
| **Font** | `text-xs font-black uppercase tracking-widest` |
| **Action** | Resets `yearFrom`, `yearTo`, `matchMode` to defaults |

---

## 7. Duplicate Groups List

The main content area — a vertical stack of collapsible group cards.

### 7.1 List Container

```
space-y-4 pb-8
```

### 7.2 Empty State

When no duplicates found:

```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <CheckCircleIcon className="w-16 h-16 text-emerald-400 mb-4" />
  <p className="text-lg font-bold text-slate-700">Không tìm thấy đề tài trùng tiêu đề</p>
  <p className="text-sm text-slate-400 mt-1">
    Tất cả tiêu đề đề tài trong khoảng thời gian đã chọn là duy nhất.
  </p>
</div>
```

### 7.3 Group Card Container

Each duplicate group is one card:

| Property | Value |
|---|---|
| **Background** | `bg-white` |
| **Border** | `border border-violet-200` — violet tint to distinguish from normal cards |
| **Border-radius** | `rounded-2xl` |
| **Shadow** | `shadow-sm` |
| **Overflow** | `overflow-hidden` |
| **Transition** | `transition-all duration-200` |

### 7.4 Group Card Header (Clickable — toggles collapse)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [📄 icon]  "Nghiên cứu về tác động của..."   [2022] [2024]  [▾/▸] │
│             Xuất hiện: 2 lần trong 2 năm                             │
└──────────────────────────────────────────────────────────────────────┘
```

| Element | Style |
|---|---|
| **Container** | `flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-violet-50/30` |
| **Left icon** | `DocumentDuplicateIcon`, `w-5 h-5 text-violet-500 flex-shrink-0` |
| **Title text** | `text-sm font-semibold text-slate-800 flex-1 mx-3 line-clamp-2` |
| **Year badges** | Pill badges per year — `bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full` |
| **Count text** | `text-xs text-slate-400` — e.g., `"Xuất hiện: 2 lần trong 2 năm"` |
| **Chevron** | `ChevronDownIcon`/`ChevronRightIcon`, `w-4 h-4 text-slate-400` |
| **Left accent bar** | `border-l-4 border-violet-400` on the card container |

```tsx
// ✅ Year badge generation
{group.years.sort().map(year => (
  <span key={year}
    className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
    {year}
  </span>
))}
```

### 7.5 Group Card Body (Collapsible)

When expanded, shows a table of all projects in this duplicate group:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Sub-table (inside group card)                                       │
│  ┌──────┬──────────────┬──────────────┬────────────┬─────────────┐  │
│  │ Năm  │ Chủ nhiệm    │ Khoa/Đơn vị  │ Tình trạng │ Hành động   │  │
│  ├──────┼──────────────┼──────────────┼────────────┼─────────────┤  │
│  │ 2022 │ Nguyễn Văn A │ Khoa Y       │ Hoàn thành │ [👁] [✎]   │  │
│  │ 2024 │ Nguyễn Văn A │ Khoa Y       │ Đang TH    │ [👁] [✎]   │  │
│  └──────┴──────────────┴──────────────┴────────────┴─────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

#### Sub-table Header

| Property | Value |
|---|---|
| **Background** | `bg-violet-50/50` |
| **Font** | `text-[10px] font-black uppercase tracking-widest text-slate-500` |
| **Padding** | `px-4 py-2` |

#### Sub-table Columns

| Column | Width | Content |
|---|---|---|
| Năm | `w-16` | Year extracted from `startDate` — `font-black text-blue-600` |
| Số HĐ | `w-32` | `project.contractId` — `font-mono text-xs` |
| Chủ nhiệm | `w-40` | `project.leadAuthor` — `text-sm` |
| Khoa/Đơn vị | `w-36` | `project.department` — `text-xs text-slate-500` |
| Tình trạng | `w-32` | Status badge (reuse `getStatusBadge`) |
| Hành động | `w-24` | View + Edit icon buttons |

#### Sub-table Row

| Property | Value |
|---|---|
| **Border-bottom** | `border-b border-slate-100` |
| **Hover** | `hover:bg-violet-50/30` |
| **Transition** | `transition-colors` |

**Row highlight — "Năm mới nhất" (most recent occurrence):**

The row with the highest year gets a subtle right border:

```tsx
const isNewest = year === Math.max(...group.years);
<tr className={isNewest ? 'border-r-2 border-r-violet-400' : ''}>
```

#### Action Buttons in Sub-table

| Button | Icon | Action |
|---|---|---|
| View | `EyeIcon` | `onView(project)` — opens ProjectDetail |
| Edit | `PencilIcon` | `onEdit(project)` — opens DataEntry form |

Same styling as DataTable action buttons:
- View: `w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100`
- Edit: `w-7 h-7 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100`

---

## 8. State Management

```typescript
// All local state — no global store needed
const [yearFrom,   setYearFrom]   = useState<number | null>(null); // null = no filter
const [yearTo,     setYearTo]     = useState<number | null>(null);
const [matchMode,  setMatchMode]  = useState<'strict' | 'fuzzy'>('strict');
const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
```

| Variable | Type | Default | Purpose |
|---|---|---|---|
| `yearFrom` | `number \| null` | `null` | Lower bound of year range filter |
| `yearTo` | `number \| null` | `null` | Upper bound of year range filter |
| `matchMode` | `'strict' \| 'fuzzy'` | `'strict'` | Controls title comparison strictness |
| `expandedGroups` | `Set<string>` | `new Set()` | Which group cards are expanded (by normalized title key) |

---

## 9. Core Data Computation

### 9.1 Filtered projects (by year range)

```typescript
const yearFilteredProjects = useMemo(() => {
  return projects.filter(p => {
    const year = extractYear(p.startDate) ?? extractYear(p.acceptanceYear);
    if (year === null) return true; // include undated projects
    if (yearFrom && year < yearFrom) return false;
    if (yearTo   && year > yearTo)   return false;
    return true;
  });
}, [projects, yearFrom, yearTo]);
```

### 9.2 Duplicate groups (core computation)

```typescript
interface DuplicateGroup {
  normalizedTitle: string;       // key
  representativeTitle: string;   // display title (first occurrence's original text)
  years: number[];               // sorted list of years
  projects: ResearchProject[];   // all projects in this group
}

const duplicateGroups = useMemo((): DuplicateGroup[] => {
  // Map: normalizedTitle → { projects[], years: Set<number> }
  const map = new Map<string, { projects: ResearchProject[]; years: Set<number> }>();

  for (const p of yearFilteredProjects) {
    const key = matchMode === 'fuzzy'
      ? fuzzyNormalizeTitle(p.title)   // word-based fuzzy key
      : normalizeTitle(p.title);

    if (!key) continue;

    const year = extractYear(p.startDate) ?? extractYear(p.acceptanceYear);
    if (year === null) continue;

    if (!map.has(key)) map.set(key, { projects: [], years: new Set() });
    const entry = map.get(key)!;
    entry.projects.push(p);
    entry.years.add(year);
  }

  // Keep only cross-year duplicates (2+ distinct years)
  return [...map.entries()]
    .filter(([, v]) => v.years.size >= 2)
    .map(([key, v]) => ({
      normalizedTitle: key,
      representativeTitle: v.projects[0].title ?? key,
      years: [...v.years].sort((a, b) => a - b),
      projects: v.projects.sort((a, b) => {
        const ya = extractYear(a.startDate) ?? 0;
        const yb = extractYear(b.startDate) ?? 0;
        return ya - yb;  // sort oldest to newest within group
      }),
    }))
    .sort((a, b) => b.years.length - a.years.length); // most-repeated first
}, [yearFilteredProjects, matchMode]);
```

### 9.3 Summary stats (derived)

```typescript
const stats = useMemo(() => ({
  groupCount:    duplicateGroups.length,
  projectCount:  duplicateGroups.reduce((sum, g) => sum + g.projects.length, 0),
  yearCount:     new Set(duplicateGroups.flatMap(g => g.years)).size,
}), [duplicateGroups]);
```

### 9.4 Fuzzy match mode (optional)

For "Khớp tương đối" — two titles match if they share ≥ 80% of their words:

```typescript
// src/utils/titleNormalize.ts
export function fuzzyNormalizeTitle(title: string | undefined): string {
  if (!title) return '';
  // Split into words, sort alphabetically, join — order-independent matching
  return normalizeTitle(title)
    .split(' ')
    .filter(w => w.length > 2)  // ignore short words (articles, particles)
    .sort()
    .join('|');
}
```

> **Note:** For production, a Jaccard similarity coefficient approach gives finer control. The sorted-word approach above is simpler and sufficient for most Vietnamese research title patterns.

---

## 10. Expand/Collapse Behavior

```typescript
const toggleGroup = (key: string) => {
  setExpandedGroups(prev => {
    const next = new Set(prev);
    if (next.has(key)) {
      next.delete(key);  // collapse
    } else {
      next.add(key);     // expand
    }
    return next;
  });
};

// Expand All / Collapse All buttons (optional toolbar addition)
const expandAll  = () => setExpandedGroups(new Set(duplicateGroups.map(g => g.normalizedTitle)));
const collapseAll = () => setExpandedGroups(new Set());
```

**Initial state:** All groups collapsed by default. The header row always shows the title + year badges as a summary.

---

## 11. Excel Export for This Page

```typescript
const exportDuplicateGroups = () => {
  const rows: string[][] = [];

  // Header row
  rows.push(['Nhóm', 'Tiêu đề', 'Năm', 'Số HĐ', 'Chủ nhiệm', 'Khoa/Đơn vị', 'Tình trạng']);

  // Data rows — one row per project, grouped
  duplicateGroups.forEach((group, groupIndex) => {
    group.projects.forEach(p => {
      const year = extractYear(p.startDate) ?? extractYear(p.acceptanceYear) ?? '---';
      rows.push([
        String(groupIndex + 1),
        p.title ?? '',
        String(year),
        p.contractId ?? '',
        p.leadAuthor ?? '',
        p.department ?? '',
        p.status ?? '',
      ]);
    });
    // Empty separator row between groups
    rows.push(['', '', '', '', '', '', '']);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 8 }, { wch: 60 }, { wch: 8 }, { wch: 25 },
    { wch: 25 }, { wch: 20 }, { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lọc Trùng Đề Tài');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `LocTrungDeTai_${today}.xlsx`);
};
```

---

## 12. SOLID Compliance

| Principle | Implementation |
|---|---|
| **SRP** | `LocTrungDeTai.tsx` owns only page state + layout. Detection logic lives in `detectDuplicateTitles.ts`. Normalization in `titleNormalize.ts`. Year extraction in `dateFormat.ts` |
| **OCP** | Adding a new match mode (e.g., `semantic`) only requires adding a case to the `matchMode` switch in `getDuplicateGroups` — no component changes |
| **LSP** | All functions accept `ResearchProject[]` — any project subtype works |
| **ISP** | `DuplicateGroup` interface contains only what the page needs — not the full `ResearchProject[]` raw shape |
| **DIP** | Page depends on `getDuplicateGroups(projects, options)` abstraction, not on inline loops |

---

## 13. Component File Structure

```
src/
├── pages/ (or components/)
│   └── LocTrungDeTai/
│       ├── index.tsx                        # Re-export
│       ├── LocTrungDeTai.tsx                # Page orchestrator (state + layout)
│       ├── DuplicateStatsStrip.tsx          # 3 stat cards
│       ├── DuplicateToolbar.tsx             # Year filter + mode toggle + export
│       ├── DuplicateGroupList.tsx           # Scrollable list of groups
│       ├── DuplicateGroupCard.tsx           # Single collapsible group card
│       └── DuplicateProjectRow.tsx          # Row inside expanded group table
│
├── utils/
│   ├── titleNormalize.ts                    # normalizeTitle, fuzzyNormalizeTitle
│   ├── detectDuplicateTitles.ts            # getDuplicateTitleSet, getDuplicateGroups
│   └── dateFormat.ts                        # extractYear (add to existing)
│
└── config/
    └── sidebarMenus.ts                      # Add 'loc-trung-de-tai' to de-tai-khcn menu
```

---

## 14. Color Palette

| Role | Tailwind | Hex | Usage |
|---|---|---|---|
| Page canvas | `bg-slate-50` | `#f8fafc` | Background |
| Title bar | `bg-gray-100` | `#f3f4f6` | Page title strip |
| Panel bg | `bg-white` | `#ffffff` | Cards, toolbar |
| Panel border | `border-slate-200` | `#e2e8f0` | Normal cards |
| Group card border | `border-violet-200` | `#ddd6fe` | Duplicate group accent |
| Group accent bar | `border-l-4 border-violet-400` | `#a78bfa` | Left border on group cards |
| Group hover | `bg-violet-50/30` | — | Row/header hover |
| Sub-table header | `bg-violet-50/50` | — | Column headers inside group |
| Newest row accent | `border-r-2 border-r-violet-400` | `#a78bfa` | Highlights most recent year row |
| Year badge | `bg-blue-100 text-blue-700` | — | Year pills in group header |
| Stat card — groups | `bg-violet-100 text-violet-600` | | Stat 1 icon |
| Stat card — projects | `bg-amber-100 text-amber-600` | | Stat 2 icon |
| Stat card — years | `bg-blue-100 text-blue-600` | | Stat 3 icon |
| Empty state icon | `text-emerald-400` | `#34d399` | CheckCircle |
| View action | `bg-blue-50 text-blue-600` | | View button |
| Edit action | `bg-amber-50 text-amber-600` | | Edit button |
| Export button | `bg-emerald-600 text-white` | `#059669` | XUẤT EXCEL |
| Reset button | `bg-red-50 text-red-600` | | RESET |

---

## 15. Typography

| Element | Size | Weight | Color | Notes |
|---|---|---|---|---|
| Page title | `text-sm` | 400 | `text-slate-700` | In gray strip |
| Stat label | `text-[11px]` | 900 `font-black` | `text-slate-400` | UPPERCASE tracking-widest |
| Stat value | `text-2xl` | 900 `font-black` | Per stat color | |
| Group title | `text-sm` | 600 | `text-slate-800` | `line-clamp-2` |
| Year badge | `text-[10px]` | 900 `font-black` | `text-blue-700` | |
| Sub-header | `text-[10px]` | 900 `font-black` | `text-slate-500` | UPPERCASE |
| Sub-cell year | `text-sm` | 900 `font-black` | `text-blue-600` | |
| Sub-cell data | `text-xs`–`text-sm` | 400–500 | `text-slate-700` | |
| Toolbar label | `text-sm` | 500 | `text-slate-700` | |
| Button text | `text-xs` | 900 `font-black` | Per button | UPPERCASE tracking-widest |
| Count hint | `text-xs` | 400 | `text-slate-400` | "Xuất hiện: N lần..." |

---

## 16. Implementation Checklist

```
□ Create utility files
  □ src/utils/titleNormalize.ts — normalizeTitle, fuzzyNormalizeTitle
  □ src/utils/detectDuplicateTitles.ts — getDuplicateGroups (returns DuplicateGroup[])
  □ Add extractYear() to src/utils/dateFormat.ts

□ Create page components
  □ LocTrungDeTai.tsx — page orchestrator with state
  □ DuplicateStatsStrip.tsx — 3 stat cards
  □ DuplicateToolbar.tsx — year filters + mode toggle + export + reset
  □ DuplicateGroupList.tsx — empty state + list render
  □ DuplicateGroupCard.tsx — collapsible card with header + sub-table
  □ DuplicateProjectRow.tsx — single row in sub-table

□ Register the route/page
  □ Add route '/de-tai-khcn/loc-trung' to router config
  □ Add 'loc-trung-de-tai' menu item to sidebarMenus.ts (de-tai-khcn section)
  □ Add count badge to sidebar menu item
  □ (Optional) Add Tab 9 to nav bar

□ Wire up callbacks
  □ onView(project) → navigates to ProjectDetail
  □ onEdit(project) → navigates to DataEntry form

□ Test cases
  □ No projects → empty state shown
  □ All unique titles → empty state shown
  □ Same title same year → NOT flagged as duplicate
  □ Same title different years → flagged, correct years shown
  □ Year range filter restricts which years are considered
  □ Fuzzy mode groups near-identical titles
  □ Expand/collapse groups works correctly
  □ Export produces correct .xlsx with group separators
  □ RESET clears year filters and match mode
  □ Sidebar badge updates when data changes
```
