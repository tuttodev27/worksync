# Historias de Usuario — Deuda Técnica WorkSync ATS

> Formato: **COMO** [rol] **QUIERO** [funcionalidad] **PARA** [beneficio]
> Prioridad: 🔴 Alta / 🟡 Media / 🟢 Baja

---

## 🔴 Prioridad Alta

### HU-001: Suite de tests automatizados
**COMO** desarrollador  
**QUIERO** tener tests unitarios y de integración para hooks, repositorios y componentes  
**PARA** detectar regresiones temprano y poder refactorizar con confianza.

**Criterios de aceptación:**
- Al menos 80% de cobertura en hooks de aplicación (`application/`)
- Tests para `httpClient`, `authStorage`, `jwt` utils
- Tests para `CandidateApiRepository` y `UserApiRepository` (mockeando fetch)
- Comando `npm run test` disponible y pasa en CI

---

### HU-002: Eliminar console.log en producción
**COMO** desarrollador  
**QUIERO** que no haya `console.log` en el bundle de producción  
**PARA** evitar fugas de información interna del sistema en la consola del navegador.

**Criterios de aceptación:**
- Ningún `console.log` en archivos fuente
- Si se necesita logging, usar un wrapper que se desactive en producción
- ESLint rule `no-console` configurada como error

---

### HU-003: Manejo robusto de 401 en httpClient
**COMO** desarrollador  
**QUIERO** que el cliente HTTP determine el ámbito de autenticación mediante una flag explícita en vez de parsear el puerto de la URL  
**PARA** que el chequeo de sesión expirada funcione correctamente en producción con dominios personalizados.

**Criterios de aceptación:**
- Reemplazar `baseUrl.includes("8083")` por `authScope: "users" | "candidates"`
- Sesión expirada en users service → redirige a login
- Sesión expirada en candidates service → lanza error manejable (no redirige)

---

### HU-004: Migrar solicitudes y candidatos legacy a API real
**COMO** reclutador  
**QUIERO** que las solicitudes y candidatos se persistan en el backend real  
**PARA** que los datos no se pierdan al cambiar de dispositivo o navegador.

**Criterios de aceptación:**
- `useSolicitud` y `useSolicitudList` usan repositorio HTTP en vez de localStorage
- `useCandidateList` legacy se elimina (candidatos ya tienen API via `CandidateApiRepository`)
- Eliminar `STORAGE_KEYS` de `forms.ts`
- Eliminar `simulated delay` de 500ms

---

### HU-005: Editar usuario con cambio de rol y contraseña
**COMO** administrador  
**QUIERO** poder cambiar el rol y la contraseña de un usuario desde la pantalla de edición  
**PARA** poder reasignar permisos y resetear accesos sin tener que crear un nuevo usuario.

**Criterios de aceptación:**
- Dropdown de roles disponible en `EditUserPage`
- Campo opcional de nueva contraseña con confirmación
- `UpdateUserPayload` incluye `roleId` y `password`

---

### HU-006: Paginación en listado de usuarios
**COMO** administrador  
**QUIERO** poder navegar entre páginas en la tabla de usuarios  
**PARA** no tener que cargar cientos de registros de una sola vez.

**Criterios de aceptación:**
- `useUserList` expone `page`, `totalPages`, `setPage`
- La tabla muestra controles "Anterior / Siguiente" cuando hay más de una página
- Tamaño de página configurable (por defecto 10)

---

### HU-007: Desactivar usuario con PATCH en vez de DELETE
**COMO** administrador  
**QUIERO** que desactivar un usuario use el método HTTP correcto (PATCH)  
**PARA** evitar borrado físico accidental de datos de usuario.

**Criterios de aceptación:**
- `UserApiRepository.delete` se renombra a `deactivate` y usa `PATCH /api/users/{id}`
- Payload: `{ active: false }`
- UI y hook actualizados para reflejar el cambio semántico

---

### HU-008: Manejar errores de envío en useForm
**COMO** usuario  
**QUIERO** ver mensajes de error cuando el envío de un formulario falla  
**PARA** saber qué ocurrió y poder tomar acción.

**Criterios de aceptación:**
- `useForm.handleSubmit` expone el error al componente
- El error se muestra en la UI del formulario

---

### HU-009: Indicador de carga en RequireRole
**COMO** usuario  
**QUIERO** ver un indicador visual mientras se verifica mi sesión  
**PARA** no ver una pantalla en blanco al cargar una ruta protegida.

**Criterios de aceptación:**
- Mientras `isLoading` es `true`, se renderiza un spinner o skeleton
- El spinner desaparece cuando la verificación termina

---

## 🟡 Prioridad Media

### HU-010: Hook genérico para listados CRUD
**COMO** desarrollador  
**QUIERO** tener un hook reutilizable `useGenericList<T>` para los listados de admin  
**PARA** eliminar la duplicación de código entre `useUserList`, `useRoleList`, `usePermissionList`, `useModuleList` y `useMenuList`.

**Criterios de aceptación:**
- Hook único que acepte un repositorio y un label de error
- Los 5 hooks existentes se refactorizan para usarlo
- Comportamiento idéntico al actual

---

### HU-011: Unificar interfaces duplicadas
**COMO** desarrollador  
**QUIERO** tener una única definición de `AuthResult` y unificar `CandidateEditFormData` con `CandidatoFormData`  
**PARA** evitar inconsistencias cuando un tipo se actualiza y el otro queda desactualizado.

**Criterios de aceptación:**
- Eliminar `AuthResult` legacy de `shared/types/forms.ts`
- `CandidateEditFormData` extiende o reusa `CandidatoFormData`
- No hay errores de compilación

---

### HU-012: Logout consistente entre roles
**COMO** usuario  
**QUIERO** que cerrar sesión tenga el mismo comportamiento desde cualquier panel  
**PARA** tener una experiencia de usuario uniforme.

**Criterios de aceptación:**
- AdminSidebar y RecluiterSidebar usan el mismo mecanismo de logout
- Se elimina `window.location.href` en favor de `navigate()`

---

### HU-013: Feedback de error al desactivar usuario
**COMO** administrador  
**QUIERO** ver un mensaje si la desactivación de un usuario falla  
**PARA** saber si hubo un problema y poder reintentar.

**Criterios de aceptación:**
- El error de `useUserDelete` se muestra en `UsersListPage`
- El mensaje desaparece al cerrarlo o al reintentar

---

### HU-014: Atributos autoComplete en login
**COMO** usuario  
**QUIERO** que el navegador me sugiera credenciales guardadas en la pantalla de login  
**PARA** no tener que escribir email y contraseña manualmente cada vez.

**Criterios de aceptación:**
- Input email tiene `autoComplete="email"`
- Input password tiene `autoComplete="current-password"`

---

### HU-015: Usar readOnly en vez de disabled para email en edición
**COMO** usuario con discapacidad visual  
**QUIERO** que el campo de email en edición sea accesible mediante teclado  
**PARA** poder navegar el formulario completo con tabulación.

**Criterios de aceptación:**
- `disabled` reemplazado por `readOnly` en input email de EditUserPage
- Estilo visual diferenciado para `readOnly`

---

### HU-016: Advertencia de cambios sin guardar en admin
**COMO** administrador  
**QUIERO** recibir una advertencia si intento salir de un formulario con cambios sin guardar  
**PARA** no perder datos ingresados accidentalmente.

**Criterios de aceptación:**
- `beforeunload` activo cuando hay cambios
- Modal de confirmación al navegar fuera
- Implementado en RegisterPage, EditUserPage, RoleCreatePage, PermissionCreatePage, ModuloCreatePage, MenuCreatePage

---

### HU-017: Ordenamiento en columnas de tablas
**COMO** usuario  
**QUIERO** poder hacer clic en los encabezados de columna para ordenar la tabla  
**PARA** encontrar información más rápido sin tener que buscar manualmente.

**Criterios de aceptación:**
- Columnas ordenables: nombre, email, estado, rol, teléfono
- Indicador visual de dirección de ordenamiento (asc/desc)
- Implementado en UsersListPage, RolesPage, CandidateListPage

---

### HU-018: Búsqueda en tabla de usuarios
**COMO** administrador  
**QUIERO** poder buscar usuarios por nombre o email  
**PARA** encontrar rápidamente una cuenta específica sin tener que revisar toda la lista.

**Criterios de aceptación:**
- Input de búsqueda en la cabecera de UsersListPage
- Búsqueda por nombre y email
- Debounce de 300ms en la llamada a la API

---

### HU-019: Validación runtime con Zod en respuestas HTTP
**COMO** desarrollador  
**QUIERO** que las respuestas del backend se validen con esquemas Zod en lugar de castear con `as T`  
**PARA** detectar temprano si el contrato de la API cambia y evitar datos corruptos en runtime.

**Criterios de aceptación:**
- `httpRequest` acepta un esquema Zod opcional
- Los repositorios principales (auth, users, candidates) usan esquemas
- Error claro si la validación falla

---

### HU-020: URLs de API configurables sin defaults locales
**COMO** DevOps  
**QUIERO** que las URLs de API no tengan defaults apuntando a localhost  
**PARA** que el frontend nunca intente conectar a localhost en producción si faltan las variables de entorno.

**Criterios de aceptación:**
- Valores por defecto vacíos o lanzar error si no están configurados
- Documentación de variables de entorno requeridas

---

### HU-021: Refactorizar formularios para usar useForm
**COMO** desarrollador  
**QUIERO** que todos los formularios del admin usen el hook `useForm` compartido  
**PARA** centralizar la lógica de validación y reducir código repetitivo.

**Criterios de aceptación:**
- RegisterPage, EditUserPage, RoleCreatePage, PermissionCreatePage, ModuloCreatePage, MenuCreatePage usan `useForm`
- Validaciones consistentes en toda la app

---

### HU-022: Sistema de diseño CSS unificado
**COMO** desarrollador  
**QUIERO** tener un sistema de diseño basado en variables CSS con estilos compartidos  
**PARA** eliminar reglas CSS duplicadas y mantener consistencia visual.

**Criterios de aceptación:**
- Archivo `design-system.css` con variables de colores, espaciado, tipografía
- Eliminar archivos CSS redundantes
- Refactorizar estilos inline en componentes

---

### HU-023: Monitoreo de errores en producción
**COMO** desarrollador  
**QUIERO** tener integración con un servicio de monitoreo frontend (Sentry)  
**PARA** recibir alertas de errores en producción y poder depurarlos.

**Criterios de aceptación:**
- Sentry configurado con DSN de producción
- ErrorBoundary reporta errores a Sentry
- Breadcrumbs de navegación y acciones de usuario

---

## 🟢 Prioridad Baja

### HU-024: Personalizar README del proyecto
**COMO** desarrollador nuevo  
**QUIERO** un README con descripción del proyecto, instrucciones de instalación y arquitectura  
**PARA** poder entender y ejecutar el proyecto rápidamente.

**Criterios de aceptación:**
- README describe qué es WorkSync ATS
- Incluye requisitos, instalación, variables de entorno
- Incluye enlaces a los microservicios backend

---

### HU-025: Limpiar archivos ajenos al código
**COMO** mantenedor del repositorio  
**QUIERO** que los posts de LinkedIn no estén en la raíz del proyecto  
**PARA** mantener el repositorio enfocado en el código fuente.

**Criterios de aceptación:**
- `post-1-linkedin.md` y `post-2-linkedin.md` movidos a `docs/` o eliminados

---

### HU-026: Eliminar CVs personales del repositorio
**COMO** mantenedor del repositorio  
**QUIERO** que los CVs personales no estén en el repositorio público  
**PARA** proteger datos personales y reducir el tamaño del historial git.

**Criterios de aceptación:**
- Archivos PDF eliminados del repo
- Agregados a `.gitignore`
- Reemplazados por CVs dummy para pruebas

---

### HU-027: Configurar formateador de código
**COMO** desarrollador  
**QUIERO** tener Prettier configurado con reglas consistentes  
**PARA** que todo el código tenga el mismo formato sin discusiones de estilo.

**Criterios de aceptación:**
- Archivo `.prettierrc` con configuración
- Script `npm run format` disponible
- ESLint integrado con Prettier

---

### HU-028: Configurar hooks de pre-commit
**COMO** desarrollador  
**QUIERO** tener Husky y lint-staged configurados  
**PARA** que el linting se ejecute automáticamente antes de cada commit.

**Criterios de aceptación:**
- Husky instalado y configurado
- lint-staged corre ESLint en staged files
- Mensaje claro si el lint falla

---

### HU-029: Dockerizar el frontend
**COMO** DevOps  
**QUIERO** tener un Dockerfile multi-stage para construir y servir el frontend  
**PARA** tener una forma estandarizada y reproducible de desplegar la aplicación.

**Criterios de aceptación:**
- `Dockerfile` multi-stage (build con node, serve con nginx)
- `.dockerignore` configurado
- `docker-compose.yml` opcional

---

### HU-030: Eliminar comentarios placeholder
**COMO** desarrollador  
**QUIERO** que no haya comentarios como `// Create if needed` en el código  
**PARA** mantener la base de código limpia y profesional.

**Criterios de aceptación:**
- Eliminar comentarios placeholder en `CrudCard.tsx:3`, `StatCard.tsx:2`
- Revisar otros comentarios similares

---

### HU-031: Exponer errores del dashboard de admin
**COMO** administrador  
**QUIERO** ver si hay errores al cargar las estadísticas del dashboard  
**PARA** saber si algún módulo no está disponible en lugar de ver ceros.

**Criterios de aceptación:**
- `useDashboard` expone estado `error`
- AdminDashboard muestra alerta si hay errores parciales

---

### HU-032: Limpiar directorio vacío
**COMO** desarrollador  
**QUIERO** que no haya directorios vacíos en el árbol de src  
**PARA** mantener la estructura del proyecto limpia.

**Criterios de aceptación:**
- `src/modules/auth/domain/models/` eliminado o con `.gitkeep`

---

### HU-033: Pipeline de CI/CD
**COMO** desarrollador  
**QUIERO** tener un workflow de GitHub Actions que corra lint, typecheck y tests  
**PARA** asegurar calidad del código en cada PR antes de hacer merge.

**Criterios de aceptación:**
- Workflow se ejecuta en PRs y pushes a main
- Corre `npm run lint`, `npm run typecheck`, `npm run test`
- Falla si algún paso no pasa

---

### HU-034: Eliminar void innecesario en useEffect
**COMO** desarrollador  
**QUIERO** que las llamadas a funciones asíncronas en useEffect no usen el operador `void`  
**PARA** seguir las convenciones estándar de React.

**Criterios de aceptación:**
- `void load()` en `useCatalogs.ts:47` reemplazado por `load()`

---

## Resumen por sprint sugerido

| Sprint | Prioridad | HU incluidas |
|--------|-----------|--------------|
| **Sprint 1** | 🔴 Alta | HU-001, HU-002, HU-003, HU-009 |
| **Sprint 2** | 🔴 Alta | HU-005, HU-006, HU-007, HU-008 |
| **Sprint 3** | 🔴 Alta | HU-004 |
| **Sprint 4** | 🟡 Media | HU-010, HU-011, HU-012, HU-019, HU-021 |
| **Sprint 5** | 🟡 Media | HU-013, HU-014, HU-015, HU-016, HU-017, HU-018 |
| **Sprint 6** | 🟡 Media | HU-020, HU-022, HU-023 |
| **Sprint 7** | 🟢 Baja | HU-024 al HU-034 |
