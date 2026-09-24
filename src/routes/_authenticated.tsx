import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { logoutFn, getSessionFn } from '../lib/auth.functions';

// En un esquema real, llamaríamos a una server function para validar sesión
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    // La protección real se hace a nivel de loaders por ahora.
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { data: user } = useQuery({
    queryKey: ['session'],
    queryFn: () => getSessionFn(),
  });

  const handleLogout = async () => {
    await logoutFn();
    window.location.href = '/';
  };

  const getRoleBadge = (role?: string) => {
    if (role === 'admin') return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded uppercase">Administrador</span>;
    if (role === 'supervisor') return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded uppercase">Supervisor</span>;
    return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded uppercase">Agente</span>;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar de navegación */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📈</span> LeadPulse
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/dashboard" className="block px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors [&.active]:bg-blue-600 [&.active]:font-medium">Dashboard</Link>
          <Link to="/leads" className="block px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors [&.active]:bg-blue-600 [&.active]:font-medium">Leads</Link>
          <Link to="/events" className="block px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors [&.active]:bg-blue-600 [&.active]:font-medium">Eventos</Link>
          <Link to="/team" className="block px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors [&.active]:bg-blue-600 [&.active]:font-medium">Equipo</Link>
          <Link to="/reports" className="block px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors [&.active]:bg-blue-600 [&.active]:font-medium">Reportes</Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">{user?.full_name || 'Cargando...'}</p>
              <div className="mt-1">{getRoleBadge(user?.role)}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden">
              {user?.full_name?.charAt(0) || '?'}
            </div>
          </div>
        </header>

        {/* Contenedor scrolleable */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
