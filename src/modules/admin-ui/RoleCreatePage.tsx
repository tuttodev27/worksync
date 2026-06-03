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

          <div className="af-group">
            <label htmlFor="name" className="af-label">
              Nombre del Rol
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="af-input"
              placeholder="Ej: Administrador, Reclutador, Postulante"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="af-group">
            <label htmlFor="description" className="af-label">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              className="af-input af-textarea"
              placeholder="Describe el alcance y permisos de este rol..."
              value={form.description}
              onChange={handleChange}
              rows={3}
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
            </div>
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
