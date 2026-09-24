import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sql } from "./db.server";
import { requireAuth } from "./auth.server";

// Porcentajes globales por defecto (podrían parametrizarse en BD)
const AGENT_COMMISSION_RATE = 0.10; // 10%
const SUPERVISOR_COMMISSION_RATE = 0.05; // 5%

export const registerSaleFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      lead_id: z.string().uuid(),
      amount: z.number().positive("El monto debe ser positivo"),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const user = await requireAuth();

    // 1. Obtener los detalles del Agente y su Supervisor
    const [agent] = await sql`
      SELECT id, role, supervisor_id 
      FROM public.profiles 
      WHERE id = ${user.id}
    `;

    if (!agent) throw new Error("Agente no encontrado");

    // Iniciar transacción para asegurar atomicidad
    const result = await sql.begin(async (tx) => {
      // 2. Insertar la Venta
      const [sale] = await tx`
        INSERT INTO public.sales (lead_id, agent_id, amount, status)
        VALUES (${data.lead_id}, ${user.id}, ${data.amount}, 'completed')
        RETURNING *
      `;

      // 3. Actualizar estado del Lead a 'Cerrado'
      await tx`
        UPDATE public.leads 
        SET status = 'Cerrado' 
        WHERE id = ${data.lead_id}
      `;

      // 4. Calcular y registrar comisión del Agente
      const agentCommissionAmount = data.amount * AGENT_COMMISSION_RATE;
      await tx`
        INSERT INTO public.commissions (sale_id, user_id, role_at_time, amount, status)
        VALUES (${sale.id}, ${user.id}, ${agent.role}, ${agentCommissionAmount}, 'pending')
      `;

      // 5. Calcular y registrar comisión del Supervisor (Si tiene uno asignado)
      let supervisorCommissionAmount = 0;
      if (agent.supervisor_id) {
        supervisorCommissionAmount = data.amount * SUPERVISOR_COMMISSION_RATE;
        await tx`
          INSERT INTO public.commissions (sale_id, user_id, role_at_time, amount, status)
          VALUES (${sale.id}, ${agent.supervisor_id}, 'supervisor', ${supervisorCommissionAmount}, 'pending')
        `;
      }

      // La empresa retiene el neto: amount - (agentCommission + supervisorCommission)
      const companyNet = data.amount - agentCommissionAmount - supervisorCommissionAmount;

      return {
        sale,
        commissions: {
          agent: agentCommissionAmount,
          supervisor: supervisorCommissionAmount,
          companyNet
        }
      };
    });

    return result;
  });

export const getSalesMetricsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await requireAuth();

    let revenueResult;
    let leadsResult;

    if (user.role === 'admin') {
      revenueResult = await sql`
        SELECT COALESCE(SUM(amount), 0) as total_revenue
        FROM public.sales
        WHERE status = 'completed'
      `;
      leadsResult = await sql`
        SELECT COUNT(id) as total_leads
        FROM public.leads
        WHERE status = 'new' OR status = 'contacted'
      `;
    } else if (user.role === 'supervisor') {
      revenueResult = await sql`
        SELECT COALESCE(SUM(s.amount), 0) as total_revenue
        FROM public.sales s
        JOIN public.leads l ON s.lead_id = l.id
        WHERE s.status = 'completed' 
          AND (l.agent_id = ${user.id} OR l.agent_id IN (SELECT id FROM public.profiles WHERE supervisor_id = ${user.id}))
      `;
      leadsResult = await sql`
        SELECT COUNT(id) as total_leads
        FROM public.leads
        WHERE (status = 'new' OR status = 'contacted')
          AND (agent_id = ${user.id} OR agent_id IN (SELECT id FROM public.profiles WHERE supervisor_id = ${user.id}))
      `;
    } else {
      revenueResult = await sql`
        SELECT COALESCE(SUM(s.amount), 0) as total_revenue
        FROM public.sales s
        JOIN public.leads l ON s.lead_id = l.id
        WHERE s.status = 'completed' AND l.agent_id = ${user.id}
      `;
      leadsResult = await sql`
        SELECT COUNT(id) as total_leads
        FROM public.leads
        WHERE (status = 'new' OR status = 'contacted') AND agent_id = ${user.id}
      `;
    }

    const commissions = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) as total_commissions
      FROM public.commissions
      WHERE user_id = ${user.id}
    `;

    return {
      totalRevenue: revenueResult[0].total_revenue,
      activeLeads: leadsResult[0].total_leads,
      userCommissions: commissions[0].total_commissions
    };
  });

export const getSalesChartDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await requireAuth();
    
    let chartData;
    if (user.role === 'admin') {
      chartData = await sql`
        SELECT 
          to_char(created_at, 'Mon DD') as date,
          SUM(amount) as sales
        FROM public.sales
        WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY to_char(created_at, 'Mon DD'), created_at::date
        ORDER BY created_at::date ASC
      `;
    } else if (user.role === 'supervisor') {
      chartData = await sql`
        SELECT 
          to_char(s.created_at, 'Mon DD') as date,
          SUM(s.amount) as sales
        FROM public.sales s
        JOIN public.leads l ON s.lead_id = l.id
        WHERE s.status = 'completed' 
          AND s.created_at >= NOW() - INTERVAL '30 days'
          AND (l.agent_id = ${user.id} OR l.agent_id IN (SELECT id FROM public.profiles WHERE supervisor_id = ${user.id}))
        GROUP BY to_char(s.created_at, 'Mon DD'), s.created_at::date
        ORDER BY s.created_at::date ASC
      `;
    } else {
      chartData = await sql`
        SELECT 
          to_char(s.created_at, 'Mon DD') as date,
          SUM(s.amount) as sales
        FROM public.sales s
        JOIN public.leads l ON s.lead_id = l.id
        WHERE s.status = 'completed' 
          AND s.created_at >= NOW() - INTERVAL '30 days'
          AND l.agent_id = ${user.id}
        GROUP BY to_char(s.created_at, 'Mon DD'), s.created_at::date
        ORDER BY s.created_at::date ASC
      `;
    }
    
    return chartData;
  });

export const getTopAgentsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await requireAuth();
    
    let topAgents;
    if (user.role === 'admin') {
      topAgents = await sql`
        SELECT p.full_name as name, COALESCE(SUM(s.amount), 0) as total_sales, COUNT(s.id) as deals
        FROM public.profiles p
        JOIN public.leads l ON l.agent_id = p.id
        JOIN public.sales s ON s.lead_id = l.id
        WHERE s.status = 'completed'
        GROUP BY p.id, p.full_name
        ORDER BY total_sales DESC
        LIMIT 5
      `;
    } else if (user.role === 'supervisor') {
      topAgents = await sql`
        SELECT p.full_name as name, COALESCE(SUM(s.amount), 0) as total_sales, COUNT(s.id) as deals
        FROM public.profiles p
        JOIN public.leads l ON l.agent_id = p.id
        JOIN public.sales s ON s.lead_id = l.id
        WHERE s.status = 'completed' AND (p.id = ${user.id} OR p.supervisor_id = ${user.id})
        GROUP BY p.id, p.full_name
        ORDER BY total_sales DESC
        LIMIT 5
      `;
    } else {
      topAgents = [];
    }

    return topAgents;
  });
