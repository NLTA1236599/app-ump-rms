import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { inputBase } from './formStyles.js';
import type { DataEntryFormData } from './types.js';

type Props = {
  form: DataEntryFormData;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
};

/** spec §7 — 2-column grid */
export function DecisionSection({ form, setField }: Props) {
  return (
    <section>
      <SectionHeader number={3} title="Quyết định" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="qd-review">QĐ Xét duyệt</FieldLabel>
          <input
            id="qd-review"
            type="text"
            value={form.decisionReview}
            onChange={(e) => setField('decisionReview', e.target.value)}
            className={inputBase}
          />
        </div>
        <div>
          <FieldLabel htmlFor="qd-approve">QĐ Phê duyệt</FieldLabel>
          <input
            id="qd-approve"
            type="text"
            value={form.decisionApprove}
            onChange={(e) => setField('decisionApprove', e.target.value)}
            className={inputBase}
          />
        </div>
        <div>
          <FieldLabel htmlFor="qd-appraisal">QĐ giám định</FieldLabel>
          <input
            id="qd-appraisal"
            type="text"
            value={form.decisionAppraisal}
            onChange={(e) => setField('decisionAppraisal', e.target.value)}
            className={inputBase}
          />
        </div>
        <div>
          <FieldLabel htmlFor="qd-acceptance">QĐ nghiệm thu</FieldLabel>
          <input
            id="qd-acceptance"
            type="text"
            value={form.decisionAcceptance}
            onChange={(e) => setField('decisionAcceptance', e.target.value)}
            className={inputBase}
          />
        </div>
      </div>
    </section>
  );
}
