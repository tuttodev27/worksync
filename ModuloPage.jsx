import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../LoginPage.css";
import "./ModuloPage.css";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const STATUS_OPTIONS = [
  { value: "", label: "Selecciona un estado" },
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
];

export default function ModuloPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    active: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => navigate("/admin/modules");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("El nombre del módulo es obligatorio.");
      return;
    }
    if (form.active === "") {
      setError("Debes seleccionar un estado.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/modules`, {
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

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? "No pudimos crear el módulo.");
      }

      navigate("/admin/modules");
    } catch (err) {
      setError(err?.message || "No pudimos crear el módulo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Panel izquierdo: marca */}
      <div className="brand-panel">
        <div className="brand-blob brand-blob-1" />
        <div className="brand-blob brand-blob-2" />
        <div className="brand-shine" />

        <div className="brand-top">
          <div className="brand-badge">
            <span className="brand-dot" />
            WorkSync ATS
          </div>
        </div>

        <div className="brand-bottom">
          <div className="brand-divider" />
          <h1 className="brand-title">
            Organiza tu sistema
            <br />
            <span className="brand-title-soft">
              con módulos bien definidos.
            </span>
          </h1>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="form-panel">
        <div className="form-container form-container-wide">
          <div className="brand-badge-mobile">WorkSync ATS</div>

          <div className="form-header">
            <h2 className="form-title">Crear Módulo</h2>
            <p className="form-subtitle">
              Completa los datos para registrar un nuevo módulo en el sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form register-form">
            {error && <div className="form-error">{error}</div>}

            {/* Nombre + Estado */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nombre del Módulo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="Reclutamiento"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="active" className="form-label">
                  Estado
                </label>
                <div className="select-wrapper">
                  <select
                    id="active"
                    name="active"
                    value={form.active}
                    onChange={handleChange}
                    required
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.value === ""}
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="select-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Descripción — full width */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Descripción
              </label>
              <input
                id="description"
                name="description"
                type="text"
                className="form-input"
                placeholder="Gestión de candidatos como parte del proceso de reclutamiento"
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

          <div className="form-footer">
            <p className="form-footer-text">
              ¿Ya terminaste?{" "}
              <Link to="/admin/modules" className="form-footer-link">
                Volver al listado
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
