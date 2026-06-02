/**
 * Modelo de dominio: Usuario
 * Refleja el UserResponse del backend
 */

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  active: boolean;
  createdAt: string;
  roles: string[];
}

export interface CreateUserPayload {
  name: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  name: string;
  lastName: string;
  countryCode: string;
  phone: string;
  active: boolean;
}
