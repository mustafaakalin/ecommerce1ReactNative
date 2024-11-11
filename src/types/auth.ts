// src/types/auth.ts
export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }