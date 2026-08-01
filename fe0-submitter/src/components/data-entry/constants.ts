export const PROJECT_TYPE_TAGS = [
  'Loại A',
  'Loại B',
  'Loại C',
  'Loại D',
  'Sinh viên',
  'HVCH',
  'NCS',
  'Tự túc kinh phí',
  'Khác',
] as const;

export type ProjectTypeTag = (typeof PROJECT_TYPE_TAGS)[number];

export const RESEARCH_FIELD_OPTIONS = [
  'Khoa học tự nhiên',
  'Khoa học kỹ thuật và công nghệ',
  'Khoa học Y, dược',
  'Khoa học nông nghiệp',
  'Khoa học xã hội',
  'Khoa học nhân văn',
] as const;

export type ResearchFieldOption = (typeof RESEARCH_FIELD_OPTIONS)[number];

export const FACULTY_UNIT_OPTIONS = [
  'Trường Y',
  'Trường Dược',
  'Trường Điều dưỡng – Kỹ thuật Y học',
  'Khoa Răng Hàm Mặt',
  'Khoa Y học cổ truyền',
  'Khoa Y tế công cộng',
  'Khoa Khoa học cơ bản',
  'Trung tâm Giáo dục Y học',
  'Thư viện',
  'Trung tâm Y sinh học phân tử',
  'Trung tâm KCCLXNYH',
  'Phòng Hành chính Tổng hợp',
  'Phòng Tổ chức Cán bộ',
  'Phòng Hợp tác Quốc tế',
  'Phòng Đào tạo Đại học',
  'Phòng Công tác Sinh viên',
  'Phòng Đào tạo Sau đại học',
  'Phòng Khoa học Công nghệ',
  'Phòng Quản trị Giáo tài',
  'Phòng Thanh tra - Pháp chế',
  'Phòng Đảm bảo CLGD & KT',
  'Phòng Kế hoạch - Tài chính',
  'Bệnh viện ĐHYD CS1',
  'Bệnh viện ĐHYD CS2',
  'Bệnh viện ĐHYD CS3',
  'Phòng khám chuyên khoa RHM',
  'Trung tâm Phẫu thuật Thực nghiệm',
  'Trung tâm Đào tạo Nhân lực Y tế theo NCXH',
  'Trung tâm Công nghệ Thông tin',
  'Trung tâm Khoa học Công nghệ UMP',
  'Ký túc xá',
  'Tạp chí Y học TPHCM',
] as const;

export type FacultyUnitOption = (typeof FACULTY_UNIT_OPTIONS)[number];

export const PRODUCT_ROWS: { id: string; label: string }[] = [
  { id: 'intl_paper', label: 'Bài báo quốc tế' },
  { id: 'domestic_paper', label: 'Bài báo trong nước' },
  { id: 'type2_product', label: 'Sản phẩm dạng 2 (Mô hình/Quy trình)' },
  { id: 'postgrad_training', label: 'Đào tạo Học viên sau đại học' },
  { id: 'phd_training', label: 'Đào tạo Nghiên cứu sinh' },
  { id: 'book', label: 'Sách/Giáo trình' },
  { id: 'ip', label: 'Đăng ký sở hữu trí tuệ' },
];

export const EXECUTION_PROGRESS: { value: ExecutionProgress; label: string }[] = [
  { value: 'on_time', label: 'Đúng hạn' },
  { value: 'late', label: 'Trễ hạn' },
  { value: 'extended', label: 'Gia hạn' },
  { value: 'completed', label: 'Hoàn thành' },
];

export type ExecutionProgress = 'on_time' | 'late' | 'extended' | 'completed';

export const PROJECT_STATUS: { value: ProjectStatus; label: string }[] = [
  { value: 'new_registration', label: 'Đăng ký mới' },
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'acceptance', label: 'Nghiệm thu' },
  { value: 'done', label: 'Hoàn thành' },
  { value: 'liquidated', label: 'Thanh lý' },
  { value: 'extended_status', label: 'Gia hạn' },
  { value: 'paused', label: 'Tạm dừng' },
];

export type ProjectStatus =
  | 'new_registration'
  | 'in_progress'
  | 'acceptance'
  | 'done'
  | 'liquidated'
  | 'extended_status'
  | 'paused';

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export type Gender = 'male' | 'female' | 'other';

/** Roles eligible to be assigned as project supervisor (Người giám sát). */
export const SUPERVISOR_ACCOUNT_ROLES = ['admin', 'specialist'] as const;

export type SupervisorAccountRole = (typeof SUPERVISOR_ACCOUNT_ROLES)[number];
