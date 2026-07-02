import { TABLE_GRID_COLUMNS } from '../../utils/projectList.js';

export function ProjectTableHeader() {
  return (
    <div
      className="grid gap-4 py-3 text-sm text-slate-500"
      style={{ gridTemplateColumns: TABLE_GRID_COLUMNS }}
    >
      <span>Mã số</span>
      <span>Tên đề tài</span>
      <span>Cấp</span>
      <span>Thời gian</span>
      <span>Trạng thái</span>
      <span>Thao tác</span>
    </div>
  );
}
