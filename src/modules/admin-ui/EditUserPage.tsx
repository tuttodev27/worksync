import { useUserEdit } from "../../modules/admin/application/useUserEdit";
import { COUNTRY_CODES } from "../../shared/constants/forms";
import "./RegisterPage.css";
import "./EditUserPage.css";

export default function EditUserPage() {
  const {
    form,
    error,
    fieldErrors,
    loading,
    saving,
    notFound,
    handleChange,
    handleSubmit,
    handleCancel,
    availableRoles,
    loadingRoles,
    rolesError,
  } = useUserEdit();

  if (loading) {
    return (
      <div className="form-panel">
        <div className="form-container form-container-wide">
          <p className="edit-loading">Cargando datos del usuario…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="form-panel">
        <div className="form-container form-container-wide">
          <div className="form-error">Usuario no encontrado.</div>
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-panel">
      <div className="form-container form-container-wide">
        <div className="form-header">
          <h2 className="form-title">Editar usuario</h2>
          <p className="form-subtitle">
            Actualiza los datos del usuario en WorkSync.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form register-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Juan"
                value={form.name}
                onChange={handleChange}
                required
              />
              {fieldErrors.name && (
                <small className="form-hint form-hint-error">{fieldErrors.name}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-input"
                placeholder="Pérez"
                value={form.lastName}
                onChange={handleChange}
                required
              />
              {fieldErrors.lastName && (
                <small className="form-hint form-hint-error">{fieldErrors.lastName}</small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              disabled
            />
            <small className="form-hint">El email no se puede modificar.</small>
          </div>

          <div className="form-row form-row-phone">
            <div className="form-group">
              <label htmlFor="countryCode" className="form-label">
                Código
              </label>
              <div className="select-wrapper">
                <select
                  id="countryCode"
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleChange}
                >
                  {COUNTRY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="9 1234 5678"
                value={form.phone}
                onChange={handleChange}
                required
              />
              {fieldErrors.phone && (
                <small className="form-hint form-hint-error">{fieldErrors.phone}</small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="roleId" className="form-label">
              Rol
            </label>

            <div className="select-wrapper">
              <select
                id="roleId"
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
                disabled={loadingRoles}
              >
                <option value={0} disabled>
                  {loadingRoles ? "Cargando roles..." : "Selecciona un rol"}
                </option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.roleId ? (
              <small className="form-hint form-hint-error">{fieldErrors.roleId}</small>
            ) : rolesError ? (
              <small className="form-hint form-hint-error">{rolesError}</small>
            ) : null}
          </div>

          <div className="form-group form-group-checkbox">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span>Usuario activo</span>
            </label>
          </div>

          <hr className="form-divider" />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Dejar vacío para mantener"
                value={form.password}
                onChange={handleChange}
                minLength={8}
              />
              <small className="form-hint">
                Solo si deseas cambiar la contraseña actual.
              </small>
              {fieldErrors.password && (
                <small className="form-hint form-hint-error">{fieldErrors.password}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="rePassword" className="form-label">
                Confirmar contraseña
              </label>
              <input
                id="rePassword"
                name="rePassword"
                type="password"
                className="form-input"
                placeholder="Repite la nueva contraseña"
                value={form.rePassword}
                onChange={handleChange}
                minLength={8}
              />
              {fieldErrors.rePassword && (
                <small className="form-hint form-hint-error">{fieldErrors.rePassword}</small>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
