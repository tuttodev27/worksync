import { Link } from "react-router-dom";
import "./AdminPages.css";

// Placeholder for module listing page
export default function ModuloPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Módulos</h2>

        <Link to="/admin/modules/new">
          <button className="admin-btn-primary">+ Crear módulo</button>
        </Link>
      </div>

      <div className="admin-page-empty">
        <p>No hay módulos registrados aún.</p>
      </div>
    </div>
  );
}
