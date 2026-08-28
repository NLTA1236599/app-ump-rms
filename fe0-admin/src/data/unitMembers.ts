export type UnitMemberRole = 'Trưởng phòng' | 'Thư ký' | 'Chuyên viên';

export type UnitMember = {
  id: string;
  fullName: string;
  role: UnitMemberRole;
  /** Registered ump.edu.vn email, or null if chưa có tài khoản */
  email: string | null;
  /** Đơn vị công tác chính của thành viên */
  homeUnit: string;
  /**
   * Đơn vị / trung tâm / khoa được phép xem đề tài.
   * Mảng rỗng = xem đề tài của tất cả đơn vị.
   */
  allowedUnits: string[];
};

/** Loại đề tài dùng để phân quyền xem (cùng danh sách form đăng ký đề tài). */
export const PROJECT_TYPE_TAGS = [
  'Loại A',
  'Loại B',
  'Loại C',
  'Loại D',
  'Tự túc kinh phí',
  'Sinh viên',
  'Khác',
] as const;

export type ProjectTypeTag = (typeof PROJECT_TYPE_TAGS)[number];

/** Nhóm đơn vị / trung tâm / khoa dùng để phân quyền xem đề tài. */
export const ORG_UNIT_GROUPS: { label: string; units: string[] }[] = [
  {
    label: 'Khoa / Trường',
    units: [
      'Khoa Khoa học cơ bản',
      'Khoa Răng Hàm Mặt',
      'Khoa Y học cổ truyền',
      'Khoa Y tế công cộng',
      'Trường Dược',
      'Trường Điều dưỡng – Kỹ thuật Y học',
      'Trường Y',
    ],
  },
  {
    label: 'Phòng / Đơn vị chức năng',
    units: [
      'Phòng Công tác Sinh viên',
      'Phòng Đảm bảo CLGD & KT',
      'Phòng Đào tạo Đại học',
      'Phòng Đào tạo Sau đại học',
      'Phòng Hành chính Tổng hợp',
      'Phòng Hợp tác Quốc tế',
      'Phòng Kế hoạch - Tài chính',
      'Phòng Khoa học Công nghệ',
      'Phòng Quản trị Giáo tài',
      'Phòng Thanh tra - Pháp chế',
      'Phòng Tổ chức Cán bộ',
      'Phòng khám chuyên khoa RHM',
      'Ký túc xá',
      'Thư viện',
      'Tạp chí Y học TPHCM',
    ],
  },
  {
    label: 'Trung tâm',
    units: [
      'Trung tâm Công nghệ Thông tin',
      'Trung tâm Đào tạo Nhân lực Y tế theo NCXH',
      'Trung tâm Giáo dục Y học',
      'Trung tâm KCCLXNYH',
      'Trung tâm Khoa học Công nghệ UMP',
      'Trung tâm Phẫu thuật Thực nghiệm',
      'Trung tâm Y sinh học phân tử',
    ],
  },
  {
    label: 'Bệnh viện',
    units: ['Bệnh viện ĐHYD CS1', 'Bệnh viện ĐHYD CS2', 'Bệnh viện ĐHYD CS3'],
  },
];

export const ALL_ORG_UNITS: string[] = ORG_UNIT_GROUPS.flatMap((group) => group.units);

const PKHCN = 'Phòng Khoa học Công nghệ';

/** Danh sách thành viên đơn vị (demo UI theo thiết kế Quản lý thành viên). */
export const UNIT_MEMBERS: UnitMember[] = [
  {
    id: 'm01',
    fullName: 'Lãnh đạo',
    role: 'Trưởng phòng',
    email: 'pkhcn.admin@ump.edu.vn',
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm02',
    fullName: 'Trần Ngọc Đăng',
    role: 'Trưởng phòng',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm03',
    fullName: 'Nguyễn Thị Thu Thảo',
    role: 'Thư ký',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm04',
    fullName: 'Hoàng Thị Cẩm Chương',
    role: 'Chuyên viên',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm05',
    fullName: 'Hoàng Thị Phương',
    role: 'Chuyên viên',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm06',
    fullName: 'Lâm Hồng Thịnh',
    role: 'Chuyên viên',
    email: 'lhthinh@ump.edu.vn',
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm07',
    fullName: 'Lê Đình Bảo Châu',
    role: 'Chuyên viên',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm08',
    fullName: 'Lại Thanh Ngoan',
    role: 'Chuyên viên',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm09',
    fullName: 'Nguyễn Lê Trâm Anh',
    role: 'Chuyên viên',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm10',
    fullName: 'Trương Thị Ngọc Trâm',
    role: 'Chuyên viên',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm12',
    fullName: 'Nguyễn Thị Thương',
    role: 'Chuyên viên',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm13',
    fullName: 'Tạ Thị Thanh Huyền',
    role: 'Chuyên viên',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
  {
    id: 'm14',
    fullName: 'Đỗ Quốc Vũ',
    role: 'Chuyên viên',
    email: null,
    homeUnit: PKHCN,
    allowedUnits: [],
  },
];
