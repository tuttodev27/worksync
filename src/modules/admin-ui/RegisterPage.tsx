/**
 * RegisterPage - Crear usuario desde el panel admin
 * SRP: Solo maneja la presentación del formulario
 * La lógica de negocio está en useUserCreate hook
 */

import { useUserCreate } from "../../modules/admin/application/useUserCreate";
import { COUNTRY_CODES } from "../../shared/constants/forms";
import "./RegisterPage.css";

export default function RegisterPage() {
  const {
    form,
    error,
    fieldErrors,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
    availableRoles,
    loadingRoles,
    rolesError,
  } = useUserCreate();

  return (
    <div className="form-panel">
      <div className="form-container form-container-wide">
        <div className="form-header">
          <h2 className="form-title">Crear usuario</h2>
          <p className="form-subtitle">
            Completa los datos para registrar un nuevo usuario en WorkSync.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form register-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="form-input"
                placeholder="Juan"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              {fieldErrors.firstName && (
                <small className="form-hint form-hint-error">{fieldErrors.firstName}</small>
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
              placeholder="usuario@worksync.cl"
              value={form.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && (
              <small className="form-hint form-hint-error">{fieldErrors.email}</small>
            )}
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              {fieldErrors.password && (
                <small className="form-hint form-hint-error">{fieldErrors.password}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="rePassword" className="form-label">
                Repetir contraseña
              </label>
              <input
                id="rePassword"
                name="rePassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.rePassword}
                onChange={handleChange}
                required
                minLength={8}
              />
              {fieldErrors.rePassword && (
                <small className="form-hint form-hint-error">{fieldErrors.rePassword}</small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Rol
            </label>

            <div className="select-wrapper">
              <select
                id="roleId"
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
                required
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
              {loading ? "Creando…" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
