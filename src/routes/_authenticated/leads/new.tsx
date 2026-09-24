import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createLeadFn } from '../../../lib/leads.functions';
import { getActiveEventsFn } from '../../../lib/events.functions';

export const Route = createFileRoute('/_authenticated/leads/new')({
  component: NewLeadCapture,
});

function NewLeadCapture() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    event_id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    interest_level: 'medium',
    notes: '',
  });

  const { data: events } = useQuery({
    queryKey: ['activeEvents'],
    queryFn: () => getActiveEventsFn(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createLeadFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      // Volver a la lista después de guardar con un ligero retraso para UX
      setTimeout(() => navigate({ to: '/leads' }), 300);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      event_id: formData.event_id || undefined,
      contact_info: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
      },
      interest_level: formData.interest_level,
      notes: formData.notes,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-1">Captura de Lead</h1>
          <p className="text-blue-100 text-sm">Modo Evento / Rápido</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Selección de Evento */}
          {events && events.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2">
              <label htmlFor="event_id" className="block text-sm font-semibold text-blue-900 mb-1">¿Estás en una feria/evento?</label>
              <select
                id="event_id"
                name="event_id"
                value={formData.event_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-blue-200 px-4 py-2.5 text-blue-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
              >
                <option value="">No, es un lead independiente</option>
                {events.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Datos Personales */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ej. María García"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="maria@empresa.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Detalles del Lead */}
          <div className="space-y-4">
            <div>
              <label htmlFor="interest_level" className="block text-sm font-medium text-slate-700 mb-1">Nivel de Interés</label>
              <select
                id="interest_level"
                name="interest_level"
                value={formData.interest_level}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
              >
                <option value="high">🔥 Alto (Cierre próximo)</option>
                <option value="medium">⭐ Medio (Interesado)</option>
                <option value="low">❄️ Bajo (Solo información)</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notas Rápidas</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="¿Qué producto le interesó? ¿Requiere llamada?"
              ></textarea>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: '/leads' })}
              className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-[2] py-3.5 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md active:scale-95 disabled:opacity-70 flex justify-center items-center"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar Lead'
              )}
            </button>
          </div>
          
          {mutation.isError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              Hubo un error al guardar. Revisa tu conexión.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
