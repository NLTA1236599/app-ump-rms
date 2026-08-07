import { httpClient } from './httpClient.js';

export type HistoryFieldChange = {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
};

export type HistoryEntry = {
  timestamp: string;
  user: string;
  action: string;
  changes?: HistoryFieldChange[];
};

export type ResearchProjectRow = {
  id: string;
  title?: string;
  contractId?: string;
  projectCode?: string;
  department?: string;
  leadAuthor?: string;
  history?: HistoryEntry[];
};

export async function getResearchProjects(): Promise<ResearchProjectRow[]> {
  const { data } = await httpClient.get<ResearchProjectRow[]>('/research-projects');
  return data;
}
