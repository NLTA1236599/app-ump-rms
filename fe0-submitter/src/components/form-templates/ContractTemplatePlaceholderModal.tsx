type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Gate for “Hợp đồng đề tài” — WorkflowProcess-final-spec.md §11.
 * Full `ContractTemplateBuilder` is not in this repo yet; modal chrome matches spec.
 */
export function ContractTemplatePlaceholderModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="contract-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[40px] bg-white shadow-2xl animate-slideUp">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
          <h2 id="contract-modal-title" className="text-lg font-bold text-slate-800">
            Hợp đồng đề tài
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>
        <div className="px-8 py-10 text-sm leading-relaxed text-slate-600">
          Trình soạn thảo mẫu hợp đồng sẽ được tích hợp tại đây (theo{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">ContractTemplateBuilder</code>
          ). Hiện chỉ hiển thị khung modal để xác nhận luồng nháy đúp từ bảng thủ tục.
        </div>
      </div>
    </div>
  );
}
