import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createEventFn } from '../../../lib/events.functions';

export const Route = createFileRoute('/_authenticated/events/new')({
  component: NewEventPage,
});

function NewEventPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    start_date: '',
    end_date: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createEventFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate({ to: '/events' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name: formData.name,
      budget: parseFloat(formData.budget) || 0,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate({ to: '/events' })}
          className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium transition-colors"
        >
          ← Volver a Eventos
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Crear Nuevo Evento</h1>
          <p className="text-slate-500 mt-1">Registra una feria o campaña para rastrear su rendimiento.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nombre del Evento *</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ej. Expo Mueble 2026"
              />
            </div>
            
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-1">Presupuesto (Costo Total) en USD *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  required
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 pl-8 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="5000.00"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">El costo total de stands, viáticos y marketing. Se usará para calcular el ROI.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: '/events' })}
              className="py-2.5 px-5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="py-2.5 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex items-center"
            >
              {mutation.isPending ? 'Guardando...' : 'Crear Evento'}
            </button>
          </div>
          
          {mutation.isError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              Hubo un error al guardar el evento. Intenta nuevamente.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
