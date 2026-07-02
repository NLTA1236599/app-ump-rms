import { defaultFormData } from './defaultFormData.js';
import type { DataEntryFormData } from './types.js';

export function cloneFormData(data: DataEntryFormData = defaultFormData): DataEntryFormData {
  return JSON.parse(JSON.stringify(data)) as DataEntryFormData;
}
