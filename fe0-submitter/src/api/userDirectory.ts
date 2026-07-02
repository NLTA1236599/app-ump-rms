import type { User } from '../types/index.js';
import { httpClient } from './httpClient.js';

export const userDirectory = {
  async listAssignable(): Promise<User[]> {
    const { data } = await httpClient.get<User[]>('/users');
    return data;
  },
};
