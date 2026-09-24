import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sql } from "./db.server";
import { requireAuth } from "./auth.server";

export const getEventsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAuth();

    // Obtener los eventos junto con las métricas de ROI (Leads generados y Ventas asociadas)
    const events = await sql`
      SELECT 
        e.id, 
        e.name, 
        e.budget, 
        e.start_date, 
        e.end_date, 
        e.status,
        COUNT(DISTINCT l.id) as total_leads,
        COALESCE(SUM(s.amount), 0) as total_revenue
      FROM public.events e
      LEFT JOIN public.leads l ON l.event_id = e.id
      LEFT JOIN public.sales s ON s.lead_id = l.id AND s.status = 'completed'
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `;

    return events;
  });

export const getActiveEventsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAuth();
    const events = await sql`
      SELECT id, name 
      FROM public.events 
      WHERE status = 'active'
      ORDER BY name ASC
    `;
    return events;
  });

export const createEventFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      name: z.string().min(1, "El nombre es requerido"),
      budget: z.number().min(0, "El presupuesto no puede ser negativo"),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    await requireAuth();
    
    // NOTA: Idealmente verificar que el usuario tenga rol de 'admin' o 'supervisor'
    const [newEvent] = await sql`
      INSERT INTO public.events (name, budget, start_date, end_date, status)
      VALUES (
        ${data.name}, 
        ${data.budget}, 
        ${data.start_date || null}, 
        ${data.end_date || null}, 
        'active'
      )
      RETURNING *
    `;

    return newEvent;
  });
