import type { Module, CreateModulePayload, UpdateModulePayload } from "../models/Module";

export interface ModuleRepository {
  list(active?: boolean): Promise<Module[]>;
  getById(id: number): Promise<Module>;
  create(payload: CreateModulePayload): Promise<Module>;
  update(id: number, payload: UpdateModulePayload): Promise<Module>;
  delete(id: number): Promise<void>;
}

export class ModuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleError";
  }
}
