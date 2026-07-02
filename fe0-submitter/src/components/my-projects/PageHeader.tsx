import { useNavigate } from 'react-router-dom';

import { BeakerIcon, PlusIcon } from '../icons.js';

export function PageHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <BeakerIcon className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-blue-700">Đề tài của tôi</h1>
        </div>
        <p className="ml-10 mt-1 text-sm text-slate-500">
          Đăng ký thuyết minh và quản lý tiến độ đề tài nghiên cứu.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate('/de-tai/dang-ky')}
        className="flex items-center gap-2 rounded-xl bg-[#1a6ec2] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-colors duration-150 hover:bg-blue-700"
      >
        <PlusIcon className="h-4 w-4" />
        Đăng ký đề tài mới
      </button>
    </div>
  );
}
