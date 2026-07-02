import { Fragment, useCallback, useState } from 'react';

import { ContractTemplatePlaceholderModal } from './ContractTemplatePlaceholderModal.js';
import { openExternalUrl } from './openExternalUrl.js';
import { SERVICE_SECTIONS } from './serviceData.js';
import type { ServiceItem } from './serviceData.js';
import { ThucHienButton } from './ThucHienButton.js';

function runItemAction(item: ServiceItem, openContract: () => void): void {
  if (item.type === 'external') {
    openExternalUrl(item.url);
    return;
  }
  if (item.type === 'internal' && item.action === 'contract_builder') {
    openContract();
  }
}

/** Các biểu mẫu — matches Kê khai hồ sơ table UI (WorkflowProcess-final-spec.md). */
export function FormTemplatesPage() {
  const [contractOpen, setContractOpen] = useState(false);

  const openContract = useCallback(() => setContractOpen(true), []);
  const closeContract = useCallback(() => setContractOpen(false), []);

  return (
    <div className="animate-fadeIn pb-20">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-2 py-6 shadow-sm sm:px-8">
        {/* tracking-tighter is INTENTIONAL — deliberate contrast with tracking-widest subtitle (spec §3) */}
        <header className="mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
            DANH MỤC CÁC THỦ TỤC HÀNH CHÍNH
          </h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            CHI TIẾT CÁC BIỂU MẪU VÀ THỦ TỤC TƯƠNG ỨNG
          </p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="w-16 border-r border-white/10 px-6 py-4 text-center text-xs font-black uppercase tracking-widest">
                  STT
                </th>
                <th className="border-r border-white/10 px-6 py-4 text-left text-xs font-black uppercase tracking-widest">
                  DANH MỤC
                </th>
                <th className="w-44 px-6 py-4 text-center text-xs font-black uppercase tracking-widest">
                  CHI TIẾT
                </th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_SECTIONS.map((section) => (
                <Fragment key={section.id}>
                  <tr>
                    <td
                      colSpan={3}
                      className="border-b border-blue-100 bg-blue-50/80 px-6 py-3 text-center text-[15px] font-black uppercase tracking-wider text-blue-800"
                    >
                      {section.title}
                    </td>
                  </tr>
                  {section.items.map((item) => (
                    <tr
                      key={`${section.id}-${item.stt}`}
                      tabIndex={0}
                      className="border-b border-slate-100 transition-colors duration-150 odd:bg-white even:bg-slate-50/60 hover:bg-slate-50 focus:bg-blue-50 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          runItemAction(item, openContract);
                        }
                      }}
                    >
                      <td className="border-r border-slate-100 px-6 py-4 text-center text-base font-black text-slate-400">
                        {item.stt}
                      </td>
                      <td className="border-r border-slate-100 px-6 py-4 text-left text-[15px] font-bold text-slate-800">
                        {item.name}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ThucHienButton item={item} onContractBuilder={openContract} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ContractTemplatePlaceholderModal open={contractOpen} onClose={closeContract} />
    </div>
  );
}
