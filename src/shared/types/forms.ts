/**
 * Tipos compartidos para formularios
 * DRY Principle - Evitar duplicación de interfaces
 */

import type { ChangeEvent, FormEvent } from "react";

// Auth Result Type - moved to auth.type.ts to avoid circular dependency
// Keeping here for backwards compatibility
export interface AuthResult {
  user: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "RECRUITER";
    token: string;
  };
  token: string;
}

// Login Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void>;
}

// Register Types
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  rePassword: string;
  userType: string;
}

export interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => Promise<void>;
  onCancel?: () => void;
}

// Role Types
export interface RoleFormData {
  name: string;
  description: string;
  active: string;
}

export interface RoleFormProps {
  onSubmit?: (data: RoleFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<RoleFormData>;
}

// Menu Types
export interface MenuFormData {
  title: string;
  path: string;
  active: string;
}

export interface MenuFormProps {
  onSubmit?: (data: MenuFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<MenuFormData>;
}

// Modulo Types
export interface ModuloFormData {
  name: string;
  description: string;
  status: string;
}

export interface ModuloFormProps {
  onSubmit?: (data: ModuloFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ModuloFormData>;
}

// Permission Types
export interface ModuleOption {
  id: string;
  name: string;
}

export interface PermissionFormData {
  code: string;
  description: string;
  moduleId: string;
  status: string;
}

export interface PermissionFormProps {
  onSubmit?: (data: PermissionFormData) => Promise<void>;
  onCancel?: () => void;
  availableModules?: ModuleOption[];
  initialData?: Partial<PermissionFormData>;
}

// Candidate Types
export interface CandidatoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  identityDocument: string;
  latestPosition: string;
  yearsExperience: string;
  educationLevel: string;
  countryCode: string;
  headline: string;
  summary: string;
  technicalSkills: string;
  softSkills: string;
  language: string;
  languageLevel: string;
}

export interface CandidatoFormProps {
  onSubmit?: (data: CandidatoFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<CandidatoFormData>;
}

// Saved Candidate entity (persisted in localStorage)
export interface Candidate extends CandidatoFormData {
  id: string;
  createdAt: string;
}

// Solicitud Types
export type SolicitudStatus =
  | "ABIERTA"
  | "EN_PROCESO"
  | "CERRADA"
  | "CANCELADA";

export interface Solicitud {
  id: string;
  title: string;
  description: string;
  requiredTechnicalSkills: string;
  requiredExperience: string;
  status: SolicitudStatus;
  createdAt: string;
  assignedCandidateIds: string[];
}

export interface SolicitudFormData {
  title: string;
  description: string;
  requiredTechnicalSkills: string;
  requiredExperience: string;
  status: SolicitudStatus;
}

// Matcher
export interface MatchResult {
  candidate: Candidate;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

// Forgot Password Types
export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordFormData) => Promise<void>;
}

// Reset Password Types
export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormProps {
  onSubmit?: (data: ResetPasswordFormData) => Promise<void>;
}

// Reset Code Types
export interface ResetCodeFormData {
  code: string[];
}

export interface ResetCodeFormProps {
  onSubmit?: (code: string) => Promise<void>;
  onResend?: () => void;
}

// Common Event Handlers (reusable)
export type InputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => void;
export type SelectChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => void;
export type TextareaChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => void;
export type FormSubmitHandler = (e: FormEvent) => void;

// Generic Form Handler Type
export type FormChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => void;
