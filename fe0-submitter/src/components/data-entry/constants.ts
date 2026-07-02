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
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'done', label: 'Hoàn thành' },
  { value: 'liquidated', label: 'Thanh lý' },
  { value: 'extended_status', label: 'Gia hạn' },
  { value: 'paused', label: 'Tạm dừng' },
];

export type ProjectStatus = 'in_progress' | 'done' | 'liquidated' | 'extended_status' | 'paused';

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export type Gender = 'male' | 'female' | 'other';

/** Roles eligible to be assigned as project supervisor (Người giám sát). */
export const SUPERVISOR_ACCOUNT_ROLES = ['admin', 'specialist'] as const;

export type SupervisorAccountRole = (typeof SUPERVISOR_ACCOUNT_ROLES)[number];
