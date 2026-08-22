# Hướng Dẫn Fix Lỗi: Tính Năng "Lọc Trùng Đề Tài" Trả Về 0 Kết Quả

## 1. Mô tả lỗi

**Tính năng:** Tab "Lọc Trùng Đề Tài" (`LocTrungDeTai`) — cho phép nhập tiêu đề đề tài mới, chọn khoảng năm và chế độ khớp (Khớp chính xác / Khớp tương đối), sau đó tìm các đề tài đã đăng ký trước đó có tiêu đề trùng hoặc tương tự.

**Hiện tượng:** Khi test với một tiêu đề đã biết chắc tồn tại trùng/tương tự trong hệ thống ở đúng khoảng năm đang lọc, kết quả trả về vẫn là **"Không tìm thấy đề tài trùng tiêu đề"** — cả 3 chỉ số (Số nhóm trùng, Đề tài bị trùng, Năm có trùng) đều = 0.

**Điều kiện test đã xác nhận (loại trừ được nguyên nhân sai):**
- ✅ Tiêu đề nhập đúng, có tồn tại bản ghi tương ứng trong dữ liệu.
- ✅ Khoảng năm lọc (2025–2026) bao trùm đúng năm đăng ký của đề tài gốc.
- ✅ Đã dùng chế độ **"Khớp tương đối"** (không phải lỗi do chỉ test khớp tuyệt đối).

→ Do đã loại trừ các nguyên nhân phía người dùng/frontend cơ bản, **trọng tâm điều tra chuyển sang backend logic**.

---

## 2. Quy trình xác định nguyên nhân gốc (thực hiện theo thứ tự)

### Bước 1 — Xác nhận request/response qua DevTools

Mở F12 → tab Network → thực hiện lại thao tác lọc trùng → kiểm tra:

| Kiểm tra | Ý nghĩa |
|---|---|
| Request URL & method | Xác nhận đúng endpoint được gọi (vd `POST /api/de-tai/loc-trung`) |
| Request payload | Xác nhận tiêu đề, năm, `matchMode` được gửi đúng giá trị |
| Response status | 200 (thành công nhưng rỗng) hay lỗi 4xx/5xx (bug rõ ràng ở tầng API) |
| Response body | Mảng rỗng `[]` thật sự, hay có dữ liệu nhưng frontend không render (bug ở tầng hiển thị) |

**Nếu response có dữ liệu nhưng UI hiển thị 0** → lỗi nằm ở **frontend mapping/render**, xem mục 4.

**Nếu response là mảng rỗng thật** → lỗi nằm ở **backend logic**, tiếp tục bước 2.

---

### Bước 2 — Kiểm tra ngưỡng % overlap (nguyên nhân phổ biến nhất)

Nếu chế độ "Khớp tương đối" dùng thuật toán tính % giống nhau giữa 2 tiêu đề (đã có sẵn logic overlap percentage từ tính năng biểu đồ dual-axis trước đó), kiểm tra:

```typescript
// Tìm trong service xử lý lọc trùng, thường có dạng:
const SIMILARITY_THRESHOLD = 0.95; // ⚠️ Nếu set quá cao (vd 95%+),
                                     // các tiêu đề giống 80-90% sẽ không được tính là trùng
```

**Cách kiểm tra nhanh:** Log ra % overlap thực tế tính được giữa 2 tiêu đề test, so với ngưỡng đang cấu hình. Nếu % thực tế thấp hơn ngưỡng dù mắt thường thấy rất giống nhau → đây chính là nguyên nhân.

**Fix:** Hạ ngưỡng xuống mức hợp lý (đề xuất 70–85% tuỳ yêu cầu nghiệp vụ), hoặc đưa ngưỡng thành **tham số cấu hình** thay vì hard-code, để có thể điều chỉnh mà không cần deploy lại.

---

### Bước 3 — Kiểm tra thuật toán so khớp có đang hoạt động đúng không

Có khả năng chế độ "Khớp tương đối" trên UI **chưa thực sự nối với thuật toán tính overlap**, mà đang tạm thời dùng logic so khớp tuyệt đối (exact match) hoặc là một hàm stub trả về rỗng.

```typescript
// Kiểm tra xem hàm xử lý có phân nhánh đúng theo matchMode không:
if (matchMode === 'relative') {
  // ⚠️ Phải gọi đúng hàm tính % overlap (vd Levenshtein, Jaccard, hoặc
  // thuật toán đã dùng cho biểu đồ dual-axis overlap trước đó)
  return calculateOverlapPercentage(title, existingTitles, threshold);
} else {
  // exact match
  return exactMatch(title, existingTitles);
}
```

**Fix:** Đảm bảo nhánh `relative` gọi đúng hàm tính overlap đã được implement và test trước đó (tái sử dụng, không viết lại logic riêng biệt).

---

### Bước 4 — Kiểm tra phạm vi dữ liệu được so sánh (query scope)

Query so khớp có thể đang bị giới hạn bởi điều kiện WHERE không phù hợp, vô tình loại bỏ chính bản ghi cần so khớp:

```sql
-- Ví dụ lỗi thường gặp:
SELECT * FROM de_tai
WHERE trang_thai = 'da_duyet'   -- ⚠️ Nếu đề tài gốc dùng để test
                                  --    đang ở trạng thái khác (nháp, chờ duyệt...)
                                  --    thì sẽ bị loại khỏi tập so sánh
  AND nam_dang_ky BETWEEN :tu_nam AND :den_nam;
```

**Kiểm tra:**
- Trạng thái (`trạng thái`) của đề tài gốc dùng để test là gì? Có nằm trong điều kiện filter của query không?
- Query có join đúng bảng chứa toàn bộ đề tài lịch sử, hay chỉ đang trỏ vào bảng/view bị giới hạn phạm vi?
- Cột dùng để so sánh (`tieu_de` / `title`) có đúng là cột chứa dữ liệu đầy đủ, không bị truncate không?

**Fix:** Rà lại điều kiện WHERE, đảm bảo phạm vi so sánh bao gồm đúng tập dữ liệu nghiệp vụ yêu cầu (thường là *tất cả* đề tài đã đăng ký trong khoảng năm, không phân biệt trạng thái, trừ khi yêu cầu nghiệp vụ nói khác).

---

### Bước 5 — Kiểm tra chuẩn hoá chuỗi (string normalization)

Dù dùng "Khớp tương đối", nếu bước tiền xử lý chuỗi trước khi tính % overlap không chuẩn hoá đúng, kết quả % tính được có thể thấp hơn thực tế:

```typescript
// Cần chuẩn hoá trước khi so sánh:
function normalizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize('NFC')              // chuẩn hoá dấu tiếng Việt
    .replace(/\s+/g, ' ');         // gộp khoảng trắng thừa
}
```

**Fix:** Áp dụng `normalizeTitle()` cho cả tiêu đề nhập vào và tiêu đề trong DB trước khi đưa vào thuật toán tính % overlap.

---

## 3. Bảng tổng hợp chẩn đoán nhanh

| Triệu chứng quan sát được | Nguyên nhân khả nghi | Vị trí fix |
|---|---|---|
| Response API rỗng, request payload đúng | Ngưỡng threshold quá cao | Backend — config threshold |
| Response API rỗng dù % overlap thực tế cao | Nhánh `relative` gọi sai hàm / dùng exact match | Backend — service logic |
| Response API rỗng, nghi ngờ do trạng thái đề tài | Query WHERE lọc sai trạng thái/phạm vi | Backend — SQL query |
| % overlap tính ra thấp hơn kỳ vọng dù nhìn giống | Thiếu chuẩn hoá chuỗi trước khi so sánh | Backend — tiền xử lý dữ liệu |
| Response có dữ liệu nhưng UI hiển thị 0 | Lỗi mapping response → state | Frontend — component xử lý kết quả |

---

## 4. Nếu lỗi nằm ở Frontend (response có data nhưng UI vẫn hiện 0)

Kiểm tra component xử lý kết quả trả về:

```typescript
// Kiểm tra các điểm sau trong component LocTrungDeTai:
// 1. State cập nhật đúng key từ response không (vd response.data.groups
//    nhưng code đang đọc response.groups)
// 2. Điều kiện hiển thị "Không tìm thấy" có đang check sai field không
//    (vd check result.length thay vì result.data.length)
setSoNhomTrung(response.data?.groups?.length ?? 0); // ⚠️ kiểm tra optional chaining
                                                      //    có đang fallback về 0 sai chỗ không
```

---

## 5. Checklist xác nhận đã fix xong

- [ ] Test với tiêu đề **trùng 100%** → phải ra kết quả trùng ở cả 2 chế độ (Khớp chính xác + Khớp tương đối)
- [ ] Test với tiêu đề **giống ~70-80%** (thay vài từ) → chế độ Khớp tương đối phải phát hiện được, Khớp chính xác thì không (đúng thiết kế)
- [ ] Test với tiêu đề **hoàn toàn khác** → cả 2 chế độ đều không báo trùng (tránh false positive)
- [ ] Test đề tài gốc ở các **trạng thái khác nhau** (nháp, chờ duyệt, đã duyệt) → xác nhận phạm vi so sánh đúng với yêu cầu nghiệp vụ
- [ ] Test với tiêu đề có **dấu tiếng Việt khác cách gõ** (vd dấu tổ hợp vs dựng sẵn) → không bị bỏ sót do lỗi chuẩn hoá
- [ ] Kiểm tra lại DevTools Network: response trả về đúng dữ liệu, UI hiển thị khớp với response
- [ ] Export Excel từ kết quả lọc trùng → xác nhận dữ liệu xuất ra đúng với dữ liệu hiển thị trên UI
