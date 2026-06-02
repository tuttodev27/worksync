/**
 * Puerto para el repositorio de usuarios
 * Define las operaciones disponibles sobre usuarios
 */

import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from "../models/User";

export interface UserRepository {
  list(active?: boolean): Promise<User[]>;
  getById(id: number): Promise<User>;
  create(payload: CreateUserPayload): Promise<User>;
  update(id: number, payload: UpdateUserPayload): Promise<User>;
  delete(id: number): Promise<void>;
  listAvailableRoles(): Promise<string[]>;
}

export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}
