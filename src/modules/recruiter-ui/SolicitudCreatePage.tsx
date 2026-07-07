/**
 * SolicitudCreatePage
 * Formulario de oferta + matcher live de candidatos + gestion de asignados.
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSolicitud } from "../recruiter/application/useSolicitud";
import { useCandidateMatcher } from "../recruiter/application/useCandidateMatcher";
import { candidateRepository } from "../recruiter/infrastructure/CandidateApiRepository";
import { SOLICITUD_STATUS } from "../../shared/constants/forms";
import type { Candidate } from "../../shared/types/forms";
import "./SolicitudCreatePage.css";

function scoreLabel(score: number): string {
  if (score >= 0.99) return "Match perfecto";
  if (score >= 0.66) return "Buen match";
  if (score >= 0.34) return "Match parcial";
  return "Match bajo";
}

function scoreClass(score: number): string {
  if (score >= 0.99) return "match-pill match-pill--perfect";
  if (score >= 0.66) return "match-pill match-pill--good";
  if (score >= 0.34) return "match-pill match-pill--partial";
  return "match-pill match-pill--low";
}

function toLegacyCandidate(api: { id: number; firstName: string; lastName: string; email: string; phone?: string }): Candidate {
  return {
    id: String(api.id),
    firstName: api.firstName,
    lastName: api.lastName,
    email: api.email,
    phone: api.phone ?? "",
    linkedin: "",
    experience: "",
    education: "",
    skills: "",
    status: "",
    notes: "",
    technicalSkills: "",
    softSkills: "",
    language: "",
    languageLevel: "",
    createdAt: "",
  };
}

export default function SolicitudCreatePage() {
  const { id } = useParams<{ id: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    candidateRepository.list({ size: 100 }).then((page) => {
      setCandidates(page.content.map(toLegacyCandidate));
    }).catch(() => {
      setCandidates([]);
    });
  }, []);
  const {
    form,
    error,
    loading,
    isEdit,
    isLocked,
    assignedCandidates,
    handleChange,
    handleSubmit,
    handleCancel,
    assignCandidate,
    unassignCandidate,
  } = useSolicitud({ solicitudId: id, candidates });

  const { matches, hasInput } = useCandidateMatcher(
    candidates,
    form.requiredTechnicalSkills,
    {
      excludeIds: assignedCandidates.map((c) => c.id),
    },
  );

  const totalCandidates = candidates.length;

  return (
    <div className="sol-create-page">
      <div className="sol-create-header">
        <h2 className="sol-create-title">
          {isEdit ? "Editar solicitud" : "Nueva solicitud"}
        </h2>
        <p className="sol-create-subtitle">
          {isEdit
            ? "Modifica el estado o los candidatos asignados a esta oferta."
            : "Registra una nueva oferta de trabajo y asigna candidatos que coincidan con el perfil buscado."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="sol-create-layout">
        <div className="sol-create-form-col">
          {isLocked && (
            <div className="sol-locked-banner" role="alert">
              Esta solicitud tiene candidatos asignados. El titulo, la
              descripcion y las skills requeridas estan bloqueadas para
              preservar la integridad del match. Solo puedes cambiar el estado
              y los candidatos asignados.
            </div>
          )}

          {error && <div className="sol-error">{error}</div>}

          <section className="sol-section">
            <h3 className="sol-section-title">Datos de la oferta</h3>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label htmlFor="title">Titulo de la vacante</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="Frontend Developer SSR"
                  value={form.title}
                  onChange={handleChange}
                  disabled={isLocked}
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="description">Descripcion</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input"
                  placeholder="Resumen del rol, responsabilidades y requisitos generales."
                  value={form.description}
                  onChange={handleChange}
                  disabled={isLocked}
                  rows={3}
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="requiredTechnicalSkills">
                  Skills tecnicas requeridas
                </label>
                <textarea
                  id="requiredTechnicalSkills"
                  name="requiredTechnicalSkills"
                  className="form-input"
                  placeholder="react, typescript, node (separadas por coma)"
                  value={form.requiredTechnicalSkills}
                  onChange={handleChange}
                  disabled={isLocked}
                  rows={2}
                  required
                />
                <small className="sol-hint">
                  Separa las skills con comas. El filtro se aplica mientras
                  escribes.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="requiredExperience">Experiencia requerida</label>
                <input
                  id="requiredExperience"
                  name="requiredExperience"
                  type="text"
                  className="form-input"
                  placeholder="2+ anos"
                  value={form.requiredExperience}
                  onChange={handleChange}
                  disabled={isLocked}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  name="status"
                  className="form-input"
                  value={form.status}
                  onChange={handleChange}
                >
                  {SOLICITUD_STATUS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

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
              {loading
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Crear solicitud"}
            </button>
          </div>
        </div>

        <aside className="sol-create-side-col">
          <section className="sol-section">
            <h3 className="sol-section-title">Candidatos asignados</h3>
            {assignedCandidates.length === 0 ? (
              <p className="sol-empty-mini">
                Aun no hay candidatos asignados a esta solicitud.
              </p>
            ) : (
              <ul className="sol-assigned-list">
                {assignedCandidates.map((c) => (
                  <li key={c.id} className="sol-assigned-item">
                    <div className="sol-assigned-info">
                      <span className="sol-assigned-name">
                        {c.firstName} {c.lastName}
                      </span>
                      <span className="sol-assigned-meta">
                        {c.email || "sin email"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="sol-link-danger"
                      onClick={() => unassignCandidate(c.id)}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="sol-section">
            <h3 className="sol-section-title">Candidatos compatibles</h3>
            {!hasInput ? (
              <p className="sol-empty-mini">
                Escribe las skills requeridas para ver candidatos compatibles.
              </p>
            ) : matches.length === 0 ? (
              <p className="sol-empty-mini">
                {totalCandidates === 0
                  ? "Aun no hay candidatos registrados en el sistema."
                  : "Ningun candidato del registro coincide con esas skills."}
              </p>
            ) : (
              <ul className="sol-matches-list">
                {matches.map((m) => {
                  const fullName =
                    `${m.candidate.firstName} ${m.candidate.lastName}`.trim() ||
                    m.candidate.email ||
                    "Candidato sin nombre";
                  return (
                    <li key={m.candidate.id} className="sol-match-item">
                      <div className="sol-match-head">
                        <span className="sol-match-name">{fullName}</span>
                        <span className={scoreClass(m.score)}>
                          {Math.round(m.score * 100)}% &middot;{" "}
                          {scoreLabel(m.score)}
                        </span>
                      </div>
                      <div className="sol-match-skills">
                        {m.matchedSkills.length > 0 && (
                          <span className="sol-match-pos">
                            {m.matchedSkills.join(", ")}
                          </span>
                        )}
                        {m.missingSkills.length > 0 && (
                          <span className="sol-match-neg">
                            {m.missingSkills.length > 0 && " · "}
                            faltan: {m.missingSkills.join(", ")}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="sol-link-action"
                        onClick={() => assignCandidate(m.candidate.id)}
                      >
                        Asignar
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </form>
    </div>
  );
}
