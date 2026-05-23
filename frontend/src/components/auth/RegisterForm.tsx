import { useId, useMemo, useState, type FormEvent } from 'react';
import { validateInstitutionalEmail } from './institutionalEmail.js';
import { REGISTER_ACADEMIC_OPTIONS } from './registerAcademicOptions.js';
import { REGISTER_WORK_UNIT_OPTIONS } from './registerWorkUnitOptions.js';
import { resolveRegisterApiRole, type RegisterRoleId } from './registerRoles.js';
import { RegisterSectionGroup } from './RegisterSectionGroup.js';
import { RegisterFieldLabel } from './RegisterFieldLabel.js';
import { RegisterFormInput, RegisterFormSelect } from './registerFormInputs.js';
import { RegisterRoleToggleGroup } from './RegisterRoleToggleGroup.js';
import { RegisterFormSectionHeader } from './RegisterFormSectionHeader.js';
import { RegisterLoginRedirectLink } from './RegisterLoginRedirectLink.js';
import { useRegisterFlow } from './useRegisterFlow.js';

type RegisterFormProps = {
  onSwitchToLogin: () => void;
};

const DEFAULT_ROLES = new Set<RegisterRoleId>(['applicant']);

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const formId = useId();
  const errEmail = `${formId}-err-email`;
  const errPwd = `${formId}-err-pwd`;
  const errPwd2 = `${formId}-err-pwd2`;

  const { phase, banner, submit, clearBanner } = useRegisterFlow();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [fullName, setFullName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [phone, setPhone] = useState('');
  const [academic, setAcademic] = useState('');
  const [workUnit, setWorkUnit] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [roles, setRoles] = useState<ReadonlySet<RegisterRoleId>>(DEFAULT_ROLES);

  const emailOk = validateInstitutionalEmail(email);
  const pwdLenOk = password.length >= 8;
  const pwdMatch = password === password2 && password2.length > 0;
  const nameOk = fullName.trim().length > 0;
  const rolesOk = roles.size >= 1;

  const emailInvalid = email.length > 0 && !emailOk.ok;
  const pwdInvalid = password.length > 0 && !pwdLenOk;
  const pwd2Invalid = password2.length > 0 && !pwdMatch;

  const canSubmit = useMemo(() => {
    const ev = validateInstitutionalEmail(email);
    return (
      ev.ok &&
      password.length >= 8 &&
      password === password2 &&
      password2.length > 0 &&
      fullName.trim().length > 0 &&
      roles.size >= 1 &&
      phase !== 'submitting'
    );
  }, [email, password, password2, fullName, roles, phase]);

  const onSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    clearBanner();

    if (!emailOk.ok) return;
    if (!pwdLenOk || !pwdMatch || !nameOk || !rolesOk) return;

    await submit({
      email: emailOk.normalized,
      password,
      displayName: fullName.trim(),
      apiRole: resolveRegisterApiRole(roles),
    });
  };

  const busy = phase === 'submitting';

  return (
    <form className="flex flex-col outline-none" onSubmit={onSubmitForm} noValidate>
      <RegisterFormSectionHeader />

      {banner?.kind === 'error' ? (
        <div
          role="alert"
          className="mb-4 rounded-[10px] border border-red-200/90 bg-red-50/95 px-3 py-2.5 text-center text-[13px] text-red-800"
        >
          {banner.message}
        </div>
      ) : null}
      {banner?.kind === 'success' ? (
        <div
          role="status"
          className="mb-4 rounded-[10px] border border-emerald-200/90 bg-emerald-50/95 px-3 py-2.5 text-center text-[13px] text-emerald-900"
        >
          {banner.message}
        </div>
      ) : null}

      <RegisterSectionGroup icon="✉" title="Thông tin tài khoản" sub="Email + mật khẩu để đăng nhập">
        <div>
          <RegisterFieldLabel htmlFor="reg-email" required>
            Email trường
          </RegisterFieldLabel>
          <RegisterFormInput
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="ten.ho@ump.edu.vn"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearBanner();
            }}
            invalid={emailInvalid}
            aria-invalid={emailInvalid}
            aria-describedby={emailInvalid ? errEmail : undefined}
            aria-required
            required
          />
          <p className="mt-1 text-[12px] text-[#9ca3af]">Chấp nhận: @ump.edu.vn, @umc.edu.vn</p>
          {emailInvalid && !emailOk.ok ? (
            <p id={errEmail} className="mt-1 text-[12px] text-[#ef4444]">
              {emailOk.message}
            </p>
          ) : null}
        </div>
        <div>
          <RegisterFieldLabel htmlFor="reg-password" required>
            Mật khẩu
          </RegisterFieldLabel>
          <RegisterFormInput
            id="reg-password"
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearBanner();
            }}
            invalid={pwdInvalid}
            aria-invalid={pwdInvalid}
            aria-describedby={pwdInvalid ? errPwd : undefined}
            aria-required
            required
            minLength={8}
          />
          {pwdInvalid ? (
            <p id={errPwd} className="mt-1 text-[12px] text-[#ef4444]">
              Mật khẩu cần tối thiểu 8 ký tự.
            </p>
          ) : null}
        </div>
        <div>
          <RegisterFieldLabel htmlFor="reg-password2" required>
            Nhập lại mật khẩu
          </RegisterFieldLabel>
          <RegisterFormInput
            id="reg-password2"
            type="password"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            value={password2}
            onChange={(e) => {
              setPassword2(e.target.value);
              clearBanner();
            }}
            invalid={pwd2Invalid}
            aria-invalid={pwd2Invalid}
            aria-describedby={pwd2Invalid ? errPwd2 : undefined}
            aria-required
            required
          />
          {pwd2Invalid ? (
            <p id={errPwd2} className="mt-1 text-[12px] text-[#ef4444]">
              Mật khẩu nhập lại không khớp.
            </p>
          ) : null}
        </div>
      </RegisterSectionGroup>

      <RegisterSectionGroup icon="👤" title="Thông tin cá nhân" sub="Họ tên + nhận dạng nhân sự">
        <div>
          <RegisterFieldLabel htmlFor="reg-name" required>
            Họ và tên
          </RegisterFieldLabel>
          <RegisterFormInput
            id="reg-name"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-required
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 min-[480px]:gap-4">
          <div>
            <RegisterFieldLabel htmlFor="reg-staff">Mã số nhân sự</RegisterFieldLabel>
            <RegisterFormInput
              id="reg-staff"
              type="text"
              placeholder="vd NS001"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
            />
          </div>
          <div>
            <RegisterFieldLabel htmlFor="reg-phone">Số điện thoại</RegisterFieldLabel>
            <RegisterFormInput
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div>
          <RegisterFieldLabel htmlFor="reg-academic">Học hàm, học vị cao nhất</RegisterFieldLabel>
          <RegisterFormSelect
            id="reg-academic"
            value={academic}
            onChange={(e) => setAcademic(e.target.value)}
          >
            {REGISTER_ACADEMIC_OPTIONS.map((o) => (
              <option key={o.value || 'none'} value={o.value}>
                {o.label}
              </option>
            ))}
          </RegisterFormSelect>
        </div>
      </RegisterSectionGroup>

      <RegisterSectionGroup icon="🏢" title="Thông tin công tác" sub="Đơn vị + chức vụ hiện tại">
        <div>
          <RegisterFieldLabel htmlFor="reg-unit">Đơn vị công tác</RegisterFieldLabel>
          <RegisterFormSelect id="reg-unit" value={workUnit} onChange={(e) => setWorkUnit(e.target.value)}>
            {REGISTER_WORK_UNIT_OPTIONS.map((o) => (
              <option key={o.value || 'none'} value={o.value}>
                {o.label}
              </option>
            ))}
          </RegisterFormSelect>
        </div>
        <div>
          <RegisterFieldLabel htmlFor="reg-job">Chức vụ</RegisterFieldLabel>
          <RegisterFormInput
            id="reg-job"
            type="text"
            placeholder="vd Trưởng khoa, Giảng viên, Bác sĩ..."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
      </RegisterSectionGroup>

      <RegisterSectionGroup icon="👤🔑" title="Vai trò" sub="Chọn ít nhất 1 vai trò">
        <RegisterRoleToggleGroup selected={roles} onChange={setRoles} />
      </RegisterSectionGroup>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-6 h-[52px] w-full rounded-[11px] bg-[#1a1a1a] text-[15px] font-semibold text-white outline-none transition-[background,opacity] enabled:hover:bg-[#2d2d2d] enabled:focus-visible:ring-2 enabled:focus-visible:ring-[#1a1a1a] enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {busy ? 'Đang gửi…' : 'Đăng ký tài khoản'}
      </button>

      <RegisterLoginRedirectLink onSwitchToLogin={onSwitchToLogin} />
    </form>
  );
}
