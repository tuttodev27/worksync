import { Link } from "react-router-dom";
import "./AdminPages.css";

export default function RolesPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Roles</h2>
        <Link to="/admin/roles/create">
          <button className="admin-btn-primary">+ Crear rol</button>
        </Link>
      </div>

      {/* Tabla de roles — conectar con backend */}
      <div className="admin-page-empty">
        <p>No hay roles registrados aún.</p>
      </div>
    </div>
  );
}
