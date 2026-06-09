import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  candidateRepository,
  CandidateApiError,
} from "../recruiter/infrastructure/CandidateApiRepository";
import { useCatalogs } from "../recruiter/application/useCatalogs";
import type {
  CandidateApiResponse,
  AttachmentResponse,
  StatusHistoryResponse,
} from "../recruiter/domain/types";
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

function stateClass(state?: string): string {
  const base = "candidate-status";
  if (!state) return base;
  return `${base} ${base}--${state.toLowerCase()}`;
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
  const { catalogs } = useCatalogs();
  const [candidate, setCandidate] = useState<CandidateApiResponse | null>(null);
  const [attachments, setAttachments] = useState<AttachmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [statusHistory, setStatusHistory] = useState<StatusHistoryResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

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
      candidateRepository.listStatusHistory(numericId).catch(() => []),
    ])
      .then(([cand, atts, history]) => {
        setCandidate(cand);
        setAttachments(atts);
        setStatusHistory(history);
        setSelectedStatus(cand.currentState ?? "");
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

  const handleStatusChange = async () => {
    if (!id || !selectedStatus || selectedStatus === candidate?.currentState) return;
    setStatusUpdating(true);
    setStatusError("");
    setShowStatusConfirm(false);
    try {
      const updated = await candidateRepository.updateStatus(Number(id), { status: selectedStatus });
      setCandidate(updated);
      const history = await candidateRepository.listStatusHistory(Number(id)).catch(() => []);
      setStatusHistory(history);
    } catch (err) {
      setStatusError(err instanceof CandidateApiError ? err.message : "No se pudo cambiar el estado.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const validTransitions: Record<string, string[]> = {
    NEW: ["IN_REVIEW"],
    IN_REVIEW: ["INTERVIEW", "REJECTED"],
    INTERVIEW: ["SHORTLIST", "REJECTED"],
    SHORTLIST: ["HIRED", "REJECTED"],
    REJECTED: [],
    HIRED: [],
  };

  const availableTransitions = validTransitions[candidate?.currentState ?? ""] ?? [];

  if (loading) {
    return <div className="candidate-detail-page"><div className="candidate-detail-loading">Cargando ficha del candidato...</div></div>;
  }

  if (error) {
    return (
      <div className="candidate-detail-page">
        <div className="candidate-detail-error">{error}</div>
        <button className="candidate-btn-secondary" onClick={() => navigate("/recruiter/candidates")}>
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
        <div style={{ display: "flex", gap: 8 }}>
          <Link to={`/recruiter/candidates/${candidate.id}/edit`} className="candidate-btn-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Editar
          </Link>
          <button className="candidate-btn-secondary" onClick={() => navigate("/recruiter/candidates")}>
            Volver
          </button>
        </div>
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
              {candidate.languages.map((l) => {
                const lang = catalogs?.languages.find((cl) => cl.id === l.languageId);
                const level = catalogs?.languageLevels.find((cl) => cl.id === l.languageLevelId);
                return (
                  <li key={l.id}>
                    {lang?.name ?? `Idioma #${l.languageId}`}
                    {level ? ` ${level.code.toUpperCase()} (${level.name})` : ""}
                  </li>
                );
              })}
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

    </div>
  );
}
