import { useState } from "react";
import { Link } from "react-router-dom";
import { useCandidateApiList } from "../recruiter/application/useCandidateApiList";
import { useCandidateDeactivate } from "../recruiter/application/useCandidateDeactivate";
import { useCandidateStatuses } from "../recruiter/application/useCandidateStatuses";
import { useCatalogs } from "../recruiter/application/useCatalogs";
import { candidateRepository } from "../recruiter/infrastructure/CandidateApiRepository";
import type { AttachmentResponse } from "../recruiter/domain/types";
import ConfirmModal from "../shared/ui/components/ConfirmModal";
import "./CandidateListPage.css";

function stateClass(state?: string): string {
  const base = "candidate-status";
  if (!state) return base;
  return `${base} ${base}--${state.toLowerCase()}`;
}

export default function CandidateListPage() {
  const {
    candidates,
    loading,
    error,
    total,
    page,
    totalPages,
    search,
    setSearch,
    active,
    setActive,
    setPage,
    refresh,
  } = useCandidateApiList(10);
  const { statusLabel } = useCandidateStatuses();
  const { catalogs } = useCatalogs();
  const { deactivateCandidate } = useCandidateDeactivate();

  const [cvId, setCvId] = useState<number | null>(null);
  const [cvName, setCvName] = useState("");
  const [cvAttachments, setCvAttachments] = useState<AttachmentResponse[]>([]);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvContentUrl, setCvContentUrl] = useState<string | null>(null);
  const [cvContentLoading, setCvContentLoading] = useState(false);
  const [cvContentError, setCvContentError] = useState("");
  const [activeAttachmentId, setActiveAttachmentId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  async function loadCvContent(candidateId: number, attachment: AttachmentResponse) {
    setActiveAttachmentId(attachment.id);
    setCvContentLoading(true);
    setCvContentError("");
    if (cvContentUrl) {
      URL.revokeObjectURL(cvContentUrl);
      setCvContentUrl(null);
    }
    try {
      const blob = await candidateRepository.getAttachmentContent(candidateId, attachment.id);
      setCvContentUrl(URL.createObjectURL(blob));
    } catch {
      setCvContentError("No se pudo cargar el documento.");
    } finally {
      setCvContentLoading(false);
    }
  }

  async function handleViewCv(candidateId: number, name: string) {
    setCvId(candidateId);
    setCvName(name);
    setCvLoading(true);
    setCvContentUrl(null);
    setActiveAttachmentId(null);
    setCvContentError("");
    try {
      const attachments = await candidateRepository.listAttachments(candidateId);
      setCvAttachments(attachments);
      if (attachments.length > 0) {
        await loadCvContent(candidateId, attachments[0]);
      }
    } catch {
      setCvAttachments([]);
    } finally {
      setCvLoading(false);
    }
  }

  function handleCloseCv() {
    if (cvContentUrl) {
      URL.revokeObjectURL(cvContentUrl);
    }
    setCvId(null);
    setCvName("");
    setCvAttachments([]);
    setCvContentUrl(null);
    setActiveAttachmentId(null);
    setCvContentError("");
  }

  async function handleDeactivate() {
    if (confirmId === null) return;
    const id = confirmId;
    setDeactivatingId(id);
    setConfirmId(null);
    try {
      await deactivateCandidate(id);
      await refresh();
    } finally {
      setDeactivatingId(null);
    }
  }

  const confirmCandidate = candidates.find((c) => c.id === confirmId);
  const confirmName = confirmCandidate
    ? `${confirmCandidate.firstName} ${confirmCandidate.lastName}`
    : "";

  return (
    <div className="candidate-list-page">
      <div className="candidate-list-header">
        <div>
          <h2 className="candidate-list-title">Candidatos</h2>
          <p className="candidate-list-subtitle">
            Fichas de candidatos registrados en el sistema ({total}).
          </p>
        </div>
        <Link to="/recruiter/candidates/new">
          <button className="candidate-btn-primary">+ Nuevo candidato</button>
        </Link>
      </div>

      <div className="candidate-list-toolbar">
        <div className="candidate-list-filters">
          <input
            type="text"
            className="candidate-search-input"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="candidate-filter-select"
            aria-label="Filtrar por estado"
            value={active === null ? "all" : active ? "true" : "false"}
            onChange={(e) => {
              const value = e.target.value;
              setActive(value === "all" ? null : value === "true");
            }}
          >
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      {error && <div className="candidate-list-error">{error}</div>}

      {loading ? (
        <div className="candidate-list-empty">Cargando candidatos...</div>
      ) : candidates.length === 0 ? (
        <div className="candidate-list-empty">
          <p>No hay candidatos registrados.</p>
          <p className="candidate-list-hint">
            Crea un nuevo candidato o ajusta los filtros de búsqueda.
          </p>
        </div>
      ) : (
        <>
          <div className="candidate-table-wrapper">
            <table className="candidate-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Último cargo</th>
                  <th>Habilidades técnicas</th>
                  <th>Idiomas</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id}>
                    <td className="candidate-cell-name">
                      {c.firstName} {c.lastName}
                    </td>
                    <td>
                      <span className={stateClass(c.currentState)}>
                        {statusLabel(c.currentState)}
                      </span>
                    </td>
                    <td>{c.professionalProfile?.latestPosition || "-"}</td>
                    <td>{c.hardSkills?.map((s) => `Skill #${s.hardSkillId}`).join(", ") || "-"}</td>
                    <td>
                      {c.languages && c.languages.length > 0
                        ? c.languages.map((l) => {
                            const lang = catalogs?.languages.find((cl) => cl.id === l.languageId);
                            const level = catalogs?.languageLevels.find((cl) => cl.id === l.languageLevelId);
                            return `${lang?.name ?? `#${l.languageId}`}${level ? ` (${level.code.toUpperCase()})` : ""}`;
                          }).join(", ")
                        : "-"}
                    </td>
                    <td className="candidate-cell-actions" style={{ whiteSpace: "nowrap" }}>
                      <Link
                        to={`/recruiter/candidates/${c.id}`}
                        className="candidate-link-action"
                        style={{ marginRight: 12 }}
                      >
                        Ver ficha
                      </Link>
                      <button
                        className="candidate-link-action"
                        onClick={() => handleViewCv(c.id, `${c.firstName} ${c.lastName}`)}
                      >
                        Ver CV
                      </button>
                      {c.active !== false && (
                        <button
                          className="candidate-link-action candidate-link-action--danger"
                          style={{ marginLeft: 12 }}
                          onClick={() => setConfirmId(c.id)}
                          disabled={deactivatingId === c.id}
                        >
                          {deactivatingId === c.id ? "Desactivando…" : "Desactivar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="candidate-pagination">
              <button
                className="candidate-page-btn"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <span className="candidate-page-info">
                Página {page + 1} de {totalPages}
              </span>
              <button
                className="candidate-page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {cvId !== null && (
        <div className="cv-modal-overlay" onClick={handleCloseCv}>
          <div className="cv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cv-modal-header">
              <h3>CV de {cvName}</h3>
              <button className="cv-modal-close" onClick={handleCloseCv}>
                &times;
              </button>
            </div>
            <div className="cv-modal-body">
              {cvLoading ? (
                <p className="candidate-list-empty">Cargando documentos...</p>
              ) : cvAttachments.length === 0 ? (
                <p className="candidate-list-empty">Sin documentos adjuntos.</p>
              ) : (
                <>
                  <ul className="cv-attachment-list">
                    {cvAttachments.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          className={`cv-attachment-button ${a.id === activeAttachmentId ? "cv-attachment-button--active" : ""}`}
                          onClick={() => loadCvContent(cvId as number, a)}
                          disabled={cvContentLoading}
                        >
                          {a.fileName}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="cv-pdf-container">
                    {cvContentLoading ? (
                      <p className="candidate-list-empty">Cargando documento...</p>
                    ) : cvContentError ? (
                      <p className="candidate-list-error">{cvContentError}</p>
                    ) : cvContentUrl ? (
                      <iframe
                        src={cvContentUrl}
                        title="Documento CV"
                        className="cv-pdf-iframe"
                      />
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmId !== null}
        title="Desactivar postulante"
        message={
          confirmName
            ? `¿Estás seguro de desactivar a "${confirmName}"? El postulante quedará inactivo y se ocultará del flujo activo.`
            : "¿Estás seguro de desactivar este postulante?"
        }
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deactivatingId === confirmId}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
