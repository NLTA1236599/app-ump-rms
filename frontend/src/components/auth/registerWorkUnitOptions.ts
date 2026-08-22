import { FACULTY_UNIT_OPTIONS } from '../DataEntry/constants.js';

/** Same Khoa / Đơn vị list as the Data Entry tab. */
export const REGISTER_WORK_UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Chọn đơn vị công tác...' },
  ...FACULTY_UNIT_OPTIONS.map((unit) => ({ value: unit, label: unit })),
];
