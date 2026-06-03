import type { Role, CreateRolePayload, UpdateRolePayload } from "../models/Role";

export interface RoleRepository {
  list(active?: boolean): Promise<Role[]>;
  getById(id: number): Promise<Role>;
  create(payload: CreateRolePayload): Promise<Role>;
  update(id: number, payload: UpdateRolePayload): Promise<Role>;
  delete(id: number): Promise<void>;
}

export class RoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoleError";
  }
}
