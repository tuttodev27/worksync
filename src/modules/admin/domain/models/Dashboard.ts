/**
 * Modelo de dominio: snapshot del dashboard
 */

export interface CountSummary {
  total: number;
  active: number;
}

export interface DashboardSnapshot {
  users: CountSummary;
  roles: CountSummary;
  permissions: CountSummary;
  modules: CountSummary;
  menus: CountSummary;
  errors: {
    users: string;
    roles: string;
    permissions: string;
    modules: string;
    menus: string;
  };
}
