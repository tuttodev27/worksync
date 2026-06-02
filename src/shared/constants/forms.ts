/**
 * Constantes compartidas para formularios
 * DRY Principle - Evitar duplicación
 */

// User Types
export const USER_TYPES = [
  { value: "", label: "Selecciona un tipo" },
  { value: "reclutador", label: "Reclutador" },
  { value: "admin", label: "Administrador" },
  { value: "postulante", label: "Postulante" },
] as const;

export type UserType = typeof USER_TYPES[number]["value"];

// Country Codes
export const COUNTRY_CODES = ["+56", "+54", "+51", "+57", "+52", "+1", "+34"] as const;

// Status Options
export const STATUS_OPTIONS = [
  { value: "", label: "Selecciona un estado" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
] as const;

export const BOOLEAN_STATUS = [
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
] as const;

// Candidate Status Options
export const CANDIDATE_STATUS = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "interview", label: "En entrevista" },
  { value: "hired", label: "Contratado" },
  { value: "rejected", label: "Descartado" },
] as const;

// Module Options (for permissions)
export const MODULE_OPTIONS = [
  { id: "users", name: "Usuarios" },
  { id: "roles", name: "Roles" },
  { id: "applicants", name: "Postulantes" },
  { id: "recruitment", name: "Reclutamiento" },
  { id: "admin", name: "Administración" },
] as const;

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8083";

// Solicitud Status Options
export const SOLICITUD_STATUS = [
  { value: "ABIERTA", label: "Abierta" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "CERRADA", label: "Cerrada" },
  { value: "CANCELADA", label: "Cancelada" },
] as const;

// LocalStorage keys (mock persistence)
export const STORAGE_KEYS = {
  candidates: "worksync.candidates",
  solicitudes: "worksync.solicitudes",
} as const;
