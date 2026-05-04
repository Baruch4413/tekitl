# tekitl

> *tekitl* — palabra náhuatl para "trabajo" / "labor".

Plataforma social para organizar proyectos colaborativos a la vista de todos. Parte gestor de trabajo, parte portafolio, parte comunidad. Pensada para makers, organizadores y equipos pequeños que quieren construir cosas juntos y dejar un registro público al que apuntar cuando terminan. Interfaz en español; abierto al mundo.

> *Read this in [English](#english) below.*

## Qué hace

Cada proyecto vive como una página pública y desplazable que crece a medida que avanza el trabajo:

- **Posts → Proyectos.** Cualquier persona publica en el feed comunitario. Cualquier post puede convertirse en un Proyecto con meta, roles, imágenes y un ciclo de vida (`planificación → en ejecución → completado | abortado`).
- **Roles + voluntarios.** El dueño del proyecto declara el talento que necesita (ocupación, horas estimadas). Personas de la comunidad se postulan, son aceptadas, registran horas y quedan en el registro permanente del proyecto.
- **Coins, no plata.** Las reacciones de tipo *Potenciar* generan coins para quien recibe. Hoy son una moneda social de respaldo comunitario — no dinero — que indica qué posts y proyectos vale la pena impulsar. Los proyectos muestran los coins recibidos contra su meta. La economía es **sin fines de lucro**, pero la arquitectura deja la puerta abierta a futuras formas de intercambio o canje.
- **Línea de tiempo de actividad.** Cada página de proyecto muestra un feed cronológico de eventos significativos: transiciones de etapa, rol creado, voluntario que se sumó / abandonó / completó horas, imagen subida, coins recibidos, hitos publicados por el dueño y notas libres de avance. Visitantes y dueños ven la misma historia; solo el dueño puede mover etapas o publicar entradas manuales.
- **Talentos = portafolio.** El perfil de cada usuario lista sus talentos declarados (ocupación + nivel de confianza + años de experiencia) junto con los proyectos en los que participó: dueño, voluntario o completados. **Cada proyecto en el que la persona trabajó aparece en su perfil**, y ese registro *es* el portafolio.

## Por qué existe

La mayoría de las herramientas para "construir en público" están pensadas para fundadores indie publicando hitos a sus seguidores. tekitl asume que el trabajo es colaborativo desde el primer día: el proyecto es la unidad, varias personas aportan en distintos roles, y la comunidad respalda con coins en vez de plata. El resultado es un registro público y duradero de qué se construyó y quién lo construyó — útil para el equipo durante el proceso y para cada contribuidor después.

## Stack técnico

- **PHP 8.5** · **Laravel 12** (estructura simplificada `bootstrap/app.php`)
- **Inertia.js v2** + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **MySQL** (sesiones, proyectos, eventos de timeline, ledger de coins)
- **Laravel Reverb** para websockets
- **Laravel Fortify** para autenticación (email/password, Google OAuth, 2FA, verificación de email)
- **Laravel Wayfinder** — bindings tipados de TypeScript hacia rutas del backend
- **AWS S3** para imágenes de proyecto
- **Pest 4** (feature + browser vía `pest-plugin-browser` / Playwright) y **Vitest 4** para tests

## Estructura del proyecto

```
app/
  Models/                # Post, Project, ProjectRole, ProjectVolunteer,
                         # ProjectTimelineEvent, Reaction, User, UserTalent…
  Http/Controllers/      # ProjectController, ProjectStageController,
                         # ProjectTimelineController, ProjectVolunteerController…
  Observers/             # Emisores de eventos de timeline
  ProjectStage.php       # Enum/máquina de estados del ciclo de vida
  ReactionType.php       # Enum de reacciones (incl. Potenciar)
resources/js/
  pages/                 # Entry points de Inertia
  components/ui/proyectos/
                         # ProjectTimeline, ProjectTimelineEntry,
                         # ProjectTimelinePostUpdate, ProjectRoles,
                         # CrowdfundingProgress…
  actions/, routes/      # Bindings generados por Wayfinder
tests/
  Unit/  Feature/  Browser/  js/
specs/                   # Specs de features en curso (Spec Kit)
```

## Setup local

```bash
# Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate

# Frontend
bun install        # o npm install
bun run build      # o `bun run dev` para HMR

# Servicios
php artisan serve
php artisan reverb:start    # websockets
php artisan queue:work      # jobs en segundo plano
```

Variables de entorno necesarias: `APP_*`, `DB_*`, `MAIL_*`, `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_BUCKET` / `AWS_DEFAULT_REGION`, `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `REVERB_*`.

## Tests

```bash
# PHP — unit + feature + browser
php artisan test --compact

# JavaScript — tests de componentes con Vitest
bun run test:js

# Subconjuntos
php artisan test --filter=ProjectStageGating
vendor/bin/pest tests/Browser
```

Los tests de browser usan Playwright + Chromium. Setup inicial en un host nuevo:

```bash
bunx playwright install chromium
bunx playwright install-deps chromium   # requiere sudo / repos apt funcionando
```

## Estado

Pre-1.0. El ciclo de vida, la línea de tiempo, los roles, el voluntariado, los coins y las reacciones están conectados de punta a punta. El trabajo activo se gestiona bajo `specs/` con Spec Kit; ver `specs/001-project-lifecycle-timeline/` para la rebanada en curso.

## Licencia

GNU General Public License v3.0 — ver [`LICENSE`](LICENSE).

---

## English

> *tekitl* — Nahuatl for "work" / "labor".

A social platform for organizing collaborative projects in the open. Part work-tracker, part portfolio, part community. Built for makers, organizers, and small teams who want to ship things together and have a public record to point at when they're done. Spanish-first interface; open to the world.

### What it does

Every project on tekitl lives as a public, scrollable page that grows as work happens:

- **Posts → Projects.** Anyone posts to the community feed. Any post can be elevated into a full Project with a goal, roles, images, and a lifecycle (`planning → in execution → completed | aborted`).
- **Roles + volunteers.** Project owners declare the talent they need (occupation, hours estimated). Community members apply, get accepted, log hours, and stay on the project's permanent record.
- **Coins, not cash.** Reactions of type *Potenciar* mint coins for the recipient. Today they are a community-endorsement social currency — not money — signalling which posts and projects the community wants to back. Projects display received coins against their goal. The economy is **not-for-profit**, but the architecture leaves room for future redemption or exchange mechanisms.
- **Activity timeline.** Every project page renders a chronological feed of meaningful events: stage transitions, role created, volunteer joined / bailed / exhausted, image uploaded, coins received, owner-posted milestones, and free-text status updates. Visitors and owners see the same history; only the owner can transition stages or post manual entries.
- **Talents = portfolio.** A user's profile lists their declared talents (occupation + confidence + years of experience) alongside the projects they've participated in: as owner, as volunteer, and the ones they completed. **Every project a person worked on appears on their profile** — that record *is* the portfolio.

### Why it exists

Most "build in public" tooling is designed for indie founders posting milestones to their followers. tekitl assumes the work is collaborative from day one: a project is the unit, multiple people contribute in distinct roles, and the community endorses with coins instead of cash. The output is a durable, public record of what got built and who built it — useful to the team while it runs and to each contributor afterwards.

### Tech stack, structure, setup, tests

See the Spanish sections above — commands and paths are identical.

### Status

Pre-1.0. Lifecycle, timeline, roles, volunteering, coins, and reactions are wired end-to-end. Active work tracked under `specs/` using Spec Kit; see `specs/001-project-lifecycle-timeline/` for the in-flight slice.

### License

GNU General Public License v3.0 — see [`LICENSE`](LICENSE).
