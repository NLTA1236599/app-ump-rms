import { PROJECT_TYPE_TAGS, REVIEW_BATCH_OPTIONS } from '../DataEntry/constants.js';

import { ProgressStatus, ProjectStatus, type ResearchProject } from './types.js';

function parseProjectCategories(categories?: string): string[] {
  if (!categories?.trim()) return [];
  return categories
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getProjectTypeOptions(projects: ResearchProject[]): string[] {
  const fromData = new Set<string>();
  for (const project of projects) {
    for (const tag of parseProjectCategories(project.categories)) {
      fromData.add(tag);
    }
  }

  const extras = [...fromData].filter(
    (tag) => !PROJECT_TYPE_TAGS.includes(tag as (typeof PROJECT_TYPE_TAGS)[number]),
  );
  return [...PROJECT_TYPE_TAGS, ...extras.sort()];
}

export function getReviewBatchOptions(projects: ResearchProject[]): string[] {
  const fromData = new Set<string>();
  for (const project of projects) {
    const batch = project.reviewBatch?.trim();
    if (batch) fromData.add(batch);
  }

  const extras = [...fromData].filter(
    (tag) => !REVIEW_BATCH_OPTIONS.includes(tag as (typeof REVIEW_BATCH_OPTIONS)[number]),
  );
  return [...REVIEW_BATCH_OPTIONS, ...extras.sort()];
}

export function extractYearFromDate(dateValue: unknown): string | null {
  if (dateValue == null) return null;

  const raw = String(dateValue).trim();
  if (!raw) return null;

  if (/^\d{4}$/.test(raw)) return raw;

  const ddmmyyyyMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyyMatch) return ddmmyyyyMatch[3];

  const yyyymmddMatch = raw.match(/^(\d{4})[/-](\d{1,2})(?:[/-](\d{1,2}))?$/);
  if (yyyymmddMatch) return yyyymmddMatch[1];

  const numericValue = Number(raw);
  if (!Number.isNaN(numericValue) && /^\d+(\.\d+)?$/.test(raw)) {
    if (numericValue > 20000 && numericValue < 100000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      excelEpoch.setUTCDate(excelEpoch.getUTCDate() + Math.floor(numericValue));
      return excelEpoch.getUTCFullYear().toString();
    }
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getFullYear().toString();
  }

  return null;
}

export function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('đang thực hiện')) return '#f59e0b';
  if (s.includes('nghiệm thu') || s.includes('hoàn thành')) return '#10b981';
  if (s.includes('gia hạn')) return '#8b5cf6';
  if (s.includes('trễ hạn') || s.includes('quá hạn')) return '#ef4444';
  if (s.includes('thanh lý')) return '#14b8a6';
  return '#3b82f6';
}

export type StatusDatum = { name: string; value: number };
export type DepartmentDatum = { name: string; count: number; budget: number };
export type DynamicDatum = { name: string; value: number };
export type DonutDatum = { name: string; value: number };
export type TrendDatum = { period: string; registered: number; completed: number };
export type StackedDatum = { name: string } & Record<string, string | number>;
export type StackedChartModel = { data: StackedDatum[]; series: string[] };

export const DONUT_TYPE_COLORS = ['#1a6ec2', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#64748b'];
export const DONUT_BUDGET_COLORS = ['#1a6ec2', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export function formatBudgetShort(amount: number): string {
  if (!Number.isFinite(amount) || amount === 0) return '0';
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu`;
  }
  return amount.toLocaleString('vi-VN');
}

export function estimateProjectProgress(project: ResearchProject): number {
  const status = String(project.status ?? '').toLowerCase();
  if (status.includes('nghiệm thu') || status.includes('hoàn thành')) return 100;
  if (status.includes('thanh lý')) return 100;
  if (typeof project.workflowStep === 'number' && project.workflowStep > 0) {
    return Math.max(0, Math.min(100, Math.round((project.workflowStep / 8) * 100)));
  }
  if (project.startDate && project.endDate) {
    const start = new Date(String(project.startDate)).getTime();
    const end = new Date(String(project.endDate)).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
      const ratio = (Date.now() - start) / (end - start);
      return Math.max(0, Math.min(100, Math.round(ratio * 100)));
    }
  }
  if (status.includes('đang thực hiện')) return 45;
  if (status.includes('đăng ký')) return 10;
  return 0;
}

export function buildProjectTypeData(filtered: ResearchProject[]): DonutDatum[] {
  const data: Record<string, number> = {};
  filtered.forEach((p) => {
    const tags = parseProjectCategories(p.categories);
    if (tags.length === 0) {
      data['Chưa phân loại'] = (data['Chưa phân loại'] || 0) + 1;
      return;
    }
    tags.forEach((tag) => {
      data[tag] = (data[tag] || 0) + 1;
    });
  });
  return Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildDepartmentBudgetTop5(filtered: ResearchProject[]): DonutDatum[] {
  return buildDepartmentData(filtered)
    .slice(0, 5)
    .map((d) => ({ name: d.name, value: Number(d.budget.toFixed(2)) }));
}

export function buildTrendData(filtered: ResearchProject[]): TrendDatum[] {
  const buckets: Record<string, { registered: number; completed: number }> = {};

  const touch = (period: string) => {
    if (!buckets[period]) buckets[period] = { registered: 0, completed: 0 };
  };

  filtered.forEach((p) => {
    const startYear = p.startDate ? extractYearFromDate(p.startDate) : null;
    if (startYear) {
      touch(startYear);
      buckets[startYear].registered += 1;
    }
    const status = String(p.status ?? '').toLowerCase();
    const completed =
      status.includes('nghiệm thu') || status.includes('hoàn thành');
    if (completed) {
      const year =
        (p.acceptanceAcademicYear?.trim() &&
          (p.acceptanceAcademicYear.match(/\d{4}/)?.[0] ?? null)) ||
        (p.endDate ? extractYearFromDate(p.endDate) : null) ||
        startYear;
      if (year) {
        touch(year);
        buckets[year].completed += 1;
      }
    }
  });

  return Object.entries(buckets)
    .map(([period, stats]) => ({ period, ...stats }))
    .sort((a, b) => Number(a.period) - Number(b.period));
}

export function getChartYears(projects: ResearchProject[]): string[] {
  return Array.from(
    new Set(
      projects
        .map((p) => (p.startDate ? extractYearFromDate(p.startDate) : null))
        .filter((y): y is string => Boolean(y)),
    ),
  ).sort((a, b) => Number(b) - Number(a));
}

/** Calendar year of acceptance (`acceptanceYear` / Năm NT). */
export function extractAcceptanceYear(project: ResearchProject): string | null {
  const raw = project.acceptanceYear?.trim();
  if (!raw) return null;
  return extractYearFromDate(raw);
}

export function getAcceptanceYears(projects: ResearchProject[]): string[] {
  return Array.from(
    new Set(projects.map((p) => extractAcceptanceYear(p)).filter((y): y is string => Boolean(y))),
  ).sort((a, b) => Number(b) - Number(a));
}

export function filterProjectsByYear(
  projects: ResearchProject[],
  year: string,
): ResearchProject[] {
  if (year === 'all') return projects;
  return projects.filter((p) => {
    if (!p.startDate) return false;
    return extractYearFromDate(p.startDate) === year;
  });
}

export function filterProjects(
  projects: ResearchProject[],
  filters: {
    startYear: string;
    academicYear: string;
    acceptanceYear: string;
    status: string;
    researchField: string;
    projectType: string;
    department: string;
    reviewBatch: string;
  },
): ResearchProject[] {
  return projects.filter((p) => {
    let matchYear = true;
    if (filters.startYear !== 'all') {
      if (p.startDate) {
        const year = extractYearFromDate(p.startDate);
        matchYear = year === filters.startYear;
      } else {
        matchYear = false;
      }
    }
    const matchAcademicYear =
      filters.academicYear === 'all' ||
      (p.acceptanceAcademicYear?.trim() ?? '') === filters.academicYear;
    const matchAcceptanceYear =
      filters.acceptanceYear === 'all' || extractAcceptanceYear(p) === filters.acceptanceYear;
    const matchResearchField =
      filters.researchField === 'all' || p.researchField === filters.researchField;
    const matchStatus = filters.status === 'all' || p.status === filters.status;
    const matchDepartment = filters.department === 'all' || p.department === filters.department;
    const matchProjectType =
      filters.projectType === 'all' ||
      parseProjectCategories(p.categories).includes(filters.projectType);
    const matchReviewBatch =
      filters.reviewBatch === 'all' ||
      (p.reviewBatch?.trim() ?? '') === filters.reviewBatch;

    return (
      matchYear &&
      matchAcademicYear &&
      matchAcceptanceYear &&
      matchStatus &&
      matchDepartment &&
      matchResearchField &&
      matchProjectType &&
      matchReviewBatch
    );
  });
}

export function buildStatusData(filtered: ResearchProject[]): StatusDatum[] {
  const data: Record<string, number> = {};
  filtered.forEach((p) => {
    let statusName = (p.status || 'Khác').toString().trim();
    const lower = statusName.toLowerCase();
    if (lower.includes('đang thực hiện')) statusName = 'Đang thực hiện';
    else if (lower.includes('nghiệm thu') || lower.includes('hoàn thành')) statusName = 'Đã nghiệm thu';
    else if (lower.includes('gia hạn')) statusName = 'Gia hạn';
    else if (lower.includes('trễ hạn') || lower.includes('quá hạn')) statusName = 'Trễ hạn';
    else if (lower.includes('thanh lý')) statusName = 'Thanh lý';
    else statusName = statusName.charAt(0).toUpperCase() + statusName.slice(1);

    data[statusName] = (data[statusName] || 0) + 1;
  });
  return Object.entries(data).map(([name, value]) => ({ name, value }));
}

export function buildDepartmentData(filtered: ResearchProject[]): DepartmentDatum[] {
  const data: Record<string, { count: number; budget: number }> = {};
  filtered.forEach((p) => {
    if (!data[p.department]) data[p.department] = { count: 0, budget: 0 };
    data[p.department].count += 1;
    data[p.department].budget += p.budget;
  });
  return Object.entries(data)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      budget: stats.budget / 1_000_000,
    }))
    .sort((a, b) => b.budget - a.budget);
}

export function buildDynamicChartData(
  filtered: ResearchProject[],
  dynXAxis: string,
  dynYAxis: 'count' | 'budget'
): DynamicDatum[] {
  const grouped: Record<string, { count: number; budget: number }> = {};

  const touch = (key: string) => {
    if (!grouped[key]) grouped[key] = { count: 0, budget: 0 };
  };

  filtered.forEach((p) => {
    if (dynXAxis === 'products') {
      let actual = p.actualProducts;
      let prods: unknown[] = [];
      if (typeof actual === 'string') {
        try {
          prods = JSON.parse(actual) as unknown[];
        } catch {
          prods = [];
        }
      } else if (Array.isArray(actual)) {
        prods = actual;
      }

      if (prods.length === 0) {
        const keyVal = 'Chưa có sản phẩm';
        touch(keyVal);
        grouped[keyVal].count += 1;
        grouped[keyVal].budget += (Number(p.budget) || 0) / 1_000_000;
      } else {
        prods.forEach((prod) => {
          if (prod && typeof prod === 'object' && 'type' in prod) {
            const type = String((prod as { type: string }).type);
            const keyVal = type.split(' (')[0];
            touch(keyVal);
            grouped[keyVal].count += Number((prod as { count?: number }).count) || 1;
            grouped[keyVal].budget += (Number(p.budget) || 0) / 1_000_000;
          }
        });
      }
      return;
    }

    let keyVal = (p as Record<string, unknown>)[dynXAxis] as string | undefined;
    if (!keyVal) keyVal = 'Khác';
    if (Array.isArray(keyVal)) keyVal = keyVal.join(', ');

    touch(keyVal);
    grouped[keyVal].count += 1;
    grouped[keyVal].budget += (Number(p.budget) || 0) / 1_000_000;
  });

  return Object.entries(grouped)
    .map(([name, stats]) => ({
      name,
      value: dynYAxis === 'count' ? stats.count : stats.budget,
    }))
    .sort((a, b) => b.value - a.value);
}

function normalizeStatusStackLabel(status: string): string {
  const statusName = (status || 'Khác').toString().trim();
  const lower = statusName.toLowerCase();
  if (lower.includes('đang thực hiện')) return 'Đang thực hiện';
  if (lower.includes('nghiệm thu') || lower.includes('hoàn thành')) return 'Đã nghiệm thu';
  if (lower.includes('gia hạn')) return 'Gia hạn';
  if (lower.includes('trễ hạn') || lower.includes('quá hạn')) return 'Trễ hạn';
  if (lower.includes('thanh lý')) return 'Thanh lý';
  if (lower.includes('đăng ký')) return 'Đăng ký mới';
  return statusName.charAt(0).toUpperCase() + statusName.slice(1);
}

function projectCategoryKeys(project: ResearchProject): string[] {
  const tags = parseProjectCategories(project.categories);
  return tags.length > 0 ? tags : ['Chưa phân loại'];
}

function projectXKeys(project: ResearchProject, dynXAxis: string): string[] {
  if (dynXAxis === 'categories') return projectCategoryKeys(project);
  if (dynXAxis === 'products') {
    let actual = project.actualProducts;
    let prods: unknown[] = [];
    if (typeof actual === 'string') {
      try {
        prods = JSON.parse(actual) as unknown[];
      } catch {
        prods = [];
      }
    } else if (Array.isArray(actual)) {
      prods = actual;
    }
    if (prods.length === 0) return ['Chưa có sản phẩm'];
    return prods
      .map((prod) => {
        if (prod && typeof prod === 'object' && 'type' in prod) {
          return String((prod as { type: string }).type).split(' (')[0];
        }
        return '';
      })
      .filter(Boolean);
  }
  const raw = (project as Record<string, unknown>)[dynXAxis];
  if (raw == null || raw === '') return ['Khác'];
  if (Array.isArray(raw)) return raw.length ? raw.map(String) : ['Khác'];
  return [String(raw)];
}

function projectStackKeys(project: ResearchProject, stackBy: 'status' | 'categories'): string[] {
  if (stackBy === 'categories') return projectCategoryKeys(project);
  return [normalizeStatusStackLabel(String(project.status ?? ''))];
}

export function buildStackedChartData(
  filtered: ResearchProject[],
  dynXAxis: string,
  dynYAxis: 'count' | 'budget',
  stackBy: 'status' | 'categories',
): StackedChartModel {
  const seriesSet = new Set<string>();
  const grouped: Record<string, Record<string, number>> = {};

  filtered.forEach((project) => {
    const xKeys = projectXKeys(project, dynXAxis);
    const stackKeys = projectStackKeys(project, stackBy);
    const amount = dynYAxis === 'count' ? 1 : (Number(project.budget) || 0) / 1_000_000;
    xKeys.forEach((xKey) => {
      if (!grouped[xKey]) grouped[xKey] = {};
      stackKeys.forEach((series) => {
        seriesSet.add(series);
        grouped[xKey][series] = (grouped[xKey][series] || 0) + amount;
      });
    });
  });

  const series = [...seriesSet];
  const data: StackedDatum[] = Object.entries(grouped)
    .map(([name, stacks]) => {
      const row: StackedDatum = { name };
      series.forEach((key) => {
        row[key] = stacks[key] || 0;
      });
      return row;
    })
    .sort((a, b) => {
      const sum = (row: StackedDatum) =>
        series.reduce((acc, key) => acc + Number(row[key] || 0), 0);
      return sum(b) - sum(a);
    });

  return { data, series };
}

export type StatCardModel = {
  label: string;
  value: string | number;
  color: string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
};

function umpBudgetOf(project: ResearchProject): number {
  const lump = Number(project.budgetLumpSum) || 0;
  const nonLump = Number(project.budgetNonLumpSum) || 0;
  if (lump > 0 || nonLump > 0) return lump + nonLump;

  const total = Number(project.budget) || 0;
  const other = Number(project.budgetOtherSources) || 0;
  return Math.max(0, total - other);
}

function otherBudgetOf(project: ResearchProject): number {
  const explicit = Number(project.budgetOtherSources) || 0;
  if (explicit > 0) return explicit;
  const total = Number(project.budget) || 0;
  return Math.max(0, total - umpBudgetOf(project));
}

export function buildStats(filtered: ResearchProject[]): StatCardModel[] {
  const totalBudget = filtered.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0);
  const umpBudget = filtered.reduce((acc, curr) => acc + umpBudgetOf(curr), 0);
  const otherBudget = filtered.reduce((acc, curr) => acc + otherBudgetOf(curr), 0);

  const newRegistrationCount = filtered.filter((p) => {
    const s = String(p.status).toLowerCase();
    return p.status === ProjectStatus.NEW_REGISTRATION || s.includes('đăng ký mới');
  }).length;

  const ongoingCount = filtered.filter((p) => {
    const s = String(p.status).toLowerCase();
    return p.status === ProjectStatus.ONGOING || s.includes('đang thực hiện');
  }).length;

  const acceptanceCount = filtered.filter((p) => {
    const s = String(p.status).toLowerCase();
    return (
      p.status === ProjectStatus.ACCEPTANCE ||
      p.status === ProjectStatus.COMPLETED ||
      s.includes('nghiệm thu') ||
      s.includes('hoàn thành')
    );
  }).length;

  const overdueCount = filtered.filter((p) => {
    if (p.status === ProjectStatus.OVERDUE) return true;
    const s = String(p.status).toLowerCase();
    if (s.includes('trễ hạn') || s.includes('quá hạn')) return true;
    const isPastEnd = p.endDate ? new Date(String(p.endDate)) < new Date() : false;
    const isNotFinished =
      p.status !== ProjectStatus.COMPLETED &&
      p.status !== ProjectStatus.LIQUIDATED &&
      !s.includes('nghiệm thu') &&
      !s.includes('hoàn thành') &&
      !s.includes('thanh lý');
    return isPastEnd && isNotFinished;
  }).length;

  const extendedCount = filtered.filter((p) => {
    const progress = String(p.progressStatus ?? '').toLowerCase();
    const status = String(p.status ?? '').toLowerCase();
    return (
      progress.includes('gia hạn') ||
      status.includes('gia hạn') ||
      p.progressStatus === ProgressStatus.EXTENDED
    );
  }).length;

  return [
    {
      label: 'Tổng số đề tài',
      value: filtered.length,
      color: 'bg-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-[#1a6ec2]',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      label: 'Tổng kinh phí thực hiện',
      value: `${formatBudgetShort(totalBudget)} VNĐ`,
      color: 'bg-indigo-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Tổng kinh phí nguồn ĐHYD',
      value: `${formatBudgetShort(umpBudget)} VNĐ`,
      color: 'bg-cyan-600',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-700',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      label: 'Tổng kinh phí từ Nguồn khác',
      value: `${formatBudgetShort(otherBudget)} VNĐ`,
      color: 'bg-teal-600',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-700',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
    {
      label: 'Đề tài đăng ký mới',
      value: newRegistrationCount,
      color: 'bg-sky-500',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      icon: 'M12 4v16m8-8H4',
    },
    {
      label: 'Đề tài đang thực hiện',
      value: ongoingCount,
      color: 'bg-amber-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Đề tài nghiệm thu',
      value: acceptanceCount,
      color: 'bg-emerald-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Đề tài trễ hạn',
      value: overdueCount,
      color: 'bg-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    {
      label: 'Đề tài gia hạn',
      value: extendedCount,
      color: 'bg-violet-500',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    },
  ];
}

export const DYN_X_OPTIONS = [
  { value: 'department', label: 'Đơn vị' },
  { value: 'status', label: 'Trạng thái' },
  { value: 'researchField', label: 'Lĩnh vực Nghiên cứu' },
  { value: 'researchType', label: 'Loại hình Nghiên cứu' },
  { value: 'progressStatus', label: 'Tiến độ' },
  { value: 'categories', label: 'Loại đề tài' },
  { value: 'products', label: 'Sản phẩm Đề tài' },
] as const;

export const DYN_Y_OPTIONS = [
  { value: 'count' as const, label: 'Số lượng đề tài' },
  { value: 'budget' as const, label: 'Kinh phí (Triệu VNĐ)' },
];

export const DYN_STACK_OPTIONS = [
  { value: 'status' as const, label: 'Trạng thái' },
  { value: 'categories' as const, label: 'Loại đề tài' },
];

export const BAR_COLOR_ROTATION = [
  '#9333ea',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#06b6d4',
  '#f97316',
];
