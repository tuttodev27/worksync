import { useState } from "react";
import { Link } from "react-router-dom";
import { useRoleList } from "../admin/application/useRoleList";
import { useRoleDelete } from "../admin/application/useRoleDelete";
import "./AdminPages.css";
import "./RolesPage.css";

const STATUS_OPTIONS: Array<{ value: "" | "true" | "false"; label: string }> = [
  { value: "", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

export default function RolesPage() {
  const {
    roles,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    refresh,
  } = useRoleList();
  const { deleteRole } = useRoleDelete();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleFilterChange = (value: "" | "true" | "false") => {
    if (value === "") {
      setActiveFilter(undefined);
    } else {
      setActiveFilter(value === "true");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este rol?")) return;
    setDeletingId(id);
    try {
      await deleteRole(id);
      await refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page roles-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Roles</h2>

        <div className="roles-actions">
          <div className="select-wrapper roles-filter-wrapper">
            <select
              value={
                activeFilter === undefined
                  ? ""
                  : activeFilter
                  ? "true"
                  : "false"
              }
              onChange={(e) =>
                handleFilterChange(
                  e.target.value as "" | "true" | "false"
                )
              }
              className="roles-filter"
              aria-label="Filtrar por estado"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Link to="/admin/roles/new" className="admin-btn-primary">
            + Crear rol
          </Link>
        </div>
      </div>

      {error && <div className="form-error roles-error">{error}</div>}

      <div className="roles-table-wrapper">
        <table className="roles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="roles-empty">
                  Cargando roles…
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="roles-empty">
                  No hay roles registrados aún.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id}>
                  <td className="roles-cell-id">{role.id}</td>
                  <td className="roles-cell-name">{role.name}</td>
                  <td className="roles-cell-description">
                    {role.description || "—"}
                  </td>
                  <td>
                    <span
                      className={
                        role.active
                          ? "roles-status roles-status-active"
                          : "roles-status roles-status-inactive"
                      }
                    >
                      <span className="roles-status-dot" />
                      {role.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="roles-row-actions">
                    <button
                      type="button"
                      className="roles-delete-btn"
                      onClick={() => handleDelete(role.id)}
                      disabled={deletingId === role.id}
                    >
                      {deletingId === role.id ? "Eliminando…" : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
