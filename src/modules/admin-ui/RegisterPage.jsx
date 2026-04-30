import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleCancel = () => {
    navigate("/admin/users");
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

    if (!form.userType) {
      setError("Selecciona un tipo de usuario.");
      return;
    }

    setLoading(true);

    try {
      // TODO: conectar con tu backend Spring Boot
      await new Promise((resolve) => setTimeout(resolve, 700));

      console.log("Usuario creado:", form);

      navigate("/admin/users");
    } catch (err) {
      setError(err?.message || "No pudimos crear el usuario. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
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
          </div>

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
                  {COUNTRY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
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
                {USER_TYPES.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.value === ""}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
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

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Creando…" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}