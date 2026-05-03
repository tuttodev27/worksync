/**
 * RoleCreatePage - Refactorizado con principios SOLID
 * SRP: Solo maneja la presentación del formulario
 * La lógica de negocio está en useRoleCreate hook
 */

import { useRoleCreate } from "../admin/application/useRoleCreate";
import { BOOLEAN_STATUS } from "../../shared/constants/forms";
import "./AdminPages.css";
import "./AdminForms.css";

export default function RoleCreatePage() {
  const { form, error, loading, handleChange, handleSubmit, handleCancel } =
    useRoleCreate();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Crear Rol</h2>
          <p className="af-subtitle">
            Completa los datos para registrar un nuevo rol.
          </p>
        </div>
      </div>

      <div className="af-card">
        <form onSubmit={handleSubmit} className="af-form">
          {error && <div className="af-error">{error}</div>}

          <div className="af-row">
            <div className="af-group">
              <label htmlFor="name" className="af-label">
                Nombre del Rol
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="af-input"
                placeholder="Administrador"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="af-group">
              <label htmlFor="active" className="af-label">
                Estado
              </label>
              <div className="af-select-wrapper">
                <select
                  id="active"
                  name="active"
                  className="af-select"
                  value={form.active}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Selecciona un estado
                  </option>
                  {BOOLEAN_STATUS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="af-chevron"
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

          <div className="af-group">
            <label htmlFor="description" className="af-label">
              Descripción
            </label>
            <input
              id="description"
              name="description"
              type="text"
              className="af-input"
              placeholder="Rol con acceso total al sistema de administración"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="af-actions">
            <button
              type="button"
              className="af-btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
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
