import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const STATS = [
  {
    label: "Usuarios",
    value: 24,
    sub: "Activos en el sistema",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m4-4a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
  },
  {
    label: "Roles",
    value: 5,
    sub: "Roles configurados",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: "Permisos",
    value: 38,
    sub: "Permisos definidos",
    color: "#059669",
    bg: "rgba(16,185,129,0.08)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    label: "Módulos",
    value: 8,
    sub: "Módulos activos",
    color: "#d97706",
    bg: "rgba(245,158,11,0.08)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Menú",
    value: 12,
    sub: "Items de navegación",
    color: "#dc2626",
    bg: "rgba(239,68,68,0.08)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
      </svg>
    ),
  },
];

const CRUD_CARDS = [
  {
    title: "Usuarios",
    desc: "Gestiona cuentas, asigna roles y controla el acceso de cada miembro del equipo.",
    count: "24 registros",
    to: "/admin/users",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    topGrad: "linear-gradient(90deg,#2563eb,#60a5fa)",
    icon: STATS[0].icon,
  },
  {
    title: "Roles",
    desc: "Define perfiles de acceso como Administrador, Reclutador o Postulante con sus permisos.",
    count: "5 registros",
    to: "/admin/roles",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    topGrad: "linear-gradient(90deg,#7c3aed,#a78bfa)",
    icon: STATS[1].icon,
  },
  {
    title: "Permisos",
    desc: "Configura acciones granulares: leer, crear, editar y eliminar por módulo del sistema.",
    count: "38 registros",
    to: "/admin/permissions",
    color: "#059669",
    bg: "rgba(16,185,129,0.08)",
    topGrad: "linear-gradient(90deg,#059669,#34d399)",
    icon: STATS[2].icon,
  },
  {
    title: "Módulos",
    desc: "Administra las secciones funcionales del sistema: Candidatos, Solicitudes, Usuarios y más.",
    count: "8 registros",
    to: "/admin/modules",
    color: "#d97706",
    bg: "rgba(245,158,11,0.08)",
    topGrad: "linear-gradient(90deg,#d97706,#fbbf24)",
    icon: STATS[3].icon,
  },
  {
    title: "Menú",
    desc: "Configura la navegación: ítems, orden, íconos y visibilidad según el rol del usuario.",
    count: "12 registros",
    to: "/admin/menu",
    color: "#dc2626",
    bg: "rgba(239,68,68,0.08)",
    topGrad: "linear-gradient(90deg,#dc2626,#f87171)",
    icon: STATS[4].icon,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("authUser") || "{}");
  const firstName = user.name?.split(" ")[0] ?? "Admin";

  return (
    <div className="dashboard">
      <div className="dash-greeting">
        <h1>¡Hola, {firstName}! 👋</h1>
        <p>Bienvenido al panel de administración de WorkSync ATS.</p>
      </div>

      <div className="dash-stats">
        {STATS.map(({ label, value, sub, color, bg, icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span className="stat-label">{label}</span>
              <div className="stat-icon" style={{ background: bg, color }}>
                {icon}
              </div>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="dash-section-header">
        <span className="dash-section-title">Módulos de gestión</span>
        <div className="dash-section-line" />
      </div>

      <div className="dash-grid-3">
        {CRUD_CARDS.slice(0, 3).map((card) => (
          <CrudCard key={card.title} card={card} navigate={navigate} />
        ))}
      </div>

      <div className="dash-grid-2">
        {CRUD_CARDS.slice(3).map((card) => (
          <CrudCard key={card.title} card={card} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function CrudCard({ card, navigate }) {
  const { title, desc, count, to, color, bg, topGrad, icon } = card;

  const handleNew = (e) => {
    e.stopPropagation();

    if (to === "/admin/users") {
      navigate("/admin/users/create");
      return;
    }

    navigate(`${to}/new`);
  };

  return (
    <div
      className="crud-card"
      style={{ "--card-top": topGrad }}
      onClick={() => navigate(to)}
    >
      <div className="crud-card-top">
        <div className="crud-icon" style={{ background: bg, color }}>
          {icon}
        </div>
        <span className="crud-badge">{count}</span>
      </div>

      <div className="crud-title">{title}</div>
      <div className="crud-desc">{desc}</div>

      <div className="crud-actions">
        <button
          className="btn btn-primary"
          style={{
            background: color,
            boxShadow: `0 2px 8px ${color}40`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(to);
          }}
        >
          Ver listado
        </button>

        <button className="btn btn-outline" onClick={handleNew}>
          + Nuevo
        </button>
      </div>
    </div>
  );
}