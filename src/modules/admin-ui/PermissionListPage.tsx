import { useState } from "react";
import { Link } from "react-router-dom";
import { usePermissionList } from "../admin/application/usePermissionList";
import { usePermissionDelete } from "../admin/application/usePermissionDelete";
import "./AdminPages.css";
import "./PermissionListPage.css";

const STATUS_OPTIONS: Array<{ value: "" | "true" | "false"; label: string }> = [
  { value: "", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

export default function PermissionListPage() {
  const {
    permissions,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    refresh,
  } = usePermissionList();
  const { deletePermission } = usePermissionDelete();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleFilterChange = (value: "" | "true" | "false") => {
    if (value === "") {
      setActiveFilter(undefined);
    } else {
      setActiveFilter(value === "true");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este permiso?")) return;
    setDeletingId(id);
    try {
      await deletePermission(id);
      await refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page permissions-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Permisos</h2>

        <div className="permissions-actions">
          <div className="select-wrapper permissions-filter-wrapper">
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
              className="permissions-filter"
              aria-label="Filtrar por estado"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Link to="/admin/permissions/create" className="admin-btn-primary">
            + Crear permiso
          </Link>
        </div>
      </div>

      {error && <div className="form-error permissions-error">{error}</div>}

      <div className="permissions-table-wrapper">
        <table className="permissions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>Módulo</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="permissions-empty">
                  Cargando permisos…
                </td>
              </tr>
            ) : permissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="permissions-empty">
                  No hay permisos registrados aún.
                </td>
              </tr>
            ) : (
              permissions.map((perm) => (
                <tr key={perm.id}>
                  <td className="permissions-cell-id">{perm.id}</td>
                  <td className="permissions-cell-code">{perm.code}</td>
                  <td className="permissions-cell-description">
                    {perm.description || "—"}
                  </td>
                  <td className="permissions-cell-module">{perm.moduleId}</td>
                  <td>
                    <span
                      className={
                        perm.active
                          ? "permissions-status permissions-status-active"
                          : "permissions-status permissions-status-inactive"
                      }
                    >
                      <span className="permissions-status-dot" />
                      {perm.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="permissions-row-actions">
                    <button
                      type="button"
                      className="permissions-delete-btn"
                      onClick={() => handleDelete(perm.id)}
                      disabled={deletingId === perm.id}
                    >
                      {deletingId === perm.id ? "Eliminando…" : "Eliminar"}
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
