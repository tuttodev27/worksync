import { useNavigate } from "react-router-dom";
import { CrudCardProps } from "../../types/dashboard.types";
import "./CrudCard.css"; // Create if needed

interface Props extends CrudCardProps {
  navigate: (path: string) => void;
}

export default function CrudCard({
  title,
  desc,
  count,
  to,
  color,
  bg,
  topGrad,
  icon,
  navigate,
}: Props) {
  const handleNew = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (to === "/admin/users") {
      navigate("/admin/users/create");
      return;
    }
    if (to === "/admin/roles") {
      navigate("/admin/roles/create");
      return;
    }
    if (to === "/recluiter/candidates") {
      navigate("/recluiter/candidates/new");
      return;
    }
    navigate(`${to}/new`);
  };

  return (
    <div
      className="crud-card"
      style={{ "--card-top": topGrad } as React.CSSProperties}
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
