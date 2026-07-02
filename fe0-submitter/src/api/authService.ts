import type { AuthUser } from '../types/index.js';
import { httpClient } from './httpClient.js';

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/auth/login', { username, password });
  return data;
}
