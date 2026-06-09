/**
 * RecluiterSidebar - Refactorizado con useAuthUser hook
 * SRP: Solo maneja la presentación del sidebar de recruiter
 */

import { NavLink, useNavigate } from "react-router-dom";
import { useAuthUser } from "../../shared/hooks/useAuthUser";
import "./RecluiterSidebar.css";

export default function RecluiterSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuthUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="recluiter-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">WS</span>
          <span className="sidebar-logo-text">WorkSync</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/recruiter"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink
          to="/recruiter/candidates"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Candidatos
        </NavLink>

        <NavLink
          to="/recruiter/solicitudes"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          Solicitudes
        </NavLink>

        <button onClick={handleLogout} className="nav-link logout-btn">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}
