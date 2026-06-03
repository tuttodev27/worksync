import { useCallback, useEffect, useState } from "react";
import type { Menu } from "../domain/models/Menu";
import type { MenuRepository } from "../domain/ports/MenuRepository";
import { menuRepository } from "../infrastructure/MenuApiRepository";

interface UseMenuListReturn {
  menus: Menu[];
  loading: boolean;
  error: string;
  activeFilter?: boolean;
  setActiveFilter: (value: boolean | undefined) => void;
  refresh: () => Promise<void>;
}

export function useMenuList(
  repository: MenuRepository = menuRepository
): UseMenuListReturn {
  const [menus, setMenus] = useState<Menu[]>([]);
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
      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar menús");
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [repository, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    menus,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    refresh: load,
  };
}
