export interface RecruiterDashboardStats {
  total: number;
  disponibles: number;
  enProceso: number;
  contratadosEsteMes: number;
}

export interface RecruiterDashboardSnapshot {
  stats: RecruiterDashboardStats;
  error: string;
}
