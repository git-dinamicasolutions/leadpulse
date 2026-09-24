import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getLeadsFn } from '../../../lib/leads.functions';
import { registerSaleFn } from '../../../lib/sales.functions';

export const Route = createFileRoute('/_authenticated/leads/')({
  component: LeadsList,
});

function LeadsList() {
  const queryClient = useQueryClient();
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [saleAmount, setSaleAmount] = useState('');

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: () => getLeadsFn(),
  });

  const saleMutation = useMutation({
    mutationFn: (data: any) => registerSaleFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSaleModalOpen(false);
      setSaleAmount('');
      setSelectedLead(null);
      alert('¡Venta registrada y comisiones calculadas con éxito!');
    },
  });

  const handleOpenSaleModal = (lead: any) => {
    setSelectedLead(lead);
    setSaleAmount('');
    setSaleModalOpen(true);
  };

  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !saleAmount) return;
    saleMutation.mutate({
      lead_id: selectedLead.id,
      amount: parseFloat(saleAmount),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prospectos (Leads)</h1>
          <p className="text-slate-600">Gestiona y haz seguimiento a tus oportunidades de venta.</p>
        </div>
        <Link
          to="/leads/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
        >
          + Captura Rápida
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 h-24"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          Error al cargar los leads.
        </div>
      ) : leads && leads.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                  <th className="p-4 font-semibold">Contacto</th>
                  <th className="p-4 font-semibold">Agente</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold">Interés</th>
                  <th className="p-4 font-semibold">Fecha</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{lead.contact_info?.name || 'Sin Nombre'}</div>
                      <div className="text-sm text-slate-500">{lead.contact_info?.email || lead.contact_info?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-700">{lead.agent_name || 'Sin Asignar'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${lead.status === 'Cerrado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-700 capitalize">{lead.interest_level || '-'}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {lead.status !== 'Cerrado' && (
                        <button
                          onClick={() => handleOpenSaleModal(lead)}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded transition-colors"
                        >
                          Cerrar Venta
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="text-slate-400 mb-4 text-5xl">📋</div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No hay leads todavía</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Comienza registrando prospectos en tu próximo evento o añade clientes directamente.
          </p>
          <Link
            to="/leads/new"
            className="inline-block bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Añadir mi primer Lead
          </Link>
        </div>
      )}

      {/* Modal de Venta */}
      {saleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Registrar Venta</h2>
              <p className="text-slate-600 mb-6 text-sm">
                Has cerrado el trato con <span className="font-semibold text-slate-900">{selectedLead?.contact_info?.name}</span>. Ingresa el monto para calcular tus comisiones.
              </p>
              
              <form onSubmit={handleRegisterSale}>
                <div className="mb-6">
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Monto de la Venta (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      id="amount"
                      min="1"
                      step="0.01"
                      required
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 pl-8 pr-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-lg font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSaleModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saleMutation.isPending}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
                  >
                    {saleMutation.isPending ? 'Procesando...' : 'Confirmar Venta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
