import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  candidateRepository,
  CandidateApiError,
} from "../recluiter/infrastructure/CandidateApiRepository";
import type { CandidateApiResponse, AttachmentResponse } from "../recluiter/domain/types";
import "./CandidateDetailPage.css";

function formatDate(iso?: string): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function stateLabel(state?: string): string {
  if (!state) return "-";
  const labels: Record<string, string> = {
    NEW: "Nuevo",
    IN_REVIEW: "En revisión",
    CONTACTED: "Contactado",
    INTERVIEW: "Entrevista",
    OFFERED: "Ofertado",
    HIRED: "Contratado",
    REJECTED: "Rechazado",
    ARCHIVED: "Archivado",
  };
  return labels[state] ?? state;
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateApiResponse | null>(null);
  const [attachments, setAttachments] = useState<AttachmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!id) return;
    const numericId = Number(id);
    if (isNaN(numericId)) {
      setError("ID de candidato inválido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    Promise.all([
      candidateRepository.getById(numericId),
      candidateRepository.listAttachments(numericId),
    ])
      .then(([cand, atts]) => {
        setCandidate(cand);
        setAttachments(atts);
      })
      .catch((err) => {
        if (err instanceof CandidateApiError) {
          if (err.status === 404) {
            setError("Candidato no encontrado.");
          } else {
            setError(err.message);
          }
        } else {
          setError("No se pudo cargar la ficha del candidato.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Solo se permite subir CV en formato PDF.");
      e.target.value = "";
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const attachment = await candidateRepository.uploadAttachment(
        Number(id),
        file,
      );
      setAttachments((prev) => [...prev, attachment]);
      const updated = await candidateRepository.getById(Number(id));
      setCandidate(updated);
    } catch (err) {
      if (err instanceof CandidateApiError) {
        setUploadError(err.message);
      } else {
        setUploadError("No se pudo subir el CV.");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return <div className="candidate-detail-page"><div className="candidate-detail-loading">Cargando ficha del candidato...</div></div>;
  }

  if (error) {
    return (
      <div className="candidate-detail-page">
        <div className="candidate-detail-error">{error}</div>
        <button className="candidate-btn-secondary" onClick={() => navigate("/recluiter/candidates")}>
          Volver a candidatos
        </button>
      </div>
    );
  }

  if (!candidate) return null;

  return (
    <div className="candidate-detail-page">
      <div className="candidate-detail-header">
        <div>
          <h2>{candidate.firstName} {candidate.lastName}</h2>
          <p className="candidate-detail-subtitle">
            Ficha completa del candidato
            {candidate.currentState && (
              <span className="candidate-detail-badge">
                {stateLabel(candidate.currentState)}
              </span>
            )}
          </p>
        </div>
        <button className="candidate-btn-secondary" onClick={() => navigate("/recluiter/candidates")}>
          Volver
        </button>
      </div>

      <div className="candidate-detail-grid">
        <div className="candidate-detail-card">
          <h3>Información personal</h3>
          <dl className="detail-list">
            <div className="detail-row">
              <dt>Nombre</dt>
              <dd>{candidate.firstName} {candidate.lastName}</dd>
            </div>
            <div className="detail-row">
              <dt>Email</dt>
              <dd>{candidate.email}</dd>
            </div>
            <div className="detail-row">
              <dt>Teléfono</dt>
              <dd>{candidate.phone || "-"}</dd>
            </div>
            <div className="detail-row">
              <dt>Documento</dt>
              <dd>{candidate.identityDocument || "-"}</dd>
            </div>
            <div className="detail-row">
              <dt>Código interno</dt>
              <dd>{candidate.code || "-"}</dd>
            </div>
            <div className="detail-row">
              <dt>País</dt>
              <dd>{candidate.countryCode || "-"}</dd>
            </div>
            <div className="detail-row">
              <dt>Ubicación</dt>
              <dd>{candidate.location || "-"}</dd>
            </div>
            <div className="detail-row">
              <dt>LinkedIn</dt>
              <dd>{candidate.linkedinUrl ? <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">Ver perfil</a> : "-"}</dd>
            </div>
            <div className="detail-row">
              <dt>GitHub</dt>
              <dd>{candidate.githubUrl ? <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer">Ver perfil</a> : "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="candidate-detail-card">
          <h3>Perfil profesional</h3>
          {candidate.professionalProfile ? (
            <dl className="detail-list">
              <div className="detail-row">
                <dt>Último cargo</dt>
                <dd>{candidate.professionalProfile.latestPosition || "-"}</dd>
              </div>
              <div className="detail-row">
                <dt>Años de experiencia</dt>
                <dd>{candidate.professionalProfile.yearsExperience != null ? `${candidate.professionalProfile.yearsExperience} años` : "-"}</dd>
              </div>
              {candidate.professionalProfile.headline && (
                <div className="detail-row">
                  <dt>Título</dt>
                  <dd>{candidate.professionalProfile.headline}</dd>
                </div>
              )}
              {candidate.professionalProfile.summary && (
                <div className="detail-row">
                  <dt>Resumen</dt>
                  <dd>{candidate.professionalProfile.summary}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="candidate-detail-empty">Sin información profesional registrada.</p>
          )}
        </div>

        <div className="candidate-detail-card">
          <h3>Estudios</h3>
          {candidate.educations && candidate.educations.length > 0 ? (
            <ul className="detail-simple-list">
              {candidate.educations.map((e) => (
                <li key={e.id}>
                  {e.degree || "Sin título"} {e.institution ? `- ${e.institution}` : ""}
                  {e.endDate ? ` (${formatDate(e.endDate)})` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="candidate-detail-empty">Sin estudios registrados.</p>
          )}
        </div>

        <div className="candidate-detail-card">
          <h3>Idiomas</h3>
          {candidate.languages && candidate.languages.length > 0 ? (
            <ul className="detail-simple-list">
              {candidate.languages.map((l) => (
                <li key={l.id}>
                  Idioma #{l.languageId}
                  {l.languageLevelId ? ` (Nivel #${l.languageLevelId})` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="candidate-detail-empty">Sin idiomas registrados.</p>
          )}
        </div>

        <div className="candidate-detail-card">
          <h3>Habilidades técnicas</h3>
          {candidate.hardSkills && candidate.hardSkills.length > 0 ? (
            <ul className="detail-simple-list">
              {candidate.hardSkills.map((s) => (
                <li key={s.id}>
                  HardSkill #{s.hardSkillId}
                  {s.level ? ` (${s.level})` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="candidate-detail-empty">Sin habilidades técnicas registradas.</p>
          )}
        </div>

        <div className="candidate-detail-card">
          <h3>Habilidades blandas</h3>
          {candidate.softSkills && candidate.softSkills.length > 0 ? (
            <ul className="detail-simple-list">
              {candidate.softSkills.map((s) => (
                <li key={s.id}>SoftSkill #{s.softSkillId}</li>
              ))}
            </ul>
          ) : (
            <p className="candidate-detail-empty">Sin habilidades blandas registradas.</p>
          )}
        </div>
      </div>

      <div className="candidate-detail-card">
        <h3>Documentos adjuntos</h3>
        {attachments.length > 0 ? (
          <ul className="detail-simple-list">
            {attachments.map((a) => (
              <li key={a.id}>
                {a.fileName}
                {a.parseStatus === "COMPLETED" ? " (CV procesado)" : a.parseStatus === "FAILED" ? " (Error al procesar)" : ` (${a.parseStatus || "Pendiente"})`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="candidate-detail-empty">Sin documentos adjuntos.</p>
        )}

        <div className="candidate-upload-section">
          <label className="candidate-upload-label">
            Subir CV (PDF)
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleCvUpload}
              disabled={uploading}
              className="candidate-upload-input"
            />
          </label>
          {uploading && <p className="candidate-upload-status">Subiendo y procesando CV...</p>}
          {uploadError && <p className="candidate-upload-error">{uploadError}</p>}
        </div>
      </div>
    </div>
  );
}
