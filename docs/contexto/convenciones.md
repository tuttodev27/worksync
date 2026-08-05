# Convenciones

## Estilo de código

### Frontend (TypeScript/React)
- `strict: true` en tsconfig, sin `any` explícito.
- Nombres de archivos en PascalCase para componentes (`UserListPage.tsx`), camelCase para hooks/utils (`useAuthUser.ts`, `httpClient.ts`).
- Regla ESLint `no-console: error` — usar `logger` de `shared/utils/logger.ts`.
- JSX con 2 espacios de indentación.
- Tipos exportados desde `shared/types/` y `modules/*/domain/types/`.

### Backend (Java)
- Paquete base `com.ats.user` o `com.ats.candidate`.
- Lombok para getters/setters/builders: `@Getter`, `@Setter`, `@Builder`, `@FieldDefaults`.
- MapStruct para mapeos: entidad JPA ↔ modelo de dominio ↔ DTO web.
- 4 espacios de indentación.
- Respeta arquitectura hexagonal: domain NO importa infrastructure ni application.

## Naming

| Elemento | Convención | Ejemplo |
|---|---|---|
| Clases Java | PascalCase | `UserRepositoryAdapter` |
| Interfaces de puerto | <Nombre>Port / UseCase | `UserRepositoryPort`, `AuthUseCase` |
| Controladores | <Entidad>Controller | `UserController` |
| DTOs request/response | <Acción><Entidad>Request/Response | `CreateUserRequest` |
| Componentes React | PascalCase | `CandidateListPage` |
| Hooks React | use<camelCase> | `useAuthUser` |
| Servicios frontend | camelCase | `httpClient` |
| Tests | <archivo>.test.ts(x) | `UserForm.test.tsx` |

## Patrones que usamos

- **Hexagonal (Ports & Adapters)** en todos los microservicios Spring Boot.
- **DDD ligero** en frontend: módulos por dominio (`admin/`, `recruiter/`, `auth/`) con capas UI separadas (`admin-ui/`, `recruiter-ui/`).
- **Servicio HTTP compartido** (`httpClient.ts`) con soporte multi-baseUrl y manejo de 401.
- **Custom hook `useForm`** para formularios con validación (evita librerías externas pesadas en admin; `react-hook-form` + `zod` en recruiter).
- **JWT stateless** con autenticación en cada request vía header `Authorization: Bearer`.

## Patrones prohibidos

- ❌ `console.log` en producción (regla ESLint, usar `logger`).
- ❌ Importar clases de otro microservicio directamente (solo comunicación HTTP/eventos).
- ❌ Lógica de negocio en controladores o entidades JPA.
- ❌ JPA `ddl-auto: update` en producción (se usa Flyway en users; candidate usa `update` local, gotcha conocido).
- ❌ Valores mock fijos (ej. datos hardcodeados de CV en frontend).

## Tests

- **Frontend**: Vitest con `globals: true`, entorno `node`. Tests en `*.test.ts(x)` junto al código.
- **Backend**: JUnit 5 con Spring Boot Test. H2 en memoria para tests. Perfil `test` en candidate.
- **Cobertura**: Se espera test para todo código nuevo (exigido en AGENTS.md de cada proyecto).

## Commits

- Formato: `[proyecto] Mensaje` (ej. `[ats-worksync] Rediseñar paso 1 del wizard`).
- Prefijos de proyecto: `[ats-worksync]`, `[ats-usuarios]`, `[ats-candidate]`, `[ats-request]`.
- Usan referencias a historias de usuario (ej. `HU-54`, `SCRUM-67`).
- Verificación pre-commit: `npm run lint && npm run test` (frontend) o `./gradlew check` (backend).
