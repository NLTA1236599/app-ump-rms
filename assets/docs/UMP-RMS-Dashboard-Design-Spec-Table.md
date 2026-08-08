# Bảng Mô Tả Chi Tiết — Thiết Kế Dashboard UMP-RMS Phong Cách LinkedIn Ads
**Phiên bản:** 1.0  
**Hệ thống:** UMP-RMS — Hệ thống Quản lý Dữ liệu Khoa học Công nghệ, ĐH Y Dược TP.HCM  
**Tham chiếu UI:** LinkedIn Ads Performance Report Dashboard  
**Mục đích:** Bảng hướng dẫn chuẩn cho engineer implement từng component

---

## MỤC LỤC

| # | Zone | Tên Component | Tương đương LinkedIn |
|---|---|---|---|
| 1 | A | Header Bar | LinkedIn top blue bar |
| 2 | B | Global Filter Bar | Date / Campaign / Creative bar |
| 3 | C | KPI Metric Cards | Cost per Click / Impressions / Engagement Rate cards |
| 4 | D1 | Donut Chart — Loại đề tài | Impressions Breakdown by Seniority |
| 5 | D2 | Donut Chart — Kinh phí Đơn vị | (tương tự D1, data khác) |
| 6 | E | Performance Breakdown Table | Campaigns Analytics Performance Breakdown |
| 7 | F | Dual-axis Trend Chart | Impressions and Clicks by Year, Quarter and Month |
| 8 | — | Shared Design Tokens | Màu sắc, Typography, Spacing |
| 9 | — | Responsive Behavior | Mobile / Tablet / Desktop |
| 10 | — | Interaction & Animation | Hover, filter, transition |

---

## ZONE A — HEADER BAR

### Mô tả tổng quan
Thanh header cố định trên cùng, chiếm toàn bộ chiều rộng màn hình. Màu nền xanh đậm tạo nhận diện thương hiệu ngay lập tức — người dùng biết ngay họ đang trong hệ thống UMP-RMS.

### Bảng thiết kế chi tiết

| Thuộc tính | LinkedIn Ads | UMP-RMS | Ghi chú |
|---|---|---|---|
| **Màu nền** | `#0077b5` (LinkedIn Blue) | `#005b8e` | Giữ xanh dương đậm của UMP |
| **Chiều cao** | ~52px | `h-[52px]` | Cố định, không thay đổi |
| **Layout** | `flex justify-between items-center` | `flex justify-between items-center px-6` | Padding ngang 24px |
| **Logo (trái)** | LinkedIn logo + windsor.ai | Seal ĐHYD + "UMP-RMS" | Ảnh seal tròn ~36px |
| **Tiêu đề hệ thống** | "LinkedIn Ads Performance Report" | "HỆ THỐNG QUẢN LÝ DỮ LIỆU KHOA HỌC CÔNG NGHỆ" | `font-bold text-white text-base` |
| **Tab điều hướng (giữa)** | Overview · Campaigns Analytics · Tutorial | Tổng quan · Đề tài KHCN · Sáng kiến · Thống kê | Xem bảng Tab bên dưới |
| **Phần phải** | Template Gallery | Quản trị viên + Đăng xuất | `text-white text-sm` |
| **Position** | `sticky top-0 z-50` | `sticky top-0 z-50` | Luôn hiển thị khi scroll |
| **Shadow** | Không | `shadow-md` | Tạo depth khi scroll qua |

### Chi tiết Tab điều hướng

| Tab | State | Background | Text | Border |
|---|---|---|---|---|
| **Tổng quan** | Active | `bg-white` | `text-[#005b8e] font-semibold` | `rounded-t-sm` |
| Đề tài KHCN | Inactive | `transparent` | `text-white/90` | None |
| Sáng kiến | Inactive | `transparent` | `text-white/90` | None |
| Hồ sơ Y đức | Inactive | `transparent` | `text-white/90` | None |
| Thống kê | Inactive | `transparent` | `text-white/90` | None |
| **Hover (inactive)** | — | `bg-white/10` | `text-white` | None |

### Code mẫu

```tsx
<header className="sticky top-0 z-50 h-[52px] flex items-center justify-between px-6"
        style={{ backgroundColor: '#005b8e' }}>

  {/* Trái: Logo + Tên hệ thống */}
  <div className="flex items-center gap-3">
    <img src="/ump-seal.png" alt="UMP" className="w-9 h-9 rounded-full" />
    <span className="text-white font-bold text-sm tracking-tight">
      HỆ THỐNG QUẢN LÝ DỮ LIỆU KHOA HỌC CÔNG NGHỆ
    </span>
  </div>

  {/* Giữa: Tab Navigation */}
  <nav className="flex items-center gap-1">
    {TABS.map(tab => (
      <button key={tab.id}
        className={tab.active
          ? 'bg-white text-[#005b8e] font-semibold text-sm px-4 py-2 rounded-t-sm'
          : 'text-white/90 text-sm px-4 py-2 hover:bg-white/10 rounded-sm'}>
        {tab.label}
      </button>
    ))}
  </nav>

  {/* Phải: User info */}
  <div className="flex items-center gap-3 text-white text-sm">
    <span>{currentUser.name}</span>
    <button className="border border-white/30 rounded-full px-3 py-1 hover:bg-white/10">
      Đăng xuất
    </button>
  </div>
</header>
```

---

## ZONE B — GLOBAL FILTER BAR

### Mô tả tổng quan
Thanh bộ lọc toàn cục đặt ngay dưới header. **Quan trọng:** Khi thay đổi bất kỳ bộ lọc nào, TẤT CẢ các zone C, D, E, F đều cập nhật dữ liệu đồng thời — đây là "single source of truth" của toàn dashboard.

### Bảng thiết kế chi tiết

| Thuộc tính | LinkedIn Ads | UMP-RMS | Ghi chú |
|---|---|---|---|
| **Màu nền** | `#f3f4f6` (xám nhạt) | `#f0f4f8` | Tách biệt với content |
| **Chiều cao** | ~44px | `h-[44px]` | Compact |
| **Layout** | `flex items-center gap-6` | `flex items-center gap-4 px-6` | |
| **Position** | Sticky dưới header | `sticky top-[52px] z-40` | Bám sau header |
| **Border bottom** | `1px solid #e2e8f0` | `border-b border-slate-200` | |
| **Page title (trái)** | "Global Performance Overview" | "Tổng quan Dashboard" | `font-semibold text-slate-700` |

### Chi tiết 4 bộ lọc UMP-RMS

| # | Bộ lọc | Icon | Options mặc định | Placeholder | Width |
|---|---|---|---|---|---|
| 1 | **Năm học** | 📅 CalendarIcon | Tất cả / 2024-2025 / 2023-2024 / ... | "Năm học" | `w-36` |
| 2 | **Đơn vị** | 🏛 BuildingIcon | Tất cả / Khoa Y / Khoa Dược / YHCT / Nha / ... | "Đơn vị" | `w-40` |
| 3 | **Trạng thái** | ✅ CheckCircleIcon | Tất cả / Đang TH / Hoàn thành / Trễ hạn / Gia hạn / Thanh lý | "Trạng thái" | `w-36` |
| 4 | **Lĩnh vực NC** | 🔬 BeakerIcon | Tất cả / Y học / Dược / YHCT / Điều dưỡng / ... | "Lĩnh vực" | `w-36` |

### Select Dropdown Design

| Property | Value |
|---|---|
| **Trigger style** | `flex items-center gap-1.5 text-sm text-slate-600 border border-slate-300 rounded-md px-3 py-1.5 bg-white hover:border-blue-400 cursor-pointer` |
| **Icon màu** | `text-slate-400 w-4 h-4` |
| **Chevron** | `ChevronDownIcon w-3.5 h-3.5 text-slate-400` |
| **Dropdown panel** | `absolute mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[160px]` |
| **Option hover** | `hover:bg-blue-50 hover:text-blue-700` |
| **Option selected** | `bg-blue-600 text-white font-medium` |

### Reset Button

| Property | Value |
|---|---|
| **Vị trí** | Cuối thanh filter, bên phải |
| **Style** | `text-xs text-slate-400 hover:text-red-500 underline cursor-pointer` |
| **Label** | "Đặt lại bộ lọc" |
| **Action** | Reset tất cả 4 filter về "Tất cả" |

---

## ZONE C — KPI METRIC CARDS

### Mô tả tổng quan
5 thẻ chỉ số chính nằm theo hàng ngang, chiếm toàn bộ chiều rộng content area. Đây là vùng người dùng nhìn vào **đầu tiên** — phải truyền tải thông tin trong <2 giây. Mỗi card mô phỏng chính xác cấu trúc của LinkedIn KPI card.

### Bảng 5 KPI Cards UMP-RMS

| # | Tên KPI | Icon | Màu icon bg | Giá trị mẫu | Ý nghĩa |
|---|---|---|---|---|---|
| 1 | **Tổng số đề tài** | 📁 FolderIcon | `bg-blue-100` | 186 | Tổng đề tài trong filter hiện tại |
| 2 | **Tổng kinh phí** | 💰 CurrencyIcon | `bg-purple-100` | 7.24 tỷ VNĐ | Tổng ngân sách toàn bộ đề tài |
| 3 | **Đang thực hiện** | ⏳ ClockIcon | `bg-amber-100` | 142 | Số đề tài đang trong tiến trình |
| 4 | **Đã hoàn thành** | ✅ CheckIcon | `bg-emerald-100` | 21 | Số đề tài đã nghiệm thu |
| 5 | **Trễ hạn / Quá hạn** | ⚠️ ExclamationIcon | `bg-red-100` | 3 | Số đề tài cần xử lý khẩn |

### Cấu trúc bên trong 1 KPI Card

```
┌───────────────────────────────────────────────────────────┐
│  [Icon]  Tên KPI                                    [▼]   │  ← Dropdown đổi metric
│──────────────────────────────────────────────────────────│
│  [1T]  [1Q]  [6T]  [NH]  [1N]  [TẤT CẢ]                 │  ← Time range tabs
│──────────────────────────────────────────────────────────│
│  186                    +12 | +12.5% ▲                   │  ← Giá trị lớn + Delta
│                                                           │
│  Năm học trước: 166                                       │  ← Baseline so sánh
│──────────────────────────────────────────────────────────│
│  ___/‾‾‾\_____/‾‾‾‾‾‾‾‾‾‾‾‾‾‾                           │  ← Sparkline chart
│  Th8    Th9    Th10   Th11                                │
└───────────────────────────────────────────────────────────┘
```

### Bảng chi tiết design KPI Card

| Thành phần | LinkedIn | UMP-RMS | Specs |
|---|---|---|---|
| **Card container** | White bg, 1px border | `bg-white rounded-xl border border-slate-200 shadow-sm` | `p-4` |
| **Header row** | Dropdown chọn metric | Icon + Tên + ChevronDown | `flex justify-between items-center mb-2` |
| **Icon circle** | Không có | Có — tạo nhận diện nhanh | `w-8 h-8 rounded-lg flex items-center justify-center` |
| **Time range tabs** | 1W · 1M · 3M · TY · 1Y · ALL | 1T · 1Q · 6T · NH · 1N · TẤT CẢ | Xem bảng Tab bên dưới |
| **Giá trị chính** | `$0.14` cỡ 2.5rem | `186` hoặc `7.24 tỷ` | `text-3xl font-black text-slate-800` |
| **Delta badge** | `0.1 | 792.3% ▲` | `+20 | +12.5% ▲` | Màu xanh lá (tốt) / đỏ (xấu) |
| **Baseline text** | "Previous 3 Months: 0.02" | "Năm học trước: 166" | `text-xs text-slate-400` |
| **Sparkline chart** | Line chart nhỏ, màu xanh | Recharts `<LineChart>` mini | `height: 64px`, no axis, no grid |
| **Hover card** | Subtle shadow | `hover:shadow-md transition-shadow` | |

### Time Range Tabs

| Tab label | Khoảng thời gian | LinkedIn tương đương |
|---|---|---|
| **1T** | 1 tháng gần nhất | 1W |
| **1Q** | 1 quý gần nhất | 1M |
| **6T** | 6 tháng gần nhất | 3M |
| **NH** | Năm học hiện tại | TY |
| **1N** | 1 năm dương lịch | 1Y |
| **TẤT CẢ** | Toàn bộ dữ liệu | ALL |

**Active tab style:** `bg-[#1a6ec2] text-white font-semibold rounded-md px-2.5 py-0.5 text-xs`  
**Inactive tab style:** `text-slate-500 text-xs px-2.5 py-0.5 hover:text-slate-700 hover:bg-slate-100 rounded-md`

### Delta Badge Logic

| KPI | Hướng tăng (▲) | Màu | Hướng giảm (▼) | Màu |
|---|---|---|---|---|
| Tổng đề tài | Tốt ✅ | `text-emerald-600` | Cần xem xét | `text-red-500` |
| Kinh phí | Cần xem xét | `text-amber-600` | Tốt ✅ | `text-emerald-600` |
| Đang thực hiện | Bình thường | `text-blue-600` | Bình thường | `text-slate-500` |
| Đã hoàn thành | Tốt ✅ | `text-emerald-600` | Xấu | `text-red-500` |
| **Trễ hạn** | **Xấu ❌** | **`text-red-600`** | **Tốt ✅** | **`text-emerald-600`** |

> ⚠️ **Lưu ý quan trọng:** "Trễ hạn tăng" = màu ĐỎ dù mũi tên lên — ngược với các KPI thông thường!

---

## ZONE D1 — DONUT CHART "PHÂN BỔ THEO LOẠI ĐỀ TÀI"

### Mô tả tổng quan
Biểu đồ vành khuyên (Donut Chart) hiển thị tỷ lệ phân bổ đề tài theo loại. Tương đương "Impressions Breakdown by Seniority" của LinkedIn. Người dùng nhìn vào đây để hiểu **cơ cấu** của danh mục đề tài.

### Bảng thiết kế

| Thuộc tính | LinkedIn | UMP-RMS | Specs |
|---|---|---|---|
| **Loại chart** | Donut (Pie với lỗ giữa) | Donut (Recharts `<Pie innerRadius>`) | `innerRadius={70} outerRadius={110}` |
| **Container** | White bg, blue title bar | `bg-white rounded-xl shadow-sm` | `p-5` |
| **Title bar** | Blue header + title text | `bg-[#1a6ec2] px-4 py-2.5 rounded-t-xl` | White text |
| **Title text** | "Impressions Breakdown by Seniority" | "Phân bổ theo Loại đề tài" | `text-sm font-bold text-white` |
| **Legend vị trí** | Bên phải chart | Bên phải chart | `layout="vertical" align="right"` |
| **Label trên chart** | "299K (34.23%)" | "45 (35.2%)" | Số tuyệt đối + tỷ lệ % |
| **Center vòng** | Trống (chỉ có icon nhỏ) | Hiển thị tổng: "186 đề tài" | Custom label center |
| **Màu segments** | 5 tông xanh gradient | 5 màu phân biệt (xem bảng) | Không dùng cùng họ màu |
| **Hover tooltip** | Không rõ | "Sinh viên: 45 đề tài (35.2%)" | Custom tooltip |
| **Click segment** | Không | Filter table bên dưới theo loại | Cross-chart interaction |

### Data Segments

| Segment | Tỷ lệ ví dụ | Màu | Hex |
|---|---|---|---|
| **Sinh viên** | 35% | Xanh dương | `#1a6ec2` |
| **Cấp cơ sở** | 28% | Xanh lam | `#06b6d4` |
| **Ứng dụng** | 20% | Tím | `#8b5cf6` |
| **Nghị định thư** | 10% | Cam vàng | `#f59e0b` |
| **Cơ bản** | 7% | Xanh lá | `#10b981` |

### Code mẫu Recharts

```tsx
const COLORS = ['#1a6ec2', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

<div className="bg-white rounded-xl shadow-sm overflow-hidden">
  {/* Blue title bar — giống LinkedIn */}
  <div className="bg-[#1a6ec2] px-4 py-2.5">
    <h3 className="text-sm font-bold text-white">Phân bổ theo Loại đề tài</h3>
  </div>

  <div className="p-4">
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={projectTypeData}
          cx="40%"              // Dịch trái để chừa chỗ legend
          cy="50%"
          innerRadius={70}     // Tạo lỗ donut
          outerRadius={110}
          dataKey="count"
          label={({ name, percent, count }) =>
            `${count} (${(percent * 100).toFixed(1)}%)`
          }
          labelLine={false}
        >
          {projectTypeData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>

        {/* Center label */}
        <text x="40%" y="50%" textAnchor="middle" dominantBaseline="middle"
              className="text-xs font-bold fill-slate-700">
          {total} đề tài
        </text>

        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span className="text-xs text-slate-600">{value}</span>
          )}
        />
        <Tooltip
          formatter={(value, name) => [`${value} đề tài`, name]}
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
```

---

## ZONE D2 — DONUT CHART "KINH PHÍ THEO ĐƠN VỊ (TOP 5)"

### Bảng thiết kế

| Thuộc tính | Value |
|---|---|
| **Tiêu đề** | "Phân bổ Kinh phí theo Đơn vị (Top 5)" |
| **Đơn vị giá trị** | Tỷ VNĐ (rút gọn) |
| **Center label** | "Tổng: 7.24 tỷ" |
| **Label format** | "Khoa Y: 2.1 tỷ (29%)" |
| **Title bar màu** | `#1558a8` (xanh đậm hơn một chút để phân biệt với D1) |

### Data Segments

| Đơn vị | % ví dụ | Màu |
|---|---|---|
| **Khoa Y** | 34% | `#1a6ec2` |
| **Khoa Dược** | 22% | `#3b82f6` |
| **YHCT** | 18% | `#60a5fa` |
| **Nha khoa** | 14% | `#93c5fd` |
| **TT Y sinh học phân tử** | 12% | `#bfdbfe` |

> Dùng **gradient cùng họ màu xanh** (như LinkedIn) cho chart này để tạo sự khác biệt trực quan với Donut D1.

---

## ZONE E — PERFORMANCE BREAKDOWN TABLE

### Mô tả tổng quan
Bảng phân tích hiệu suất đề tài chi tiết — tương đương "Campaigns Analytics Performance Breakdown" của LinkedIn. Đây là vùng dành cho **phân tích sâu**, người dùng muốn xem từng đề tài cụ thể.

### Bảng thiết kế tổng thể

| Thuộc tính | LinkedIn | UMP-RMS | Specs |
|---|---|---|---|
| **Tiêu đề bảng** | "Campaigns Analytics Performance Breakdown" | "Bảng Phân Tích Hiệu Suất Đề Tài" | `text-base font-bold text-[#1a6ec2]` |
| **Sub-title** | "Campaigns Performance Breakdown by Cost..." | "Phân tích theo Kinh phí, Tiến độ và Hiệu suất" | `text-xs text-slate-400` |
| **Header bg** | `#1a73e8` (xanh Google-blue) | `#1a6ec2` (xanh UMP) | `text-white` |
| **Sort indicator** | `▼` trên cột đang sort | `▼` trên cột đang sort | Click để đổi asc/desc |
| **Row hover** | `hover:bg-slate-50` | `hover:bg-blue-50/30` | |
| **Stripe rows** | Không | Không | Dùng hover thay thế |
| **Total row** | Bold + màu khác | `bg-[#1a6ec2] text-white font-bold` | Sticky bottom hoặc cuối table |
| **Pagination** | Không | Hiển thị 10 hàng + "Xem thêm" | Hoặc infinite scroll nhẹ |

### Bảng định nghĩa cột

| # | Cột | Width | Data type | Visual encoding | LinkedIn tương đương |
|---|---|---|---|---|---|
| 1 | **Tên đề tài** | `30%` | Text (truncated) | `📄` icon + text + ellipsis | Campaign |
| 2 | **Chủ nhiệm** | `12%` | Text | Avatar initials + tên | — |
| 3 | **Kinh phí (VNĐ)** | `10%` | Number | Số được format `1.2 tỷ` | Spend |
| 4 | **Tiến độ (%)** | `12%` | Number 0–100 | **Inline progress bar** + số | Clicks (All) — inline bar |
| 5 | **Đơn vị** | `10%` | Text | Plain text | — |
| 6 | **Trạng thái** | `10%` | Enum | **Màu badge pill** | Objective Type |
| 7 | **Loại đề tài** | `8%` | Enum | Badge nhỏ | — |
| 8 | **Thao tác** | `8%` | Action | "Xem →" link | — |

### Visual Encoding Chi Tiết

#### Cột Tiến độ — Inline Progress Bar (học từ LinkedIn Clicks bar)

```tsx
// LinkedIn dùng inline bar cho Clicks — UMP-RMS dùng cho Tiến độ
<td className="px-3 py-2.5">
  <div className="flex items-center gap-2">
    {/* Progress bar */}
    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${progress}%`,
          backgroundColor:
            progress >= 80 ? '#10b981' :   // Xanh lá — gần hoàn thành
            progress >= 50 ? '#1a6ec2' :   // Xanh dương — trung bình
            progress >= 20 ? '#f59e0b' :   // Vàng — chậm
            '#ef4444'                       // Đỏ — rất chậm
        }}
      />
    </div>
    {/* Số % */}
    <span className="text-xs font-semibold text-slate-600 w-8 text-right">
      {progress}%
    </span>
  </div>
</td>
```

#### Cột Trạng thái — Badge Pills (học từ LinkedIn Objective Type)

| Trạng thái | Background | Text | Border |
|---|---|---|---|
| Đang thực hiện | `bg-blue-100` | `text-blue-700` | `border-blue-200` |
| Đúng hạn | `bg-emerald-100` | `text-emerald-700` | `border-emerald-200` |
| Hoàn thành | `bg-emerald-100` | `text-emerald-700` | `border-emerald-200` |
| Trễ hạn | `bg-red-100` | `text-red-700` | `border-red-200` |
| Gia hạn | `bg-amber-100` | `text-amber-700` | `border-amber-200` |
| Thanh lý | `bg-slate-100` | `text-slate-600` | `border-slate-200` |

**Badge style chung:** `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border`

#### Outlier Highlight (học từ LinkedIn cell màu xanh bất thường)

```tsx
// LinkedIn highlight cell màu xanh khi giá trị bất thường cao
// UMP-RMS: highlight row màu vàng nhạt khi đề tài trễ hạn hoặc tiến độ < 10%
const isOutlier = project.status === 'OVERDUE' || project.progress < 10;

<tr className={`border-b border-slate-100 transition-colors
  ${isOutlier
    ? 'bg-amber-50 hover:bg-amber-100'    // Outlier = amber
    : 'bg-white hover:bg-blue-50/30'      // Normal = white
  }`}>
```

#### Total Row (học từ LinkedIn Total row bold ở cuối)

```tsx
<tr className="bg-[#1a6ec2] text-white font-bold text-sm">
  <td className="px-3 py-2.5">Tổng cộng</td>
  <td className="px-3 py-2.5">—</td>
  <td className="px-3 py-2.5">{formatVND(totalBudget)}</td>
  <td className="px-3 py-2.5">{avgProgress}%</td>
  {/* ... */}
</tr>
```

---

## ZONE F — DUAL-AXIS TREND CHART

### Mô tả tổng quan
Biểu đồ kết hợp Area + Line với 2 trục Y, hiển thị xu hướng đề tài theo thời gian — tương đương "Impressions and Clicks by Year, Quarter and Month" của LinkedIn. **Range Slider** bên dưới cho phép zoom vào khoảng thời gian cụ thể.

### Bảng thiết kế tổng thể

| Thuộc tính | LinkedIn | UMP-RMS | Specs |
|---|---|---|---|
| **Loại chart** | Area + Line kết hợp | Recharts `<ComposedChart>` | Dual series |
| **Tên chart** | "Impressions and Clicks by Year..." | "Đề tài đăng ký và hoàn thành theo Năm học" | Title bar xanh |
| **Series 1** | Impressions — Area (tô nền) | **Đề tài đăng ký** — Area (tô nền xanh nhạt) | Trục Y trái |
| **Series 2** | Clicks — Line (đường) | **Đề tài hoàn thành** — Line (đường xanh đậm) | Trục Y phải |
| **Trục X** | Năm và tháng | Quý học (Q1/2022, Q2/2022...) | `text-xs text-slate-400` |
| **Trục Y trái** | Impressions (0K–200K) | Số đề tài đăng ký (0–100) | `stroke="#94a3b8"` |
| **Trục Y phải** | Clicks (0–500) | Số đề tài hoàn thành (0–50) | `stroke="#94a3b8"` |
| **Grid** | Ngang nhạt | `strokeDasharray="3 3" stroke="#f1f5f9"` | |
| **Legend** | Trên chart | Trên chart: `● Đăng ký  ● Hoàn thành` | `fontSize: 12` |
| **Range Slider** | Thanh kéo dưới trục X | Dual-thumb slider | Zoom in/out khoảng thời gian |
| **Tooltip** | Hiện cả 2 series | "Q1/2024: 18 đăng ký, 12 hoàn thành" | Custom tooltip |

### Tại sao cần 2 trục Y?

| Vấn đề | Nếu dùng 1 trục Y | Giải pháp 2 trục Y |
|---|---|---|
| Đơn vị khác nhau | Đề tài đăng ký: ~50/quý, Hoàn thành: ~10/quý | Mỗi series có scale riêng phù hợp |
| Đường bị "phẳng lì" | Series nhỏ sẽ nằm sát đáy, không đọc được trend | Cả 2 series đều thể hiện đầy đủ biến động |
| Mất thông tin | Người xem không thấy pattern của series nhỏ | Thấy rõ trend của từng series |

### Series Design

| Series | Chart type | Màu fill | Màu stroke | Opacity fill | Width stroke |
|---|---|---|---|---|---|
| **Đề tài đăng ký** | `<Area>` | `#dbeafe` (xanh rất nhạt) | `#3b82f6` | `0.6` | `2px` |
| **Đề tài hoàn thành** | `<Line>` | Không fill | `#1a6ec2` | — | `2.5px` |

### Range Slider Design (học từ LinkedIn)

| Property | Value |
|---|---|
| **Vị trí** | Ngay dưới chart, cách trục X 8px |
| **Track style** | `h-1 bg-slate-200 rounded-full` |
| **Thumb style** | `w-4 h-4 bg-white border-2 border-[#1a6ec2] rounded-full cursor-grab` |
| **Fill between thumbs** | `bg-[#1a6ec2]` — phần được chọn tô màu xanh |
| **Label** | Hiện năm học ở 2 đầu: "2022" — "2025" |
| **Behavior** | Kéo 2 thumb độc lập, chart animate theo range |

### Code mẫu Recharts

```tsx
<ComposedChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} />

  {/* Trục Y trái — Đăng ký */}
  <YAxis yAxisId="left" orientation="left"
         tick={{ fontSize: 11, fill: '#94a3b8' }}
         label={{ value: 'Đề tài đăng ký', angle: -90, position: 'insideLeft', fontSize: 11 }} />

  {/* Trục Y phải — Hoàn thành */}
  <YAxis yAxisId="right" orientation="right"
         tick={{ fontSize: 11, fill: '#94a3b8' }}
         label={{ value: 'Hoàn thành', angle: 90, position: 'insideRight', fontSize: 11 }} />

  <Tooltip
    contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #e2e8f0' }}
    formatter={(value, name) => [
      `${value} đề tài`,
      name === 'registered' ? 'Đề tài đăng ký' : 'Đề tài hoàn thành'
    ]}
    labelFormatter={(label) => `Kỳ: ${label}`}
  />

  <Legend
    iconType="circle"
    iconSize={8}
    formatter={(value) => value === 'registered' ? 'Đề tài đăng ký' : 'Đề tài hoàn thành'}
    wrapperStyle={{ fontSize: '12px' }}
  />

  {/* Area — Đăng ký (nền tô màu) */}
  <Area
    yAxisId="left"
    type="monotone"
    dataKey="registered"
    fill="#dbeafe"
    stroke="#3b82f6"
    fillOpacity={0.6}
    strokeWidth={2}
    dot={false}
  />

  {/* Line — Hoàn thành (đường đơn) */}
  <Line
    yAxisId="right"
    type="monotone"
    dataKey="completed"
    stroke="#1a6ec2"
    strokeWidth={2.5}
    dot={{ r: 3, fill: '#1a6ec2' }}
    activeDot={{ r: 5 }}
  />
</ComposedChart>
```

---

## SHARED DESIGN TOKENS

### Màu sắc hệ thống

```css
/* === UMP-RMS Dashboard Color System === */
:root {
  /* Brand */
  --brand-primary:          #1a6ec2;
  --brand-primary-dark:     #005b8e;
  --brand-primary-light:    #dbeafe;
  --brand-hover:            #1558a8;

  /* KPI Icons */
  --kpi-total-bg:           #dbeafe;   /* blue-100 */
  --kpi-total-icon:         #1a6ec2;   /* blue-600 */
  --kpi-budget-bg:          #ede9fe;   /* purple-100 */
  --kpi-budget-icon:        #8b5cf6;   /* purple-600 */
  --kpi-active-bg:          #fef3c7;   /* amber-100 */
  --kpi-active-icon:        #f59e0b;   /* amber-500 */
  --kpi-completed-bg:       #d1fae5;   /* emerald-100 */
  --kpi-completed-icon:     #10b981;   /* emerald-500 */
  --kpi-overdue-bg:         #fee2e2;   /* red-100 */
  --kpi-overdue-icon:       #ef4444;   /* red-500 */

  /* Backgrounds */
  --bg-page:                #f0f4f8;
  --bg-card:                #ffffff;
  --bg-filter-bar:          #f4f6f8;
  --bg-table-header:        #1a6ec2;
  --bg-table-total:         #1a6ec2;
  --bg-outlier-row:         #fef9e7;

  /* Chart colors (Donut D1 — màu đa dạng) */
  --chart-1:                #1a6ec2;
  --chart-2:                #06b6d4;
  --chart-3:                #8b5cf6;
  --chart-4:                #f59e0b;
  --chart-5:                #10b981;

  /* Chart colors (Donut D2 — gradient xanh) */
  --donut2-1:               #1a6ec2;
  --donut2-2:               #3b82f6;
  --donut2-3:               #60a5fa;
  --donut2-4:               #93c5fd;
  --donut2-5:               #bfdbfe;

  /* Status badges */
  --status-active-bg:       #dbeafe;
  --status-active-text:     #1d4ed8;
  --status-done-bg:         #d1fae5;
  --status-done-text:       #065f46;
  --status-overdue-bg:      #fee2e2;
  --status-overdue-text:    #991b1b;
  --status-extended-bg:     #fef3c7;
  --status-extended-text:   #92400e;
  --status-liquidated-bg:   #f1f5f9;
  --status-liquidated-text: #475569;
}
```

### Typography Scale

| Element | Font-size | Font-weight | Color | Ghi chú |
|---|---|---|---|---|
| KPI Value lớn | `30px` | `900 (Black)` | `#0f172a` | Recharts label |
| KPI Label | `12px` | `400` | `#64748b` | Tên chỉ số |
| KPI Delta | `13px` | `700` | Green/Red | `+12 \| +12.5% ▲` |
| Chart title (header bar) | `14px` | `700` | `#ffffff` | Trong blue header |
| Chart subtitle | `11px` | `400` | `#94a3b8` | Dưới title |
| Table header | `11px` | `900` | `#ffffff` | ALL CAPS |
| Table cell | `12px` | `400` | `#374151` | |
| Table total | `12px` | `700` | `#ffffff` | |
| Tab label | `13px` | `600` active / `400` inactive | White/Slate | |
| Filter label | `13px` | `400` | `#4b5563` | |
| Axis label | `11px` | `400` | `#94a3b8` | Recharts tick |
| Tooltip | `12px` | `400/600` | `#0f172a` | Custom style |

### Spacing System

| Vùng | Padding | Gap | Ghi chú |
|---|---|---|---|
| Header | `px-6` | — | |
| Filter bar | `px-6 py-2` | `gap-4` | |
| KPI strip | `px-6 py-4` | `gap-4` | 5 cards đều nhau |
| KPI card | `p-4` | — | |
| Donut section | `px-6 py-4` | `gap-4` | 2 charts ngang hàng |
| Bottom row | `px-6 pb-6` | `gap-4` | Table + Trend chart |
| Table cell | `px-3 py-2.5` | — | |
| Section spacing | — | `space-y-4` | Giữa các zone |

### Border Radius

| Component | Radius |
|---|---|
| KPI Card | `rounded-xl` (12px) |
| Donut Chart container | `rounded-xl` (12px) |
| Table container | `rounded-xl` (12px) |
| Trend Chart container | `rounded-xl` (12px) |
| Filter dropdown trigger | `rounded-md` (6px) |
| Status badge | `rounded-full` |
| Tab active | `rounded-sm` |
| Time range tab active | `rounded-md` |

---

## RESPONSIVE BEHAVIOR

### Breakpoint Strategy

| Breakpoint | Layout | Ghi chú |
|---|---|---|
| `≥ 1440px` | Full layout như mô tả | Optimal |
| `1280px – 1439px` | Full layout, thu nhỏ font | Tốt |
| `1024px – 1279px` | KPI 3 cột + 2 cột; Table scroll ngang | Acceptable |
| `768px – 1023px` | Stack dọc; sidebar thu gọn icon | Tablet |
| `< 768px` | Single column; charts responsive height | Mobile (read-only) |

### Grid Thay đổi theo Màn hình

| Zone | Desktop (≥1280) | Tablet (1024–1279) | Mobile (<768) |
|---|---|---|---|
| KPI Cards | `grid-cols-5` | `grid-cols-3` | `grid-cols-2` |
| Donut Charts | `grid-cols-2` | `grid-cols-2` | `grid-cols-1` |
| Bottom row | `flex` (60/40) | `flex-col` | `flex-col` |

---

## INTERACTION & ANIMATION GUIDE

### Hover Effects

| Element | Hover animation | Duration |
|---|---|---|
| KPI Card | `shadow-md scale-[1.01]` | `150ms ease` |
| Table row | `bg-blue-50/30` | `100ms` |
| Outlier row | `bg-amber-100` | `100ms` |
| Donut segment | Nhô ra 8px (Recharts activeShape) | `200ms` |
| Chart dot (Line) | `r: 3 → r: 6` | `150ms` |

### Filter Interaction

| Khi | Thì |
|---|---|
| Thay đổi bất kỳ filter | Tất cả zones C+D+E+F hiện loading skeleton |
| Fetch xong | Fade in data (opacity 0 → 1, 300ms) |
| Reset filter | Tất cả về mặc định, fetch lại toàn bộ |

### Loading Skeleton

```tsx
// Dùng cho KPI Card khi đang fetch
<div className="animate-pulse">
  <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
  <div className="h-8 bg-slate-200 rounded w-3/4 mb-2" />
  <div className="h-3 bg-slate-200 rounded w-2/3 mb-4" />
  <div className="h-12 bg-slate-100 rounded" />
</div>
```

### Cross-chart Interaction (LinkedIn không có, UMP-RMS thêm vào)

| Action | Effect |
|---|---|
| Click Donut segment (ví dụ: "Sinh viên") | Table bên dưới tự filter theo loại đó |
| Click hàng trong Table | Mở ProjectDetail (CRM-style page) |
| Drag Range Slider | Trend chart cập nhật real-time, KPI cũng cập nhật |

---

## TỔNG KẾT — SO SÁNH LINKEDIN vs UMP-RMS

| Thành phần | LinkedIn Ads | UMP-RMS Dashboard | Điểm giống |
|---|---|---|---|
| Header màu | `#0077b5` LinkedIn blue | `#005b8e` UMP dark blue | ✅ Xanh đậm |
| Tab navigation | Overview/Analytics/Tutorial | Tổng quan/Đề tài/Sáng kiến... | ✅ Tab in header |
| Filter bar | Date/Campaign/Creative | Năm học/Đơn vị/Trạng thái/Lĩnh vực | ✅ Global cascade |
| KPI Cards | 3 cards | 5 cards | ✅ Sparkline + Delta + Baseline |
| Time range tabs | 1W/1M/3M/TY/1Y/ALL | 1T/1Q/6T/NH/1N/TẤT CẢ | ✅ Cùng pattern |
| Donut Chart | 1 chart phải | 2 charts song song | ✅ + Title bar xanh |
| Table header | Xanh đậm + white text | `#1a6ec2` + white | ✅ |
| Inline bar trong table | Clicks column | Tiến độ column | ✅ |
| Outlier highlight | Cell màu xanh | Row màu amber | ✅ Tương đương |
| Total row | Bold cuối bảng | Bold xanh cuối bảng | ✅ |
| Dual-axis chart | Impressions (Area) + Clicks (Line) | Đăng ký (Area) + Hoàn thành (Line) | ✅ |
| Range Slider | Có | Có | ✅ |
| **Thêm mới** | Không | Cross-chart filter interaction | ➕ |
| **Thêm mới** | Không | Outlier row highlight (amber) | ➕ |
| **Thêm mới** | Không | Status badge màu | ➕ |
