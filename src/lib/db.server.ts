import postgres from 'postgres';

// Validar que exista la variable de entorno
if (!process.env.DATABASE_URL) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

// Configuración de postgres.js compatible con entornos edge/workers
export const sql = postgres(process.env.DATABASE_URL, {
  prepare: false, // Requerido para muchos entornos edge/pgbouncer
  max: 10,
});
