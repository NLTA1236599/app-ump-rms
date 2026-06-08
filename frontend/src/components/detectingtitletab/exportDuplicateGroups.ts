import * as XLSX from 'xlsx';

import type { DuplicateGroup } from './types.js';
import { getProjectYear } from './extractYear.js';

export function exportDuplicateGroups(groups: DuplicateGroup[]): void {
  const rows: string[][] = [
    ['Nhóm', 'Tiêu đề', 'Năm', 'Số HĐ', 'Chủ nhiệm', 'Khoa/Đơn vị', 'Tình trạng'],
  ];

  groups.forEach((group, groupIndex) => {
    group.projects.forEach((p) => {
      const year = getProjectYear(p) ?? '---';
      rows.push([
        String(groupIndex + 1),
        p.title ?? '',
        String(year),
        p.contractId ?? '',
        p.leadAuthor ?? '',
        p.department ?? '',
        String(p.status ?? ''),
      ]);
    });
    rows.push(['', '', '', '', '', '', '']);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 8 },
    { wch: 60 },
    { wch: 8 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lọc Trùng Đề Tài');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `LocTrungDeTai_${today}.xlsx`);
}
