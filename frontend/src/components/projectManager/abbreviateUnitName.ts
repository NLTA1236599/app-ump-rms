const UNIT_ABBREV: Record<string, string> = {
  'Bệnh viện ĐHYD Cơ sở 1': 'BV ĐHYD CS1',
  'Bệnh viện ĐHYD CS1': 'BV ĐHYD CS1',
  'Bệnh viện ĐHYD CS2': 'BV ĐHYD CS2',
  'Bệnh viện ĐHYD CS3': 'BV ĐHYD CS3',
  'Trung tâm KCCLXNYH': 'TT KCCLXNYH',
  'Khoa Y học cổ truyền': 'Khoa YHCT',
  'Khoa Y tế công cộng': 'Khoa YTCC',
  'Khoa Khoa học cơ bản': 'Khoa KHCB',
  'Khoa Răng Hàm Mặt': 'Khoa RHM',
  'Phòng Đảm bảo CLGD & KT': 'P. ĐBCLGD & KT',
  'Phòng Công tác Sinh viên': 'P. CTSV',
  'Phòng Đào tạo Đại học': 'P. ĐT ĐH',
  'Phòng Đào tạo Sau đại học': 'P. ĐT SĐH',
  'Phòng Hành chính Tổng hợp': 'P. HCTH',
  'Phòng Hợp tác Quốc tế': 'P. HTQT',
  'Phòng Kế hoạch - Tài chính': 'P. KH-TC',
  'Phòng khám chuyên khoa RHM': 'PK CK RHM',
  'Phòng Khoa học Công nghệ': 'P. KHCN',
  'Phòng Quản trị Giáo tài': 'P. QTGT',
  'Phòng Thanh tra - Pháp chế': 'P. TT-PC',
  'Phòng Tổ chức Cán bộ': 'P. TCCB',
  'Trung tâm Công nghệ Thông tin': 'TT CNTT',
  'Trung tâm Đào tạo Nhân lực Y tế theo NCXH': 'TT ĐT NL Y tế',
  'Trung tâm Giáo dục Y học': 'TT GDYH',
  'Trung tâm Khoa học Công nghệ UMP': 'TT KHCN UMP',
  'Trung tâm Phẫu thuật Thực nghiệm': 'TT PTTN',
  'Trung tâm Y sinh học phân tử': 'TT YSHPT',
  'Trường Điều dưỡng – Kỹ thuật Y học': 'Trường ĐD–KTYH',
  'Trường Điều dưỡng - Kỹ thuật Y học': 'Trường ĐD-KTYH',
};

export function abbreviateUnitName(name: string, maxLen = 22): string {
  if (!name) return name;
  if (UNIT_ABBREV[name]) return UNIT_ABBREV[name];
  if (name.length <= maxLen) return name;
  return `${name.slice(0, Math.max(1, maxLen - 1))}…`;
}
