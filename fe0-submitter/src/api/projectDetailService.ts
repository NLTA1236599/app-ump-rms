import type { SubmitterProject } from '../types/submitter.js';
import type { ResearchProject } from '../types/researchProject.js';
import { ProjectStatus, ProgressStatus } from '../types/researchProject.js';
import {
  getSubmitterEmailCandidates,
  projectEmailMatchesSubmitter,
} from '../utils/submitterEmail.js';
import { fetchMyProjects } from './projectService.js';
import { researchProjectService } from './researchProjectService.js';

type SubmitterIdentity = {
  id: string;
  username: string;
  email?: string | null;
};

/** Rich demo project for detail view when API data is unavailable. */
export function getDemoResearchProject(
  id: string,
  submitter?: SubmitterProject,
  identity?: SubmitterIdentity,
): ResearchProject {
  const title =
    submitter?.title ??
    'Nghiên cứu đặc điểm thực vật, mã vạch DNA và sơ bộ thành phần hóa học của một số loài trong họ Sim (Myrtaceae)';

  const principalEmail =
    submitter?.principalEmail ??
    (identity ? getSubmitterEmailCandidates(identity)[0] : undefined);

  return {
    id,
    title,
    projectCode: submitter?.projectCode ?? '49',
    contractId: '205/2024/HĐ-ĐHYD, 22/8/2024',
    contractAppendix: undefined,
    contractDate: '2024-08-22',
    leadAuthor: 'ThS. Dương Nguyễn Xuân Lãm',
    leadAuthorGender: 'Nam',
    leadAuthorBirthYear: '1985',
    principalEmail,
    members: 'ThS. Dương Nguyễn Xuân Lãm, TS. Nguyễn Văn A',
    department: 'Dược',
    subDepartment: 'Dược liệu',
    researchField: 'Dược liệu',
    researchType: 'Cơ bản',
    categories: ['D'],
    approvalDecision: 'QĐ số 123/QĐ-ĐHYD',
    authorizationDecision: 'QĐ phê duyệt số 456/QĐ-ĐHYD',
    budget: 29_900_000,
    budgetLumpSum: 20_000_000,
    budgetNonLumpSum: 9_900_000,
    budgetOtherSources: 0,
    budgetBatch1: 15_000_000,
    budgetBatch2: 10_000_000,
    budgetBatch3: 4_900_000,
    duration: `${submitter?.durationMonths ?? 24} tháng`,
    startDate: '2024-09-01',
    endDate: '2026-08-31',
    progressStatus: ProgressStatus.ON_TIME,
    progressReportDate1: '2025-03-01',
    progressReportDate2: '2025-09-01',
    progressReportDate3: '2026-03-01',
    progressReportDate4: '2026-06-01',
    status: ProjectStatus.ONGOING,
    outputProduct: 'Bài báo khoa học',
    expectedProducts: [{ type: 'Bài báo', count: 1 }],
    actualProducts: [],
    workflowStep: 2,
    projectNotes: [],
  };
}

export async function fetchProjectById(
  id: string,
  identity: SubmitterIdentity,
): Promise<{ project: ResearchProject; submitterStatus?: SubmitterProject['status'] } | null> {
  const submitterEmails = getSubmitterEmailCandidates(identity);
  const myProjects = await fetchMyProjects(identity);
  const submitterMatch = myProjects.find((p) => p.id === id);

  try {
    const all = await researchProjectService.getAll();
    const match = all.find((p) => p.id === id);
    if (match && projectEmailMatchesSubmitter(match.principalEmail, submitterEmails)) {
      return {
        project: match,
        submitterStatus: submitterMatch?.status,
      };
    }
  } catch {
    /* fall through to demo */
  }

  if (submitterMatch) {
    return {
      project: getDemoResearchProject(id, submitterMatch, identity),
      submitterStatus: submitterMatch.status,
    };
  }

  return null;
}

export function canSubmitterEditProject(status?: SubmitterProject['status']): boolean {
  return status === 'DRAFT' || status === 'REJECTED';
}
