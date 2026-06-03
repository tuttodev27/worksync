import { Link } from "react-router-dom";
import { useCandidateApiList } from "../recluiter/application/useCandidateApiList";
import "./CandidateListPage.css";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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
    setPage,
    refresh,
  } = useCandidateApiList(10);

  return (
    <div className="candidate-list-page">
      <div className="candidate-list-header">
        <div>
          <h2 className="candidate-list-title">Candidatos</h2>
          <p className="candidate-list-subtitle">
            Fichas de candidatos registrados en el sistema ({total}).
          </p>
        </div>
        <Link to="/recluiter/candidates/new">
          <button className="candidate-btn-primary">+ Nuevo candidato</button>
        </Link>
      </div>

      <div className="candidate-list-toolbar">
        <input
          type="text"
          className="candidate-search-input"
          placeholder="Buscar por nombre, email o documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Documento</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id}>
                    <td className="candidate-cell-name">
                      {c.firstName} {c.lastName}
                    </td>
                    <td>{c.email}</td>
                    <td className="candidate-cell-phone">{c.phone || "-"}</td>
                    <td className="candidate-cell-doc">
                      {c.identityDocument || "-"}
                    </td>
                    <td>
                      <span className={stateClass(c.currentState)}>
                        {stateLabel(c.currentState)}
                      </span>
                    </td>
                    <td className="candidate-cell-date">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="candidate-cell-actions">
                      <Link
                        to={`/recluiter/candidates/${c.id}`}
                        className="candidate-link-action"
                      >
                        Ver ficha
                      </Link>
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
    </div>
  );
}
