import { useState } from "react";
import { Link } from "react-router-dom";
import { useMenuList } from "../admin/application/useMenuList";
import { useMenuDelete } from "../admin/application/useMenuDelete";
import "./AdminPages.css";
import "./MenusPage.css";

const STATUS_OPTIONS: Array<{ value: "" | "true" | "false"; label: string }> = [
  { value: "", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

export default function MenusPage() {
  const {
    menus,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    refresh,
  } = useMenuList();
  const { deleteMenu } = useMenuDelete();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleFilterChange = (value: "" | "true" | "false") => {
    if (value === "") {
      setActiveFilter(undefined);
    } else {
      setActiveFilter(value === "true");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este menú?")) return;
    setDeletingId(id);
    try {
      await deleteMenu(id);
      await refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page menus-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Menús</h2>

        <div className="menus-actions">
          <div className="select-wrapper menus-filter-wrapper">
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
              className="menus-filter"
              aria-label="Filtrar por estado"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Link to="/admin/menu/new" className="admin-btn-primary">
            + Crear menú
          </Link>
        </div>
      </div>

      {error && <div className="form-error menus-error">{error}</div>}

      <div className="menus-table-wrapper">
        <table className="menus-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Ruta</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="menus-empty">
                  Cargando menús…
                </td>
              </tr>
            ) : menus.length === 0 ? (
              <tr>
                <td colSpan={5} className="menus-empty">
                  No hay menús registrados aún.
                </td>
              </tr>
            ) : (
              menus.map((menu) => (
                <tr key={menu.id}>
                  <td className="menus-cell-id">{menu.id}</td>
                  <td className="menus-cell-title">{menu.title}</td>
                  <td className="menus-cell-path">{menu.path}</td>
                  <td>
                    <span
                      className={
                        menu.active
                          ? "menus-status menus-status-active"
                          : "menus-status menus-status-inactive"
                      }
                    >
                      <span className="menus-status-dot" />
                      {menu.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="menus-row-actions">
                    <button
                      type="button"
                      className="menus-delete-btn"
                      onClick={() => handleDelete(menu.id)}
                      disabled={deletingId === menu.id}
                    >
                      {deletingId === menu.id ? "Eliminando…" : "Eliminar"}
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
