import { Link } from "react-router-dom";
import "./AdminPages.css";

export default function MenusPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Menús</h2>

        <Link to="/admin/menu/new">
          <button className="admin-btn-primary">+ Crear menú</button>
        </Link>
      </div>

      <div className="admin-page-empty">
        <p>No hay menús registrados aún.</p>
      </div>
    </div>
  );
}
