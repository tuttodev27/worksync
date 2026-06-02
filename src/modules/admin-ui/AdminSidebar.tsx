/**
 * AdminSidebar - Refactorizado con useAuthUser hook
 * SRP: Solo maneja la presentación del sidebar de admin
 */

import { NavLink } from "react-router-dom";
import { useAuthUser } from "../../shared/hooks/useAuthUser";
import type { NavSection } from "../shared/types/layout.types";
import "./AdminSidebar.css";

const NAV_ITEMS: NavSection[] = [
  {
    section: "Principal",
    links: [
      {
        to: "/admin",
        end: true,
        label: "Dashboard",
        icon: (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Gestión",
    links: [
      {
        to: "/admin/users",
        label: "Usuarios",
        icon: (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m4-4a4 4 0 100-8 4 4 0 000 8z"
            />
          </svg>
        ),
      },
      {
        to: "/admin/roles",
        label: "Roles",
        icon: (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
      },
      {
        to: "/admin/permissions",
        label: "Permisos",
        icon: (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        ),
      },
      {
        to: "/admin/modules",
        label: "Módulos",
        icon: (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        to: "/admin/menu",
        label: "Menú",
        icon: (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        ),
      },
    ],
  },
];

export default function AdminSidebar() {
  const { user, logout } = useAuthUser();

  const displayName = user?.name || user?.email || "Admin";
  const displayRole = user?.role
    ? user.role === "ADMIN"
      ? "Administrador"
      : "Reclutador"
    : "Usuario";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">W</div>
        <span className="logo-name">WorkSync ATS</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ section, links }) => (
          <div key={section}>
            <div className="nav-section">{section}</div>
            {links.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
              >
                <span className="nav-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-role">{displayRole}</div>
          </div>
        </div>
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
