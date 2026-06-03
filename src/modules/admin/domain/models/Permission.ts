export interface Permission {
  id: number;
  code: string;
  description: string;
  moduleId: string;
  active: boolean;
}

export interface CreatePermissionPayload {
  code: string;
  description: string;
  moduleId: string;
  active: boolean;
}

export interface UpdatePermissionPayload {
  code?: string;
  description?: string;
  moduleId?: string;
  active?: boolean;
}
