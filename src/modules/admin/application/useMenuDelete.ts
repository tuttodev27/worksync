import { useCallback, useState } from "react";
import type { MenuRepository } from "../domain/ports/MenuRepository";
import { menuRepository } from "../infrastructure/MenuApiRepository";

interface UseMenuDeleteReturn {
  deleteMenu: (id: number) => Promise<void>;
  loading: boolean;
  error: string;
}

export function useMenuDelete(
  repository: MenuRepository = menuRepository
): UseMenuDeleteReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const deleteMenu = useCallback(
    async (id: number) => {
      setLoading(true);
      setError("");
      try {
        await repository.delete(id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo eliminar el menú"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  return { deleteMenu, loading, error };
}
