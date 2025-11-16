# Guía de Mantenimiento y Mejora — KLINIK-MAT

Este archivo recoge el análisis por capas, recomendaciones priorizadas y una checklist accionable para mantener y escalar el proyecto KLINIK-MAT. Usalo como referencia operativa para decisiones de seguridad, despliegue, backups, calidad de código y procesos de promoción de contenido.

---

## Resumen ejecutivo

- Arquitectura: Next.js (App Router) + TypeScript + Prisma + Tailwind. Buenas decisiones arquitectónicas que facilitan escalabilidad.
- Estado actual: ya existen protecciones importantes (hash de tokens en Auth, guardas para EmailProvider, scripts de seed y backup, protecciones para evitar seeds a producción).
- Prioridades inmediatas: seguridad de secretos, backups fiables y restauración, logging/auditoría de sincronizaciones, pruebas y CI.

---

## Análisis por capas y recomendaciones (prioridad + acciones concretas)

### 1) Seguridad y gestión de secretos (Alta prioridad)

- Observaciones:
  - `.env.local` contiene secrets sensibles (Neon URLs, SMTP). Debe estar fuera de git y gestionado con un secrets manager en producción.

- Recomendaciones inmediatas:
  - Si `.env.local` estuvo en git: `git rm --cached .env.local` y hacer commit.
  - Mantener ` .env.example` en el repo con placeholders.
  - Usar secrets manager (GitHub Actions secrets, Vercel/Render envs, o Vault).
  - Asegurar `NEXTAUTH_SECRET` fuerte en producción y cookies `secure` en prod (ya manejado en `auth.config.ts`).
  - Añadir cabeceras de seguridad (CSP, HSTS, X-Frame-Options) en `next.config.mjs` o middleware.

### 2) Backup, restauración y procesos de promoción (Alta prioridad)

- Observaciones:
  - Existen backups JSON y se creó un dump local. Falta un flujo de restauración y mejores prácticas de almacenamiento de dumps.

- Recomendaciones inmediatas:
  - Guardar dumps `pg_dump` en un storage seguro (S3) con retención y versionado.
  - Implementar script de restauración seguro (desde dump SQL o JSON) con confirmaciones explícitas.
  - Añadir `sync-log` para registrar operaciones insert/update/delete durante sincronizaciones.

- Acciones que pueden implementarse ahora:
  - `restore-from-json.js` con confirmación para reponer `cases` desde `backups/*.json`.
  - `--safe-pg-dump` para `scripts/sync-cases.js` que intente `pg_dump` antes de aplicar.
  - Registrar `backups/sync-log-<ts>.json` con operaciones aplicadas.

### 3) Integridad de datos & buenas prácticas DB (Alta)

- Observaciones:
  - Prisma Schema bien definido. `applyChanges` recrea preguntas/options para garantizar fidelidad, pero hay que cuidar IDs y relaciones.

- Recomendaciones:
  - Asegurar que todas las migraciones se aplican en `main` antes de sincronizar: `prisma migrate deploy`.
  - Evitar borrados automáticos sin doble confirmación. `--allow-delete` only with double-confirm.
  - Añadir validaciones (Zod) para entradas de JSON y endpoints.

### 4) Autenticación / Autorización (Alta)

- Observaciones:
  - NextAuth + Prisma adapter con hash de tokens (muy bueno). EmailProvider condicional.

- Recomendaciones:
  - Middleware central para autorización por roles (ADMIN/EDITOR/USER).
  - Auditoría de sesiones y limitación de sesiones por usuario si necesario.
  - Considerar 2FA para cuentas administrativas.

### 5) API / Backend (Medio)

- Observaciones:
  - Servicios organizados y manejo de errores presente.
  - Falta validación de payloads en endpoints.

- Recomendaciones:
  - Añadir validación con `zod` o similar en los route handlers.
  - Implementar paginación y filtros en endpoints de listados.
  - Rate-limiting en rutas públicas (ya existe `ratelimit.ts` — verificar su uso).

### 6) Infra / Deployment / CI (Medio)

- Observaciones:
  - No aparece pipeline CI en el repo.

- Recomendaciones:
  - Añadir GitHub Actions con jobs: `install`, `lint`, `typecheck`, `validate-cases`.
  - Proteger `main` con reglas de PRs y revisar despliegues en staging antes de producción.
  - Integrar monitors (Sentry) y métricas.

### 7) Observabilidad & Logs (Medio)

- Observaciones:
  - Logging ad-hoc con console.debug; falta centralización.

- Recomendaciones:
  - Integrar Sentry para errores y tracing de requests.
  - Log estructurado (JSON) y envío a collector (Logtail, Datadog, etc.).

### 8) Frontend (UX, rendimiento, accesibilidad) (Medio-Alta)

- Observaciones:
  - Buen uso de Next.js y Tailwind; componentes organizados.

- Recomendaciones:
  - Ejecutar pruebas de accesibilidad (`axe`, `pa11y`) y aplicar correcciones.
  - Usar `next/image` para optimización y revisar LCP/CLS con Lighthouse.
  - Añadir pruebas de componentes (React Testing Library) y E2E (Playwright).

### 9) Producto y gestión de contenido (Medio-Long)

- Observaciones:
  - Proyecto con visión nacional; necesita workflows editoriales y control de calidad.

- Recomendaciones:
  - Workflow editorial: Author → Reviewer → Published, con historial de versiones.
  - Panel administrativo para moderación y métricas de uso.
  - Feedback de usuarios (reportes, puntuación de casos) y análisis de performance pedagógica.

### 10) Calidad del código y procesos (Medio)

- Recomendaciones:
  - Tests unitarios y E2E, forzar `lint` + `typecheck` en CI.
  - Pre-commit hooks (`husky`) y Prettier para consistencia.
  - Documentación operacional (runbook, restauración, backups, política de release).

---

## Checklist priorizado (Qué hacer ahora — comandos y archivos)

1. Confirmar `.env.local` fuera de git

```bash
git ls-files | grep \.env.local || true
# si aparece:
git rm --cached .env.local
git commit -m "Remove local env from repo"
```

2. Asegurar backups `pg_dump` y policy de retención

```bash
pg_dump --format=custom --file=backups/pgdump-main-$(date +%Y%m%d-%H%M%S).dump "$DATABASE_URL"
# subir a S3/almacenamiento seguro
```

3. Implementar doble confirm para `--allow-delete` y `sync-log` (recomendado)

- Yo puedo aplicar estos cambios al script `scripts/sync-cases.js` para proteger borrados y generar `backups/sync-log-<ts>.json`.

4. Añadir CI mínimo (GitHub Actions)

- Job básico sugerido: `lint`, `typecheck`, `node scripts/validate-cases.mjs`.

5. Integrar Sentry y logging estructurado

- Añadir `SENTRY_DSN` en env y configurar `sentry.server.config.js` y `sentry.client.config.js`.

6. Añadir validación con Zod en endpoints y proteger rutas

```ts
// ejemplo: validate inputs
import { z } from 'zod';
const caseSchema = z.object({ title: z.string().min(1), area: z.string(), difficulty: z.number().int() });
```

7. Tests y E2E

- Iniciar con tests unitarios para servicios y componentes, y Playwright para flujos críticos.

---

## Estimaciones rápidas de implementación

- Double-confirm + audit-log + safe `pg_dump` hook: 1–3 h.
- CI minimal: 1–2 h.
- Sentry + logs: 1–3 h.
- Restore-from-json script: 1–2 h.
- Tests baseline (unit + e2e): 1–3 días.

---

## Siguientes pasos recomendados (elige una)

- Opción A (recomendada ahora): Implemento doble-confirm para `--allow-delete`, `sync-log` y `--safe-pg-dump` en `scripts/sync-cases.js`.
- Opción B: Creo un `.github/workflows/ci.yml` con checks básicos (lint, typecheck, validate).
- Opción C: Implemento el script de restauración desde JSON y doc de runbook.

Decime qué opción querés y la implemento. Si querés, puedo hacer A+B juntos en el mismo PR.

---

Archivo creado: `MAINTENANCE_GUIDE.md`

Usalo como guía viva: actualizalo con decisiones operativas (p. ej. política de retención de backups, responsables y runbook de restauración).
