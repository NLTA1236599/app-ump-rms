import { openExternalUrl } from './openExternalUrl.js';
import type { ServiceItem } from './serviceData.js';

type Props = {
  item: ServiceItem;
  onContractBuilder: () => void;
};

/**
 * spec §8 — double-click is intentional; tooltip for discoverability.
 * ⚠️ Do not switch to onClick — business requirement.
 */
export function ThucHienButton({ item, onContractBuilder }: Props) {
  const handle = () => {
    if (item.type === 'external') {
      openExternalUrl(item.url);
      return;
    }
    if (item.type === 'internal' && item.action === 'contract_builder') {
      onContractBuilder();
    }
  };

  return (
    <div className="group/btn relative inline-block">
      <button
        type="button"
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handle();
        }}
        className="cursor-pointer select-none rounded-xl bg-blue-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-blue-600 transition-all duration-150 hover:bg-blue-600 hover:text-white"
      >
        THỰC HIỆN
      </button>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
        Nháy đúp để thực hiện
      </div>
    </div>
  );
}
