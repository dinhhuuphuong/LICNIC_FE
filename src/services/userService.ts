import { http } from '@/services/http';

export type User = {
  id: number;
  name: string;
  email: string;
};

export function getUsers() {
  return http<User[]>('/api/users');
}

