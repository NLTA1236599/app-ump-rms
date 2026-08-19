import { httpClient } from './httpClient.js';

export async function getMyFeatures(): Promise<string[]> {
  const data = await httpClient.get<{ features: string[] }>('/auth/features');
  return data.features ?? [];
}
