# Glosario

## Términos del dominio

| Término | Definición |
|---|---|
| **Candidato (Candidate)** | Persona que aplica a una oferta; almacena datos personales, educación, experiencia, idiomas, skills, CV, notas. |
| **Solicitud (Request)** | Petición de reclutamiento hecha por un área de la empresa; describe un perfil buscado. |
| **Reclutador (Recruiter)** | Rol de usuario que gestiona candidatos y solicitudes. |
| **Admin** | Rol con acceso completo a usuarios, roles, permisos, módulos y menús del sistema. |
| **CV / Currículum** | Documento PDF del candidato; se parsea con IA (Ollama) para autocompletar datos. |
| **Módulo (Module)** | Agrupación lógica de permisos en el backend (ej. USERS, ROLES, PERMISSIONS). |
| **Menú (Menu)** | Entrada de navegación en el sidebar; vinculada a un módulo y un permiso requerido. |
| **Permiso (Permission)** | Acción granular (CREATE, READ, UPDATE, DELETE) sobre un recurso, con ámbito (scope). |
| **Rol (Role)** | Conjunto de permisos asignables a usuarios. ADMIN tiene todos; RECRUITER tiene solo lectura. |

## Entidades principales

### Frontend (worksync)
```
AuthUser         → email, role, token, roles[]
PageResponse<T>  → content[], totalElements, totalPages, number, size
```

### Backend ats-usuarios
```
User       → id, name, lastName, email, phone, passwordHash, active, roles[]
Role       → id, name, description, active, permissions[]
Permission → id, code, name, resource, action, scope, moduleId
Module     → id, code, name, description, active
Menu       → id, title, path, icon, orderIndex, requiredPermissionCode, moduleId
```

### Backend ats-candidate (26 modelos)
```
Candidate → datos personales + colecciones de educación, experiencia, skills, idiomas, etc.
CandidateEducation, CandidateExperience, CandidateHardSkill, CandidateSoftSkill,
CandidateLanguage, CandidateCertification, CandidateAvailability, CandidateNote,
CandidateState, CandidateProfessionalProfile, CandidateParseResult, Attachment
CountryCode, EducationLevel, ExperienceRange, HardSkill, Language, LanguageLevel, SoftSkill
```

### Backend ats-request (en creación)
```
Request → companies, searchTypes, jobTitles, project, status (OPEN/IN_PROGRESS/CLOSED/CANCELLED)
```

## Siglas internas

| Sigla | Significado |
|---|---|
| **ATS** | Applicant Tracking System |
| **HU** | Historia de Usuario (formato `HU-NNN`) |
| **SCRUM** | Prefijo de épica en GitHub Projects |
| **CI/CD** | Integración Continua / Despliegue Continuo |
| **GHCR** | GitHub Container Registry |
| **JWT** | JSON Web Token |
| **JJWT** | Librería Java para JWT (io.jsonwebtoken) |
| **Ollama** | Ejecutor local de modelos LLM (ej. llama3) |
| **C4** | Notación de diagramas de arquitectura (Context, Container, Component, Code) |
