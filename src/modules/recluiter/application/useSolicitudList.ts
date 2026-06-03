/**
 * Hook para listar/eliminar solicitudes - Application Layer
 * SRP: Solo lee y elimina solicitudes persistidas.
 */

import { useEffect, useState, useCallback } from "react";
import type { Solicitud } from "../../../shared/types/forms";
import { STORAGE_KEYS } from "../../../shared/constants/forms";

function readSolicitudes(): Solicitud[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.solicitudes);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Solicitud[]) : [];
  } catch {
    return [];
  }
}

function writeSolicitudes(list: Solicitud[]): void {
  localStorage.setItem(STORAGE_KEYS.solicitudes, JSON.stringify(list));
}

export interface UseSolicitudListReturn {
  solicitudes: Solicitud[];
  isLoading: boolean;
  refresh: () => void;
  remove: (id: string) => void;
}

export function useSolicitudList(): UseSolicitudListReturn {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(() => {
    setSolicitudes(readSolicitudes());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoading(false);
  }, [refresh]);

  const remove = useCallback((id: string) => {
    const current = readSolicitudes();
    const next = current.filter((s) => s.id !== id);
    writeSolicitudes(next);
    setSolicitudes(next);
  }, []);

  return { solicitudes, isLoading, refresh, remove };
}
