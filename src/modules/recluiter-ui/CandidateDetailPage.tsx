import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  candidateRepository,
  CandidateApiError,
} from "../recluiter/infrastructure/CandidateApiRepository";
import type {
  CandidateApiResponse,
  AttachmentResponse,
  StatusHistoryResponse,
} from "../recluiter/domain/types";
import ConfirmModal from "../shared/ui/components/ConfirmModal";
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
        <div style={{ display: "flex", gap: 8 }}>
          <Link to={`/recluiter/candidates/${candidate.id}/edit`} className="candidate-btn-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Editar
          </Link>
          <button className="candidate-btn-secondary" onClick={() => navigate("/recluiter/candidates")}>
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
        <h3>Estado del candidato</h3>
        {statusError && <p className="candidate-upload-error">{statusError}</p>}
        {candidate.currentState && (
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>
            Estado actual:{" "}
            <span className={stateClass(candidate.currentState)}>
              {stateLabel(candidate.currentState)}
            </span>
          </p>
        )}
        {availableTransitions.length > 0 ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="candidate-search-input"
              style={{ maxWidth: 200, minHeight: 38 }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={statusUpdating}
            >
              <option value="">Seleccionar estado</option>
              {availableTransitions.map((st) => (
                <option key={st} value={st}>
                  {stateLabel(st)}
                </option>
              ))}
            </select>
            <button
              className="candidate-btn-primary"
              style={{ padding: "8px 14px", fontSize: 13 }}
              disabled={!selectedStatus || selectedStatus === candidate.currentState || statusUpdating}
              onClick={() => setShowStatusConfirm(true)}
            >
              {statusUpdating ? "Actualizando…" : "Cambiar estado"}
            </button>
          </div>
        ) : candidate.currentState === "REJECTED" || candidate.currentState === "HIRED" ? (
          <p className="candidate-detail-empty">Estado final. No se pueden realizar más transiciones.</p>
        ) : (
          <p className="candidate-detail-empty">Sin estado asignado.</p>
        )}

        {statusHistory.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>Historial de cambios</h4>
            <table className="candidate-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Estado anterior</th>
                  <th>Nuevo estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {statusHistory.map((h) => (
                  <tr key={h.id}>
                    <td>{h.previousState ? stateLabel(h.previousState) : "-"}</td>
                    <td><span className={stateClass(h.newState)}>{stateLabel(h.newState)}</span></td>
                    <td className="candidate-cell-date">{h.changedAt ? formatDate(h.changedAt) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

      <ConfirmModal
        open={showStatusConfirm}
        title="Cambiar estado"
        message={`¿Estás seguro de cambiar el estado a "${selectedStatus ? stateLabel(selectedStatus) : ""}"?`}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        loading={statusUpdating}
        onConfirm={handleStatusChange}
        onCancel={() => setShowStatusConfirm(false)}
      />
    </div>
  );
}
