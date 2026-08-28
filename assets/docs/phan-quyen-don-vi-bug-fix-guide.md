# Hướng Dẫn Fix Lỗi UI — Tab "Phân Quyền Theo Đơn Vị"
**Component:** `PhanQuyenTheodonVi.tsx` (hoặc tên tương đương)
**Tổng số lỗi:** 6 lỗi (2 Critical + 2 Major + 2 Minor)
**Stack:** React + TypeScript + Tailwind CSS

---

## Mục lục

| # | Lỗi | Mức độ | File cần sửa |
|---|---|---|---|
| 1 | Checkbox không phân biệt trạng thái | 🔴 Critical | Component checkbox + data model |
| 2 | Tên cột xoay dọc khó đọc | 🔴 Critical | Table header CSS |
| 3 | Nút "Lưu" lặp lại mỗi hàng | 🟡 Major | Save logic + UX pattern |
| 4 | Cột "Quản trị viên" không nhất quán | 🟡 Major | Data model + column config |
| 5 | Section label không nổi bật | 🟠 Minor | Group header row |
| 6 | Không có hover/crosshair state | 🟠 Minor | Row + column CSS |

---

## LỖI 1 — Checkbox Không Phân Biệt Trạng Thái (🔴 Critical)

### Mô tả lỗi

Tất cả checkbox hiển thị tick màu xám nhạt như nhau — người dùng không phân biệt được:
- Checkbox nào đang **checked và có thể thay đổi**
- Checkbox nào đang **disabled/read-only**
- Checkbox nào đang **unchecked**

Vi phạm nguyên tắc **affordance** — UI không truyền đạt rõ khả năng tương tác.

### Nguyên nhân

```tsx
// ❌ Code hiện tại — tất cả checkbox dùng cùng style xám
<input
  type="checkbox"
  checked={permission.granted}
  className="w-4 h-4 text-slate-300"
  onChange={...}
/>
```

### Fix Step 1 — Định nghĩa rõ 3 trạng thái

```typescript
// src/types/permission.ts
export type CheckboxState =
  | 'checked-enabled'    // Có quyền, có thể thay đổi
  | 'unchecked-enabled'  // Không có quyền, có thể thay đổi
  | 'checked-disabled'   // Có quyền, không thể thay đổi (inherited từ role cao hơn)
  | 'unchecked-disabled' // Không quyền, không thể thay đổi

export interface PermissionCell {
  unitId: string;
  userId: string;
  granted: boolean;
  editable: boolean;  // ← THÊM FIELD NÀY — xác định có thể click không
}
```

### Fix Step 2 — Tạo component `PermissionCheckbox`

```tsx
// src/components/PermissionCheckbox.tsx
interface PermissionCheckboxProps {
  checked: boolean;
  editable: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;  // Giải thích tại sao disabled nếu có
}

function PermissionCheckbox({ checked, editable, onChange, tooltip }: PermissionCheckboxProps) {
  const baseStyle = 'w-4 h-4 rounded border-2 transition-all duration-150 flex-shrink-0';

  const stateStyle = editable
    ? `cursor-pointer border-slate-300 hover:border-blue-400
       checked:bg-blue-600 checked:border-blue-600
       focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1`
    : `cursor-not-allowed opacity-40 border-slate-200 bg-slate-100`;

  return (
    <div className="flex items-center justify-center" title={tooltip}>
      <input
        type="checkbox"
        checked={checked}
        disabled={!editable}
        onChange={e => editable && onChange(e.target.checked)}
        className={`${baseStyle} ${stateStyle}`}
        aria-label={editable ? 'Thay đổi quyền' : 'Quyền này không thể thay đổi'}
      />
    </div>
  );
}

export default PermissionCheckbox;
```

### Fix Step 3 — Visual spec 3 trạng thái

| Trạng thái | Border | Background | Tick | Cursor | Opacity |
|---|---|---|---|---|---|
| Checked + Enabled | `border-blue-600` | `bg-blue-600` | Trắng ✓ | `pointer` | 100% |
| Unchecked + Enabled | `border-slate-300` | `bg-white` | Không có | `pointer` | 100% |
| Checked + Disabled | `border-slate-200` | `bg-slate-100` | Xám ✓ | `not-allowed` | 40% |
| Unchecked + Disabled | `border-slate-200` | `bg-slate-100` | Không có | `not-allowed` | 40% |

### Fix Step 4 — Cập nhật trong table row

```tsx
// Trong PhanQuyenTheodonVi.tsx
{users.map(user => {
  const cell = getPermissionCell(unit.id, user.id);
  return (
    <td key={user.id} className="px-2 py-3 text-center">
      <PermissionCheckbox
        checked={cell.granted}
        editable={cell.editable}
        onChange={(val) => handlePermissionChange(unit.id, user.id, val)}
        tooltip={!cell.editable ? 'Quyền này được kế thừa từ vai trò hệ thống' : undefined}
      />
    </td>
  );
})}
```

---

## LỖI 2 — Tên Cột Xoay Dọc Khó Đọc (🔴 Critical)

### Mô tả lỗi

13 cột tên người dùng bị xoay 90° (`writing-mode: vertical-rl`). Với tên dài như "Hoàng Thị Cẩm Chương", "Nguyễn Lê Trâm Anh" — người dùng phải nghiêng đầu đọc và rất dễ nhầm cột khi có nhiều hàng.

### Nguyên nhân

```css
/* ❌ CSS hiện tại */
.column-header {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
}
```

### Fix — Giải pháp được chọn: Avatar initials + Tooltip

Đây là giải pháp tốt nhất cho bảng matrix nhiều cột: hiển thị **chữ viết tắt** trong cột hẹp, full name khi hover tooltip.

#### Step 1 — Utility function tạo initials

```typescript
// src/utils/nameUtils.ts

/**
 * Tạo chữ viết tắt từ tên tiếng Việt
 * "Trần Ngọc Đăng" → "TĐ"
 * "Hoàng Thị Cẩm Chương" → "HC"
 */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
  const first = parts[0].charAt(0);
  const last  = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}

/**
 * Tạo màu nền avatar từ tên (consistent — cùng tên luôn ra cùng màu)
 */
const AVATAR_COLORS = [
  '#1a6ec2', '#7c3aed', '#059669', '#d97706',
  '#dc2626', '#0891b2', '#9333ea', '#16a34a',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
```

#### Step 2 — Component `UserColumnHeader`

```tsx
// src/components/UserColumnHeader.tsx
import { getInitials, getAvatarColor } from '../utils/nameUtils';

interface UserColumnHeaderProps {
  name: string;   // "Trần Ngọc Đăng"
  role?: string;  // "Lãnh đạo" (optional subtitle)
}

function UserColumnHeader({ name, role }: UserColumnHeaderProps) {
  const initials = getInitials(name);
  const color    = getAvatarColor(name);

  return (
    <div
      className="flex flex-col items-center gap-1 px-1 cursor-default group"
      title={name}  // Native tooltip — đơn giản, đủ dùng
    >
      {/* Avatar circle */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center
                   text-white text-[11px] font-black flex-shrink-0
                   ring-2 ring-white group-hover:ring-blue-200 transition-all"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>

      {/* Tên viết tắt bên dưới */}
      <span className="text-[10px] text-slate-500 text-center leading-tight max-w-[52px] truncate">
        {name.split(' ').slice(-1)[0]}  {/* Chỉ hiện tên (từ cuối) */}
      </span>
    </div>
  );
}

export default UserColumnHeader;
```

#### Step 3 — CSS cho table header (không còn xoay dọc)

```tsx
// ✅ Thay thế toàn bộ phần <thead>
<thead>
  <tr className="border-b-2 border-slate-200">
    {/* Cột ĐƠN VỊ — cố định bên trái */}
    <th
      className="sticky left-0 z-20 bg-white px-4 py-4 text-left
                 text-xs font-black uppercase tracking-widest text-slate-500
                 border-r border-slate-200 min-w-[200px]"
    >
      ĐƠN VỊ
    </th>

    {/* Các cột tên người dùng */}
    {users.map(user => (
      <th
        key={user.id}
        className="px-1 py-3 text-center bg-white w-[68px] min-w-[68px]"
      >
        <UserColumnHeader name={user.name} role={user.role} />
      </th>
    ))}

    {/* Cột Lưu */}
    <th className="sticky right-0 z-20 bg-white px-4 py-4 text-center
                   text-xs font-black uppercase tracking-widest text-slate-500
                   border-l border-slate-200 min-w-[80px]">
      LƯU
    </th>
  </tr>
</thead>
```

#### Step 4 — Thêm horizontal scroll cho bảng rộng

```tsx
// Bọc bảng trong scroll container
<div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
  <table className="border-collapse w-full min-w-[900px]">
    {/* thead + tbody */}
  </table>
</div>
```

#### Kết quả sau fix

| Trước | Sau |
|---|---|
| Tên xoay 90°, phải nghiêng đầu đọc | Avatar viết tắt + tên ngắn, đọc thẳng |
| Header cao ~200px | Header cao ~72px |
| Không biết mình đang hover cột nào | Avatar đổi màu ring khi hover column |

---

## LỖI 3 — Nút "Lưu" Lặp Lại Mỗi Hàng (🟡 Major)

### Mô tả lỗi

20+ đơn vị = 20+ nút "Lưu" riêng biệt. Người dùng thay đổi nhiều hàng rồi quên nhấn "Lưu" ở từng hàng → dữ liệu không được lưu. Không có feedback rõ hàng nào đã có thay đổi chưa lưu.

### Fix — Auto-save với debounce + Toast feedback

Đây là pattern hiện đại nhất: **thay đổi checkbox → tự động lưu sau 800ms → hiện toast xác nhận**. Người dùng không cần nhấn bất kỳ nút nào.

#### Step 1 — State quản lý thay đổi chưa lưu

```typescript
// src/hooks/usePermissionManager.ts
import { useState, useCallback, useRef } from 'react';
import { PermissionCell } from '../types/permission';

export function usePermissionManager(initialData: PermissionCell[]) {
  const [permissions, setPermissions]   = useState<PermissionCell[]>(initialData);
  const [savingIds, setSavingIds]       = useState<Set<string>>(new Set());  // Hàng đang save
  const [savedIds, setSavedIds]         = useState<Set<string>>(new Set());  // Hàng vừa save xong
  const debounceTimers                  = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleChange = useCallback((unitId: string, userId: string, granted: boolean) => {
    // 1. Cập nhật state local ngay lập tức (optimistic update)
    setPermissions(prev =>
      prev.map(p =>
        p.unitId === unitId && p.userId === userId ? { ...p, granted } : p
      )
    );

    // 2. Debounce auto-save — chờ 800ms sau lần thay đổi cuối
    const key = `${unitId}-${userId}`;
    if (debounceTimers.current.has(key)) {
      clearTimeout(debounceTimers.current.get(key)!);
    }

    const timer = setTimeout(async () => {
      // 3. Đánh dấu đang saving
      setSavingIds(prev => new Set(prev).add(unitId));

      try {
        await savePermissionAPI(unitId, userId, granted);  // Gọi API

        // 4. Hiện trạng thái "Đã lưu" trong 2 giây
        setSavedIds(prev => new Set(prev).add(unitId));
        setTimeout(() => {
          setSavedIds(prev => {
            const next = new Set(prev);
            next.delete(unitId);
            return next;
          });
        }, 2000);

      } catch (error) {
        // 5. Rollback nếu fail
        setPermissions(prev =>
          prev.map(p =>
            p.unitId === unitId && p.userId === userId ? { ...p, granted: !granted } : p
          )
        );
        showErrorToast(`Lưu thất bại cho đơn vị ${unitId}`);
      } finally {
        setSavingIds(prev => {
          const next = new Set(prev);
          next.delete(unitId);
          return next;
        });
      }
    }, 800);

    debounceTimers.current.set(key, timer);
  }, []);

  return { permissions, savingIds, savedIds, handleChange };
}
```

#### Step 2 — Cột trạng thái lưu thay thế nút "Lưu"

```tsx
// Thay thế <td> nút Lưu trong mỗi hàng
function SaveStatusCell({ unitId, savingIds, savedIds }: {
  unitId: string;
  savingIds: Set<string>;
  savedIds: Set<string>;
}) {
  const isSaving = savingIds.has(unitId);
  const isSaved  = savedIds.has(unitId);

  if (isSaving) {
    return (
      <td className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
          {/* Spinner */}
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Đang lưu</span>
        </div>
      </td>
    );
  }

  if (isSaved) {
    return (
      <td className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-medium">
          <CheckCircleIcon className="w-4 h-4" />
          <span>Đã lưu</span>
        </div>
      </td>
    );
  }

  // Trạng thái bình thường — không hiện gì
  return (
    <td className="px-3 py-3 text-center">
      <span className="text-[10px] text-slate-300">—</span>
    </td>
  );
}
```

#### Step 3 — Global Toast ở góc màn hình (bổ sung)

```tsx
// Hiện toast ở bottom-right khi có lỗi — dùng react-hot-toast hoặc custom
import toast from 'react-hot-toast';

function showErrorToast(message: string) {
  toast.error(message, {
    duration: 4000,
    position: 'bottom-right',
    style: { fontSize: '13px', borderRadius: '10px' },
  });
}
```

#### Kết quả sau fix

| Trước | Sau |
|---|---|
| 20+ nút "Lưu" — phải nhấn từng cái | Tự động lưu sau 800ms không cần nhấn |
| Không biết hàng nào đã lưu | Spinner + "Đã lưu ✓" xuất hiện và biến mất sau 2s |
| Có thể quên lưu một số hàng | Không thể quên — auto-save xử lý toàn bộ |

---

## LỖI 4 — Cột "Quản Trị Viên" Không Nhất Quán (🟡 Major)

### Mô tả lỗi

Tất cả cột khác là **tên người cụ thể** (`Trần Ngọc Đăng`, `Hoàng Thị Phương`...) nhưng cột cuối lại là **nhãn vai trò** `"Quản trị viên"`. Inconsistent column type gây confusing — người dùng không biết đây là ai hay là gì.

### Fix — Phân tách rõ 2 loại cột

#### Step 1 — Cập nhật data model

```typescript
// src/types/permission.ts

// ✅ Phân biệt rõ user column và role column
export type ColumnType = 'user' | 'role';

export interface PermissionColumn {
  id: string;
  type: ColumnType;
  // Nếu type = 'user':
  name?: string;          // "Trần Ngọc Đăng"
  userId?: string;
  avatarUrl?: string;
  // Nếu type = 'role':
  roleName?: string;      // "Quản trị viên"
  roleDescription?: string; // "Có toàn quyền trên tất cả đơn vị"
}
```

#### Step 2 — Tách "Quản trị viên" ra khỏi user columns

**Option A (tốt nhất):** Xóa cột "Quản trị viên" khỏi bảng này hoàn toàn. Phân quyền theo role được quản lý ở tab riêng `"Phân quyền theo Vai trò"`.

**Option B:** Nếu bắt buộc giữ, phân biệt bằng visual:

```tsx
// Cột "Quản trị viên" dùng icon thay vì avatar initials
function RoleColumnHeader({ roleName }: { roleName: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-1">
      {/* Icon shield thay cho avatar */}
      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center
                      ring-2 ring-slate-200">
        <ShieldCheckIcon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[10px] text-slate-600 font-bold text-center leading-tight max-w-[52px]">
        {roleName}
      </span>
    </div>
  );
}
```

#### Step 3 — Thêm divider phân tách user columns và role column

```tsx
{/* Separator trước role column */}
<th className="px-0 py-0 w-[1px] bg-slate-200" />

{/* Role column */}
<th className="bg-slate-50 px-1 py-3 text-center">
  <RoleColumnHeader roleName="Quản trị viên" />
</th>
```

---

## LỖI 5 — Section Label Không Nổi Bật (🟠 Minor)

### Mô tả lỗi

Nhãn nhóm `"KHOA / TRƯỜNG"` hiện tại chỉ là text xám nhỏ, không có background nền, dễ bị bỏ qua hoàn toàn khi scroll.

### Fix — Group header row nổi bật

```tsx
// ✅ SectionHeaderRow component
function SectionHeaderRow({ label, icon, colspan }: {
  label: string;
  icon?: React.ReactNode;
  colspan: number;
}) {
  return (
    <tr>
      <td
        colSpan={colspan}
        className="px-4 py-2 bg-slate-100 border-y border-slate-200"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-500">{icon}</span>}
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            {label}
          </span>
        </div>
      </td>
    </tr>
  );
}

// Sử dụng trong tbody:
<tbody>
  {/* Hàng "Tất cả" */}
  <TatCaRow ... />

  {/* Section: Khoa / Trường */}
  <SectionHeaderRow
    label="Khoa / Trường"
    icon={<BuildingLibraryIcon className="w-3.5 h-3.5" />}
    colspan={totalColumns}
  />
  {khoaTruongUnits.map(unit => <UnitRow key={unit.id} unit={unit} ... />)}

  {/* Section: Bộ môn */}
  <SectionHeaderRow
    label="Bộ môn"
    icon={<AcademicCapIcon className="w-3.5 h-3.5" />}
    colspan={totalColumns}
  />
  {boMonUnits.map(unit => <UnitRow key={unit.id} unit={unit} ... />)}

  {/* Section: Trung tâm */}
  <SectionHeaderRow
    label="Trung tâm"
    icon={<BeakerIcon className="w-3.5 h-3.5" />}
    colspan={totalColumns}
  />
  {trungtamUnits.map(unit => <UnitRow key={unit.id} unit={unit} ... />)}
</tbody>
```

#### Before vs After

| Trước | Sau |
|---|---|
| `text-xs text-slate-400` text nhỏ, không nền | `bg-slate-100` + `font-black uppercase tracking-widest` + icon |
| Dễ bỏ qua khi scroll | Tạo visual break rõ ràng giữa các nhóm |
| Không có icon phân biệt | Icon khác nhau cho mỗi nhóm |

---

## LỖI 6 — Không Có Hover / Crosshair State (🟠 Minor)

### Mô tả lỗi

Khi hover vào bảng: không có highlight hàng, không có highlight cột → với 13 cột và nhiều hàng, người dùng rất dễ click nhầm ô.

### Fix Step 1 — Row hover highlight

```tsx
// Trong component hàng đơn vị
<tr
  key={unit.id}
  className="border-b border-slate-100 transition-colors group
             hover:bg-blue-50/40"   // ← Highlight toàn hàng khi hover
>
  <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/40
                 px-4 py-3 transition-colors border-r border-slate-100">
    <span className="text-sm font-semibold text-slate-700">{unit.name}</span>
  </td>
  {/* ... các td checkbox */}
</tr>
```

### Fix Step 2 — Column hover highlight (Crosshair effect)

Dùng CSS `group` + data attribute để highlight cột khi hover header:

```tsx
// Thêm state quản lý cột đang hover
const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null);

// Trên mỗi <th> header
<th
  onMouseEnter={() => setHoveredColIndex(colIndex)}
  onMouseLeave={() => setHoveredColIndex(null)}
  className="..."
>
  <UserColumnHeader name={user.name} />
</th>

// Trên mỗi <td> checkbox — tô màu nếu đang hover cột đó
<td
  className={`px-2 py-3 text-center transition-colors
    ${hoveredColIndex === colIndex ? 'bg-blue-50/60' : ''}`}
>
  <PermissionCheckbox ... />
</td>
```

### Fix Step 3 — Active cell indicator (highlight ô đang focus)

```tsx
// Khi checkbox đang được focus (keyboard navigation)
<input
  type="checkbox"
  className="... focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
             focus:outline-none"
  // Ring nổi bật ô đang focus — quan trọng cho keyboard users
/>
```

### Kết quả sau fix

| Trước | Sau |
|---|---|
| Không có highlight nào | Hàng highlight xanh nhạt khi hover |
| Không biết mình đang ở cột nào | Cột highlight nhạt hơn khi hover header |
| Không có indicator khi dùng bàn phím | Ring focus rõ ràng cho keyboard navigation |

---

## TỔNG KẾT — CHECKLIST TRIỂN KHAI

```
□ LỖI 1 — Checkbox trạng thái
  □ Tạo type CheckboxState và field editable trong PermissionCell
  □ Tạo component PermissionCheckbox.tsx với 4 visual states
  □ Thêm aria-label và title tooltip giải thích disabled state
  □ Update tất cả chỗ dùng checkbox cũ sang PermissionCheckbox mới

□ LỖI 2 — Header cột xoay dọc
  □ Tạo utility getInitials() và getAvatarColor() trong nameUtils.ts
  □ Tạo component UserColumnHeader.tsx với avatar circle + tên ngắn
  □ Xóa toàn bộ CSS writing-mode: vertical-rl
  □ Bọc bảng trong overflow-x-auto scroll container
  □ Thêm sticky left-0 cho cột ĐƠN VỊ và sticky right-0 cho cột LƯU
  □ Test với màn hình 1280px — bảng có scroll ngang đúng không

□ LỖI 3 — Nút Lưu lặp lại
  □ Tạo hook usePermissionManager.ts với auto-save debounce 800ms
  □ Tạo component SaveStatusCell.tsx (3 state: saving/saved/idle)
  □ Xóa tất cả nút "Lưu" trên từng hàng
  □ Cài thư viện toast (react-hot-toast hoặc tự build)
  □ Test: thay đổi checkbox → sau 800ms → spinner → tick xanh → biến mất

□ LỖI 4 — Cột Quản trị viên không nhất quán
  □ Quyết định: xóa cột hoặc giữ với design riêng
  □ Nếu giữ: tạo RoleColumnHeader.tsx với icon shield
  □ Thêm divider phân tách user columns và role columns
  □ Cập nhật PermissionColumn type với trường type: 'user' | 'role'

□ LỖI 5 — Section label không nổi bật
  □ Tạo component SectionHeaderRow.tsx
  □ Phân nhóm data: khoaTruong / boMon / trungtam
  □ Thêm icon khác nhau cho từng section
  □ Test: scroll nhanh qua bảng — section labels có dễ nhìn thấy không

□ LỖI 6 — Không có hover state
  □ Thêm hover:bg-blue-50/40 + group + group-hover cho mỗi <tr>
  □ Thêm useState hoveredColIndex
  □ Thêm onMouseEnter/Leave trên mỗi <th>
  □ Apply column highlight trên mỗi <td> theo hoveredColIndex
  □ Verify focus:ring trên checkbox hoạt động đúng

□ Test tổng thể
  □ Kiểm tra trên màn hình 1440px — layout chuẩn
  □ Kiểm tra trên 1280px — scroll ngang hoạt động
  □ Keyboard navigation: Tab qua các checkbox được không
  □ Screen reader: aria-label có đọc đúng không
  □ Thay đổi 5 hàng liên tục — auto-save không bị conflict
  □ Simulate network slow (Chrome DevTools) — spinner hiện đúng không
```

---

## PHỤ LỤC — BEFORE vs AFTER VISUAL SUMMARY

| Vùng | Before | After |
|---|---|---|
| **Header cột** | Tên xoay 90°, header cao 200px | Avatar initials + tên ngắn, header cao 72px |
| **Checkbox** | Tất cả xám như nhau | Xanh (enabled), xám mờ (disabled), viền rõ |
| **Hover hàng** | Không có | `bg-blue-50/40` toàn hàng |
| **Hover cột** | Không có | `bg-blue-50/60` highlight cột tương ứng |
| **Lưu dữ liệu** | Nút "Lưu" mỗi hàng, phải click từng cái | Auto-save 800ms + spinner + tick xanh |
| **Section label** | Text xám nhỏ, không nền | `bg-slate-100` + icon + uppercase bold |
| **Cột admin** | "Quản trị viên" không nhất quán | Shield icon + label riêng hoặc xóa |
