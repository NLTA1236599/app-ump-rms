# NhapDuLieuMoi (DataEntry) — Complete Page UI Rebuild Specification
**System:** UMP-RMS — Hệ thống Quản lý Dự án KHCN
**Page:** Nhập dữ liệu mới (Data Entry)
**Component:** `5-NhapDuLieuMoi.tsx` / `DataEntry`
**Source authority:** Screenshots (3 images = full page) > Audit doc > Component description
**Date format canonical:** `dd/mm/yyyy` for all display; `YYYY-MM-DD` for internal storage only

> This document supersedes `NhapDuLieuMoi-audit.md` for implementation purposes. All specs are grounded in the 3 confirmed screenshots. Audit corrections are applied inline with explicit verdicts.

---

## 1. Full Page Layout & Structure

The page renders inside the shared sidebar shell. The main content area contains:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Page Title Bar: "Hệ thống quản lý Dự án KHCN"                     │
├─────────────────────────────────────────────────────────────────────┤
│  Form Container (white card, rounded-2xl, shadow-xl)                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Sticky Header: "Thêm mới Đề tài Nghiên cứu"  [Hủy] [LƯU]   │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  Section 1: HỢP ĐỒNG & GIẤY CHỨNG NHẬN                       │  │
│  │  Section 2: THÔNG TIN CHUNG & NHÂN SỰ                        │  │
│  │  Section 3: QUYẾT ĐỊNH                                       │  │
│  │  Section 4: KINH PHÍ (VNĐ)                                   │  │
│  │  Section 5: THỜI GIAN & TIẾN ĐỘ                              │  │
│  │  Section 6: KẾT QUẢ & TÌNH TRẠNG                             │  │
│  │  Section 7: SẢN PHẨM CHI TIẾT                                │  │
│  │  Section 8: THÔNG TIN KHÁC                                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.1 Page Canvas

| Property | Value |
|---|---|
| **Background** | `bg-slate-50` or `bg-gray-50` — light gray page canvas |
| **Content padding** | `px-6 py-6` |
| **Max width** | `max-w-7xl mx-auto` |
| **Bottom padding** | `pb-20` — extra space below form for sticky footer clearance |

### 1.2 Form Container

| Property | Value |
|---|---|
| **Background** | `bg-white` |
| **Border-radius** | `rounded-2xl` |
| **Border** | `border border-slate-200` |
| **Shadow** | `shadow-xl` |
| **Overflow** | `overflow-hidden` (so sticky header clips correctly) |

---

## 2. Sticky Form Header — Confirmed from Screenshot 1

The header is sticky at the top of the form container.

### 2.1 Container

| Property | Value |
|---|---|
| **Position** | `sticky top-0 z-30` |
| **Background** | `bg-white` |
| **Border-bottom** | `border-b border-slate-200` |
| **Padding** | `px-8 py-4` |
| **Display** | `flex justify-between items-center` |
| **Shadow** | `shadow-sm` (visible when scrolled past top) |

### 2.2 Form Title (Left)

| Property | Value |
|---|---|
| **Text** | `"Thêm mới Đề tài Nghiên cứu"` (Create mode) / `"Chỉnh sửa Đề tài"` (Edit mode) |
| **Font size** | `text-lg` or `text-xl` (~18–20px) |
| **Font weight** | `font-bold` (700) |
| **Color** | `text-slate-800` |

### 2.3 Action Buttons (Right)

**Layout:** `flex items-center gap-3`

#### "Hủy" Button

| Property | Value |
|---|---|
| **Text** | `"Hủy"` |
| **Background** | `bg-transparent` |
| **Text color** | `text-slate-500` |
| **Font size** | `text-sm` |
| **Font weight** | `font-medium` |
| **Padding** | `px-4 py-2` |
| **Border-radius** | `rounded-xl` |
| **Hover** | `hover:bg-slate-200` |
| **Transition** | `transition-colors duration-150` |
| **Action** | Calls `onCancel()` — with dirty-state guard if form has been edited |

#### "LƯU THAY ĐỔI" Button

| Property | Value |
|---|---|
| **Text** | `"LƯU THAY ĐỔI"` (uppercase) |
| **Background** | `bg-blue-600` |
| **Text color** | `text-white` |
| **Font size** | `text-sm` |
| **Font weight** | `font-bold` (700) |
| **Padding** | `px-6 py-2` |
| **Border-radius** | `rounded-xl` |
| **Shadow** | `shadow-lg shadow-blue-200` |
| **Hover** | `hover:bg-blue-700` |
| **Loading state** | `disabled:opacity-60 disabled:cursor-not-allowed` + text → `"Đang lưu..."` |

---

## 3. Shared Section Header Design

All 8 sections use an identical header style. Extract this as a shared `<SectionHeader>` component.

| Property | Value |
|---|---|
| **Text format** | `"N. SECTION TITLE"` — numbered, uppercase |
| **Font size** | `text-sm` |
| **Font weight** | `font-black` (900) |
| **Color** | `text-blue-600` (`#2563eb`) |
| **Text transform** | `uppercase` |
| **Letter spacing** | `tracking-widest` |
| **Bottom border** | `border-b border-blue-100` |
| **Padding bottom** | `pb-2` |
| **Margin bottom** | `mb-6` |
| **Margin top** | `mt-8` (between sections) |

```tsx
// ✅ Canonical implementation
function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2 mb-6">
      {number}. {title}
    </h3>
  );
}
```

---

## 4. Shared Field Design

All inputs, selects, and textareas share a common base style.

### 4.1 Field Label

| Property | Value |
|---|---|
| **Font size** | `text-xs` (~12px) — **critical: NOT `text-sm`** |
| **Font weight** | `font-medium` (500) |
| **Color** | `text-slate-600` |
| **Margin bottom** | `mb-1.5` |

### 4.2 Required Indicator

| Property | Value |
|---|---|
| **Character** | `*` |
| **Color** | `text-red-500` |
| **Position** | Inline after label text, `ml-0.5` |

### 4.3 Base Input Style

| Property | Value |
|---|---|
| **Border** | `border border-slate-200` |
| **Border-radius** | `rounded-lg` (~8px) |
| **Padding** | `px-3 py-2` |
| **Font size** | `text-xs` — **universal for this form** |
| **Background** | `bg-white` |
| **Color** | `text-slate-800` |
| **Width** | `w-full` |
| **Focus** | `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent` |
| **Transition** | `transition-colors duration-150` |

### 4.4 Inline Error State (below field)

| Property | Value |
|---|---|
| **Text** | Error message string |
| **Font size** | `text-[10px]` |
| **Color** | `text-red-500` |
| **Margin top** | `mt-1` |
| **Input border on error** | `border-red-400 focus:ring-red-200` |

---

## 5. Section 1 — HỢP ĐỒNG & GIẤY CHỨNG NHẬN

**Confirmed from Screenshot 1 (top of form).**

### 5.1 Layout

- **Main grid:** `grid grid-cols-4 gap-6` — 4 columns at desktop
- Left block: "Số hợp đồng" + "Ngày ký" spans ~2 columns
- Right block: "Giấy chứng nhận" box spans ~2 columns

### 5.2 "Số Hợp Đồng" Field

| Property | Value |
|---|---|
| **Label** | `"Số Hợp đồng"` + red `*` required |
| **Label font** | `text-xs font-medium text-slate-600` |
| **Input type** | `type="text"` |
| **Placeholder** | `"51/2023/HĐ-ĐHYD kỳ ngày 20/3/2023"` — example format |
| **Col span** | `col-span-2` — takes left half of grid |
| **Font weight** | `font-bold` inside input (value text is bold) |
| **Base style** | Full standard input style |

### 5.3 "Ngày Ký" Field

| Property | Value |
|---|---|
| **Label** | `"NGÀY KÝ:"` — uppercase, inline before input |
| **Label font** | `text-[10px] font-medium uppercase text-slate-500` |
| **Input type** | `type="date"` → replace with `react-datepicker` |
| **Display format** | `dd/mm/yyyy` |
| **Placeholder** | `"mm/dd/yyyy"` (browser default) → override to `"dd/mm/yyyy"` |
| **Layout** | Inline — label and input on same row |
| **Position** | Below "Số hợp đồng" input |

### 5.4 "Giấy Chứng Nhận Đăng Ký Kết Quả" Block

| Property | Value |
|---|---|
| **Container** | `bg-slate-50 p-3 rounded-lg border border-slate-200` |
| **Block label** | `"GIẤY CHỨNG NHẬN ĐĂNG KÝ KẾT QUẢ"` — tiny uppercase label above the 3 fields |
| **Label font** | `text-[10px] font-black uppercase tracking-widest text-slate-400` |
| **Layout** | `grid grid-cols-3 gap-2` inside the block |
| **Col span** | `col-span-2` in the outer grid |

#### Three sub-fields inside the block

| Field | Placeholder | Type |
|---|---|---|
| Số GCN | `"Số GCN"` | `type="text"` |
| Ngày cấp | `"mm/dd/yyyy"` → `dd/mm/yyyy` | `type="date"` |
| Nơi cấp | `"Nơi cấp"` | `type="text"` |

---

## 6. Section 2 — THÔNG TIN CHUNG & NHÂN SỰ

**Confirmed from Screenshot 1 (middle section).**

### 6.1 "Tên Đề Tài" Field

| Property | Value |
|---|---|
| **Label** | `"Tên đề tài"` + red `*` |
| **Input type** | `type="text"` (single line input, NOT textarea) |
| **Col span** | Full width — `col-span-4` |
| **Height** | Standard input height ~38px |

### 6.2 "Chủ Nhiệm Đề Tài" + "Năm Sinh" Row

**Layout:** `grid grid-cols-4 gap-6`

| Field | Col span | Label | Type | Required |
|---|---|---|---|---|
| Chủ nhiệm đề tài | `col-span-3` | `"Chủ nhiệm đề tài"` + `*` | `type="text"` | Yes |
| Năm sinh | `col-span-1` | `"Năm sinh"` | `type="text"` or `type="number"` | No |

### 6.3 "Thành Viên Tham Gia" Field

| Property | Value |
|---|---|
| **Label** | `"Thành viên tham gia"` |
| **Input type** | `<textarea>` — multi-line, resizable |
| **Placeholder** | `"Liệt kê tên các thành viên..."` |
| **Col span** | `col-span-4` — full width |
| **Min-height** | ~3 rows visible (~80px) |
| **Resize** | `resize-y` (vertical resize handle visible in screenshot — bottom-right corner icon) |
| **Resize icon** | Native browser resize handle — white diagonal lines, bottom-right |

### 6.4 "Lĩnh Vực NC" + "Loại Hình NC" + "Loại Đề Tài (Tags)" Row

**Layout:** `grid grid-cols-4 gap-6` — approximately:
- Lĩnh vực NC: `col-span-1`
- Loại hình NC: `col-span-1`
- Loại đề tài (Tags): `col-span-2`

#### "Lĩnh Vực NC" and "Loại Hình NC"

| Property | Value |
|---|---|
| **Type** | `type="text"` |
| **No placeholder** visible | Empty |

#### "Loại Đề Tài (Tags)" — Pill Tag Selector

| Property | Value |
|---|---|
| **Label** | `"Loại đề tài (Tags)"` + red `*` |
| **Layout** | Flex row, `flex-wrap`, `gap-2` |
| **Alignment** | Tags align to the right of the label row |

**Confirmed tags from Screenshot 1:**
`Loại A` · `Loại B` · `Loại C` · `Loại D` · `Sinh viên` · `Tự túc kinh phí` · `Khác`

#### Tag Pill Design

| State | Classes |
|---|---|
| **Unselected** | `bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500` |
| **Selected** | `bg-blue-600 border-blue-600 text-white` |
| **Both** | `rounded-full text-xs font-medium px-3 py-1 cursor-pointer transition-all duration-150` |

#### "Khác" Tag Conditional Input

When "Khác" is selected, a text input appears below the tags:

| Property | Value |
|---|---|
| **Container bg** | `bg-blue-50` |
| **Border-radius** | `rounded-lg` |
| **Padding** | `p-2` |
| **Input** | Standard text input inside the blue-tinted container |
| **Placeholder** | `"Nhập loại khác..."` (inferred) |
| **Animation** | Slide down / fade in |
| **Margin top** | `mt-2` |

### 6.5 "Bộ Môn" + "Khoa / Đơn Vị" Row

**Layout:** `grid grid-cols-4 gap-6`

| Field | Col span | Label | Required |
|---|---|---|---|
| Bộ môn | `col-span-2` | `"Bộ môn"` | No |
| Khoa / Đơn vị | `col-span-2` | `"Khoa / Đơn vị"` + `*` | Yes |

---

## 7. Section 3 — QUYẾT ĐỊNH

**Confirmed from Screenshot 1 (bottom visible).**

### 7.1 Layout

**Grid:** `grid grid-cols-2 gap-6` — **only 2 columns** (NOT 4)

| Field | Col span | Label | Type |
|---|---|---|---|
| QĐ Xét duyệt | `col-span-1` | `"QD Xét duyệt"` | `type="text"` |
| QĐ Phê duyệt | `col-span-1` | `"QD Phê duyệt"` | `type="text"` |

> **⚠️ Audit correction confirmed:** This section uses `grid-cols-2`, not `grid-cols-4`. Cursor must use the section-specific grid.

---

## 8. Section 4 — KINH PHÍ (VNĐ)

**Confirmed from Screenshot 2 (top section).**

### 8.1 Layout

Two rows inside a container block:
- **Row 1:** Tổng kinh phí + Kinh phí khoán + KP Không khoán + Nguồn khác — `grid grid-cols-4 gap-4`
- **Row 2:** (empty first column) + Cấp Đợt 1 + Cấp Đợt 2 + Cấp Đợt 3 — `grid grid-cols-4 gap-4`

### 8.2 Container Block

| Property | Value |
|---|---|
| **Background** | `bg-slate-50` |
| **Padding** | `p-4` |
| **Border-radius** | `rounded-xl` |
| **Border** | `border border-slate-200` |

### 8.3 "Tổng Kinh Phí" — Highlighted Field (Confirmed)

From Screenshot 2: the "Tổng Kinh phí" field has a **blue border** and the label is visually distinct.

| Property | Value |
|---|---|
| **Label** | `"Tổng Kinh phí"` |
| **Input border** | `border-blue-300` — blue tint instead of default `border-slate-200` |
| **Input font** | `font-black text-blue-700` — bold blue value text |
| **Input font size** | Slightly larger — `text-sm` (exception to `text-xs` rule) |
| **Value shown** | `"0"` (default) |
| **Col span** | `col-span-1` |
| **Focus ring** | `focus:ring-blue-500` |

### 8.4 Standard Budget Fields (Row 1)

| Field | Label | Col span | Default value |
|---|---|---|---|
| Kinh phí khoán | `"Kinh phí khoán"` | `col-span-1` | `"0"` |
| KP Không khoán | `"KP Không khoán"` | `col-span-1` | `"0"` |
| Nguồn khác | `"Nguồn khác"` | `col-span-1` | `"0"` |

All use standard input style, `type="number"` with `min="0"`.

### 8.5 Cấp Đợt Fields (Row 2)

**Layout note:** First column of Row 2 is empty (aligns Cấp Đợt fields under Kinh phí khoán columns).

| Field | Label | Col span | Default |
|---|---|---|---|
| (empty) | — | `col-span-1` | — |
| Cấp Đợt 1 | `"Cấp Đợt 1"` | `col-span-1` | `"0"` |
| Cấp Đợt 2 | `"Cấp Đợt 2"` | `col-span-1` | `"0"` |
| Cấp Đợt 3 | `"Cấp Đợt 3"` | `col-span-1` | `"0"` |

**Row separator:** `border-t border-slate-200 pt-3` above Row 2 label area.

### 8.6 Budget Mismatch Warning (Required — not yet in component)

```tsx
// ✅ Inline validation below the budget block
const budgetSum = contractedBudget + nonContractedBudget + otherFunding;
const hasMismatch = totalBudget > 0 && budgetSum !== totalBudget;

{hasMismatch && (
  <p className="text-amber-600 text-[10px] mt-2">
    ⚠ Tổng các phần ({formatVND(budgetSum)}) không khớp với Tổng kinh phí
  </p>
)}
```

---

## 9. Section 5 — THỜI GIAN & TIẾN ĐỘ

**Confirmed from Screenshot 2 (middle section).**

### 9.1 Row 1 — Standard Date Fields

**Layout:** `grid grid-cols-4 gap-6`

| Field | Label | Type | Placeholder shown |
|---|---|---|---|
| Thời gian TH (chữ) | `"Thời gian TH (chữ)"` | `type="text"` | Empty |
| Bắt đầu | `"Bắt đầu"` | `type="date"` → datepicker | `"mm/dd/yyyy"` → `"dd/mm/yyyy"` |
| Kết thúc | `"Kết thúc"` | `type="date"` → datepicker | `"mm/dd/yyyy"` → `"dd/mm/yyyy"` |
| Gia hạn | `"Gia hạn"` | `type="date"` → datepicker | `"mm/dd/yyyy"` → `"dd/mm/yyyy"` |

### 9.2 Row 2 — BC Giám Định + Progress Reports

**Layout:** Two blocks side by side — approximately `grid grid-cols-4 gap-6`

#### "BC Giám Định" Block (Left — col-span-1)

| Property | Value |
|---|---|
| **Container bg** | `bg-blue-50` — light blue tint |
| **Border-radius** | `rounded-lg` |
| **Padding** | `p-3` |
| **Label** | `"BC Giám định"` — `text-xs font-bold text-blue-600` |
| **Input** | Single `type="date"` inside the block |

#### "Thời Gian Báo Cáo Tiến Độ (1-4)" Block (Right — col-span-3)

| Property | Value |
|---|---|
| **Label** | `"THỜI GIAN BÁO CÁO TIẾN ĐỘ (1-4)"` — uppercase, tiny |
| **Label font** | `text-[10px] font-black uppercase text-slate-400` |
| **Container bg** | `bg-slate-50` |
| **Border-radius** | `rounded-lg` |
| **Padding** | `p-2` |
| **Layout inside** | `grid grid-cols-4 gap-2` — 4 date inputs in a row |
| **All inputs** | `type="date"` → datepicker, `dd/mm/yyyy` format |

### 9.3 Row 3 — Status, Note, and Meeting Date

**Layout:** `grid grid-cols-4 gap-6` (approximately: status 1 col, note 2 cols, date 1 col)

| Field | Label | Type | Notes |
|---|---|---|---|
| Tiến độ thực hiện | `"Tiến độ thực hiện"` | `<select>` | Default: `"Đúng hạn"` |
| Ghi chú về nộp BC | `"Ghi chú về nộp BC"` | `type="text"` | Col-span 2 |
| Ngày họp NT | `"Ngày họp NT"` | `type="date"` → datepicker | `"dd/mm/yyyy"` |

#### "Tiến Độ Thực Hiện" Select Options

| Option | Value |
|---|---|
| Đúng hạn | `on_time` |
| Trễ hạn | `late` |
| Gia hạn | `extended` |
| Hoàn thành | `completed` |

**Select design:**
```
border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white
w-full focus:ring-2 focus:ring-blue-500
```
With a native chevron-down icon on the right (or custom `ChevronDownIcon`).

---

## 10. Section 6 — KẾT QUẢ & TÌNH TRẠNG

**Confirmed from Screenshot 2 (bottom visible).**

### 10.1 Layout

**Grid:** `grid grid-cols-4 gap-6`

| Field | Col span | Label | Type | Notes |
|---|---|---|---|---|
| Sản phẩm đầu ra (Tóm tắt) | `col-span-2` | `"Sản phẩm đầu ra (Tóm tắt)"` | `type="text"` | Single line |
| Tình trạng | `col-span-1` | `"Tình trạng"` + `*` | `<select>` | Default: `"Đang thực hiện"` |
| Năm NT | `col-span-0.5` | `"Năm NT"` | `type="text"` | Narrow — `text-center` |
| Năm học | `col-span-0.5` | `"Năm học"` | `type="text"` | Narrow — `text-center` |

#### "Tình Trạng" Select Options (Confirmed: "Đang thực hiện" is default)

| Option |
|---|
| Đang thực hiện |
| Hoàn thành |
| Thanh lý |
| Gia hạn |
| Tạm dừng |

**Select style:** Same as Tiến độ thực hiện. `font-bold` on the selected value display.

---

## 11. Section 7 — SẢN PHẨM CHI TIẾT

**Confirmed from Screenshots 2 and 3 (split across two screens).**

### 11.1 Overall Layout

Two equal-width columns side by side: `grid grid-cols-2 gap-6`

- **Left column:** "Sản phẩm Cam kết"
- **Right column:** "Sản phẩm Thực tế"

Separated by a visible **vertical divider line** between the two columns.

### 11.2 Column Headers

| Property | Value |
|---|---|
| **Text** | `"Sản phẩm Cam kết"` / `"Sản phẩm Thực tế"` |
| **Font size** | `text-sm` |
| **Font weight** | `font-semibold` (600) |
| **Color** | `text-slate-700` |
| **Margin bottom** | `mb-3` |

### 11.3 Scrollable Product List

| Property | Value |
|---|---|
| **Max-height** | `max-h-60` (~240px) |
| **Overflow** | `overflow-y-auto` |
| **Scrollbar** | Custom or `no-scrollbar` |

### 11.4 Product Item Row Design

**Confirmed product types from Screenshots 2 & 3:**
1. Bài báo quốc tế
2. Bài báo trong nước
3. Sản phẩm dạng 2 (Mô hình/Quy trình)
4. Đào tạo Học viên sau đại học
5. Đào tạo Nghiên cứu sinh
6. Sách/Giáo trình
7. Đăng ký sở hữu trí tuệ

#### Left Column — "Sản Phẩm Cam Kết" Row

| Property | Value |
|---|---|
| **Row bg** | `bg-slate-50` |
| **Border-radius** | `rounded-lg` |
| **Padding** | `px-3 py-2` |
| **Margin bottom** | `mb-1.5` |
| **Layout** | `flex justify-between items-center` |
| **Label text** | Product type name, `text-xs text-slate-600` |
| **Count input** | `type="number"` min="0", value `"0"` default |
| **Count input width** | `w-12` or `w-14` — narrow |
| **Count input style** | `text-center border border-slate-200 rounded-md text-xs` |

#### Right Column — "Sản Phẩm Thực Tế" Row

| Property | Value |
|---|---|
| **Row bg** | `bg-emerald-50` — green tint |
| **Border** | `border border-emerald-100` |
| **Border-radius** | `rounded-lg` |
| **Padding** | `px-3 py-2` |
| **Margin bottom** | `mb-1.5` |
| **Layout** | `flex justify-between items-center` |
| **Label text** | `text-xs text-emerald-700` — green text |
| **Count input** | Distinct green styling |
| **Count input border** | `border-emerald-200` |
| **Count input text** | `text-emerald-700 font-semibold` |
| **Count input bg** | `bg-white` |
| **Count input width** | `w-12` — narrow |
| **Count input style** | `text-center rounded-md text-xs focus:ring-emerald-400` |

### 11.5 "Chi Tiết Sản Phẩm Thực Tế" Textarea

| Property | Value |
|---|---|
| **Label** | `"Chi tiết Sản phẩm thực tế (Tên bài báo, số hiệu, ...)"` |
| **Type** | `<textarea>` |
| **Placeholder** | `"Vui lòng ghi rõ chi tiết sản phẩm..."` |
| **Col span** | `col-span-2` — full width spanning both columns |
| **Rows** | ~4 rows visible |
| **Resize** | `resize-y` (resize handle visible in screenshot) |
| **Margin top** | `mt-4` |

---

## 12. Section 8 — THÔNG TIN KHÁC

**Confirmed from Screenshot 3.**

### 12.1 Row 1 — Thời Điểm Nhắc, Thời Điểm NT, Mã Số ĐT

**Layout:** `grid grid-cols-4 gap-6`

| Field | Col span | Label | Type | Notes |
|---|---|---|---|---|
| Thời điểm nhắc | `col-span-1` | `"Thời điểm nhắc"` | `type="date"` | `dd/mm/yyyy` |
| Thời điểm NT (Hoàn tất) | `col-span-1` | `"Thời điểm NT (Hoàn tất)"` | `type="date"` | `dd/mm/yyyy` |
| Mã số ĐT | `col-span-2` | `"Mã số ĐT"` | `type="text"` | Monospace font |

#### "Mã Số ĐT" Field Special Style

| Property | Value |
|---|---|
| **Placeholder** | `"ĐT-2023-..."` — shows expected format |
| **Font** | `font-mono font-bold` — **only field in the form with monospace font** |
| **Purpose** | Unique identifier with structured format `ĐT-YYYY-XXX` |

### 12.2 Row 2 — Giới Tính, Chuyển Tiếp, Lý Do Thanh Lý

**Layout:** `grid grid-cols-4 gap-6` (approximately)

| Field | Col span | Label | Type | Notes |
|---|---|---|---|---|
| Giới tính Chủ nhiệm | `col-span-1` | `"Giới tính Chủ nhiệm"` | `<select>` | Default: `"Nam"` |
| Chuyển tiếp | `col-span-1` | (inline with checkbox) | `<input type="checkbox">` | See below |
| Lý do thanh lý | `col-span-2` | `"Lý do thanh lý"` | `type="text"` | Red label |

#### "Giới Tính" Select Options

| Option |
|---|
| Nam |
| Nữ |
| Khác |

#### "Chuyển Tiếp" Checkbox

| Property | Value |
|---|---|
| **Layout** | `flex items-center gap-2` — checkbox left, label text right |
| **Label text** | `"Chuyển tiếp"` |
| **Checkbox style** | `rounded` or `rounded-sm`, `text-blue-600`, `border-slate-300` |
| **Focus** | `focus:ring-blue-500` |
| **Label font** | `text-xs text-slate-600` |

#### "Lý Do Thanh Lý" Label — Semantic Red Color

| Property | Value |
|---|---|
| **Label color** | `text-red-600` — **intentional semantic color, NOT an error state** |
| **Label font** | `text-xs font-medium` |
| **Input style** | Standard — `border-slate-200` (NOT red border) |

> **⚠️ Important for Cursor:** The red label is semantic (liquidation = critical action), NOT an error indicator. The input itself has the standard gray border. Do NOT add `aria-invalid` or error ring to this field.

### 12.3 Row 3 — Mô Tả / Ghi Chú Chung

| Property | Value |
|---|---|
| **Label** | `"Mô tả/Ghi chú chung"` |
| **Type** | `<textarea>` |
| **Col span** | `col-span-4` — full width |
| **Rows** | ~4 rows visible |
| **Placeholder** | Empty |
| **Resize** | `resize-y` (resize handle visible) |
| **Margin bottom** | `mb-8` — last field, extra bottom space |

---

## 13. Date Input Handling — Canonical Specification

### 13.1 Confirmed Issue from Screenshots

All date inputs in Screenshots 1, 2, and 3 show `"mm/dd/yyyy"` — the **US browser locale format**. This violates the `dd/mm/yyyy` canonical requirement.

### 13.2 Required Fix for All Date Fields

```tsx
// ✅ Replace ALL <input type="date"> with DatePicker
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale';
registerLocale('vi', vi);

// Reusable component
function DateField({
  label,
  value,
  onChange,
  required,
  error,
}: DateFieldProps) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <DatePicker
        selected={value ? parseISO(value) : null}
        onChange={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
        dateFormat="dd/MM/yyyy"
        locale="vi"
        placeholderText="dd/mm/yyyy"
        className={cn(
          'w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500',
          error ? 'border-red-400' : 'border-slate-200'
        )}
      />
      {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
    </div>
  );
}
```

### 13.3 Date Fields Inventory (All 11 date inputs)

| Section | Field | Format stored |
|---|---|---|
| §1 | Ngày ký | `YYYY-MM-DD` |
| §1 | Ngày cấp GCN | `YYYY-MM-DD` |
| §5 | Bắt đầu | `YYYY-MM-DD` |
| §5 | Kết thúc | `YYYY-MM-DD` |
| §5 | Gia hạn | `YYYY-MM-DD` |
| §5 | BC Giám định | `YYYY-MM-DD` |
| §5 | BC tiến độ 1 | `YYYY-MM-DD` |
| §5 | BC tiến độ 2 | `YYYY-MM-DD` |
| §5 | BC tiến độ 3 | `YYYY-MM-DD` |
| §5 | BC tiến độ 4 | `YYYY-MM-DD` |
| §5 | Ngày họp NT | `YYYY-MM-DD` |
| §8 | Thời điểm nhắc | `YYYY-MM-DD` |
| §8 | Thời điểm NT | `YYYY-MM-DD` |

---

## 14. Color Palette

### 14.1 Surfaces

| Role | Hex / Tailwind | Usage |
|---|---|---|
| Page canvas | `bg-slate-50` | Page background |
| Form container | `bg-white` | Main card |
| Section containers | `bg-slate-50` | Budget block, report date block |
| BC Giám định block | `bg-blue-50` | Special highlight block |
| Actual product rows | `bg-emerald-50` | Green tint for actual products |

### 14.2 Brand & Interactive

| Role | Hex | Tailwind | Usage |
|---|---|---|---|
| Primary blue | `#2563eb` | `blue-600` | Section headers, save button, active tags, focus rings |
| Primary blue light | `#eff6ff` | `blue-50` | "Khác" input bg, BC Giám định bg |
| Primary blue border | `#93c5fd` | `blue-300` | Tổng kinh phí field border |
| Emerald | `#10b981` | `emerald-600` | Actual product text |
| Emerald light | `#ecfdf5` | `emerald-50` | Actual product row bg |
| Emerald border | `#d1fae5` | `emerald-100` | Actual product row border |

### 14.3 Text Colors

| Role | Tailwind | Usage |
|---|---|---|
| Section headers | `text-blue-600` | All 8 section titles |
| Headings | `text-slate-800` | Form title, col headers |
| Body / labels | `text-slate-600` | Standard field labels |
| Muted labels | `text-slate-400` | Block sub-labels (GCN header, BC tiến độ header) |
| Placeholder | `text-slate-400` | All input placeholder text |
| Required star | `text-red-500` | `*` indicators |
| Error messages | `text-red-500` | Inline validation |
| Budget warning | `text-amber-600` | Budget mismatch warning |
| Liquidation label | `text-red-600` | "Lý do thanh lý" label only |
| Actual product | `text-emerald-700` | Right-column product labels + values |
| Budget highlight | `text-blue-700` | Tổng kinh phí value |

### 14.4 CSS Variables Reference

```css
:root {
  /* Page */
  --color-page-canvas:          #f8fafc;   /* slate-50 */
  --color-form-bg:              #ffffff;

  /* Brand */
  --color-primary:              #2563eb;   /* blue-600 */
  --color-primary-light:        #eff6ff;   /* blue-50 */
  --color-primary-border:       #93c5fd;   /* blue-300 */

  /* Section */
  --color-section-title:        #2563eb;
  --color-section-border:       #dbeafe;   /* blue-100 */

  /* Form elements */
  --color-input-border:         #e2e8f0;   /* slate-200 */
  --color-input-focus:          #3b82f6;   /* blue-500 */
  --color-label:                #475569;   /* slate-600 */
  --color-placeholder:          #94a3b8;   /* slate-400 */

  /* Products */
  --color-actual-bg:            #ecfdf5;   /* emerald-50 */
  --color-actual-border:        #d1fae5;   /* emerald-100 */
  --color-actual-text:          #047857;   /* emerald-700 */
  --color-budget-highlight:     #1d4ed8;   /* blue-700 */
}
```

---

## 15. Typography

| Element | Size | Weight | Color | Notes |
|---|---|---|---|---|
| Page title | `text-xl` / 20px | `font-bold` (700) | `text-blue-600` | |
| Form title (header) | `text-lg` / 18px | `font-bold` (700) | `text-slate-800` | |
| Section headers | `text-sm` / 14px | `font-black` (900) | `text-blue-600` | UPPERCASE, tracking-widest |
| Column sub-headers | `text-sm` / 14px | `font-semibold` (600) | `text-slate-700` | Product section |
| Field labels | `text-xs` / 12px | `font-medium` (500) | `text-slate-600` | **Universal form size** |
| Block micro-labels | `text-[10px]` | `font-black` (900) | `text-slate-400` | GCN header, BC tiến độ header |
| Input values | `text-xs` / 12px | `font-normal` (400) | `text-slate-800` | |
| Budget total value | `text-sm` / 14px | `font-black` (900) | `text-blue-700` | Exception |
| Product labels | `text-xs` / 12px | `font-normal` (400) | `text-slate-600` / `text-emerald-700` | |
| Save button | `text-sm` / 14px | `font-bold` (700) | `text-white` | UPPERCASE |
| Cancel button | `text-sm` / 14px | `font-medium` (500) | `text-slate-500` | |
| Error messages | `text-[10px]` | `font-normal` (400) | `text-red-500` | |
| Mã số ĐT input | `text-xs` / 12px | `font-bold` (700) | `text-slate-800` | `font-mono` — exception |
| Tag pills | `text-xs` / 12px | `font-medium` (500) | Per state | |
| Placeholder | `text-xs` / 12px | `font-normal` (400) | `text-slate-400` | |

---

## 16. Spacing & Sizing

| Element | Value |
|---|---|
| Form container max-width | `max-w-7xl` |
| Form container padding (H) | `px-8` (inside sections) |
| Form container padding (V) | `py-6` per section |
| Section gap | `mt-8` between sections |
| Section header margin-bottom | `mb-6` |
| Grid gap (standard) | `gap-6` |
| Grid gap (compact, e.g. BC dates) | `gap-2` |
| Grid gap (budget) | `gap-4` |
| Field label margin-bottom | `mb-1.5` |
| Error message margin-top | `mt-1` |
| Product row margin-bottom | `mb-1.5` |
| Product list max-height | `max-h-60` (240px) |
| Section 4 container padding | `p-4` |
| Section 5 BC block padding | `p-2` to `p-3` |
| Textarea min-height | `~80px` (3 rows) |
| Button height | `~36–40px` |
| Input height | `~34–36px` |
| Tag pill height | `~28px` |

---

## 17. Form Validation Rules

### 17.1 Required Fields (Confirmed from screenshots)

| Field | Section | Required marker |
|---|---|---|
| Số hợp đồng | §1 | Red `*` visible in screenshot |
| Tên đề tài | §2 | Red `*` visible in screenshot |
| Chủ nhiệm đề tài | §2 | Red `*` visible in screenshot |
| Loại đề tài (Tags) | §2 | Red `*` visible in screenshot |
| Khoa / Đơn vị | §2 | Red `*` visible in screenshot |
| Tình trạng | §6 | Red `*` visible in screenshot |

### 17.2 Validation Implementation

```tsx
// ✅ Centralized in useDataEntryForm hook
function validateForm(formData: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!formData.contractNumber.trim())
    errors.contractNumber = 'Vui lòng nhập số hợp đồng';
  if (!formData.title.trim())
    errors.title = 'Vui lòng nhập tên đề tài';
  if (!formData.principalInvestigator.trim())
    errors.principalInvestigator = 'Vui lòng nhập chủ nhiệm đề tài';
  if (!formData.category)
    errors.category = 'Vui lòng chọn ít nhất 1 loại đề tài';
  if (!formData.faculty.trim())
    errors.faculty = 'Vui lòng nhập khoa/đơn vị';
  if (!formData.projectStatus)
    errors.projectStatus = 'Vui lòng chọn tình trạng';

  return errors;
}
```

---

## 18. Component File Structure

```
src/
├── components/
│   └── DataEntry/
│       ├── index.tsx
│       ├── DataEntry.tsx                    # Orchestrator only — state + layout
│       ├── FormHeader.tsx                   # Sticky header + title + buttons
│       ├── SectionHeader.tsx                # Shared <h3> component (§3)
│       ├── DateField.tsx                    # Shared datepicker wrapper (§13.2)
│       ├── sections/
│       │   ├── ContractSection.tsx          # §5
│       │   ├── GeneralInfoSection.tsx       # §6
│       │   ├── DecisionSection.tsx          # §7
│       │   ├── BudgetSection.tsx            # §8
│       │   ├── TimelineSection.tsx          # §9
│       │   ├── ResultsSection.tsx           # §10
│       │   ├── ProductDetailSection.tsx     # §11
│       │   └── OtherInfoSection.tsx         # §12
│       └── components/
│           ├── TagSelector.tsx              # Pill tags + "Khác" input
│           ├── BudgetMismatchWarning.tsx    # Budget validation message
│           ├── ProductList.tsx              # Scrollable list wrapper
│           └── ProductItem.tsx             # Single product row (both variants)
│
├── config/
│   ├── productTypes.ts                      # PRODUCT_TYPES config
│   └── projectCategories.ts                 # PROJECT_CATEGORIES config
│
├── domain/
│   └── project/
│       ├── defaultFormData.ts               # All 35+ field defaults
│       └── mapProjectToFormData.ts          # Edit mode mapper
│
├── hooks/
│   ├── useDataEntryForm.ts                  # State + validation + submit
│   └── useProductList.ts                    # Product array management
│
└── utils/
    └── dateFormat.ts                        # toInputDate + formatDate (shared)
```

---

## 19. Issue Resolution Table

| # | Issue (from audit) | Screenshot verdict | Canonical spec |
|---|---|---|---|
| 1 | Date shows `MM/DD/YYYY` | ✅ Confirmed — all dates show US format | Use `react-datepicker` with `dd/MM/yyyy` |
| 2 | `alert()` validation | Not visible in screenshot | Replace with inline errors (§4.4, §17) |
| 3 | Section header repeated × 8 | ✅ Confirmed — consistent style | `<SectionHeader>` component (§3) |
| 4 | Section 3 uses `grid-cols-2` | ✅ Confirmed — only 2 fields in §3 | `grid grid-cols-2` for DecisionSection |
| 5 | Budget mismatch not validated | Not visible — empty form | Add `<BudgetMismatchWarning>` (§8.6) |
| 6 | "Khác" value only at submit | Not triggerable in screenshot | `useMemo` resolvedCategory (audit §2.6) |
| 7 | Two parallel product arrays | ✅ Confirmed — left/right columns | `useProductList` hook (audit §2.7) |
| 8 | `useEffect` for initialData | Not visible | Lazy `useState` initializer |
| 9 | No loading state for save | ✅ Button always active | `isSaving` state + disabled button (§2.3) |
| 10 | `font-mono` undocumented | ✅ Confirmed — Mã số ĐT only | Explicit exception in §12.1 |
| 11 | "Loại đề tài" / "Phân loại" naming | ✅ Confirmed label: `"Loại đề tài (Tags)"` | `category` (field) / `"Loại đề tài"` (label) |
| 12 | 23 concerns in one file | Cannot see from screenshot | Decompose per §18 |
| 13 | `text-xs` not Cursor default | ✅ Confirmed — all text is tiny/dense | Explicit in §4, §15 |
| 14 | Lý do thanh lý red label | ✅ Confirmed — red label, normal input | Semantic red label documented (§12.2) |
| 15 | Chuyển tiếp checkbox | ✅ Confirmed — checkbox + label inline | `flex items-center gap-2` (§12.2) |
| 16 | Textarea resize handle | ✅ Confirmed — handles visible bottom-right | `resize-y` on all textareas |
| 17 | Section 7 divider between columns | ✅ Confirmed — vertical line visible | Divider via `divide-x divide-slate-200` |
| 18 | Product actual rows are green | ✅ Confirmed — `bg-emerald-50` right col | Full spec in §11.4 |
| 19 | BC Giám định blue container | ✅ Confirmed — distinct blue-tinted block | `bg-blue-50 rounded-lg` (§9.2) |
| 20 | Budget "Tổng" has blue border | ✅ Confirmed — blue border visible | `border-blue-300 text-blue-700` (§8.3) |
