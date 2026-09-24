import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function seed() {
  try {
    console.log('Seeding fake user...');
    await sql`
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        'admin@leadpulse.test',
        'Administrador Prueba',
        'admin'
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('Seed exitoso.');
  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    process.exit(0);
  }
}

seed();
