import { useCandidateEdit } from "../recruiter/application/useCandidateEdit";
import "./CandidatoCreatePage.css";

export default function CandidateEditPage() {
  const {
    form,
    error,
    loading,
    saving,
    notFound,
    catalogs,
    catalogsLoading,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useCandidateEdit();

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

  return (
    <div className="candidato-page">
      <div className="candidato-header">
        <h2>Editar candidato</h2>
        <p>Actualiza la ficha del candidato.</p>
      </div>

      <form onSubmit={handleSubmit} className="candidato-form">
        {error && <div className="candidato-error">{error}</div>}

        <div className="candidato-section">
          <h3>Información personal</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="form-input"
                value={form.firstName}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-input"
                value={form.lastName}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={form.email}
                disabled
              />
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

          </div>
        </div>

        <div className="candidato-section">
          <h3>Perfil profesional</h3>
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
            <div className="form-group form-group-full">
              <label htmlFor="headline">Título profesional</label>
              <input
                id="headline"
                name="headline"
                type="text"
                className="form-input"
                placeholder="Ej: Ingeniero de Software"
                value={form.headline}
                onChange={handleChange}
              />
            </div>
            <div className="form-group form-group-full">
              <label htmlFor="summary">Resumen profesional</label>
              <textarea
                id="summary"
                name="summary"
                className="form-input"
                placeholder="Breve resumen del perfil"
                value={form.summary}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="candidato-section">
          <h3>Estudios</h3>
          <div className="form-grid">
            <div className="form-group">
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
            <div className="form-group">
              <label htmlFor="degree">Título</label>
              <input
                id="degree"
                name="degree"
                type="text"
                className="form-input"
                placeholder="Título obtenido"
                value={form.degree}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="institution">Institución</label>
              <input
                id="institution"
                name="institution"
                type="text"
                className="form-input"
                placeholder="Universidad / Instituto"
                value={form.institution}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="candidato-section">
          <h3>Idiomas</h3>
          <div className="form-grid">
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

        <div className="candidato-section">
          <h3>Habilidades técnicas</h3>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <textarea
                name="technicalSkills"
                className="form-input"
                placeholder="Escribe habilidades técnicas"
                value={form.technicalSkills ?? ""}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="candidato-section">
          <h3>Habilidades blandas</h3>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <textarea
                name="softSkills"
                className="form-input"
                placeholder="Escribe habilidades blandas"
                value={form.softSkills ?? ""}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving || catalogsLoading}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
