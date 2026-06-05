/**
 * UsersListPage - Listado de usuarios desde el backend
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserList } from "../../modules/admin/application/useUserList";
import { useUserDelete } from "../../modules/admin/application/useUserDelete";
import "./AdminPages.css";
import "./UsersListPage.css";

const STATUS_OPTIONS: Array<{ value: "" | "true" | "false"; label: string }> = [
  { value: "", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

export default function UsersListPage() {
  const { users, loading, error, activeFilter, setActiveFilter, refresh } =
    useUserList();
  const { deleteUser } = useUserDelete();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleFilterChange = (value: "" | "true" | "false") => {
    if (value === "") {
      setActiveFilter(undefined);
    } else {
      setActiveFilter(value === "true");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      await refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page users-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Usuarios</h2>

        <div className="users-actions">
          <div className="select-wrapper users-filter-wrapper">
            <select
              value={
                activeFilter === undefined ? "" : activeFilter ? "true" : "false"
              }
              onChange={(e) =>
                handleFilterChange(e.target.value as "" | "true" | "false")
              }
              className="users-filter"
              aria-label="Filtrar por estado"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Link to="/admin/users/create" className="admin-btn-primary">
            + Crear usuario
          </Link>
        </div>
      </div>

      {error && <div className="form-error users-error">{error}</div>}

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Roles</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="users-empty">
                  Cargando usuarios…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="users-empty">
                  No hay usuarios para mostrar.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="users-cell-id">{user.id}</td>
                  <td className="users-cell-name">
                    {user.name ?? ""} {user.lastName ?? ""}
                  </td>
                  <td className="users-cell-email">{user.email ?? ""}</td>
                  <td className="users-cell-phone">
                    {user.countryCode ?? ""} {user.phone ?? ""}
                  </td>
                  <td>
                    <div className="users-roles">
                      {Array.isArray(user.roles) && user.roles.length === 0 ? (
                        <span className="users-roles-empty">—</span>
                      ) : Array.isArray(user.roles) ? (
                        user.roles.map((role) => (
                          <span key={role} className="users-role-chip">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="users-roles-empty">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        user.active
                          ? "users-status users-status-active"
                          : "users-status users-status-inactive"
                      }
                    >
                      <span className="users-status-dot" />
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="users-row-actions">
                    <button
                      type="button"
                      className="users-delete-btn"
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingId === user.id}
                    >
                      {deletingId === user.id ? "Eliminando…" : "Eliminar"}
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
