import { useNavigate } from "react-router-dom";
import { AuthUser } from "../../shared/types/auth.type";
import { Stat, CrudCardData } from "../shared/types/dashboard.types";
import StatCard from "../shared/ui/components/StatCard";
import CrudCard from "../shared/ui/components/CrudCard";
import "./RecluiterDashboard.css";

const STATS: Stat[] = [
  {
    label: "Candidatos",
    value: 48,
    sub: "Total registrados",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m4-4a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
  },
  {
    label: "Disponibles",
    value: 31,
    sub: "Listos para asignar",
    color: "#059669",
    bg: "rgba(16,185,129,0.08)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "En Proceso",
    value: 12,
    sub: "Con solicitud activa",
    color: "#d97706",
    bg: "rgba(245,158,11,0.08)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Contratados",
    value: 5,
    sub: "Este mes",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

const CRUD_CARDS: CrudCardData[] = [
  {
    title: "Candidatos",
    desc: "Crea y gestiona la ficha completa de cada postulante: datos personales, experiencia, habilidades y CV.",
    count: "48 registros",
    to: "/recluiter/candidates",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    topGrad: "linear-gradient(90deg,#2563eb,#60a5fa)",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m4-4a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
  },
];

export default function RecluiterDashboard() {
  const navigate = useNavigate();
  const user: AuthUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const firstName = user.name?.split(" ")[0] ?? "Reclutador";

  return (
    <div className="dashboard">
      <div className="dash-greeting">
        <h1>¡Hola, {firstName}! 👋</h1>
        <p>Bienvenido al panel de reclutamiento de WorkSync ATS.</p>
      </div>

      <div className="dash-stats">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="dash-section-header">
        <span className="dash-section-title">Módulos de gestión</span>
        <div className="dash-section-line" />
      </div>

      {/* Una sola card a full width */}
      <div className="dash-grid-1">
        {CRUD_CARDS.map((card) => (
          <CrudCard key={card.title} {...card} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}
