# Errores conocidos (gotchas)

## 1. Conflicto de puertos: ats-usuarios vs ats-request
`ats-usuarios` y `ats-request` AMBOS usan el puerto **8083** por defecto. No se pueden levantar juntos sin cambiar el puerto de uno.

## 2. ats-request incompleto
El dominio de `ats-request` está vacío (sin modelos, sin puertos, sin servicios). Solo tiene configuración de Spring Security, beans y migración V1. Cualquier ruta `/api/requests/**` en el gateway fallará.

## 3. data.sql en ats-postulant se re-ejecuta siempre
`spring.sql.init.mode=always` + `defer-datasource-initialization=true` hacen que `data.sql` corra en cada arranque. Como los INSERTs no tienen `ON CONFLICT`, pueden duplicar datos seed si el esquema ya existe.

## 4. Flyway desactivado en desarrollo (ats-usuarios)
Los perfiles `dev` y `local` desactivan Flyway y usan `ddl-auto: update`. Si alguien corre migraciones Flyway en local, no se aplicarán.

## 5. Advertencia de archivo duplicado: data.sql en ats-usuarios
Hay `data.sql` en `src/main/resources/` además de las migraciones Flyway. `spring.sql.init.mode=always` + Flyway desactivado en `dev`/`local` puede crear datos duplicados si se corre múltiples veces.

## 6. ats-users usa Base de datos ats_user puerto 5432, ats-candidate usa ats_candidate puerto 5434
No comparten BD. Cada microservicio tiene su propia instancia PostgreSQL. Hay que levantar ambas antes de desarrollar.

## 7. ats-postulant declara OAuth2 Resource Server pero no lo usa
`spring-boot-starter-oauth2-resource-server` está en dependencias, pero la configuración usa `jjwt` manual. El auto-config de Spring Security OAuth2 no se activa.

## 8. LocalAttachmentStorageAdapter guarda en build/uploads/
`build/` se limpia con `./gradlew clean`. Los archivos subidos se pierden en cada build limpio.

## 9. Seed users de ats-usuarios: contraseña fija
La contraseña hash en `data.sql` corresponde a `admin123`. Cambia en producción.

## 10. Puerto del gateway: README dice 8080, código dice 8082
El README de `worksync-enrutador` documenta el puerto **8080**, pero `application.yaml` y `Dockerfile` usan **8082**. Los commits iniciales cambiaron de 8080 a 8082.

## 11. Solo un microservicio tiene pipeline CI/CD
`ats-usuarios` es el único con `Jenkinsfile`. `ats-postulant`, `ats-request`, `worksync-enrutador` y el frontend no tienen automatización de build/test/deploy.

## 12. Nombre inconsistente: ats-candidate vs ats-postulant
El directorio es `ats-postulant` pero el `settings.gradle` dice `ats-candidate`, el JAR se llama `ats-candidate`, y el gateway lo referencia como `ats-candidate`. Usar siempre `ats-candidate` para referencias.
