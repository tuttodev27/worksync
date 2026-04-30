import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

const PAGE_TITLES = {
  "/admin":            "Dashboard",
  "/admin/users":      "Usuarios",
  "/admin/roles":      "Roles",
  "/admin/permissions":"Permisos",
  "/admin/modules":    "Módulos",
  "/admin/menu":       "Menú",

};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "Panel de Administración";

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">
            <span className="topbar-email">
              {JSON.parse(localStorage.getItem("authUser") || "{}").email ?? ""}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
