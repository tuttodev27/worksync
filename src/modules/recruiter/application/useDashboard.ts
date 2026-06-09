import { useState, useEffect, useCallback } from "react";
import { candidateRepository } from "../infrastructure/CandidateApiRepository";
import type { RecruiterDashboardStats } from "../domain/models/Dashboard";

const EMPTY_STATS: RecruiterDashboardStats = {
  total: 0,
  disponibles: 0,
  enProceso: 0,
  contratadosEsteMes: 0,
};

const IN_PROCESS_STATES = new Set(["IN_REVIEW", "INTERVIEW", "SHORTLIST"]);

function isThisMonth(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function computeStats(candidates: { currentState?: string; createdAt: string }[]): RecruiterDashboardStats {
  let disponibles = 0;
  let enProceso = 0;
  let contratadosEsteMes = 0;

  for (const c of candidates) {
    const state = c.currentState;
    if (state === "NEW") disponibles++;
    else if (state && IN_PROCESS_STATES.has(state)) enProceso++;
    else if (state === "HIRED" && isThisMonth(c.createdAt)) contratadosEsteMes++;
  }

  return {
    total: candidates.length,
    disponibles,
    enProceso,
    contratadosEsteMes,
  };
}

export function useDashboard() {
  const [stats, setStats] = useState<RecruiterDashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await candidateRepository.list({ active: true, size: 1000 });
      setStats(computeStats(page.content));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar las estadísticas.";
      setError(message);
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}
