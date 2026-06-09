/**
 * SolicitudListPage
 * Listado de solicitudes con acceso a crear/editar/eliminar.
 */

import { Link } from "react-router-dom";
import { useSolicitudList } from "../recruiter/application/useSolicitudList";
import { SOLICITUD_STATUS } from "../../shared/constants/forms";
import "./SolicitudListPage.css";

const STATUS_LABEL = new Map<string, string>(
  SOLICITUD_STATUS.map((s) => [s.value, s.label]),
);

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

export default function SolicitudListPage() {
  const { solicitudes, isLoading, remove } = useSolicitudList();

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Eliminar la solicitud "${title}"?`)) {
      remove(id);
    }
  };

  return (
    <div className="solicitud-list-page">
      <div className="solicitud-list-header">
        <div>
          <h2 className="solicitud-list-title">Solicitudes</h2>
          <p className="solicitud-list-subtitle">
            Gestiona las ofertas de trabajo y los candidatos asignados.
          </p>
        </div>
        <Link to="/recruiter/solicitudes/new">
          <button className="solicitud-btn-primary">+ Nueva solicitud</button>
        </Link>
      </div>

      {isLoading ? (
        <div className="solicitud-list-empty">Cargando...</div>
      ) : solicitudes.length === 0 ? (
        <div className="solicitud-list-empty">
          <p>No hay solicitudes registradas aun.</p>
          <p className="solicitud-list-hint">
            Crea una nueva para empezar a buscar candidatos.
          </p>
        </div>
      ) : (
        <div className="solicitud-table-wrapper">
          <table className="solicitud-table">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Estado</th>
                <th>Candidatos</th>
                <th>Skills requeridas</th>
                <th>Creada</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => {
                const status = STATUS_LABEL.get(s.status) ?? s.status;
                return (
                  <tr key={s.id}>
                    <td className="solicitud-cell-title">{s.title}</td>
                    <td>
                      <span
                        className={`solicitud-status solicitud-status--${s.status}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="solicitud-cell-num">
                      {s.assignedCandidateIds.length}
                    </td>
                    <td className="solicitud-cell-skills">
                      {s.requiredTechnicalSkills || "-"}
                    </td>
                    <td className="solicitud-cell-date">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="solicitud-cell-actions">
                      <Link
                        to={`/recruiter/solicitudes/${s.id}`}
                        className="solicitud-link-action"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="solicitud-link-action solicitud-link-danger"
                        onClick={() => handleDelete(s.id, s.title)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
