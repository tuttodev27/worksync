import { useState } from "react";
import { Link } from "react-router-dom";
import { useModuleList } from "../admin/application/useModuleList";
import { useModuleDelete } from "../admin/application/useModuleDelete";
import "./AdminPages.css";
import "./ModuloPage.css";

const STATUS_OPTIONS: Array<{ value: "" | "true" | "false"; label: string }> = [
  { value: "", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

export default function ModuloPage() {
  const {
    modules,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    refresh,
  } = useModuleList();
  const { deleteModule } = useModuleDelete();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleFilterChange = (value: "" | "true" | "false") => {
    if (value === "") {
      setActiveFilter(undefined);
    } else {
      setActiveFilter(value === "true");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este módulo?")) return;
    setDeletingId(id);
    try {
      await deleteModule(id);
      await refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page modules-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Módulos</h2>

        <div className="modules-actions">
          <div className="select-wrapper modules-filter-wrapper">
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
              className="modules-filter"
              aria-label="Filtrar por estado"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Link to="/admin/modules/new" className="admin-btn-primary">
            + Crear módulo
          </Link>
        </div>
      </div>

      {error && <div className="form-error modules-error">{error}</div>}

      <div className="modules-table-wrapper">
        <table className="modules-table">
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
                <td colSpan={5} className="modules-empty">
                  Cargando módulos…
                </td>
              </tr>
            ) : modules.length === 0 ? (
              <tr>
                <td colSpan={5} className="modules-empty">
                  No hay módulos registrados aún.
                </td>
              </tr>
            ) : (
              modules.map((mod) => (
                <tr key={mod.id}>
                  <td className="modules-cell-id">{mod.id}</td>
                  <td className="modules-cell-name">{mod.name}</td>
                  <td className="modules-cell-description">
                    {mod.description || "—"}
                  </td>
                  <td>
                    <span
                      className={
                        mod.active
                          ? "modules-status modules-status-active"
                          : "modules-status modules-status-inactive"
                      }
                    >
                      <span className="modules-status-dot" />
                      {mod.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="modules-row-actions">
                    <button
                      type="button"
                      className="modules-delete-btn"
                      onClick={() => handleDelete(mod.id)}
                      disabled={deletingId === mod.id}
                    >
                      {deletingId === mod.id ? "Eliminando…" : "Eliminar"}
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
