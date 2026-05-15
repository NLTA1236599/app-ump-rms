import { httpClient } from './httpClient.js';
import type { User } from '../../types/index.js';

export class ApiUserDirectory {
  async listAssignable(): Promise<User[]> {
    return httpClient.get<User[]>('/users');
  }
}
