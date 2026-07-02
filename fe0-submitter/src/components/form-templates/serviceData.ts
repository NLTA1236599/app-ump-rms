/**
 * Form templates for submitter portal — section I only (project investigators).
 * Source: WorkflowProcess-final-spec.md §9 + frontend WorkflowProcess/serviceData.ts
 */

const PORTAL_BASE = 'https://ump.edu.vn/nghien-cuu-khoa-hoc/de-tai-nghien-cuu/cap-co-so';

export type ContractBuilderAction = 'contract_builder';

export type ServiceItem =
  | { stt: number; name: string; type: 'external'; url: string }
  | { stt: number; name: string; type: 'internal'; action: ContractBuilderAction };

export type ServiceSection = {
  id: string;
  title: string;
  items: ServiceItem[];
};

export const SERVICE_SECTIONS: ServiceSection[] = [
  {
    id: 'principal',
    title: 'I. DÀNH CHO CHỦ NHIỆM ĐỀ TÀI',
    items: [
      {
        stt: 1,
        name: 'Biểu mẫu đăng ký đề tài cấp cơ sở',
        type: 'external',
        url: PORTAL_BASE,
      },
      {
        stt: 2,
        name: 'Biểu mẫu phục vụ Hội đồng xét duyệt hồ sơ đăng ký đề tài cấp cơ sở',
        type: 'external',
        url: PORTAL_BASE,
      },
      {
        stt: 3,
        name: 'Biểu mẫu báo cáo tiến độ đề tài cấp cơ sở',
        type: 'external',
        url: PORTAL_BASE,
      },
      {
        stt: 4,
        name: 'Biểu mẫu nộp đăng ký nghiệm thu đề tài cấp cơ sở',
        type: 'external',
        url: PORTAL_BASE,
      },
      {
        stt: 5,
        name: 'Biểu mẫu Hội đồng nghiệm thu đề tài cấp cơ sở',
        type: 'external',
        url: PORTAL_BASE,
      },
      {
        stt: 6,
        name: 'Biểu mẫu nộp lưu chiểu kết quả nghiên cứu về Thư viện',
        type: 'external',
        url: PORTAL_BASE,
      },
      {
        stt: 7,
        name: 'Biểu mẫu thanh lý đề tài',
        type: 'external',
        url: PORTAL_BASE,
      },
      {
        stt: 8,
        name: 'SOPs xét chọn đề tài cấp cơ sở - Phiên bản 2.0',
        type: 'external',
        url: 'https://admin.ump.edu.vn/uploads/ckeditor/files/Truong/NghienCuuKhoaHoc/2020_QUI%20TRINH%20XET%20CHON%20DE%20TAI%20NCKH_ver2_final.pdf',
      },
      {
        stt: 9,
        name: 'SOPs nghiệm thu đề tài cấp cơ sở - Phiên bản 1.0',
        type: 'external',
        url: 'https://admin.ump.edu.vn/uploads/ckeditor/files/0503_QUI%20TRINH%20NGHIEM%20THU%20DE%20TAI%20NCKH_ver1_web.pdf',
      },
    ],
  },
];
