import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sql } from "./db.server";
import { requireAuth } from "./auth.server";

export const getLeadsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await requireAuth();

    let leads;
    
    if (user.role === 'admin') {
      leads = await sql`
        SELECT l.*, p.full_name as agent_name
        FROM public.leads l
        LEFT JOIN public.profiles p ON l.agent_id = p.id
        ORDER BY l.created_at DESC
      `;
    } else if (user.role === 'supervisor') {
      leads = await sql`
        SELECT l.*, p.full_name as agent_name
        FROM public.leads l
        LEFT JOIN public.profiles p ON l.agent_id = p.id
        WHERE l.agent_id = ${user.id} 
           OR l.agent_id IN (SELECT id FROM public.profiles WHERE supervisor_id = ${user.id})
        ORDER BY l.created_at DESC
      `;
    } else {
      // Agent
      leads = await sql`
        SELECT l.*, p.full_name as agent_name
        FROM public.leads l
        LEFT JOIN public.profiles p ON l.agent_id = p.id
        WHERE l.agent_id = ${user.id}
        ORDER BY l.created_at DESC
      `;
    }

    return leads;
  });

export const createLeadFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      event_id: z.string().uuid().optional(),
      contact_info: z.record(z.any()),
      interest_level: z.string().optional(),
      notes: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const user = await requireAuth();
    
    // Inserta un nuevo lead asignado al agente logueado y posiblemente a un evento
    const [newLead] = await sql`
      INSERT INTO public.leads (agent_id, event_id, contact_info, interest_level, notes)
      VALUES (${user.id}, ${data.event_id || null}, ${sql.json(data.contact_info)}, ${data.interest_level || null}, ${data.notes || null})
      RETURNING *
    `;

    return newLead;
  });
