import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import "./RegisterPage.css";

const USER_TYPES = [
  { value: "", label: "Selecciona un tipo" },
  { value: "reclutador", label: "Reclutador" },
  { value: "admin", label: "Administrador" },
  { value: "postulante", label: "Postulante" },
];

const COUNTRY_CODES = ["+56", "+54", "+51", "+57", "+52", "+1", "+34"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+56",
    phone: "",
    password: "",
    rePassword: "",
    userType: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => navigate("/login");

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
    if (!form.userType) {
      setError("Selecciona un tipo de usuario.");
      return;
    }

    setLoading(true);
    try {
      // TODO: reemplazar con tu registerUser real
      await new Promise((r) => setTimeout(r, 700));
      localStorage.setItem("authUser", JSON.stringify({ email: form.email }));
      navigate("/admin/users");
    } catch (err) {
      setError(err?.message || "No pudimos crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Panel izquierdo: marca */}
      <div className="brand-panel">
        <div className="brand-blob brand-blob-1" />
        <div className="brand-blob brand-blob-2" />
        <div className="brand-shine" />
        <div className="brand-glass" />

        <div className="brand-top">
          <div className="brand-badge">
            <span className="brand-dot" />
            WorkSync ATS
          </div>
        </div>

        <div className="brand-bottom">
          <div className="brand-divider" />
          <h1 className="brand-title">
            Construye tu equipo
            <br />
            <span className="brand-title-soft">
              con la mejor tecnología.
            </span>
          </h1>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="form-panel">
        <div className="form-container form-container-wide">
          <div className="brand-badge-mobile">WorkSync ATS</div>

          <div className="form-header">
            <h2 className="form-title">Crear cuenta</h2>
            <p className="form-subtitle">
              Completa tus datos para acceder al panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form register-form">
            {error && <div className="form-error">{error}</div>}

            {/* Nombre + Apellido */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">Nombre</label>
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
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Apellido</label>
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
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="tu@worksync.cl"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Código + Teléfono */}
            <div className="form-row form-row-phone">
              <div className="form-group">
                <label htmlFor="countryCode" className="form-label">Código</label>
                <div className="select-wrapper">
                  <select
                    id="countryCode"
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Teléfono</label>
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
              </div>
            </div>

            {/* Password + Re Password */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="rePassword" className="form-label">Repetir contraseña</label>
                <input
                  id="rePassword"
                  name="rePassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.rePassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Tipo de Usuario */}
            <div className="form-group">
              <label htmlFor="userType" className="form-label">Tipo de usuario</label>
              <div className="select-wrapper">
                <select
                  id="userType"
                  name="userType"
                  value={form.userType}
                  onChange={handleChange}
                  required
                >
                  {USER_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Botones */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </form>

          <div className="form-footer">
            <p className="form-footer-text">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="form-footer-link">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
