# Redesign layout Tổng quan — yêu cầu thiết kế

**Nguồn:** `UMP-RMS-Dashboard-Design-Spec-Table.md` (LinkedIn Ads style)  
**Phạm vi:** Tab Tổng quan (Đề tài KHCN)  
**Nguyên tắc:** Giữ năng lực **Biểu đồ thống kê** và **Bộ lọc dữ liệu**; đổi bố cục, hierarchy KPI và visual system.

---

## Phạm vi bắt buộc

Redesign không được bỏ mất:

1. Pipeline lọc → cập nhật toàn dashboard (`filterProjects` cascade).
2. Cụm biểu đồ thống kê (fixed + dynamic).

Có thể chuyển vị trí/hình thức UI; không được mất dữ liệu hay tương tác cốt lõi.

| Thành phần | Hiện trạng (code) | Map sang Spec |
|---|---|---|
| Biểu đồ thống kê | `FixedChartsRow` + `DynamicStatisticChart` | Zone D1/D2 (Donut) + Zone F (Trend); giữ capability |
| Bộ lọc dữ liệu | `DataFilterSidebar` (cột phải) | Zone B Global Filter Bar |

---

## Spec layout mục tiêu (Zones)

| Zone | Component | Ghi chú redesign | Ưu tiên |
|---|---|---|---|
| A | Header Bar | Giữ shell hiện có (`SiteHeader`) | Ngoài phạm vi |
| B | Global Filter Bar | Thay sidebar lọc | P0 |
| C | KPI Metric Cards | Nâng cấp `StatsRow` → 5 KPI | P0 |
| D1 | Donut — Loại đề tài | Chart cố định mới | P0 |
| D2 | Donut — Kinh phí Đơn vị (Top 5) | Map từ chart Đơn vị | P0 |
| E | Performance Table | Mới trên Tổng quan | P1 |
| F | Dual-axis Trend | Map từ thống kê theo thời gian | P1 |

### Wireframe desktop (≥1280px)

```
[A Header — giữ shell]
[B Filter bar ngang: Năm học | Đơn vị | Trạng thái | Lĩnh vực | (+ phụ) | Đặt lại]
[C KPI × 5]
[D1 Donut Loại đề tài] [D2 Donut Kinh phí Đơn vị]
[E Bảng hiệu suất ~60%]          [F Trend dual-axis ~40%]
[Biểu đồ thống kê động — giữ DynamicStatisticChart full width]
```

---

## Gap hiện tại vs Spec

| Vùng | UI hiện tại | UI theo Spec |
|---|---|---|
| Bố cục | 2 cột: content trái + filter phải | 1 cột: Filter → KPI → Donuts → Table \| Trend |
| Bộ lọc | Sidebar dọc 6 filter | Thanh ngang sticky + Reset |
| KPI | 6 card đơn giản | 5 KPI (icon + giá trị; delta/sparkline phase 2) |
| Charts cố định | Pie Trạng thái + Bar Đơn vị | 2 Donut, title bar xanh |
| Chart động | Loại/trục/năm tùy chọn | + Trend Area/Line theo kỳ |
| Bảng | Không có | Performance Breakdown |

---

## Yêu cầu chi tiết

### 4.1 Bộ lọc (Zone B)

- Chuyển sidebar → Global Filter Bar ngang.
- Filter chính Spec: **Năm học · Đơn vị · Trạng thái · Lĩnh vực NC**.
- Giữ thêm (khuyến nghị): **Năm bắt đầu · Loại đề tài** (compact trên bar).
- Đổi 1 filter → KPI + mọi chart + table cập nhật cùng lúc.
- Nút **Đặt lại bộ lọc**.
- Bỏ card “Tổng số đề tài: x/y” ở sidebar — dùng KPI.

### 4.2 Biểu đồ (Zone D + F + giữ Dynamic)

- D1: Donut **Loại đề tài** (thay Pie Trạng thái theo Spec; trạng thái vẫn ở KPI + filter).
- D2: Donut **Kinh phí theo Đơn vị (Top 5)**, title bar xanh đậm hơn.
- Giữ expand fullscreen + export Excel.
- Zone F: Trend dual-axis (đăng ký Area + hoàn thành Line) theo năm.
- Giữ `DynamicStatisticChart` bên dưới (tên “Biểu đồ thống kê”).

### 4.3 KPI (Zone C)

5 KPI: Tổng đề tài · Tổng kinh phí · Đang thực hiện · Đã hoàn thành · Trễ hạn.  
Visual: card trắng `rounded-xl`, icon pastel. Trễ hạn tăng = màu đỏ.

### 4.4 Performance Table (Zone E)

Bảng rút gọn 10 hàng + “Xem thêm”: Tên · Chủ nhiệm · Kinh phí · Tiến độ bar · Đơn vị · Trạng thái · Loại · Thao tác → mở Dữ liệu đề tài.

### 4.5 Responsive

| Breakpoint | Layout |
|---|---|
| ≥1280 | Filter full · KPI 5 · Donut 2 · Bottom 60/40 |
| 1024–1279 | KPI 3+2 · Donut 2 · Bottom dọc |
| &lt;768 | 1 cột · filter wrap |

### 4.6 Tương tác

- Đổi filter → toàn dashboard cập nhật.
- Click hàng bảng → điều hướng Dữ liệu đề tài (+ `initialViewProjectId`).
- Giữ Expand / Export chart.

---

## Pha triển khai

| Phase | Deliverable |
|---|---|
| P0 | Filter bar + KPI 5 + layout 1 cột + 2 Donut restyle |
| P1 | Trend dual-axis + Performance Table + giữ Dynamic chart |
| P2 | KPI sparkline/delta · cross-filter donut→table · skeleton |

---

## Ràng buộc implement

- Scope: `ProjectOverviewView` + filter/KPI/charts/table mới; header/shell ngoài phạm vi.
- Giữ `filterProjects` / `build*Data` — đổi presentation.
- Tokens: `#1a6ec2`, `#005b8e`, `#f0f4f8`.
- Không phá `VirtualAssistantFab`, `ChartFullscreenModal` (cập nhật kind nếu cần).
