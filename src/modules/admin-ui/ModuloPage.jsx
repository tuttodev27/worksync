import { useState } from "react";
import { useNavigate } from "react-router-dom";

// estilos base (mismo orden que en RegisterPage)
import "./ModuloPage.css"; // overrides específicos (opcional)

const STATUS_OPTIONS = [
  { value: "", label: "Selecciona un estado" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

export default function ModuloPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => navigate("/admin/modulos");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("El nombre del módulo es obligatorio.");
      return;
    }
    if (!form.status) {
      setError("Debes seleccionar un estado.");
      return;
    }

    setLoading(true);
    try {
      // TODO: conectar con backend Spring Boot
      await new Promise((r) => setTimeout(r, 700));
      console.log("Módulo creado:", form);
      navigate("/admin/modulos");
    } catch (err) {
      setError(err?.message || "No pudimos crear el módulo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-panel">
      <div className="form-container form-container-wide">
        <div className="form-header">
          <h2 className="form-title">Crear Módulo</h2>
          <p className="form-subtitle">
            Completa los datos para registrar un nuevo módulo en el sistema WorkSync.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form register-form">
          {error && <div className="form-error">{error}</div>}

          {/* Fila 1: Nombre + Estado */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nombre Modulo</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Administrador"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">Estado</label>
              <div className="select-wrapper">
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="select-chevron"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M6 8l4 4 4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Fila 2: Descripción (full width) */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Descripción
            </label>
            <input
              id="description"
              name="description"
              type="text"
              className="form-input"
              placeholder="Candidatos del sistema, como parte del módulo de Reclutamiento"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando…" : "Crear Módulo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
