import { useCallback, useMemo, useRef, useState } from 'react';

import type { ResearchProject } from '../DataTable/types.js';

import { cloneFormData } from './cloneFormData.js';
import { mapFormToTableProject } from './mapFormToTableProject.js';
import { mapTableToFormData } from './mapTableToFormData.js';
import { extractReviewYear } from './reviewYear.js';
import { defaultAppendixYear, getFormAppendices } from './contractNumberFormat.js';
import { scrollToFirstFormError } from './scrollToFormError.js';
import type { DataEntryFormData, FormErrors } from './types.js';
import { allowsCoPrincipal, type ProjectStatus } from './constants.js';

export type SaveResult =
  | { ok: true; project: ResearchProject }
  | { ok: false; message: string };

function validate(form: DataEntryFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.title.trim()) errors.title = 'Vui lòng nhập tên đề tài';

  const primaryLeader =
    form.leaders.find((l) => l.fullName.trim()) ?? form.leaders[0];
  if (!primaryLeader?.fullName.trim() && !form.principalInvestigator.trim()) {
    errors.leaders = 'Vui lòng nhập chủ nhiệm đề tài';
    errors.principalInvestigator = 'Vui lòng nhập chủ nhiệm đề tài';
  }
  form.leaders.forEach((leader, index) => {
    if (index === 0 || !leader.fullName.trim()) return;
    if (leader.addReason === 'co_leader' && !allowsCoPrincipal(form.categoryTags)) {
      errors.leaders = 'Chỉ đề tài Tự túc kinh phí mới được thêm Đồng chủ nhiệm';
      return;
    }
    if (leader.addReason !== 'co_leader' && leader.addReason !== 'replacement') {
      errors.leaders = 'Vui lòng chọn lý do thêm chủ nhiệm (Đồng chủ nhiệm hoặc Thay đổi chủ nhiệm)';
    }
  });
  if (!form.categoryTags.length) errors.categoryTags = 'Vui lòng chọn ít nhất 1 loại đề tài';
  if (!form.facultyUnits.length) errors.facultyUnits = 'Vui lòng chọn đơn vị chủ trì';

  getFormAppendices(form).forEach((item, index) => {
    if (!item.seq.trim()) return;
    const appendixYear = item.year.trim() || defaultAppendixYear(form);
    if (!/^\d{4}$/.test(appendixYear)) {
      errors.contractAppendix = `Phụ lục ${index + 1}: Vui lòng nhập năm trên phụ lục hợp đồng`;
    }
    if (!item.signedAt.trim()) {
      errors.contractAppendixSignedAt = `Phụ lục ${index + 1}: Vui lòng nhập ngày ký phụ lục`;
    }
  });

  if (form.projectStatus === 'new_registration' && !extractReviewYear(form.reviewBatch)) {
    errors.reviewBatch = 'Vui lòng chọn đợt xét duyệt để lấy số thứ tự';
  }

  return errors;
}

function sequenceFieldsFromProject(project: ResearchProject): Pick<
  DataEntryFormData,
  'sequenceNumber' | 'sequenceYear' | 'contractSeq' | 'contractYear' | 'contractNumber' | 'projectCode'
> {
  const sequenceNumber =
    project.registrationSequenceNumber != null ? String(project.registrationSequenceNumber) : '';
  const sequenceYear =
    project.registrationSequenceYear != null ? String(project.registrationSequenceYear) : '';
  return {
    sequenceNumber,
    sequenceYear,
    contractSeq: sequenceNumber,
    contractYear: sequenceYear,
    contractNumber: project.contractId ?? '',
    projectCode: project.projectCode ?? '',
  };
}

type UseDataEntryFormOptions = {
  mode?: 'create' | 'edit';
  initialProject?: ResearchProject;
  onSaved?: (project: ResearchProject) => void | Promise<void | ResearchProject>;
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
  const formRef = useRef(form);
  formRef.current = form;

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  const setField = useCallback(<K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === 'contractAppendices') {
        delete next.contractAppendix;
        delete next.contractAppendixSignedAt;
      }
      return next;
    });
  }, []);

  const handleProjectStatusChange = useCallback(
    (status: ProjectStatus) => {
      setField('projectStatus', status);
    },
    [setField],
  );

  const handleReviewBatchChange = useCallback(
    (value: string) => {
      const nextYear = extractReviewYear(value);
      const currentYear =
        Number(formRef.current.sequenceYear) || extractReviewYear(formRef.current.reviewBatch);
      if (
        formRef.current.projectStatus === 'new_registration' &&
        nextYear !== currentYear &&
        formRef.current.sequenceNumber
      ) {
        setForm((prev) => ({
          ...prev,
          reviewBatch: value,
          contractYear: nextYear ? String(nextYear) : '',
          sequenceNumber: '',
          sequenceYear: '',
          contractSeq: '',
        }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next.reviewBatch;
          return next;
        });
        return;
      }
      setField('reviewBatch', value);
      if (nextYear) setField('contractYear', String(nextYear));
    },
    [setField],
  );

  const setCategoryTag = useCallback((tag: string) => {
    setForm((prev) => {
      const allowCoLeader = allowsCoPrincipal(tag ? [tag] : []);
      return {
        ...prev,
        categoryTags: tag ? [tag] : [],
        categoryOther: tag === 'Khác' ? prev.categoryOther : '',
        leaders: allowCoLeader
          ? prev.leaders
          : prev.leaders.map((leader, index) =>
              index === 0 || leader.addReason !== 'co_leader'
                ? leader
                : { ...leader, addReason: 'replacement' },
            ),
      };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.categoryTags;
      delete next.leaders;
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
    const current = formRef.current;
    const next = validate(current);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      scrollToFirstFormError(next);
      const message = Object.values(next)[0] ?? 'Vui lòng kiểm tra lại các trường bắt buộc.';
      return { ok: false, message };
    }

    setIsSaving(true);
    try {
      const project = mapFormToTableProject(current, initialProject);
      const saved = (await onSaved?.(project)) ?? project;

      if (mode === 'create') {
        setForm(cloneFormData());
        setErrors({});
      } else {
        setForm((prev) => ({ ...prev, ...sequenceFieldsFromProject(saved) }));
      }

      return { ok: true, project: saved };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Không lưu được đề tài.';
      return { ok: false, message };
    } finally {
      setIsSaving(false);
    }
  }, [initialProject, mode, onSaved]);

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
    handleProjectStatusChange,
    handleReviewBatchChange,
    submit,
    cancel,
  };
}
