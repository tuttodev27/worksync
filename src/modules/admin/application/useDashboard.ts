/**
 * Hook para cargar el snapshot del dashboard
 * SRP: Solo orquesta la carga de datos agregados
 */

import { useCallback, useEffect, useState } from "react";
import type { DashboardSnapshot } from "../domain/models/Dashboard";
import { dashboardRepository } from "../infrastructure/DashboardApiRepository";

interface UseDashboardReturn {
  snapshot: DashboardSnapshot;
  loading: boolean;
  refresh: () => Promise<void>;
}

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  users: { total: 0, active: 0 },
  roles: { total: 0, active: 0 },
  permissions: { total: 0, active: 0 },
  modules: { total: 0, active: 0 },
  menus: { total: 0, active: 0 },
  errors: {
    users: "",
    roles: "",
    permissions: "",
    modules: "",
    menus: "",
  },
};

export function useDashboard(): UseDashboardReturn {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dashboardRepository.fetchSnapshot();
      setSnapshot(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    snapshot: snapshot ?? EMPTY_SNAPSHOT,
    loading,
    refresh,
  };
}
