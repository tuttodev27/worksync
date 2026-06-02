import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../../shared/hooks/useAuthUser";
import { useDashboard } from "../../modules/admin/application/useDashboard";
import CrudCard from "../shared/ui/components/CrudCard";
import "./AdminDashboard.css";

const ICONS = {
  users: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m4-4a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  ),
  roles: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  permissions: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  modules: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  menus: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  ),
};

const COLORS = {
  users:     { color: "#2563eb", bg: "rgba(37,99,235,0.08)",   grad: "linear-gradient(90deg,#2563eb,#60a5fa)" },
  roles:     { color: "#7c3aed", bg: "rgba(124,58,237,0.08)",  grad: "linear-gradient(90deg,#7c3aed,#a78bfa)" },
  permissions:{ color: "#059669", bg: "rgba(16,185,129,0.08)",  grad: "linear-gradient(90deg,#059669,#34d399)" },
  modules:   { color: "#d97706", bg: "rgba(245,158,11,0.08)",  grad: "linear-gradient(90deg,#d97706,#fbbf24)" },
  menus:     { color: "#dc2626", bg: "rgba(239,68,68,0.08)",   grad: "linear-gradient(90deg,#dc2626,#f87171)" },
};

function StatValue({ value, loading, error }: { value: number; loading: boolean; error: string }) {
  if (error) return <span className="stat-value-error" title={error}>—</span>;
  if (loading) return <span className="stat-value-loading">…</span>;
  return <>{value}</>;
}

function subText(total: number, active: number, error: string, label: string): string {
  if (error) return `Sin acceso a ${label.toLowerCase()}`;
  if (total === 0) return `Sin ${label.toLowerCase()} registrados`;
  return `${active} activos de ${total}`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const { snapshot, loading, refresh } = useDashboard();

  const firstName =
    (user?.name ? user.name.split(" ")[0] : user?.email?.split("@")[0]) ?? "Admin";

  const stats = [
    {
      key: "users",
      label: "Usuarios",
      value: snapshot.users.total,
      active: snapshot.users.active,
      error: snapshot.errors.users,
      icon: ICONS.users,
      to: "/admin/users",
    },
    {
      key: "roles",
      label: "Roles",
      value: snapshot.roles.total,
      active: snapshot.roles.active,
      error: snapshot.errors.roles,
      icon: ICONS.roles,
      to: "/admin/roles",
    },
    {
      key: "permissions",
      label: "Permisos",
      value: snapshot.permissions.total,
      active: snapshot.permissions.active,
      error: snapshot.errors.permissions,
      icon: ICONS.permissions,
      to: "/admin/permissions",
    },
    {
      key: "modules",
      label: "Módulos",
      value: snapshot.modules.total,
      active: snapshot.modules.active,
      error: snapshot.errors.modules,
      icon: ICONS.modules,
      to: "/admin/modules",
    },
    {
      key: "menus",
      label: "Menú",
      value: snapshot.menus.total,
      active: snapshot.menus.active,
      error: snapshot.errors.menus,
      icon: ICONS.menus,
      to: "/admin/menu",
    },
  ];

  const crudCards = stats.map((s) => {
    const palette = COLORS[s.key as keyof typeof COLORS];
    return {
      title: s.label,
      desc:
        s.key === "users"
          ? "Gestiona cuentas, asigna roles y controla el acceso de cada miembro del equipo."
          : s.key === "roles"
          ? "Define perfiles de acceso como Administrador, Reclutador o Postulante con sus permisos."
          : s.key === "permissions"
          ? "Configura acciones granulares: leer, crear, editar y eliminar por módulo del sistema."
          : s.key === "modules"
          ? "Administra las secciones funcionales del sistema: Candidatos, Solicitudes, Usuarios y más."
          : "Configura la navegación: ítems, orden, íconos y visibilidad según el rol del usuario.",
      count: s.error
        ? "Sin acceso"
        : loading
        ? "Cargando…"
        : `${s.value} ${s.value === 1 ? "registro" : "registros"}`,
      to: s.to,
      color: palette.color,
      bg: palette.bg,
      topGrad: palette.grad,
      icon: s.icon,
    };
  });

  return (
    <div className="dashboard">
      <div className="dash-greeting">
        <div className="dash-greeting-row">
          <div>
            <h1>¡Hola, {firstName}! 👋</h1>
            <p>Bienvenido al panel de administración de WorkSync ATS.</p>
          </div>
          <button
            type="button"
            className="dash-refresh-btn"
            onClick={refresh}
            disabled={loading}
            title="Actualizar datos"
            aria-label="Actualizar datos"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className={loading ? "is-loading" : ""}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v6h6M20 20v-6h-6M5.5 13a8 8 0 0013.39 3.39M18.5 11A8 8 0 005.11 7.61"
              />
            </svg>
            {loading ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="dash-stats">
        {stats.map((s) => {
          const palette = COLORS[s.key as keyof typeof COLORS];
          return (
            <div
              key={s.key}
              className="stat-card stat-card-clickable"
              onClick={() => navigate(s.to)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(s.to);
                }
              }}
            >
              <div className="stat-top">
                <span className="stat-label">{s.label}</span>
                <div className="stat-icon" style={{ background: palette.bg, color: palette.color }}>
                  {s.icon}
                </div>
              </div>
              <div className="stat-value">
                <StatValue value={s.value} loading={loading} error={s.error} />
              </div>
              <div className="stat-sub">{subText(s.value, s.active, s.error, s.label)}</div>
            </div>
          );
        })}
      </div>

      <div className="dash-section-header">
        <span className="dash-section-title">Módulos de gestión</span>
        <div className="dash-section-line" />
      </div>

      <div className="dash-grid-3">
        {crudCards.slice(0, 3).map((card) => (
          <CrudCard key={card.title} {...card} navigate={navigate} />
        ))}
      </div>

      <div className="dash-grid-2">
        {crudCards.slice(3).map((card) => (
          <CrudCard key={card.title} {...card} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}
