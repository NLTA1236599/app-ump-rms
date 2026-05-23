import { ProjectStatus, type ResearchProject } from './types.js';

const UNITS = ['Y', 'Dược', 'YHCT', 'RHM', 'VTDL', 'Điều dưỡng', 'QTKD', 'DĐL'];

const FIELDS = ['Y học cơ sở', 'Dược học', 'Y học cổ truyền', 'Ngoại khoa'];

/** Tổng kinh phí khớp ảnh minh họa (VNĐ). */
const TARGET_BUDGET_TOTAL = 7_242_547_000;

/**
 * Bộ dữ liệu demo 300 đề tài — phân bố gần với screenshot (276 / 21 / 1 / 2).
 */
export function createDemoProjects(): ResearchProject[] {
  const list: ResearchProject[] = [];
  let n = 0;
  const mkId = () => `pj-${++n}`;

  const baseBudget = Math.floor(TARGET_BUDGET_TOTAL / 300);
  let extra = TARGET_BUDGET_TOTAL - baseBudget * 300;

  const addChunk = (count: number, patch: Partial<ResearchProject>) => {
    for (let i = 0; i < count; i++) {
      const bump = extra > 0 ? 1 : 0;
      if (extra > 0) extra -= 1;
      list.push({
        id: mkId(),
        department: UNITS[list.length % UNITS.length],
        researchField: FIELDS[list.length % FIELDS.length],
        researchType: 'Cấp Bộ',
        progressStatus: 'Đúng tiến độ',
        categories: 'Đề tài KHCN cấp cơ sở',
        startDate: `${2018 + (list.length % 8)}-06-01`,
        endDate: '2027-12-31',
        budget: baseBudget + bump,
        status: ProjectStatus.ONGOING,
        ...patch,
      });
    }
  };

  addChunk(276, { status: ProjectStatus.ONGOING });
  addChunk(21, { status: ProjectStatus.COMPLETED });
  addChunk(1, { status: ProjectStatus.OVERDUE });
  addChunk(2, { status: ProjectStatus.LIQUIDATED });

  const sum = list.reduce((a, p) => a + p.budget, 0);
  if (sum !== TARGET_BUDGET_TOTAL && list.length) {
    const last = list[list.length - 1];
    list[list.length - 1] = { ...last, budget: last.budget + (TARGET_BUDGET_TOTAL - sum) };
  }

  return list;
}
