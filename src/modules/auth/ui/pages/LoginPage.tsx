/**
 * Login Page - Refactorizado con principios SOLID
 * SRP: Solo maneja la presentación del formulario de login
 * La lógica de negocio está en useLogin hook
 */

import { Link } from "react-router-dom";
import { useLogin } from "../../application/useLogin";
import "./LoginPage.css";

export default function LoginPage() {
  const { form, error, loading, handleChange, handleSubmit } = useLogin();

  return (
    <div className="login-page">
      <aside className="login-brand">
        <div className="login-brand-glass" />

        <div className="login-brand-top">
          <div className="login-brand-badge">
            <span className="login-brand-badge-dot" />
            WorkSync ATS
          </div>
        </div>

        <div className="login-brand-bottom">
          <div className="login-brand-divider" />
          <h2 className="login-brand-title">
            El motor de talento
            <br />
            <span>para equipos de alto rendimiento.</span>
          </h2>
        </div>
      </aside>

      <main className="login-form-wrapper">
        <div className="login-form-inner">
          <div className="login-mobile-badge">WorkSync ATS</div>

          <div className="login-header">
            <h1>Iniciar sesión</h1>
            <p>Accede al panel interno de reclutamiento.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="tu@worksync.cl"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div className="form-group-label-row">
                <label htmlFor="password">Contraseña</label>
                <Link to="/forgot-password" className="login-link-inline">
                  Olvidé mi contraseña
                </Link>
              </div>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
