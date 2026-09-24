import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db.server";
import { requireAuth } from "./auth.server";
import { z } from "zod";

export const getGeneralReportFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      eventId: z.string().optional(),
      agentId: z.string().optional(),
    }).parse(data || {})
  )
  .handler(async ({ data }) => {
    const user = await requireAuth();
    
    // Solo permitimos a supervisores o admins generar reportes completos
    if (user.role === 'agent') {
      throw new Error('No autorizado para ver reportes consolidados');
    }

    const reportData = await sql`
      SELECT 
        s.id as sale_id,
        s.created_at as sale_date,
        s.amount as revenue,
        s.status as sale_status,
        l.contact_info->>'name' as lead_name,
        l.contact_info->>'company' as lead_company,
        p.full_name as agent_name,
        e.name as event_name,
        (SELECT SUM(amount) FROM public.commissions c WHERE c.sale_id = s.id) as total_commissions
      FROM public.sales s
      JOIN public.leads l ON s.lead_id = l.id
      JOIN public.profiles p ON l.agent_id = p.id
      LEFT JOIN public.events e ON l.event_id = e.id
      WHERE s.status = 'completed'
        ${user.role === 'supervisor' ? sql`AND (p.id = ${user.id} OR p.supervisor_id = ${user.id})` : sql``}
        ${data.startDate ? sql`AND s.created_at >= ${data.startDate}` : sql``}
        ${data.endDate ? sql`AND s.created_at <= ${data.endDate}::date + interval '1 day'` : sql``}
        ${data.eventId ? sql`AND l.event_id = ${data.eventId}` : sql``}
        ${data.agentId ? sql`AND l.agent_id = ${data.agentId}` : sql``}
      ORDER BY s.created_at DESC
    `;

    const leadsCount = await sql`
      SELECT COUNT(l.id) as total_leads
      FROM public.leads l
      JOIN public.profiles p ON l.agent_id = p.id
      WHERE 1=1
        ${user.role === 'supervisor' ? sql`AND (p.id = ${user.id} OR p.supervisor_id = ${user.id})` : sql``}
        ${data.startDate ? sql`AND l.created_at >= ${data.startDate}` : sql``}
        ${data.endDate ? sql`AND l.created_at <= ${data.endDate}::date + interval '1 day'` : sql``}
        ${data.eventId ? sql`AND l.event_id = ${data.eventId}` : sql``}
        ${data.agentId ? sql`AND l.agent_id = ${data.agentId}` : sql``}
    `;

    // Sumarizar del reportData en el backend (o podríamos hacerlo en frontend)
    let totalRevenue = 0;
    let totalCommissions = 0;
    for (const row of reportData) {
      totalRevenue += parseFloat(row.revenue || '0');
      totalCommissions += parseFloat(row.total_commissions || '0');
    }

    return {
      sales: reportData,
      summary: {
        totalRevenue,
        totalCommissions,
        totalLeads: leadsCount[0].total_leads
      }
    };
  });
