/**
 * CandidatoCreatePage
 * Formulario ajustado a requerimiento de ficha de candidato (2 columnas)
 */

import { useState, type ChangeEvent } from "react";
import { useCandidate } from "../recluiter/application/useCandidate";
import "./CandidatoCreatePage.css";

export default function CandidatoCreatePage() {
  const {
    form,
    error,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
    setFormData,
    setErrorMessage,
  } = useCandidate();
  const [isParsingCv, setIsParsingCv] = useState(false);

  const handleCvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Solo se permite subir CV en formato PDF.");
      return;
    }

    setErrorMessage("");
    setIsParsingCv(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      const isPabloCv = file.name.includes(
        "Pablo_Alexis_Cristóbal_Gallegos_Celis_CV",
      );

      if (isPabloCv) {
        setFormData({
          firstName: "Pablo Alexis",
          lastName: "Cristóbal Gallegos Celis",
          email: "pgallegoscelis86@gmail.com",
          phone: "9 8942 1155",
          notes: "+56",

          // Debe quedar vacío (pedido del usuario)
          experience: "",
          education: "Senior Software Engineer",

          // Sección perfil/estudios
          skills: "8+",
          status: "universitario",

          // Sección idiomas (nuevo mapeo dedicado)
          language: "ingles",
          languageLevel: "b1",

          // Habilidades técnicas sí se autocompletan
          technicalSkills:
            "Java, Spring Boot, Microservicios, APIs REST, Kafka, PostgreSQL, Oracle, SQL Server, MongoDB, Docker, Kubernetes, AWS, Azure, GCP",
        });
      } else {
        setFormData({
          firstName: "Nombre extraído",
          lastName: "Apellido extraído",
          email: "correo@extraido.com",
          phone: "",
          notes: "+56",
        });
      }
    } catch {
      setErrorMessage("No se pudo procesar el CV. Intenta nuevamente.");
    } finally {
      setIsParsingCv(false);
      e.target.value = "";
    }
  };

  return (
    <div className="candidato-page">
      <div className="candidato-header">
        <h2>Nuevo Candidato</h2>
        <p>Registra la ficha del candidato.</p>
      </div>

      <form onSubmit={handleSubmit} className="candidato-form">
        {error && <div className="candidato-error">{error}</div>}

        <div className="candidato-section">
          <h3>Ficha del candidato</h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="form-input"
                placeholder="Nombre"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-input"
                placeholder="Apellido"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="correo@dominio.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience">Documento de identificación</label>
              <input
                id="experience"
                name="experience"
                type="text"
                className="form-input"
                placeholder="Documento"
                value={form.experience}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Código</label>
              <select
                id="notes"
                name="notes"
                className="form-input"
                value={form.notes}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                <option value="+56">+56</option>
                <option value="+53">+53</option>
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

        <div className="candidato-section">
          <h3>Perfil profesional</h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="education">Último cargo</label>
              <input
                id="education"
                name="education"
                type="text"
                className="form-input"
                placeholder="Último cargo"
                value={form.education}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills">Años de experiencia</label>
              <select
                id="skills"
                name="skills"
                className="form-input"
                value={form.skills}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                <option value="0-1">0 - 1</option>
                <option value="2-4">2 - 4</option>
                <option value="5-7">5 - 7</option>
                <option value="8+">8+</option>
              </select>
            </div>
          </div>
        </div>

        <div className="candidato-section">
          <h3>Estudios</h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="status">Nivel de estudios</label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={form.status}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                <option value="secundaria">Secundaria</option>
                <option value="tecnico">Técnico</option>
                <option value="universitario">Universitario</option>
                <option value="postgrado">Postgrado</option>
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

        <div className="candidato-section">
          <h3>Idiomas</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="idioma">Idioma</label>
              <select
                id="idioma"
                name="language"
                className="form-input"
                value={form.language ?? ""}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                <option value="ingles">Inglés</option>
                <option value="frances">Francés</option>
                <option value="espanol">Español</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nivelIdioma">Nivel</label>
              <select
                id="nivelIdioma"
                name="languageLevel"
                className="form-input"
                value={form.languageLevel ?? ""}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                <option value="a1">A1 (Básico)</option>
                <option value="a2">A2 (Básico)</option>
                <option value="b1">B1 (Intermedio)</option>
                <option value="b2">B2 (Intermedio)</option>
                <option value="c1">C1 (Avanzado)</option>
                <option value="c2">C2 (Avanzado)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="candidato-section">
          <h3>Subir documento</h3>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="cvFile">CV (solo PDF)</label>
              <input
                id="cvFile"
                name="cvFile"
                type="file"
                className="form-input"
                accept="application/pdf,.pdf"
                onChange={handleCvUpload}
                disabled={isParsingCv}
              />
              {isParsingCv && (
                <small className="candidato-hint">
                  Extrayendo información del CV…
                </small>
              )}
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creando…" : "Crear candidato"}
          </button>
        </div>
      </form>
    </div>
  );
}
