import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: reemplazar con tu servicio real
      await new Promise((r) => setTimeout(r, 800));

      // Guardamos el email para usarlo en los siguientes pasos
      sessionStorage.setItem("reset_email", email);

      navigate("/reset-code");
    } catch (err) {
      setError("No pudimos enviar el correo. Intenta de nuevo.");
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
            <h1>Olvidé mi contraseña</h1>
            <p>Ingresa tu email y te enviaremos un código de verificación.</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Enviando…" : "Enviar código"}
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
