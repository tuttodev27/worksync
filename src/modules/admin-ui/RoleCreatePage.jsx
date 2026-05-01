import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPages.css";
import "./AdminForms.css";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const STATUS_OPTIONS = [
  { value: "", label: "Selecciona un estado" },
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
];

export default function RoleCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", description: "", active: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => navigate("/admin/roles");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) { setError("El nombre del rol es obligatorio."); return; }
    if (form.active === "")  { setError("Debes seleccionar un estado."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          active: form.active === "true",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "No pudimos crear el rol.");
      }

      navigate("/admin/roles");
    } catch (err) {
      setError(err?.message || "No pudimos crear el rol. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Crear Rol</h2>
          <p className="af-subtitle">Completa los datos para registrar un nuevo rol.</p>
        </div>
      </div>

      <div className="af-card">
        <form onSubmit={handleSubmit} className="af-form">
          {error && <div className="af-error">{error}</div>}

          <div className="af-row">
            <div className="af-group">
              <label htmlFor="name" className="af-label">Nombre del Rol</label>
              <input
                id="name" name="name" type="text"
                className="af-input" placeholder="Administrador"
                value={form.name} onChange={handleChange} required
              />
            </div>

            <div className="af-group">
              <label htmlFor="active" className="af-label">Estado</label>
              <div className="af-select-wrapper">
                <select
                  id="active" name="active"
                  className="af-select"
                  value={form.active} onChange={handleChange} required
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <svg className="af-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="af-group">
            <label htmlFor="description" className="af-label">Descripción</label>
            <input
              id="description" name="description" type="text"
              className="af-input"
              placeholder="Rol con acceso total al sistema de administración"
              value={form.description} onChange={handleChange}
            />
          </div>

          <div className="af-actions">
            <button type="button" className="af-btn-secondary" onClick={handleCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="af-btn-primary" disabled={loading}>
              {loading ? "Creando…" : "Crear Rol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
