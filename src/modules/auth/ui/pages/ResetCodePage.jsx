import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import "./ResetCodePage.css";

export default function ResetCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef([]);

  const email = sessionStorage.getItem("reset_email") || "tu correo";

  const handleChange = (value, index) => {
    // Solo permite dígitos
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Avanza al siguiente input automáticamente
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Retrocede al input anterior al borrar
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pasted.split("").forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Ingresa los 6 dígitos del código.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // TODO: reemplazar con validación real del código
      // Mock: el código válido es "123456"
      await new Promise((r) => setTimeout(r, 700));
      if (fullCode !== "123456") throw new Error("Código incorrecto. Intenta de nuevo.");

      sessionStorage.setItem("reset_code_valid", "true");
      navigate("/reset-password");
    } catch (err) {
      setError(err.message);
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // TODO: lógica de reenvío real
    alert("Código reenviado a " + email);
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
            <h1>Ingresa el código</h1>
            <p>
              Enviamos un código de 6 dígitos a{" "}
              <strong>{email}</strong>.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="code-inputs">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="code-input"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Verificando…" : "Verificar código"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              ¿No recibiste el código?{" "}
              <button className="resend-btn" onClick={handleResend} type="button">
                Reenviar
              </button>
            </p>
            <p style={{ marginTop: "12px" }}>
              <Link to="/forgot-password">← Cambiar email</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
