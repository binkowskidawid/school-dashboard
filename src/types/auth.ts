import { type User } from "./user";

export interface AuthResponse {
  user: User;
  expiresIn: number;
}

export interface LoginResponse {
  success: boolean;
  data: AuthResponse;
  error?: string;
}

export interface ErrorResponse {
  success: boolean;
  error: string;
}
