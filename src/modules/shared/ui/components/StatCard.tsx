import { StatProps } from "../../types/dashboard.types";
import "./StatCard.css"; // Create if needed, or use parent CSS

interface StatCardProps extends StatProps {}

export default function StatCard({
  label,
  value,
  sub,
  color,
  bg,
  icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={{ background: bg, color }}>
          {icon}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
