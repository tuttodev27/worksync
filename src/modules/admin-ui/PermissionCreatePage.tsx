import { usePermissionCreate } from "../admin/application/usePermissionCreate";
import { BOOLEAN_STATUS, MODULE_OPTIONS } from "../../shared/constants/forms";
import "./AdminPages.css";
import "./AdminForms.css";

export default function PermissionCreatePage() {
  const { form, error, loading, handleChange, handleSubmit, handleCancel } =
    usePermissionCreate();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Crear Permiso</h2>
          <p className="af-subtitle">
            Registra un nuevo permiso y asócialo a un módulo del sistema.
          </p>
        </div>
      </div>

      <div className="af-card">
        <form onSubmit={handleSubmit} className="af-form">
          {error && <div className="af-error">{error}</div>}

          <div className="af-group">
            <label htmlFor="code" className="af-label">
              Código
            </label>
            <input
              id="code"
              name="code"
              type="text"
              className="af-input"
              placeholder="users.create"
              value={form.code}
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
              placeholder="Describe la acción que otorga este permiso..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="af-group">
            <label htmlFor="moduleId" className="af-label">
              Módulo
            </label>
            <div className="af-select-wrapper">
              <select
                id="moduleId"
                name="moduleId"
                className="af-select"
                value={form.moduleId}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Selecciona un módulo
                </option>
                {MODULE_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="af-group">
            <label htmlFor="status" className="af-label">
              Estado
            </label>
            <div className="af-select-wrapper">
              <select
                id="status"
                name="status"
                className="af-select"
                value={form.status}
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
              {loading ? "Creando…" : "Crear Permiso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
