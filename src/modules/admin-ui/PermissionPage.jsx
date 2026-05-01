import { useState } from "react";
import { useNavigate } from "react-router-dom";

// estilos base (reutilizamos los del login/register/role)
import "./LoginPage.css";
import "./RegisterPage.css";
import "./RolePage.css";
// estilos específicos (opcional, crea PermissionPage.css si quieres overrides)
import "./PermissionPage.css";

/**
 * PermissionPage
 * Formulario para crear un nuevo permiso del sistema.
 *
 * Props:
 *  - onCreate(payload): función opcional para conectar con backend (Spring Boot, etc.)
 *  - availableModules: array [{ id, name }] para poblar el select de módulos.
 */
export default function PermissionPage({ onCreate, availableModules }) {
  const navigate = useNavigate();

  const MODULES = availableModules ?? [
    { id: "users", name: "Usuarios" },
    { id: "roles", name: "Roles" },
    { id: "applicants", name: "Postulantes" },
    { id: "recruitment", name: "Reclutamiento" },
    { id: "admin", name: "Administración" },
  ];

  const [form, setForm] = useState({
    code: "",
    description: "",
    moduleId: "",
    status: "active",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => navigate("/admin/permissions");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.code.trim()) {
      setError("El código del permiso es obligatorio.");
      return;
    }
    if (!/^[a-z0-9]+(\.[a-z0-9]+)+$/i.test(form.code.trim())) {
      setError("El código debe tener formato tipo 'modulo.accion' (ej: users.create).");
      return;
    }
    if (!form.moduleId) {
      setError("Selecciona el módulo al que pertenece el permiso.");
      return;
    }
    if (!form.status) {
      setError("Selecciona el estado del permiso.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        code: form.code.trim(),
        description: form.description.trim(),
        moduleId: form.moduleId,
        status: form.status,
      };

      if (typeof onCreate === "function") {
        await onCreate(payload);
      } else {
        // TODO: conectar con backend Spring Boot
        await new Promise((r) => setTimeout(r, 500));
        console.log("Crear permiso:", payload);
      }

      navigate("/admin/permissions");
    } catch (err) {
      setError(err?.message || "No pudimos crear el permiso. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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
            Permisos<br />granulares.
          </h2>
          <p className="brand-subtitle">
            Define acciones específicas por módulo y otórgalas a los roles
            que necesiten ejecutarlas.
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
                    {MODULES.map((m) => (
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
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
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

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
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
