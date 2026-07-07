# Deuda Técnica — WorkSync ATS

> Analisis exhaustivo del codigo fuente. Fecha: Julio 2026.
> Cada item incluye archivo, linea y sugerencia de solucion.

---

## 🔴 ALTA — Impacto critico, debe abordarse inmediatamente

### 1. Sin tests automatizados
- **Archivo**: Todo el proyecto
- **Problema**: Cero archivos de test (`*.test.*`, `*.spec.*`) en toda la codebase.
- **Riesgo**: Cualquier cambio puede romper funcionalidad existente sin deteccion temprana.
- **Solucion**: Implementar al menos tests unitarios para los hooks y repositorios (Vitest + React Testing Library).

### 2. `console.log` en produccion
- **Archivos**: `src/modules/auth/application/useLogin.ts:58-65`, `src/shared/components/RequireRole.tsx:16-28`, `src/shared/hooks/useForm.ts:83`
- **Problema**: `console.log` expone informacion interna del sistema (roles, rutas, estado de auth).
- **Riesgo**: Fuga de informacion en consola del navegador en produccion.
- **Solucion**: Eliminar o reemplazar con logger condicional (`if (import.meta.env.DEV)`).

### 3. Manejo fragil de 401 en httpClient
- **Archivo**: `src/shared/services/httpClient.ts:82`
- **Problema**: `const isAuthService = (baseUrl ?? "").includes("8083")` — depende del puerto hardcodeado.
- **Riesgo**: En produccion con dominios personalizados o proxy reverso, `8083` no aparece en la URL y el chequeo falla.
- **Solucion**: Usar una flag explicita como `authScope: "users" | "candidates"` en `RequestOptions`.

### 4. Datos mockeados en localStorage (Solicitudes y Candidatos legacy)
- **Archivos**: `src/modules/recruiter/application/useSolicitud.ts`, `useSolicitudList.ts`, `useCandidateList.ts`
- **Problema**: Persisten datos en `localStorage` en vez de usar la API real. `useSolicitud.ts` simula un delay de 500ms con `setTimeout`.
- **Riesgo**: Datos inconsistentes entre sesiones de usuario. Funcionalidad incompleta que nunca migro a backend real.
- **Solucion**: Implementar repositorios HTTP reales para solicitudes y eliminar logica de localStorage.

### 5. Editar usuario no permite cambiar rol ni contraseña
- **Archivo**: `src/modules/admin-ui/EditUserPage.tsx`, `src/modules/admin/application/useUserEdit.ts`
- **Problema**: `useUserEdit` no incluye campo de rol ni contraseña en `UpdateUserPayload`. La UI no los renderiza.
- **Riesgo**: Usuarios atrapados con el rol asignado en creacion. No se puede resetear contraseña desde el panel.
- **Solucion**: Agregar campo `roleId` y `password` al formulario de edicion y al payload.

### 6. Sin paginacion en listado de usuarios
- **Archivo**: `src/modules/admin-ui/UsersListPage.tsx`, `src/modules/admin/application/useUserList.ts`
- **Problema**: El backend devuelve `PageResponse<T>` con paginacion, pero `useUserList` extrae solo `.content` y no expone `totalPages`, `page`, etc. La tabla no tiene controles de pagina.
- **Riesgo**: Con muchos usuarios, la UI carga todos los registros de una vez, degradando performance.
- **Solucion**: Implementar paginacion en `useUserList` (similar a `useCandidateApiList`) y agregar controles en la tabla.

### 7. "Desactivar" usuario usa DELETE HTTP
- **Archivo**: `src/modules/admin/infrastructure/UserApiRepository.ts:85-94`
- **Problema**: `DELETE /api/users/{id}` para "desactivar". Si el backend lo trata como borrado fisico, los datos se pierden.
- **Riesgo**: Perdida permanente de datos de usuario.
- **Solucion**: Cambiar a `PATCH /api/users/{id}` con `{ active: false }`.

### 8. Errores silenciosos en useForm
- **Archivo**: `src/shared/hooks/useForm.ts:81-84`
- **Problema**: `handleSubmit` captura errores pero solo hace `console.error()` sin exponerlos al componente.
- **Riesgo**: El usuario nunca ve errores de envio. La UI queda en estado inconsistente.
- **Solucion**: Retornar el error desde el hook o permitir un callback `onError`.

### 9. Sin indicador de carga en RequireRole
- **Archivo**: `src/shared/components/RequireRole.tsx:23`
- **Problema**: `if (isLoading) return null;` — pantalla en blanco mientras resuelve auth.
- **Riesgo**: Mala experiencia de usuario (flash de pantalla en blanco).
- **Solucion**: Renderizar un spinner o skeleton mientras carga.

---

## 🟡 MEDIA — Impacto moderado, planificar su correccion

### 10. Hooks CRUD duplicados (violacion DRY)
- **Archivos**: `useUserList.ts`, `useRoleList.ts`, `usePermissionList.ts`, `useModuleList.ts`, `useMenuList.ts`
- **Problema**: Los 5 hooks tienen EXACTAMENTE la misma estructura: estado `[items, loading, error, activeFilter]`, mismo patron `load/refresh`, misma interfaz de retorno.
- **Solucion**: Crear un hook generico `useGenericList<T>(repository, errorLabel)` o composable.

### 11. Interfaces duplicadas
- **Archivo**: `src/shared/types/forms.ts:10-18` define `AuthResult`, duplicado de `src/modules/auth/domain/ports/AuthRepository.ts:13-16`
- **Problema**: `CandidateEditFormData` (useCandidateEdit.ts) y `CandidatoFormData` (forms.ts) modelan lo mismo pero por separado.
- **Solucion**: Unificar tipos. Eliminar `AuthResult` legacy de forms.ts.

### 12. Logout inconsistente entre roles
- **Archivos**: `src/modules/admin-ui/AdminSidebar.tsx:150`, `src/modules/recruiter-ui/RecluiterSidebar.tsx:16`
- **Problema**: Admin usa `window.location.href` (hard reload), Recruiter usa `navigate()` (soft navigation). Comportamiento diferente.
- **Solucion**: Unificar criterio. Recomendacion: usar `navigate()` + `logout()`.

### 13. Sin feedback de error al desactivar usuario
- **Archivo**: `src/modules/admin-ui/UsersListPage.tsx`
- **Problema**: `useUserDelete` setea estado `error` pero `UsersListPage` nunca lo muestra. La desactivacion falla silenciosamente.
- **Solucion**: Mostrar el error en la UI cuando ocurra.

### 14. Sin autoComplete en inputs de login
- **Archivo**: `src/modules/auth/ui/pages/LoginPage.tsx:50-77`
- **Problema**: Inputs email y password no tienen atributo `autoComplete`.
- **Solucion**: Agregar `autoComplete="email"` y `autoComplete="current-password"`.

### 15. Email en edicion usa `disabled` en vez de `readOnly`
- **Archivo**: `src/modules/admin-ui/EditUserPage.tsx:104`
- **Problema**: `disabled` impide focus, no es accesible y el valor no se envía en algunos navegadores.
- **Solucion**: Reemplazar con `readOnly` y estilo visual para `readOnly`.

### 16. Sin advertencia de cambios sin guardar (Admin)
- **Archivos**: `RegisterPage.tsx`, `EditUserPage.tsx`, `RolesPage.tsx`, etc.
- **Problema**: Solo `CandidateEditPage` y `CandidatoCreatePage` en recruiter-ui tienen proteccion `hasChanges`. Admin carece de esto.
- **Solucion**: Implementar `beforeunload` y bloqueo de navegacion en formularios admin.

### 17. Sin ordenamiento en columnas de tablas
- **Archivos**: `UsersListPage.tsx`, `RolesPage.tsx`, `CandidateListPage.tsx`
- **Problema**: Ninguna tabla soporta ordenamiento por columna (nombre, email, estado, etc.).
- **Solucion**: Agregar logica de sort en los hooks de listado o en el cliente.

### 18. Sin busqueda en tabla de usuarios
- **Archivo**: `src/modules/admin-ui/UsersListPage.tsx`
- **Problema**: Solo filtro por activo/inactivo. No hay busqueda por nombre o email.
- **Solucion**: Agregar input de busqueda similar a `CandidateListPage` y pasarlo como query param.

### 19. Type safety debil con casteos
- **Archivos**: `httpClient.ts:108` (`as T`), `AuthApiRepository.ts:39` (`as UserRole`), `authStorage.ts:9` (`as AuthUser`)
- **Problema**: Casteos sin validacion en runtime. Si la API cambia el contrato, el frontend recibe datos corruptos sin saberlo.
- **Solucion**: Usar parsers con Zod (ya disponible en el proyecto) para validar respuestas HTTP.

### 20. URLs de API acopladas a puertos locales
- **Archivo**: `src/shared/constants/forms.ts:50-53`
- **Problema**: `VITE_USERS_URL` default `http://localhost:8083`. En produccion se usa variable de entorno, pero el default es localhost.
- **Solucion**: No tener defaults de localhost, o al menos documentar que deben configurarse.

### 21. useForm hook infrautilizado
- **Problema**: Existe un hook generico `useForm` en shared pero casi ningun formulario del admin lo usa. Cada pagina implementa su propio estado/validacion manual.
- **Solucion**: Refactorizar formularios para usar `useForm` y sus validadores.

### 22. CSS fragmentado sin sistema de diseno
- **Archivos**: Multiples `.css` en admin-ui y recruiter-ui con estilos duplicados.
- **Problema**: `AdminPages.css`, `AdminForms.css`, `RegisterPage.css`, `EditUserPage.css`, etc. Muchas reglas solapadas.
- **Solucion**: Unificar en un sistema de diseño compartido con variables CSS. Eliminar archivos redundantes.

### 23. Sin monitoreo de errores en produccion
- **Problema**: No hay integracion con Sentry, Datadog RUM ni ningun servicio de monitoreo frontend.
- **Solucion**: Integrar Sentry o similar para capturar errores de produccion.

---

## 🟢 BAJA — Impacto menor, conveniente pero no urgente

### 24. README sin personalizar
- **Archivo**: `README.md`
- **Problema**: Sigue siendo el template por defecto de Vite + React + TypeScript.
- **Solucion**: Personalizar con descripcion del proyecto, instrucciones de instalacion, etc.

### 25. Archivos ajenos al codigo en el repositorio
- **Archivos**: `post-1-linkedin.md`, `post-2-linkedin.md`
- **Problema**: Posts de LinkedIn no deberian estar en el repositorio del proyecto.
- **Solucion**: Mover a un directorio `docs/` o eliminar del repo.

### 26. CVs personales en /public
- **Archivos**: `public/CV_Carlos_Castillo.pdf`, `public/Pablo_Alexis_Cristóbal_Gallegos_Celis_CV.pdf`
- **Problema**: Datos personales expuestos en el repositorio publico. Ademas, archivos grandes en el historial git.
- **Solucion**: Eliminar del repo, agregar a `.gitignore`. Usar archivos dummy para pruebas.

### 27. Sin formateador de codigo
- **Problema**: No hay `.prettierrc` ni configuracion de Prettier. Solo ESLint para linting.
- **Solucion**: Agregar Prettier con reglas consistentes.

### 28. Sin hooks de pre-commit
- **Problema**: No hay Husky ni lint-staged. Los desarrolladores pueden commitear codigo con errores de lint.
- **Solucion**: Configurar Husky + lint-staged para correr ESLint en staged files.

### 29. Sin Dockerfile / docker-compose
- **Problema**: No hay forma estandarizada de construir y ejecutar el frontend.
- **Solucion**: Agregar `Dockerfile` multi-stage y referenciarlo en `docker-compose.yml`.

### 30. Comentarios placeholder en componentes
- **Archivos**: `CrudCard.tsx:3`, `StatCard.tsx:2`
- **Problema**: Comentarios `// Create if needed` que quedaron del desarrollo.
- **Solucion**: Eliminar comentarios placeholder.

### 31. Error silenciado en AdminDashboard
- **Archivo**: `src/modules/admin/application/useDashboard.ts`
- **Problema**: El hook no expone estado `error`. Solo `loading`. Dashboard ignora errores en el snapshot.
- **Solucion**: Agregar `error` al return del hook y mostrarlo en UI.

### 32. Directorio vacio
- **Archivo**: `src/modules/auth/domain/models/` (directorio vacio)
- **Problema**: Directorio sin archivos que genera ruido en el arbol.
- **Solucion**: Eliminar o agregar un `.gitkeep` con comentario.

### 33. Sin CI/CD pipeline
- **Problema**: No hay GitHub Actions, GitLab CI ni configuracion de despliegue automatico.
- **Solucion**: Agregar workflow de CI que corra lint + typecheck + tests.

### 34. `void` innecesario en useEffect
- **Archivo**: `src/modules/recruiter/application/useCatalogs.ts:47`
- **Problema**: `void load()` — el operador `void` es redundante ya que useEffect ignora promesas.
- **Solucion**: `load()` directamente o usar un IIFE.

---

## Resumen por modulo

| Modulo | Deuda Alta | Deuda Media | Deuda Baja |
|--------|-----------|-------------|------------|
| **Core/Shared** | httpClient frágil, useForm errors silenciosos, sin tests | type safety débil, CSS fragmentado | Sin Prettier/Husky/Docker |
| **Auth** | console.log en login | Sin autoComplete | Directorio model vacio |
| **Admin** | Sin paginación usuarios, DELETE en desactivar, no permite editar rol/password | Hooks CRUD duplicados, sin búsqueda, sin advertencia cambios | Dashboard error silenciado |
| **Recruiter** | Datos mockeados en localStorage (solicitudes) | Logout inconsistente, sin ordenamiento | void innecesario |
| **Infraestructura** | Sin tests | Sin monitoreo | Sin CI/CD |

**Total: 34 items** (9 Alta, 14 Media, 11 Baja)
