-- T11 — Xóa tài khoản test (chạy trên production SAU khi backup).
-- Bảng users dùng cột username (email), không phải email.

-- 1) Xem trước
SELECT id, username, role, email_verified, created_at
FROM users
WHERE username IN (
  'x@ump.edu.vn',
  'roletest@ump.edu.vn',
  'roletest2@ump.edu.vn'
);

-- 2) Xóa trong transaction (OTP CASCADE theo FK user_id)
BEGIN;

DELETE FROM registration_otp_codes
WHERE user_id IN (
  SELECT id FROM users
  WHERE username IN (
    'x@ump.edu.vn',
    'roletest@ump.edu.vn',
    'roletest2@ump.edu.vn'
  )
);

DELETE FROM users
WHERE username IN (
  'x@ump.edu.vn',
  'roletest@ump.edu.vn',
  'roletest2@ump.edu.vn'
);

-- Kiểm tra số dòng bị xóa = 3 rồi mới:
COMMIT;
-- hoặc ROLLBACK;
