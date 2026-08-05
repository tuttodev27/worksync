/**
 * Tipos compartidos del modulo recluiter.
 * Mantener en sync con el backend ats-postulant (com.ats.candidate.infrastructure.in.web.dto.*).
 */

export interface CountryCode {
  id: number;
  countryName: string;
  isoCode: string;
  phoneCode: string;
}

export interface EducationLevel {
  id: number;
  name: string;
}

export interface ExperienceRange {
  id: number;
  label: string;
  minYears: number;
  maxYears: number;
}

export interface Language {
  id: number;
  name: string;
  isoCode: string;
}

export interface LanguageLevel {
  id: number;
  code: string;
  name: string;
}

export interface RecruiterCatalogs {
  countryCodes: CountryCode[];
  educationLevels: EducationLevel[];
  experienceRanges: ExperienceRange[];
  languages: Language[];
  languageLevels: LanguageLevel[];
}

export interface CreateCandidateProfessionalProfile {
  headline?: string;
  summary?: string;
  latestPosition?: string;
  experienceRangeId?: number;
  yearsExperience?: number;
}

export interface CreateCandidateEducation {
  educationLevelId: number;
  degree?: string;
  institution?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateCandidateLanguage {
  languageId: number;
  languageLevelId?: number;
  source?: string;
  confidence?: number;
}

export interface CreateCandidateHardSkill {
  hardSkillId: number;
  level?: string;
  yearsExperience?: number;
  source?: string;
  confidence?: number;
}

export interface CreateCandidateSoftSkill {
  softSkillId: number;
  source?: string;
  confidence?: number;
}

export interface CreateCandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  identityDocument?: string;
  countryCode?: string;
  code?: string;
  birthDate?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  professionalProfile?: CreateCandidateProfessionalProfile;
  educations?: CreateCandidateEducation[];
  languages?: CreateCandidateLanguage[];
  hardSkills?: CreateCandidateHardSkill[];
  softSkills?: CreateCandidateSoftSkill[];
}

export interface CandidateProfessionalProfileResponse {
  id: number;
  headline?: string;
  summary?: string;
  latestPosition?: string;
  experienceRangeId?: number;
  yearsExperience?: number;
}

export interface CandidateEducationResponse {
  id: number;
  educationLevelId: number;
  degree?: string;
  institution?: string;
  startDate?: string;
  endDate?: string;
}

export interface CandidateLanguageResponse {
  id: number;
  languageId: number;
  languageLevelId?: number;
  source?: string;
  confidence?: number;
}

export interface CandidateHardSkillResponse {
  id: number;
  hardSkillId: number;
  level?: string;
  yearsExperience?: number;
  source?: string;
  confidence?: number;
}

export interface CandidateSoftSkillResponse {
  id: number;
  softSkillId: number;
  source?: string;
  confidence?: number;
}

export interface AttachmentResponse {
  id: number;
  candidateId?: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  checksum?: string;
  uploadedAt?: string;
  uploadedBy?: number;
  parseStatus?: string;
}

export interface CandidateExperienceResponse {
  id: number;
  companyName?: string;
  client?: string;
  project?: string;
  jobTitle?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  currentJob?: boolean;
}

export interface CandidateNoteResponse {
  id: number;
  note: string;
  createdAt?: string;
  createdBy?: string;
}

export interface StatusChangeRequest {
  status: string;
}

export interface StatusHistoryResponse {
  id: number;
  previousState?: string;
  newState: string;
  changedBy?: number;
  changedAt?: string;
}

export interface CandidateStatusResponse {
  code: string;
  label: string;
}


export interface CandidateApiResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  identityDocument?: string;
  countryCode?: string;
  code?: string;
  birthDate?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  active: boolean;
  createdBy?: number;
  createdAt: string;
  currentState?: string;
  professionalProfile?: CandidateProfessionalProfileResponse;
  educations?: CandidateEducationResponse[];
  languages?: CandidateLanguageResponse[];
  hardSkills?: CandidateHardSkillResponse[];
  softSkills?: CandidateSoftSkillResponse[];
  attachments?: AttachmentResponse[];
  experiences?: CandidateExperienceResponse[];
  notes?: CandidateNoteResponse[];
}

// Solicitud Types
export interface CreateSolicitudPayload {
  title: string;
  description?: string;
  requiredTechnicalSkills: string;
  requiredExperience?: string;
  status: string;
  assignedCandidateIds: number[];
}

export interface UpdateSolicitudPayload {
  title?: string;
  description?: string;
  requiredTechnicalSkills?: string;
  requiredExperience?: string;
  status?: string;
  assignedCandidateIds?: number[];
}

export interface SolicitudApiResponse {
  id: number;
  title: string;
  description: string;
  requiredTechnicalSkills: string;
  requiredExperience: string;
  status: string;
  createdAt: string;
  assignedCandidateIds: number[];
}

export interface UpdateCandidatePayload {
  phone?: string;
  countryCode?: string;
  identityDocument?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  birthDate?: string;
  professionalProfile?: CreateCandidateProfessionalProfile;
  educations?: CreateCandidateEducation[];
  languages?: CreateCandidateLanguage[];
  hardSkills?: CreateCandidateHardSkill[];
  softSkills?: CreateCandidateSoftSkill[];
}
