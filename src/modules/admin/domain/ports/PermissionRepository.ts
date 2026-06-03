import type { Permission, CreatePermissionPayload, UpdatePermissionPayload } from "../models/Permission";

export interface PermissionRepository {
  list(active?: boolean): Promise<Permission[]>;
  getById(id: number): Promise<Permission>;
  create(payload: CreatePermissionPayload): Promise<Permission>;
  update(id: number, payload: UpdatePermissionPayload): Promise<Permission>;
  delete(id: number): Promise<void>;
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}
