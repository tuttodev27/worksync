import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPages.css";
import "./AdminForms.css";

export default function MenuCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    path: "",
    active: "true",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate("/admin/menu");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("El título del menú es obligatorio.");
      return;
    }

    if (!form.path.trim()) {
      setError("La ruta del menú es obligatoria.");
      return;
    }

    console.log("Menú creado:", {
      title: form.title.trim(),
      path: form.path.trim(),
      active: form.active === "true",
    });

    navigate("/admin/menu");
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Crear menú</h2>
          <p className="af-subtitle">
            Completa los datos para registrar una nueva opción de navegación.
          </p>
        </div>
      </div>

      <div className="af-card">
        <form onSubmit={handleSubmit} className="af-form">
          {error && <div className="af-error">{error}</div>}

          <div className="af-row">
            <div className="af-group">
              <label htmlFor="title" className="af-label">Título</label>
              <input
                id="title"
                name="title"
                type="text"
                className="af-input"
                placeholder="Usuarios"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="af-group">
              <label htmlFor="path" className="af-label">Ruta</label>
              <input
                id="path"
                name="path"
                type="text"
                className="af-input"
                placeholder="/admin/users"
                value={form.path}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="af-group">
            <label htmlFor="active" className="af-label">Estado</label>
            <select
              id="active"
              name="active"
              className="af-select"
              value={form.active}
              onChange={handleChange}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <div className="af-actions">
            <button type="button" className="af-btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>

            <button type="submit" className="af-btn-primary">
              Crear menú
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}