import { useCallback, useState } from "react";
import type { ModuleRepository } from "../domain/ports/ModuleRepository";
import { moduleRepository } from "../infrastructure/ModuleApiRepository";

interface UseModuleDeleteReturn {
  deleteModule: (id: number) => Promise<void>;
  loading: boolean;
  error: string;
}

export function useModuleDelete(
  repository: ModuleRepository = moduleRepository
): UseModuleDeleteReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const deleteModule = useCallback(
    async (id: number) => {
      setLoading(true);
      setError("");
      try {
        await repository.delete(id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo eliminar el módulo"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  return { deleteModule, loading, error };
}
