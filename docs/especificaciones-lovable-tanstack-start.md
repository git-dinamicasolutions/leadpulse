# Especificaciones técnicas — Proyecto base compatible con Lovable

**Versión:** 1.0 · **Fecha:** 2026-09-22
**Destino:** importar este proyecto a Lovable y publicar desde ahí
**Base de datos:** PostgreSQL externa (gestionada por nosotros, no la de Lovable)

---

## 0. Instrucción para la IA que genera el código

Genera una aplicación web completa en **React 19.2 + TypeScript + Vite + TanStack Start v1**
que cumpla **todas** las reglas de este documento. No inventes stack: si una librería o patrón
no aparece aquí, no lo uses. El proyecto debe compilar con `bun run build` sin errores ni
advertencias de tipos, y debe poder importarse a Lovable sin reescribir código.

Antes de entregar, recorre el checklist de la sección 12 y corrige todo lo que falle.

---

## 1. Stack exacto (versiones pinneadas)

| Capa | Paquete | Versión |
|---|---|---|
| Runtime de build/preview | Vite | `8.1.5` |
| Framework full-stack | `@tanstack/react-start` | `1.168.32` |
| Routing | `@tanstack/react-router` | `1.170.18` |
| Plugin de rutas | `@tanstack/router-plugin` | `1.168.23` |
| Data fetching | `@tanstack/react-query` | `^5.101.1` |
| UI | `react` / `react-dom` | `^19.2.0` |
| Tipos | `@types/react` / `@types/react-dom` | `^19.2.0` |
| Lenguaje | `typescript` | `^5.8.3` |
| Estilos | `tailwindcss` + `@tailwindcss/vite` | `^4.2.1` |
| Validación | `zod` | `^3.25.76` |
| Formularios | `react-hook-form` + `@hookform/resolvers` | `^7.71.2` / `^5.2.2` |
| Componentes UI | Radix UI (`@radix-ui/*`) | últimas estables |
| Iconos | `lucide-react` | `^0.575.0` |
| Notificaciones | `sonner` | `^2.0.7` |
| Utilidades de clase | `tailwind-merge` | `^3.5.0` |
| Alias de rutas | `vite-tsconfig-paths` | `^6.0.2` |

**Gestor de paquetes: `bun`.** Lovable instala dependencias con bun. Si la IA usa npm/pnpm,
entregar igualmente `bun.lock` o dejar que Lovable regenere el lockfile.

Reglas de dependencias:

- Toda dependencia debe declarar **soporte de React 19** (revisar peer deps).
- Prohibido: `react-router-dom`, `next`, `redux`, `axios` (usar `fetch`), `styled-components`,
  `sass`, `moment`, `lodash` completo (usar `lodash-es` o funciones propias).
- Ningún paquete que necesite binarios nativos, `node-gyp` o `binding.gyp`.
- No agregar dependencias "por si acaso": solo las que se usan.

---

## 2. Estructura de carpetas obligatoria

```text
/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx              // bootstrap de TanStack Start
│   ├── router.tsx            // creación del router
│   ├── start.ts              // registro de middleware de servidor
│   ├── styles.css            // Tailwind v4 (@import "tailwindcss"; @theme {...})
│   ├── routeTree.gen.ts      // GENERADO: nunca editar a mano
│   ├── routes/
│   │   ├── __root.tsx        // layout raíz: <Outlet /> + head()
│   │   ├── index.tsx         // página "/" (no existe src/App.tsx)
│   │   ├── about.tsx         // ejemplo de ruta
│   │   ├── _authenticated/   // rutas protegidas (si aplica)
│   │   │   └── dashboard.tsx
│   │   └── api/
│   │       └── public/       // endpoints HTTP (webhooks, cron)
│   ├── components/
│   │   ├── ui/               // primitives (shadcn-style)
│   │   └── ...               // componentes de negocio
│   ├── lib/
│   │   ├── *.functions.ts    // server functions (importables desde cliente)
│   │   └── *.server.ts       // helpers solo-servidor
│   ├── hooks/
│   └── assets/
├── supabase/migrations/      // migraciones SQL de PostgreSQL
└── .env.example
```

No crear: `src/App.tsx`, `src/pages/`, `entry-client.tsx`, `entry-server.tsx`,
`tailwind.config.js` (Tailwind v4 no lo usa), `postcss.config.js`.

---

## 3. Routing

- Todas las páginas son archivos en `src/routes/` con `createFileRoute`.
- Cada `Link`, `navigate()` o `redirect()` debe apuntar a una ruta que **existe como archivo**
  en el mismo commit.
- `__root.tsx` es el layout compartido y debe renderizar `<Outlet />`.
- Cada ruta de contenido define su propio `head()` con `title`, `description`,
  `og:title`, `og:description` únicos y `og:type` + `twitter:card`.
- **No editar `src/routeTree.gen.ts`** ni la tabla de rutas a mano: se regenera solo.
- Rutas protegidas bajo `_authenticated/` con un `route.tsx` de control de acceso.
- Un `loader` de ruta pública **nunca** llama una función protegida con sesión.

---

## 4. React 19 (sin compatibilidad hacia atrás)

- Solo **funciones** con hooks. Nada de `class`, `componentDidMount`, `defaultProps`.
- Nada de `ReactDOM.render` / `ReactDOM.hydrate` (borrados en 19).
- `ref` se pasa como prop normal; **no** envolver en `forwardRef` (aún funciona, pero es
  redundante y se evita).
- Usar `use` + `Suspense` para leer promesas, `useActionState` para formularios,
  `useOptimistic` cuando haya actualización optimista, `useFormStatus` en botones de envío.
- `key` es una prop normal; no usar `useId` como key de listas.
- `strict mode` activo; los efectos deben ser idempotentes (doble montaje en dev).
- Tipos: TypeScript estricto, `noUncheckedIndexedAccess` recomendable, **sin `any`** libre
  (usar `unknown` + narrowing) y sin `@ts-ignore` (usar `@ts-expect-error` con motivo).

---

## 5. Server functions y límites de importación

Lógica interna del servidor = `createServerFn` desde `@tanstack/react-start`:

```ts
// src/lib/orders.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { listOrders } from "./orders.server";

export const listOrdersFn = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ page: z.number().int().min(1).default(1) }).parse(data))
  .handler(async ({ data }) => {
    return listOrders(data.page);
  });
```

Reglas de oro:

1. `*.functions.ts` vive en `src/lib/` (o junto a la ruta que lo usa). **Nunca** debajo de
   `src/server/` si el cliente lo importa.
2. `*.server.ts` (conexión a base de datos, secretos, SQL) **jamás** se importa desde un
   componente ni desde un `*.functions.ts` que el cliente importe de forma indirecta a través
   de un hook o util compartida.
3. `process.env` se lee **dentro** de `.handler()`, nunca a nivel de módulo.
4. Validar toda entrada con Zod dentro del handler.
5. Endpoints HTTP que llama un servicio externo (webhooks, cron, API pública): ruta bajo
   `src/routes/api/public/` con `server.handlers`, verificando firma/token dentro del handler.
6. Datos iniciales de una página: `loader` con `context.queryClient.ensureQueryData(...)` +
   `useSuspenseQuery` en el componente. No `useEffect` + `fetch` para la carga inicial.

---

## 6. Runtime edge (restricciones reales del despliegue)

El servidor se ejecuta en un **worker** (Cloudflare workerd con `nodejs_compat`), no en un
servidor Node con sistema de archivos real. Esto no es opcional.

**Prohibido en código de servidor** (falla en runtime aunque el import funcione):

- `child_process` (`spawn`, `exec`, `fork`)
- `sharp`, `canvas`, `puppeteer`, `playwright`
- `fs.watch` / `fs.watchFile`
- `os.cpus()`, `os.networkInterfaces()`
- Escrituras fuera de `/tmp`, rutas arbitrarias del sistema de archivos
- Cualquier paquete que abra demonios TCP, use `__dirname`/`__filename` o no documente
  soporte de Workers

**Permitido** (Web APIs + built-ins con nodejs_compat): `fs` (solo `/tmp` y `/bundle`),
`path`, `crypto` (Web Crypto y `node:crypto`), `Buffer`, `stream`, `url`, `events`,
`timers`, `net`, `http`, `https`, `zlib`, `fetch`.

**Bundling:** no hay resolución de módulos en runtime — todo paquete queda empaquetado en el
build. No usar `ssr.external` ni `resolve.external` en `vite.config.ts`. Preferir paquetes
puros de JavaScript o builds WASM pensados para edge.

**Cliente vs servidor:** una librería que toque `window`/`document` al importarse (mapas,
editores, gráficos) debe cargarse con `React.lazy` + `<ClientOnly>`, nunca con import estático
desde una ruta que se renderiza en SSR.

---

## 7. Variables de entorno

| Tipo | Dónde se declara | Cómo se lee | visibles en el navegador |
|---|---|---|---|
| Servidor (secretos) | Secrets de Lovable / variables del entorno | `process.env["NOMBRE"]` dentro de un handler | No |
| Cliente (público) | `.env` / entorno de build | `import.meta.env.VITE_NOMBRE` | **Sí, siempre** |

Reglas:

1. Todo nombre de cliente empieza con `VITE_`; lo que no lo tenga es solo-servidor.
2. Nunca poner un secreto en `VITE_*`: se filtra en el bundle.
3. Nunca leer `process.env` en el cliente ni a nivel de módulo del servidor.
4. `.env`, `.env.local` y cualquier clave real **fuera del repositorio**; entregar
   `.env.example` con todas las claves y valores falsos.
5. Validar la presencia de claves al arrancar (dentro del handler, devolviendo un error claro).
6. Documentar en el README cada clave: nombre, para qué sirve, dónde se consigue, si es
   pública o secreta.

---

## 8. PostgreSQL externa

La base de datos es nuestra y vive fuera de Lovable. Reglas:

**Acceso**

- Desde el código de servidor se accede por **HTTP/REST** (pooler o API tipo PostgREST) o por
  un driver compatible con edge (`postgres` de postgres.js en modo HTTP/worker, o el cliente
  REST del proveedor). Verificar que el driver declare soporte de Cloudflare Workers antes
  de usarlo; **nunca** `pg` con conexiones TCP persistentes si el runtime no lo permite.
- La cadena de conexión llega por variable de entorno secreta (`DATABASE_URL`), leída dentro
  del handler.
- El cliente del navegador **nunca** recibe credenciales ni consultas SQL: todo paso por una
  server function o ruta API que autorice al usuario.

**Esquema**

- Todo el esquema versionado como migraciones SQL en `supabase/migrations/` (o
  `db/migrations/`), numeradas y ordenadas: `0001_init.sql`, `0002_...sql`.
- Cada migración es idempotente donde sea posible (`create table if not exists`,
  `create index if not exists`, `create policy if not exists` o envuelta en `do $$`).
- Sin datos de producción en las migraciones: solo `INSERT` de datos de prueba claramente
  marcados (prefijo `test_`, `seed_` o columna `is_demo = true`).

**Seguridad**

- Habilitar RLS en **todas** las tablas expuestas y escribir políticas explícitas
  (`using`/`with check`), no políticas `to public using (true)`.
- Roles en tabla separada (`user_roles` con un `enum` propio), **nunca** como columna en
  `profiles`/`users`. Para comprobarlos desde políticas, una función `security definer`
  (`has_role`) que evite recursión de RLS.
- Grants explícitos por rol (`anon`, `authenticated`, `service_role`) en la misma migración
  que crea la tabla; no asumir privilegios por defecto.
- Nunca comprobar "es admin" desde `localStorage` ni desde el cliente: siempre en el servidor.

**Portabilidad**

- Sin extensiones exóticas sin avisar; si hace falta una (`pg_trgm`, `uuid-ossp`, `pg_cron`),
  listarla en el README con `create extension if not exists` en la migración correspondiente.
- Sin dependencias de características específicas de un proveedor (Amazon RDS vs Supabase vs
  Neon): escribir SQL estándar y anotar cualquier desviación.

---

## 9. Dev, staging y producción

- **Dev** (Vite + Node) no aplica las restricciones del worker: un paquete puede funcionar en
  dev y romperse en producción. Por eso la sección 6 se respalda aunque el dev "mire bien".
- El build de producción (`bun run build`) es la prueba real; `build:dev` (modo development)
  también se ejecuta y puede fallar si una ruta pública llama código protegido.
- El preview y la app publicada comparten **la misma base de datos externa** salvo que se
  configuren variables distintas. Usar datos de prueba marcados o esquemas/RLS separados para
  no ensuciar datos reales al probar.
- No hardcodear URLs ni `localhost`: usar `window.location.origin` o una variable de entorno.
- No usar `alert()`/`confirm()` para feedback de UI; usar `sonner`.

---

## 10. Estilos y componentes

- Tailwind CSS v4 por `@import "tailwindcss";` en `src/styles.css`, con `@theme { ... }` para
  tokens de color, fuente y radios. Sin `tailwind.config.js`.
- Los colores se referencian como tokens semánticos (`bg-background`, `text-muted-foreground`,
  `border-border`), no con hex sueltos ni `bg-[#...]` en componentes.
- Soporte de modo claro/oscuro desde el inicio (variables CSS en `:root` y `.dark`).
- Tipografías y fuentes remotas se cargan con `<link>` en el `<head>` de `__root.tsx`, nunca
  con `@import` de una URL remota dentro de `styles.css`.
- Nada de frameworks de CSS (MUI, Ant, Bootstrap) ni de librerías de animación pesadas
  (usar transiciones de Tailwind; `framer-motion`/`motion` solo si es imprescindible).

---

## 11. Formato de entrega

1. Repositorio Git con historial limpio (idealmente GitHub), o
2. ZIP del código fuente **sin** `node_modules`, `.git`, `dist`, `.output`, `.env*` reales.

Incluir:

- `package.json` con versiones exactas de la sección 1.
- `README.md` con: qué es la app, cómo arrancar (`bun install && bun run dev`), variables de
  entorno requeridas, cómo aplicar las migraciones, y qué queda pendiente.
- `.env.example`, `.gitignore`, `tsconfig.json`, `vite.config.ts`.
- Migraciones SQL completas.

---

## 12. Checklist de validación final

- [ ] `bun install` sin conflictos de peer deps con React 19.
- [ ] `bun run build` y `bun run build:dev` sin errores.
- [ ] `bun run lint` sin errores; TypeScript estricto sin `any` libre.
- [ ] `src/routes/index.tsx` existe y sirve la pantalla principal.
- [ ] Ningún `src/App.tsx`, `src/pages/`, `react-router-dom` ni `tailwind.config.js`.
- [ ] `src/routeTree.gen.ts` sin modificaciones manuales.
- [ ] Ningún `process.env` fuera de un `.handler()`; ningún secreto en `VITE_*`.
- [ ] Ningún helper `.server.ts` alcanzable desde un componente.
- [ ] Ningún uso de `child_process`, `sharp`, `canvas`, `puppeteer` en código de servidor.
- [ ] Librerías de navegador cargadas de forma diferida (`ClientOnly` / `lazy`).
- [ ] Cada tabla tiene RLS + políticas + grants explícitos.
- [ ] Roles en tabla separada, validados en el servidor.
- [ ] Migraciones SQL numeradas, idempotentes y sin datos reales.
- [ ] Cada ruta de contenido con `head()` propio (title/description/og).
- [ ] README completo y `.env.example` actualizado.

---

## 13. Prompt corto (para pegar junto con el documento)

> Construye esta aplicación en React 19.2 + TypeScript + Vite + TanStack Start v1
> (`@tanstack/react-start` 1.168, `@tanstack/react-router` 1.170, Tailwind v4, Zod,
> react-query, bun). Respeta el archivo `especificaciones-lovable-tanstack-start.md`:
> estructura de `src/routes` con file-based routing, server functions en `src/lib/*.functions.ts`,
> helpers solo-servidor en `*.server.ts`, runtime edge sin `child_process`/`sharp`/`fs.watch`,
> secretos solo en `process.env` dentro de handlers y variables públicas con prefijo `VITE_`,
> acceso a PostgreSQL externa solo desde el servidor con migraciones SQL en
> `supabase/migrations/` y RLS + roles en tabla separada. Entrega el repo con README,
> `.env.example` y sin `node_modules`. Verifica el checklist de la sección 12 antes de entregar.
