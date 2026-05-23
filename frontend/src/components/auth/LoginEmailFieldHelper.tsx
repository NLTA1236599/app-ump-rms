type LoginEmailFieldHelperProps = {
  id: string;
};

/** Helper under email field — analysis §8.3 (`aria-describedby` target). */
export function LoginEmailFieldHelper({ id }: LoginEmailFieldHelperProps) {
  return (
    <p id={id} className="mt-1.5 text-[12px] leading-relaxed text-[#6b7280]">
      Chỉ email Đại học Y Dược:{' '}
      <span className="font-medium text-[#1a6ec2]">@ump.edu.vn</span> hoặc{' '}
      <span className="font-medium text-[#1a6ec2]">@umc.edu.vn</span>.
    </p>
  );
}
