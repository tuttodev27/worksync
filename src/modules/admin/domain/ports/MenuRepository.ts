import type { Menu, CreateMenuPayload, UpdateMenuPayload } from "../models/Menu";

export interface MenuRepository {
  list(active?: boolean): Promise<Menu[]>;
  getById(id: number): Promise<Menu>;
  create(payload: CreateMenuPayload): Promise<Menu>;
  update(id: number, payload: UpdateMenuPayload): Promise<Menu>;
  delete(id: number): Promise<void>;
}

export class MenuError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MenuError";
  }
}
