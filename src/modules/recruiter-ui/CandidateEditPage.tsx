import { useState, type FormEvent } from "react";
import { useCandidateEdit } from "../recruiter/application/useCandidateEdit";
import "./CandidatoCreatePage.css";

type Step = 1 | 2;

export default function CandidateEditPage() {
  const {
    form,
    error,
    loading,
    saving,
    notFound,
    hasChanges,
    catalogs,
    catalogsLoading,
    handleChange,
    handleSubmit: originalHandleSubmit,
    handleCancel,
  } = useCandidateEdit();

  const [step, setStep] = useState<Step>(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="candidato-page">
        <div className="candidato-header">
          <h2>Cargando datos del candidato...</h2>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="candidato-page">
        <div className="candidato-error">Candidato no encontrado.</div>
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = "El nombre es obligatorio.";
    if (!form.lastName.trim()) errors.lastName = "El apellido es obligatorio.";
    if (!form.email.trim()) errors.email = "El email es obligatorio.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToNextStep = () => {
    setFieldErrors({});
    if (!validateStep1()) return;
    setStep(2);
  };

  const goToPrevStep = () => {
    setFieldErrors({});
    setStep(1);
  };

  const handleCancelClick = () => {
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      handleCancel();
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    handleCancel();
  };

  const dismissCancel = () => {
    setShowCancelModal(false);
  };

  const handleSubmit = (e: FormEvent) => {
    if (step < 2) {
      e.preventDefault();
      return;
    }
    originalHandleSubmit(e);
  };

  return (
    <div className="candidato-page">
      <div className="candidato-header">
        <h2>Editar candidato</h2>
        <p>Actualiza la ficha del candidato en 2 pasos.</p>
      </div>

      <div className="wizard-stepper">
        <div className={`wizard-step ${step >= 1 ? "active" : ""}`}>
          <span className="wizard-step-number">1</span>
          <span className="wizard-step-label">Datos personales</span>
        </div>
        <div className="wizard-connector" />
        <div className={`wizard-step ${step >= 2 ? "active" : ""}`}>
          <span className="wizard-step-number">2</span>
          <span className="wizard-step-label">Perfil profesional</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="candidato-form">
        {error && <div className="candidato-error">{error}</div>}

        {step === 1 && (
          <div className="candidato-section wizard-step-content">
            <h3>Paso 1 — Datos personales</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">
                  Nombre <span className="required">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={`form-input ${fieldErrors.firstName ? "input-error" : ""}`}
                  placeholder="Nombre"
                  value={form.firstName}
                  onChange={handleChange}
                />
                {fieldErrors.firstName && (
                  <small className="field-error">{fieldErrors.firstName}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Apellido <span className="required">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={`form-input ${fieldErrors.lastName ? "input-error" : ""}`}
                  placeholder="Apellido"
                  value={form.lastName}
                  onChange={handleChange}
                />
                {fieldErrors.lastName && (
                  <small className="field-error">{fieldErrors.lastName}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${fieldErrors.email ? "input-error" : ""}`}
                  placeholder="correo@dominio.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && (
                  <small className="field-error">{fieldErrors.email}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="identityDocument">Documento de identificación</label>
                <input
                  id="identityDocument"
                  name="identityDocument"
                  type="text"
                  className="form-input"
                  placeholder="RUT / Cédula"
                  value={form.identityDocument}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="countryCode">Código de país</label>
                <select
                  id="countryCode"
                  name="countryCode"
                  className="form-input"
                  value={form.countryCode}
                  onChange={handleChange}
                  disabled={catalogsLoading}
                >
                  <option value="">Seleccione</option>
                  {catalogs.countryCodes.map((c) => (
                    <option key={c.id} value={c.phoneCode}>
                      {c.phoneCode} ({c.isoCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="9 1234 5678"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="candidato-section wizard-step-content">
            <h3>Paso 2 — Perfil profesional</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="latestPosition">Último cargo</label>
                <input
                  id="latestPosition"
                  name="latestPosition"
                  type="text"
                  className="form-input"
                  placeholder="Último cargo"
                  value={form.latestPosition}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="yearsExperience">Años de experiencia</label>
                <select
                  id="yearsExperience"
                  name="yearsExperience"
                  className="form-input"
                  value={form.yearsExperience}
                  onChange={handleChange}
                  disabled={catalogsLoading}
                >
                  <option value="">Seleccione</option>
                  {catalogs.experienceRanges.map((r) => (
                    <option key={r.id} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-group form-group-full">
                <label htmlFor="educationLevel">Nivel de estudios</label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  className="form-input"
                  value={form.educationLevel}
                  onChange={handleChange}
                  disabled={catalogsLoading}
                >
                  <option value="">Seleccione</option>
                  {catalogs.educationLevels.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label htmlFor="degree">Título</label>
                <input
                  id="degree"
                  name="degree"
                  className="form-input"
                  placeholder="Ej. Ingeniería Civil Informática"
                  value={form.degree ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="institution">Institución</label>
                <input
                  id="institution"
                  name="institution"
                  className="form-input"
                  placeholder="Ej. Universidad de Chile"
                  value={form.institution ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label htmlFor="startDate">Fecha de inicio</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className="form-input"
                  value={form.startDate ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Fecha de término</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  className="form-input"
                  value={form.endDate ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-group form-group-full">
                <label htmlFor="technicalSkills">Habilidades técnicas</label>
                <textarea
                  id="technicalSkills"
                  name="technicalSkills"
                  className="form-input"
                  placeholder="Escribe habilidades técnicas"
                  value={form.technicalSkills ?? ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-group form-group-full">
                <label htmlFor="softSkills">Habilidades blandas</label>
                <textarea
                  id="softSkills"
                  name="softSkills"
                  className="form-input"
                  placeholder="Escribe habilidades blandas"
                  value={form.softSkills ?? ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label htmlFor="language">Idioma</label>
                <select
                  id="language"
                  name="language"
                  className="form-input"
                  value={form.language}
                  onChange={handleChange}
                  disabled={catalogsLoading}
                >
                  <option value="">Seleccione</option>
                  {catalogs.languages.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="languageLevel">Nivel</label>
                <select
                  id="languageLevel"
                  name="languageLevel"
                  className="form-input"
                  value={form.languageLevel}
                  onChange={handleChange}
                  disabled={catalogsLoading}
                >
                  <option value="">Seleccione</option>
                  {catalogs.languageLevels.map((l) => (
                    <option key={l.id} value={l.code}>
                      {l.code.toUpperCase()} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="wizard-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancelClick}
            disabled={saving}
          >
            Cancelar
          </button>

          <div className="wizard-nav">
            {step > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={goToPrevStep}
                disabled={saving}
              >
                Anterior
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={goToNextStep}
                disabled={saving}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || catalogsLoading}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            )}
          </div>
        </div>
      </form>

      {showCancelModal && (
        <div className="modal-overlay" onClick={dismissCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Descartar los cambios realizados?</h3>
            <p>Si sales ahora, los cambios realizados en este formulario se perderán.</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={dismissCancel}>
                Seguir editando
              </button>
              <button type="button" className="btn-danger" onClick={confirmCancel}>
                Descartar y salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
