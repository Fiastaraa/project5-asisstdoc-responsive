export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'PATIENT';
export interface User { id: number; name: string; email: string; role: UserRole; }
export interface LoginResponse { success: boolean; message: string; data: { token: string; user: User }; }
