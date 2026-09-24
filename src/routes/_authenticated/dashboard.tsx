import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getLeadsFn } from '../../lib/leads.functions';
import { getSalesMetricsFn, getSalesChartDataFn, getTopAgentsFn } from '../../lib/sales.functions';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient?.ensureQueryData({
        queryKey: ['leads'],
        queryFn: () => getLeadsFn(),
      }),
      context.queryClient?.ensureQueryData({
        queryKey: ['salesMetrics'],
        queryFn: () => getSalesMetricsFn(),
      }),
      context.queryClient?.ensureQueryData({
        queryKey: ['salesChart'],
        queryFn: () => getSalesChartDataFn(),
      }),
      context.queryClient?.ensureQueryData({
        queryKey: ['topAgents'],
        queryFn: () => getTopAgentsFn(),
      })
    ]);
  },
  component: DashboardComponent,
});

function DashboardComponent() {
  const { data: leads } = useSuspenseQuery({
    queryKey: ['leads'],
    queryFn: () => getLeadsFn(),
  });

  const { data: metrics } = useSuspenseQuery({
    queryKey: ['salesMetrics'],
    queryFn: () => getSalesMetricsFn(),
  });

  const { data: chartData } = useSuspenseQuery({
    queryKey: ['salesChart'],
    queryFn: () => getSalesChartDataFn(),
  });

  const { data: topAgents } = useSuspenseQuery({
    queryKey: ['topAgents'],
    queryFn: () => getTopAgentsFn(),
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalRevenue = parseFloat(metrics.totalRevenue || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const totalCommissions = parseFloat(metrics.userCommissions || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard Principal</h1>
      
      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Ventas Totales</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-4xl font-bold text-slate-900">{totalRevenue}</p>
          <p className="text-sm text-slate-400 mt-2">Generadas por tu gestión</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Leads Activos</h3>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-4xl font-bold text-slate-900">{metrics.activeLeads}</p>
          <p className="text-sm text-slate-400 mt-2">Bajo tu visualización</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-md text-white transition-all hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-200 font-medium text-sm uppercase tracking-wider">Mis Comisiones</h3>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-4xl font-bold">{totalCommissions}</p>
          <p className="text-sm text-blue-200 mt-2">Devengadas históricamente</p>
        </div>
      </div>

      {/* Gráficas y Top Agentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica Principal (2/3 de ancho) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Tendencia de Ventas (Últimos 30 días)</h2>
          <div className="h-[300px] w-full">
            {isMounted && chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${parseFloat(value).toLocaleString()}`, 'Ventas']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                No hay ventas en los últimos 30 días
              </div>
            )}
          </div>
        </div>

        {/* Top Agentes (1/3 de ancho) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Top Agentes (Rendimiento)</h2>
          <div className="flex-1">
            {topAgents && topAgents.length > 0 ? (
              <div className="space-y-4">
                {topAgents.map((agent: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-600' :
                        index === 1 ? 'bg-slate-100 text-slate-600' :
                        index === 2 ? 'bg-orange-50 text-orange-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.deals} negocios cerrados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-sm">
                        ${parseFloat(agent.total_sales).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex items-center justify-center text-slate-400 text-center text-sm">
                Esta sección solo es visible para<br/>Supervisores y Administradores<br/>con ventas cerradas.
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
