# View Project Detail Feature — Complete Engineer Instruction
**Trigger:** Clicking the 👁 "View" (Xem chi tiết) button on any row in the DataTable
**Components involved:** `ProjectDetail.tsx`, `WorkflowTimeline.tsx`, `WorkflowTodoList.tsx`
**Pattern:** Full-page takeover — the DataTable is unmounted and `ProjectDetail` fills the content area

---

## 1. Feature Overview & Data Flow

```
DataTable row
  └── 👁 View button (onClick)
        └── onView(project) callback
              └── Parent component sets selectedProject
                    └── Conditionally renders <ProjectDetail project={selectedProject} ... />
                          ├── <WorkflowTimeline />    (Gantt chart — top section)
                          ├── <InfoSections />         (5 collapsible detail groups)
                          └── <WorkflowTodoList />     (per-step task manager — bottom)
```

### Props passed to ProjectDetail

```typescript
interface ProjectDetailProps {
  project: ResearchProject;   // Full project object from DataTable row
  userEmail: string;          // Logged-in user — used when recording workflow step changes
  onBack: () => void;         // Returns to DataTable view
  onUpdate: () => void;       // Refreshes data from DB after any mutation
  onEdit: (p: ResearchProject) => void;  // Opens DataEntry form for full edit
}
```

---

## 2. Page Layout & Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  STICKY HEADER (z-30)                                                │
│  [← Back]  Project Title + Code + Lead Author + Contract ID         │
│  Right: "Nhấp vào nhiệm vụ trong biểu đồ để chuyển bước"           │
│          [Đã hoàn thành quy trình] badge (if step >= max)           │
├──────────────────────────────────────────────────────────────────────┤
│  SCROLLABLE BODY (overflow-y-auto, bg-slate-50)                      │
│                                                                      │
│  ┌─ WorkflowTimeline (Gantt Chart) ──────────────────────────────┐  │
│  │  Sidebar (300px) │ Scrollable Timeline                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─ Thông tin chi tiết đề tài (5 sections) ──────────────────────┐  │
│  │  [Chỉnh sửa thông tin] button (top-right)                     │  │
│  │  I.  Thông tin chung          (blue accent)                   │  │
│  │  II. Hợp đồng & Quyết định    (emerald accent)                │  │
│  │  III. Kinh phí & Phân bổ      (amber accent)                  │  │
│  │  IV. Thời gian & Tiến độ      (purple accent)                 │  │
│  │  V.  Nghiệm thu & Sản phẩm    (rose accent)                   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─ Quản lý nhiệm vụ theo từng bước ─────────────────────────────┐  │
│  │  [WorkflowTodoList step=1] [WorkflowTodoList step=2]           │  │
│  │  [WorkflowTodoList step=3] [WorkflowTodoList step=4] ...       │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Section 1 — Sticky Page Header

### 3.1 Container

| Property | Value |
|---|---|
| **Background** | `bg-white` |
| **Border-bottom** | `border-b border-slate-200` |
| **Padding** | `px-6 py-4` |
| **Position** | `sticky top-0 z-30` |
| **Shadow** | `shadow-sm` |
| **Layout** | `flex items-center justify-between` |

### 3.2 Left Side — Back Button + Project Identity

**Back button:**
- `p-2 hover:bg-slate-100 rounded-full text-slate-500`
- Icon: `←` left arrow SVG, `w-6 h-6`
- Action: `onClick={onBack}` — unmounts ProjectDetail, remounts DataTable

**Project identity (right of back button):**
```
Project Title (text-xl font-bold text-slate-800, break-words)
[ProjectCode mono badge]  •  Lead Author (blue)  •  ContractId (mono)
```

| Element | Style |
|---|---|
| Project code | `font-mono bg-slate-100 px-2 py-0.5 rounded text-sm` |
| Lead author | `font-semibold text-blue-600 text-sm` |
| Contract ID | `font-mono text-sm` (only rendered if `project.contractId` exists) |
| Separator dots | `text-slate-500 text-sm` |

### 3.3 Right Side — Workflow Status Hint

- Text hint: `"Nhấp vào nhiệm vụ trong biểu đồ để chuyển bước"` — `text-xs text-slate-400 italic`
- Completion badge (conditional — only when `currentStep >= WORKFLOW_STEPS.length`):
  - `px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200`
  - Text: `"Đã hoàn thành quy trình"`

---

## 4. Section 2 — WorkflowTimeline (Gantt Chart)

**File:** `WorkflowTimeline.tsx`

### 4.1 Purpose

Renders a horizontal Gantt chart showing all workflow steps, their planned dates, and actual execution dates from history.

### 4.2 Props

```typescript
interface WorkflowTimelineProps {
  project: ResearchProject;
  currentStep: number;           // project.workflowStep || 1
  history?: WorkflowHistoryEntry[];   // project.workflowHistory
  projectTodos?: WorkflowTodo[];      // project.workflowTodos
  projectStartDate?: string;         // project.startDate
  projectEndDate?: string;           // project.endDate
  onStepClick?: (step: number) => void;  // handleStepClick in ProjectDetail
}
```

### 4.3 Layout — Two-Column Structure

```
┌────────────────────────────────────────────────────────────────────┐
│  Header: "Tiến độ thực hiện (Gantt Chart)"  │  Legend (3 colors)  │
├──────────────────┬─────────────────────────────────────────────────┤
│  FIXED SIDEBAR   │  SCROLLABLE TIMELINE (overflow-x-auto)          │
│  w-[300px]       │  min-w-[800px], width: 200%                    │
│  (hidden on      │                                                 │
│   mobile)        │  ┌── Month header row (sticky top-0) ─────────┐ │
│                  │  └──────────────────────────────────────────── │ │
│  [Step badges +  │  ┌── Grid lines (vertical, dashed) ────────── │ │
│   labels list]   │  │   + Today marker (amber vertical line)      │ │
│                  │  └──────────────────────────────────────────── │ │
│  Clicks scroll   │  [Colored bars for each step row]              │ │
│  to that step's  │                                                 │ │
│  TodoList        │                                                 │ │
└──────────────────┴─────────────────────────────────────────────────┘
```

### 4.4 Sidebar Column

| Property | Value |
|---|---|
| **Width** | `w-[300px] flex-shrink-0` |
| **Visibility** | `hidden md:block` — hidden on mobile |
| **Border-right** | `border-r border-slate-100` |
| **Header cell** | `sticky top-0 bg-slate-50 h-10` — `"Nhiệm vụ"` label |

**Step badge in sidebar:**

| Status | Badge style |
|---|---|
| `completed` | `bg-emerald-100 text-emerald-600 border-emerald-200` — shows `✓` |
| `current` | `bg-blue-100 text-blue-600 border-blue-200` — shows step number |
| `upcoming` | `bg-slate-50 text-slate-400 border-slate-200` — shows step number |

**Step label:**
- `text-sm truncate font-medium`
- `text-slate-400` if upcoming, `text-slate-700` if current/completed

**Click behavior:**
- Calls `onStepClick(step.step)` → in `ProjectDetail.handleStepClick`
- Scrolls to `#todo-section-{step}` via `scrollIntoView({ behavior: 'smooth', block: 'center' })`
- If clicking a different step: shows `window.confirm()` asking to change the workflow step

### 4.5 Timeline Bars

**Bar color by status:**

| Status | Color | Notes |
|---|---|---|
| `completed` | `bg-emerald-500` | Solid green |
| `current` | `bg-blue-500 animate-pulse` | Pulsing blue |
| `upcoming` | `bg-slate-300 opacity-60` | Muted gray |

**Bar geometry:**
- `left` % = `(stepStart - viewStart) / totalDays * 100`
- `width` % = `(stepEnd - stepStart) / totalDays * 100` (minimum 0.5%)
- `height: h-4 mt-2 rounded-full`

**Hover tooltip:**
- `opacity-0 group-hover:opacity-100` — absolute positioned above bar
- `bg-slate-800 text-white text-[10px] px-2 py-1 rounded`
- Shows step label only

### 4.6 Today Marker

- `position: absolute` vertical line at `left: todayLeft%`
- Color: `bg-amber-500`, width `w-0.5`
- Label: `"Hôm nay"` badge at top — `bg-amber-500 text-white text-[9px] font-bold px-1 rounded`
- Hidden if today is outside the view window (`todayLeft < 0`)

### 4.7 Date Calculation Logic (`parseDate`)

Handles three input formats:
1. **Excel serial numbers** (`> 20000 && < 100000`): `(serial - 25569) * 86400 * 1000`
2. **DD/MM/YYYY**: Manual string split — avoids timezone issues
3. **YYYY-MM-DD**: Manual string split — avoids timezone issues
4. **Fallback**: `new Date(str)` — returns epoch for invalid values

**View window:** Project start/end dates with ±1 month buffer. Scrolls to today on mount.

---

## 5. Section 3 — Thông Tin Chi Tiết Đề Tài (Info Panel)

A white card (`bg-white p-6 rounded-2xl shadow-sm border border-slate-200`) with 5 sub-sections.

### 5.1 Section Header Row

| Element | Value |
|---|---|
| **Title** | `"Thông tin chi tiết đề tài"` — `text-lg font-bold text-slate-800` + info circle icon |
| **Edit button** | `"Chỉnh sửa thông tin"` — `px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold` |
| **Edit action** | `onClick={() => onEdit(project)}` → opens full DataEntry form, **does not** use inline editing |

> **Important:** The "Chỉnh sửa thông tin" button calls `onEdit(project)` — this navigates to the full `DataEntry` form component, not inline editing. There is a separate inline editing mode (`isEditing` state) for summary fields, but it's only activated by `handleEditSummary()` which is **not exposed in the UI** (no button visible for it). The primary edit path is via `onEdit`.

### 5.2 `InfoField` Sub-Component

Every data field uses this shared component:

```typescript
interface InfoFieldProps {
  label: string;
  value: any;
  isEditing?: boolean;
  type?: string;          // 'text' | 'date' | 'number'
  onChange?: (val: any) => void;
  className?: string;
  isCurrency?: boolean;   // adds comma formatting + 'VNĐ' suffix
  isDate?: boolean;       // forces formatDate() display
}
```

**View mode (isEditing = false):**
- Label: `text-[11px] font-bold uppercase tracking-tight text-slate-500`
- Value: `font-semibold text-slate-700 break-words`
- Currency values: `font-mono text-blue-600` + ` VNĐ` suffix + comma-formatted
- Empty values: `"---"` displayed
- Date values: passed through `formatDate()` — handles Excel serials + ISO strings → `DD/MM/YYYY`

**Edit mode (isEditing = true):**
- Renders `<input type={type}>` with `border border-slate-200 rounded-lg p-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500`
- Date inputs: value converted via `new Date(value).toISOString().split('T')[0]`

### 5.3 Five Section Groups

Each group has a `<h4>` heading with a left colored accent bar (`border-l-4 pl-2`):

#### I. Thông tin chung (Blue accent `border-blue-500`)

Grid: `grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6`

| Field | Col span | Notes |
|---|---|---|
| Tên đề tài | full row (`lg:col-span-4`) | Paired with Trạng thái badge (view mode) |
| Chủ nhiệm | 1 | |
| Giới tính | 1 | |
| Năm sinh | 1 | |
| Khoa/Đơn vị | 1 | |
| Bộ môn | 1 | |
| Lĩnh vực NC | 1 | |
| Loại hình NC | 1 | |
| Loại đề tài | 1 | Tags: `text-[10px] px-2 py-0.5 rounded bg-slate-100 border text-slate-600` — edit: comma-separated input |
| Thành viên NC | `md:col-span-2 lg:col-span-3` | |

**Trạng thái badge** (right of title, view mode only):

| `currentStep` range | Badge colors | Label |
|---|---|---|
| `< 10` | `text-blue-600 bg-blue-50 border-blue-100` | `"Xét duyệt đề cương"` |
| `10–14` | `text-amber-600 bg-amber-50 border-amber-100` | `"Báo cáo tiến độ & giám định"` |
| `15–19` | `text-purple-600 bg-purple-50 border-purple-100` | `"Sắp nghiệm thu"` |
| `≥ 20` | `text-emerald-600 bg-emerald-50 border-emerald-100` | `"Hoàn thành"` |

#### II. Hợp đồng & Quyết định (Emerald accent `border-emerald-500`)

Grid: `grid-cols-1 md:grid-cols-3 gap-6`

| Field | Col span |
|---|---|
| Số Hợp đồng | 1 |
| Ngày ký HĐ | 1 (date) |
| QĐ Xét duyệt | 1 |
| QĐ Phê duyệt | 1 |
| Số GCN kết quả | 1 |
| Ngày cấp GCN | 1 (date) |
| Cơ quan cấp GCN | `md:col-span-2` |

#### III. Kinh phí & Phân bổ (Amber accent `border-amber-500`)

Grid: `grid-cols-1 md:grid-cols-4 gap-6`

| Field | Notes |
|---|---|
| Tổng kinh phí | `isCurrency` + `font-bold text-blue-700` |
| Kinh phí khoán | `isCurrency` |
| Kinh phí không khoán | `isCurrency` |
| Nguồn khác | `isCurrency` |
| Cấp đợt 1 | `isCurrency` |
| Cấp đợt 2 | `isCurrency` |
| Cấp đợt 3 | `isCurrency` |

#### IV. Thời gian & Tiến độ (Purple accent `border-purple-500`)

Grid: `grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6`

| Field | Type | Notes |
|---|---|---|
| Thời gian TH | text | Duration text |
| Bắt đầu | date | |
| Kết thúc | date | |
| Gia hạn | date | `className="text-amber-600"` |
| Tiến độ thực hiện | text | |
| Báo cáo Giám định | date | |
| BC Tiến độ 1–4 | date × 4 | |
| Ngày nhắc | date | |
| Ghi chú báo cáo | text | `md:col-span-2 lg:col-span-3` |

#### V. Nghiệm thu & Sản phẩm (Rose accent `border-rose-500`)

Grid: `grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6`

| Field | Col span | Type / Notes |
|---|---|---|
| Ngày họp NT | 1 | date |
| Thời điểm NT | 1 | date |
| Năm nghiệm thu | 1 | text |
| Năm học NT | 1 | text |
| Sản phẩm đầu ra | `md:col-span-2` | text |
| Chi tiết SP thực tế | `md:col-span-2` | text |
| Sản phẩm cam kết | `md:col-span-2` | Tag list: `bg-blue-50 text-blue-700 border-blue-100` pills |
| Sản phẩm thực tế | `md:col-span-2` | Tag list: `bg-emerald-50 text-emerald-700 border-emerald-100` pills |
| Lý do thanh lý | `md:col-span-2 lg:col-span-2` | text |
| Đề tài chuyển tiếp | — | Checkbox — disabled in view mode, enabled in edit mode |

**Product pill format:** `{type}: {count}` — e.g., `"Bài báo: 2"` — `text-xs font-semibold px-2 py-1 rounded`

---

## 6. Section 4 — WorkflowTodoList (Step Task Manager)

**File:** `WorkflowTodoList.tsx`

### 6.1 Layout

- Section heading: `"Quản lý nhiệm vụ theo từng bước"` — `text-xl font-bold text-slate-800` + clipboard icon
- Grid: `grid-cols-1 lg:grid-cols-2 gap-8`
- Renders **one `WorkflowTodoList` per workflow step** (all steps, not just current)

### 6.2 Props

```typescript
interface WorkflowTodoListProps {
  project: ResearchProject;
  step: number;           // 1-based step index
  onUpdate: () => void;   // refreshes parent data
}
```

### 6.3 Individual Step Card Design

Each step card is `bg-white p-6 rounded-2xl shadow-sm border`:

| State | Border style |
|---|---|
| Current step | `border-blue-300 ring-2 ring-blue-50` |
| Other steps | `border-slate-200` |

**Card header:**
```
BƯỚC {step}           ← text-[10px] font-bold text-blue-500 uppercase tracking-widest
{step label}          ← text-base font-bold text-slate-800
                  [Đã hoàn thành / Chưa hoàn thành ☐]  ← right side
```

**Completion checkbox:**
- `checked={isCompleted}` — true if `project.workflowStep > step`
- `onChange`: `onClick` handler calls `handleToggleComplete()`
- Style: `w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500`
- Label text: `"Đã hoàn thành"` (emerald) or `"Chưa hoàn thành"` (slate)
- Toggle logic: if not completed → `workflowService.setWorkflowStep(id, step + 1)` | if completed → `workflowService.setWorkflowStep(id, step)`

### 6.4 Expected Dates Block

**Section label:** `"Thời gian dự kiến"` — `text-[10px] uppercase font-bold text-slate-500` + calendar icon (blue)

Two date inputs side by side (`grid-cols-2 gap-3`):

| Input | Source field | Style |
|---|---|---|
| Bắt đầu | `stepDates.expectedStart` | `bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500` |
| Kết thúc | `stepDates.expectedEnd` | Same style |

Each input has a floating label: `absolute -top-2 left-2 px-1 bg-white text-[9px] text-slate-400 font-bold uppercase`

**Save behavior:** `onChange` calls `workflowService.updateStepDates(project.id, step, { ...stepDates, [field]: value })` then `onUpdate()`

### 6.5 Actual Dates Block

**Section label:** `"Thời gian thực hiện thực tế"` — `text-[10px] uppercase font-bold text-amber-500` + clock icon (amber)

**Background:** `pt-2 border-t border-slate-100`

Two date inputs side by side:

| Input | Source | Style |
|---|---|---|
| Bắt đầu | `stepDates.actualStart` or auto-filled from `historyStart` | `bg-amber-50/30 border-amber-100 text-amber-900 focus:ring-amber-500` |
| Kết thúc | `stepDates.actualEnd` or auto-filled from `historyEnd` | Same amber style |

**Floating label color:** `text-amber-400` (vs `text-slate-400` for expected)

**Auto-fill from history:**
- `historyStart`: `workflowHistory.find(h => h.step === step).updatedAt` — when step was entered
- `historyEnd`: `workflowHistory.find(h => h.step > step).updatedAt` — when step was exited
- If auto-filled (not manually set): shows note `"* Tự động ghi nhận từ lịch sử hệ thống"` — `text-[10px] text-amber-600 font-medium italic`

---

## 7. Workflow Step Navigation Logic (`handleStepClick`)

This is the primary interactive feature of the View page. Clicking any step in the Gantt chart sidebar OR the step bars triggers this:

```typescript
const handleStepClick = async (stepIndex: number) => {
  // Step 1: Always scroll to that step's TodoList card
  const todoElement = document.getElementById(`todo-section-${stepIndex}`);
  if (todoElement) {
    todoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Step 2: If clicking the current step, no workflow change
  if (stepIndex === currentStep) return;

  // Step 3: Determine forward vs backward
  const isRevert = stepIndex < currentStep;
  const action = isRevert ? 'quay lại' : 'chuyển đến';

  // Step 4: User confirmation dialog
  if (!window.confirm(`Bạn có chắc chắn muốn ${action} bước: "${WORKFLOW_STEPS[stepIndex - 1]?.label}"?`)) {
    return;
  }

  // Step 5: API call
  setIsUpdating(true);
  try {
    await workflowService.setWorkflowStep(project.id, stepIndex, userEmail, isRevert);
    onUpdate();  // refresh project data
  } catch {
    alert("Cập nhật quy trình thất bại. Vui lòng thử lại.");
  } finally {
    setIsUpdating(false);
  }
};
```

---

## 8. `formatDate` Utility (Used in `InfoField`)

Handles dirty data from Excel imports — must be ported exactly.

| Input format | Detection | Output |
|---|---|---|
| Excel serial (e.g. `45000`) | numeric string, 20000 < n < 100000 | `DD/MM/YYYY` via UTC methods |
| ISO `YYYY-MM-DD` | regex `/^\d{4}-\d{2}-\d{2}$/` | `DD/MM/YYYY` via manual split (no `new Date()`) |
| Already `DD/MM/YYYY` | regex `/^\d{1,2}\/\d{1,2}\/\d{4}/` | returned as-is |
| Other strings | `new Date(str)` fallback | `DD/MM/YYYY` or original string if invalid |
| Null/empty | — | `"---"` |

> **Critical:** YYYY-MM-DD conversion must use manual string split, NOT `new Date()`. JavaScript parses ISO dates as UTC midnight, causing a timezone off-by-one-day error in UTC+7 environments.

---

## 9. State Variables in `ProjectDetail`

| State | Type | Default | Purpose |
|---|---|---|---|
| `isUpdating` | `boolean` | `false` | Loading state during workflow step changes and saves |
| `isEditing` | `boolean` | `false` | Toggles inline edit mode for summary fields |
| `editData` | `Partial<ResearchProject>` | `{}` | Stores changes during inline edit session |

---

## 10. Service Calls

| Action | Service method | Trigger |
|---|---|---|
| Change workflow step | `workflowService.setWorkflowStep(id, step, email, isRevert)` | Timeline step click |
| Toggle step completion | `workflowService.setWorkflowStep(id, step ± 1, 'user')` | Checkbox in TodoList |
| Update step dates | `workflowService.updateStepDates(id, step, dates)` | Date input change in TodoList |
| Save summary edits | `dbService.saveProject(updatedProject)` | Inline save (not exposed in UI) |

---

## 11. Component Tree

```
<ProjectDetail project onBack onUpdate onEdit userEmail>
  │
  ├── [Sticky Header]
  │     ├── Back button (← arrow)
  │     ├── Project title + code + author + contract
  │     └── Hint text / Completion badge
  │
  ├── <WorkflowTimeline
  │       project currentStep history projectTodos
  │       projectStartDate projectEndDate onStepClick>
  │     ├── [Chart header + legend]
  │     ├── [Fixed sidebar — step list]
  │     └── [Scrollable Gantt bars + today marker]
  │
  ├── [Thông tin chi tiết card]
  │     ├── [Card header + Chỉnh sửa button → onEdit()]
  │     ├── [Section I — Thông tin chung]    blue accent
  │     ├── [Section II — Hợp đồng]          emerald accent
  │     ├── [Section III — Kinh phí]         amber accent
  │     ├── [Section IV — Thời gian]         purple accent
  │     └── [Section V — Nghiệm thu]         rose accent
  │
  └── [Quản lý nhiệm vụ section]
        └── {WORKFLOW_STEPS.map(s =>
              <WorkflowTodoList
                  project step={s.step} onUpdate>
                ├── [Step header + completion checkbox]
                ├── [Expected dates — blue theme]
                └── [Actual dates — amber theme + auto-fill note]
            )}
```

---

## 12. Key Implementation Notes

1. **Full-page replacement pattern** — `ProjectDetail` does not render as a modal or drawer. The parent conditionally renders either `<DataTable>` or `<ProjectDetail>` based on a `selectedProject` state. `onBack` resets this to null.

2. **Scroll-to-step coordination** — `WorkflowTodoList` renders each card with `id="todo-section-{step}"`. The timeline click handler uses `document.getElementById()` to scroll to the matching card. This requires the IDs to be exact.

3. **`currentStep` is 1-based** — `project.workflowStep || 1`. The first step is `1`, not `0`. `WORKFLOW_STEPS[stepIndex - 1]` is used for label lookup.

4. **Inline editing is implemented but not exposed** — `isEditing`, `editData`, `handleEditSummary`, `handleSaveSummary` exist in the code but the toggle button is NOT rendered in the current UI. The only edit path shown is `onEdit(project)` → full DataEntry form.

5. **`workflowService.setWorkflowStep` params** — signature is `(projectId, targetStep, userEmail, isRevert?)`. The `isRevert` boolean allows going backwards in the workflow.

6. **TodoList `id` attribute** — `id={`todo-section-${step}`}` — this is how the Gantt timeline clicking scrolls to the right section. If the ID format changes, cross-component scroll breaks.

7. **Timeline auto-scroll on mount** — `useEffect` in `WorkflowTimeline` scrolls the horizontal timeline to center on today's date using `scrollLeft = (todayLeft / 100) * scrollWidth - clientWidth / 2`.

8. **Product tags in Section V** — `expectedProducts` and `actualProducts` are arrays of `{ type: string, count: number }`. They are rendered as static badge pills in view mode — there is no inline edit for these fields. Editing products requires going through the full `onEdit()` form.

9. **`window.confirm()` for step changes** — deliberate UX friction to prevent accidental workflow state changes. Do not replace with a silent click.

10. **`isUpdating` blocks UI during async** — while a step change or save is in progress, `isUpdating = true`. Add `disabled={isUpdating}` to interactive elements (checkboxes, timeline clicks) to prevent double-submission.
