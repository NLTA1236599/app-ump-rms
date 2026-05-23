/** Tooltip format helpers — recharts passes loose `ValueType` at the type level. */
export function formatTooltipBudgetTriệu(value: unknown): [string, string] {
  const v = typeof value === 'number' ? value : Number(value);
  const n = Number.isFinite(v) ? v : 0;
  return [
    `${new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} triệu VNĐ`,
    'Kinh phí',
  ];
}

export function formatTooltipDynamic(value: unknown, dynYAxis: 'count' | 'budget', yLabel: string): [string | number, string] {
  const v = typeof value === 'number' ? value : Number(value);
  const n = Number.isFinite(v) ? v : 0;
  if (dynYAxis === 'budget') {
    return [`${new Intl.NumberFormat('vi-VN').format(n)} triệu VNĐ`, yLabel];
  }
  return [n, yLabel];
}
