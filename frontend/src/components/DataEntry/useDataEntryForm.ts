import { useCallback, useMemo, useState } from 'react';

import type { ResearchProject } from '../DataTable/types.js';

import { cloneFormData } from './cloneFormData.js';
import { mapFormToTableProject } from './mapFormToTableProject.js';
import { mapTableToFormData } from './mapTableToFormData.js';
import { isCompleteProjectCode } from './projectCodeFormat.js';
import { scrollToFirstFormError } from './scrollToFormError.js';
import type { DataEntryFormData, FormErrors } from './types.js';

export type SaveResult =
  | { ok: true; project: ResearchProject }
  | { ok: false; message: string };

function validate(form: DataEntryFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.contractNumber.trim()) errors.contractNumber = 'Vui lòng nhập số hợp đồng';
  if (!form.title.trim()) errors.title = 'Vui lòng nhập tên đề tài';
  const primaryLeader =
    form.leaders.find((l) => l.fullName.trim()) ?? form.leaders[0];
  if (!primaryLeader?.fullName.trim() && !form.principalInvestigator.trim()) {
    errors.leaders = 'Vui lòng nhập chủ nhiệm đề tài';
    errors.principalInvestigator = 'Vui lòng nhập chủ nhiệm đề tài';
  }
  form.leaders.forEach((leader, index) => {
    if (index === 0 || !leader.fullName.trim()) return;
    if (leader.addReason !== 'co_leader' && leader.addReason !== 'replacement') {
      errors.leaders = 'Vui lòng chọn lý do thêm chủ nhiệm (Đồng chủ nhiệm hoặc Thay đổi chủ nhiệm)';
    }
  });
  if (!form.categoryTags.length) errors.categoryTags = 'Vui lòng chọn ít nhất 1 loại đề tài';
  if (!form.facultyUnits.length) errors.facultyUnits = 'Vui lòng chọn khoa/đơn vị';

  const code = form.projectCode.trim();
  if (code && !isCompleteProjectCode(code)) {
    errors.projectCode = 'Mã đề tài phải đúng định dạng aaaa.bb.cc.ddd';
  }

  return errors;
}

type UseDataEntryFormOptions = {
  mode?: 'create' | 'edit';
  initialProject?: ResearchProject;
  onSaved?: (project: ResearchProject) => void;
  onCancelRequest?: () => void;
};

export function useDataEntryForm({
  mode = 'create',
  initialProject,
  onSaved,
  onCancelRequest,
}: UseDataEntryFormOptions = {}) {
  const initialForm = useMemo(
    () => (initialProject ? mapTableToFormData(initialProject) : cloneFormData()),
    [initialProject],
  );
  const [form, setForm] = useState<DataEntryFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  const setField = useCallback(<K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setCategoryTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      categoryTags: tag ? [tag] : [],
      categoryOther: tag === 'Khác' ? prev.categoryOther : '',
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.categoryTags;
      return next;
    });
  }, []);

  const setResearchField = useCallback((field: string) => {
    setForm((prev) => ({ ...prev, researchFields: field ? [field] : [] }));
  }, []);

  const setFacultyUnit = useCallback((unit: string) => {
    setForm((prev) => ({ ...prev, facultyUnits: unit ? [unit] : [] }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.facultyUnits;
      return next;
    });
  }, []);

  const setProductCount = useCallback(
    (productId: string, kind: 'committed' | 'actual', value: string) => {
      setForm((prev) => ({
        ...prev,
        products: prev.products.map((row) =>
          row.id === productId ? { ...row, [kind]: value } : row,
        ),
      }));
    },
    [],
  );

  const setProgressReportDate = useCallback((index: number, iso: string) => {
    setForm((prev) => {
      const next = [...prev.progressReportDates] as [string, string, string, string];
      next[index] = iso;
      return { ...prev, progressReportDates: next };
    });
  }, []);

  const submit = useCallback(async (): Promise<SaveResult> => {
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      scrollToFirstFormError(next);
      const message = Object.values(next)[0] ?? 'Vui lòng kiểm tra lại các trường bắt buộc.';
      return { ok: false, message };
    }

    setIsSaving(true);
    try {
      const project = mapFormToTableProject(form, initialProject);
      await new Promise((r) => setTimeout(r, 400));
      onSaved?.(project);

      if (mode === 'create') {
        setForm(cloneFormData());
        setErrors({});
      }

      return { ok: true, project };
    } finally {
      setIsSaving(false);
    }
  }, [form, initialProject, mode, onSaved]);

  const cancel = useCallback(() => {
    if (isDirty) {
      const ok = window.confirm('Bỏ thay đổi chưa lưu?');
      if (!ok) return;
    }

    if (mode === 'edit') {
      onCancelRequest?.();
      return;
    }

    setForm(cloneFormData());
    setErrors({});
  }, [isDirty, mode, onCancelRequest]);

  return {
    form,
    errors,
    isDirty,
    isSaving,
    mode,
    setField,
    setCategoryTag,
    setResearchField,
    setFacultyUnit,
    setProductCount,
    setProgressReportDate,
    submit,
    cancel,
  };
}
