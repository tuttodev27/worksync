import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../../shared/hooks/useAuthUser";
import { useDashboard } from "../recruiter/application/useDashboard";
import CrudCard from "../shared/ui/components/CrudCard";
import "./RecluiterDashboard.css";

const ICONS = {
  candidates: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m4-4a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  ),
  disponibles: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  enProceso: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  contratados: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

const COLORS = {
  candidates:  { color: "#2563eb", bg: "rgba(37,99,235,0.08)",   grad: "linear-gradient(90deg,#2563eb,#60a5fa)" },
  disponibles: { color: "#059669", bg: "rgba(16,185,129,0.08)",  grad: "linear-gradient(90deg,#059669,#34d399)" },
  enProceso:   { color: "#d97706", bg: "rgba(245,158,11,0.08)", grad: "linear-gradient(90deg,#d97706,#fbbf24)" },
  contratados: { color: "#7c3aed", bg: "rgba(124,58,237,0.08)", grad: "linear-gradient(90deg,#7c3aed,#a78bfa)" },
};

function StatValue({ value, loading, error }: { value: number; loading: boolean; error: string }) {
  if (error) return <span className="stat-value-error" title={error}>—</span>;
  if (loading) return <span className="stat-value-loading">…</span>;
  return <>{value}</>;
}

function subText(value: number, label: string, error: string): string {
  if (error) return `Error al cargar`;
  if (value === 0) return `Sin ${label.toLowerCase()}`;
  return label === "Candidatos" ? "Total registrados" : label === "Disponibles" ? "Listos para asignar" : label === "En Proceso" ? "Con solicitud activa" : "Este mes";
}

export default function RecluiterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const { stats, loading, error, refresh } = useDashboard();

  const firstName =
    (user?.name ? user.name.split(" ")[0] : user?.email?.split("@")[0]) ?? "Reclutador";

  const statCards = [
    {
      key: "candidates",
      label: "Candidatos",
      value: stats.total,
      sub: "Total registrados",
      error,
    },
    {
      key: "disponibles",
      label: "Disponibles",
      value: stats.disponibles,
      sub: "Listos para asignar",
      error,
    },
    {
      key: "enProceso",
      label: "En Proceso",
      value: stats.enProceso,
      sub: "Con solicitud activa",
      error,
    },
    {
      key: "contratados",
      label: "Contratados",
      value: stats.contratadosEsteMes,
      sub: "Este mes",
      error,
    },
  ];

  const crudCards = [
    {
      title: "Candidatos",
      desc: "Crea y gestiona la ficha completa de cada postulante: datos personales, experiencia, habilidades y CV.",
      count: error ? "Sin acceso" : loading ? "Cargando…" : `${stats.total} ${stats.total === 1 ? "registro" : "registros"}`,
      to: "/recruiter/candidates",
      color: COLORS.candidates.color,
      bg: COLORS.candidates.bg,
      topGrad: COLORS.candidates.grad,
      icon: ICONS.candidates,
    },
  ];

  return (
    <div className="dashboard">
      <div className="dash-greeting">
        <div className="dash-greeting-row">
          <div>
            <h1>¡Hola, {firstName}! 👋</h1>
            <p>Bienvenido al panel de reclutamiento de WorkSync ATS.</p>
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

      {error && (
        <div className="dash-error-banner">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="dash-stats">
        {statCards.map((s) => {
          const palette = COLORS[s.key as keyof typeof COLORS];
          return (
            <div
              key={s.key}
              className="stat-card stat-card-clickable"
              onClick={() => s.key === "candidates" ? navigate("/recruiter/candidates") : undefined}
              role={s.key === "candidates" ? "button" : undefined}
              tabIndex={s.key === "candidates" ? 0 : undefined}
              onKeyDown={(e) => {
                if (s.key === "candidates" && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  navigate("/recruiter/candidates");
                }
              }}
            >
              <div className="stat-top">
                <span className="stat-label">{s.label}</span>
                <div className="stat-icon" style={{ background: palette.bg, color: palette.color }}>
                  {ICONS[s.key as keyof typeof ICONS]}
                </div>
              </div>
              <div className="stat-value">
                <StatValue value={s.value} loading={loading} error={s.error} />
              </div>
              <div className="stat-sub">{subText(s.value, s.label, s.error)}</div>
            </div>
          );
        })}
      </div>

      <div className="dash-section-header">
        <span className="dash-section-title">Módulos de gestión</span>
        <div className="dash-section-line" />
      </div>

      <div className="dash-grid-1">
        {crudCards.map((card) => (
          <CrudCard key={card.title} {...card} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}
