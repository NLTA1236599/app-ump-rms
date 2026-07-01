# Notification Bell Feature — Deadline Alerts for Notes & Projects
**Trigger:** New 🔔 bell icon in the header's right section, positioned **before** the "Đăng xuất" button
**Purpose:** Alert users to notes and projects approaching their approval deadline within 30 days
**Depends on:** `BHXH-header-analysis.md` (header structure), `ProjectDetail-CRM-concrete-spec.md` (notes/project data model)

---

## 1. Where This Lives — Header Integration

### 1.1 Updated Right Section Layout

Per `BHXH-header-analysis.md` §2.3, the right section is `flex items-center gap-4` containing the account name and logout button. The bell icon is inserted **between** them:

```
Before:  [Account name]  [Đăng xuất]
After:   [Account name]  [🔔 Bell]  [Đăng xuất]
```

```tsx
// ✅ Updated right section — src/components/Header/IdentityBar.tsx
<div className="flex items-center gap-4">
  <span className="text-sm text-white font-medium truncate max-w-[200px]">
    {currentUser?.name ?? currentUser?.email ?? 'Tài khoản'}
  </span>

  {/* NEW: Notification bell — inserted here, before logout */}
  <NotificationBell />

  <button
    onClick={logout}
    className="flex items-center gap-2 border border-white/20 rounded-full px-3 py-1.5 text-sm font-medium text-white bg-transparent hover:bg-red-500/80 hover:border-red-400 transition-all duration-150"
    aria-label="Đăng xuất khỏi hệ thống"
  >
    <LogOutIcon className="w-4 h-4" />
    Đăng xuất
  </button>
</div>
```

---

## 2. Bell Icon Design

### 2.1 Default State

| Property | Value |
|---|---|
| **Shape** | Circle button, `w-9 h-9 rounded-full` |
| **Background** | `bg-transparent` |
| **Hover** | `hover:bg-white/10` |
| **Icon** | `BellIcon` (outline), `w-5 h-5 text-white` |
| **Cursor** | `cursor-pointer` |
| **Transition** | `transition-colors duration-150` |
| **Position** | `relative` — needed for the badge overlay |

### 2.2 Badge (Unread Count)

| Property | Value |
|---|---|
| **Visibility** | Only rendered when `unreadCount > 0` |
| **Shape** | Circle, `min-w-[18px] h-[18px]` |
| **Position** | `absolute -top-0.5 -right-0.5` |
| **Background** | `bg-red-500` |
| **Text** | `text-white text-[10px] font-bold` |
| **Border** | `border-2 border-[#005b8e]` — matches identity bar background so the badge "cuts into" the bell cleanly |
| **Content** | Count, capped at `"9+"` if `unreadCount > 9` |

```tsx
// ✅ NotificationBell.tsx
function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllRead } = useDeadlineNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors duration-150"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <BellIcon className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center
                           bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-[#005b8e] px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onMarkAllRead={markAllRead}
        />
      )}
    </div>
  );
}
```

### 2.3 Active/Open State (Bell Clicked)

| Property | Value |
|---|---|
| **Background** | `bg-white/15` — slightly highlighted while dropdown is open |
| **Icon variant** | Switch to filled `BellIconSolid` while open (optional, subtle visual feedback) |

---

## 3. Notification Dropdown Panel

### 3.1 Container

| Property | Value |
|---|---|
| **Position** | `absolute right-0 top-full mt-2` |
| **Width** | `w-96` (384px) |
| **Max-height** | `max-h-[480px]` with `overflow-y-auto` on the list |
| **Background** | `bg-white` |
| **Border-radius** | `rounded-2xl` |
| **Shadow** | `shadow-2xl` |
| **Border** | `border border-slate-200` |
| **Z-index** | `z-50` — above header and page content |
| **Click outside** | Closes the dropdown (use a ref + document click listener) |

### 3.2 Dropdown Header

| Property | Value |
|---|---|
| **Layout** | `flex items-center justify-between px-4 py-3 border-b border-slate-100` |
| **Title** | `"Thông báo"` — `text-sm font-bold text-slate-800` |
| **Count text** | `"{N} thông báo mới"` — `text-xs text-slate-400`, only shown if `unreadCount > 0` |
| **Action** | `"Đánh dấu đã đọc"` link — `text-xs text-blue-600 hover:underline`, calls `onMarkAllRead` |

```tsx
<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
  <div>
    <h3 className="text-sm font-bold text-slate-800">Thông báo</h3>
    {unreadCount > 0 && (
      <p className="text-xs text-slate-400">{unreadCount} thông báo mới</p>
    )}
  </div>
  {notifications.length > 0 && (
    <button onClick={onMarkAllRead} className="text-xs text-blue-600 hover:underline">
      Đánh dấu đã đọc
    </button>
  )}
</div>
```

### 3.3 Notification List — Empty State

```tsx
{notifications.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <CheckCircleIcon className="w-12 h-12 text-emerald-400 mb-3" />
    <p className="text-sm font-semibold text-slate-600">Không có thông báo mới</p>
    <p className="text-xs text-slate-400 mt-1">Không có đề tài nào sắp đến hạn xét duyệt.</p>
  </div>
)}
```

### 3.4 Notification Item Design

Each item represents either a **project** or a **note** approaching deadline.

```
┌──────────────────────────────────────────────────────────┐
│  [●] [📄/📝 icon]  Project/Note title (truncated, bold)  │
│       Còn 12 ngày đến hạn xét duyệt                      │
│       Hạn: 15/07/2026                          [Xem]      │
└──────────────────────────────────────────────────────────┘
```

| Element | Style |
|---|---|
| **Unread dot** | `w-2 h-2 rounded-full bg-blue-500`, hidden once read |
| **Type icon** | `DocumentTextIcon` (project) or `PencilSquareIcon` (note), `w-4 h-4`, colored by urgency (see §4) |
| **Title** | `text-sm font-semibold text-slate-800 line-clamp-1` |
| **Days remaining** | `text-xs`, color-coded by urgency (see §4) |
| **Deadline date** | `text-xs text-slate-400` — `"Hạn: dd/mm/yyyy"` |
| **"Xem" button** | `text-xs font-medium text-blue-600 hover:underline`, right-aligned |
| **Item padding** | `px-4 py-3` |
| **Item hover** | `hover:bg-slate-50` |
| **Item border** | `border-b border-slate-100` (no border on last item) |
| **Unread background** | `bg-blue-50/40` — subtle tint distinguishing unread from read |

```tsx
function NotificationItem({ item, onView }: { item: DeadlineNotification, onView: () => void }) {
  const urgency = getUrgencyLevel(item.daysRemaining);

  return (
    <div
      onClick={onView}
      className={`flex items-start gap-3 px-4 py-3 border-b border-slate-100 last:border-0
                 cursor-pointer hover:bg-slate-50 transition-colors
                 ${!item.isRead ? 'bg-blue-50/40' : ''}`}
    >
      {/* Unread dot */}
      <div className="flex-shrink-0 mt-1.5">
        {!item.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 block" />}
      </div>

      {/* Type icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${urgency.iconBg}`}>
        {item.entityType === 'project'
          ? <DocumentTextIcon className={`w-4 h-4 ${urgency.iconColor}`} />
          : <PencilSquareIcon className={`w-4 h-4 ${urgency.iconColor}`} />
        }
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.title}</p>
        <p className={`text-xs font-medium mt-0.5 ${urgency.textColor}`}>
          Còn {item.daysRemaining} ngày đến hạn {item.deadlineLabel}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Hạn: {formatDate(item.deadlineDate)}</p>
      </div>

      <button className="text-xs font-medium text-blue-600 hover:underline flex-shrink-0 self-center">
        Xem
      </button>
    </div>
  );
}
```

### 3.5 Dropdown Footer

```tsx
<div className="px-4 py-2.5 border-t border-slate-100 text-center">
  <button
    onClick={() => { onClose(); navigate('/thong-bao'); }}
    className="text-xs font-medium text-blue-600 hover:underline"
  >
    Xem tất cả thông báo
  </button>
</div>
```

---

## 4. Urgency Color Coding

The closer the deadline, the more alarming the color:

| Days remaining | Tier | Icon bg | Icon color | Text color |
|---|---|---|---|---|
| `22–30` | Low urgency | `bg-blue-50` | `text-blue-500` | `text-blue-600` |
| `8–21` | Medium urgency | `bg-amber-50` | `text-amber-500` | `text-amber-600` |
| `0–7` | High urgency | `bg-red-50` | `text-red-500` | `text-red-600` |
| `< 0` (overdue) | Critical | `bg-red-100` | `text-red-600` | `text-red-700 font-bold` |

```typescript
// src/utils/notificationUrgency.ts
export function getUrgencyLevel(daysRemaining: number) {
  if (daysRemaining < 0) {
    return {
      tier: 'critical',
      iconBg: 'bg-red-100', iconColor: 'text-red-600', textColor: 'text-red-700 font-bold',
      label: 'Đã quá hạn',
    };
  }
  if (daysRemaining <= 7) {
    return {
      tier: 'high',
      iconBg: 'bg-red-50', iconColor: 'text-red-500', textColor: 'text-red-600',
      label: 'Sắp hết hạn',
    };
  }
  if (daysRemaining <= 21) {
    return {
      tier: 'medium',
      iconBg: 'bg-amber-50', iconColor: 'text-amber-500', textColor: 'text-amber-600',
      label: 'Cần chú ý',
    };
  }
  return {
    tier: 'low',
    iconBg: 'bg-blue-50', iconColor: 'text-blue-500', textColor: 'text-blue-600',
    label: 'Sắp đến hạn',
  };
}
```

---

## 5. Core Data Logic — Deadline Detection

### 5.1 What Counts as a "Deadline" for Each Entity Type

| Entity | Deadline field | Notes |
|---|---|---|
| **Project** | `project.approvalDeadline` or derived from `QĐ Xét duyệt` workflow step expected date | "Hạn xét duyệt" |
| **Note** | `note.dueDate` (if notes support a due date) — or if notes don't have a deadline concept, **skip notes entirely and only notify on projects** | "Hạn xử lý ghi chú" |

> **Clarification needed:** The current data model (`ResearchProject`) does not have an explicit "note deadline" field — notes added via the new "Trao đổi" tab (`ProjectDetail-CRM-concrete-spec.md` §5.3) are plain timestamped comments with no due date. **Recommendation:** Interpret "notes" as **notes/projects pending approval action** — i.e., projects whose `workflowStep` indicates they are awaiting a review/approval decision (steps tagged as approval gates in `WORKFLOW_STEPS`), using the **expected date for that step** as the deadline.

### 5.2 Deadline Source — Using Existing `workflowStepDates`

Reuse the existing `project.workflowStepDates[step].expectedEnd` field (already collected via `WorkflowTodoList.tsx`) as the approval deadline for whichever step represents "Xét duyệt" or "Phê duyệt":

```typescript
// src/utils/detectDeadlineNotifications.ts
import { ResearchProject, WORKFLOW_STEPS } from '../types';

export interface DeadlineNotification {
  id: string;                  // `${entityType}-${entityId}-${step}`
  entityType: 'project' | 'note';
  entityId: string;
  title: string;               // project title or note summary
  deadlineDate: Date;
  daysRemaining: number;
  deadlineLabel: string;       // "xét duyệt" | "phê duyệt" | "nghiệm thu"
  isRead: boolean;
  createdAt: Date;
}

// Steps in WORKFLOW_STEPS that represent an approval gate
const APPROVAL_STEPS = [
  { step: 2,  label: 'xét duyệt' },   // "QĐ Xét duyệt"
  { step: 3,  label: 'phê duyệt' },   // "QĐ Phê duyệt"
  { step: 18, label: 'nghiệm thu' },  // "Ngày họp NT" / acceptance review
  // Adjust step numbers to match your actual WORKFLOW_STEPS config
];

const NOTIFICATION_WINDOW_DAYS = 30;

export function detectDeadlineNotifications(
  projects: ResearchProject[]
): DeadlineNotification[] {
  const now = new Date();
  const results: DeadlineNotification[] = [];

  for (const project of projects) {
    // Only consider projects that are NOT yet completed/liquidated
    if (project.status === 'COMPLETED' || project.status === 'LIQUIDATED') continue;

    for (const approvalStep of APPROVAL_STEPS) {
      // Only relevant if the project is at or before this step
      if ((project.workflowStep ?? 1) > approvalStep.step) continue;

      const stepDates = project.workflowStepDates?.[approvalStep.step];
      const expectedEnd = stepDates?.expectedEnd;
      if (!expectedEnd) continue;

      const deadlineDate = new Date(expectedEnd);
      if (isNaN(deadlineDate.getTime())) continue;

      const daysRemaining = Math.ceil(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only include if within the 30-day window (or already overdue)
      if (daysRemaining > NOTIFICATION_WINDOW_DAYS) continue;

      results.push({
        id: `project-${project.id}-${approvalStep.step}`,
        entityType: 'project',
        entityId: project.id,
        title: project.title ?? 'Đề tài không tên',
        deadlineDate,
        daysRemaining,
        deadlineLabel: approvalStep.label,
        isRead: false, // overridden by read-state store, see §5.3
        createdAt: now,
      });
    }
  }

  // Sort: overdue and most urgent first
  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
```

### 5.3 Read/Unread State Persistence

Notifications need a persisted "read" flag that survives page reloads and logins:

```typescript
// src/hooks/useDeadlineNotifications.ts
import { useState, useEffect, useMemo } from 'react';
import { detectDeadlineNotifications } from '../utils/detectDeadlineNotifications';

const READ_IDS_STORAGE_KEY = 'ump_rms_read_notification_ids';

export function useDeadlineNotifications(projects: ResearchProject[]) {
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(READ_IDS_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const rawNotifications = useMemo(
    () => detectDeadlineNotifications(projects),
    [projects]
  );

  const notifications = useMemo(
    () => rawNotifications.map(n => ({ ...n, isRead: readIds.has(n.id) })),
    [rawNotifications, readIds]
  );

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  const markAllRead = () => {
    const allIds = new Set([...readIds, ...notifications.map(n => n.id)]);
    setReadIds(allIds);
    localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify([...allIds]));
  };

  const markOneRead = (id: string) => {
    const updated = new Set(readIds).add(id);
    setReadIds(updated);
    localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify([...updated]));
  };

  return { notifications, unreadCount, markAllRead, markOneRead };
}
```

> **Note on persistence:** `localStorage` is per-browser, not per-account on the server. For a true multi-device "read" state tied to the admin account, store `readNotificationIds: string[]` on the user's Firestore document instead. The `localStorage` approach is the minimal-effort version; upgrade to Firestore-backed read-state if cross-device sync is required.

---

## 6. "Xem" Button Navigation

Clicking "Xem" on a notification item navigates to that project's detail view and opens the relevant tab:

```typescript
const handleViewNotification = (item: DeadlineNotification) => {
  markOneRead(item.id);
  setIsOpen(false);

  if (item.entityType === 'project') {
    const project = projects.find(p => p.id === item.entityId);
    if (project) {
      onView(project);                       // existing onView callback → opens ProjectDetail
      setActiveTab('thong-tin-chung');        // or 'nhiem-vu' for approval-step context
    }
  }
};
```

---

## 7. "Xem Tất Cả Thông Báo" — Full Notifications Page (Optional Extension)

For users with many pending deadlines, a dedicated page is more usable than a small dropdown:

### 7.1 Route & Sidebar Entry

Add as a route `/thong-bao`, optionally also as a sidebar item:

```typescript
// src/config/sidebarMenus.ts — could add a top-level entry, separate from any single tab's sidebar
{
  id: 'thong-bao',
  label: 'Thông báo',
  icon: 'BellIcon',
  href: '/thong-bao',
}
```

### 7.2 Page Layout

Reuses the same `NotificationItem` component, full-width, with filtering:

```
┌─────────────────────────────────────────────────────────┐
│  Thông báo                                               │
│  [Tất cả] [Chưa đọc] [Quá hạn]      [Đánh dấu tất cả đã đọc] │
├─────────────────────────────────────────────────────────┤
│  NotificationItem (full width, same design as dropdown)  │
│  NotificationItem                                         │
│  ...                                                      │
└─────────────────────────────────────────────────────────┘
```

```tsx
function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markOneRead } = useDeadlineNotifications(projects);
  const [filter, setFilter] = useState<'all' | 'unread' | 'overdue'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread')  return !n.isRead;
    if (filter === 'overdue') return n.daysRemaining < 0;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">Thông báo</h1>
        <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {(['all', 'unread', 'overdue'] as const).map(f => (
          <FilterTab key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Tất cả' : f === 'unread' ? 'Chưa đọc' : 'Quá hạn'}
          </FilterTab>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.map(n => (
          <NotificationItem key={n.id} item={n} onView={() => handleViewNotification(n)} />
        ))}
      </div>
    </div>
  );
}
```

---

## 8. State & Data Flow Summary

```
ResearchProject[] (from Firestore)
       │
       ▼
detectDeadlineNotifications(projects)   ← pure function, O(n × approval_steps)
       │
       ▼
DeadlineNotification[]  (raw, all isRead = false)
       │
       ▼  + readIds from localStorage
useDeadlineNotifications hook
       │
       ▼
{ notifications, unreadCount, markAllRead, markOneRead }
       │
       ├──► NotificationBell (badge count)
       └──► NotificationDropdown (list render)
```

| Variable | Type | Source |
|---|---|---|
| `notifications` | `DeadlineNotification[]` | Computed from `projects` + `readIds` |
| `unreadCount` | `number` | Derived — `notifications.filter(n => !n.isRead).length` |
| `isOpen` | `boolean` | Local state in `NotificationBell` |
| `readIds` | `Set<string>` | `localStorage` (or Firestore user doc) |

---

## 9. SOLID Compliance

| Principle | Implementation |
|---|---|
| **SRP** | `detectDeadlineNotifications` is a pure utility function — no React, no UI. `NotificationBell`, `NotificationDropdown`, `NotificationItem` are each single-purpose components |
| **OCP** | Adding a new approval-gate step only requires adding an entry to `APPROVAL_STEPS` — no changes to detection logic, UI components, or hooks |
| **LSP** | `DeadlineNotification` is a single union-friendly shape for both `'project'` and `'note'` entity types — any consumer of the array works the same regardless of which type populates it |
| **ISP** | `NotificationItem` receives only a single `DeadlineNotification` object — not the full `ResearchProject` or app state |
| **DIP** | UI components depend on the `useDeadlineNotifications` hook abstraction, not on `localStorage` or Firestore directly — swapping the persistence backend requires no component changes |

---

## 10. Color Palette (New Additions)

| Role | Tailwind | Hex | Usage |
|---|---|---|---|
| Bell icon | `text-white` | `#ffffff` | Default state on dark header |
| Bell hover bg | `bg-white/10` | — | Hover state |
| Bell active bg | `bg-white/15` | — | Dropdown open state |
| Unread badge | `bg-red-500` | `#ef4444` | Count badge |
| Badge border | `border-[#005b8e]` | `#005b8e` | Matches identity bar bg |
| Unread item bg | `bg-blue-50/40` | — | Highlights unread notifications |
| Urgency: low | `text-blue-600` / `bg-blue-50` | | 22–30 days |
| Urgency: medium | `text-amber-600` / `bg-amber-50` | | 8–21 days |
| Urgency: high | `text-red-600` / `bg-red-50` | | 0–7 days |
| Urgency: critical | `text-red-700` / `bg-red-100` | | Overdue |

---

## 11. Implementation Checklist

```
□ Create utility function
  □ src/utils/detectDeadlineNotifications.ts
  □ Define APPROVAL_STEPS — confirm actual step numbers from WORKFLOW_STEPS config
  □ DeadlineNotification interface
  □ 30-day window filter (NOTIFICATION_WINDOW_DAYS = 30)

□ Create hook
  □ src/hooks/useDeadlineNotifications.ts
  □ localStorage read-state persistence (or Firestore, if cross-device needed)
  □ markAllRead / markOneRead functions

□ Create UI components
  □ NotificationBell.tsx — icon + badge + dropdown trigger
  □ NotificationDropdown.tsx — header + list + footer
  □ NotificationItem.tsx — single notification row
  □ src/utils/notificationUrgency.ts — getUrgencyLevel()

□ Integrate into header
  □ Insert <NotificationBell /> between account name and Đăng xuất button
  □ Verify z-index doesn't conflict with header z-100

□ Wire navigation
  □ "Xem" button → onView(project) + markOneRead
  □ "Xem tất cả thông báo" → navigate to /thong-bao

□ (Optional) Build full notifications page
  □ src/pages/NotificationsPage.tsx
  □ Add route /thong-bao
  □ Filter tabs: Tất cả / Chưa đọc / Quá hạn

□ Test cases
  □ Project with approval deadline in 25 days → shows in dropdown, "low" urgency
  □ Project with approval deadline in 5 days → "high" urgency, red
  □ Project with approval deadline passed → "critical", shows as overdue
  □ Project with no expectedEnd date set → excluded, no error thrown
  □ Mark all read → badge disappears, items show as read on next open
  □ Click outside dropdown → closes
  □ Badge shows "9+" when count exceeds 9
  □ Completed/Liquidated projects never appear in notifications
```
