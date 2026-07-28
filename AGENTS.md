# AGENTS.md — ats-worksync (Frontend)

## Dev environment tips
- Este es el frontend de la plataforma ATS — usa React 19, TypeScript y Vite 8.
- Usa `npm run dev` para levantar el servidor de desarrollo (puerto 5173 por defecto).
- Usa `npm run build` para generar el build de producción en `dist/`.
- Usa `npm run preview` para previsualizar el build de producción.
- El proyecto depende de dos microservicios backend:
  - **ats-user** en `http://localhost:8083` (variables: `VITE_USERS_URL`)
  - **ats-candidate** en `http://localhost:8084` (variables: `VITE_CANDIDATE_URL`)
- Levanta los backends por separado antes de usar funcionalidades que los requieran.
- Las variables de entorno se definen en `.env` y se acceden con `import.meta.env.VITE_*`.
- Alias de rutas: `@/` apunta a `./src/` (configurado en `vite.config.ts` y `tsconfig.json`).

## Testing instructions
- Corre `npm run test` para ejecutar todos los tests (Vitest).
- Corre `npm run test:watch` para modo watch durante desarrollo.
- Los tests están en archivos `*.test.ts` y `*.test.tsx` dentro de `src/`.
- Vitest usa entorno `node` y globals habilitados.
- Corrige cualquier error de test o compilación hasta que todo pase.
- Agrega o actualiza tests para el código que cambies, aunque nadie lo pida explícitamente.

## Linting
- Corre `npm run lint` (ESLint) antes de hacer commit.
- El proyecto usa `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`.
- Corrige todos los warnings y errores de linting.

## Architecture conventions
- Estructura del proyecto:
  - `src/app/router/` — configuración de rutas (React Router v7).
  - `src/modules/` — módulos por dominio:
    - `admin/` — lógica de administración.
    - `admin-ui/` — componentes UI de administración.
    - `recruiter/` — lógica de reclutamiento.
    - `recruiter-ui/` — componentes UI de reclutamiento.
    - `auth/` — autenticación y login.
    - `shared/` — lógica compartida entre módulos.
  - `src/shared/` — utilidades compartidas globalmente:
    - `components/` — componentes reutilizables (botones, inputs, etc.).
    - `constants/` — constantes de la aplicación.
    - `hooks/` — custom hooks reutilizables.
    - `services/` — servicios HTTP para comunicarse con los backends.
    - `types/` — tipos TypeScript compartidos.
    - `utils/` — utilidades generales.
- Usa `react-hook-form` para formularios y `zod` para validación.
- Usa `react-router-dom` v7 para navegación.
- Usa `pdfjs-dist` para renderizado de PDFs en el navegador.
- Los servicios HTTP en `src/shared/services/` son los puntos de comunicación con los backends.
- No dupliques lógica — extrae a `src/shared/` o al módulo `shared` correspondiente.

## PR instructions
- Formato de título: `[ats-worksync] <Title>`
- Siempre corre `npm run lint` y `npm run test` antes de hacer commit.
