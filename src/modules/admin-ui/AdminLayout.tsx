/**
 * AdminLayout - Refactorizado con useAuthUser hook
 * SRP: Solo maneja el layout y navegación
 */

import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuthUser } from "../../shared/hooks/useAuthUser";
import type { PageTitleMap } from "../shared/types/layout.types";
import "./AdminLayout.css";

const PAGE_TITLES: PageTitleMap = {
  "/admin": "Dashboard",
  "/admin/users": "Usuarios",
  "/admin/roles": "Roles",
  "/admin/permissions": "Permisos",
  "/admin/modules": "Módulos",
  "/admin/menu": "Menú",
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { user } = useAuthUser();

  const title =
    PAGE_TITLES[pathname as keyof PageTitleMap] ?? "Panel de Administración";

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">
            <span className="topbar-email">{user?.email ?? ""}</span>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
