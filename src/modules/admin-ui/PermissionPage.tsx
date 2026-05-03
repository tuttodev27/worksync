/**
 * PermissionPage - Refactorizado con principios SOLID
 * SRP: Solo maneja la presentación del formulario
 * La lógica de negocio está en usePermission hook
 */

import { usePermission } from "../admin/application/usePermission";
import { MODULE_OPTIONS, STATUS_OPTIONS } from "../../shared/constants/forms";
import "./PermissionPage.css";

export default function PermissionPage() {
  const { form, error, loading, handleChange, handleSubmit, handleCancel } =
    usePermission();

  return (
    <div className="login-page">
      {/* Panel izquierdo (branding iridiscente) */}
      <aside className="brand-panel">
        <div className="brand-header">
          <div className="brand-logo">
            <span className="brand-logo-dot" />
            <span className="brand-logo-text">WorkSync ATS</span>
          </div>
        </div>

        <div className="brand-content">
          <h2 className="brand-title">
            Permisos
            <br />
            granulares.
          </h2>
          <p className="brand-subtitle">
            Define acciones específicas por módulo y otórgalas a los roles que
            necesiten ejecutarlas.
          </p>
        </div>

        <div className="brand-footer">
          <span>© {new Date().getFullYear()} WorkSync</span>
        </div>
      </aside>

      {/* Panel derecho (formulario) */}
      <main className="form-panel">
        <div className="form-container">
          <header className="form-header">
            <h1 className="form-title">Crear permiso</h1>
            <p className="form-subtitle">
              Registra un nuevo permiso y asócialo a un módulo del sistema.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="login-form register-form"
            noValidate
          >
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            {/* Fila 1: Código + Módulo */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="code" className="form-label">
                  Código
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  className="form-input"
                  placeholder="users.create"
                  value={form.code}
                  onChange={handleChange}
                  autoComplete="off"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="moduleId" className="form-label">
                  Módulo
                </label>
                <div className="select-wrapper">
                  <select
                    id="moduleId"
                    name="moduleId"
                    className="form-input"
                    value={form.moduleId}
                    onChange={handleChange}
                    disabled={loading}
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
                  <svg
                    className="select-chevron"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Fila 2: Descripción (full width) */}
            <div className="form-row form-row-full">
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descripción
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  className="form-input"
                  placeholder="Permite crear usuarios en el sistema"
                  value={form.description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Fila 3: Estado (full width) */}
            <div className="form-row form-row-full">
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Estado
                </label>
                <div className="select-wrapper">
                  <select
                    id="status"
                    name="status"
                    className="form-input"
                    value={form.status}
                    onChange={handleChange}
                    disabled={loading}
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
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

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
                {loading ? "Creando…" : "Crear permiso"}
              </button>
            </div>
          </form>

          <div className="form-footer">
            <p className="form-footer-text">
              ¿Necesitas gestionar los permisos existentes?{" "}
              <a href="/admin/permissions" className="form-footer-link">
                Ir al listado
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
