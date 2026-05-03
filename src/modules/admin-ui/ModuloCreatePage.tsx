/**
 * ModuloCreatePage - Refactorizado con principios SOLID
 * SRP: Solo maneja la presentación del formulario
 * La lógica de negocio está en useModule hook
 */

import { useModule } from "../admin/application/useModule";
import "./AdminPages.css";
import "./AdminForms.css";

export default function ModuloCreatePage() {
  const {
    form,
    statusOptions,
    error,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useModule();

  return (
    <div className="form-panel">
      <div className="form-container form-container-wide">
        <div className="form-header">
          <h2 className="form-title">Crear Módulo</h2>
          <p className="form-subtitle">
            Completa los datos para registrar un nuevo módulo en el sistema
            WorkSync.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form register-form">
          {error && <div className="form-error">{error}</div>}

          {/* Fila 1: Nombre + Estado */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nombre Módulo
              </label>
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
              <label htmlFor="status" className="form-label">
                Estado
              </label>
              <div className="select-wrapper">
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  {statusOptions.map((opt) => (
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
