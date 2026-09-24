# LeadPulse — Plataforma de Gestión de Ventas, Eventos y Comisiones

LeadPulse es una plataforma integral para la captura rápida de prospectos (leads) en campo y ferias presenciales, control y auditoría de eventos con cálculo de ROI, motor de cierre de ventas con liquidación automática de comisiones multinivel (Agente -> Supervisor -> Empresa) y reportes consolidados exportables.

Construida con **React 19.2 + TypeScript + Vite 8.1.5 + TanStack Start v1 + Tailwind CSS v4** y compatible con **Lovable**.

---

## 🚀 Puesta en Marcha Rápida

### 1. Requisitos Previos
* Node.js v20+ o Bun
* Base de datos PostgreSQL (local o remota, ej: Supabase / Neon)

### 2. Instalación de Dependencias
```bash
npm install
# o con bun:
bun install
```

### 3. Configuración de Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Configura la cadena de conexión de tu base de datos PostgreSQL:
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/db_leadpulse"
PORT=5180
```

### 4. Aplicar Migraciones de la Base de Datos
Ejecuta el script SQL ubicado en `supabase/migrations/0001_init.sql` en tu cliente PostgreSQL / Supabase SQL Editor, o corre:
```bash
npm run migrate # o ejecuta: node migrate.js
```

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
# o con bun:
bun run dev
```
La aplicación estará disponible en [http://localhost:5180/](http://localhost:5180/).

### 6. Compilación de Producción
```bash
npm run build
```

---

## 🛠️ Stack Tecnológico
* **Framework Full-Stack:** `@tanstack/react-start` (v1.168.32)
* **Enrutamiento:** `@tanstack/react-router` (v1.170.18) con file-based routing en `src/routes/`
* **UI:** React 19.2 + Radix UI + Lucide React + Sonner
* **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite` v4.2.1)
* **Validación:** Zod v3.25
* **Data Fetching:** `@tanstack/react-query` v5.101
* **Visualización de Datos:** Recharts
* **Base de Datos:** PostgreSQL con migraciones SQL versionadas en `supabase/migrations/`
