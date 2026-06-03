export interface Module {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface CreateModulePayload {
  name: string;
  description: string;
  active: boolean;
}

export interface UpdateModulePayload {
  name?: string;
  description?: string;
  active?: boolean;
}
