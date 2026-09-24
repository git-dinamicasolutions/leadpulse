import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { loginFn } from '../lib/auth.functions';

export const Route = createFileRoute('/')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  
  const loginMutation = useMutation({
    mutationFn: (data: any) => loginFn({ data }),
    onSuccess: () => {
      // Redirigir al dashboard y recargar para refrescar sesión
      window.location.href = '/dashboard';
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl">
            📈
          </div>
          <h1 className="text-3xl font-bold text-slate-900">LeadPulse</h1>
          <p className="text-slate-500 mt-2">Plataforma de Ventas y Comisiones</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Simulador de Login (Email)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@leadpulse.test"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-2">
              Ingresa el email de cualquier usuario registrado en la pestaña "Equipo" para iniciar sesión como él (sin contraseña).
            </p>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70"
          >
            {loginMutation.isPending ? 'Ingresando...' : 'Entrar al Sistema'}
          </button>
          
          {loginMutation.isError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              Usuario no encontrado en la base de datos.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
