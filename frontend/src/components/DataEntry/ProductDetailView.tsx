import type { ReactNode } from 'react';

import {
  createDefaultTrainingResults,
  hasProductDetailData,
  IP_SECTION_TITLE,
  PRODUCT_TYPE_II_CAPTION,
  PRODUCT_TYPE_I_CAPTION,
  TRAINING_SECTION_TITLE,
  type ProductTypeIIIRow,
  type ProductTypeIIRow,
  type ProductTypeIRow,
  type TrainingResultRow,
} from './productDetailTypes.js';

type ProductDetailViewData = {
  productTypeI?: ProductTypeIRow[];
  productTypeII?: ProductTypeIIRow[];
  productTypeIII?: ProductTypeIIIRow[];
  trainingResults?: TrainingResultRow[];
  ipProtectionNote?: string;
};

const th =
  'border border-slate-300 bg-slate-100 px-1.5 py-1.5 text-center text-[11px] font-semibold leading-snug text-slate-700';
const numTh =
  'border border-slate-300 bg-slate-50 px-1 py-0.5 text-center text-[10px] italic text-slate-500';
const td = 'border border-slate-300 px-2 py-1.5 align-top text-xs text-slate-800';
const tdActual =
  'border border-emerald-200 bg-emerald-50/40 px-2 py-1.5 align-top text-xs font-medium text-emerald-800';
const thActual =
  'border border-emerald-300 bg-emerald-50 px-1.5 py-1.5 text-center text-[11px] font-semibold leading-snug text-emerald-800';
const numThActual =
  'border border-emerald-200 bg-emerald-50/70 px-1 py-0.5 text-center text-[10px] italic text-emerald-700';
const sttTd =
  'border border-slate-300 px-1 py-1 text-center align-middle text-[11px] font-medium text-slate-600';

function cell(value?: string) {
  const text = value?.trim();
  return text ? text : <span className="text-slate-300">—</span>;
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-t-lg border border-b-0 border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold leading-relaxed text-slate-800">
      {children}
    </div>
  );
}

export function ProductDetailView({ data }: { data: ProductDetailViewData }) {
  if (!hasProductDetailData(data)) {
    return <p className="text-sm text-slate-400">Chưa cập nhật sản phẩm chi tiết.</p>;
  }

  const typeI = data.productTypeI?.length ? data.productTypeI : [];
  const typeII = data.productTypeII?.length ? data.productTypeII : [];
  const typeIII = data.productTypeIII?.length ? data.productTypeIII : [];
  const training = createDefaultTrainingResults(data.trainingResults);

  return (
    <div className="space-y-5">
      {typeI.length > 0 && (
        <div>
          <Caption>{PRODUCT_TYPE_I_CAPTION}</Caption>
          <div className="overflow-x-auto rounded-b-lg border border-slate-300">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th className={th} rowSpan={3}>
                    Số TT
                  </th>
                  <th className={th} rowSpan={3}>
                    Tên sản phẩm cụ thể và chỉ tiêu chất lượng chủ yếu của sản phẩm
                  </th>
                  <th className={th} rowSpan={3}>
                    Đơn vị đo
                  </th>
                  <th className={th} colSpan={3}>
                    Mức chất lượng
                  </th>
                  <th className={th} rowSpan={3}>
                    Dự kiến số lượng/quy mô sản phẩm tạo ra
                  </th>
                  <th className={thActual} rowSpan={3}>
                    Sản phẩm thực tế
                  </th>
                </tr>
                <tr>
                  <th className={th} rowSpan={2}>
                    Cần đạt
                  </th>
                  <th className={th} colSpan={2}>
                    Mẫu tương tự (theo các tiêu chuẩn mới nhất)
                  </th>
                </tr>
                <tr>
                  <th className={th}>Trong nước</th>
                  <th className={th}>Thế giới</th>
                </tr>
                <tr>
                  {['(1)', '(2)', '(3)', '(4)', '(5)', '(6)', '(7)', '(8)'].map((n) => (
                    <th key={n} className={n === '(8)' ? numThActual : numTh}>
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {typeI.map((row, index) => (
                  <tr key={row.id || index}>
                    <td className={sttTd}>{index + 1}</td>
                    <td className={td}>{cell(row.name)}</td>
                    <td className={td}>{cell(row.unit)}</td>
                    <td className={td}>{cell(row.qualityRequired)}</td>
                    <td className={td}>{cell(row.similarDomestic)}</td>
                    <td className={td}>{cell(row.similarWorld)}</td>
                    <td className={td}>{cell(row.expectedQuantity)}</td>
                    <td className={tdActual}>{cell(row.actualProduct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {typeII.length > 0 && (
        <div>
          <Caption>{PRODUCT_TYPE_II_CAPTION}</Caption>
          <div className="overflow-x-auto rounded-b-lg border border-slate-300">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>TT</th>
                  <th className={th}>Tên sản phẩm</th>
                  <th className={th}>Yêu cầu khoa học cần đạt</th>
                  <th className={th}>Ghi chú</th>
                  <th className={thActual}>Sản phẩm thực tế</th>
                </tr>
                <tr>
                  {['(1)', '(2)', '(3)', '(4)', '(5)'].map((n) => (
                    <th key={n} className={n === '(5)' ? numThActual : numTh}>
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {typeII.map((row, index) => (
                  <tr key={row.id || index}>
                    <td className={sttTd}>{index + 1}</td>
                    <td className={td}>{cell(row.name)}</td>
                    <td className={td}>{cell(row.scientificRequirement)}</td>
                    <td className={td}>{cell(row.note)}</td>
                    <td className={tdActual}>{cell(row.actualProduct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {typeIII.length > 0 && (
        <div>
          <Caption>
            <span className="underline">Dạng III</span>
            : Bài báo; Sách chuyên khảo và các sản phẩm khác
          </Caption>
          <div className="overflow-x-auto rounded-b-lg border border-slate-300">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Số TT</th>
                  <th className={th}>Tên sản phẩm</th>
                  <th className={th}>Yêu cầu khoa học cần đạt</th>
                  <th className={th}>Dự kiến nơi công bố (Tạp chí, Nhà xuất bản)</th>
                  <th className={th}>Ghi chú</th>
                  <th className={thActual}>Sản phẩm thực tế</th>
                </tr>
                <tr>
                  {['(1)', '(2)', '(3)', '(4)', '(5)', '(6)'].map((n) => (
                    <th key={n} className={n === '(6)' ? numThActual : numTh}>
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {typeIII.map((row, index) => (
                  <tr key={row.id || index}>
                    <td className={sttTd}>{index + 1}</td>
                    <td className={td}>{cell(row.name)}</td>
                    <td className={td}>{cell(row.scientificRequirement)}</td>
                    <td className={td}>{cell(row.publicationVenue)}</td>
                    <td className={td}>{cell(row.note)}</td>
                    <td className={tdActual}>{cell(row.actualProduct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {training.some(
        (row) => row.quantity.trim() || row.major.trim() || row.note.trim() || row.actualProduct.trim(),
      ) && (
        <div>
          <p className="mb-2 text-xs font-bold text-slate-800">{TRAINING_SECTION_TITLE}</p>
          <div className="overflow-x-auto rounded-lg border border-slate-300">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>TT</th>
                  <th className={th}>Trình độ đào tạo</th>
                  <th className={th}>Số lượng</th>
                  <th className={th}>Chuyên ngành đào tạo</th>
                  <th className={th}>Ghi chú</th>
                  <th className={thActual}>Sản phẩm thực tế</th>
                </tr>
                <tr>
                  {['(1)', '(2)', '(3)', '(4)', '(5)', '(6)'].map((n) => (
                    <th key={n} className={n === '(6)' ? numThActual : numTh}>
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {training.map((row, index) => (
                  <tr key={row.id}>
                    <td className={sttTd}>{index + 1}</td>
                    <td className={`${td} font-semibold`}>{row.level}</td>
                    <td className={`${td} text-center`}>{cell(row.quantity)}</td>
                    <td className={td}>{cell(row.major)}</td>
                    <td className={td}>{cell(row.note)}</td>
                    <td className={tdActual}>{cell(row.actualProduct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.ipProtectionNote?.trim() ? (
        <div>
          <p className="mb-1 text-xs font-bold text-slate-800">{IP_SECTION_TITLE}</p>
          <p className="whitespace-pre-wrap text-sm text-slate-800">{data.ipProtectionNote}</p>
        </div>
      ) : null}
    </div>
  );
}
