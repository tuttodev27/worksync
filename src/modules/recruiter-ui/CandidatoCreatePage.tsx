import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useCandidate } from "../recruiter/application/useCandidate";
import { useCatalogs } from "../recruiter/application/useCatalogs";
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

type Step = 1 | 2 | 3;

export default function CandidatoCreatePage() {
  const { catalogs, isLoading: catalogsLoading, error: catalogsError } =
    useCatalogs();
  const {
    form,
    error,
    loading,
    handleChange,
    handleSubmit: originalHandleSubmit,
    handleCancel,
    setFormData,
    setErrorMessage,
  } = useCandidate({ catalogs });

  const [step, setStep] = useState<Step>(1);
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [uploadedCvName, setUploadedCvName] = useState("");
  const [cvSuggestedFields, setCvSuggestedFields] = useState<Set<string>>(new Set());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const isFieldSuggested = (fieldName: string) => cvSuggestedFields.has(fieldName);

  const processCvFile = async (file: File) => {
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
        countryCode: phoneCode,
        identityDocument: "",
        latestPosition,
        yearsExperience: yearsLabel,
        educationLevel,
        language,
        languageLevel,
        technicalSkills,
      });

      const suggested = new Set<string>();
      if (firstName) suggested.add("firstName");
      if (lastName) suggested.add("lastName");
      if (email) suggested.add("email");
      if (phone) suggested.add("phone");
      if (phoneCode) suggested.add("countryCode");
      if (latestPosition) suggested.add("latestPosition");
      if (yearsLabel) suggested.add("yearsExperience");
      if (educationLevel) suggested.add("educationLevel");
      if (language) suggested.add("language");
      if (languageLevel) suggested.add("languageLevel");
      if (technicalSkills) suggested.add("technicalSkills");
      setCvSuggestedFields(suggested);
    } catch {
      setErrorMessage("No se pudo procesar el CV. Intenta nuevamente.");
    } finally {
      setIsParsingCv(false);
    }
  };

  const handleCvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCvFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCvFile(file);
    }
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = "El nombre es obligatorio.";
    if (!form.lastName.trim()) errors.lastName = "El apellido es obligatorio.";
    if (!form.email.trim()) errors.email = "El email es obligatorio.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToNextStep = () => {
    setFieldErrors({});
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(3, prev + 1) as Step);
  };

  const goToPrevStep = () => {
    setFieldErrors({});
    setStep((prev) => Math.max(1, prev - 1) as Step);
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    handleCancel();
  };

  const dismissCancel = () => {
    setShowCancelModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (step < 3) {
      e.preventDefault();
      return;
    }
    originalHandleSubmit(e);
  };

  return (
    <div className="candidato-page">
      <div className="candidato-header">
        <h2>Nuevo Candidato</h2>
        <p>Registra la ficha del candidato en 3 pasos.</p>
      </div>

      {catalogsLoading && (
        <div className="candidato-hint">Cargando catalogos…</div>
      )}
      {catalogsError && (
        <div className="candidato-error">{catalogsError}</div>
      )}

      <div className="wizard-stepper">
        <div className={`wizard-step ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
          <span className="wizard-step-number">1</span>
          <span className="wizard-step-label">Subir CV</span>
        </div>
        <div className={`wizard-connector ${step > 1 ? "completed" : ""}`} />
        <div className={`wizard-step ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
          <span className="wizard-step-number">2</span>
          <span className="wizard-step-label">Datos personales</span>
        </div>
        <div className={`wizard-connector ${step > 2 ? "completed" : ""}`} />
        <div className={`wizard-step ${step === 3 ? "active" : ""}`}>
          <span className="wizard-step-number">3</span>
          <span className="wizard-step-label">Perfil profesional</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="candidato-form">
        {error && <div className="candidato-error">{error}</div>}

        {step === 1 && (
          <div className="candidato-section wizard-step-content">
            <h3>Paso 1 — Subir CV</h3>
            <p className="wizard-description">
              Sube el CV del candidato en formato PDF para extraer sus datos automáticamente.
            </p>

            <div
              className={`cv-dropzone ${isDragOver ? "drag-over" : ""}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="cvFile"
                name="cvFile"
                type="file"
                className="cv-dropzone-input"
                accept="application/pdf,.pdf"
                onChange={handleCvUpload}
                disabled={isParsingCv}
              />
              <div className="cv-dropzone-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="cv-dropzone-text">
                Arrastra el PDF aquí o{" "}
                <span
                  className="cv-dropzone-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  selecciona un archivo
                </span>
              </p>
              <p className="cv-dropzone-hint">PDF, máximo 5 MB</p>
            </div>

            <div className="cv-dropzone-feedback">
              {isParsingCv && (
                <small className="candidato-hint wizard-loading">
                  Analizando CV…
                </small>
              )}
              {!!uploadedCvName && !isParsingCv && (
                <small className="candidato-hint wizard-success">
                  CV cargado: {uploadedCvName}
                </small>
              )}
              {!uploadedCvName && !isParsingCv && (
                <small className="candidato-hint wizard-notice">
                  Puedes continuar sin CV y llenar los datos manualmente.
                </small>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="candidato-section wizard-step-content">
            <h3>Paso 2 — Datos personales</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">
                  Nombre <span className="required">*</span>
                  {isFieldSuggested("firstName") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
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
                  {isFieldSuggested("lastName") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
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
                  {isFieldSuggested("email") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
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
                <label htmlFor="identityDocument">
                  Documento de identificación
                  {isFieldSuggested("identityDocument") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
                </label>
                <input
                  id="identityDocument"
                  name="identityDocument"
                  type="text"
                  className="form-input"
                  placeholder="Documento"
                  value={form.identityDocument}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="countryCode">
                  Código de país
                  {isFieldSuggested("countryCode") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
                </label>
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
                <label htmlFor="phone">
                  Teléfono
                  {isFieldSuggested("phone") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
                </label>
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

        {step === 3 && (
          <div className="candidato-section wizard-step-content">
            <h3>Paso 3 — Perfil profesional</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="headline">Título (headline)</label>
                <input
                  id="headline"
                  name="headline"
                  type="text"
                  className="form-input"
                  placeholder="Ej. Backend Engineer"
                  value={form.headline ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="latestPosition">
                  Último cargo
                  {isFieldSuggested("latestPosition") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
                </label>
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
            </div>

            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-group form-group-full">
                <label htmlFor="summary">Resumen</label>
                <textarea
                  id="summary"
                  name="summary"
                  className="form-input"
                  placeholder="Resumen del perfil profesional"
                  value={form.summary ?? ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label htmlFor="yearsExperience">
                  Años de experiencia
                  {isFieldSuggested("yearsExperience") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
                </label>
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
                <label htmlFor="educationLevel">
                  Nivel de estudios
                  {isFieldSuggested("educationLevel") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
                </label>
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
                    <option key={e.id} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="form-group form-group-full">
                <label htmlFor="technicalSkills">
                  Habilidades técnicas
                  {isFieldSuggested("technicalSkills") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
                </label>
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
                <label htmlFor="idioma">
                  Idioma
                  {isFieldSuggested("language") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
                </label>
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
                <label htmlFor="nivelIdioma">
                  Nivel
                  {isFieldSuggested("languageLevel") && (
                    <span className="cv-badge">sugerido del CV</span>
                  )}
                </label>
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
            disabled={loading}
          >
            Cancelar
          </button>

          <div className="wizard-nav">
            {step > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={goToPrevStep}
                disabled={loading}
              >
                Anterior
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={goToNextStep}
                disabled={loading}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || catalogsLoading}
              >
                {loading ? "Creando…" : "Crear candidato"}
              </button>
            )}
          </div>
        </div>
      </form>

      {showCancelModal && (
        <div className="modal-overlay" onClick={dismissCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Descartar datos ingresados?</h3>
            <p>Si sales ahora, los datos ingresados en este formulario se perderán.</p>
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
