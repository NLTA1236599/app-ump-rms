import { useNavigate } from 'react-router-dom';

import { BeakerIcon, PlusIcon } from '../icons.js';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BeakerIcon className="mb-4 h-16 w-16 text-slate-200" />
      <p className="text-base font-semibold text-slate-600">Chưa có đề tài nào</p>
      <p className="mt-1 text-sm text-slate-400">Hãy đăng ký đề tài đầu tiên của bạn.</p>
      <button
        type="button"
        onClick={() => navigate('/de-tai/dang-ky')}
        className="mt-6 flex items-center gap-2 rounded-xl bg-[#1a6ec2] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700"
      >
        <PlusIcon className="h-4 w-4" />
        Đăng ký đề tài mới
      </button>
    </div>
  );
}
