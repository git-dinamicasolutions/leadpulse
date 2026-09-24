import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getTeamFn, assignSupervisorFn, createTeamMemberFn } from '../../../lib/team.functions';

export const Route = createFileRoute('/_authenticated/team/')({
  component: TeamManagement,
});

function TeamManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'agent',
  });

  const { data: team, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => getTeamFn(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createTeamMemberFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setIsModalOpen(false);
      setFormData({ full_name: '', email: '', role: 'agent' });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => assignSupervisorFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleAssign = (agentId: string, supervisorId: string) => {
    assignMutation.mutate({
      agent_id: agentId,
      supervisor_id: supervisorId === '' ? null : supervisorId,
    });
  };

  const supervisors = team?.filter((member: any) => member.role === 'supervisor' || member.role === 'admin') || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Equipo y Jerarquías</h1>
          <p className="text-slate-600">Gestiona a tus agentes comerciales y asígnales un supervisor.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
        >
          + Nuevo Miembro
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
              <th className="p-4 font-semibold">Miembro del Equipo</th>
              <th className="p-4 font-semibold">Rol</th>
              <th className="p-4 font-semibold">Supervisor Asignado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={3} className="p-4 text-center text-slate-500">Cargando...</td></tr>
            ) : team?.map((member: any) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-slate-900">{member.full_name}</div>
                  <div className="text-sm text-slate-500">{member.email}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'supervisor' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="p-4">
                  {member.role === 'agent' ? (
                    <select
                      value={member.supervisor_id || ''}
                      onChange={(e) => handleAssign(member.id, e.target.value)}
                      disabled={assignMutation.isPending}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 outline-none disabled:opacity-50"
                    >
                      <option value="">-- Sin Supervisor --</option>
                      {supervisors.map((sup: any) => (
                        <option key={sup.id} value={sup.id}>{sup.full_name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm text-slate-400 italic">No aplica</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Añadir Miembro</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input
                  required
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
                >
                  <option value="agent">Agente de Ventas</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
