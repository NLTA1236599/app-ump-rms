# Hướng Dẫn Fix Lỗi UI — Biểu Đồ Cột Chồng (Stacked Bar Chart)
**Component:** Biểu đồ thống kê đề tài theo Đơn vị (Recharts BarChart)
**Tổng số lỗi:** 7 lỗi (2 Critical + 3 Major + 2 Minor)
**Stack:** React + TypeScript + Recharts + Tailwind CSS

---

## Danh sách lỗi phát hiện

| # | Lỗi | Mức độ | Ảnh hưởng |
|---|---|---|---|
| 1 | Legend bị đè lên trục X và nhãn cột | 🔴 Critical | Không đọc được cả legend lẫn tên đơn vị |
| 2 | Nhãn trục X bị xoay xiên, chồng đè nhau | 🔴 Critical | Không đọc được tên đơn vị nào |
| 3 | Chart không có tiêu đề | 🟡 Major | Không biết chart đang thể hiện gì |
| 4 | Màu sắc các segment quá tương phản, không có hệ thống | 🟡 Major | Khó phân biệt, không chuyên nghiệp |
| 5 | Không có tooltip custom — mất ngữ cảnh | 🟡 Major | Hover không biết số liệu chi tiết |
| 6 | Trục Y không có đơn vị / nhãn | 🟠 Minor | Không biết con số đại diện cho gì |
| 7 | Chart chiếm toàn bộ chiều rộng, không có padding container | 🟠 Minor | Biểu đồ bị sát mép, thiếu breathing room |

---

## LỖI 1 — Legend Đè Lên Trục X và Nhãn Cột (🔴 Critical)

### Mô tả lỗi

Legend (phần chú thích màu sắc: "Chưa phân loại", "Loại A", "Loại B"...) đang được đặt ở **phía dưới biểu đồ** nhưng **không có khoảng trống đủ**, khiến nó đè trực tiếp lên phần nhãn trục X (tên các đơn vị đã bị xoay xiên). Người dùng không đọc được cả hai.

### Nguyên nhân

```tsx
// ❌ Code hiện tại — Legend mặc định ở bottom, không có margin
<BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
  <Legend />   {/* verticalAlign="bottom" mặc định */}
  <XAxis
    dataKey="unit"
    angle={-45}           // Xoay -45° nhưng không tăng bottom margin
    textAnchor="end"
  />
</BarChart>
```

### Fix — Di chuyển Legend lên trên, tăng bottom margin

```tsx
// ✅ Fix hoàn chỉnh
<BarChart
  data={data}
  margin={{
    top:    20,   // Chừa chỗ cho tiêu đề chart
    right:  30,
    left:   20,
    bottom: 120,  // ← Tăng từ 5 lên 120 để chứa nhãn trục X xoay xiên
  }}
>
  {/* Legend đặt trên đầu — không bị đè */}
  <Legend
    verticalAlign="top"       // ← Di chuyển lên trên
    align="center"
    wrapperStyle={{
      paddingBottom: '16px',  // Khoảng cách giữa legend và chart
      fontSize: '12px',
    }}
    iconType="circle"
    iconSize={8}
  />

  <XAxis
    dataKey="unit"
    angle={-45}
    textAnchor="end"
    interval={0}
    tick={{ fontSize: 11, fill: '#64748b' }}
    height={100}   // ← Tăng height để chứa nhãn xoay xiên
  />
</BarChart>
```

---

## LỖI 2 — Nhãn Trục X Bị Xoay Xiên, Chồng Đè Nhau (🔴 Critical)

### Mô tả lỗi

Với 18+ đơn vị có tên dài (ví dụ "Bệnh viện ĐHYD Cơ sở 1", "Trung tâm KCCLXNYH"), các nhãn trục X bị xoay -45° nhưng vẫn **chồng đè lên nhau** do không đủ chiều rộng. Người dùng không thể đọc tên đơn vị nào cả.

### Fix — 3 lựa chọn, chọn 1 phù hợp nhất

#### Option A (Tốt nhất): Thanh ngang + Scroll dọc

Đổi sang `layout="vertical"` — bar nằm ngang, tên đơn vị ở trục Y dọc bên trái, đọc hoàn toàn tự nhiên:

```tsx
// ✅ Option A — Horizontal bar chart
<BarChart
  data={data}
  layout="vertical"           // ← Key change: ngang thay vì dọc
  width={600}
  height={Math.max(400, data.length * 36)}  // Tự động tăng chiều cao theo số lượng đơn vị
  margin={{ top: 10, right: 80, left: 180, bottom: 10 }}
  //                                  ↑ left lớn để chứa tên đơn vị dài
>
  <XAxis type="number" tick={{ fontSize: 11 }} />
  <YAxis
    type="category"
    dataKey="unit"
    width={170}               // ← Đủ rộng cho tên đơn vị dài nhất
    tick={{ fontSize: 12, fill: '#374151' }}
    interval={0}              // Hiển thị tất cả nhãn
  />
  <Tooltip content={<CustomTooltip />} />
  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 12 }} />

  {CATEGORIES.map((cat, i) => (
    <Bar key={cat.key} dataKey={cat.key} stackId="a" fill={cat.color} name={cat.label} />
  ))}
</BarChart>
```

#### Option B: Wrap trong scroll container

Nếu bắt buộc giữ layout dọc, bọc trong container scroll ngang:

```tsx
// ✅ Option B — Giữ vertical layout, cho scroll ngang
<div className="overflow-x-auto">
  <div style={{ minWidth: `${data.length * 60}px` }}>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 20, left: 20, bottom: 100 }}
      >
        <XAxis
          dataKey="unit"
          angle={-45}
          textAnchor="end"
          interval={0}           // Hiển thị tất cả nhãn
          height={90}
          tick={{ fontSize: 11, fill: '#374151' }}
        />
        {/* ... */}
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
```

#### Option C: Rút ngắn tên đơn vị + Tooltip

```typescript
// ✅ Option C — Abbreviate tên dài
function abbreviateUnitName(name: string, maxLen = 12): string {
  if (name.length <= maxLen) return name;

  // Các rút gọn phổ biến cho UMP
  const abbrevMap: Record<string, string> = {
    'Bệnh viện ĐHYD Cơ sở 1': 'BV ĐHYD CS1',
    'Trung tâm KCCLXNYH':     'TT KCCLXNYH',
    'Khoa Y học cổ truyền':   'Khoa YHCT',
    'Khoa Y tế công cộng':    'Khoa YTCC',
    // Thêm các ánh xạ khác...
  };

  return abbrevMap[name] ?? name.slice(0, maxLen) + '…';
}

// Áp dụng vào data trước khi render
const chartData = rawData.map(d => ({
  ...d,
  unitDisplay: abbreviateUnitName(d.unit),  // Tên rút gọn cho chart
  unitFull: d.unit,                         // Tên đầy đủ cho tooltip
}));
```

---

## LỖI 3 — Chart Không Có Tiêu Đề (🟡 Major)

### Mô tả lỗi

Biểu đồ không có tiêu đề. Người dùng không biết đây là "Số đề tài theo Đơn vị và Loại" hay "Kinh phí theo Đơn vị" hay thứ gì khác — phải đoán từ ngữ cảnh xung quanh.

### Fix — Thêm tiêu đề và mô tả trong container

```tsx
// ✅ Thêm title + subtitle ngoài BarChart component
<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

  {/* Header */}
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">
        Phân bổ đề tài theo Đơn vị
      </h3>
      <p className="text-xs text-slate-400 mt-0.5">
        Phân loại theo nhóm đề tài — Năm học 2024–2025
      </p>
    </div>

    {/* Optional: Badge tổng số */}
    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
      {totalProjects} đề tài
    </span>
  </div>

  {/* Chart */}
  <ResponsiveContainer width="100%" height={350}>
    <BarChart data={chartData} ...>
      {/* ... */}
    </BarChart>
  </ResponsiveContainer>

</div>
```

---

## LỖI 4 — Màu Sắc Không Có Hệ Thống (🟡 Major)

### Mô tả lỗi

Các segment trong stacked bar dùng màu ngẫu nhiên, tương phản mạnh (xanh dương, cam, xanh lá, hồng, tím) — không có palette hệ thống. Gây ra cảm giác "đồ chơi", thiếu chuyên nghiệp và khó phân biệt ý nghĩa từng màu.

### Fix — Xây dựng palette màu có hệ thống

```typescript
// src/config/chartColors.ts

// ✅ Palette chuyên nghiệp — cùng hue, khác saturation/lightness
// Dễ phân biệt, đẹp mắt, phù hợp với màu xanh UMP-RMS
export const CATEGORY_COLORS: Record<string, { color: string; label: string }> = {
  'chua_phan_loai': { color: '#94a3b8', label: 'Chưa phân loại' },  // Xám trung tính
  'loai_a':         { color: '#1a6ec2', label: 'Loại A' },           // Xanh UMP primary
  'loai_b':         { color: '#0891b2', label: 'Loại B' },           // Xanh cyan
  'loai_c':         { color: '#7c3aed', label: 'Loại C' },           // Tím
  'sinh_vien':      { color: '#059669', label: 'Sinh viên' },        // Xanh lá
  'phi':            { color: '#d97706', label: 'Phí' },              // Cam vàng
  'thu_tuc_kien':   { color: '#dc2626', label: 'Thủ tục kiện' },    // Đỏ
};

// ✅ Palette dự phòng nếu có thêm categories
export const FALLBACK_COLORS = [
  '#1a6ec2', '#7c3aed', '#059669', '#d97706',
  '#dc2626', '#0891b2', '#64748b', '#be185d',
];

export function getCategoryColor(key: string, index: number): string {
  return CATEGORY_COLORS[key]?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}
```

```tsx
// Áp dụng vào BarChart
{Object.entries(CATEGORY_COLORS).map(([key, { color, label }]) => (
  <Bar
    key={key}
    dataKey={key}
    stackId="stack"
    fill={color}
    name={label}
    radius={key === lastCategory ? [4, 4, 0, 0] : [0, 0, 0, 0]}
    //            ↑ Bo góc trên cho segment cuối cùng
  />
))}
```

### Bảng màu kết quả

| Category | Màu | Hex | Lý do chọn |
|---|---|---|---|
| Chưa phân loại | Xám trung tính | `#94a3b8` | Màu "không xác định", ít nổi |
| Loại A | Xanh UMP | `#1a6ec2` | Màu chính của hệ thống |
| Loại B | Xanh Cyan | `#0891b2` | Cùng họ xanh, phân biệt rõ |
| Loại C | Tím | `#7c3aed` | Tương phản hợp lý |
| Sinh viên | Xanh lá | `#059669` | Liên tưởng "phát triển" |
| Phí | Cam vàng | `#d97706` | Liên tưởng "chi phí" |

---

## LỖI 5 — Không Có Custom Tooltip (🟡 Major)

### Mô tả lỗi

Khi hover vào các cột, tooltip mặc định của Recharts hiển thị tất cả categories kể cả giá trị 0, không có đơn vị, font nhỏ khó đọc — mất đi giá trị phân tích quan trọng.

### Fix — Custom Tooltip component

```tsx
// src/components/charts/StackedBarTooltip.tsx
import { TooltipProps } from 'recharts';
import { CATEGORY_COLORS } from '../../config/chartColors';

function StackedBarTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  // Lọc bỏ các segment có giá trị 0
  const validEntries = payload.filter(entry => (entry.value as number) > 0);

  // Tính tổng
  const total = validEntries.reduce((sum, entry) => sum + (entry.value as number), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 min-w-[180px]">
      {/* Tên đơn vị */}
      <p className="text-xs font-black text-slate-800 mb-2 border-b border-slate-100 pb-2">
        {label}
      </p>

      {/* Danh sách categories */}
      <div className="space-y-1.5">
        {validEntries.map(entry => {
          const pct = total > 0 ? ((entry.value as number) / total * 100).toFixed(1) : '0';
          const colorConfig = CATEGORY_COLORS[entry.dataKey as string];

          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                {/* Dot màu */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colorConfig?.color ?? entry.color }}
                />
                {/* Tên category */}
                <span className="text-xs text-slate-600">
                  {colorConfig?.label ?? entry.name}
                </span>
              </div>
              {/* Số + tỷ lệ */}
              <div className="flex items-center gap-1.5 text-right">
                <span className="text-xs font-bold text-slate-800">{entry.value}</span>
                <span className="text-[10px] text-slate-400">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tổng */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-500">Tổng cộng</span>
        <span className="text-sm font-black text-[#1a6ec2]">{total} đề tài</span>
      </div>
    </div>
  );
}

export default StackedBarTooltip;
```

```tsx
// Áp dụng vào BarChart
<Tooltip
  content={<StackedBarTooltip />}
  cursor={{ fill: '#f1f5f9', opacity: 0.6 }}   // Highlight cột khi hover
/>
```

---

## LỖI 6 — Trục Y Không Có Nhãn / Đơn Vị (🟠 Minor)

### Mô tả lỗi

Trục Y chỉ hiển thị số (0, 25, 50, 75, 100) nhưng không có nhãn giải thích đơn vị — người dùng không biết đây là "Số đề tài", "Tỷ lệ %", hay "Kinh phí tỷ VNĐ".

### Fix — Thêm label trục Y và format tick

```tsx
// ✅ YAxis với nhãn đầy đủ
<YAxis
  tickCount={6}
  tick={{ fontSize: 11, fill: '#94a3b8' }}
  axisLine={false}          // Bỏ đường trục — cleaner
  tickLine={false}          // Bỏ tick line
  tickFormatter={(value) => value === 0 ? '0' : `${value}`}

  // Nhãn trục Y
  label={{
    value: 'Số đề tài',
    angle: -90,
    position: 'insideLeft',
    offset: 10,
    style: {
      fontSize: 11,
      fill: '#94a3b8',
      fontWeight: 600,
    },
  }}
/>
```

---

## LỖI 7 — Chart Không Có Padding Container (🟠 Minor)

### Mô tả lỗi

Biểu đồ hiển thị trực tiếp trên nền trắng không có card container, không có padding xung quanh — bị sát mép, thiếu "breathing room" và không nhất quán với các card khác trong hệ thống UMP-RMS.

### Fix — Wrap trong card container chuẩn UMP-RMS

```tsx
// ✅ Container chuẩn — đồng bộ với toàn hệ thống
<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">

  {/* Header row */}
  <div className="flex items-start justify-between mb-5">
    <div>
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
        <ChartBarIcon className="w-4 h-4 text-[#1a6ec2]" />
        Phân bổ đề tài theo Đơn vị
      </h3>
      <p className="text-xs text-slate-400 mt-0.5">
        Năm học 2024–2025 · {data.length} đơn vị · {totalCount} đề tài
      </p>
    </div>

    {/* Export button (optional) */}
    <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700
                       border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
      <ArrowDownTrayIcon className="w-3.5 h-3.5" />
      Xuất PNG
    </button>
  </div>

  {/* Chart */}
  <div className="overflow-x-auto">
    <div style={{ minWidth: Math.max(600, data.length * 52) }}>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 30, bottom: 100 }}
        >
          {/* ... */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

</div>
```

---

## CODE HOÀN CHỈNH SAU KHI FIX

```tsx
// src/components/charts/UnitStackedBarChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CATEGORY_COLORS, getCategoryColor } from '../../config/chartColors';
import StackedBarTooltip from './StackedBarTooltip';
import { abbreviateUnitName } from '../../utils/nameUtils';

interface UnitChartDataItem {
  unit: string;          // Tên đầy đủ đơn vị
  [categoryKey: string]: number | string;
}

interface UnitStackedBarChartProps {
  data: UnitChartDataItem[];
  categories: string[];   // Danh sách key của categories
  height?: number;
}

export function UnitStackedBarChart({
  data,
  categories,
  height = 380,
}: UnitStackedBarChartProps) {

  // Rút ngắn tên đơn vị cho trục X
  const chartData = data.map(d => ({
    ...d,
    unitDisplay: abbreviateUnitName(d.unit, 12),
    unitFull:    d.unit,
  }));

  const totalCount = data.reduce((sum, d) => {
    return sum + categories.reduce((s, cat) => s + (Number(d[cat]) || 0), 0);
  }, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">
            Phân bổ đề tài theo Đơn vị
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {data.length} đơn vị · {totalCount} đề tài
          </p>
        </div>
      </div>

      {/* ── Chart ──────────────────────────────────── */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: Math.max(600, data.length * 52) }}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 30, bottom: 100 }}
              barCategoryGap="30%"
            >
              {/* Grid — chỉ ngang, nhạt */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}       // Bỏ grid dọc cho cleaner
              />

              {/* Trục X — nhãn xoay -45° với chiều cao đủ */}
              <XAxis
                dataKey="unitDisplay"
                angle={-40}
                textAnchor="end"
                interval={0}
                height={90}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />

              {/* Trục Y — có nhãn đơn vị */}
              <YAxis
                tickCount={6}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: 'Số đề tài',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: { fontSize: 11, fill: '#94a3b8', fontWeight: 600 },
                }}
              />

              {/* Tooltip custom */}
              <Tooltip
                content={<StackedBarTooltip />}
                cursor={{ fill: '#f8fafc', opacity: 0.8 }}
              />

              {/* Legend — trên đầu, không đè trục X */}
              <Legend
                verticalAlign="top"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                formatter={(value) =>
                  <span style={{ color: '#374151', fontSize: 12 }}>{value}</span>
                }
              />

              {/* Các Bar segment */}
              {categories.map((catKey, index) => {
                const isLast = index === categories.length - 1;
                return (
                  <Bar
                    key={catKey}
                    dataKey={catKey}
                    stackId="stack"
                    fill={getCategoryColor(catKey, index)}
                    name={CATEGORY_COLORS[catKey]?.label ?? catKey}
                    // Bo góc trên cho segment trên cùng
                    radius={isLast ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    // Ẩn bar nếu value = 0 để chart sạch hơn
                    hide={false}
                    maxBarSize={48}
                  />
                );
              })}

            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
```

---

## CHECKLIST TRIỂN KHAI

```
□ LỖI 1 — Legend đè lên trục X
  □ Thêm verticalAlign="top" vào <Legend>
  □ Tăng margin.bottom từ 5 lên 100–120px trong BarChart
  □ Thêm wrapperStyle={{ paddingBottom: '16px' }} cho Legend
  □ Kiểm tra: legend không đè lên bar chart hoặc trục X

□ LỖI 2 — Nhãn trục X chồng đè
  □ Chọn 1 trong 3 options:
    □ [Khuyến nghị] Option A: Đổi sang layout="vertical" (horizontal bars)
    □ Option B: Bọc trong overflow-x-auto scroll container
    □ Option C: Rút ngắn tên đơn vị + tooltip full name
  □ Thêm interval={0} để hiển thị tất cả nhãn
  □ Tăng height của XAxis lên 80–100

□ LỖI 3 — Chart không có tiêu đề
  □ Thêm <h3> tiêu đề bên ngoài chart component
  □ Thêm <p> sub-title với năm học và số lượng đơn vị/đề tài
  □ Thêm badge tổng số đề tài (optional)

□ LỖI 4 — Màu sắc không có hệ thống
  □ Tạo file src/config/chartColors.ts với CATEGORY_COLORS
  □ Thay thế màu hardcode bằng getCategoryColor()
  □ Thêm radius={[4, 4, 0, 0]} cho segment trên cùng (last Bar)
  □ Kiểm tra contrast ratio đủ cho accessibility

□ LỖI 5 — Không có custom tooltip
  □ Tạo src/components/charts/StackedBarTooltip.tsx
  □ Lọc bỏ entries có value = 0 trong tooltip
  □ Hiển thị tên đầy đủ (unitFull) trong tooltip header
  □ Hiển thị số lượng + tỷ lệ % cho mỗi category
  □ Thêm dòng tổng cộng cuối tooltip
  □ Style: rounded-xl, shadow-lg, font 12px

□ LỖI 6 — Trục Y không có nhãn
  □ Thêm label={{ value: 'Số đề tài', angle: -90, ... }} vào <YAxis>
  □ Thêm axisLine={false} và tickLine={false} cho cleaner look
  □ Thêm tickFormatter nếu cần format số (ví dụ: 1000 → "1K")

□ LỖI 7 — Không có padding container
  □ Bọc chart trong div với className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
  □ Thêm header row với tiêu đề + sub-title + badge
  □ Đồng bộ với style card của các component khác trong hệ thống

□ Test tổng thể
  □ Hover tooltip hiển thị đúng tên đầy đủ và số liệu
  □ Legend không đè lên bất kỳ element nào
  □ Tất cả tên đơn vị đọc được (không bị cắt hoặc đè)
  □ Màu sắc phân biệt rõ ràng ở cả màn hình retina và thường
  □ Chart responsive trên 1280px và 1440px
  □ Scroll ngang hoạt động mượt (nếu dùng Option B)
  □ Export PNG ra đúng (nếu có tính năng export)
```

---

## BEFORE vs AFTER VISUAL SUMMARY

| Vùng | Before | After |
|---|---|---|
| **Legend** | Đè lên trục X, không đọc được | Trên đầu chart, tách biệt hoàn toàn |
| **Nhãn trục X** | Xoay -45°, chồng đè lên nhau | Horizontal bars hoặc scroll + tên đầy đủ |
| **Tiêu đề** | Không có | "Phân bổ đề tài theo Đơn vị" + year + count |
| **Màu sắc** | Random, tương phản cao không hệ thống | Palette có chủ đích, consistent với UMP blue |
| **Tooltip** | Mặc định Recharts, hiện cả giá trị 0 | Custom: tên đầy đủ + số + % + tổng |
| **Trục Y** | Số trần, không có đơn vị | Label "Số đề tài" + axisLine ẩn cho clean |
| **Container** | Nền trắng phẳng, không có viền/shadow | Card rounded-2xl với header và padding |
