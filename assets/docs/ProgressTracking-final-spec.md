# ProgressTracking — Complete Page UI Rebuild Specification
**System:** UMP-RMS — Hệ thống Quản lý Dự án KHCN
**Page:** Tiến độ thực hiện (Implementation Progress)
**Source authority:** Screenshot (image evidence) > Component description (code intent) > Previous screenshot analysis (inferred, lowest trust)
**Date format canonical:** `dd/mm/yyyy` throughout all UI display

> This document supersedes `kanban-board-analysis.md` and incorporates corrections from `ProgressTracking-audit.md`. Every spec here is grounded in the actual screenshot. Conflicts from previous documents are resolved with explicit verdicts.

---

## 1. Full Page Layout

The page renders inside the shared sidebar shell. The main content area has three vertical zones:

```
┌──────────────────────────────────────────────────────────┐
│  Page Title Bar                                          │
│  "Hệ thống quản lý Dự án KHCN"                          │
├──────────────────────────────────────────────────────────┤
│  Zone 1 — Notification & Events Panel                    │
│  (white card, rounded-[24px], 3 notification items)      │
├──────────────────────────────────────────────────────────┤
│  Zone 2 — Kanban Section Header                          │
│  "Tiến độ thực hiện" title left + Kanban/Lịch toggle right│
├──────────────────────────────────────────────────────────┤
│  Zone 3 — Kanban Board                                   │
│  4 equal columns, full height                            │
└──────────────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| **Page canvas background** | Very light gray — `bg-slate-50` or `#f8fafc` |
| **Content padding** | `p-6` or `24px` all sides |
| **Zone gap** | `space-y-4` (~16px between zones) |
| **Animation** | `animate-fadeIn` on mount (custom Tailwind keyframe) |

---

## 2. Page Title Bar

| Element | Value |
|---|---|
| **Text** | `"Hệ thống quản lý Dự án KHCN"` |
| **Color** | Primary blue `text-blue-600` (`#2563eb`) |
| **Font size** | `text-xl` or `text-2xl` (~20–24px) |
| **Font weight** | `font-bold` (700) |
| **Bottom divider** | `border-b border-slate-200` full content width |
| **Padding bottom** | `pb-4` before divider |

---

## 3. Zone 1 — Notification & Events Panel

### 3.1 Panel Container

| Property | Value |
|---|---|
| **Background** | `bg-white` |
| **Border-radius** | `rounded-[24px]` — large rounded corners |
| **Padding** | `p-5` |
| **Shadow** | `shadow-sm` |
| **Border** | None — shadow provides depth |

### 3.2 Panel Header Row

| Element | Value |
|---|---|
| **Layout** | Flex row, `justify-between items-center` |
| **Title** | (Not clearly visible — likely "Thông báo & Sự kiện" or omitted) |
| **"Xem tất cả" button** | Right-aligned, small text, `text-blue-500` or `text-slate-400`, `text-xs` |
| **Margin bottom** | `mb-3` or `mb-4` |

### 3.3 Notification Item Design

Each item is a `div` block, vertically stacked with `space-y-3` between items. From the screenshot, three items are visible:

```
[TAG BADGE]
Item title text
Date text
```

#### Tag Badge

| Property | Value |
|---|---|
| **Shape** | Pill — `rounded-full` or `rounded-md` |
| **Font size** | `text-[10px]` or `text-xs` |
| **Font weight** | `font-semibold` or `font-bold` |
| **Text transform** | UPPERCASE |
| **Padding** | `px-2 py-0.5` |
| **Display** | `inline-block` |

**Three badge color states (confirmed from screenshot):**

| Tag text | Background | Text color | Tailwind |
|---|---|---|---|
| `THÔNG BÁO` | Light blue | Blue | `bg-blue-100 text-blue-700` |
| `SỰ KIỆN` | Light blue | Blue | `bg-blue-100 text-blue-700` |
| `HƯỚNG DẪN` | Light blue | Blue | `bg-blue-100 text-blue-700` |

> **Screenshot verdict:** All three visible badges use the same blue styling (`bg-blue-100 text-blue-700`). The component description mentions red for "Trễ hạn" and amber for "Sắp nghiệm thu" — those states are not triggered in this screenshot because no projects are actually overdue in the current dataset.

**Full badge color logic (all states):**

| Condition | Tag | Tailwind BG | Tailwind Text |
|---|---|---|---|
| Project overdue | TRỄ HẠN | `bg-red-100` | `text-red-700` |
| Project ending ≤ 3 months | SẮP NGHIỆM THU | `bg-amber-100` | `text-amber-700` |
| General event/notice | SỰ KIỆN / THÔNG BÁO / HƯỚNG DẪN | `bg-blue-100` | `text-blue-700` |

#### Item Title

| Property | Value |
|---|---|
| **Font size** | `text-sm` (~14px) |
| **Font weight** | `font-medium` (500) |
| **Color** | `text-slate-800` or `text-gray-800` |
| **Margin top** | `mt-1` below the badge |
| **Overflow** | Single line or `line-clamp-2` |

**Confirmed titles from screenshot:**
1. `"Gia hạn nộp thuyết minh đề tài cấp Trường đợt 2"`
2. `"Hội thảo khoa học quốc tế: Chuyển đổi số trong giáo dục"`
3. `"Hướng dẫn thanh quyết toán kinh phí nghiên cứu"`

#### Item Date

| Property | Value |
|---|---|
| **Format** | `"dd thg M, yyyy"` — Vietnamese locale format (e.g., `"20 thg 5, 2024"`) |
| **Font size** | `text-xs` (~12px) |
| **Color** | `text-slate-400` |
| **Margin top** | `mt-0.5` below title |

> **Date format note:** Displayed dates use Vietnamese locale (`thg` = tháng = month). This is `date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })` or equivalent. **Do not** display as `dd/mm/yyyy` in this panel — Vietnamese locale format is intentional here. The `dd/mm/yyyy` format applies to form inputs and task card dates only.

**Confirmed dates from screenshot:**
1. `"20 thg 5, 2024"`
2. `"15 thg 6, 2024"`
3. `"12 thg 5, 2024"`

#### Item Hover

| Property | Value |
|---|---|
| **Hover bg** | `hover:bg-slate-50` |
| **Border-radius** | `rounded-xl` on hover area |
| **Cursor** | `cursor-pointer` |
| **Transition** | `transition-colors duration-150` |
| **Padding on hover area** | `px-3 py-2 -mx-3` (negative margin to extend to edges) |

#### Item Separator

- `border-b border-slate-100` between items, or use `divide-y divide-slate-100` on the container.
- No separator after the last item.

---

## 4. Zone 2 — Kanban Section Header

### 4.1 Header Row Layout

| Property | Value |
|---|---|
| **Display** | Flex row, `justify-between items-center` |
| **Margin bottom** | `mb-4` before the Kanban board |

### 4.2 Section Title (Left)

| Property | Value |
|---|---|
| **Icon** | SVG clipboard/document icon, `w-5 h-5`, inline left |
| **Icon color** | `text-slate-600` or `text-slate-700` |
| **Text** | `"Tiến độ thực hiện"` |
| **Font size** | `text-lg` or `text-xl` (~18–20px) |
| **Font weight** | `font-bold` (700) |
| **Color** | `text-slate-800` |
| **Icon–text gap** | `gap-2` |

### 4.3 View Toggle (Right) — **Confirmed from screenshot**

From the screenshot, the toggle clearly shows "Kanban" as active (white pill) and "Lịch" as inactive (plain text), both inside a rounded container.

| Property | Value |
|---|---|
| **Container background** | `bg-slate-200/50` — semi-transparent slate gray |
| **Container border-radius** | `rounded-2xl` |
| **Container padding** | `p-1` |
| **Height** | ~`h-9` (36px) |

**Active button — "Kanban":**

| Property | Tailwind class |
|---|---|
| Background | `bg-white` |
| Text color | `text-blue-600` ← **confirmed**: blue, not black |
| Font weight | `font-medium` |
| Font size | `text-sm` |
| Border-radius | `rounded-xl` |
| Shadow | `shadow-sm` |
| Padding | `px-4 py-1.5` |

**Inactive button — "Lịch":**

| Property | Tailwind class |
|---|---|
| Background | `bg-transparent` |
| Text color | `text-slate-500` |
| Font weight | `font-medium` |
| Font size | `text-sm` |
| Padding | `px-4 py-1.5` |

```tsx
// ✅ Canonical implementation
<div className="bg-slate-200/50 rounded-2xl p-1 flex">
  <button className="bg-white text-blue-600 text-sm font-medium shadow-sm rounded-xl px-4 py-1.5">
    Kanban
  </button>
  <button className="text-slate-500 text-sm font-medium rounded-xl px-4 py-1.5">
    Lịch
  </button>
</div>
```

---

## 5. Zone 3 — Kanban Board

### 5.1 Board Container

| Property | Value |
|---|---|
| **Display** | CSS Grid — `grid grid-cols-4 gap-4` (desktop) |
| **Responsive** | `md:grid-cols-2 xl:grid-cols-4` |
| **Gap** | `gap-4` to `gap-6` |
| **Min-height** | Fills remaining viewport — `min-h-[520px]` |

---

## 6. Kanban Column Design — All States

### 6.1 Shared Column Structure

```
┌──────────────────────────────────────────────┐  ← border (1px, column color)
│  COLUMN TITLE                       [count]  │  ← header
│                                              │
│  [task cards stacked here when present]      │  ← drop zone (flex-1)
│                                              │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│    + TẠO TASK MỚI                            │  ← footer button (dashed)
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└──────────────────────────────────────────────┘
```

### 6.2 Shared Column Properties

| Property | Tailwind | Value |
|---|---|---|
| **Border** | `border` | 1px solid (not 2px) |
| **Border-radius** | `rounded-[16px]` or `rounded-2xl` | ~16px |
| **Padding** | `p-4` | 16px all sides |
| **Display** | `flex flex-col` | Column flex |
| **Min-height** | `min-h-[520px]` | Fills page |
| **Background** | Per column (see 6.4) | Semi-transparent tint |

### 6.3 Column Header

| Element | Value |
|---|---|
| **Layout** | `flex justify-between items-center mb-3` |
| **Title font size** | `text-xs` (~12px) |
| **Title font weight** | `font-bold` (700) |
| **Title transform** | `uppercase` |
| **Title letter-spacing** | `tracking-wider` |
| **Title color** | Per column (see 6.4) |

#### Count Badge

| Property | Value |
|---|---|
| **Shape** | `rounded-full` or `rounded-md`, ~`w-6 h-6` |
| **Background** | `bg-white` |
| **Border** | `border` in column's light border color |
| **Text** | Count number, `text-xs`, `text-slate-500` |
| **Font weight** | `font-medium` |

### 6.4 Column Theme Map — **Canonical (Tailwind only, no hex)**

| Column ID | Label | BG | Border | Title color | Modal header |
|---|---|---|---|---|---|
| `review` | XÉT DUYỆT ĐỀ CƯƠNG | `bg-blue-50/50` | `border-blue-200` | `text-blue-600` | `bg-blue-600` |
| `report` | BÁO CÁO TIẾN ĐỘ & GIÁM ĐỊNH | `bg-amber-50/50` | `border-amber-200` | `text-amber-600` | `bg-amber-500` |
| `pre_acceptance` | SẮP NGHIỆM THU | `bg-purple-50/50` | `border-purple-200` | `text-purple-600` | `bg-purple-600` |
| `completed` | HOÀN THÀNH | `bg-emerald-50/50` | `border-emerald-200` | `text-emerald-600` | `bg-emerald-600` |

```tsx
// ✅ Config object — single source of truth (OCP-compliant)
export const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'review',
    label: 'XÉT DUYỆT ĐỀ CƯƠNG',
    theme: {
      bg:          'bg-blue-50/50',
      border:      'border-blue-200',
      title:       'text-blue-600',
      badgeBorder: 'border-blue-100',
      dashedBtn:   'border-blue-200 text-blue-400',
      hoverBtn:    'hover:bg-blue-50',
      modalHeader: 'bg-blue-600',
    }
  },
  {
    id: 'report',
    label: 'BÁO CÁO TIẾN ĐỘ & GIÁM ĐỊNH',
    theme: {
      bg:          'bg-amber-50/50',
      border:      'border-amber-200',
      title:       'text-amber-600',
      badgeBorder: 'border-amber-100',
      dashedBtn:   'border-amber-200 text-amber-400',
      hoverBtn:    'hover:bg-amber-50',
      modalHeader: 'bg-amber-500',
    }
  },
  {
    id: 'pre_acceptance',
    label: 'SẮP NGHIỆM THU',
    theme: {
      bg:          'bg-purple-50/50',
      border:      'border-purple-200',
      title:       'text-purple-600',
      badgeBorder: 'border-purple-100',
      dashedBtn:   'border-purple-200 text-purple-400',
      hoverBtn:    'hover:bg-purple-50',
      modalHeader: 'bg-purple-600',
    }
  },
  {
    id: 'completed',
    label: 'HOÀN THÀNH',
    theme: {
      bg:          'bg-emerald-50/50',
      border:      'border-emerald-200',
      title:       'text-emerald-600',
      badgeBorder: 'border-emerald-100',
      dashedBtn:   'border-emerald-200 text-emerald-400',
      hoverBtn:    'hover:bg-emerald-50',
      modalHeader: 'bg-emerald-600',
    }
  },
];
```

---

## 7. "TẠO TASK MỚI" Footer Button — Confirmed from Screenshot

**Confirmed label:** `"+ TẠO TASK MỚI"` — the `+` is a **text SVG icon**, not a text character.

### 7.1 Default (collapsed) State

| Property | Value |
|---|---|
| **Width** | `w-full` |
| **Height** | `h-9` or `h-10` (~36–40px) |
| **Background** | Transparent or `bg-white/60` |
| **Border** | `border border-dashed` + column's `dashedBtn` border color |
| **Border-radius** | `rounded-xl` |
| **Text** | `"TẠO TASK MỚI"` |
| **Text size** | `text-[11px]` or `text-xs` |
| **Text weight** | `font-semibold` |
| **Text transform** | `uppercase` |
| **Text color** | Column's muted accent (e.g., `text-blue-400`) |
| **Icon** | `<PlusIcon className="w-3 h-3 mr-1.5" />` |
| **Display** | `flex items-center justify-center gap-1.5` |
| **Cursor** | `cursor-pointer` |
| **Hover** | `hover:bg-blue-50` (or column's `hoverBtn`) |
| **Transition** | `transition-colors duration-150` |
| **Margin top** | `mt-auto pt-3` — pushed to bottom via flex |

---

## 8. Inline Add Task Form — **Fully Confirmed from Screenshot**

This is the most important section newly confirmed by the screenshot. The form is visible inside the first column ("Xét duyệt đề cương") in an open/active state.

### 8.1 Form Container

| Property | Value |
|---|---|
| **Background** | `bg-white` — solid white, clearly elevated above column bg |
| **Border** | `border border-slate-200` |
| **Border-radius** | `rounded-2xl` (~16px) |
| **Padding** | `p-4` |
| **Shadow** | `shadow-sm` or `shadow-md` |
| **Animation** | `animate-slideUp` on open |
| **Width** | Full column interior width |
| **Position** | Replaces the "+ TẠO TASK MỚI" button — renders at the bottom of the column |

### 8.2 Form Fields — Confirmed from Screenshot

#### Field 1: TÊN ĐỀ TÀI (Required)

| Property | Value |
|---|---|
| **Label** | `"TÊN ĐỀ TÀI"` + `"*"` required indicator |
| **Label style** | `text-[10px] font-black uppercase tracking-widest text-slate-500` |
| **Required `*`** | `text-red-500` inline after label |
| **Input type** | `<textarea>` — multi-line (confirmed: taller input box in screenshot) |
| **Rows** | ~3 rows visible |
| **Placeholder** | None visible |
| **Border** | `border border-slate-200 rounded-xl` |
| **Background** | `bg-white` |
| **Padding** | `p-3` |
| **Font size** | `text-sm` |
| **Focus** | `focus:outline-none focus:ring-2 focus:ring-blue-200` |
| **Auto-focus** | `autoFocus` — textarea is focused on form open |
| **Resize** | `resize-none` |

#### Row 2: Two-column layout — CHỦ NHIỆM ĐỀ TÀI + KHOA/ĐƠN VỊ

Layout: `grid grid-cols-2 gap-2 mt-3`

**Left — CHỦ NHIỆM ĐỀ TÀI:**

| Property | Value |
|---|---|
| **Label** | `"CHỦ NHIỆM ĐỀ TÀI"` |
| **Label style** | `text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1` |
| **Input type** | `type="text"` |
| **Placeholder** | `"Chủ nhiệm..."` |
| **Border / radius** | `border border-slate-200 rounded-xl` |
| **Padding** | `px-3 py-2` |
| **Font size** | `text-sm` |

**Right — KHOA/ĐƠN VỊ:**

| Property | Value |
|---|---|
| **Label** | `"KHOA/ĐƠN VỊ"` |
| **Label style** | Same as above |
| **Input type** | `type="text"` |
| **Placeholder** | `"VD: Khoa Y..."` |
| **Border / radius** | Same as left |

#### Field 3: HẠN HOÀN THÀNH

| Property | Value |
|---|---|
| **Label** | `"HẠN HOÀN THÀNH"` |
| **Label style** | `text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 mt-3` |
| **Input type** | `type="date"` |
| **Value shown** | `"05/17/2026"` (native browser format — US locale) |
| **Display format** | **Must be `dd/mm/yyyy`** per canonical spec — use a custom date input or `input[type=date]` with locale override |
| **Width** | `w-full` |
| **Border** | `border border-slate-200 rounded-xl` |
| **Padding** | `px-3 py-2` |
| **Font size** | `text-sm` |
| **Calendar icon** | Native browser date picker icon — right-aligned (browser default) |

> **⚠️ Critical date format issue:** The native `<input type="date">` renders in the browser's locale, which shows `MM/DD/YYYY` in US environments. For `dd/mm/yyyy` display in Vietnamese context, use one of:
> 1. **Controlled input with a date picker library** (e.g., `react-datepicker` with `dateFormat="dd/MM/yyyy"`)
> 2. **CSS trick** with `input[type=date]` locale override (not reliable cross-browser)
> 3. **Three separate inputs** (day/month/year) with Vietnamese labels
>
> **Recommended:** `react-datepicker` with `locale="vi"` and `dateFormat="dd/MM/yyyy"`.

### 8.3 Form Action Buttons — Confirmed from Screenshot

Two buttons at the bottom: "Lưu Công việc" (primary) and "Đóng" (secondary), side by side.

**Layout:** `flex gap-2 mt-4`

#### "Lưu Công việc" Button (Primary)

| Property | Value |
|---|---|
| **Text** | `"Lưu Công việc"` |
| **Background** | `bg-blue-600` — solid vivid blue (confirmed from screenshot) |
| **Text color** | `text-white` |
| **Font size** | `text-sm` |
| **Font weight** | `font-semibold` |
| **Padding** | `px-4 py-2` |
| **Border-radius** | `rounded-xl` |
| **Width** | `flex-1` or fixed width |
| **Hover** | `hover:bg-blue-700` |
| **Disabled state** | `disabled:opacity-50 disabled:cursor-not-allowed` when title is empty |

#### "Đóng" Button (Secondary)

| Property | Value |
|---|---|
| **Text** | `"Đóng"` |
| **Background** | `bg-transparent` or `bg-white` |
| **Text color** | `text-slate-500` |
| **Font size** | `text-sm` |
| **Font weight** | `font-medium` |
| **Padding** | `px-4 py-2` |
| **Border-radius** | `rounded-xl` |
| **Border** | `border border-slate-200` |
| **Hover** | `hover:bg-slate-50` |
| **Action** | Closes form, restores "+ TẠO TASK MỚI" button |

### 8.4 Form State Management

```tsx
// ✅ All form state lives in <AddTaskForm>, NOT in the parent
function AddTaskForm({ columnId, onSave, onClose }: AddTaskFormProps) {
  const [title, setTitle]   = useState('');
  const [owner, setOwner]   = useState('');
  const [unit, setUnit]     = useState('');
  const [dueDate, setDueDate] = useState('');

  const isValid = title.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    await onSave({ columnId, title, owner, unit, dueDate });
    onClose();
  };

  return ( /* form JSX */ );
}
```

### 8.5 Column State: Button → Form Toggle

```tsx
// Per-column toggle: which column has the form open
// Only ONE column can have the form open at a time

// In parent KanbanBoard or ProgressTracking:
const [addingToColumn, setAddingToColumn] = useState<ColumnId | null>(null);

// Column footer renders:
{addingToColumn === column.id
  ? <AddTaskForm
      columnId={column.id}
      onSave={handleSaveTask}
      onClose={() => setAddingToColumn(null)}
    />
  : <AddTaskButton
      onClick={() => setAddingToColumn(column.id)}
      theme={column.theme}
    />
}
```

---

## 9. Task Card Design (Populated State)

> Columns show `0` tasks in this screenshot but the component description and audit confirm the full card design.

### 9.1 Card Container

| Property | Tailwind |
|---|---|
| Background | `bg-white` |
| Border | `border border-slate-200` |
| Border-radius | `rounded-2xl` |
| Padding | `p-4` |
| Margin bottom | `mb-2` |
| Shadow | `shadow-sm` |
| Hover shadow | `hover:shadow-xl` |
| Hover translate | `hover:-translate-y-1` |
| Transition | `transition-all duration-200` |
| Cursor | `cursor-grab` (idle), `cursor-grabbing` (dragging) |
| Draggable | `draggable={true}` |

### 9.2 Card Layout (top → bottom)

```
┌──────────────────────────────────────────┐
│  [PRIORITY BADGE]       [end date + icon]│  ← row 1: badge + date
│                                          │
│  Project Title (clickable → modal)       │  ← row 2: title
│                                          │
│  [tag] [tag] [tag]                       │  ← row 3: category tags
│                                          │
│  ┌─ bg-slate-50/50 ───────────────────┐  │
│  │  Bắt đầu: dd/mm/yyyy              │  │  ← row 4: date box
│  │  Kết thúc: dd/mm/yyyy             │  │
│  └───────────────────────────────────┘  │
│                                          │
│  [KHOA TAG]        [👤 Chủ nhiệm]       │  ← row 5: unit + owner
│                                          │
│  "Note text here..."                     │  ← row 6: note (italic, bg-white)
└──────────────────────────────────────────┘
```

### 9.3 Priority Badge

| Badge | Tailwind classes |
|---|---|
| **KHẨN** | `bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full` |
| **THƯỜNG** | `bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full` |

> **⚠️ Audit correction:** Previous analysis inferred solid red/amber backgrounds. Canonical values from component: `bg-red-50` (near-white tint), NOT `bg-red-500`.

### 9.4 End Date Display

| Property | Value |
|---|---|
| **Icon** | Calendar SVG, `w-3 h-3`, `text-slate-400` |
| **Format** | `dd/mm/yyyy` ← canonical per this document |
| **Text size** | `text-xs` |
| **Color** | `text-slate-400` |
| **Position** | Top-right of card, flex row |

### 9.5 Project Title

| Property | Value |
|---|---|
| **Font size** | `text-sm` |
| **Font weight** | `font-semibold` |
| **Color** | `text-slate-800` |
| **Hover color** | `hover:text-blue-600` |
| **Cursor** | `cursor-pointer` |
| **Action** | Opens `<TaskDetailModal>` with this task |
| **Line clamp** | `line-clamp-2` |

### 9.6 Category Tags

| Property | Value |
|---|---|
| **Background** | `bg-slate-100` |
| **Text** | `text-[9px] uppercase font-semibold text-slate-500` |
| **Padding** | `px-1.5 py-0.5` |
| **Border-radius** | `rounded` |
| **Gap** | `gap-1 flex-wrap` |

### 9.7 Date Box (Start + End)

| Property | Value |
|---|---|
| **Container** | `bg-slate-50/50 rounded-xl p-2.5 mt-2` |
| **Font size** | `text-xs` |
| **Label** | `"Bắt đầu:"` / `"Kết thúc:"` — `text-slate-400` |
| **Value** | `dd/mm/yyyy` — `text-slate-600 font-medium` |

### 9.8 Department Tag (Dynamic Hash Color)

| Property | Value |
|---|---|
| **Background** | Computed from `getTagColor(unit)` — one of 6 preset colors |
| **Text size** | `text-[9px] uppercase font-black tracking-widest` |
| **Padding** | `px-2 py-1` |
| **Border-radius** | `rounded-full` |

**Hash color logic (6 fixed colors, picked by hash of string):**
```tsx
// src/utils/colorHash.ts
const TAG_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-indigo-100 text-indigo-700',
];

export function getTagColor(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}
```

### 9.9 Owner Row

| Property | Value |
|---|---|
| **Avatar** | Circle, `w-5 h-5`, background from same hash color, first letter of name |
| **Avatar font** | `text-[10px] font-bold text-white` |
| **Name text** | `text-xs text-slate-500` |
| **Layout** | `flex items-center gap-1.5` |

### 9.10 Note

| Property | Value |
|---|---|
| **Container** | `bg-white rounded-xl p-2 mt-2 border border-slate-100` |
| **Text** | `text-xs italic text-slate-500 line-clamp-2` |

---

## 10. Task Detail Modal

### 10.1 Overlay

| Property | Value |
|---|---|
| **Position** | `fixed inset-0` |
| **Background** | `bg-slate-900/40` |
| **Backdrop** | `backdrop-blur-sm` |
| **Z-index** | `z-50` |
| **Click outside** | Closes modal |

### 10.2 Modal Container

| Property | Value |
|---|---|
| **Max-width** | `max-w-lg w-full` |
| **Border-radius** | `rounded-[40px]` ← distinctive, confirmed in component spec |
| **Background** | `bg-white` |
| **Shadow** | `shadow-2xl` |
| **Animation** | `animate-slideUp` |
| **Overflow** | `overflow-hidden` |
| **Position** | `mx-auto my-auto` (centered) |

### 10.3 Modal Header (Color = Column status color)

| Property | Value |
|---|---|
| **Background** | `bg-blue-600` / `bg-amber-500` / `bg-purple-600` / `bg-emerald-600` — per task status |
| **Padding** | `p-6` |
| **Meta badge** | `bg-white/20 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full` |
| **Meta badge text** | `"Chi tiết Công việc"` |
| **Bottom border** | Dashed separator: `border-b border-dashed border-white/30` |
| **Close button** | `×` icon, `bg-white/20 rounded-full w-8 h-8`, top-right corner |

### 10.4 Modal Body

**Two-column grid:** `grid grid-cols-2 gap-4 p-6`

| Cell | Label | Content |
|---|---|---|
| 1 | CHỦ NHIỆM | Avatar circle + name text |
| 2 | THỜI HẠN | Calendar icon + `dd/mm/yyyy` |
| 3 | TRẠNG THÁI | Colored status badge |
| 4 | KHOA/ĐƠN VỊ | Hash-colored department tag |
| 5 (full width) | TIẾN ĐỘ HẠN | Badge: Đúng hạn (green) / Trễ hạn (red) / Gia hạn (amber) |

**Label style:** `text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1`

**Note section (full width):**
```
bg-slate-50 p-6 rounded-3xl
text-sm italic text-slate-600
```

### 10.5 Modal Footer

| Property | Value |
|---|---|
| **Padding** | `px-6 pb-6 flex justify-end` |
| **Button text** | `"ĐÓNG CHI TIẾT"` |
| **Background** | `bg-slate-900` |
| **Text color** | `text-white` |
| **Font** | `text-[10px] font-black uppercase tracking-widest` |
| **Padding** | `px-6 py-3` |
| **Border-radius** | `rounded-full` |

---

## 11. Drag-and-Drop Specification

### 11.1 Confirmed Implementation: Native HTML5 DnD

From the component description, native DnD is used (not `@dnd-kit`). This is the canonical choice for this codebase.

```tsx
// ✅ Native DnD — matches existing component
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceColumn', task.columnId);
  }}
  className="cursor-grab active:cursor-grabbing"
>
```

```tsx
// Column drop zone
<div
  onDragOver={(e) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-blue-300'); // visual feedback
  }}
  onDragLeave={(e) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-300');
  }}
  onDrop={(e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-300');
    const taskId = e.dataTransfer.getData('taskId');
    handleMoveTask(taskId, column.id);
  }}
>
```

### 11.2 Optimistic Update Pattern (required for CRUD compliance)

```tsx
const handleMoveTask = async (taskId: string, targetColumnId: ColumnId) => {
  const originalColumnId = tasks.find(t => t.id === taskId)?.columnId;

  // 1. Optimistic UI update
  setTasks(prev => prev.map(t =>
    t.id === taskId ? { ...t, columnId: targetColumnId } : t
  ));

  try {
    // 2. Persist to API
    await updateProjectWorkflowStep(taskId, columnToStep[targetColumnId]);
  } catch {
    // 3. Rollback
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, columnId: originalColumnId! } : t
    ));
  }
};
```

---

## 12. Custom Tailwind Configuration Required

These must be added before any Cursor-generated code will work correctly:

### 12.1 Custom Animations (`tailwind.config.js`)

```js
module.exports = {
  theme: {
    extend: {
      animation: {
        fadeIn:  'fadeIn 0.3s ease-out both',
        slideUp: 'slideUp 0.25s ease-out both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
};
```

### 12.2 `no-scrollbar` Utility (`index.css`)

```css
@layer utilities {
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

### 12.3 Safelist for Dynamic Column Classes

Because column Tailwind classes are looked up from a config object at runtime, add them to the safelist to prevent purging:

```js
// tailwind.config.js
safelist: [
  'bg-blue-50/50',   'border-blue-200',   'text-blue-600',   'bg-blue-600',
  'bg-amber-50/50',  'border-amber-200',  'text-amber-600',  'bg-amber-500',
  'bg-purple-50/50', 'border-purple-200', 'text-purple-600', 'bg-purple-600',
  'bg-emerald-50/50','border-emerald-200','text-emerald-600','bg-emerald-600',
  'hover:bg-blue-50','hover:bg-amber-50', 'hover:bg-purple-50','hover:bg-emerald-50',
],
```

---

## 13. Date Format — Canonical Rules

| Context | Format | Implementation |
|---|---|---|
| Task card end date | `dd/mm/yyyy` | `formatDate(raw)` util |
| Date box (start/end) | `dd/mm/yyyy` | `formatDate(raw)` util |
| Modal deadline | `dd/mm/yyyy` | `formatDate(raw)` util |
| Add task form date input | `dd/mm/yyyy` display | `react-datepicker` with `dateFormat="dd/MM/yyyy"` |
| Notification panel dates | `"dd thg M, yyyy"` (Vietnamese locale) | `toLocaleDateString('vi-VN', {...})` |

```tsx
// src/utils/dateFormat.ts
export function formatDate(raw: string | number): string {
  // Handle Excel serial date number
  if (typeof raw === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + raw * 86400000);
    return toDDMMYYYY(date);
  }
  // Handle DD/MM/YYYY (already correct format)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  // Handle YYYY-MM-DD (ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-');
    return `${d}/${m}/${y}`;
  }
  return raw; // fallback
}

function toDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}
```

---

## 14. Recommended Component File Structure

```
src/
├── components/
│   └── ProgressTracking/
│       ├── index.tsx                         # Re-export
│       ├── ProgressTracking.tsx              # View mode state only (SRP)
│       ├── NotificationPanel/
│       │   ├── NotificationPanel.tsx
│       │   └── NotificationItem.tsx
│       ├── KanbanBoard/
│       │   ├── KanbanBoard.tsx               # Grid + DnD context
│       │   ├── KanbanColumn.tsx              # Column shell
│       │   ├── TaskCard.tsx                  # Draggable card
│       │   └── AddTaskForm.tsx               # Inline form (owns state)
│       ├── CalendarView/
│       │   ├── CalendarView.tsx
│       │   └── CalendarDay.tsx
│       └── TaskDetailModal/
│           └── TaskDetailModal.tsx
│
├── config/
│   └── kanbanColumns.ts                      # KANBAN_COLUMNS (OCP)
│
├── domain/
│   └── project/
│       ├── kanbanStatus.ts                   # getProjectKanbanStatus()
│       └── projectToKanbanTask.ts            # Mapper
│
├── hooks/
│   ├── useKanbanTasks.ts
│   └── useProjectNotifications.ts
│
└── utils/
    ├── colorHash.ts                          # getTagColor()
    └── dateFormat.ts                         # formatDate()
```

---

## 15. Issue Resolution Summary

| # | Issue | Previous spec | Confirmed value | Source |
|---|---|---|---|---|
| 1 | Add task button text | "TAO TASK MỚI" | **"TẠO TASK MỚI"** | Screenshot + audit |
| 2 | Toggle active text color | `#111827` (black) | **`text-blue-600`** | Screenshot confirmed blue |
| 3 | Toggle container style | White with border | **`bg-slate-200/50 rounded-2xl`** | Component spec |
| 4 | Column border width | 1.5–2px | **1px (`border`)** | Screenshot + audit |
| 5 | Column BG notation | Hex `#eff6ff` | **`bg-blue-50/50`** (Tailwind opacity) | Audit |
| 6 | Priority badge BG | Solid red/amber | **`bg-red-50` / `bg-amber-50`** (tints) | Audit |
| 7 | Notification panel | Not in previous analysis | **Fully documented** (Section 3) | Screenshot |
| 8 | Modal border-radius | ~12–14px | **`rounded-[40px]`** | Component spec |
| 9 | DnD library | @dnd-kit recommended | **Native HTML5 DnD** (existing code) | Audit |
| 10 | Date format (forms) | Not specified | **`dd/mm/yyyy`** via react-datepicker | Canonical spec |
| 11 | Date format (notifications) | Not specified | **Vietnamese locale `thg`** format | Screenshot |
| 12 | Form input date shown | `05/17/2026` (US locale) | **Must render `dd/mm/yyyy`** | Screenshot + canonical |
| 13 | Textarea vs input | Not specified | **`<textarea>`** (confirmed tall box) | Screenshot |
| 14 | Save button color | Not specified | **`bg-blue-600` solid blue** | Screenshot |
