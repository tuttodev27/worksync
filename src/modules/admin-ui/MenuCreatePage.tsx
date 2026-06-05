/**
 * MenuCreatePage - Refactorizado con principios SOLID
 * SRP: Solo maneja la presentación del formulario
 * La lógica de negocio está en useMenuCreate hook
 */

import { useMenuCreate } from "../admin/application/useMenuCreate";
import { BOOLEAN_STATUS } from "../../shared/constants/forms";
import "./AdminPages.css";
import "./AdminForms.css";

export default function MenuCreatePage() {
  const { form, error, loading, handleChange, handleSubmit, handleCancel } =
    useMenuCreate();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Crear menú</h2>
          <p className="af-subtitle">
            Agrega una nueva opción de navegación al sistema.
          </p>
        </div>
      </div>

      <div className="af-card">
        <form className="af-form" onSubmit={handleSubmit}>
          {error && <div className="af-error">{error}</div>}

          {/* TITLE + PATH */}
          <div className="af-row">
            <div className="af-group">
              <label className="af-label">Título</label>
              <input
                name="title"
                type="text"
                className="af-input"
                placeholder="Ej: Usuarios"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="af-group">
              <label className="af-label">Ruta</label>
              <input
                name="path"
                type="text"
                className="af-input"
                placeholder="/admin/users"
                value={form.path}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ACTIVE */}
          <div className="af-group">
            <label className="af-label">Estado</label>

            <select
              name="active"
              className="af-select"
              value={form.active}
              onChange={handleChange}
            >
              {BOOLEAN_STATUS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* ACTIONS */}
          <div className="af-actions">
            <button
              type="button"
              className="af-btn-secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>

            <button type="submit" className="af-btn-primary" disabled={loading}>
              Crear menú
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
