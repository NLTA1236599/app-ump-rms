import { parseNumberField } from './dateHelpers.js';

type BudgetMismatchWarningProps = {
  totalBudget: string;
  contractedBudget: string;
  nonContractedBudget: string;
  otherFunding: string;
};

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(n));
}

/** spec §8.6 */
export function BudgetMismatchWarning({
  totalBudget,
  contractedBudget,
  nonContractedBudget,
  otherFunding,
}: BudgetMismatchWarningProps) {
  const total = parseNumberField(totalBudget);
  const sum =
    parseNumberField(contractedBudget) +
    parseNumberField(nonContractedBudget) +
    parseNumberField(otherFunding);
  const hasMismatch = total > 0 && sum !== total;

  if (!hasMismatch) return null;

  return (
    <p className="mt-2 text-[10px] text-amber-600">
      ⚠ Tổng các phần ({formatVnd(sum)} ₫) không khớp với Tổng kinh phí ({formatVnd(total)} ₫)
    </p>
  );
}
