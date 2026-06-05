/**
 * DashboardApiRepository - Agrega datos para el dashboard de admin
 * Hace fetch en paralelo a los endpoints de cada catálogo y devuelve conteos
 */

import { httpRequest, HttpError } from "../../../shared/services/httpClient";
import { API_USERS_URL } from "../../../shared/constants/forms";
import type { User } from "../domain/models/User";
import type { DashboardSnapshot } from "../domain/models/Dashboard";
import type { PageResponse } from "../../../shared/types/api";

interface PermissionLite {
  active?: boolean;
}

interface ModuleLite {
  active?: boolean;
}

interface MenuLite {
  active?: boolean;
}

interface RoleLite {
  active?: boolean;
}

function countActive<T extends { active?: boolean }>(items: T[]): {
  total: number;
  active: number;
} {
  const total = items.length;
  const active = items.filter((i) => i.active === true).length;
  return { total, active };
}

function safeCount<T>(items: T[] | undefined): { total: number; active: number } {
  if (!items) return { total: 0, active: 0 };
  return countActive(items as Array<{ active?: boolean }>);
}

export class DashboardApiRepository {
  async fetchSnapshot(): Promise<DashboardSnapshot> {
    const usersPromise = httpRequest<PageResponse<User>>("/api/users", { baseUrl: API_USERS_URL }).then(r => r.content);
    const rolesPromise = httpRequest<PageResponse<RoleLite>>("/api/roles", { baseUrl: API_USERS_URL }).then(r => r.content);
    const permsPromise = httpRequest<PermissionLite[]>("/api/permissions", { baseUrl: API_USERS_URL });
    const modulesPromise = httpRequest<ModuleLite[]>("/api/modules", { baseUrl: API_USERS_URL });
    const menusPromise = httpRequest<MenuLite[]>("/api/menus", { baseUrl: API_USERS_URL });

    const results = await Promise.allSettled([
      usersPromise,
      rolesPromise,
      permsPromise,
      modulesPromise,
      menusPromise,
    ]);

    const [usersRes, rolesRes, permsRes, modulesRes, menusRes] = results;

    return {
      users: safeCount(usersRes.status === "fulfilled" ? usersRes.value : undefined),
      roles: safeCount(rolesRes.status === "fulfilled" ? rolesRes.value : undefined),
      permissions: safeCount(permsRes.status === "fulfilled" ? permsRes.value : undefined),
      modules: safeCount(modulesRes.status === "fulfilled" ? modulesRes.value : undefined),
      menus: safeCount(menusRes.status === "fulfilled" ? menusRes.value : undefined),
      errors: {
        users: usersRes.status === "rejected" ? getErrorMessage(usersRes.reason) : "",
        roles: rolesRes.status === "rejected" ? getErrorMessage(rolesRes.reason) : "",
        permissions: permsRes.status === "rejected" ? getErrorMessage(permsRes.reason) : "",
        modules: modulesRes.status === "rejected" ? getErrorMessage(modulesRes.reason) : "",
        menus: menusRes.status === "rejected" ? getErrorMessage(menusRes.reason) : "",
      },
    };
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof HttpError) return err.message;
  if (err instanceof Error) return err.message;
  return "Error al cargar";
}

export const dashboardRepository = new DashboardApiRepository();
