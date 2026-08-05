# Arquitectura

## Stack tecnológico

| Componente | Tecnología | Versión |
|---|---|---|
| Frontend | React + TypeScript + Vite | React 19, TS 6, Vite 8 |
| Backend (users) | Spring Boot + Java | 4.0.2 / Java 21 |
| Backend (candidates) | Spring Boot + Java | 4.0.2 / Java 21 |
| Backend (requests) | Spring Boot + Java | 3.4.2 / Java 21 |
| Gateway | Spring Cloud Gateway | 4.0.6 / Java 21 |
| BD | PostgreSQL 16 | 3 instancias |
| Cache | Caffeine | — |
| Migraciones | Flyway | en users y requests |
| IA local | Ollama (llama3) | candidate |
| CI/CD | Jenkins (users) | Declarative Pipeline |

## Mapa de carpetas (proyectos independientes)

```
Documentos/
├── worksync/                          # Frontend React
│   └── src/
│       ├── app/router/                # React Router v7
│       ├── modules/
│       │   ├── auth/                  # Login, forgot/reset password
│       │   ├── admin/ + admin-ui/     # CRUD usuarios, roles, permisos, módulos, menús
│       │   ├── recruiter/ + recruiter-ui/  # CRUD candidatos, dashboard
│       │   └── shared/                # Tipos, UI compartidos entre módulos
│       └── shared/                    # HTTP client, hooks, utils, componentes
│
├── springboot/
│   ├── ats-usuarios/ats-user/         # Microservicio usuarios (puerto 8083)
│   │   └── src/main/java/com/ats/user/
│   │       ├── domain/                # Modelos, puertos, excepciones
│   │       ├── application/           # Casos de uso
│   │       └── infrastructure/        # Controllers, JPA, seguridad, mappers
│   │
│   ├── ats-postulant/                 # Microservicio candidatos (puerto 8084)
│   │   └── src/main/java/com/ats/candidate/
│   │       ├── domain/                # 26 modelos de dominio
│   │       ├── application/           # Servicios de aplicación
│   │       └── infrastructure/        # Controllers, JPA, Ollama, storage
│   │
│   ├── ats-request/                   # Microservicio solicitudes (puerto 8083)
│   │   └── src/main/java/com/ats/request/
│   │       ├── domain/                # [VACÍO]
│   │       ├── configuration/         # Security + Beans
│   │       └── infrastructure/        # [VACÍO]
│   │
│   └── worksync-enrutador/            # API Gateway (puerto 8082)
│       └── src/main/java/.../enrutador/
│           ├── WorksyncEnrutadorApplication.java
│           └── filter/JwtPropagationFilter.java
│
└── springboot/ats/                    # Proyecto legacy de modelado
    ├── models/                        # Diagramas draw.io + MySQL Workbench
    └── ats-users/                     # Scaffolding Java 17 (sin implementar)
```

## Flujo de datos (petición típica)

```
Navegador → worksync-enrutador:8082 → (valida JWT, agrega X-User-* headers)
   ├── /api/auth/**        → ats-users:8083    (login, register)
   ├── /api/users/**       → ats-users:8083    (CRUD usuarios)
   ├── /api/candidates/**  → ats-candidate:8084 (CRUD candidatos)
   ├── /api/requests/**    → ats-request:8083   (solicitudes)
   └── ...catálogos        → microservicio correspondiente
```

El frontend NO pasa por el gateway en desarrollo; apunta directamente a cada backend via `VITE_USERS_URL` y `VITE_CANDIDATE_URL`.

## Qué NO existe (carencias detectadas)

- No hay `docker-compose.yml` general que levante todo el ecosistema (solo existe uno en `ats-postulant/` para Postgres).
- No hay sistema de logging centralizado (ELK, Grafana, etc.).
- No hay monitoreo distribuido (trazas, métricas agregadas).
- El microservicio `ats-request` tiene el dominio vacío: no hay modelos, puertos ni servicios implementados.
- No hay comunicación entre microservicios vía HTTP síncrono o eventos (cada uno es autónomo).
- No hay `AGENTS.md` en `ats-request` ni en `worksync-enrutador`.
- No hay tests de integración entre frontend y backend.
- El gateway usa `spring-boot-starter-webmvc` + `gateway-server-webmvc` (NO la versión WebFlux reactiva).
