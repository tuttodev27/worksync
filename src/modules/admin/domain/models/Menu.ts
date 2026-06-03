export interface Menu {
  id: number;
  title: string;
  path: string;
  active: boolean;
}

export interface CreateMenuPayload {
  title: string;
  path: string;
  active: boolean;
}

export interface UpdateMenuPayload {
  title?: string;
  path?: string;
  active?: boolean;
}
