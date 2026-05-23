# BHXH Portal — Tab Sidebar UI Rebuild Specification
**System:** UMP-RMS / BHXH Portal
**Component:** Collapsible Tab Sidebar (`<aside>` / drawer)
**Trigger:** Clicking Tab 1 ("Đề tài KHCN" / "Kê khai hồ sơ") in the nav bar opens this sidebar
**Toggle:** Yellow/green circular button collapses sidebar with scroll-to-left animation
**Source:** Screenshot showing sidebar in expanded state

> This document is companion to `BHXH-header-analysis.md`. The sidebar appears below the header, anchored to the left edge of the viewport.

---

## 1. Overall Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│  HEADER (sticky, z-100)                                            │
│  Identity Bar + Nav Bar                                            │
├──────────────┬─────────────────────────────────────────────────────┤
│              │                                                     │
│   SIDEBAR    │   MAIN CONTENT AREA                                 │
│   (expanded) │   (shifts right to accommodate sidebar)            │
│   ~240px     │                                                     │
│              │                                                     │
│  [Toggle ◀]  │                                                     │
│              │                                                     │
└──────────────┴─────────────────────────────────────────────────────┘
```

**Sidebar position:** Fixed left, below the header — `position: fixed; top: [header-height]; left: 0`
**Sidebar width (expanded):** ~220–240px
**Sidebar width (collapsed):** `0px` or `offscreen (-240px)` — hidden via `translateX(-100%)`
**Z-index:** Below header (`z-40`) but above main content

---

## 2. Sidebar Container

### 2.1 Container Properties

| Property | Value |
|---|---|
| **Position** | `fixed; left: 0; top: ~110px` (below header) |
| **Width** | `~220–240px` |
| **Height** | `calc(100vh - 110px)` — full remaining viewport height |
| **Background** | White `#ffffff` |
| **Border-right** | `1px solid #e5e7eb` — subtle separator from main content |
| **Box-shadow** | `2px 0 8px rgba(0,0,0,0.08)` — right-side shadow for depth |
| **Z-index** | `z-40` |
| **Overflow-y** | `auto` — scrollable if menu items exceed viewport |
| **Overflow-x** | `hidden` |
| **Transition** | `transform 0.3s ease-in-out` — for collapse animation |

### 2.2 Expanded vs Collapsed States

| State | Transform | Visibility |
|---|---|---|
| **Expanded** | `translateX(0)` | Fully visible |
| **Collapsed** | `translateX(-100%)` | Scrolled entirely off-screen to the left |

```css
/* ✅ Canonical sidebar transition */
.sidebar {
  transform: translateX(0);
  transition: transform 0.3s ease-in-out;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}
```

---

## 3. Toggle Button — Yellow/Green Circular Button

This is the most critical interactive element. It is the collapse/expand trigger.

### 3.1 Visual Design — Confirmed from Screenshot

| Property | Confirmed Value |
|---|---|
| **Shape** | Circle — `border-radius: 50%` |
| **Size** | ~32–36px diameter |
| **Background** | Yellow-green gradient or split — top half yellow `#f5c518` / bottom half green `#4caf50` or similar. Confirmed: two-tone yellow+green circular button |
| **Icon** | `◀` left-pointing chevron/arrow — white or dark, centered |
| **Icon size** | ~14–16px |
| **Position** | Attached to the right edge of the sidebar — `position: absolute; right: -16px; top: ~80px` — appears to "poke out" of the sidebar into the main content area |
| **Z-index** | `z-50` — above sidebar and content |
| **Cursor** | `cursor-pointer` |
| **Box-shadow** | `0 2px 6px rgba(0,0,0,0.20)` |

### 3.2 Two-Tone Button Color Split

| Half | Color | Hex |
|---|---|---|
| **Top half** | White | `#ffffff` |
| **Bottom half** | Nav bar blue | `#0072bc` |

**CSS implementation for two-tone circle:**

```css
/* ✅ Two-tone circle — white top / brand blue bottom */
.toggle-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(to bottom, #ffffff 50%, #0072bc 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.20);
  border: 1.5px solid #0072bc;   /* thin blue border so white half reads cleanly against sidebar */
  position: absolute;
  right: -17px;
  top: 80px;
  z-index: 50;
  transition: transform 0.15s ease;
}

.toggle-btn:hover {
  transform: scale(1.1);
}
```

> **Design note:** The `border: 1.5px solid #0072bc` keeps the white top half from dissolving into the white sidebar background. The chevron icon uses a split color to stay readable on both halves: `#0072bc` on the white top, `#ffffff` on the blue bottom — or simply use a medium gray `#374151` that reads on both.

### 3.3 Icon Direction — State-Dependent

| Sidebar state | Icon | Meaning |
|---|---|---|
| **Expanded** | `◀` (chevron-left) | Click to collapse (scroll left) |
| **Collapsed** | `▶` (chevron-right) | Click to expand (scroll right) |

```tsx
// ✅ Icon flips with sidebar state
<button onClick={toggleSidebar} className="toggle-btn">
  {isExpanded
    ? <ChevronLeftIcon className="w-4 h-4 text-white" />
    : <ChevronRightIcon className="w-4 h-4 text-white" />
  }
</button>
```

### 3.4 Button Position When Collapsed

When the sidebar collapses (`translateX(-100%)`), the toggle button **must remain visible** so the user can re-expand. This requires decoupling the button from the sidebar's transform:

```css
/* ✅ Button stays visible even when sidebar is off-screen */
.toggle-btn {
  position: fixed;            /* fixed, not absolute */
  left: 0px;                  /* at left edge when sidebar is hidden */
  top: calc(110px + 80px);    /* header height + offset */
  transition: left 0.3s ease-in-out;
}

/* When sidebar is expanded, button is at sidebar's right edge */
.sidebar-expanded .toggle-btn {
  left: calc(240px - 17px);   /* sidebar width - half button width */
}
```

---

## 4. Sidebar Menu Items — Confirmed from Screenshot

Four menu items are visible, stacked vertically.

### 4.1 Menu Item List

| # | Icon type | Label | State |
|---|---|---|---|
| 1 | Dashboard/grid icon | **Tổng quan** | **Active** (highlighted) |
| 2 | Progress/chart icon | Tiến độ thực hiện | Inactive |
| 3 | Database/folder icon | Dữ liệu đề tài | Inactive |
| 4 | Plus/add icon | Nhập mới dữ liệu | Inactive |
| 5 | Document/form icon | Kê khai hồ sơ | Inactive |

### 4.2 Menu Item Container

| Property | Value |
|---|---|
| **Width** | `100%` |
| **Padding** | `px-4 py-3` |
| **Display** | `flex items-center gap-3` |
| **Cursor** | `cursor-pointer` |
| **Border-radius** | None on default; `rounded-md` or `rounded-lg` if using highlight bg |

### 4.3 Active Item

| Property | Confirmed Value |
|---|---|
| **Background** | Light blue tint — `bg-blue-50` or `#e8f4fd` |
| **Left accent bar** | `4px solid #0072bc` — blue left border |
| **Text color** | `text-blue-700` or `#0072bc` — medium blue |
| **Font weight** | `font-semibold` (600) |
| **Icon color** | Blue — matches text |

### 4.4 Inactive Items

| Property | Value |
|---|---|
| **Background** | `transparent` |
| **Text color** | `text-slate-700` or `#374151` — dark gray |
| **Font weight** | `font-normal` (400) or `font-medium` (500) |
| **Icon color** | `text-slate-500` or `#6b7280` — muted gray |
| **Hover bg** | `hover:bg-slate-50` |
| **Hover text** | `hover:text-blue-600` |
| **Transition** | `transition-colors duration-150` |

### 4.5 Menu Icon Design

| Property | Value |
|---|---|
| **Type** | Outline SVG icons — not filled |
| **Size** | `~20px` (`w-5 h-5`) |
| **Flex-shrink** | `0` — icon never shrinks |
| **Alignment** | `flex-shrink-0` left of label text |

### 4.6 Menu Label

| Property | Value |
|---|---|
| **Font size** | `text-sm` (~13–14px) |
| **Font weight** | `font-medium` inactive / `font-semibold` active |
| **Overflow** | `truncate` — long labels don't wrap |
| **Vietnamese** | Full diacritic support required |

---

## 5. Collapse Animation — "Scroll to Left" Effect

### 5.1 Animation Description

When the toggle button `◀` is clicked:
1. The sidebar **slides left** off-screen — `translateX(-100%)`
2. The main content area **expands** to fill the freed space
3. The toggle button **moves left** to the viewport edge and its icon **flips to `▶`**

When `▶` is clicked again:
1. The sidebar **slides right** back in — `translateX(0)`
2. The main content area **contracts** back to its original width
3. The toggle button moves right and icon flips back to `◀`

### 5.2 Transition Timing

| Property | Value |
|---|---|
| **Duration** | `300ms` — fast enough to feel snappy, slow enough to be trackable |
| **Easing** | `ease-in-out` — decelerates at end, feels physical |
| **Property animated** | `transform` on sidebar, `margin-left` or `padding-left` on main content |

### 5.3 Main Content Shift

The main content area must shift left/right in sync with the sidebar:

```css
/* ✅ Main content transitions with sidebar */
.main-content {
  margin-left: 240px;           /* sidebar width */
  transition: margin-left 0.3s ease-in-out;
}

.sidebar-collapsed .main-content {
  margin-left: 0;               /* full width when sidebar hidden */
}
```

### 5.4 React Implementation

```tsx
// ✅ Canonical React implementation
import { useState } from 'react';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside
        className={`
          fixed top-[110px] left-0 h-[calc(100vh-110px)] w-60
          bg-white border-r border-slate-200 shadow-[2px_0_8px_rgba(0,0,0,0.08)]
          transition-transform duration-300 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Menu items */}
        <nav className="py-2">
          {MENU_ITEMS.map(item => (
            <SidebarMenuItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Toggle button — positioned at right edge of sidebar */}
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          className="absolute -right-[17px] top-20 w-[34px] h-[34px] rounded-full z-50
                     flex items-center justify-center cursor-pointer
                     shadow-md hover:scale-110 transition-transform duration-150"
          style={{
            background: 'linear-gradient(to bottom, #ffffff 50%, #0072bc 50%)',
            border: '1.5px solid #0072bc',
          }}
          aria-label={sidebarOpen ? 'Thu gọn menu' : 'Mở rộng menu'}
        >
          {sidebarOpen
            ? <ChevronLeftIcon className="w-4 h-4 text-white" />
            : <ChevronRightIcon className="w-4 h-4 text-white" />
          }
        </button>
      </aside>

      {/* Main content — shifts with sidebar */}
      <main
        className={`
          flex-1 transition-[margin] duration-300 ease-in-out
          ${sidebarOpen ? 'ml-60' : 'ml-0'}
        `}
      >
        {/* Page content */}
      </main>

    </div>
  );
}
```

> **Note on toggle button position when collapsed:** Because the button is `position: absolute` inside the sidebar, it will move off-screen with the sidebar when `translateX(-100%)` is applied. To keep it visible when collapsed, either (a) use a **separate fixed button** outside the sidebar element, or (b) apply `transform: translateX(calc(100% + 17px))` to only the button when sidebar is collapsed to counteract the parent's transform.

**Option B — counteract parent transform:**

```tsx
// ✅ Button always visible regardless of sidebar state
<button
  style={{
    transform: sidebarOpen
      ? 'translateX(0)'
      : `translateX(calc(100% + 17px))`,  // cancel out parent translateX(-100%)
    transition: 'transform 0.3s ease-in-out',
  }}
>
```

---

## 6. Menu Item Data Config

```tsx
// ✅ src/config/sidebarMenus.ts
export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;           // icon component name or path
  href: string;
}

export interface TabSidebarConfig {
  tabId: string;          // matches nav tab id
  items: SidebarMenuItem[];
}

export const TAB_SIDEBARS: TabSidebarConfig[] = [
  {
    tabId: 'de-tai-khcn',
    items: [
      { id: 'tong-quan',            label: 'Tổng quan',           icon: 'LayoutDashboardIcon', href: '/de-tai-khcn/tong-quan' },
      { id: 'tien-do-thuc-hien',    label: 'Tiến độ thực hiện',   icon: 'ChartBarIcon',        href: '/de-tai-khcn/tien-do' },
      { id: 'du-lieu-de-tai',       label: 'Dữ liệu đề tài',      icon: 'FolderIcon',          href: '/de-tai-khcn/du-lieu' },
      { id: 'nhap-moi-du-lieu',     label: 'Nhập mới dữ liệu',    icon: 'PlusCircleIcon',      href: '/de-tai-khcn/nhap-moi' },
      { id: 'ke-khai-ho-so',        label: 'Kê khai hồ sơ',       icon: 'DocumentTextIcon',    href: '/de-tai-khcn/ke-khai' },
    ],
  },
  // Additional tabs have their own sidebar config
];
```

---

## 7. Color Palette

| Role | Hex | Tailwind | Usage |
|---|---|---|---|
| Sidebar bg | `#ffffff` | `bg-white` | Main sidebar surface |
| Sidebar border | `#e5e7eb` | `border-slate-200` | Right border |
| Active item bg | `#eff6ff` | `bg-blue-50` | Active menu item tint |
| Active item accent | `#0072bc` | `border-blue-600` | Left accent bar |
| Active item text | `#1d4ed8` | `text-blue-700` | Active label |
| Active icon | `#0072bc` | `text-blue-600` | Active icon |
| Inactive text | `#374151` | `text-slate-700` | Default label |
| Inactive icon | `#6b7280` | `text-slate-500` | Default icon |
| Hover bg | `#f8fafc` | `hover:bg-slate-50` | Hover state |
| Toggle top | `#ffffff` | `bg-white` | Button top half — clean white |
| Toggle bottom | `#0072bc` | `bg-[#0072bc]` | Button bottom half — matches nav bar blue |

---

## 8. Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| Menu item label (active) | `text-sm` 14px | `font-semibold` 600 | `text-blue-700` |
| Menu item label (inactive) | `text-sm` 14px | `font-medium` 500 | `text-slate-700` |

---

## 9. Spacing & Sizing

| Element | Value |
|---|---|
| Sidebar width (expanded) | `240px` (`w-60`) |
| Sidebar top offset | `~110px` (header height) |
| Menu item padding | `px-4 py-3` |
| Menu icon size | `20px` (`w-5 h-5`) |
| Icon-to-label gap | `gap-3` (12px) |
| Left accent bar width | `4px` |
| Toggle button diameter | `34px` |
| Toggle button right offset | `-17px` (half of diameter — straddles sidebar edge) |
| Toggle button top offset | `~80px` from sidebar top |
| Transition duration | `300ms` |
| Shadow | `2px 0 8px rgba(0,0,0,0.08)` |

---

## 10. Accessibility Notes

- Sidebar: `<aside>` with `aria-label="Menu điều hướng"` and `aria-hidden={!sidebarOpen}`
- Toggle button: `aria-label="Thu gọn menu"` / `"Mở rộng menu"` depending on state; `aria-expanded={sidebarOpen}`
- Active menu item: `aria-current="page"` on the active `<a>`
- Keyboard: toggle button reachable via `Tab`; `Escape` key should collapse the sidebar
- Focus trap: not needed (sidebar is persistent navigation, not a modal)

---

## 11. Complete CSS Reference

```css
/* ===== SIDEBAR ===== */
.sidebar {
  position: fixed;
  top: 110px;                              /* below header */
  left: 0;
  width: 240px;
  height: calc(100vh - 110px);
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 40;
  transform: translateX(0);
  transition: transform 0.3s ease-in-out;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

/* ===== TOGGLE BUTTON ===== */
.sidebar-toggle {
  position: absolute;
  right: -17px;
  top: 80px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(to bottom, #ffffff 50%, #0072bc 50%);
  border: 1.5px solid #0072bc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.20);
  z-index: 50;
  transition: transform 0.15s ease;
}
.sidebar-toggle:hover {
  transform: scale(1.1);
}

/* Counteract parent translateX so button stays visible when collapsed */
.sidebar.collapsed .sidebar-toggle {
  transform: translateX(calc(100% + 17px));
  transition: transform 0.3s ease-in-out;
}
.sidebar.collapsed .sidebar-toggle:hover {
  transform: translateX(calc(100% + 17px)) scale(1.1);
}

/* ===== MENU ITEMS ===== */
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
  border-left: 4px solid transparent;    /* reserve space for accent */
}
.sidebar-item:hover {
  background-color: #f8fafc;
  color: #2563eb;
}
.sidebar-item.active {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
  border-left-color: #0072bc;
}
.sidebar-item .icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #6b7280;
}
.sidebar-item.active .icon {
  color: #0072bc;
}

/* ===== MAIN CONTENT SHIFT ===== */
.main-content {
  margin-left: 240px;
  transition: margin-left 0.3s ease-in-out;
}
.sidebar-collapsed .main-content {
  margin-left: 0;
}
```
