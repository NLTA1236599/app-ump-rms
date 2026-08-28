type Props = {
  roleName: string;
  description?: string;
};

export function RoleColumnHeader({ roleName, description }: Props) {
  return (
    <div className="flex cursor-default flex-col items-center gap-1 px-1" title={description ?? roleName}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 ring-2 ring-slate-200">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 12 2.25c2.43 0 4.722.73 6.613 1.987C19.485 5.32 20.25 6.97 20.25 8.77v3.485a11.95 11.95 0 0 1-5.445 10.05L12 21.75l-2.805-.445A11.95 11.95 0 0 1 3.75 12.255V8.77c0-1.8.765-3.45 1.637-4.533A11.96 11.96 0 0 1 12 2.714Z"
          />
        </svg>
      </div>
      <span className="max-w-[52px] text-center text-[10px] font-bold leading-tight text-slate-600">
        {roleName}
      </span>
    </div>
  );
}
