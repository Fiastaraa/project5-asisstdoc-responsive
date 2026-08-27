import api from './api';
import type { LoginResponse, User, UserRole } from '../types/auth';
export async function login(email: string, password: string) {
  return (await api.post<LoginResponse>('/auth/login', { email: email.trim(), password })).data;
}
export async function register(name: string, email: string, password: string, role: UserRole) {
  return (await api.post<{ success: boolean; message: string; data: User }>('/auth/register', { name, email: email.trim(), password, role })).data;
}
