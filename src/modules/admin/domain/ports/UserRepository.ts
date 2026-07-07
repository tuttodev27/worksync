/**
 * Puerto para el repositorio de usuarios
 * Define las operaciones disponibles sobre usuarios
 */

import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from "../models/User";
import type { Role } from "../models/Role";
import type { PageResponse } from "../../../../shared/types/api";

export interface UserRepository {
  list(active?: boolean, page?: number, size?: number): Promise<PageResponse<User>>;
  getById(id: number): Promise<User>;
  create(payload: CreateUserPayload): Promise<User>;
  update(id: number, payload: UpdateUserPayload): Promise<User>;
  deactivate(id: number): Promise<User>;
  listAvailableRoles(): Promise<Role[]>;
}

export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}
