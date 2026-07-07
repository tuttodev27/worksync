import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logger } from "../../../../shared/utils/logger";
import "./LoginPage.css";
import "./ResetPasswordPage.css";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ResetPasswordForm>({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      // TODO: reemplazar con tuendpoint real
      await new Promise((r) => setTimeout(r, 800));

      logger.debug("Contraseña restablecida para el usuario");

      // Limpiar sesión temporal
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_code_valid");

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos restablecer la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
              Listso para
              <br />
              <span>volver.</span>
            </h2>
          </div>
        </aside>

        <main className="login-form-wrapper">
          <div className="login-form-inner">
            <div className="login-mobile-badge">WorkSync ATS</div>

            <div className="success-message">
              <div className="success-icon">✓</div>
              <h1>Contraseña restablecida</h1>
              <p>Tu contraseña ha sido actualizada exitosamente.</p>
            </div>

            <Link to="/login" className="login-button">
              Volver a iniciar sesión
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
            Nueva
            <br />
            <span>contraseña.</span>
          </h2>
        </div>
      </aside>

      <main className="login-form-wrapper">
        <div className="login-form-inner">
          <div className="login-mobile-badge">WorkSync ATS</div>

          <div className="login-header">
            <h1>Crear nueva contraseña</h1>
            <p>Ingresa tu nueva contraseña para acceder a WorkSync.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="password">Nueva contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Restableciendo…" : "Restablecer contraseña"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              <Link to="/login">← Volver a iniciar sesión</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
