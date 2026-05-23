# DataTable (4-DulieuNghienCuu) — Complete UI Rebuild Specification
**Component:** `DataTable` in `components/4-DulieuNghienCuu.tsx`
**Purpose:** Interactive data grid for displaying, filtering, searching, importing, and exporting `ResearchProject` records
**Authority:** Component analysis document (`analysis_4_DulieuNghienCuu.md`) + screenshot of toolbar UI

---

## 1. Component Signature & Props

```typescript
interface DataTableProps {
  projects: ResearchProject[];
  onDelete:          (id: string) => void;
  onEdit:            (project: ResearchProject) => void;
  onView:            (project: ResearchProject) => void;
  onImport?:         (data: any[]) => void;
  onDeleteMultiple?: (ids: string[]) => void;
}
```

**External dependencies:**
- `react` — `useState`, `useMemo`, `useRef`
- `xlsx` — `import * as XLSX from 'xlsx'`
- Local types — `ResearchProject`, `ProjectStatus`, `ProgressStatus`

---

## 2. State Inventory

All state is local — no global store involved.

| State variable | Type | Default | Purpose |
|---|---|---|---|
| `contractIdSearch` | `string` | `''` | Free-text search value for "Số hợp đồng" input in Row 1 |
| `pageSize` | `number` | `50` | Records per page — controlled by "Bản ghi mỗi trang" selector |
| `currentPage` | `number` | `1` | Current page index for pagination |
| `searchTerm` | `string` | `''` | Global text search across key fields |
| `statusFilter` | `ProjectStatus \| 'ALL'` | `'ALL'` | Filter by project status |
| `selectedProject` | `ResearchProject \| null` | `null` | Currently selected project (mostly superseded by callbacks) |
| `fileInputRef` | `useRef<HTMLInputElement>` | — | Hidden file input for Excel import trigger |
| `columnFilters` | `Record<string, string>` | `{}` | Per-column filter text keyed by column ID |
| `activeFilterColumn` | `string \| null` | `null` | Which column has its filter dropdown open |
| `selectedIds` | `Set<string>` | `new Set()` | IDs of rows selected via checkbox for bulk delete |

---

## 3. Full Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  BREADCRUMB                                                         │
│  Trang chủ > Đề tài KHCN > Dữ liệu đề tài                         │
├─────────────────────────────────────────────────────────────────────┤
│  PAGE TITLE BAR (gray bg strip)                                     │
│  "Dữ liệu đề tài"                                                   │
├─────────────────────────────────────────────────────────────────────┤
│  TOOLBAR                                                            │
│  Row 1: Số hợp đồng: [________________] [🔍 Search button]         │
│  Row 2: [NHẬP EXCEL] [XUẤT EXCEL] [RESET] [XÓA ĐÃ CHỌN]          │
│  Row 3: Bản ghi mỗi trang: [50 ▾]                                  │
├─────────────────────────────────────────────────────────────────────┤
│  TABLE SCROLL AREA (max-h: calc(100vh - 200px))                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ THEAD (sticky top-0, z-30)                                   │   │
│  │ [☐] [TT] [Mã HĐ] [Tên ĐT] [...columns...] [Hành động]      │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ TBODY                                                        │   │
│  │ [☐] [1]  [HĐ001] [Tên dài...] [...]         [👁 ✎ 🗑]     │   │
│  │ [☐] [2]  [HĐ002] [Tên...    ] [...]         [👁 ✎ 🗑]     │   │
│  │ ...                                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  PAGINATION (below table)                                           │
│  ◀◀ ◀  [1] [2] ...  ▶ ▶▶                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Breadcrumb — Confirmed from Screenshot

### 4.1 Container

| Property | Value |
|---|---|
| **Display** | `flex items-center gap-1` |
| **Font size** | `text-sm` |
| **Padding** | `py-2` |
| **Margin bottom** | `mb-0` — sits directly above the title bar |

### 4.2 Breadcrumb Items

| Item | Style | Behavior |
|---|---|---|
| `"Trang chủ"` | `text-slate-500 hover:text-blue-600 cursor-pointer` | Navigates to home |
| `">"` separator | `text-slate-400 mx-1` | Non-interactive |
| `"Đề tài KHCN"` | `text-slate-500 hover:text-blue-600 cursor-pointer` | Navigates to Đề tài KHCN section |
| `">"` separator | `text-slate-400 mx-1` | Non-interactive |
| `"Dữ liệu đề tài"` | `text-blue-600 font-medium cursor-default` | **Active / current page** — blue, non-clickable |

```tsx
// ✅ Canonical breadcrumb (ISP-compliant — BreadcrumbItem is its own interface)
interface BreadcrumbItem {
  label: string;
  href?: string;        // undefined = current page (non-clickable)
}

const BREADCRUMBS: BreadcrumbItem[] = [
  { label: 'Trang chủ',    href: '/' },
  { label: 'Đề tài KHCN', href: '/de-tai-khcn' },
  { label: 'Dữ liệu đề tài' },  // no href = active
];
```

---

## 5. Page Title Bar — Confirmed from Screenshot

### 11.1 Design

| Property | Value |
|---|---|
| **Background** | Light gray `#f0f0f0` or `bg-gray-100` — confirmed: distinct from white page bg |
| **Text** | `"Dữ liệu đề tài"` |
| **Font size** | `text-sm` or `text-base` (~14–15px) |
| **Font weight** | `font-normal` (400) — confirmed: not bold |
| **Color** | `text-slate-700` |
| **Padding** | `px-4 py-3` |
| **Width** | Full content width — `w-full` |
| **Margin** | `my-3` — sits between breadcrumb and filter row |
| **Border** | None visible — color difference from page bg provides separation |

```tsx
// ✅ Canonical implementation
<div className="bg-gray-100 px-4 py-3 w-full text-sm text-slate-700 my-3">
  Dữ liệu đề tài
</div>
```

---

## 6. Toolbar — Full Specification (Updated)

The toolbar is restructured into **three rows** based on the screenshot, inside the same `bg-white rounded-xl` card.

### 12.1 Toolbar Container

| Property | Value |
|---|---|
| **Background** | `bg-white` |
| **Border-radius** | `rounded-xl` |
| **Shadow** | `shadow-sm` |
| **Border** | `border border-slate-200` |
| **Display** | `flex flex-col` |
| **Padding** | `px-4 pt-4 pb-3` |
| **Gap** | `gap-3` between rows |
| **Margin bottom** | `mb-4` |

---

### 12.2 Toolbar Row 1 — Số Hợp Đồng Search + Search Button

**Layout:** `flex items-center gap-3`

#### "Số hợp đồng" Label

| Property | Value |
|---|---|
| **Text** | `"Số hợp đồng"` |
| **Font size** | `text-sm` |
| **Font weight** | `font-medium` (500) |
| **Color** | `text-slate-700` |
| **Flex-shrink** | `0` — label never wraps |

#### Contract ID Text Input

The dropdown ("Chọn mã thủ tục") is **removed**. In its place is a plain free-text input field allowing the user to type any contract number for search.

| Property | Value |
|---|---|
| **Type** | `type="text"` — free-text input, no dropdown |
| **Placeholder** | `"Nhập số hợp đồng..."` |
| **Width** | `min-w-[180px]` |
| **Border** | `border-b border-slate-400` — **underline only**, no full border box |
| **Background** | `bg-transparent` |
| **Font size** | `text-sm` |
| **Color** | `text-slate-700` |
| **Padding** | `pb-1` |
| **Binding** | `value={contractIdSearch}` / `onChange={e => setContractIdSearch(e.target.value)}` |
| **Focus** | `focus:outline-none focus:border-blue-500` |
| **On Enter** | `onKeyDown={e => e.key === 'Enter' && handleContractSearch()}` |

```tsx
// ✅ Plain text input — no dropdown, no external data dependency
<input
  type="text"
  value={contractIdSearch}
  onChange={e => setContractIdSearch(e.target.value)}
  onKeyDown={e => e.key === 'Enter' && handleContractSearch()}
  placeholder="Nhập số hợp đồng..."
  className="border-0 border-b border-slate-400 bg-transparent text-sm text-slate-700
             pb-1 focus:outline-none focus:border-blue-500 min-w-[180px]"
/>
```

> **SOLID note (SRP + DIP):** Replacing the dropdown with a free-text input removes the dependency on an external `procedureCodes` prop entirely. The component is now self-contained for this filter — no injected data required. The `ProcedureCodeOption` interface and `procedureCodes` prop are also removed from `DataTableProps`.

#### Search Button (Circle)

| Property | Value |
|---|---|
| **Shape** | Circle — `rounded-full` |
| **Size** | `w-9 h-9` (36×36px) |
| **Background** | `bg-blue-600` |
| **Icon** | Magnifying glass SVG, white, `w-4 h-4`, centered |
| **Hover** | `hover:bg-blue-700` |
| **Shadow** | `shadow-sm` |
| **Transition** | `transition-colors duration-150` |
| **Action** | Calls `handleContractSearch()` — resets to page 1, applies `contractIdSearch` to filter |
| **Aria-label** | `"Tìm kiếm theo số hợp đồng"` |

```tsx
// ✅ Circular search button
<button
  onClick={handleContractSearch}
  className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700
             flex items-center justify-center shadow-sm
             transition-colors duration-150 flex-shrink-0"
  aria-label="Tìm kiếm theo số hợp đồng"
>
  <MagnifyingGlassIcon className="w-4 h-4 text-white" />
</button>
```

---

### 12.3 Toolbar Row 2 — Action Buttons

**Layout:** `flex items-center gap-2 flex-wrap`

Same buttons as previously specified, now placed on their own row:

#### "NHẬP EXCEL" Button

| Property | Value |
|---|---|
| **Text** | `"NHẬP EXCEL"` |
| **Background** | `bg-blue-600` |
| **Text color** | `text-white` |
| **Font** | `text-xs font-black uppercase tracking-widest` |
| **Padding** | `px-3 py-2` |
| **Border-radius** | `rounded-lg` |
| **Shadow** | `shadow-md shadow-blue-200` |
| **Hover** | `hover:bg-blue-700` |
| **Action** | Triggers `fileInputRef.current?.click()` |
| **Icon** | Upload icon left of text, `w-4 h-4` |

#### Hidden File Input

```tsx
<input
  ref={fileInputRef}
  type="file"
  accept=".xlsx,.xls"
  className="hidden"
  onChange={handleFileUpload}
/>
```

#### "XUẤT EXCEL" Button

| Property | Value |
|---|---|
| **Text** | `"XUẤT EXCEL"` |
| **Background** | `bg-emerald-600` |
| **Text color** | `text-white` |
| **Font** | `text-xs font-black uppercase tracking-widest` |
| **Shadow** | `shadow-md shadow-emerald-200` |
| **Hover** | `hover:bg-emerald-700` |
| **Action** | Calls `exportExcel()` |
| **Icon** | Download icon left of text |

#### "RESET" Button

| Property | Value |
|---|---|
| **Text** | `"RESET"` |
| **Background** | `bg-red-50` |
| **Text color** | `text-red-600` |
| **Border** | `border border-red-200` |
| **Hover** | `hover:bg-red-100` |
| **Action** | Clears `procedureCode`, `searchTerm`, `columnFilters`, `statusFilter`, resets `currentPage` to `1` |

#### "XÓA ĐÃ CHỌN" Button

| Property | Value |
|---|---|
| **Text** | `"XÓA ĐÃ CHỌN (N)"` — count inline |
| **Background** | `bg-red-600` |
| **Text color** | `text-white` |
| **Shadow** | `shadow-md shadow-red-200` |
| **Hover** | `hover:bg-red-700` |
| **Visibility** | Only when `selectedIds.size > 0` |
| **Action** | Calls `onDeleteMultiple([...selectedIds])`, clears `selectedIds` |

---

### 12.4 Toolbar Row 3 — Bản Ghi Mỗi Trang Selector

**Layout:** `flex items-center gap-2`

This row is confirmed from the screenshot.

#### Label

| Property | Value |
|---|---|
| **Text** | `"Bản ghi mỗi trang:"` |
| **Font size** | `text-sm` |
| **Color** | `text-slate-600` |
| **Flex-shrink** | `0` |

#### Page Size Dropdown

| Property | Value |
|---|---|
| **Type** | `<select>` |
| **Current value** | `50` (default, confirmed from screenshot) |
| **Options** | `10`, `20`, `50`, `100`, `200` |
| **Border** | `border-b border-slate-400` — underline only, same style as Mã thủ tục dropdown |
| **Background** | `bg-transparent` |
| **Font size** | `text-sm` |
| **Width** | `w-16` — narrow, just fits the number |
| **Chevron** | `▾` native or custom |
| **Binding** | `value={pageSize}` / `onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}` |

```tsx
// ✅ Page size selector — resets to page 1 on change (CRUD: READ with pagination)
<div className="flex items-center gap-2 mt-1">
  <span className="text-sm text-slate-600 flex-shrink-0">
    Bản ghi mỗi trang:
  </span>
  <select
    value={pageSize}
    onChange={e => {
      setPageSize(Number(e.target.value));
      setCurrentPage(1);  // always reset to page 1 on page-size change
    }}
    className="border-0 border-b border-slate-400 bg-transparent text-sm
               text-slate-700 pb-0.5 pr-4 focus:outline-none focus:border-blue-500
               appearance-none cursor-pointer w-16"
  >
    {[10, 20, 50, 100, 200].map(n => (
      <option key={n} value={n}>{n}</option>
    ))}
  </select>
</div>
```

---

### 12.5 Complete Toolbar JSX Structure

```tsx
// ✅ SOLID-compliant toolbar — each row has single responsibility
<div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 pt-4 pb-3 flex flex-col gap-3 mb-4">

  {/* Row 1: Contract ID search + circular search button */}
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-slate-700 flex-shrink-0">
      Số hợp đồng
    </span>
    <input
      type="text"
      value={contractIdSearch}
      onChange={e => setContractIdSearch(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && handleContractSearch()}
      placeholder="Nhập số hợp đồng..."
      className="border-0 border-b border-slate-400 bg-transparent text-sm text-slate-700
                 pb-1 focus:outline-none focus:border-blue-500 min-w-[180px]"
    />
    <button
      onClick={handleContractSearch}
      className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center
                 justify-center shadow-sm transition-colors duration-150 flex-shrink-0"
      aria-label="Tìm kiếm theo số hợp đồng"
    >
      <MagnifyingGlassIcon className="w-4 h-4 text-white" />
    </button>
  </div>

  {/* Row 2: Action buttons */}
  <div className="flex items-center gap-2 flex-wrap">
    <button onClick={() => fileInputRef.current?.click()}
      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700
                 text-white text-xs font-black uppercase tracking-widest rounded-lg
                 shadow-md shadow-blue-200 transition-colors">
      <ArrowUpTrayIcon className="w-4 h-4" /> NHẬP EXCEL
    </button>
    <input ref={fileInputRef} type="file" accept=".xlsx,.xls"
           className="hidden" onChange={handleFileUpload} />

    <button onClick={exportExcel}
      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700
                 text-white text-xs font-black uppercase tracking-widest rounded-lg
                 shadow-md shadow-emerald-200 transition-colors">
      <ArrowDownTrayIcon className="w-4 h-4" /> XUẤT EXCEL
    </button>

    <button onClick={handleReset}
      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100
                 text-red-600 border border-red-200 text-xs font-black uppercase
                 tracking-widest rounded-lg transition-colors">
      RESET
    </button>

    {selectedIds.size > 0 && (
      <button onClick={handleDeleteSelected}
        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700
                   text-white text-xs font-black uppercase tracking-widest rounded-lg
                   shadow-md shadow-red-200 transition-colors">
        XÓA ĐÃ CHỌN ({selectedIds.size})
      </button>
    )}
  </div>

  {/* Row 3: Records per page */}
  <div className="flex items-center gap-2">
    <span className="text-sm text-slate-600 flex-shrink-0">
      Bản ghi mỗi trang:
    </span>
    <div className="relative">
      <select
        value={pageSize}
        onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
        className="border-0 border-b border-slate-400 bg-transparent text-sm
                   text-slate-700 pb-0.5 pr-4 focus:outline-none focus:border-blue-500
                   appearance-none cursor-pointer w-16"
      >
        {[10, 20, 50, 100, 200].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-0 top-0 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </div>

</div>
```

---

### 12.6 Handler Functions (SOLID / CRUD Compliant)

```typescript
// ✅ SRP: each handler has ONE responsibility

// READ — contract ID search
const handleContractSearch = () => {
  setCurrentPage(1);
  // filteredProjects memo picks up contractIdSearch automatically via columnFilters or direct filter
};

// UPDATE — reset all filters (idempotent)
const handleReset = () => {
  setContractIdSearch('');
  setSearchTerm('');
  setColumnFilters({});
  setStatusFilter('ALL');
  setCurrentPage(1);
  setSelectedIds(new Set());
};

// DELETE — bulk delete selected rows
const handleDeleteSelected = () => {
  onDeleteMultiple?.([...selectedIds]);
  setSelectedIds(new Set());
};
```

---

## 7. Pagination (New — driven by `pageSize` + `currentPage`)

### 13.1 Paginated Data Slice

```typescript
// ✅ Derived from filteredProjects — no extra state
const paginatedProjects = useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  return filteredProjects.slice(start, start + pageSize);
}, [filteredProjects, currentPage, pageSize]);

const totalPages = Math.ceil(filteredProjects.length / pageSize);
```

### 13.2 Pagination Controls — Confirmed from Screenshot

The screenshot confirms pagination UI: `◀◀ ◀ 1 2 ▶ ▶▶`

| Property | Value |
|---|---|
| **Position** | Below the table, right-aligned |
| **Layout** | `flex items-center justify-end gap-1 mt-3` |

#### Pagination Button Design

| State | Classes |
|---|---|
| **Default** | `w-7 h-7 rounded text-xs text-slate-600 border border-slate-200 hover:bg-slate-50` |
| **Active page** | `w-7 h-7 rounded text-xs bg-blue-600 text-white border-blue-600 font-bold` |
| **Disabled** | `opacity-40 cursor-not-allowed` |

#### Buttons

| Button | Icon | Action | Disabled when |
|---|---|---|---|
| First | `◀◀` | `setCurrentPage(1)` | `currentPage === 1` |
| Prev | `◀` | `setCurrentPage(p => p - 1)` | `currentPage === 1` |
| Page numbers | `1`, `2`, … | `setCurrentPage(n)` | — |
| Next | `▶` | `setCurrentPage(p => p + 1)` | `currentPage === totalPages` |
| Last | `▶▶` | `setCurrentPage(totalPages)` | `currentPage === totalPages` |

```tsx
// ✅ Pagination component (SRP — separate from toolbar)
<div className="flex items-center justify-end gap-1 mt-3 px-4 pb-3">
  <PaginationButton
    onClick={() => setCurrentPage(1)}
    disabled={currentPage === 1}
    label="◀◀"
  />
  <PaginationButton
    onClick={() => setCurrentPage(p => p - 1)}
    disabled={currentPage === 1}
    label="◀"
  />
  {Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => Math.abs(p - currentPage) <= 2) // show ±2 pages
    .map(p => (
      <PaginationButton
        key={p}
        onClick={() => setCurrentPage(p)}
        active={p === currentPage}
        label={String(p)}
      />
    ))
  }
  <PaginationButton
    onClick={() => setCurrentPage(p => p + 1)}
    disabled={currentPage === totalPages}
    label="▶"
  />
  <PaginationButton
    onClick={() => setCurrentPage(totalPages)}
    disabled={currentPage === totalPages}
    label="▶▶"
  />
</div>
```

---

## 8. SOLID Compliance Notes

### 14.1 Single Responsibility

| Concern | Extracted to |
|---|---|
| Breadcrumb rendering | `<Breadcrumb items={BREADCRUMBS} />` |
| Page title bar | `<PageTitleBar title="Danh sách thủ tục" />` |
| Toolbar Row 1 (filter) | `<ProcedureFilterRow />` |
| Toolbar Row 2 (actions) | `<ActionButtonRow />` |
| Toolbar Row 3 (page size) | `<PageSizeRow />` |
| Pagination | `<PaginationControls />` |
| Table | `<DataTable />` |

### 14.2 Open/Closed

- The "Số hợp đồng" field is a plain `<input type="text">` — no external data dependency, fully self-contained.
- Page size options are a static array `[10, 20, 50, 100, 200]` in a config constant — change once, affects all.

### 14.3 Interface Segregation

```typescript
// ✅ Each sub-component receives only what it needs — not the full DataTableProps
interface ContractSearchRowProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

interface PageSizeRowProps {
  pageSize: number;
  onChange: (size: number) => void;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### 14.4 Dependency Inversion

- Toolbar does not call the API directly — it calls callbacks (`onImport`, `onDeleteMultiple`) passed by the parent.
- The contract ID search is purely local state — no external data injection needed.

---

## 9. CRUD Compliance Notes

| Operation | UI element | Behavior |
|---|---|---|
| **CREATE** | NHẬP EXCEL | Parses file → calls `onImport(data)` — parent owns persistence |
| **READ** | Số hợp đồng input + search button | Filters `filteredProjects` by contract ID text; resets to page 1 |
| **READ** | Bản ghi mỗi trang | Changes slice size; resets to page 1 |
| **READ** | Pagination buttons | Navigates through sliced data |
| **UPDATE** | XUẤT EXCEL | Reads current `filteredProjects` → exports — no mutation |
| **UPDATE** | RESET | Clears all filter state — idempotent, no data mutation |
| **DELETE** | XÓA ĐÃ CHỌN | Calls `onDeleteMultiple` — parent owns persistence |

> **Key principle:** The toolbar owns **filter state** only. All persistence operations (create, delete) are delegated upward via callbacks. This makes the DataTable a pure READ component with callback-based CREATE/DELETE hooks — consistent with the Dependency Inversion Principle.

---

## 10. Updated Color Palette

| Role | Tailwind | Hex | Usage |
|---|---|---|---|
| Page canvas | `bg-slate-50` | `#f8fafc` | Background |
| Title bar bg | `bg-gray-100` | `#f3f4f6` | Page title strip |
| Toolbar / table bg | `bg-white` | `#ffffff` | Card surfaces |
| Card border | `border-slate-200` | `#e2e8f0` | Outlines |
| Underline select | `border-slate-400` | `#94a3b8` | Dropdown underline |
| Underline select focus | `border-blue-500` | `#3b82f6` | Focus state |
| Search button | `bg-blue-600` | `#2563eb` | Circular search |
| Import button | `bg-blue-600` | `#2563eb` | NHẬP EXCEL |
| Export button | `bg-emerald-600` | `#059669` | XUẤT EXCEL |
| Reset button | `bg-red-50 / text-red-600` | | RESET |
| Delete button | `bg-red-600` | `#dc2626` | XÓA ĐÃ CHỌN |
| Active page btn | `bg-blue-600 text-white` | `#2563eb` | Current page |
| Inactive page btn | `border-slate-200` | | Other page buttons |
| Header bg | `bg-slate-50` | `#f8fafc` | `<thead>` |
| Row hover | `bg-blue-50/50` | | `hover:bg-blue-50/50` |
| Body text | `text-slate-700` | `#374151` | Data cells |

---

## 11. Table Container

| Property | Value |
|---|---|
| **Background** | `bg-white` |
| **Border-radius** | `rounded-xl` |
| **Shadow** | `shadow` |
| **Border** | `border border-slate-200` |
| **Overflow** | `overflow-hidden` (outer) |

### 11.1 Scroll Area (Inner)

| Property | Value |
|---|---|
| **Overflow** | `overflow-auto` |
| **Max-height** | `max-h-[calc(100vh-200px)]` |
| **Scrollbar style** | `scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100` |

---

## 12. Table Structure

| Property | Value |
|---|---|
| **Table** | `w-auto min-w-full text-left border-collapse table-auto relative` |
| **Cell alignment** | All `<td>` use `align-top` — critical for multi-line content |

---

## 13. `<thead>` — Full Specification

### 13.1 `<thead>` Container

| Property | Value |
|---|---|
| **Position** | `sticky top-0` |
| **Z-index** | `z-30` |

### 13.2 Z-Index Hierarchy (Critical)

This is the most complex part of the table. Incorrect z-index values cause sticky columns to be obscured by scrolling content.

| Column | Header z-index | Body z-index | Sticky |
|---|---|---|---|
| Checkbox (col 1) | `z-40` | `z-20` | `sticky left-0` |
| Index / TT (col 2) | `z-30` | _(no z)_ | `sticky left-[50px]` |
| Action (last col) | `z-30` | _(no z)_ | `sticky right-[150px]` (or `right-0`) |
| All other columns | `z-20` | — | Not sticky |

> **Rule:** Leftmost pinned columns always win over adjacent sticky columns. Checkbox (`z-40`) beats Index (`z-30`), which beats standard headers (`z-20`).

### 13.3 Header Row Background

| Property | Value |
|---|---|
| **Background** | `bg-slate-50` or `bg-slate-100` — light gray |
| **Border-bottom** | `border-b border-slate-200` |

### 13.4 `FilterableHeader` Sub-Component

Every data column uses this custom `<th>` component.

**Props:**
```typescript
interface FilterableHeaderProps {
  label: string;
  colId: string;
  minWidth?: string;   // e.g. "min-w-[120px]"
  className?: string;
}
```

**Layout (top → bottom):**

```
┌──────────────────────────────────────┐
│  Label text         [🔽 funnel icon] │  ← header row
├──────────────────────────────────────┤
│  [Filter input field]                │  ← only when activeFilterColumn === colId
└──────────────────────────────────────┘
```

**Header cell styles:**

| Property | Value |
|---|---|
| **Position** | `sticky top-0` |
| **Z-index** | `z-20` (standard) |
| **Shadow** | `shadow-sm` |
| **Padding** | `px-3 py-2` |
| **Font** | `text-xs font-black uppercase tracking-widest text-slate-600` |
| **Background** | `bg-slate-50` |
| **White-space** | `whitespace-nowrap` |
| **Display** | `relative` — for dropdown positioning |

**Funnel icon:**

| Property | Value |
|---|---|
| **Icon** | SVG funnel/filter icon |
| **Size** | `w-3 h-3` |
| **Color** | `text-slate-400` default / `text-blue-600` when that column has an active filter (`columnFilters[colId]`) |
| **Cursor** | `cursor-pointer` |
| **Action** | `onClick` — toggles `activeFilterColumn` between `colId` and `null` |

**Filter dropdown input (conditional):**

| Property | Value |
|---|---|
| **Visible when** | `activeFilterColumn === colId` |
| **Position** | `absolute top-full left-0 mt-1 z-50` |
| **Background** | `bg-white` |
| **Border** | `border border-blue-300 rounded-lg` |
| **Shadow** | `shadow-lg` |
| **Padding** | `p-2` |
| **Input** | `type="text"`, `text-xs`, `w-40`, `border border-slate-200 rounded px-2 py-1` |
| **Auto-focus** | `autoFocus` — focuses immediately on open |
| **Binding** | `value={columnFilters[colId] ?? ''}` / `onChange` updates `columnFilters` |
| **Close on blur** | `onBlur` → `setActiveFilterColumn(null)` with `setTimeout(0)` to avoid race with click |

---

## 14. Column Definitions

Full column list with widths, content, and special behaviors:

| Col # | ID | Header label | Min-width | Sticky | Special behavior |
|---|---|---|---|---|---|
| 1 | `checkbox` | `☐` (checkbox only) | `w-[50px]` | `left-0, z-40` | Select-all in header; individual checkbox in body |
| 2 | `index` | `TT` | `w-[50px]` | `left-[50px], z-30` | Row number (1-based from filteredProjects index) |
| 3 | `contractId` | Số HĐ | `min-w-[120px]` | — | — |
| 4 | `title` | Tên Đề Tài | `min-w-[280px]` | — | `onDoubleClick → onView(p)`, `cursor-pointer hover:text-blue-700`, `whitespace-normal break-words` |
| 5 | `leadAuthor` | Chủ Nhiệm | `min-w-[150px]` | — | — |
| 6 | `department` | Bộ môn / Khoa | `min-w-[130px]` | — | — |
| 7 | `category` | Loại / Lĩnh vực | `min-w-[130px]` | — | Array → join with `", "` |
| 8 | `status` | Tình Trạng | `min-w-[130px]` | — | `getStatusBadge(p.status)` |
| 9 | `progressStatus` | Tiến Độ | `min-w-[110px]` | — | `getProgressBadge(p.progressStatus)` |
| 10 | `startDate` | Ngày Bắt Đầu | `min-w-[110px]` | — | `formatDate(p.startDate)` |
| 11 | `endDate` | Ngày Kết Thúc | `min-w-[110px]` | — | `formatDate(p.endDate)` |
| 12 | `budget` | Kinh Phí (VNĐ) | `min-w-[130px]` | — | `toLocaleString('vi-VN')` |
| 13 | `products` | Sản Phẩm | `min-w-[200px]` | — | Object array → formatted string, `whitespace-normal break-words` |
| 14 | `projectCode` | Mã Số ĐT | `min-w-[120px]` | — | `font-mono font-bold` |
| 15 | `actions` | Hành Động | `min-w-[120px]` | `right-[150px]` or `right-0` | 3 icon buttons: View, Edit, Delete |

> **Note:** Exact column count may vary. The above represents the confirmed minimum set from the analysis.

---

## 15. Table Body Rows

### 15.1 Row Container

| Property | Value |
|---|---|
| **Hover bg** | `hover:bg-blue-50/50` |
| **Transition** | `transition-colors` |
| **Group** | `group` — enables child hover states |
| **Border-bottom** | `border-b border-slate-100` |

### 15.2 Checkbox Cell (Col 1)

| Property | Value |
|---|---|
| **Sticky** | `sticky left-0 z-20` |
| **Background** | `bg-white group-hover:bg-blue-50/50` — must match row hover |
| **Padding** | `px-3 py-3` |
| **Checkbox** | `type="checkbox"`, `checked={selectedIds.has(p.id)}` |
| **Checkbox style** | `rounded`, `text-blue-600`, `border-slate-300`, `focus:ring-blue-500` |
| **onChange** | Toggles the project ID in/out of `selectedIds` Set |

### 15.3 Index Cell (Col 2)

| Property | Value |
|---|---|
| **Sticky** | `sticky left-[50px]` |
| **Background** | `bg-white group-hover:bg-blue-50/50` |
| **Content** | 1-based row index from `filteredProjects` array |
| **Font** | `text-xs font-bold text-slate-500 text-center` |
| **Padding** | `px-3 py-3` |

### 15.4 Standard Data Cells

| Property | Value |
|---|---|
| **Vertical align** | `align-top` — **critical** for multi-line cells |
| **Padding** | `px-3 py-3` |
| **Font size** | `text-xs` or `text-sm` |
| **Color** | `text-slate-700` |

### 15.5 "Tên Đề Tài" Cell (Special)

| Property | Value |
|---|---|
| **White-space** | `whitespace-normal break-words` |
| **Max-width** | `max-w-[280px]` or `max-w-xs` |
| **Cursor** | `cursor-pointer` |
| **Hover color** | `hover:text-blue-700` |
| **Trigger** | `onDoubleClick={() => onView(p)}` |
| **Font weight** | `font-medium` |

### 15.6 Actions Cell (Last Column)

| Property | Value |
|---|---|
| **Sticky** | `sticky right-0` (or `right-[150px]` to leave space) |
| **Background** | `bg-white group-hover:bg-blue-50/50` |
| **Z-index** | `z-10` |
| **Layout** | `flex items-center gap-1` |
| **Padding** | `px-3 py-3` |

#### View Button (`👁`)

| Property | Value |
|---|---|
| **Icon** | Eye SVG |
| **Size** | `w-7 h-7` |
| **Shape** | `rounded-lg` |
| **Background** | `bg-blue-50` |
| **Icon color** | `text-blue-600` |
| **Hover** | `hover:bg-blue-100` |
| **Action** | `onClick={() => onView(p)}` |
| **Title** | `title="Xem chi tiết"` |

#### Edit Button (`✎`)

| Property | Value |
|---|---|
| **Icon** | Pencil SVG |
| **Size** | `w-7 h-7` |
| **Shape** | `rounded-lg` |
| **Background** | `bg-amber-50` |
| **Icon color** | `text-amber-600` |
| **Hover** | `hover:bg-amber-100` |
| **Action** | `onClick={() => onEdit(p)}` |
| **Title** | `title="Chỉnh sửa"` |

#### Delete Button (`🗑`)

| Property | Value |
|---|---|
| **Icon** | Trash SVG |
| **Size** | `w-7 h-7` |
| **Shape** | `rounded-lg` |
| **Background** | `bg-red-50` |
| **Icon color** | `text-red-500` |
| **Hover** | `hover:bg-red-100` |
| **Action** | `onClick={() => onDelete(p.id)}` |
| **Title** | `title="Xóa"` |

---

## 16. Status & Progress Badges

### 16.1 `getStatusBadge(status: ProjectStatus)`

| Status value | Background | Text color | Label |
|---|---|---|---|
| `COMPLETED` | `bg-emerald-100` | `text-emerald-700` | `"Hoàn thành"` |
| `OVERDUE` | `bg-red-100` | `text-red-700` | `"Trễ hạn"` |
| `ONGOING` | `bg-blue-100` | `text-blue-700` | `"Đang TH"` |
| `PAUSED` | `bg-amber-100` | `text-amber-700` | `"Tạm dừng"` |
| `LIQUIDATED` | `bg-slate-100` | `text-slate-600` | `"Thanh lý"` |

**Badge base style:** `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide`

### 16.2 `getProgressBadge(progressText: string)`

| Text contains | Background | Text color |
|---|---|---|
| `"Đúng hạn"` | `bg-emerald-50` | `text-emerald-700` |
| `"Trễ hạn"` | `bg-red-50` | `text-red-700` |
| `"Gia hạn"` | `bg-amber-50` | `text-amber-700` |
| (default) | `bg-slate-50` | `text-slate-600` |

**Badge base style:** Same as status badge.

---

## 17. `filteredProjects` — Memoization & Filter Logic

```tsx
const filteredProjects = useMemo(() => {
  return projects
    // Step 1: Global search
    .filter(p => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.title?.toLowerCase().includes(term) ||
        p.leadAuthor?.toLowerCase().includes(term) ||
        p.contractId?.toLowerCase().includes(term) ||
        p.projectCode?.toLowerCase().includes(term)
      );
    })
    // Step 2: Status filter
    .filter(p => statusFilter === 'ALL' || p.status === statusFilter)
    // Step 3: Column-specific filters
    .filter(p => {
      return Object.entries(columnFilters).every(([colId, filterVal]) => {
        if (!filterVal) return true;
        const raw = p[colId as keyof ResearchProject];
        let str: string;
        if (Array.isArray(raw)) {
          // Handle string arrays (categories)
          str = raw.map(item =>
            typeof item === 'object' ? JSON.stringify(item) : String(item)
          ).join(' ');
        } else {
          str = raw != null ? String(raw) : '';
        }
        return str.toLowerCase().includes(filterVal.toLowerCase());
      });
    });
}, [projects, searchTerm, statusFilter, columnFilters]);
```

---

## 18. `formatDate` — Critical Date Utility

This function must be ported **exactly** — it is a data-cleansing function, not just a display formatter.

```typescript
function formatDate(value: string | number | null | undefined): string {
  if (value == null || value === '') return '';

  // Case 1: Excel serial number (numeric, typically 20000–100000)
  if (typeof value === 'number') {
    // Excel epoch offset: 25569 days between 1900-01-01 and 1970-01-01
    const utcMs = (value - 25569) * 86400 * 1000;
    const d = new Date(utcMs);
    const day   = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year  = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  const str = String(value).trim();

  // Case 2: Already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;

  // Case 3: Corrupted Excel concatenation e.g. "31/12/45747"
  // Detect by checking if the year portion is > 9999 (Excel artifact)
  const parts = str.split('/');
  if (parts.length === 3 && parseInt(parts[2]) > 9999) {
    // Recalculate as Excel serial: reconstruct from the corrupted year
    // This is a heuristic — exact logic depends on the corruption pattern
    return str; // fallback: return as-is and log warning
  }

  // Case 4: ISO YYYY-MM-DD — convert WITHOUT using new Date() to avoid timezone error
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  return str; // fallback
}
```

> **⚠️ Critical:** Do NOT use `new Date(str)` for YYYY-MM-DD strings. JavaScript parses ISO dates as UTC midnight, which causes a timezone off-by-one-day error in UTC+7 environments. The regex substitution approach avoids this entirely.

---

## 19. Excel Import Logic (`handleFileUpload`)

```typescript
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const binaryStr = evt.target?.result;
    const workbook = XLSX.read(binaryStr, { type: 'binary' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    // Fuzzy header matching
    const headerRow: string[] = (rows[0] || []).map((h: any) =>
      String(h).toLowerCase().trim()
    );

    const HEADER_MAP: Record<string, keyof ResearchProject> = {
      'số hợp đồng':         'contractId',
      'tên đề tài':          'title',
      'chủ nhiệm':           'leadAuthor',
      'kinh phí thực hiện':  'budget',
      'ngày bắt đầu':        'startDate',
      'ngày kết thúc':       'endDate',
      'mã số đt':            'projectCode',
      // ... additional mappings
    };

    // Map header indices
    const colIndex: Record<string, number> = {};
    headerRow.forEach((header, idx) => {
      Object.entries(HEADER_MAP).forEach(([excelName, fieldKey]) => {
        if (header.includes(excelName)) colIndex[fieldKey] = idx;
      });
    });

    // Build projects from data rows (skip header row)
    const today = new Date().toISOString().split('T')[0];
    const imported = rows.slice(1)
      .filter(row => row.some(cell => cell != null && cell !== ''))
      .map(row => ({
        id: crypto.randomUUID(),
        title:       row[colIndex.title] ?? '',
        contractId:  row[colIndex.contractId] ?? '',
        leadAuthor:  row[colIndex.leadAuthor] ?? '',
        budget:      Number(row[colIndex.budget]) || 0,
        startDate:   row[colIndex.startDate] ?? today,
        endDate:     row[colIndex.endDate] ?? today,
        projectCode: row[colIndex.projectCode] ?? '',
        status:      'ONGOING' as ProjectStatus,   // default
        // ... other defaults
      }));

    onImport?.(imported);
  };

  reader.readAsBinaryString(file);
  // Reset input so same file can be re-imported
  e.target.value = '';
};
```

---

## 20. Excel Export Logic (`exportExcel`)

```typescript
const exportExcel = () => {
  const columns: Array<{
    header: string;
    ml: number;        // column width in characters (wch)
    value: (p: ResearchProject, i: number) => string;
  }> = [
    { header: 'STT',               ml: 5,   value: (_, i) => String(i + 1) },
    { header: 'Số Hợp Đồng',       ml: 20,  value: p => p.contractId ?? '' },
    { header: 'Tên Đề Tài',        ml: 50,  value: p => p.title ?? '' },
    { header: 'Chủ Nhiệm',         ml: 25,  value: p => p.leadAuthor ?? '' },
    { header: 'Ngày Bắt Đầu',      ml: 15,  value: p => formatDate(p.startDate) },
    { header: 'Ngày Kết Thúc',     ml: 15,  value: p => formatDate(p.endDate) },
    { header: 'Kinh Phí (VNĐ)',    ml: 18,  value: p => String(p.budget ?? 0) },
    { header: 'Tình Trạng',        ml: 15,  value: p => p.status ?? '' },
    { header: 'Tiến Độ',           ml: 15,  value: p => p.progressStatus ?? '' },
    { header: 'Mã Số ĐT',          ml: 15,  value: p => p.projectCode ?? '' },
    // ... additional columns in exact export order
  ];

  // Build AOA (array of arrays)
  const headers = columns.map(c => c.header);
  const dataRows = filteredProjects.map((p, i) =>
    columns.map(c => c.value(p, i))
  );
  const aoa = [headers, ...dataRows];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Set column widths
  ws['!cols'] = columns.map(c => ({ wch: c.ml }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dữ liệu đề tài');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Data_DeTai_${today}.xlsx`);
};
```

---

## 21. Select-All Checkbox Logic

```tsx
// Header checkbox — select all / deselect all
const allSelected = filteredProjects.length > 0 &&
  filteredProjects.every(p => selectedIds.has(p.id));

const handleSelectAll = () => {
  if (allSelected) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(filteredProjects.map(p => p.id)));
  }
};

// Header cell
<input
  type="checkbox"
  checked={allSelected}
  onChange={handleSelectAll}
  className="rounded text-blue-600 border-slate-300 focus:ring-blue-500"
/>
```

---

## 22. Color Palette

| Role | Tailwind | Hex | Usage |
|---|---|---|---|
| Page canvas | `bg-slate-50` | `#f8fafc` | Background behind toolbar and table |
| Toolbar / table bg | `bg-white` | `#ffffff` | Card surfaces |
| Card border | `border-slate-200` | `#e2e8f0` | Toolbar and table outlines |
| Header bg | `bg-slate-50` | `#f8fafc` | `<thead>` background |
| Row hover | `bg-blue-50/50` | `#eff6ff` at 50% | `hover:bg-blue-50/50` |
| Body text | `text-slate-700` | `#374151` | Data cell text |
| Muted text | `text-slate-500` | `#6b7280` | Index numbers, placeholder |
| Import button | `bg-blue-600` | `#2563eb` | NHẬP EXCEL |
| Export button | `bg-emerald-600` | `#059669` | XUẤT EXCEL |
| Reset button | `bg-red-50 text-red-600` | `#fef2f2 / #dc2626` | RESET |
| Delete button | `bg-red-600` | `#dc2626` | XÓA ĐÃ CHỌN |
| View action | `bg-blue-50 text-blue-600` | | View icon button |
| Edit action | `bg-amber-50 text-amber-600` | | Edit icon button |
| Delete action | `bg-red-50 text-red-500` | | Delete icon button |
| Active filter icon | `text-blue-600` | `#2563eb` | Funnel icon when filter active |

---

## 23. Typography

| Element | Size | Weight | Color | Transform |
|---|---|---|---|---|
| Toolbar buttons | `text-xs` | `font-black` 900 | Per button | `uppercase tracking-widest` |
| Column headers | `text-xs` | `font-black` 900 | `text-slate-600` | `uppercase tracking-widest` |
| Data cells | `text-xs`–`text-sm` | `font-normal` 400 | `text-slate-700` | — |
| Index numbers | `text-xs` | `font-bold` 700 | `text-slate-500` | — |
| Project code | `text-xs` | `font-bold` 700 | `text-slate-700` | — `font-mono` |
| Badge labels | `text-[10px]` | `font-black` 900 | Per badge | `uppercase tracking-wide` |
| Search input | `text-sm` | `font-normal` | `text-slate-700` | — |

---

## 24. Spacing & Sizing

| Element | Value |
|---|---|
| Toolbar padding | `p-4` |
| Toolbar gap | `gap-4` |
| Table max-height | `calc(100vh - 200px)` |
| Header cell padding | `px-3 py-2` |
| Body cell padding | `px-3 py-3` |
| Action button size | `w-7 h-7` (28×28px) |
| Action button gap | `gap-1` |
| Checkbox column width | `w-[50px]` |
| Index column left offset | `left-[50px]` |
| Search input width | `w-64` |
| Button padding | `px-3 py-2` |
| Button border-radius | `rounded-lg` |
| Card border-radius | `rounded-xl` |
| Badge padding | `px-2 py-0.5` |

---

## 25. Accessibility Notes

- Table: use `<table role="grid">` for keyboard navigation support
- Checkbox column header: `aria-label="Chọn tất cả"` on the select-all checkbox
- Action buttons: `title` attributes confirmed (`"Xem chi tiết"`, `"Chỉnh sửa"`, `"Xóa"`)
- Filter input: `aria-label={`Lọc theo ${label}`}` on the filter dropdown input
- Delete multiple button: show row count e.g. `"XÓA ĐÃ CHỌN (3)"` for screen readers
- Column sort: not implemented in this component — no `aria-sort` needed

---

## 26. Key Implementation Gotchas for Cursor

1. **Z-index stacking is mandatory** — Checkbox header must be `z-40`, Index header `z-30`, all others `z-20`. Wrong values cause sticky columns to bleed under scrolling ones.

2. **`align-top` on all `<td>`** — Without this, cells with wrapped text cause misaligned single-line cells to vertically center, making the row look broken.

3. **`whitespace-normal break-words`** on "Tên Đề Tài" and "Sản Phẩm" columns — Without this, long text stretches the table to thousands of pixels wide.

4. **`formatDate` uses UTC methods** (`getUTCDate`, `getUTCMonth`, `getUTCFullYear`) for Excel serial number conversion — using local methods will produce wrong dates in UTC+7.

5. **`formatDate` uses regex for ISO strings** (`YYYY-MM-DD`) — do not use `new Date()` to avoid timezone off-by-one-day bug.

6. **`onDoubleClick` on title cell** — Not `onClick`. Single-click on the cell should do nothing; double-click opens the detail view.

7. **`fileInputRef.current.value = ''`** after import — Without this, the same file cannot be re-imported (browser caches the file input value).

8. **`scrollbar-thin` is a custom Tailwind plugin** (`tailwind-scrollbar`) — must be installed separately: `npm install tailwind-scrollbar`.

9. **Export column order is a user contract** — The order of columns in the `exportExcel` function must not be changed. Users depend on the fixed column layout for their downstream Excel workflows.

10. **`sticky` columns need explicit background** — Sticky `<td>` cells must set `bg-white group-hover:bg-blue-50/50` explicitly, otherwise the table body scrolls visibly under/through them.
