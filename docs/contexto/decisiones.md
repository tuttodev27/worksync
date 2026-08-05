# Decisiones técnicas

## 1. Frontend monolítico, backend microservicios
**Contexto**: El frontend es una SPA que habla con 3 microservicios distintos.
**Decisión**: El frontend NO usa el gateway en desarrollo; apunta directo a cada backend. El gateway (`worksync-enrutador`) solo se usa en producción/preproducción.
**Por qué**: Simplifica el desarrollo local (no requiere levantar 4 servicios para ver un cambio).
**Descartado**: BFF (Backend for Frontend) por ahora.

## 2. Gateway con Spring Cloud Gateway (WebMVC) en vez de WebFlux
**Contexto**: Enrutador necesita enrutar peticiones y validar JWT.
**Decisión**: Usar `spring-cloud-starter-gateway-server-webmvc` + `spring-boot-starter-webmvc` en lugar de la pila reactiva WebFlux.
**Por qué**: Simplifica la implementación del filtro JWT y es más familiar para el equipo.
**Riesgo**: Spring recomienda WebFlux para gateway por rendimiento; WebMVC puede tener limitaciones con alto throughput.

## 3. Arquitectura hexagonal en todos los microservicios
**Contexto**: Proyectos `ats-usuarios`, `ats-postulant` y `ats-request`.
**Decisión**: Separación estricta en domain (modelos + puertos), application (casos de uso), infrastructure (adaptadores).
**Por qué**: Facilita testear la lógica de negocio sin infraestructura, permuta cambiar BD o framework.
**Evidencia en código**: Interfaces `*Port` en `domain.port`, implementaciones en `infrastructure.adapter.out`.

## 4. JWT con jjwt 0.12.6 en vez de nimbus-jose-jwt
**Contexto**: Autenticación stateless compartida entre servicios.
**Decisión**: Usar `io.jsonwebtoken:jjwt` en todos los servicios.
**Por qué**: API más simple que nimbus; el equipo ya lo conoce.
**Nota**: `ats-postulant` declara `spring-boot-starter-oauth2-resource-server` pero configura JWT manualmente con jjwt, no con el auto-config de Spring Security.

## 5. Flyway en users y requests; ddl-auto:update en candidate
**Contexto**: Estrategia de migraciones de BD.
**Decisión**: `ats-usuarios` y `ats-request` usan Flyway con migraciones versionadas. `ats-postulant` usa JPA `ddl-auto: update` + `data.sql` para seed.
**Por qué**: `ats-postulant` empezó sin Flyway y no se ha migrado.
**Riesgo**: `data.sql` se re-ejecuta en cada arranque con `spring.sql.init.mode=always`. Puede causar duplicados sin `ON CONFLICT` / `IF NOT EXISTS`.

## 6. Cache Caffeine local en vez de Redis
**Contexto**: Catálogos de solo lectura (países, idiomas, niveles).
**Decisión**: `spring-boot-starter-cache` + Caffeine en cada servicio.
**Por qué**: Baja cardinalidad, sin necesidad de caché distribuida.
**Descartado**: Redis (innecesario para este volumen).

## 7. Ollama para parseo de CVs con fallback a regex
**Contexto**: Extracción automática de datos de currículums PDF.
**Decisión**: Llamar a Ollama local (`llama3`) para extraer datos estructurados; si falla, aplicar parser basado en regex.
**Por qué**: Más preciso que regex puro; evita depender de APIs externas.
**Evidencia**: `OllamaClient` + `AiCvParser` en `ats-postulant`.

## 8. Almacenamiento de archivos en local (no S3)
**Contexto**: Adjuntos de candidatos (CVs).
**Decisión**: `LocalAttachmentStorageAdapter` guarda en `build/uploads/`.
**Por qué**: No hay necesidad de S3 por ahora.
**Riesgo**: Los archivos se pierden al hacer `clean build`.

## 9. Rate limiting en login con filtro servlet (no Bucket4j)
**Contexto**: Proteger `/api/auth/login` de brute force.
**Decisión**: Filtro `RateLimitingFilter` con contadores en memoria.
**Por qué**: Simple, sin dependencias externas.

## 10. Perfiles local/dev separados en ats-usuarios
**Contexto**: Desarrollo local vs CI.
**Decisión**: `application-local.yml` y `application-dev.yml` desactivan Flyway y usan `ddl-auto: update` + `data.sql` en desarrollo.
**Por qué**: Acelera iteración local; evita migraciones manuales.
