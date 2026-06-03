import { useCallback, useEffect, useState } from "react";
import type { Module } from "../domain/models/Module";
import type { ModuleRepository } from "../domain/ports/ModuleRepository";
import { moduleRepository } from "../infrastructure/ModuleApiRepository";

interface UseModuleListReturn {
  modules: Module[];
  loading: boolean;
  error: string;
  activeFilter?: boolean;
  setActiveFilter: (value: boolean | undefined) => void;
  refresh: () => Promise<void>;
}

export function useModuleList(
  repository: ModuleRepository = moduleRepository
): UseModuleListReturn {
  const [modules, setModules] = useState<Module[]>([]);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await repository.list(activeFilter);
      setModules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar módulos");
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [repository, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    modules,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    refresh: load,
  };
}
