# UI Design Specification — UMP-RMS Login Page

> **Purpose:** Pixel-accurate design reference for engineers rebuilding the UMP-RMS (Hệ Thống Quản Lý Dự Án KHCN UMP) login page. All measurements are in `px` unless noted. Color values are exact hex codes sampled from the screenshot.

---

## Table of Contents

1. [Page-Level Layout](#1-page-level-layout)
2. [Background Layer](#2-background-layer)
3. [Login Card](#3-login-card)
4. [Card Header — Logo & Branding](#4-card-header--logo--branding)
5. [Form Fields](#5-form-fields)
6. [Primary Button](#6-primary-button)
7. [Footer Link](#7-footer-link)
8. [Right-Side Branding Panel](#8-right-side-branding-panel)
9. [Page Footer Bar](#9-page-footer-bar)
10. [Typography System](#10-typography-system)
11. [Color System](#11-color-system)
12. [Spacing & Sizing Reference](#12-spacing--sizing-reference)
13. [Responsive Behavior](#13-responsive-behavior)
14. [Assets Checklist](#14-assets-checklist)
15. [HTML/CSS Skeleton](#15-htmlcss-skeleton)

---

## 1. Page-Level Layout

### Viewport & Composition

| Property | Value |
|---|---|
| Full viewport | `100vw × 100vh` |
| Layout strategy | Full-bleed background image, single centered card overlay |
| Card horizontal position | Centered in the **middle third** of the viewport (`left: ~35%`, centered at `50%`) |
| Card vertical position | Vertically centered (`top: 50%`, `transform: translateY(-50%)`) |
| Overall visual weight | Left half: building photo (dark, desaturated) · Center: white card · Right: blue branding panel |

### Grid Regions (3 implicit columns)

```
┌─────────────────────┬──────────────────────┬──────────────────────┐
│                     │                      │                      │
│   Background photo  │    LOGIN CARD        │  Right Branding      │
│   (building, left)  │    (white card,      │  Panel (UMP logo +   │
│                     │     center)          │  text, right side)   │
│                     │                      │                      │
│    ~33% width       │    ~33% width        │    ~33% width        │
└─────────────────────┴──────────────────────┴──────────────────────┘
```

The card and right panel are independent overlays — there is no actual CSS grid; both float over the background image.

---

## 2. Background Layer

### Photo Background

| Property | Value |
|---|---|
| Element | `<img>` or `background-image` covering full viewport |
| Object fit | `cover` (fills entire viewport, crops as needed) |
| Object position | `center center` |
| Subject | Aerial/mid-level photo of a tall white university building (UMP campus), city skyline visible right side |
| Tone | Desaturated, cool-gray — achieved via CSS `filter: brightness(0.85) saturate(0.6)` or similar |

### White Fade Overlay (center region)

A soft radial or linear white gradient sits between the photo and the card, giving the center area a hazy, washed-out brightness so the card appears to "lift" from the background.

```css
/* Approximate overlay behavior */
background: radial-gradient(
  ellipse 55% 100% at 50% 50%,
  rgba(255,255,255,0.82) 0%,
  rgba(255,255,255,0.30) 60%,
  rgba(255,255,255,0.00) 100%
);
```

The left ~40% of the page shows the raw photo clearly; the center fades to near-white; the right side is partially covered by the blue branding wave (see §8).

### Bottom Blue Wave (decorative)

- A large **curved blue shape** enters from the bottom-right corner and sweeps up along the right edge.
- Color: `#3B9BD1` to `#2175AE` (mid-range sky blue, same brand blue as the button).
- Shape: SVG `<path>` or `border-radius` trick — a rounded rectangle rotated ~15° so its top-left arc clips into the viewport bottom-right quadrant.
- It sits **behind** the right branding panel text but **in front** of the photo.
- Approximate clip region: bottom ~45% of the right ~40% of the viewport.

---

## 3. Login Card

### Container

| Property | Value |
|---|---|
| Width | `420px` fixed (desktop) |
| Min-height | `~590px` (content-driven) |
| Background | `#FFFFFF` |
| Border radius | `24px` (all corners) |
| Border | `1.5px solid #4A90D9` (medium-blue, same hue as logo icon) |
| Box shadow | `0 8px 40px rgba(30, 90, 180, 0.14)` |
| Padding | `48px 40px 36px 40px` (top · right · bottom · left) |
| Position | `fixed` or `absolute`, horizontally centered, vertically centered |
| Z-index | Above background, below nothing |

### Internal Layout

All children stack vertically. No internal grid. Spacing between sections:

```
Logo icon           ↕ 16px gap
Title "UMP-RMS"     ↕ 6px gap
Subtitle text       ↕ 32px gap
EMAIL label         ↕ 6px gap
Email input         ↕ 20px gap
MẬT KHẨU label     ↕ 6px gap
Password input      ↕ 20px gap
PHÂN QUYỀN label    ↕ 6px gap
Role select         ↕ 24px gap
ĐĂNG NHẬP button    ↕ 18px gap
Footer link row
```

---

## 4. Card Header — Logo & Branding

### Logo Icon

| Property | Value |
|---|---|
| Element | `<img>` SVG icon or inline SVG |
| Size | `~64px × 64px` |
| Alignment | Horizontally centered (`margin: 0 auto`) |
| Description | Stylized snowflake/molecule icon — 6-point radial design with small circles at endpoints and center hub; geometric, technical feel |
| Primary color | `#3A9FD8` (sky blue, same brand blue) |
| Secondary accent | `#1A5FA8` (darker blue, used for inner hub detail) |
| Background | None (transparent, floats over white card) |
| Margin-bottom | `16px` |

### Title — "UMP-RMS"

| Property | Value |
|---|---|
| Text | `UMP-RMS` |
| Font family | System sans-serif or `Inter` / `Helvetica Neue` |
| Font weight | `700` (Bold) |
| Font size | `28px` |
| Color | `#1A2E5A` (very dark navy blue — not pure black) |
| Letter spacing | `0` (normal) |
| Text align | `center` |
| Margin-bottom | `6px` |

### Subtitle

| Property | Value |
|---|---|
| Text | `HỆ THỐNG QUẢN LÝ DỰ ÁN KHCN UMP` |
| Font weight | `400` (Regular) |
| Font size | `11px` |
| Color | `#7A8BA8` (muted blue-gray) |
| Letter spacing | `0.08em` (slightly tracked out — uppercase spacing) |
| Text align | `center` |
| Text transform | `uppercase` (already uppercase in design) |
| Margin-bottom | `32px` |

---

## 5. Form Fields

All three form controls (Email input, Password input, Role select) share the same visual language.

### Field Labels

| Property | Value |
|---|---|
| Font weight | `600` (SemiBold) |
| Font size | `11px` |
| Color | `#5A6A80` (medium blue-gray) |
| Letter spacing | `0.10em` |
| Text transform | `uppercase` |
| Margin-bottom | `6px` |
| Display | `block` |

### Input Fields (Email & Password)

| Property | Value |
|---|---|
| Width | `100%` (fills card inner width) |
| Height | `48px` |
| Padding | `0 16px` |
| Background | `#FFFFFF` |
| Border | `1.5px solid #D5E3F0` (very light blue-gray) |
| Border radius | `10px` |
| Font size | `14px` |
| Color | `#1A2E5A` (typed text) |
| Placeholder color | `#A8BCCF` (light blue-gray) |
| Placeholder text | Email: `admin@ump.edu.vn` · Password: `••••••••` (8 dots) |
| Focus border | `1.5px solid #3A9FD8` (brand blue) |
| Focus box-shadow | `0 0 0 3px rgba(58,159,216,0.18)` |
| Transition | `border-color 150ms ease, box-shadow 150ms ease` |

#### Password Field Specific

- Input type: `password`
- Placeholder rendered as 8 bullet dots (`••••••••`) — this is the browser's default password masking rendering, not actual text
- No visible eye-toggle icon (not present in design)

### Role Select Dropdown — "PHÂN QUYỀN"

| Property | Value |
|---|---|
| Width | `100%` |
| Height | `48px` |
| Padding | `0 16px` |
| Background | `#FFFFFF` |
| Border | `1.5px solid #D5E3F0` |
| Border radius | `10px` |
| Font size | `14px` |
| Font weight | `500` |
| Text color | `#1A2E5A` |
| Selected option | `Chủ nhiệm đề tài` |
| Chevron icon | Custom chevron `∨` on the right — `color: #5A7FA8`, size `~16px`, right-aligned at `16px` from right edge |
| Appearance | `appearance: none` (removes native OS styling) with custom background chevron SVG |

#### Dropdown Options (inferred from role types in codebase)

```
- Chủ nhiệm đề tài   ← default selected
- Chuyên viên
- Lãnh đạo
- Quản trị viên
```

### Field Spacing Summary

```
┌─ LABEL ─────────────────────────────────────────────────────┐
  EMAIL                                                  11px label
└──────────────────────────────────────────────────────────────┘
  ↕ 6px
┌──────────────────────────────────────────────────────────────┐
│  admin@ump.edu.vn                                            │  48px height
└──────────────────────────────────────────────────────────────┘
  ↕ 20px
┌─ LABEL ─────────────────────────────────────────────────────┐
  MẬT KHẨU                                              11px label
└──────────────────────────────────────────────────────────────┘
  ↕ 6px
┌──────────────────────────────────────────────────────────────┐
│  ••••••••                                                    │  48px height
└──────────────────────────────────────────────────────────────┘
  ↕ 20px
┌─ LABEL ─────────────────────────────────────────────────────┐
  PHÂN QUYỀN                                            11px label
└──────────────────────────────────────────────────────────────┘
  ↕ 6px
┌──────────────────────────────────────────── ∨ ──────────────┐
│  Chủ nhiệm đề tài                                            │  48px height
└──────────────────────────────────────────────────────────────┘
  ↕ 24px
```

---

## 6. Primary Button

### "ĐĂNG NHẬP" Button

| Property | Value |
|---|---|
| Width | `100%` (fills card inner width) |
| Height | `52px` |
| Background | `#2B5EDB` (strong royal blue — slightly purple-leaning) |
| Hover background | `#1E4EC4` (5–8% darker) |
| Active background | `#1840A8` |
| Border | `none` |
| Border radius | `12px` |
| Text | `ĐĂNG NHẬP` |
| Font weight | `700` (Bold) |
| Font size | `15px` |
| Letter spacing | `0.12em` (noticeably tracked — uppercase) |
| Text color | `#FFFFFF` |
| Text transform | `uppercase` |
| Cursor | `pointer` |
| Transition | `background-color 150ms ease, transform 80ms ease` |
| Active transform | `scale(0.99)` (subtle press effect) |
| Box shadow | `0 4px 16px rgba(43,94,219,0.35)` |
| Margin-bottom | `18px` |

> **Color note:** The button blue `#2B5EDB` is distinctly brighter and more saturated than the border/icon blue `#3A9FD8`. They are two different blues in the palette.

---

## 7. Footer Link

### "Chưa có tài khoản? Đăng ký ngay"

| Property | Value |
|---|---|
| Alignment | Horizontally centered |
| Layout | Inline — label + link on the same line |
| Label text | `Chưa có tài khoản?` |
| Label color | `#7A8BA8` (muted blue-gray, same as subtitle) |
| Label font size | `13px` |
| Label font weight | `400` |
| Link text | `Đăng ký ngay` |
| Link color | `#2B7FD4` (medium blue, slightly lighter than button) |
| Link font weight | `600` |
| Link decoration | `none` (no underline in default state) |
| Link hover | `underline` |
| Gap between label and link | `4px` (one space character or `gap: 4px` in flex) |

---

## 8. Right-Side Branding Panel

This region occupies roughly the **right 30–35%** of the viewport, sitting on top of the blue wave shape.

### UMP Circular Seal (Logo)

| Property | Value |
|---|---|
| Size | `~110px × 110px` |
| Shape | Circular emblem with outer ring |
| Position | Upper-right quadrant, approximately `top: 80px, right: 120px` from viewport edge |
| Design | Official UMP university seal — medical cross / book motif inside ring, Vietnamese text around circumference |
| Color scheme | Dark navy ring on white background (appears as a white circle with dark ink emblem) |
| Border | Thin dark navy outer ring |
| Background of circle | `#FFFFFF` or very light cream |

### University Name Text

| Property | Value |
|---|---|
| Line 1 | `ĐẠI HỌC Y DƯỢC` |
| Line 2 | `THÀNH PHỐ HỒ CHÍ MINH` |
| Font weight | `800` (Extra Bold) or `900` |
| Font size | `~38–42px` (very large — dominant element) |
| Color | `#1A2E5A` (same dark navy as card title) |
| Line height | `1.1` (tight, text lines close together) |
| Text align | `left` |
| Position | Below and left of the seal, approximately `top: 220px` from viewport top |
| Max-width | `~360px` |

The text sits on the lighter part of the background (before the blue wave begins), so the dark navy is readable against the white-faded photo.

---

## 9. Page Footer Bar

A single line of text anchored to the absolute bottom of the viewport.

| Property | Value |
|---|---|
| Text | `@2026 - TRƯỜNG ĐẠI HỌC Y DƯỢC TPHCM` |
| Font size | `11px` |
| Font weight | `400` |
| Color | `#5A6A80` (same muted blue-gray as field labels) |
| Text align | `center` |
| Position | `fixed bottom: 0`, full width |
| Padding | `10px 0` |
| Background | Transparent (sits on top of blue wave at bottom) |
| Letter spacing | `0.05em` |

---

## 10. Typography System

### Font Stack

```css
font-family: 'Inter', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif;
```

The design uses a clean geometric sans-serif. `Inter` is the closest match — note the slightly rounded terminals on letters like `a`, `e`, and the consistent stroke weight. If `Inter` is unavailable, `Helvetica Neue` is the acceptable fallback.

### Type Scale

| Role | Size | Weight | Color | Letter-spacing |
|---|---|---|---|---|
| Card title (UMP-RMS) | `28px` | `700` | `#1A2E5A` | `0` |
| University name | `40px` | `800` | `#1A2E5A` | `0` |
| Button label | `15px` | `700` | `#FFFFFF` | `0.12em` |
| Card subtitle | `11px` | `400` | `#7A8BA8` | `0.08em` |
| Field labels | `11px` | `600` | `#5A6A80` | `0.10em` |
| Input text | `14px` | `400` | `#1A2E5A` | `0` |
| Placeholder text | `14px` | `400` | `#A8BCCF` | `0` |
| Footer link label | `13px` | `400` | `#7A8BA8` | `0` |
| Footer link CTA | `13px` | `600` | `#2B7FD4` | `0` |
| Page footer | `11px` | `400` | `#5A6A80` | `0.05em` |

---

## 11. Color System

### Full Palette

```
/* Backgrounds */
--color-bg-card:          #FFFFFF;
--color-bg-page:          (photo — no solid color);

/* Brand Blues — 3 distinct shades */
--color-blue-dark:        #1A2E5A;   /* Navy: headings, input text */
--color-blue-brand:       #2B5EDB;   /* Royal: primary button bg */
--color-blue-mid:         #2B7FD4;   /* Sky: footer link, icon detail */
--color-blue-icon:        #3A9FD8;   /* Light sky: logo icon, card border */
--color-blue-wave:        #3B9BD1;   /* Background wave shape */

/* Borders & Strokes */
--color-border-input:     #D5E3F0;   /* Input default border */
--color-border-card:      #4A90D9;   /* Card outer border */
--color-border-focus:     #3A9FD8;   /* Input focus ring color */

/* Text — Grays with blue undertone */
--color-text-label:       #5A6A80;   /* Field labels, page footer */
--color-text-muted:       #7A8BA8;   /* Subtitle, footer label */
--color-text-placeholder: #A8BCCF;   /* Input placeholders */

/* Shadows */
--shadow-card:  0 8px 40px rgba(30, 90, 180, 0.14);
--shadow-btn:   0 4px 16px rgba(43, 94, 219, 0.35);
--shadow-input-focus: 0 0 0 3px rgba(58, 159, 216, 0.18);
```

### Color Usage Rules

- **Never use pure black** (`#000000`) anywhere on this page. The darkest value is `#1A2E5A`.
- All grays have a **cool blue undertone** — no warm grays.
- The three brand blues are visually distinct: navy (text), royal (CTA), sky (accents/borders).
- White (`#FFFFFF`) is used only for the card background and input fields.

---

## 12. Spacing & Sizing Reference

### Card Internal Dimensions

```
Card width:                     420px
Card padding (top):              48px
Card padding (right/left):       40px
Card padding (bottom):           36px
Card inner content width:       340px   (420 - 40 - 40)

Logo icon size:                  64px × 64px
Logo margin-bottom:              16px

Title font-size:                 28px
Title margin-bottom:              6px

Subtitle font-size:              11px
Subtitle margin-bottom:          32px

Label font-size:                 11px
Label margin-bottom:              6px

Input height:                    48px
Input border-radius:             10px
Input padding-x:                 16px

Gap: input → next label:         20px
Gap: last select → button:       24px

Button height:                   52px
Button border-radius:            12px
Button margin-bottom:            18px
```

### Viewport-Level Positions

```
Card:           centered horizontally, centered vertically
Right seal:     top: ~80px, right: ~120px
Right text:     top: ~220px, right: ~80px, width: ~360px
Page footer:    bottom: 0, full width, centered text
Blue wave:      bottom-right quadrant, ~40% viewport width, ~55% height
```

---

## 13. Responsive Behavior

The screenshot shows a desktop layout (~1440px wide). The following responsive rules should be applied:

| Breakpoint | Behavior |
|---|---|
| `>= 1024px` | Full layout as documented |
| `768px – 1023px` | Hide right branding panel; card centered; background still visible |
| `< 768px` | Card takes `90vw`, padding reduced to `32px 24px`; background switches to gradient fallback if photo loads slowly |

---

## 14. Assets Checklist

| Asset | Format | Usage |
|---|---|---|
| UMP campus building photo | `JPG`, optimized, min 1920px wide | Full-bleed background |
| UMP snowflake/molecule logo icon | `SVG` (preferred) or `PNG @2x` | Card header, 64×64 render size |
| UMP circular seal emblem | `SVG` or `PNG @2x`, transparent bg | Right branding panel, ~110×110 |
| Blue wave shape | `SVG` path | Bottom-right decorative element |
| Chevron down icon | Inline SVG `<path>` | Custom select arrow |

### Logo Icon SVG Description (for recreation)

The logo icon is a **6-armed radial/snowflake shape**:
- Center hub: solid circle ~10px diameter, dark blue `#1A5FA8`
- 6 arms: thin lines radiating outward at 60° intervals, color `#3A9FD8`
- Each arm terminates in a small circle (diameter ~8px), same sky blue
- Some arms have secondary branching (T-shape or fork at midpoint)
- Overall diameter: 64px; proportions feel like a molecule/network graph
- Stroke weight: ~2.5px

---

## 15. HTML/CSS Skeleton

A minimal but complete skeleton for the engineer to start from. All values match §§3–12 exactly.

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UMP-RMS — Đăng Nhập</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
  <style>
    /* ── Reset ─────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Variables ─────────────────────────────────── */
    :root {
      --blue-dark:        #1A2E5A;
      --blue-brand:       #2B5EDB;
      --blue-mid:         #2B7FD4;
      --blue-icon:        #3A9FD8;
      --blue-wave:        #3B9BD1;
      --border-input:     #D5E3F0;
      --border-card:      #4A90D9;
      --text-label:       #5A6A80;
      --text-muted:       #7A8BA8;
      --text-placeholder: #A8BCCF;
      --shadow-card:      0 8px 40px rgba(30,90,180,0.14);
      --shadow-btn:       0 4px 16px rgba(43,94,219,0.35);
    }

    /* ── Page ──────────────────────────────────────── */
    body {
      font-family: 'Inter', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif;
      min-height: 100vh;
      overflow: hidden;
      position: relative;
    }

    /* ── Background photo ──────────────────────────── */
    .bg-photo {
      position: fixed;
      inset: 0;
      background-image: url('assets/ump-campus.jpg');
      background-size: cover;
      background-position: center;
      filter: brightness(0.85) saturate(0.6);
      z-index: 0;
    }

    /* ── White center fade ─────────────────────────── */
    .bg-fade {
      position: fixed;
      inset: 0;
      background: radial-gradient(
        ellipse 55% 100% at 50% 50%,
        rgba(255,255,255,0.82) 0%,
        rgba(255,255,255,0.30) 60%,
        rgba(255,255,255,0.00) 100%
      );
      z-index: 1;
    }

    /* ── Blue wave shape ───────────────────────────── */
    .bg-wave {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 42vw;
      height: 60vh;
      z-index: 2;
      /* Implement as SVG or border-radius shape */
    }

    /* ── Login Card ────────────────────────────────── */
    .login-card {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      width: 420px;
      padding: 48px 40px 36px;
      background: #ffffff;
      border: 1.5px solid var(--border-card);
      border-radius: 24px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ── Logo ──────────────────────────────────────── */
    .logo-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    /* ── Card title ────────────────────────────────── */
    .card-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--blue-dark);
      letter-spacing: 0;
      margin-bottom: 6px;
    }

    .card-subtitle {
      font-size: 11px;
      font-weight: 400;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 32px;
    }

    /* ── Form ──────────────────────────────────────── */
    .form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
    }
    .field-group:last-of-type {
      margin-bottom: 24px;
    }

    .field-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-label);
      letter-spacing: 0.10em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .field-input,
    .field-select {
      width: 100%;
      height: 48px;
      padding: 0 16px;
      background: #ffffff;
      border: 1.5px solid var(--border-input);
      border-radius: 10px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 400;
      color: var(--blue-dark);
      outline: none;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }

    .field-input::placeholder {
      color: var(--text-placeholder);
    }

    .field-input:focus,
    .field-select:focus {
      border-color: var(--blue-icon);
      box-shadow: 0 0 0 3px rgba(58,159,216,0.18);
    }

    /* Custom select */
    .field-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235A7FA8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      padding-right: 40px;
      font-weight: 500;
      cursor: pointer;
    }

    /* ── Primary Button ────────────────────────────── */
    .btn-login {
      width: 100%;
      height: 52px;
      background: var(--blue-brand);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: var(--shadow-btn);
      transition: background-color 150ms ease, transform 80ms ease;
      margin-bottom: 18px;
    }
    .btn-login:hover   { background: #1E4EC4; }
    .btn-login:active  { background: #1840A8; transform: scale(0.99); }

    /* ── Footer link ───────────────────────────────── */
    .card-footer {
      font-size: 13px;
      color: var(--text-muted);
      text-align: center;
    }
    .card-footer a {
      color: var(--blue-mid);
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
    }
    .card-footer a:hover { text-decoration: underline; }

    /* ── Right branding panel ──────────────────────── */
    .branding-panel {
      position: fixed;
      top: 80px;
      right: 120px;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
    }

    .branding-seal {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      /* img tag: src="assets/ump-seal.png" */
    }

    .branding-name {
      font-size: 40px;
      font-weight: 800;
      color: var(--blue-dark);
      line-height: 1.1;
      max-width: 360px;
    }

    /* ── Page footer bar ───────────────────────────── */
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 20;
      text-align: center;
      padding: 10px 0;
      font-size: 11px;
      font-weight: 400;
      color: var(--text-label);
      letter-spacing: 0.05em;
    }

    /* ── Responsive ────────────────────────────────── */
    @media (max-width: 1023px) {
      .branding-panel { display: none; }
    }
    @media (max-width: 767px) {
      .login-card {
        width: 90vw;
        padding: 32px 24px;
      }
    }
  </style>
</head>
<body>

  <!-- Background layers -->
  <div class="bg-photo"></div>
  <div class="bg-fade"></div>

  <!-- Blue wave — implement as inline SVG -->
  <svg class="bg-wave" viewBox="0 0 600 700" preserveAspectRatio="xMaxYMax slice"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M600,700 L600,200 Q500,100 350,300 Q200,500 0,700 Z"
          fill="#3B9BD1" opacity="0.92"/>
    <path d="M600,700 L600,320 Q480,180 300,400 Q150,560 0,700 Z"
          fill="#2B7FD4" opacity="0.70"/>
  </svg>

  <!-- Right branding panel -->
  <div class="branding-panel">
    <img class="branding-seal" src="assets/ump-seal.png" alt="UMP Seal" />
    <div class="branding-name">
      ĐẠI HỌC Y DƯỢC<br>
      THÀNH PHỐ HỒ CHÍ MINH
    </div>
  </div>

  <!-- Login Card -->
  <div class="login-card">

    <!-- Logo -->
    <img class="logo-icon" src="assets/ump-logo-icon.svg" alt="UMP-RMS Logo" />

    <!-- Branding -->
    <h1 class="card-title">UMP-RMS</h1>
    <p class="card-subtitle">Hệ thống quản lý dự án KHCN UMP</p>

    <!-- Form -->
    <form class="form" novalidate>

      <div class="field-group">
        <label class="field-label" for="email">Email</label>
        <input
          class="field-input"
          id="email"
          type="email"
          placeholder="admin@ump.edu.vn"
          autocomplete="email"
        />
      </div>

      <div class="field-group">
        <label class="field-label" for="password">Mật khẩu</label>
        <input
          class="field-input"
          id="password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
        />
      </div>

      <div class="field-group">
        <label class="field-label" for="role">Phân quyền</label>
        <select class="field-select" id="role">
          <option value="author">Chủ nhiệm đề tài</option>
          <option value="specialist">Chuyên viên</option>
          <option value="leader">Lãnh đạo</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      <button type="submit" class="btn-login">Đăng nhập</button>

    </form>

    <!-- Register link -->
    <p class="card-footer">
      Chưa có tài khoản?
      <a href="/register">Đăng ký ngay</a>
    </p>

  </div>

  <!-- Page footer -->
  <footer class="page-footer">
    @2026 - TRƯỜNG ĐẠI HỌC Y DƯỢC TPHCM
  </footer>

</body>
</html>
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│  UMP-RMS LOGIN PAGE — AT A GLANCE               │
├──────────────────┬──────────────────────────────┤
│  Card            │  420×auto, pad 48/40/36/40   │
│  Card border     │  1.5px #4A90D9, r=24px       │
│  Card shadow     │  0 8px 40px rgba(30,90,180,  │
│                  │  0.14)                        │
├──────────────────┼──────────────────────────────┤
│  Title           │  28px/700  #1A2E5A           │
│  Subtitle        │  11px/400  #7A8BA8  ls=.08em │
│  Labels          │  11px/600  #5A6A80  ls=.10em │
│  Inputs          │  14px/400  #1A2E5A  h=48px   │
│  Input border    │  1.5px #D5E3F0  r=10px       │
│  Button          │  15px/700  #FFF    h=52px    │
│  Button bg       │  #2B5EDB  r=12px  ls=.12em  │
│  Link muted      │  13px/400  #7A8BA8           │
│  Link CTA        │  13px/600  #2B7FD4           │
├──────────────────┼──────────────────────────────┤
│  Blue dark       │  #1A2E5A  (text/headings)    │
│  Blue brand      │  #2B5EDB  (CTA button)       │
│  Blue mid        │  #2B7FD4  (links)            │
│  Blue icon       │  #3A9FD8  (logo/border)      │
│  Blue wave       │  #3B9BD1  (bg shape)         │
└──────────────────┴──────────────────────────────┘
```
