export function Toast({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex max-w-sm">
      <div className="pointer-events-auto flex items-start gap-3 rounded-md bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
        <span className="flex-1">{message}</span>
        <button type="button" className="text-slate-300 hover:text-white" onClick={onDismiss}>
          ×
        </button>
      </div>
    </div>
  );
}
