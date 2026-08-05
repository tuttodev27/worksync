# Flujo de trabajo

## Pasos para hacer un cambio

### 1. Entender qué tocar
- Identificar si el cambio es frontend, backend o ambos.
- Confirmar el microservicio involucrado: `ats-usuarios`, `ats-postulant`, `ats-request` o `worksync-enrutador`.
- Si es frontend, verificar si necesita cambios en uno o ambos backends.

### 2. Hacer el cambio
- **Frontend**: editar en `worksync/src/`. Usar `npm run dev` (puerto 5173).
- **Backend users**: `cd ats-usuarios/ats-user/ && ./gradlew bootRun` (puerto 8083, requiere Postgres en 5432).
- **Backend candidates**: `cd ats-postulant/ && ./gradlew bootRun` (puerto 8084, requiere Postgres en 5434).
- **Backend requests**: `cd ats-request/ && ./gradlew bootRun` (puerto 8083 — ¡conflicto si ats-users también corre!).
- **Gateway**: `cd worksync-enrutador/ && ./gradlew bootRun` (puerto 8082).

### 3. Verificar
- **Lint**: `npm run lint` (frontend) / `./gradlew check` (backend).
- **Tests**: `npm run test` (frontend) / `./gradlew test` (backend).
- **Build**: `npm run build` (frontend) / `./gradlew bootJar` (backend).
- **Puertos**: Verificar que no haya conflictos (ej. `ats-request` y `ats-users` ambos usan 8083).

### 4. Commit
```bash
git add .
git commit -m "[proyecto] Descripción del cambio (HU-NNN)"
```
Formato de proyecto: `[ats-worksync]`, `[ats-usuarios]`, `[ats-candidate]`, `[ats-request]`.

## Checklist de "terminado"
- [ ] Código compila sin errores.
- [ ] Tests pasan (nuevos y existentes).
- [ ] Lint sin warnings.
- [ ] No hay `console.log` (solo `logger`).
- [ ] No hay valores mock hardcodeados.
- [ ] Si es nuevo endpoint, está registrado en el gateway (`application.yaml` de `worksync-enrutador`).
- [ ] Si cambia BD, hay migración Flyway (users/requests) o seed actualizado (candidate).
- [ ] Commit con formato correcto.

## Deploy

### CI/CD actual
- **ats-usuarios**: Pipeline Jenkins declarativo (`Jenkinsfile`). Stages: Prepare → Test → Build → BootJar → Archive Artifact.
- **ats-postulant**: [PENDIENTE: no se encontró pipeline CI/CD].
- **ats-request**: [PENDIENTE: no se encontró pipeline CI/CD].
- **worksync-enrutador**: [PENDIENTE: no se encontró pipeline CI/CD].
- **worksync (frontend)**: [PENDIENTE: no se encontró pipeline CI/CD].

### Docker
- Cada backend tiene `Dockerfile` propio (multi-stage con `eclipse-temurin:21-jre`).
- Frontend genera build estático en `dist/` con `npm run build`.
- No existe `docker-compose.yml` general del ecosistema.

### Pasos típicos de deploy manual
1. `./gradlew bootJar` en cada backend.
2. `docker build -t <image> .` en cada proyecto.
3. `npm run build` en frontend, servir `dist/` con nginx o similar.
4. Configurar gateway apuntando a los servicios en sus URLs reales.
