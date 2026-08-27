export const PRODUCT_TYPE_I_CAPTION =
  'Dạng I: Mẫu (model, maket); Sản phẩm (là hàng hoá, có thể được tiêu thụ trên thị trường); Vật liệu; Thiết bị, máy móc; Dây chuyền công nghệ; Giống cây trồng; Giống vật nuôi và các loại khác;';

export const PRODUCT_TYPE_II_CAPTION =
  'Dạng II: Nguyên lý ứng dụng; Phương pháp; Tiêu chuẩn; Quy phạm; Phần mềm máy tính; Bản vẽ thiết kế; Quy trình công nghệ; Sơ đồ, bản đồ; Số liệu, Cơ sở dữ liệu; Báo cáo phân tích; Tài liệu dự báo (phương pháp, quy trình, mô hình,...); Đề án, qui hoạch; Luận chứng kinh tế-kỹ thuật, Báo cáo nghiên cứu khả thi và các sản phẩm khác (Báo cáo kết quả thực hiện công việc tại Bảng 21: Tiến độ thực hiện không phải là sản phẩm dạng II)';

export const PRODUCT_TYPE_III_CAPTION = 'Dạng III: Bài báo; Sách chuyên khảo và các sản phẩm khác';

export const TRAINING_SECTION_TITLE = 'Kết quả tham gia đào tạo đại học và sau đại học';

export const IP_SECTION_TITLE =
  'Sản phẩm dự kiến đăng ký bảo hộ quyền sở hữu công nghiệp, quyền đối với giống cây trồng:';

export const TRAINING_LEVELS = ['Đại học', 'Cao học', 'Nghiên cứu sinh'] as const;

export type TrainingLevel = (typeof TRAINING_LEVELS)[number];

export type ProductTypeIRow = {
  id: string;
  name: string;
  unit: string;
  qualityRequired: string;
  similarDomestic: string;
  similarWorld: string;
  expectedQuantity: string;
  actualProduct: string;
};

export type ProductTypeIIRow = {
  id: string;
  name: string;
  scientificRequirement: string;
  note: string;
  actualProduct: string;
};

export type ProductTypeIIIRow = {
  id: string;
  name: string;
  scientificRequirement: string;
  publicationVenue: string;
  note: string;
  actualProduct: string;
};

export type TrainingResultRow = {
  id: TrainingLevel;
  level: TrainingLevel;
  quantity: string;
  major: string;
  note: string;
  actualProduct: string;
};

export type ProductDetailFields = {
  productTypeI: ProductTypeIRow[];
  productTypeII: ProductTypeIIRow[];
  productTypeIII: ProductTypeIIIRow[];
  trainingResults: TrainingResultRow[];
  ipProtectionNote: string;
};

function newRowId(prefix: string): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export function createEmptyTypeIRow(): ProductTypeIRow {
  return {
    id: newRowId('pi'),
    name: '',
    unit: '',
    qualityRequired: '',
    similarDomestic: '',
    similarWorld: '',
    expectedQuantity: '',
    actualProduct: '',
  };
}

export function createEmptyTypeIIRow(): ProductTypeIIRow {
  return {
    id: newRowId('pii'),
    name: '',
    scientificRequirement: '',
    note: '',
    actualProduct: '',
  };
}

export function createEmptyTypeIIIRow(): ProductTypeIIIRow {
  return {
    id: newRowId('piii'),
    name: '',
    scientificRequirement: '',
    publicationVenue: '',
    note: '',
    actualProduct: '',
  };
}

export function createDefaultTrainingResults(
  existing?: TrainingResultRow[],
): TrainingResultRow[] {
  return TRAINING_LEVELS.map((level) => {
    const found = existing?.find((row) => row.level === level);
    return {
      id: level,
      level,
      quantity: found?.quantity ?? '',
      major: found?.major ?? '',
      note: found?.note ?? '',
      actualProduct: found?.actualProduct ?? '',
    };
  });
}

export function defaultProductDetailFields(): ProductDetailFields {
  return {
    productTypeI: [createEmptyTypeIRow()],
    productTypeII: [createEmptyTypeIIRow()],
    productTypeIII: [createEmptyTypeIIIRow()],
    trainingResults: createDefaultTrainingResults(),
    ipProtectionNote: '',
  };
}

function hasText(...values: Array<string | undefined>): boolean {
  return values.some((value) => Boolean(value?.trim()));
}

export function isTypeIRowEmpty(row: ProductTypeIRow): boolean {
  return !hasText(
    row.name,
    row.unit,
    row.qualityRequired,
    row.similarDomestic,
    row.similarWorld,
    row.expectedQuantity,
    row.actualProduct,
  );
}

export function isTypeIIRowEmpty(row: ProductTypeIIRow): boolean {
  return !hasText(row.name, row.scientificRequirement, row.note, row.actualProduct);
}

export function isTypeIIIRowEmpty(row: ProductTypeIIIRow): boolean {
  return !hasText(
    row.name,
    row.scientificRequirement,
    row.publicationVenue,
    row.note,
    row.actualProduct,
  );
}

export function isTrainingRowEmpty(row: TrainingResultRow): boolean {
  return !hasText(row.quantity, row.major, row.note, row.actualProduct);
}

export function normalizeTypeIRows(rows?: ProductTypeIRow[]): ProductTypeIRow[] {
  const next = (rows ?? [])
    .map((row) => ({ ...createEmptyTypeIRow(), ...row, id: row.id || createEmptyTypeIRow().id }))
    .filter((row) => !isTypeIRowEmpty(row));
  return next.length > 0 ? next : [createEmptyTypeIRow()];
}

export function normalizeTypeIIRows(rows?: ProductTypeIIRow[]): ProductTypeIIRow[] {
  const next = (rows ?? [])
    .map((row) => ({ ...createEmptyTypeIIRow(), ...row, id: row.id || createEmptyTypeIIRow().id }))
    .filter((row) => !isTypeIIRowEmpty(row));
  return next.length > 0 ? next : [createEmptyTypeIIRow()];
}

export function normalizeTypeIIIRows(rows?: ProductTypeIIIRow[]): ProductTypeIIIRow[] {
  const next = (rows ?? [])
    .map((row) => ({ ...createEmptyTypeIIIRow(), ...row, id: row.id || createEmptyTypeIIIRow().id }))
    .filter((row) => !isTypeIIIRowEmpty(row));
  return next.length > 0 ? next : [createEmptyTypeIIIRow()];
}

export type DerivedProductCount = { type: string; count: number };

export function deriveExpectedProductsFromDetail(
  fields: ProductDetailFields,
): DerivedProductCount[] {
  const entries: DerivedProductCount[] = [];
  const typeI = fields.productTypeI.filter((row) => !isTypeIRowEmpty(row)).length;
  if (typeI > 0) entries.push({ type: 'Dạng I', count: typeI });
  const typeII = fields.productTypeII.filter((row) => !isTypeIIRowEmpty(row)).length;
  if (typeII > 0) entries.push({ type: 'Dạng II', count: typeII });
  const typeIII = fields.productTypeIII.filter((row) => !isTypeIIIRowEmpty(row)).length;
  if (typeIII > 0) entries.push({ type: 'Dạng III', count: typeIII });
  const trainingQty = fields.trainingResults.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0),
    0,
  );
  if (trainingQty > 0) entries.push({ type: 'Đào tạo ĐH/SĐH', count: trainingQty });
  if (fields.ipProtectionNote.trim()) {
    entries.push({ type: 'Sở hữu công nghiệp', count: 1 });
  }
  return entries;
}

function countFilledActual(values: Array<string | undefined>): number {
  return values.filter((value) => Boolean(value?.trim())).length;
}

function sumNumericActual(values: Array<string | undefined>): number {
  return values.reduce((sum, value) => {
    const n = Number(value);
    return Number.isFinite(n) && String(value).trim() !== '' ? sum + n : sum;
  }, 0);
}

export function deriveActualProductsFromDetail(
  fields: ProductDetailFields,
): DerivedProductCount[] {
  const entries: DerivedProductCount[] = [];
  const typeI = countFilledActual(fields.productTypeI.map((row) => row.actualProduct));
  if (typeI > 0) entries.push({ type: 'Dạng I', count: typeI });
  const typeII = countFilledActual(fields.productTypeII.map((row) => row.actualProduct));
  if (typeII > 0) entries.push({ type: 'Dạng II', count: typeII });
  const typeIII = countFilledActual(fields.productTypeIII.map((row) => row.actualProduct));
  if (typeIII > 0) entries.push({ type: 'Dạng III', count: typeIII });
  const trainingQty = sumNumericActual(fields.trainingResults.map((row) => row.actualProduct));
  const trainingFilled = countFilledActual(fields.trainingResults.map((row) => row.actualProduct));
  if (trainingQty > 0) entries.push({ type: 'Đào tạo ĐH/SĐH', count: trainingQty });
  else if (trainingFilled > 0) entries.push({ type: 'Đào tạo ĐH/SĐH', count: trainingFilled });
  return entries;
}

export function hasProductDetailData(fields: Partial<ProductDetailFields> | undefined): boolean {
  if (!fields) return false;
  if ((fields.productTypeI ?? []).some((row) => !isTypeIRowEmpty(row))) return true;
  if ((fields.productTypeII ?? []).some((row) => !isTypeIIRowEmpty(row))) return true;
  if ((fields.productTypeIII ?? []).some((row) => !isTypeIIIRowEmpty(row))) return true;
  if ((fields.trainingResults ?? []).some((row) => !isTrainingRowEmpty(row))) return true;
  return Boolean(fields.ipProtectionNote?.trim());
}

export function formatTypeIHistory(rows: ProductTypeIRow[]): string {
  const filled = rows.filter((row) => !isTypeIRowEmpty(row));
  if (filled.length === 0) return '(trống)';
  return filled
    .map((row) =>
      [row.name, row.unit && `ĐVT: ${row.unit}`, row.expectedQuantity && `SL: ${row.expectedQuantity}`, row.actualProduct && `TT: ${row.actualProduct}`]
        .filter(Boolean)
        .join(' — '),
    )
    .join('; ');
}

export function formatTypeIIHistory(rows: ProductTypeIIRow[]): string {
  const filled = rows.filter((row) => !isTypeIIRowEmpty(row));
  if (filled.length === 0) return '(trống)';
  return filled
    .map((row) => [row.name, row.scientificRequirement, row.actualProduct && `TT: ${row.actualProduct}`].filter(Boolean).join(' — '))
    .join('; ');
}

export function formatTypeIIIHistory(rows: ProductTypeIIIRow[]): string {
  const filled = rows.filter((row) => !isTypeIIIRowEmpty(row));
  if (filled.length === 0) return '(trống)';
  return filled
    .map((row) => [row.name, row.publicationVenue, row.actualProduct && `TT: ${row.actualProduct}`].filter(Boolean).join(' — '))
    .join('; ');
}

export function formatTrainingHistory(rows: TrainingResultRow[]): string {
  const filled = rows.filter((row) => !isTrainingRowEmpty(row));
  if (filled.length === 0) return '(trống)';
  return filled
    .map((row) =>
      [row.level, row.quantity && `SL: ${row.quantity}`, row.major, row.actualProduct && `TT: ${row.actualProduct}`].filter(Boolean).join(' — '),
    )
    .join('; ');
}
