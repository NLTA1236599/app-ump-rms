# ProjectDetail — CRM-Style Redesign (Concrete Implementation Spec)
**Source A (current state):** Screenshot of the live "Dữ liệu đề tài" detail page
**Source B (target pattern):** `ProjectDetail-CRM-redesign-analysis.md`
**Goal:** Replace the current single-column, all-sections-stacked layout with the three-column CRM layout, using the **real fields confirmed in the screenshot**

---

## 1. Current State — Confirmed From Screenshot

This is the exact page being redesigned. Capturing it precisely so nothing is lost in the migration.

### 1.1 Current Layout (single column, top to bottom)

```
[← Back]  Khảo sát quy trình lên men đông nuôi cấy Limosilactobacillus...
          2025.03.10.512 • SVD22. Đào Khánh Vy (năm 4) • 512/2025/HĐ-ĐHYD, ngày 30/9/2025

ⓘ Thông tin chi tiết đề tài                              [Chỉnh sửa thông tin]

  I. Thông tin chung                                       [Xét duyệt đề cương]
     TÊN ĐỀ TÀI: Khảo sát quy trình lên men...
     CHỦ NHIỆM | GIỚI TÍNH | NĂM SINH | KHOA/ĐƠN VỊ
     BỘ MÔN | LĨNH VỰC NC | LOẠI HÌNH NC | LOẠI ĐỀ TÀI
     THÀNH VIÊN NC

  II. Hợp đồng & Quyết định
     SỐ HỢP ĐỒNG | NGÀY KÝ HĐ | QĐ XÉT DUYỆT
     QĐ PHÊ DUYỆT | SỐ GCN KẾT QUẢ | NGÀY CẤP GCN
     CƠ QUAN CẤP GCN

  III. Kinh phí & Phân bổ
     TỔNG KINH PHÍ | KINH PHÍ KHOÁN | KINH PHÍ KHÔNG KHOÁN | NGUỒN KHÁC
     CẤP ĐỢT 1 | CẤP ĐỢT 2 | CẤP ĐỢT 3

  IV. Thời gian & Tiến độ
     THỜI GIAN TH | BẮT ĐẦU | KẾT THÚC | GIA HẠN
     TIẾN ĐỘ THỰC HIỆN | BÁO CÁO GIÁM ĐỊNH | BC TIẾN ĐỘ 1 | BC TIẾN ĐỘ 2
     BC TIẾN ĐỘ 3 | BC TIẾN ĐỘ 4 | NGÀY NHẮC
     GHI CHÚ BÁO CÁO

  V. Nghiệm thu & Sản phẩm
     NGÀY HỌP NT | THỜI ĐIỂM NT | NĂM NGHIỆM THU | NĂM HỌC NT
     SẢN PHẨM ĐẦU RA | CHI TIẾT SP THỰC TẾ
     SẢN PHẨM CAM KẾT | SẢN PHẨM THỰC TẾ
     ... (continues below the fold)
```

### 1.2 Confirmed Real Data Values (for reference during redesign)

| Field | Value |
|---|---|
| Tên đề tài | Khảo sát quy trình lên men đông nuôi cấy Limosilactobacillus reuteri ATCC 23272 và Saccharomyces boulardii ATCC MYA-796 |
| Mã đề tài | 2025.03.10.512 |
| Chủ nhiệm | SVD22. Đào Khánh Vy (năm 4) |
| Số hợp đồng | 512/2025/HĐ-ĐHYD, ngày 30/9/2025 |
| Giới tính | Nam |
| Năm sinh | 2004 |
| Khoa/Đơn vị | Trung tâm Y sinh học phân tử |
| Loại đề tài | Sinh viên (tag/badge) |
| Thành viên NC | TS. Nguyễn Minh Thái, SVD21. Bùi Quốc Huy (năm 5) |
| Tổng kinh phí | 20.000.000 VNĐ |
| Thời gian TH | 17 tháng |
| Bắt đầu | 01/09/2025 |
| Kết thúc | 20/06/2026 |
| Tiến độ thực hiện | Đúng hạn |
| Empty fields | Shown as `---` (gray, italic) |

### 1.3 Confirmed Visual Details

| Element | Confirmed style |
|---|---|
| Section accent bars | Blue (I), Emerald (II), Amber (III), Purple (IV), Red (V) — `border-l-4` |
| Field labels | `text-[10px]` uppercase gray, e.g. `"TÊN ĐỀ TÀI"`, `"CHỦ NHIỆM"` |
| Field values | `text-sm font-semibold text-slate-700` |
| Empty value | `"---"` in muted gray |
| "Chỉnh sửa thông tin" button | Top-right, blue text on light blue bg, pill shape |
| "Xét duyệt đề cương" button | Top-right of Section I specifically — blue outline button |
| Breadcrumb-like meta row | `2025.03.10.512 • SVD22. Đào Khánh Vy (năm 4) • 512/2025/HĐ-ĐHYD, ngày 30/9/2025` — small gray text with bullet separators, directly under the title |
| Category tag | `"Sinh viên"` rendered as a small pill badge, light blue bg |

---

## 2. Target Layout — CRM Three-Column Structure

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TOP BAR — [←] breadcrumb "Đề tài KHCN > Chi tiết đề tài"      [Quản trị viên] [Đăng xuất] │
├───────────────────┬────────────────────────────────────────┬─────────────────────┤
│  LEFT PANEL       │   CENTER PANEL — Tabbed                │  (merged into       │
│  (~340px, fixed)  │   (fluid, scrollable)                  │   center — see      │
│                   │                                        │   §9 decision)      │
│  [🧪] icon        │  [Thông tin chung] [Hợp đồng] [Kinh phí]│                     │
│  Project title    │  [Thời gian] [Nghiệm thu] [Nhiệm vụ]    │                     │
│  (2 lines)        │  [Trao đổi]                             │                     │
│                   │  ──────────────────────────────────────│                     │
│  [✎][📅][🔗][🗑]  │                                          │                     │
│                   │  {Active tab content renders here}      │                     │
│  Tiến độ quy trình│                                          │                     │
│  ▓▓▓▓░░░░ 39%     │                                          │                     │
│                   │                                          │                     │
│  ┌─ Quick Info ──┐│                                          │                     │
│  │ 🏷 2025.03.10  ││                                          │                     │
│  │ 📄 512/2025/HĐ ││                                          │                     │
│  │ 👤 Đào Khánh Vy││                                          │                     │
│  │ 🏛 TT Y sinh học││                                         │                     │
│  │ 🏷 Sinh viên   ││                                          │                     │
│  │ 💰 20.000.000  ││                                          │                     │
│  └────────────────┘│                                          │                     │
│                   │                                          │                     │
│  Trạng thái ▾     │                                          │                     │
│  [Đúng hạn]       │                                          │                     │
│                   │                                          │                     │
│  Chủ nhiệm         │                                          │                     │
│  👤 Đào Khánh Vy   │                                          │                     │
│                   │                                          │                     │
│  Thành viên NC     │                                          │                     │
│  👤👤 +1           │                                          │                     │
└───────────────────┴────────────────────────────────────────┴─────────────────────┘
```

---

## 3. Top Bar

| Property | Value |
|---|---|
| **Background** | `bg-white border-b border-slate-200` |
| **Height** | `h-14` |
| **Left** | Back arrow `←` (`text-slate-500 hover:text-slate-700`) + breadcrumb |
| **Breadcrumb** | `"Đề tài KHCN"` (gray, link) `›` `"Chi tiết đề tài"` (blue, active, current page) |
| **Right** | Kept as-is from the shared site header (Quản trị viên / Đăng xuất) — **not duplicated** here |

```tsx
<div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-3">
  <button onClick={onBack} className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100">
    <ArrowLeftIcon className="w-5 h-5" />
  </button>
  <nav className="text-sm flex items-center gap-1.5">
    <span className="text-slate-500 hover:text-blue-600 cursor-pointer" onClick={onBack}>Đề tài KHCN</span>
    <span className="text-slate-300">›</span>
    <span className="text-blue-600 font-medium">Chi tiết đề tài</span>
  </nav>
</div>
```

---

## 4. Left Panel — Identity & Quick Actions

**Width:** `w-[340px]`, fixed, `border-r border-slate-200`, own internal scroll (`overflow-y-auto`), full height under top bar.

### 4.1 Icon + Title Block

| Property | Value |
|---|---|
| **Icon** | Flask/beaker icon (research theme), `w-14 h-14 rounded-full bg-blue-100`, icon `text-blue-600 w-7 h-7` |
| **Title** | Full project title, `text-base font-bold text-slate-800 leading-snug`, no truncation — wraps naturally |
| **Meta row** | Same as current screenshot: `2025.03.10.512 • SVD22. Đào Khánh Vy (năm 4) • 512/2025/HĐ-ĐHYD, ngày 30/9/2025` — `text-xs text-slate-400`, bullet-separated, wraps to 2 lines if needed |

```tsx
<div className="p-4 border-b border-slate-100">
  <div className="flex items-start gap-3">
    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <BeakerIcon className="w-7 h-7 text-blue-600" />
    </div>
    <h2 className="text-base font-bold text-slate-800 leading-snug">
      {project.title}
    </h2>
  </div>
  <p className="text-xs text-slate-400 mt-2 flex flex-wrap items-center gap-1">
    <span>{project.projectCode}</span>
    <span className="text-slate-300">•</span>
    <span>{project.leadAuthor}</span>
    <span className="text-slate-300">•</span>
    <span>{project.contractId}</span>
  </p>
</div>
```

### 4.2 Action Icon Row

| Icon | Action | Style |
|---|---|---|
| ✏️ Edit | `onEdit(project)` → opens DataEntry form | `bg-slate-100 text-slate-600 hover:bg-slate-200` |
| 📅 Lịch trình | Switch to "Thời gian" tab | `bg-slate-100 text-slate-600 hover:bg-slate-200` |
| 🔗 Chia sẻ | Copy link / export single PDF | `bg-slate-100 text-slate-600 hover:bg-slate-200` |
| 🗑️ Xóa | `onDelete(project.id)` with confirm | `bg-red-50 text-red-500 hover:bg-red-100` |

```tsx
<div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
  <IconButton icon={PencilSquareIcon} onClick={() => onEdit(project)} title="Chỉnh sửa thông tin" />
  <IconButton icon={CalendarDaysIcon} onClick={() => setActiveTab('thoi-gian')} title="Lịch trình" />
  <IconButton icon={LinkIcon}         onClick={handleShare} title="Chia sẻ" />
  <IconButton icon={TrashIcon}        onClick={handleDeleteClick} title="Xóa đề tài" variant="danger" />
</div>
```

### 4.3 Progress Bar — "Tiến độ quy trình"

Maps to the existing workflow step calculation (`currentStep / WORKFLOW_STEPS.length`).

```tsx
<div className="px-4 py-3 border-b border-slate-100">
  <p className="text-xs text-slate-500 mb-1.5">Tiến độ quy trình</p>
  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
    <div
      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-500"
      style={{ width: `${completionPct}%` }}
    />
  </div>
  <span className="inline-block mt-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
    {completionPct}%
  </span>
</div>
```

### 4.4 Quick-Info Card

Maps the screenshot's actual confirmed fields onto the CRM's highlighted info-card pattern.

| Icon | Field | Confirmed value (example) |
|---|---|---|
| 🏷️ Tag | Mã đề tài | `2025.03.10.512` |
| 📄 Document | Số hợp đồng | `512/2025/HĐ-ĐHYD, ngày 30/9/2025` |
| 👤 User | Chủ nhiệm | `SVD22. Đào Khánh Vy (năm 4)` |
| 🏛️ Building | Khoa/Đơn vị | `Trung tâm Y sinh học phân tử` |
| 🏷️ Tag | Loại đề tài | `Sinh viên` (rendered as pill badge, not plain text) |
| 💰 Currency | Tổng kinh phí | `20.000.000 VNĐ` |

```tsx
<div className="px-4 py-3">
  <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-3">
    <QuickInfoRow icon={TagIcon}      iconColor="text-violet-500"  label="Mã đề tài"     value={project.projectCode} />
    <QuickInfoRow icon={DocumentIcon} iconColor="text-blue-500"    label="Số hợp đồng"   value={project.contractId} />
    <QuickInfoRow icon={UserIcon}     iconColor="text-blue-500"    label="Chủ nhiệm"     value={project.leadAuthor} />
    <QuickInfoRow icon={BuildingIcon} iconColor="text-indigo-500"  label="Khoa/Đơn vị"   value={project.department} emptyLabel="Chưa có dữ liệu" />
    <QuickInfoRow icon={TagIcon}      iconColor="text-emerald-500" label="Loại đề tài"   value={project.category}  asBadge emptyLabel="Chưa có dữ liệu" />
    <QuickInfoRow icon={CurrencyIcon} iconColor="text-amber-500"   label="Tổng kinh phí" value={formatVND(project.totalBudget)} emptyLabel="Chưa có dữ liệu" />
  </div>
</div>
```

```tsx
function QuickInfoRow({ icon: Icon, iconColor, label, value, asBadge, emptyLabel = '---' }) {
  const isEmpty = !value;
  return (
    <div className="flex items-start gap-2">
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <div className="min-w-0">
        <p className="text-[10px] uppercase text-slate-400 font-medium">{label}</p>
        {isEmpty ? (
          <p className="text-sm text-slate-400 italic">{emptyLabel}</p>
        ) : asBadge ? (
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
            {value}
          </span>
        ) : (
          <p className="text-sm font-semibold text-slate-700 break-words">{value}</p>
        )}
      </div>
    </div>
  );
}
```

### 4.5 Status Dropdown — "Trạng thái"

The screenshot shows `"Tiến độ thực hiện: Đúng hạn"` inside Section IV — promote this to the left panel as a prominent status indicator, matching the CRM's "Trạng thái KH" pattern.

```tsx
<div className="px-4 py-3 border-t border-slate-100">
  <div className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2">
    <span className="text-xs text-slate-500">Tiến độ thực hiện</span>
    <ProgressStatusDropdown
      value={project.progressStatus}   // "Đúng hạn" | "Trễ hạn" | "Gia hạn"
      onChange={handleProgressStatusChange}
    />
  </div>
</div>
```

**Color mapping (reuse `getProgressBadge` logic):**

| Value | Pill color |
|---|---|
| Đúng hạn | `bg-emerald-500 text-white` |
| Trễ hạn | `bg-red-500 text-white` |
| Gia hạn | `bg-amber-500 text-white` |

### 4.6 Chủ Nhiệm (Assigned) Row

```tsx
<div className="px-4 py-3 border-t border-slate-100">
  <div className="flex items-center justify-between">
    <span className="text-xs text-slate-500">Chủ nhiệm đề tài</span>
    <div className="flex items-center gap-2">
      <Avatar name={project.leadAuthor} size="sm" />
      <span className="text-sm font-semibold text-slate-700">{project.leadAuthor}</span>
    </div>
  </div>
</div>
```

### 4.7 Thành Viên NC (Related Members) Row

Maps directly from the confirmed field `"TS. Nguyễn Minh Thái, SVD21. Bùi Quốc Huy (năm 5)"` — currently a comma-separated string, parsed into an avatar stack.

```tsx
<div className="px-4 py-3 border-t border-slate-100">
  <p className="text-xs text-slate-500 mb-2">Thành viên nghiên cứu</p>
  <div className="flex items-center -space-x-2">
    {members.slice(0, 3).map(m => (
      <Avatar key={m} name={m} className="w-8 h-8 border-2 border-white rounded-full" title={m} />
    ))}
    {members.length > 3 && (
      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
        +{members.length - 3}
      </div>
    )}
  </div>
</div>
```

```typescript
// Parse the existing comma-separated string field
const members = (project.researchMembers ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
```

---

## 5. Center Panel — Tabbed Content

### 5.1 Tab Bar

Maps the 5 existing roman-numeral sections + the existing `WorkflowTodoList` grid + 1 new tab, directly onto a tab strip:

| # | Tab label | Maps to (confirmed from screenshot) |
|---|---|---|
| 1 | **Thông tin chung** | Section I — Tên đề tài, Chủ nhiệm, Giới tính, Năm sinh, Khoa/Đơn vị, Bộ môn, Lĩnh vực NC, Loại hình NC, Loại đề tài, Thành viên NC |
| 2 | **Hợp đồng** | Section II — Số hợp đồng, Ngày ký HĐ, QĐ Xét duyệt, QĐ Phê duyệt, Số GCN, Ngày cấp GCN, Cơ quan cấp GCN |
| 3 | **Kinh phí** | Section III — Tổng kinh phí, Kinh phí khoán/không khoán, Nguồn khác, Cấp đợt 1–3 |
| 4 | **Thời gian** | Section IV — Thời gian TH, Bắt đầu, Kết thúc, Gia hạn, Tiến độ, Báo cáo giám định, BC tiến độ 1–4, Ngày nhắc, Ghi chú |
| 5 | **Nghiệm thu** | Section V — Ngày họp NT, Thời điểm NT, Năm NT, Năm học NT, Sản phẩm đầu ra/cam kết/thực tế |
| 6 | **Nhiệm vụ** | Existing `WorkflowTodoList` grid (per-step task manager) + `WorkflowTimeline` Gantt chart |
| 7 | **Trao đổi** | **New** — internal notes/comment thread |

```tsx
const DETAIL_TABS = [
  { id: 'thong-tin-chung', label: 'Thông tin chung', icon: InformationCircleIcon },
  { id: 'hop-dong',        label: 'Hợp đồng',         icon: DocumentTextIcon },
  { id: 'kinh-phi',        label: 'Kinh phí',         icon: CurrencyDollarIcon },
  { id: 'thoi-gian',       label: 'Thời gian',        icon: CalendarDaysIcon },
  { id: 'nghiem-thu',      label: 'Nghiệm thu',       icon: CheckBadgeIcon },
  { id: 'nhiem-vu',        label: 'Nhiệm vụ',         icon: ClipboardDocumentListIcon },
  { id: 'trao-doi',        label: 'Trao đổi',         icon: ChatBubbleLeftRightIcon },
];
```

```tsx
<div className="border-b border-slate-200 bg-white sticky top-0 z-10">
  <div className="flex items-center gap-1 px-4 overflow-x-auto">
    {DETAIL_TABS.map(tab => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors
          ${activeTab === tab.id
            ? 'text-slate-800 font-semibold border-blue-600'
            : 'text-slate-500 font-normal border-transparent hover:text-slate-700 hover:border-slate-200'
          }`}
      >
        <tab.icon className="w-4 h-4" />
        {tab.label}
      </button>
    ))}
  </div>
</div>
```

### 5.2 Tab Content — Reuse Existing `InfoField` Component, Zero Changes

Each tab is the **exact existing section content**, just no longer wrapped in a single scrolling page with all 5 visible. The accent bar color per section is preserved:

```tsx
{activeTab === 'thong-tin-chung' && (
  <div className="p-6">
    <SectionHeader color="blue">I. Thông tin chung</SectionHeader>
    {/* Existing fields — TÊN ĐỀ TÀI, CHỦ NHIỆM, GIỚI TÍNH, NĂM SINH, KHOA/ĐƠN VỊ, ... */}
    {/* Exact same <InfoField> components as current implementation — unchanged */}
  </div>
)}

{activeTab === 'hop-dong' && (
  <div className="p-6">
    <SectionHeader color="emerald">II. Hợp đồng & Quyết định</SectionHeader>
    {/* Existing fields unchanged */}
  </div>
)}

{activeTab === 'kinh-phi' && (
  <div className="p-6">
    <SectionHeader color="amber">III. Kinh phí & Phân bổ</SectionHeader>
    {/* Existing fields unchanged */}
  </div>
)}

{activeTab === 'thoi-gian' && (
  <div className="p-6">
    <SectionHeader color="purple">IV. Thời gian & Tiến độ</SectionHeader>
    {/* Existing fields unchanged */}
    {/* PLUS: WorkflowTimeline Gantt chart can render here too */}
  </div>
)}

{activeTab === 'nghiem-thu' && (
  <div className="p-6">
    <SectionHeader color="rose">V. Nghiệm thu & Sản phẩm</SectionHeader>
    {/* Existing fields unchanged */}
  </div>
)}

{activeTab === 'nhiem-vu' && (
  <div className="p-6 space-y-6">
    <WorkflowTimeline project={project} currentStep={currentStep} ... />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {WORKFLOW_STEPS.map(s => (
        <WorkflowTodoList key={s.step} project={project} step={s.step} onUpdate={onUpdate} />
      ))}
    </div>
  </div>
)}

{activeTab === 'trao-doi' && (
  <ProjectNoteThread project={project} />
)}
```

> **Important:** The "Chỉnh sửa thông tin" and "Xét duyệt đề cương" buttons currently shown at the top-right of the info card and Section I respectively should move into the tab content area — "Chỉnh sửa thông tin" becomes a persistent button in the tab bar row (far right), and "Xét duyệt đề cương" stays attached to the "Thông tin chung" tab specifically since it's a Section-I-specific workflow action.

```tsx
<div className="flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-10 px-4">
  <div className="flex items-center gap-1 overflow-x-auto">
    {/* tabs as above */}
  </div>
  <button
    onClick={() => onEdit(project)}
    className="flex-shrink-0 ml-4 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
  >
    Chỉnh sửa thông tin
  </button>
</div>
```

### 5.3 New "Trao đổi" Tab — Note Composer + Activity Feed

This is the only genuinely new UI surface. Built per the original CRM analysis (Sections 4.2–4.4 of `ProjectDetail-CRM-redesign-analysis.md`):

```tsx
function ProjectNoteThread({ project }: { project: ResearchProject }) {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [draft, setDraft] = useState('');

  // Merge workflow history + manual notes into one chronological feed
  const feedItems = useMemo(() => {
    const historyItems = (project.workflowHistory ?? []).map(h => ({
      type: 'workflow' as const,
      ...h,
    }));
    const noteItems = notes.map(n => ({ type: 'note' as const, ...n }));
    return [...historyItems, ...noteItems].sort((a, b) =>
      getTimestamp(b) - getTimestamp(a)  // newest first
    );
  }, [project.workflowHistory, notes]);

  return (
    <div className="p-6 max-w-3xl">
      {/* Composer */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Nhập ghi chú nội bộ về đề tài hoặc gõ # để thêm thẻ..."
          className="w-full min-h-[80px] p-4 text-sm focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 text-slate-400">
            <PaperClipIcon className="w-4 h-4 cursor-pointer hover:text-slate-600" />
            <AtSymbolIcon className="w-4 h-4 cursor-pointer hover:text-slate-600" />
          </div>
          <button
            onClick={() => handleAddNote(draft)}
            disabled={!draft.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg"
          >
            Gửi
          </button>
        </div>
      </div>

      {/* Activity feed */}
      <div className="space-y-5">
        {feedItems.map((item, i) => (
          <ActivityFeedEntry key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
```

```tsx
function ActivityFeedEntry({ item }) {
  const isWorkflow = item.type === 'workflow';
  const date = getEntryDate(item);

  return (
    <div className="flex gap-3">
      <div className="relative flex-shrink-0">
        <Avatar name={item.updatedBy ?? item.author} size="md" />
        {isWorkflow && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-white">
            <ArrowPathIcon className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-blue-600">{item.updatedBy ?? item.author}</p>
        <p className="text-xs text-slate-400">{formatDateSimple(date)} {formatTime(date)}</p>
        <p className="text-sm text-slate-700 mt-1">
          {isWorkflow
            ? <>Chuyển sang bước: <span className="font-semibold">{WORKFLOW_STEPS[item.step - 1]?.label}</span></>
            : item.content
          }
        </p>
      </div>
    </div>
  );
}
```

---

## 6. Right Panel — Decision: Merged Into Center

Per the recommendation in the original analysis (`ProjectDetail-CRM-redesign-analysis.md` §11), the right panel (search + filter, staff dropdown) is **not** a persistent third column here — it only makes sense inside the "Trao đổi" tab, so it's merged there as a search/filter row above the activity feed:

```tsx
// Inside ProjectNoteThread, above the feed:
<div className="flex items-center gap-3 mb-4">
  <div className="relative flex-1">
    <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
    <input
      placeholder="Tìm kiếm ghi chú"
      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
    />
  </div>
  <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
    <option>Tất cả thành viên</option>
  </select>
</div>
```

---

## 7. Section Header Component (Reused, Unchanged)

```tsx
const ACCENT_COLORS = {
  blue:    'border-blue-500 text-blue-600',
  emerald: 'border-emerald-500 text-emerald-600',
  amber:   'border-amber-500 text-amber-600',
  purple:  'border-purple-500 text-purple-600',
  rose:    'border-rose-500 text-rose-600',
};

function SectionHeader({ color, children }) {
  return (
    <h4 className={`text-sm font-bold border-l-4 pl-3 mb-4 ${ACCENT_COLORS[color]}`}>
      {children}
    </h4>
  );
}
```

---

## 8. Color Palette

| Role | Tailwind | Usage |
|---|---|---|
| Left panel icon bg | `bg-blue-100` | Project icon circle |
| Progress bar fill | `bg-emerald-500` | Completion % |
| Quick-info card | `bg-blue-50/40 border-blue-100` | Highlighted box |
| Category badge | `bg-emerald-100 text-emerald-700` | "Sinh viên" tag |
| Progress status — Đúng hạn | `bg-emerald-500 text-white` | Status pill |
| Progress status — Trễ hạn | `bg-red-500 text-white` | Status pill |
| Progress status — Gia hạn | `bg-amber-500 text-white` | Status pill |
| Active tab | `border-blue-600 text-slate-800` | Tab bar |
| Empty state | `text-slate-400 italic` | "Chưa có dữ liệu" / "---" |
| Section I accent | `border-blue-500` | Thông tin chung |
| Section II accent | `border-emerald-500` | Hợp đồng |
| Section III accent | `border-amber-500` | Kinh phí |
| Section IV accent | `border-purple-500` | Thời gian |
| Section V accent | `border-rose-500` | Nghiệm thu |
| Activity feed author | `text-blue-600` | Feed entries |
| Send button | `bg-blue-600` | Note composer |
| Delete icon | `bg-red-50 text-red-500` | Action row |

---

## 9. Migration Checklist

```
□ Build new layout shell
  □ TopBar component (breadcrumb only — site header stays as-is)
  □ Two-column flex layout: LeftPanel (340px fixed) + CenterPanel (fluid)

□ Build LeftPanel
  □ Icon + title + meta row (reuse existing meta string format)
  □ Action icon row (Edit/Schedule/Share/Delete)
  □ Progress bar (reuse currentStep / WORKFLOW_STEPS.length calc)
  □ QuickInfoCard with 6 rows (mã đề tài, số HĐ, chủ nhiệm, khoa, loại đề tài, kinh phí)
  □ Progress status dropdown (reuse getProgressBadge color logic)
  □ Chủ nhiệm row with avatar
  □ Thành viên NC avatar stack (parse existing comma-separated string)

□ Build CenterPanel
  □ Tab bar — 7 tabs
  □ "Chỉnh sửa thông tin" button — persistent, top-right of tab bar
  □ Wire each tab to existing section JSX — NO changes to InfoField usage
  □ "Xét duyệt đề cương" button stays inside "Thông tin chung" tab only
  □ Nhiệm vụ tab — combine WorkflowTimeline + WorkflowTodoList grid (existing components, unchanged)
  □ New: Trao đổi tab — ProjectNoteThread component
    □ Rich text/plain composer
    □ Search + member filter row
    □ Merged activity feed (workflowHistory + new notes), sorted newest-first

□ Data layer
  □ Add `notes` subcollection or field to ResearchProject for the new Trao đổi tab
  □ Parse `researchMembers` string into array for avatar stack

□ Test cases
  □ All 5 existing sections render identically inside their new tabs
  □ Switching tabs preserves scroll position reset (scroll to top per tab)
  □ Empty fields still show "---" / "Chưa có dữ liệu" consistently
  □ Progress % matches the value already used in WorkflowTimeline
  □ Avatar stack overflow (+N) renders correctly for 4+ members
  □ Note composer disabled when empty, Enter does not submit (only Gửi button)
  □ Activity feed correctly interleaves workflow steps and manual notes by timestamp
```
