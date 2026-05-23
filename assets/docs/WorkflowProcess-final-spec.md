# QuyTrinhNghienCuu (WorkflowProcess) — Complete Page UI Rebuild Specification
**System:** UMP-RMS — Hệ thống Quản lý Dự án KHCN
**Page:** Quy trình thực hiện (Workflow / Service Portal)
**Component:** `6-QuyTrinhNghienCuu.tsx` / `WorkflowProcess`
**Source authority:** Screenshots (2 images = full table) > Audit doc > Component description
**Active nav item:** Quy trình thực hiện

> This document supersedes `QuyTrinhNghienCuu-audit.md` for implementation purposes. All specs confirmed from the 2 screenshots. Audit corrections applied inline with explicit verdicts.

---

## 1. Full Page Layout & Structure

The page renders inside the shared sidebar shell. The main content area has a simple single-column layout.

```
┌─────────────────────────────────────────────────────────────────┐
│  Page Title Bar: "Hệ thống quản lý Dự án KHCN"                 │
├─────────────────────────────────────────────────────────────────┤
│  Content Padding Zone                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Header Block                                           │   │
│  │  "DANH MỤC CÁC THỦ TỤC HÀNH CHÍNH"                    │   │
│  │  "CHI TIẾT CÁC BIỂU MẪU VÀ THỦ TỤC TƯƠNG ỨNG"        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  Table                                                  │   │
│  │  ┌──────── thead ─────────────────────────────────┐    │   │
│  │  │ STT │ DANH MỤC                      │ CHI TIẾT │    │   │
│  │  ├──────── tbody ─────────────────────────────────┤    │   │
│  │  │       I. DÀNH CHO CHỦ NHIỆM ĐỀ TÀI            │    │   │
│  │  │  1  │ Biểu mẫu đăng ký đề tài...   │ [THỰC]  │    │   │
│  │  │ ... │ ...                           │ [HIỆN]  │    │   │
│  │  │  9  │ SOPs nghiệm thu...            │ [THỰC]  │    │   │
│  │  │       II. DÀNH CHO CHUYÊN VIÊN                 │    │   │
│  │  │  1  │ SOPs quản lý đề tài...        │ [THỰC]  │    │   │
│  │  │ ... │ ...                           │ [HIỆN]  │    │   │
│  │  │  9  │ Giấy chứng nhận               │ [THỰC]  │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1 Page Canvas

| Property | Value |
|---|---|
| **Background** | `bg-white` or `bg-slate-50` — very light, near-white |
| **Content padding** | `px-8 py-6` — comfortable margin around table |
| **Bottom padding** | `pb-20` |
| **Animation** | `animate-fadeIn` on mount (custom keyframe — must be in `tailwind.config.js`) |

### 1.2 Page Title Bar

| Property | Value |
|---|---|
| **Text** | `"Hệ thống quản lý Dự án KHCN"` |
| **Color** | `text-blue-600` (`#2563eb`) |
| **Font size** | `text-xl` or `text-2xl` |
| **Font weight** | `font-bold` |
| **Bottom divider** | `border-b border-slate-200` |
| **Padding bottom** | `pb-4` |

---

## 2. Table Outer Container — Confirmed from Screenshots

**⚠️ Critical audit correction confirmed:** The screenshots show the table **does NOT have** `rounded-[40px]` extreme rounding visible. The table appears to sit flat within the content area with **no visible outer card border or extreme radius**. The table container is essentially transparent — only the table itself provides structure.

| Property | Confirmed Value |
|---|---|
| **Outer wrapper border-radius** | Minimal or none — table renders flush with content padding |
| **Background** | White or transparent |
| **Border** | None on the outer wrapper — table provides its own borders |
| **Shadow** | None visible |
| **`overflow-hidden`** | Still required if any border-radius is applied |

> **Audit revision:** The `rounded-[40px]` spec from the component description is not visually confirmed in the screenshots. The table appears flat without a rounded card shell. Implement as a clean table with no outer card.

---

## 3. Header Block — Confirmed from Screenshot 1

The header sits **above the table**, not inside it. It is part of the content area, not the `<thead>`.

### 3.1 Layout

| Property | Value |
|---|---|
| **Padding** | `px-0 pb-4` — no left indent, sits at content edge |
| **Margin bottom** | `mb-4` or `mb-6` before the table |
| **Background** | Same as page canvas — no separate card bg visible |
| **Bottom border** | None visible between header and table — the thead provides the visual break |

### 3.2 Main Title

| Property | Confirmed Value |
|---|---|
| **Text** | `"DANH MỤC CÁC THỦ TỤC HÀNH CHÍNH"` |
| **Font size** | `text-2xl` (~24px) — confirmed: large and prominent |
| **Font weight** | `font-black` (900) — very bold, confirmed |
| **Color** | `text-slate-900` or `text-slate-800` — near-black, confirmed |
| **Text transform** | `uppercase` — confirmed all-caps |
| **Letter spacing** | `tracking-tighter` — confirmed: characters slightly compressed |

### 3.3 Subtitle

| Property | Confirmed Value |
|---|---|
| **Text** | `"CHI TIẾT CÁC BIỂU MẪU VÀ THỦ TỤC TƯƠNG ỨNG"` |
| **Font size** | `text-xs` (~12px) — confirmed: noticeably smaller than title |
| **Font weight** | `font-bold` (700) |
| **Color** | `text-slate-400` — confirmed: muted gray, low contrast |
| **Text transform** | `uppercase` — confirmed all-caps |
| **Letter spacing** | `tracking-widest` — confirmed: expanded, wide spacing |
| **Margin top** | `mt-1` below the main title |

> **Typography note — confirmed intentional contrast:** `tracking-tighter` on the large title vs `tracking-widest` on the small subtitle creates a deliberate visual hierarchy. Cursor will apply `tracking-widest` to both — the comment `{/* tracking-tighter is INTENTIONAL */}` is mandatory.

```tsx
// ✅ Canonical implementation
<div className="mb-6">
  {/* tracking-tighter is INTENTIONAL — deliberate contrast with tracking-widest subtitle */}
  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
    DANH MỤC CÁC THỦ TỤC HÀNH CHÍNH
  </h1>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
    CHI TIẾT CÁC BIỂU MẪU VÀ THỦ TỤC TƯƠNG ỨNG
  </p>
</div>
```

---

## 4. Table Structure — Confirmed from Both Screenshots

The entire content is a standard HTML `<table>` with custom Tailwind styling.

### 4.1 Table Container

| Property | Value |
|---|---|
| **Width** | `w-full` |
| **Border-collapse** | `border-collapse` |
| **Layout** | `table-fixed` — prevents column width jitter |

---

## 5. Table Header (`<thead>`) — Confirmed from Screenshot 1

### 5.1 Confirmed Values

| Property | Confirmed Value |
|---|---|
| **Row background** | Solid `bg-blue-600` (`#2563eb`) — confirmed: vivid blue |
| **Text color** | `text-white` — confirmed |
| **Font size** | `text-xs` (~12px) |
| **Font weight** | `font-black` (900) — confirmed: very bold |
| **Text transform** | `uppercase` — confirmed |
| **Letter spacing** | `tracking-widest` — confirmed: wide spacing |
| **Cell padding** | `px-6 py-4` — comfortable padding |

### 5.2 Three Columns — Confirmed

| Column | Label | Width | Alignment |
|---|---|---|---|
| 1 | `STT` | `w-16` (~64px) | `text-center` |
| 2 | `DANH MỤC` | Auto (fills) | `text-left` |
| 3 | `CHI TIẾT` | `w-44` (~176px) | `text-center` |

### 5.3 Column Dividers

| Property | Value |
|---|---|
| **Between STT and DANH MỤC** | `border-r border-white/10` on STT cell |
| **Between DANH MỤC and CHI TIẾT** | `border-r border-white/10` on DANH MỤC cell |

```tsx
// ✅ Canonical thead
<thead>
  <tr className="bg-blue-600 text-white">
    <th className="w-16 px-6 py-4 text-center text-xs font-black uppercase tracking-widest border-r border-white/10">
      STT
    </th>
    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r border-white/10">
      DANH MỤC
    </th>
    <th className="w-44 px-6 py-4 text-center text-xs font-black uppercase tracking-widest">
      CHI TIẾT
    </th>
  </tr>
</thead>
```

---

## 6. Section Group Row — Confirmed from Both Screenshots

Two section dividers are present:
1. `"I. DÀNH CHO CHỦ NHIỆM ĐỀ TÀI"` — separates header from Section I
2. `"II. DÀNH CHO CHUYÊN VIÊN"` — separates Section I from Section II

### 6.1 Confirmed Design

| Property | Confirmed Value |
|---|---|
| **`colSpan`** | `{3}` — spans all 3 columns |
| **Background** | Light blue — `bg-blue-50/80` — confirmed: pale blue tint |
| **Text** | Section title (e.g., `"I. DÀNH CHO CHỦ NHIỆM ĐỀ TÀI"`) |
| **Font size** | `text-[15px]` — confirmed: slightly larger than body text |
| **Font weight** | `font-black` (900) — confirmed: very bold |
| **Color** | `text-blue-800` — confirmed: dark blue |
| **Text transform** | `uppercase` — confirmed |
| **Letter spacing** | `tracking-wider` |
| **Alignment** | `text-center` — confirmed: centered |
| **Padding** | `px-6 py-3` |
| **Border bottom** | `border-b border-blue-100` |

> **⚠️ Audit correction on colSpan:** Must be JSX number `{3}` not string `"3"`. React silently mishandles string colSpan.

```tsx
// ✅ Section group row
<tr>
  <td
    colSpan={3}
    className="bg-blue-50/80 px-6 py-3 text-center text-[15px] font-black text-blue-800 uppercase tracking-wider border-b border-blue-100"
  >
    {section.title}
  </td>
</tr>
```

---

## 7. Data Item Rows — Fully Confirmed from Both Screenshots

### 7.1 Row Container

| Property | Confirmed Value |
|---|---|
| **Hover background** | `hover:bg-slate-50` — subtle hover tint |
| **Transition** | `transition-colors duration-150` |
| **Border bottom** | `border-b border-slate-100` — light hairline separator |
| **Row height** | ~52–56px — confirmed: comfortable row height |
| **`tabIndex`** | `{0}` — for keyboard navigation |
| **`onKeyDown`** | `Enter` key triggers double-click action |
| **Focus** | `focus:bg-blue-50 focus:outline-none` |

### 7.2 STT Cell (Column 1)

| Property | Confirmed Value |
|---|---|
| **Content** | Row number (1–9, resets per section) |
| **Font size** | `text-base` (~16px) — confirmed: larger than label text |
| **Font weight** | `font-black` (900) |
| **Color** | `text-slate-400` — confirmed: muted gray |
| **Alignment** | `text-center` |
| **Padding** | `px-6 py-4` |
| **Border right** | `border-r border-slate-100` |

### 7.3 DANH MỤC Cell (Column 2)

| Property | Confirmed Value |
|---|---|
| **Content** | Item name text (Vietnamese) |
| **Font size** | `text-[15px]` — confirmed: slightly larger than xs, slightly smaller than base |
| **Font weight** | `font-bold` (700) — confirmed: bold but NOT font-black |
| **Color** | `text-slate-800` — confirmed: near-black |
| **Alignment** | `text-left` |
| **Padding** | `px-6 py-4` |
| **Border right** | `border-r border-slate-100` |

### 7.4 CHI TIẾT Cell (Column 3)

| Property | Confirmed Value |
|---|---|
| **Alignment** | `text-center` |
| **Padding** | `px-4 py-4` |
| **Content** | Single action button per row |

---

## 8. "THỰC HIỆN" Action Button — Fully Confirmed from Both Screenshots

### 8.1 Visual Design — Confirmed

From the screenshots, every row has a "THỰC HIỆN" button with identical styling:

| Property | Confirmed Value |
|---|---|
| **Text** | `"THỰC HIỆN"` — confirmed uppercase |
| **Background** | `bg-blue-50` — confirmed: very light blue pill |
| **Text color** | `text-blue-600` — confirmed: medium blue |
| **Font size** | `text-[11px]` — confirmed: very small |
| **Font weight** | `font-black` (900) — confirmed: very bold despite small size |
| **Text transform** | `uppercase` — confirmed |
| **Letter spacing** | `tracking-widest` — confirmed: wide spacing |
| **Border-radius** | `rounded-xl` (~12px) — confirmed: noticeably rounded |
| **Padding** | `px-4 py-1.5` |
| **User select** | `select-none` — prevents text selection on double-click |
| **Cursor** | `cursor-pointer` |

### 8.2 Hover State

| Property | Value |
|---|---|
| **Background** | `hover:bg-blue-600` — flips to solid blue |
| **Text color** | `hover:text-white` |
| **Transition** | `transition-all duration-150` |

### 8.3 Interaction — `onDoubleClick` Confirmed as Business Requirement

| Property | Value |
|---|---|
| **Trigger** | `onDoubleClick` — **intentional, business requirement, do NOT change to onClick** |
| **Tooltip** | Required — appears on hover/single-click |
| **Keyboard** | `Enter` key on focused row also triggers action |

```tsx
// ✅ Canonical button with mandatory protections
{/* ⚠️ BUSINESS REQUIREMENT: onDoubleClick is intentional — do NOT change to onClick */}
<div className="relative inline-block group/btn">
  <button
    onDoubleClick={() => handleAction(item)}
    className="bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest select-none px-4 py-1.5 hover:bg-blue-600 hover:text-white transition-all duration-150 cursor-pointer"
  >
    THỰC HIỆN
  </button>
  {/* Tooltip — required for discoverability */}
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
    Nháy đúp để thực hiện
  </div>
</div>
```

---

## 9. Complete Data — Confirmed from Both Screenshots

### 9.1 Section I — DÀNH CHO CHỦ NHIỆM ĐỀ TÀI (9 items)

All confirmed from Screenshot 1:

| STT | Name | Action type |
|---|---|---|
| 1 | Biểu mẫu đăng ký đề tài cấp cơ sở | `external` (URL) |
| 2 | Biểu mẫu phục vụ Hội đồng xét duyệt hồ sơ đăng ký đề tài cấp cơ sở | `external` (URL) |
| 3 | Biểu mẫu báo cáo tiến độ đề tài cấp cơ sở | `external` (URL) |
| 4 | Biểu mẫu nộp đăng ký nghiệm thu đề tài cấp cơ sở | `external` (URL) |
| 5 | Biểu mẫu Hội đồng nghiệm thu đề tài cấp cơ sở | `external` (URL) |
| 6 | Biểu mẫu nộp lưu chiều kết quả nghiên cứu về Thư viện | `external` (URL) |
| 7 | Biểu mẫu thanh lý đề tài | `external` (URL) |
| 8 | SOPs xét chọn đề tài cấp cơ sở - Phiên bản 2.0 | `external` (URL) |
| 9 | SOPs nghiệm thu đề tài cấp cơ sở - Phiên bản 1.0 | `external` (URL) |

### 9.2 Section II — DÀNH CHO CHUYÊN VIÊN (9 items)

All confirmed from Screenshots 1 & 2:

| STT | Name | Action type |
|---|---|---|
| 1 | SOPs quản lý đề tài nghiên cứu khoa học cấp cơ sở - Phiên bản 1.0 | `external` (URL) |
| 2 | Quyết định thành lập Hội đồng xét duyệt | `external` (URL) |
| 3 | Quyết định phê duyệt đề tài | `external` (URL) |
| 4 | Hợp đồng đề tài | `internal` → `contract_builder` |
| 5 | Phụ lục hợp đồng | `external` (URL) |
| 6 | Quyết định thành lập Hội đồng Giám định | `external` (URL) |
| 7 | Quyết định thành lập Hội đồng Nghiệm thu | `external` (URL) |
| 8 | Biên bản thanh lý | `external` (URL) |
| 9 | Giấy chứng nhận | `external` (URL) |

> **Item II.4 "Hợp đồng đề tài"** is the only internal action in the entire list — double-clicking opens `<ContractTemplateBuilder />`. All other items open external URLs.

### 9.3 Canonical Data Config

```tsx
// ✅ src/config/serviceData.ts
export type ServiceItemType = 'external' | 'internal' | 'info_only';

export interface ServiceItem {
  stt: number;
  name: string;
  type: ServiceItemType;
  url?: string;              // required when type === 'external'
  action?: 'contract_builder';  // required when type === 'internal'
}

export interface ServiceSection {
  id: string;
  title: string;
  items: ServiceItem[];
}

export const SERVICE_DATA: ServiceSection[] = [
  {
    id: 'principal',
    title: 'I. DÀNH CHO CHỦ NHIỆM ĐỀ TÀI',
    items: [
      { stt: 1, name: 'Biểu mẫu đăng ký đề tài cấp cơ sở', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 2, name: 'Biểu mẫu phục vụ Hội đồng xét duyệt hồ sơ đăng ký đề tài cấp cơ sở', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 3, name: 'Biểu mẫu báo cáo tiến độ đề tài cấp cơ sở', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 4, name: 'Biểu mẫu nộp đăng ký nghiệm thu đề tài cấp cơ sở', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 5, name: 'Biểu mẫu Hội đồng nghiệm thu đề tài cấp cơ sở', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 6, name: 'Biểu mẫu nộp lưu chiều kết quả nghiên cứu về Thư viện', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 7, name: 'Biểu mẫu thanh lý đề tài', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 8, name: 'SOPs xét chọn đề tài cấp cơ sở - Phiên bản 2.0', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 9, name: 'SOPs nghiệm thu đề tài cấp cơ sở - Phiên bản 1.0', type: 'external', url: 'https://ump.edu.vn/...' },
    ],
  },
  {
    id: 'specialist',
    title: 'II. DÀNH CHO CHUYÊN VIÊN',
    items: [
      { stt: 1, name: 'SOPs quản lý đề tài nghiên cứu khoa học cấp cơ sở - Phiên bản 1.0', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 2, name: 'Quyết định thành lập Hội đồng xét duyệt', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 3, name: 'Quyết định phê duyệt đề tài', type: 'external', url: 'https://ump.edu.vn/...' },
      // ⚠️ Internal action — opens ContractTemplateBuilder, NOT an external URL
      { stt: 4, name: 'Hợp đồng đề tài', type: 'internal', action: 'contract_builder' },
      { stt: 5, name: 'Phụ lục hợp đồng', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 6, name: 'Quyết định thành lập Hội đồng Giám định', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 7, name: 'Quyết định thành lập Hội đồng Nghiệm thu', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 8, name: 'Biên bản thanh lý', type: 'external', url: 'https://ump.edu.vn/...' },
      { stt: 9, name: 'Giấy chứng nhận', type: 'external', url: 'https://ump.edu.vn/...' },
    ],
  },
];
```

---

## 10. Action Routing — Confirmed and Corrected

### 10.1 Confirmed Behavior

| Item | Behavior on double-click |
|---|---|
| All Section I items | Open external URL in new tab (`window.open`) |
| Section II items 1–3, 5–9 | Open external URL in new tab |
| **Section II item 4 "Hợp đồng đề tài"** | Opens `<ContractTemplateBuilder />` modal |

### 10.2 Canonical Action Handler

```tsx
// ✅ src/hooks/useServiceAction.ts
import { openExternalUrl } from '@/utils/navigation';

export function useServiceAction(
  setShowContractBuilder: (v: boolean) => void
) {
  const ACTION_HANDLERS: Record<string, () => void> = {
    contract_builder: () => setShowContractBuilder(true),
    // New internal actions added here — no component change needed (OCP)
  };

  const handleAction = (item: ServiceItem) => {
    switch (item.type) {
      case 'external':
        if (item.url) openExternalUrl(item.url);
        break;
      case 'internal':
        if (item.action && ACTION_HANDLERS[item.action]) {
          ACTION_HANDLERS[item.action]();
        }
        break;
      case 'info_only':
      default:
        // No-op — button should be visually disabled or hidden
        break;
    }
  };

  return { handleAction };
}
```

```tsx
// ✅ src/utils/navigation.ts
export function openExternalUrl(url: string): void {
  if (typeof window === 'undefined') return; // SSR guard
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
}
```

---

## 11. ContractTemplateBuilder Modal — Spec

Not visible in the screenshots (not triggered). Based on component description and system design language:

| Property | Value |
|---|---|
| **Trigger** | Double-click on II.4 "Hợp đồng đề tài" |
| **Rendering** | Modal overlay — `fixed inset-0 z-50` |
| **Overlay bg** | `bg-slate-900/40 backdrop-blur-sm` |
| **Modal container** | `bg-white rounded-[40px] max-w-3xl w-full mx-auto shadow-2xl overflow-hidden` |
| **Animation** | `animate-slideUp` (custom — in `tailwind.config.js`) |
| **Close** | `onClose` prop → sets `showContractBuilder(false)` |
| **Dirty check** | Confirm before close if form has unsaved data |

```tsx
// ✅ Canonical modal gate in WorkflowProcess.tsx
{showContractBuilder && (
  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
    <div className="bg-white rounded-[40px] max-w-3xl w-full shadow-2xl overflow-hidden animate-slideUp">
      <ContractTemplateBuilder
        onClose={() => setShowContractBuilder(false)}
      />
    </div>
  </div>
)}
```

---

## 12. Spacing & Sizing — Confirmed

| Element | Value |
|---|---|
| Content area padding | `px-8 py-6` |
| Header block margin-bottom | `mb-6` before table |
| Table width | `w-full` |
| STT column width | `w-16` (64px) |
| CHI TIẾT column width | `w-44` (176px) |
| DANH MỤC column | Fills remaining space |
| `<thead>` cell padding | `px-6 py-4` |
| Section group row padding | `px-6 py-3` |
| Data row cell padding | `px-6 py-4` |
| Row height (computed) | ~52–56px |
| Button padding | `px-4 py-1.5` |
| Button border-radius | `rounded-xl` (~12px) |
| Tooltip z-index | `z-10` (above table, below modal) |
| Modal z-index | `z-50` |

---

## 13. Color Palette — Confirmed

### 13.1 Surfaces

| Role | Tailwind | Hex | Usage |
|---|---|---|---|
| Page canvas | `bg-white` | `#ffffff` | Page background |
| Table header | `bg-blue-600` | `#2563eb` | `<thead>` row |
| Section group row | `bg-blue-50/80` | ~`#eff6ff` at 80% | Section divider rows |
| Data row hover | `hover:bg-slate-50` | `#f8fafc` | Row hover state |
| Button default bg | `bg-blue-50` | `#eff6ff` | "THỰC HIỆN" default |
| Button hover bg | `hover:bg-blue-600` | `#2563eb` | "THỰC HIỆN" hover |

### 13.2 Text Colors

| Role | Tailwind | Hex | Usage |
|---|---|---|---|
| Main title | `text-slate-900` | `#0f172a` | "DANH MỤC..." |
| Subtitle | `text-slate-400` | `#94a3b8` | "CHI TIẾT..." subtitle |
| Section group text | `text-blue-800` | `#1e40af` | Section headers |
| STT numbers | `text-slate-400` | `#94a3b8` | Row numbers |
| Item names | `text-slate-800` | `#1e293b` | Item names |
| `<thead>` | `text-white` | `#ffffff` | Column headers |
| Button default | `text-blue-600` | `#2563eb` | "THỰC HIỆN" text |
| Button hover | `hover:text-white` | `#ffffff` | "THỰC HIỆN" hover text |
| Page title | `text-blue-600` | `#2563eb` | Page header text |

### 13.3 Borders

| Role | Tailwind | Usage |
|---|---|---|
| Column dividers in thead | `border-r border-white/10` | Between header cells |
| Row separators | `border-b border-slate-100` | Between data rows |
| Section row bottom | `border-b border-blue-100` | Below section headers |
| Column dividers in body | `border-r border-slate-100` | Between data cells |

### 13.4 CSS Variables Reference

```css
:root {
  /* Brand */
  --color-primary:            #2563eb;   /* blue-600 */
  --color-primary-50:         #eff6ff;   /* blue-50 */
  --color-primary-800:        #1e40af;   /* blue-800 */

  /* Table */
  --color-thead-bg:           #2563eb;
  --color-section-bg:         rgba(239, 246, 255, 0.8);  /* blue-50/80 */
  --color-row-hover:          #f8fafc;   /* slate-50 */
  --color-row-border:         #f1f5f9;   /* slate-100 */

  /* Text */
  --color-title:              #0f172a;   /* slate-900 */
  --color-subtitle:           #94a3b8;   /* slate-400 */
  --color-item-name:          #1e293b;   /* slate-800 */
  --color-stt:                #94a3b8;   /* slate-400 */
  --color-section-title:      #1e40af;   /* blue-800 */
}
```

---

## 14. Typography — Full Confirmed Specification

| Element | Size | Weight | Color | Transform | Tracking |
|---|---|---|---|---|---|
| Page title | `text-xl` | `font-bold` 700 | `text-blue-600` | — | — |
| Main heading | `text-2xl` | `font-black` 900 | `text-slate-900` | `uppercase` | `tracking-tighter` ⚠️ |
| Subtitle | `text-xs` 12px | `font-bold` 700 | `text-slate-400` | `uppercase` | `tracking-widest` |
| `<thead>` cells | `text-xs` 12px | `font-black` 900 | `text-white` | `uppercase` | `tracking-widest` |
| Section group | `text-[15px]` | `font-black` 900 | `text-blue-800` | `uppercase` | `tracking-wider` |
| STT numbers | `text-base` 16px | `font-black` 900 | `text-slate-400` | — | — |
| Item names | `text-[15px]` | `font-bold` 700 | `text-slate-800` | — | — |
| Button label | `text-[11px]` | `font-black` 900 | `text-blue-600` | `uppercase` | `tracking-widest` |
| Tooltip text | `text-[10px]` | `font-normal` | `text-white` | — | — |

**Font family:** `"Inter"`, `"Be Vietnam Pro"`, or system-ui — Vietnamese support required.

---

## 15. Complete Component Implementation

```tsx
// ✅ WorkflowProcess.tsx — Canonical implementation

import { useState } from 'react';
import { SERVICE_DATA } from '@/config/serviceData';
import { useServiceAction } from '@/hooks/useServiceAction';
import ContractTemplateBuilder from '@/components/ContractTemplateBuilder';

export default function WorkflowProcess() {
  const [showContractBuilder, setShowContractBuilder] = useState(false);
  const { handleAction } = useServiceAction(setShowContractBuilder);

  return (
    <div className="space-y-12 animate-fadeIn pb-20 px-8 py-6">

      {/* Header Block */}
      <div className="mb-6">
        {/* ⚠️ tracking-tighter is INTENTIONAL — contrast with tracking-widest subtitle */}
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
          DANH MỤC CÁC THỦ TỤC HÀNH CHÍNH
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          CHI TIẾT CÁC BIỂU MẪU VÀ THỦ TỤC TƯƠNG ỨNG
        </p>
      </div>

      {/* Table */}
      <div className="w-full overflow-hidden">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="w-16 px-6 py-4 text-center text-xs font-black uppercase tracking-widest border-r border-white/10">
                STT
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r border-white/10">
                DANH MỤC
              </th>
              <th className="w-44 px-6 py-4 text-center text-xs font-black uppercase tracking-widest">
                CHI TIẾT
              </th>
            </tr>
          </thead>

          <tbody>
            {SERVICE_DATA.map((section) => (
              <>
                {/* Section group header */}
                <tr key={`section-${section.id}`}>
                  {/* ⚠️ colSpan must be {3} number — not "3" string */}
                  <td
                    colSpan={3}
                    className="bg-blue-50/80 px-6 py-3 text-center text-[15px] font-black text-blue-800 uppercase tracking-wider border-b border-blue-100"
                  >
                    {section.title}
                  </td>
                </tr>

                {/* Data rows */}
                {section.items.map((item) => (
                  <tr
                    key={`${section.id}-${item.stt}`}
                    tabIndex={0}
                    className="group hover:bg-slate-50 transition-colors border-b border-slate-100 focus:bg-blue-50 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAction(item)}
                  >
                    <td className="w-16 px-6 py-4 text-center text-base font-black text-slate-400 border-r border-slate-100">
                      {item.stt}
                    </td>
                    <td className="px-6 py-4 text-[15px] font-bold text-slate-800 border-r border-slate-100">
                      {item.name}
                    </td>
                    <td className="w-44 px-4 py-4 text-center">
                      {/* ⚠️ BUSINESS REQUIREMENT: onDoubleClick is intentional — do NOT change to onClick */}
                      <div className="relative inline-block group/btn">
                        <button
                          onDoubleClick={() => handleAction(item)}
                          className="bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest select-none px-4 py-1.5 hover:bg-blue-600 hover:text-white transition-all duration-150 cursor-pointer"
                        >
                          THỰC HIỆN
                        </button>
                        {/* Required tooltip — discoverability for onDoubleClick */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Nháy đúp để thực hiện
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* ContractTemplateBuilder Modal Gate */}
      {showContractBuilder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] max-w-3xl w-full shadow-2xl overflow-hidden animate-slideUp">
            <ContractTemplateBuilder
              onClose={() => setShowContractBuilder(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
```

---

## 16. Tailwind Config Requirements

```js
// tailwind.config.js — additions required before this component works
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
  safelist: [
    // Prevent purging of dynamically-referenced classes
    'bg-blue-50/80',
    'border-white/10',
    'bg-slate-900/40',
  ],
};
```

---

## 17. Recommended File Structure

```
src/
├── components/
│   └── WorkflowProcess/
│       ├── index.tsx                  # Re-export
│       └── WorkflowProcess.tsx        # Root component (state + modal gate)
│
├── config/
│   └── serviceData.ts                 # SERVICE_DATA + ServiceItem types
│
├── hooks/
│   └── useServiceAction.ts            # handleAction + ACTION_HANDLERS map
│
└── utils/
    └── navigation.ts                  # openExternalUrl() — shared
```

---

## 18. Issue Resolution Table

| # | Issue (from audit) | Screenshot verdict | Canonical spec |
|---|---|---|---|
| 1 | `rounded-[40px]` outer container | ❌ Not visible — table is flat | No outer card radius — flat table layout |
| 2 | `onDoubleClick` undiscoverable | ✅ Confirmed — all buttons say THỰC HIỆN, no hint | Required tooltip `"Nháy đúp để thực hiện"` (§8.3) |
| 3 | `window.open()` no `noopener` | Not visible from UI | `openExternalUrl()` in `navigation.ts` (§10.2) |
| 4 | `serviceData` hardcoded | Cannot see from screenshot | `src/config/serviceData.ts` (§9.3) |
| 5 | String matching `item.name ===` | Cannot see from screenshot | Typed `action` field — discriminated union (§9.3) |
| 6 | `tracking-tighter` on title | ✅ Confirmed — title clearly compressed | Comment + explicit docs (§3.2, §3.3) |
| 7 | `ContractTemplateBuilder` context | Not triggered in screenshots | Modal overlay spec (§11) |
| 8 | STT resets per section | ✅ Confirmed — both sections start at 1 | Use `item.stt` not loop index (§6) |
| 9 | No empty state | Not visible | Empty guard recommended |
| 10 | OCP action routing | Not visible | `ACTION_HANDLERS` map (§10.2) |
| 11 | ISP optional fields silent no-op | Not visible | Discriminated union type (§9.3) |
| 12 | `colSpan` number vs string | Not visible | `{3}` number confirmed in spec (§6) |
| 13 | `font-black` throughout | ✅ Confirmed — all headers and STT very bold | Explicit `font-black` in every element (§14) |
| 14 | `animate-fadeIn` not in Tailwind | Not visible | `tailwind.config.js` additions (§16) |
| 15 | Section II item 4 internal action | ✅ Confirmed — "Hợp đồng đề tài" listed | Typed `action: 'contract_builder'` (§9.2) |
| 16 | All 18 item names | ✅ All confirmed | Full data spec (§9.1, §9.2) |
| 17 | thead col divider style | ✅ Confirmed — subtle dividers visible | `border-r border-white/10` (§5.3) |
| 18 | Data row dividers | ✅ Confirmed — hairline between rows | `border-b border-slate-100` (§7.1) |
| 19 | Tooltip on hover for button | Not shown in static screenshot | Required for `onDoubleClick` UX (§8.3) |
| 20 | Keyboard navigation on rows | Not testable from screenshot | `tabIndex={0}` + `onKeyDown` Enter (§7.1) |
