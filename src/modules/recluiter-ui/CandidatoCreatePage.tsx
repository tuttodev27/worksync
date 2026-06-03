/**
 * CandidatoCreatePage
 * Formulario ajustado a requerimiento de ficha de candidato (2 columnas)
 * Los selects se alimentan desde los catalogos de ats-postulant.
 */

import { useState, type ChangeEvent } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useCandidate } from "../recluiter/application/useCandidate";
import { useCatalogs } from "../recluiter/application/useCatalogs";
import "./CandidatoCreatePage.css";

GlobalWorkerOptions.workerSrc = pdfWorker;

const extractEmail = (text: string): string => {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? "";
};

const extractPhone = (text: string): string => {
  const match =
    text.match(
      /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/,
    ) ?? null;
  return match?.[0]?.trim() ?? "";
};

const extractCountryPhone = (phone: string, text: string): string => {
  const source = `${phone} ${text}`;
  const codeMatch = source.match(/\+(56|57|53|54|51|52|58|34|1)\b/);
  return codeMatch ? `+${codeMatch[1]}` : "";
};

const mapYearsToRange = (years: number): string => {
  if (years >= 8) return "8+";
  if (years >= 5) return "5-7";
  if (years >= 2) return "2-4";
  return "0-1";
};

const extractExperienceYears = (text: string): string => {
  const normalized = text.toLowerCase();

  if (/8\+|más de 8|more than 8/.test(normalized)) return "8+";
  if (/5\s*(a|-)\s*7|5\s*-\s*7/.test(normalized)) return "5-7";
  if (/2\s*(a|-)\s*4|2\s*-\s*4/.test(normalized)) return "2-4";
  if (/0\s*(a|-)\s*1|0\s*-\s*1/.test(normalized)) return "0-1";

  const explicitYears = normalized.match(/(\d+)\s*(años|anos|years?)/);
  if (explicitYears) {
    return mapYearsToRange(Number(explicitYears[1]));
  }

  const monthMatches = normalized.match(/(\d+)\s*(meses|months?)/g);
  if (monthMatches?.length) {
    const totalMonths = monthMatches
      .map((m) => Number(m.match(/\d+/)?.[0] ?? 0))
      .reduce((acc, n) => acc + n, 0);
    if (totalMonths > 0) {
      return mapYearsToRange(totalMonths / 12);
    }
  }

  return "";
};

const extractEducationLevel = (text: string): string => {
  const t = text.toLowerCase();
  if (/postgrado|mag[ií]ster|maestr[ií]a|mba|doctorado|phd/.test(t))
    return "postgrado";
  if (/universidad|universitario|ingenier[ií]a|licenciatura/.test(t))
    return "universitario";
  if (/t[eé]cnico|tecnico/.test(t)) return "tecnico";
  if (/secundaria|bachiller/.test(t)) return "secundaria";
  return "";
};

const extractLanguage = (text: string): string => {
  const t = text.toLowerCase();
  if (/ingl[eé]s|english/.test(t)) return "ingles";
  if (/franc[eé]s|french/.test(t)) return "frances";
  if (/espa[ñn]ol|spanish/.test(t)) return "espanol";
  return "";
};

const extractLanguageLevel = (text: string): string => {
  const t = text.toLowerCase();
  const level = t.match(/\b(a1|a2|b1|b2|c1|c2)\b/);
  if (level) return level[1];
  if (/b[aá]sico|basic/.test(t)) return "a2";
  if (/intermedio|intermediate/.test(t)) return "b1";
  if (/avanzado|advanced|fluent/.test(t)) return "c1";
  return "";
};

const extractProfessionalProfile = (text: string): string => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const byKeyword = lines.find(
    (l) =>
      /(ingeniero|engineer|developer|desarrollador|analyst|analista|arquitecto|consultor|cargo|position|rol)/i.test(
        l,
      ) && l.length <= 120,
  );

  if (!byKeyword) return "";

  return byKeyword
    .replace(/\s*\+?\d[\d\s-]{6,}.*/g, "")
    .replace(/\s+[|•-]\s+.*/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const extractTechnicalSkills = (text: string): string => {
  const matches = text.match(
    /\b(Java|TypeScript|JavaScript|React|Angular|Vue|Node|Spring|Spring Boot|SQL|PostgreSQL|MySQL|MongoDB|Docker|Kubernetes|AWS|Azure|GCP|Kafka|Python|C#|\.NET)\b/gi,
  );
  if (!matches?.length) return "";
  const unique = Array.from(new Set(matches.map((m) => m.trim())));
  return unique.join(", ");
};

const splitName = (line: string): { firstName: string; lastName: string } => {
  const cleaned = line
    .replace(/[^\p{L}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const stopwords = new Set([
    "cv",
    "curriculum",
    "vitae",
    "resume",
    "hoja",
    "de",
    "vida",
    "perfil",
    "professional",
  ]);

  const parts = cleaned
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !stopwords.has(p.toLowerCase()));

  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };

  return {
    firstName: parts.slice(0, 1).join(" "),
    lastName: parts.slice(1).join(" "),
  };
};

const guessNameFromText = (
  text: string,
  fileName: string,
): { firstName: string; lastName: string } => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidateLine =
    lines.find(
      (l) =>
        l.length >= 5 &&
        l.length <= 80 &&
        !/@/.test(l) &&
        !/\d{4,}/.test(l) &&
        /^[\p{L}\s.'-]+$/u.test(l),
    ) ?? "";

  if (candidateLine) return splitName(candidateLine);

  const baseName = fileName.replace(/\.pdf$/i, "").trim();
  const normalized = baseName
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return splitName(normalized);
};

export default function CandidatoCreatePage() {
  const { catalogs, isLoading: catalogsLoading, error: catalogsError } =
    useCatalogs();
  const {
    form,
    error,
    loading,
    handleChange,
    handleSubmit,
    handleCancel,
    setFormData,
    setErrorMessage,
  } = useCandidate({ catalogs });
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [uploadedCvName, setUploadedCvName] = useState("");

  const handleCvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Solo se permite subir CV en formato PDF.");
      return;
    }

    setErrorMessage("");
    setUploadedCvName(file.name);
    setIsParsingCv(true);

    try {
      const fileBuffer = await file.arrayBuffer();
      const loadingTask = getDocument({ data: fileBuffer });
      const pdf = await loadingTask.promise;

      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 5);

      for (let pageNum = 1; pageNum <= maxPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        fullText += `\n${pageText}`;
      }

      const { firstName, lastName } = guessNameFromText(fullText, file.name);
      const email = extractEmail(fullText);
      const phone = extractPhone(fullText);
      const phoneCode = extractCountryPhone(phone, fullText);
      const latestPosition = extractProfessionalProfile(fullText);
      const yearsLabel = extractExperienceYears(fullText);
      const educationLevel = extractEducationLevel(fullText);
      const language = extractLanguage(fullText);
      const languageLevel = extractLanguageLevel(fullText);
      const technicalSkills = extractTechnicalSkills(fullText);

      setFormData({
        firstName,
        lastName,
        email,
        phone,
        notes: phoneCode,
        experience: "",
        education: latestPosition,
        skills: yearsLabel,
        status: educationLevel,
        language,
        languageLevel,
        technicalSkills,
      });
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

      {catalogsLoading && (
        <div className="candidato-hint">Cargando catalogos…</div>
      )}
      {catalogsError && (
        <div className="candidato-error">{catalogsError}</div>
      )}

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
              <label htmlFor="notes">Código de país</label>
              <select
                id="notes"
                name="notes"
                className="form-input"
                value={form.notes}
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
                disabled={catalogsLoading}
              >
                <option value="">Seleccione</option>
                {catalogs.educationLevels.map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.name}
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
              <label htmlFor="nivelIdioma">Nivel</label>
              <select
                id="nivelIdioma"
                name="languageLevel"
                className="form-input"
                value={form.languageLevel ?? ""}
                onChange={handleChange}
                disabled={catalogsLoading}
              >
                <option value="">Seleccione</option>
                {catalogs.languageLevels.map((l) => (
                  <option key={l.id} value={l.code}>
                    {l.code} ({l.name})
                  </option>
                ))}
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
              {!!uploadedCvName && !isParsingCv && (
                <small className="candidato-hint">
                  Archivo cargado: {uploadedCvName}
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

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || catalogsLoading}
          >
            {loading ? "Creando…" : "Crear candidato"}
          </button>
        </div>
      </form>
    </div>
  );
}
