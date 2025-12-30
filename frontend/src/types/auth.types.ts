import type { UserRole, UserStatus, Affiliation } from './common.types';

export interface User {
  id: number;
  username: string;
  nickname: string;
  role: UserRole;
  status: UserStatus;
  affiliation: Affiliation;
  phone: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  username: string;
  nickname: string;
  role: UserRole;
  status: UserStatus;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nickname: string;
  role: UserRole;
  affiliation: Affiliation;
  phone: string;
  email: string;
}
