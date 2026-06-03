export interface Role {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  active: boolean;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  active?: boolean;
}
