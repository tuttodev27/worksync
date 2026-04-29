import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", rePassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const codeValid = sessionStorage.getItem("reset_code_valid");

    if (!codeValid) {
      navigate("/forgot-password");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (form.password !== form.rePassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 800));

      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_code_valid");

      navigate("/login", { state: { passwordReset: true } });
    } catch {
      setError("No pudimos actualizar la contraseña. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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
            Recupera tu acceso
            <br />
            <span>de forma segura.</span>
          </h2>
        </div>
      </aside>

      <main className="login-form-wrapper">
        <div className="login-form-inner">
          <div className="login-mobile-badge">WorkSync ATS</div>

          <div className="login-header">
            <h1>Nueva contraseña</h1>
            <p>Elige una contraseña segura de al menos 8 caracteres.</p>
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="rePassword">Confirmar contraseña</label>
              <input
                type="password"
                id="rePassword"
                name="rePassword"
                placeholder="••••••••"
                value={form.rePassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Guardando…" : "Guardar contraseña"}
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