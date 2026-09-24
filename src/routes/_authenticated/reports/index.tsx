import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getGeneralReportFn } from '../../../lib/reports.functions';
import { getActiveEventsFn } from '../../../lib/events.functions';
import { getTeamFn } from '../../../lib/team.functions';

export const Route = createFileRoute('/_authenticated/reports/')({
  component: ReportsPage,
});

function ReportsPage() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventId: '',
    agentId: '',
  });

  const { data: events } = useQuery({
    queryKey: ['activeEvents'],
    queryFn: () => getActiveEventsFn(),
  });

  const { data: team } = useQuery({
    queryKey: ['team'],
    queryFn: () => getTeamFn(),
  });

  const { data: reportDataResponse, isLoading, error } = useQuery({
    queryKey: ['generalReport', filters],
    queryFn: () => getGeneralReportFn({ data: {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      eventId: filters.eventId || undefined,
      agentId: filters.agentId || undefined,
    } }),
  });

  const reportData = reportDataResponse?.sales || [];
  const summary = reportDataResponse?.summary || { totalRevenue: 0, totalCommissions: 0, totalLeads: 0 };

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;

    const headers = ['Fecha', 'Agente', 'Lead / Cliente', 'Empresa', 'Feria/Evento', 'Ingreso Neto (Venta)', 'Comisiones Pagadas', 'Estado'];
    const csvRows = reportData.map((row: any) => [
      new Date(row.sale_date).toLocaleDateString(),
      `"${row.agent_name || ''}"`,
      `"${row.lead_name || ''}"`,
      `"${row.lead_company || ''}"`,
      `"${row.event_name || 'Sin Evento'}"`,
      row.revenue,
      row.total_commissions || 0,
      row.sale_status
    ]);
    const csvContent = [headers.join(','), ...csvRows.map((row: any) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LeadPulse_Reporte_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center">
        <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
        <p>Los reportes consolidados solo están disponibles para Administradores y Supervisores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reporte Consolidado</h1>
          <p className="text-slate-600">Historial completo de ventas generadas y comisiones pagadas.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!reportData || reportData.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Exportar a CSV
        </button>
      </div>

      {/* Tarjetas de Resumen Dinámico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💰</span>
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Ventas Filtradas</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {summary.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
          <p className="text-sm text-slate-400 mt-1">{reportData.length} transacciones cerradas</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Leads Totales</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{summary.totalLeads}</p>
          <p className="text-sm text-slate-400 mt-1">Prospectos capturados en este filtro</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🤝</span>
            <h3 className="text-blue-700 font-medium text-sm uppercase tracking-wider">Comisiones Totales</h3>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {summary.totalCommissions.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
          <p className="text-sm text-blue-600 mt-1">Repartidas a la fuerza de ventas</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Desde</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Hasta</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Evento</label>
          <select name="eventId" value={filters.eventId} onChange={handleChange} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
            <option value="">Todos los eventos</option>
            {events?.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Agente</label>
          <select name="agentId" value={filters.agentId} onChange={handleChange} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
            <option value="">Todos los agentes</option>
            {team?.map((t: any) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </select>
        </div>
        <button onClick={() => setFilters({ startDate: '', endDate: '', eventId: '', agentId: '' })} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Limpiar</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Agente</th>
                <th className="p-4 font-semibold">Lead</th>
                <th className="p-4 font-semibold">Feria / Evento</th>
                <th className="p-4 font-semibold text-right">Venta (Ingreso)</th>
                <th className="p-4 font-semibold text-right">Comisiones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Buscando reportes...</td></tr>
              ) : reportData?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay ventas que coincidan con los filtros.</td></tr>
              ) : reportData?.map((row: any) => (
                <tr key={row.sale_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(row.sale_date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{row.agent_name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-900">{row.lead_name}</div>
                    <div className="text-xs text-slate-500">{row.lead_company}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {row.event_name ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {row.event_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-600">
                    ${parseFloat(row.revenue).toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-medium text-blue-600">
                    ${parseFloat(row.total_commissions || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
