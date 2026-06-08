import { PROJECT_TYPE_TAGS } from '../DataEntry/constants.js';

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

export function getChartYears(projects: ResearchProject[]): string[] {
  return Array.from(
    new Set(
      projects
        .map((p) => (p.startDate ? extractYearFromDate(p.startDate) : null))
        .filter((y): y is string => Boolean(y)),
    ),
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
    status: string;
    researchField: string;
    projectType: string;
    department: string;
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
    const matchResearchField =
      filters.researchField === 'all' || p.researchField === filters.researchField;
    const matchStatus = filters.status === 'all' || p.status === filters.status;
    const matchDepartment = filters.department === 'all' || p.department === filters.department;
    const matchProjectType =
      filters.projectType === 'all' ||
      parseProjectCategories(p.categories).includes(filters.projectType);

    return matchYear && matchStatus && matchDepartment && matchResearchField && matchProjectType;
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

export type StatCardModel = {
  label: string;
  value: string | number;
  color: string;
  icon: string;
};

export function buildStats(filtered: ResearchProject[]): StatCardModel[] {
  const totalBudget = filtered.reduce((acc, curr) => acc + curr.budget, 0);
  const ongoingCount = filtered.filter((p) => p.status === ProjectStatus.ONGOING).length;
  const completedCount = filtered.filter((p) => p.status === ProjectStatus.COMPLETED).length;
  const extendedCount = filtered.filter(
    (p) => p.progressStatus === ProgressStatus.EXTENDED || p.progressStatus === 'Gia hạn'
  ).length;
  const overdueCount = filtered.filter((p) => {
    if (p.status === ProjectStatus.OVERDUE) return true;
    const isPastEnd = p.endDate ? new Date(p.endDate) < new Date() : false;
    const isNotFinished =
      p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.LIQUIDATED;
    return isPastEnd && isNotFinished;
  }).length;

  return [
    {
      label: 'Tổng số đề tài',
      value: filtered.length,
      color: 'bg-blue-600',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      label: 'Ngân sách tổng (VNĐ)',
      value: totalBudget.toLocaleString('vi-VN'),
      color: 'bg-indigo-600',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Đang thực hiện',
      value: ongoingCount,
      color: 'bg-amber-500',
      icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Đã nghiệm thu',
      value: completedCount,
      color: 'bg-emerald-500',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Gia hạn',
      value: extendedCount,
      color: 'bg-purple-500',
      icon: 'M13 5l7 7-7 7M5 5l7 7-7 7',
    },
    {
      label: 'Trễ hạn',
      value: overdueCount,
      color: 'bg-red-500',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
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
