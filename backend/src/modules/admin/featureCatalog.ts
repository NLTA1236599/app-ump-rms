export const FEATURE_CATALOG = [
  { feature: 'tong-quan', label: 'Tổng quan' },
  { feature: 'tien-do-thuc-hien', label: 'Tiến độ thực hiện' },
  { feature: 'du-lieu-de-tai', label: 'Dữ liệu đề tài' },
  { feature: 'nhap-moi-du-lieu', label: 'Nhập dữ liệu' },
  { feature: 'ke-khai-ho-so', label: 'Kê khai hồ sơ' },
  { feature: 'loc-trung-de-tai', label: 'Lọc trùng đề tài' },
] as const;

export type FeatureId = (typeof FEATURE_CATALOG)[number]['feature'];

export const DEFAULT_FEATURE_ROLES = ['admin', 'leader', 'specialist', 'user'] as const;

const FEATURE_IDS = new Set<string>(FEATURE_CATALOG.map((item) => item.feature));

export function isCatalogFeature(feature: string): feature is FeatureId {
  return FEATURE_IDS.has(feature);
}

export function featureLabel(feature: string): string {
  return FEATURE_CATALOG.find((item) => item.feature === feature)?.label ?? feature;
}
