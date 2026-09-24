import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getEventsFn } from '../../../lib/events.functions';

export const Route = createFileRoute('/_authenticated/events/')({
  component: EventsList,
});

function EventsList() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => getEventsFn(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Eventos y Ferias</h1>
          <p className="text-slate-600">Mide el Retorno de Inversión (ROI) de tus campañas presenciales.</p>
        </div>
        <Link
          to="/events/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
        >
          + Nuevo Evento
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 h-32"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          Error al cargar los eventos.
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {events.map((event: any) => {
            const revenue = parseFloat(event.total_revenue || 0);
            const budget = parseFloat(event.budget || 0);
            const profit = revenue - budget;
            const isProfitable = profit >= 0;

            return (
              <div key={event.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>
                    <p className="text-sm text-slate-500">
                      {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'Sin fecha'} 
                      {event.end_date ? ` - ${new Date(event.end_date).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                    event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {event.status === 'active' ? 'Activo' : 'Finalizado'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Presupuesto</p>
                    <p className="font-semibold text-slate-700">${budget.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Leads</p>
                    <p className="font-semibold text-slate-700">{event.total_leads}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Ventas</p>
                    <p className="font-semibold text-slate-700">${revenue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-500">ROI / Ganancia Neta:</span>
                  <span className={`text-lg font-bold ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isProfitable ? '+' : ''}${profit.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="text-slate-400 mb-4 text-5xl">🎪</div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No hay eventos registrados</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Crea tu primera feria comercial para empezar a medir el retorno de inversión y agrupar los leads de tu equipo.
          </p>
          <Link
            to="/events/new"
            className="inline-block bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Añadir mi primer Evento
          </Link>
        </div>
      )}
    </div>
  );
}
