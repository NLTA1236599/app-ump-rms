# Bug Fix Guide — Sidebar Toggle Button & AI FAB Overlap
**System:** UMP-RMS Portal
**Screenshot reference:** Yellow-highlighted area showing two rendering errors
**Errors identified:** 2

---

## Overview of Errors

| # | Error | Visual symptom | Root cause |
|---|---|---|---|
| 1 | Toggle button renders as full-width rectangle | Dark blue block with `∨` instead of a 34px circle | Missing `position: absolute`, wrong sizing, missing `border-radius: 50%` |
| 2 | AI chatbot FAB overlaps the sidebar | Chat bubble panel bleeds over sidebar left boundary | Wrong `left` offset + `z-index` conflict |

---

## Error 1 — Toggle Button Renders as Full-Width Rectangle

### What you see

The collapse/expand button looks like a **wide dark blue bar stretching across the sidebar** with a `∨` chevron inside, instead of a **small 34px circle** straddling the right edge of the sidebar.

### Why it happens

The button is either:
- **Not positioned absolutely** — so it flows in the normal document layout and stretches to fill the sidebar width
- **Missing explicit `width` and `height`** — so it inherits `width: 100%` from its flex/block parent
- **Missing `border-radius: 50%`** — so it renders as a rectangle even if sizing were correct
- **Inside a flex container without `flex-shrink: 0`** — the flex algorithm compresses or stretches it

### Step-by-step fix

**Step 1 — Ensure the sidebar container has `position: relative`**

The toggle button uses `position: absolute` to escape the sidebar's flow and hang off its right edge. For this to work, the parent `<aside>` must be `position: relative` (or `position: fixed`, which it already is).

```css
/* ✅ Already correct if sidebar is position: fixed */
.sidebar {
  position: fixed;
  /* position: fixed establishes a containing block — absolute children work correctly */
}
```

**Step 2 — Apply all required styles to the toggle button**

```css
/* ✅ Complete toggle button styles */
.sidebar-toggle {
  /* Positioning — must be absolute, not static */
  position: absolute;
  right: -17px;          /* half of 34px diameter — straddles the sidebar right edge */
  top: 80px;             /* distance from top of sidebar */

  /* Shape — must be exactly 34×34 circle */
  width: 34px;
  height: 34px;
  border-radius: 50%;    /* ← THE MOST CRITICAL MISSING PROPERTY */

  /* Color — white top / brand blue bottom */
  background: linear-gradient(to bottom, #ffffff 50%, #0072bc 50%);
  border: 1.5px solid #0072bc;

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;        /* prevent flex parent from squishing it */

  /* Interaction */
  cursor: pointer;
  z-index: 50;           /* above sidebar content */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.20);
  transition: transform 0.15s ease;
}

.sidebar-toggle:hover {
  transform: scale(1.1);
}
```

**Step 3 — React / Tailwind equivalent**

```tsx
{/* ✅ Correct JSX */}
<button
  onClick={() => setSidebarOpen(prev => !prev)}
  className="absolute -right-[17px] top-20 w-[34px] h-[34px] rounded-full
             flex items-center justify-content-center flex-shrink-0
             border border-[#0072bc] shadow-md z-50
             hover:scale-110 transition-transform duration-150 cursor-pointer"
  style={{
    background: 'linear-gradient(to bottom, #ffffff 50%, #0072bc 50%)',
  }}
  aria-label={sidebarOpen ? 'Thu gọn menu' : 'Mở rộng menu'}
>
  {sidebarOpen
    ? <ChevronLeftIcon className="w-4 h-4 text-[#374151]" />
    : <ChevronRightIcon className="w-4 h-4 text-[#374151]" />
  }
</button>
```

> **Why `text-[#374151]` for the icon?** A mid-gray icon reads clearly on both the white top half and the blue bottom half of the button, avoiding the need for a split-color icon.

**Step 4 — Verify the button is a direct child of `<aside>`**

```tsx
{/* ✅ Correct structure */}
<aside className="fixed top-[110px] left-0 ... relative">

  <nav>
    {/* menu items */}
  </nav>

  {/* Toggle button as direct child of aside — NOT inside nav or any flex container */}
  <button className="absolute -right-[17px] top-20 w-[34px] h-[34px] rounded-full ...">
    <ChevronLeftIcon />
  </button>

</aside>

{/* ❌ Wrong — button inside a flex/block child loses its absolute positioning context */}
<aside>
  <div className="flex flex-col">        {/* ← this becomes the containing block */}
    <nav>...</nav>
    <button className="absolute ...">   {/* ← positions relative to this div, not aside */}
  </div>
</aside>
```

**Step 5 — Keep button visible when sidebar is collapsed**

When `translateX(-100%)` is applied to the sidebar, the absolutely-positioned button moves off-screen with it. Counter this:

```tsx
{/* ✅ Button counteracts parent transform */}
<button
  style={{
    transform: sidebarOpen
      ? 'translateX(0)'
      : 'translateX(calc(240px + 17px))',  /* 240px sidebar width + 17px half-button */
    transition: 'transform 0.3s ease-in-out',
    /* All other styles as above */
  }}
>
```

Or using a **separate fixed button** outside the sidebar entirely:

```tsx
{/* ✅ Alternative: button lives outside aside — always visible */}
<button
  onClick={() => setSidebarOpen(prev => !prev)}
  className="fixed top-[190px] z-50 w-[34px] h-[34px] rounded-full ..."
  style={{
    left: sidebarOpen ? 'calc(240px - 17px)' : '0px',
    transition: 'left 0.3s ease-in-out',
    background: 'linear-gradient(to bottom, #ffffff 50%, #0072bc 50%)',
  }}
>
```

---

## Error 2 — AI Chatbot FAB Overlaps the Sidebar

### What you see

The floating AI assistant panel (`"MP. Tôi có thể tôi tài"`) appears **inside the sidebar's visual zone** — it renders on top of or to the left of the sidebar boundary, making both the sidebar menu items and the chat bubble unreadable.

### Why it happens

The FAB is likely configured as:

```css
/* ❌ Current broken config */
.floating-ai-btn {
  position: fixed;
  left: 16px;     /* ← hardcoded to near-left edge, inside sidebar zone */
  bottom: 24px;
  z-index: 45;    /* ← close to sidebar z-40, causes overlap in some browsers */
}
```

Since the sidebar occupies `left: 0` to `left: 240px`, a FAB at `left: 16px` will always overlap it.

### Step-by-step fix

**Step 1 — Offset the FAB's `left` position by the sidebar width**

```css
/* ✅ FAB sits to the right of the sidebar */
.floating-ai-btn {
  position: fixed;
  left: calc(240px + 16px);  /* sidebar width (240px) + margin (16px) */
  bottom: 24px;
  z-index: 35;               /* below sidebar z-40 — FAB is lower priority than navigation */
  transition: left 0.3s ease-in-out;  /* animate with sidebar collapse */
}

/* When sidebar collapses, FAB snaps back to left edge */
.sidebar-collapsed .floating-ai-btn {
  left: 16px;
}
```

**Step 2 — React implementation with reactive `left`**

```tsx
{/* ✅ FAB position reacts to sidebar state */}
<div
  className="fixed bottom-6 z-35 transition-[left] duration-300 ease-in-out"
  style={{
    left: sidebarOpen ? 'calc(240px + 16px)' : '16px',
  }}
>
  <FloatingAIAssistant />
</div>
```

**Step 3 — Correct the z-index layering**

Establish a clear z-index hierarchy so nothing overlaps unexpectedly:

```css
/* ✅ Z-index hierarchy */
.header          { z-index: 100; }   /* always on top */
.sidebar         { z-index: 40;  }   /* above content, below header */
.floating-ai-btn { z-index: 35;  }   /* below sidebar — never overlaps nav */
.main-content    { z-index: 1;   }   /* base layer */
```

> **Why FAB below sidebar (`35 < 40`)?** The sidebar is primary navigation — it must always be fully readable. The AI assistant is supplementary; if space is tight, it should yield to navigation, not compete with it.

**Step 4 — Add a CSS variable for sidebar width to keep offsets in sync**

```css
/* ✅ Single source of truth for sidebar width */
:root {
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 0px;
}

.floating-ai-btn {
  left: calc(var(--sidebar-width) + 16px);
  transition: left 0.3s ease-in-out;
}

.sidebar-collapsed .floating-ai-btn {
  left: calc(var(--sidebar-width-collapsed) + 16px);
}
```

Or in Tailwind with a CSS variable driven by React state:

```tsx
{/* ✅ Tailwind + CSS variable approach */}
<div
  className="fixed bottom-6 z-[35] transition-[left] duration-300 ease-in-out"
  style={{ '--sidebar-w': sidebarOpen ? '240px' : '0px' } as React.CSSProperties}
>
  <div style={{ marginLeft: 'calc(var(--sidebar-w) + 16px)' }}>
    <FloatingAIAssistant />
  </div>
</div>
```

---

## Verification Checklist

After applying both fixes, verify the following:

### Error 1 — Toggle Button

- [ ] Button renders as a **circle**, not a rectangle
- [ ] Button diameter is exactly **34px × 34px**
- [ ] Button is **half-inside, half-outside** the sidebar right edge (`right: -17px`)
- [ ] Button shows **white top / blue bottom** gradient
- [ ] Button shows `◀` when sidebar is expanded, `▶` when collapsed
- [ ] Button **stays visible** when sidebar collapses (does not go off-screen)
- [ ] Hovering the button scales it up slightly (`scale(1.1)`)
- [ ] Clicking the button triggers the sidebar slide animation

### Error 2 — AI FAB

- [ ] FAB is positioned **to the right of the sidebar**, not overlapping it
- [ ] When sidebar collapses, FAB **smoothly moves left** in sync (300ms)
- [ ] FAB `z-index` is **lower than sidebar** (`35 < 40`)
- [ ] FAB is **never hidden behind the sidebar** (always reachable)
- [ ] FAB content (`"MP. Tôi có..."` chat bubble) does not overlap the sidebar menu items

---

## Quick Reference — Correct Values

```
Sidebar width:           240px
Sidebar z-index:         40
Sidebar top offset:      110px (header height)
Sidebar transition:      transform 0.3s ease-in-out

Toggle button diameter:  34px
Toggle button right:     -17px  (half diameter, straddles edge)
Toggle button top:       80px
Toggle button z-index:   50     (above sidebar content)
Toggle button gradient:  linear-gradient(to bottom, #ffffff 50%, #0072bc 50%)
Toggle button border:    1.5px solid #0072bc

FAB left (sidebar open):     calc(240px + 16px) = 256px
FAB left (sidebar collapsed): 16px
FAB z-index:             35     (below sidebar)
FAB transition:          left 0.3s ease-in-out
```
