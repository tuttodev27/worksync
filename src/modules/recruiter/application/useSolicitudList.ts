/**
 * Hook para listar/eliminar solicitudes - Application Layer
 * SRP: Consume SolicitudApiRepository para leer y eliminar solicitudes.
 */

import { useEffect, useState, useCallback } from "react";
import type { Solicitud } from "../../../shared/types/forms";
import { solicitudRepository } from "../infrastructure/SolicitudApiRepository";

function toSolicitud(api: { id: number; title: string; description: string; requiredTechnicalSkills: string; requiredExperience: string; status: string; createdAt: string; assignedCandidateIds: number[] }): Solicitud {
  return {
    id: String(api.id),
    title: api.title,
    description: api.description,
    requiredTechnicalSkills: api.requiredTechnicalSkills,
    requiredExperience: api.requiredExperience,
    status: api.status as Solicitud["status"],
    createdAt: api.createdAt,
    assignedCandidateIds: api.assignedCandidateIds.map(String),
  };
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
    return solicitudRepository.list({ size: 100 }).then((page) => {
      setSolicitudes(page.content.map(toSolicitud));
    }).catch(() => {
      setSolicitudes([]);
    });
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const remove = useCallback((id: string) => {
    solicitudRepository.delete(Number(id)).then(() => {
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    }).catch(() => {});
  }, []);

  return { solicitudes, isLoading, refresh, remove };
}
