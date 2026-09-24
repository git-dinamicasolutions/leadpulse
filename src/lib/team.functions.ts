import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sql } from "./db.server";
import { requireAuth } from "./auth.server";

export const getTeamFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAuth();
    
    // Obtener todos los perfiles y el nombre de su supervisor si lo tienen
    const team = await sql`
      SELECT 
        p.id, 
        p.email, 
        p.full_name, 
        p.role, 
        p.supervisor_id,
        s.full_name as supervisor_name
      FROM public.profiles p
      LEFT JOIN public.profiles s ON p.supervisor_id = s.id
      ORDER BY p.role, p.full_name ASC
    `;

    return team;
  });

export const assignSupervisorFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      agent_id: z.string().uuid(),
      supervisor_id: z.string().uuid().nullable(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireAuth();
    // NOTA: Solo un 'admin' debería poder hacer esto en un entorno real.
    
    await sql`
      UPDATE public.profiles
      SET supervisor_id = ${data.supervisor_id}
      WHERE id = ${data.agent_id}
    `;

    return { success: true };
  });

export const createTeamMemberFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      email: z.string().email(),
      full_name: z.string().min(2),
      role: z.enum(['admin', 'supervisor', 'agent']),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireAuth();
    
    const [newUser] = await sql`
      INSERT INTO public.profiles (email, full_name, role)
      VALUES (${data.email}, ${data.full_name}, ${data.role})
      RETURNING id, email, full_name, role
    `;

    return newUser;
  });
