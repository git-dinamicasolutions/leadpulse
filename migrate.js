import fs from 'fs';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  // Read .env file manually since dotenv might not be installed
  const envFile = fs.readFileSync(join(__dirname, '.env'), 'utf-8');
  let dbUrl = '';
  for (const line of envFile.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.split('=')[1].replace(/"/g, '').trim();
      break;
    }
  }

  if (!dbUrl) {
    console.error('No DATABASE_URL found in .env');
    process.exit(1);
  }

  console.log('Conectando a:', dbUrl.replace(/:[^:@]+@/, ':***@')); // Hide password

  const sql = postgres(dbUrl);
  
  try {
    const migration = fs.readFileSync(join(__dirname, 'supabase', 'migrations', '0001_init.sql'), 'utf-8');
    await sql.unsafe(migration);
    console.log('Migración completada exitosamente. Las tablas han sido creadas.');
  } catch (error) {
    console.error('Error ejecutando migración:', error);
  } finally {
    await sql.end();
  }
}

run();
