import { useCallback, useMemo, useState } from 'react';
import { defaultFormData } from './defaultFormData.js';
import type { DataEntryFormData, FormErrors } from './types.js';

function validate(form: DataEntryFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.contractNumber.trim()) errors.contractNumber = 'Vui lòng nhập số hợp đồng';
  if (!form.title.trim()) errors.title = 'Vui lòng nhập tên đề tài';
  if (!form.principalInvestigator.trim())
    errors.principalInvestigator = 'Vui lòng nhập chủ nhiệm đề tài';
  if (!form.categoryTags.length) errors.categoryTags = 'Vui lòng chọn ít nhất 1 loại đề tài';
  if (!form.faculty.trim()) errors.faculty = 'Vui lòng nhập khoa/đơn vị';

  return errors;
}

export function useDataEntryForm() {
  const [form, setForm] = useState<DataEntryFormData>(() => ({ ...defaultFormData }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(defaultFormData);
  }, [form]);

  const setField = useCallback(<K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const toggleCategoryTag = useCallback((tag: string) => {
    setForm((prev) => {
      const has = prev.categoryTags.includes(tag);
      const categoryTags = has
        ? prev.categoryTags.filter((t) => t !== tag)
        : [...prev.categoryTags, tag];
      return { ...prev, categoryTags };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.categoryTags;
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
      const next = [...prev.progressReportDates] as [
        string,
        string,
        string,
        string,
      ];
      next[index] = iso;
      return { ...prev, progressReportDates: next };
    });
  }, []);

  const submit = useCallback(async () => {
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return false;

    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
      setForm({ ...defaultFormData });
      setErrors({});
      return true;
    } finally {
      setIsSaving(false);
    }
  }, [form]);

  const cancel = useCallback(() => {
    if (isDirty) {
      const ok = window.confirm('Bỏ thay đổi chưa lưu?');
      if (!ok) return;
    }
    setForm({ ...defaultFormData });
    setErrors({});
  }, [isDirty]);

  return {
    form,
    errors,
    isDirty,
    isSaving,
    setField,
    toggleCategoryTag,
    setProductCount,
    setProgressReportDate,
    submit,
    cancel,
  };
}
