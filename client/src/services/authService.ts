import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";
export async function login(data: LoginRequest) {
  return (await api.post<LoginResponse>("/auth/login", data)).data;
}
export async function register(data: RegisterRequest) {
  return (await api.post<RegisterResponse>("/auth/register", data)).data;
}
