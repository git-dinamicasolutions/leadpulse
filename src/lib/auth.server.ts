import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { sql } from "./db.server";

export type UserRole = 'admin' | 'supervisor' | 'agent';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export async function getSession(): Promise<UserSession | null> {
  const userId = getCookie("leadpulse_session");
  
  if (!userId) {
    if (process.env.NODE_ENV === 'development') {
      return {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@leadpulse.test',
        role: 'admin',
        full_name: 'Administrador Prueba',
      };
    }
    return null;
  }

  const [user] = await sql<UserSession[]>`
    SELECT id, email, role, full_name
    FROM public.profiles
    WHERE id = ${userId}
  `;

  return user || null;
}

export async function requireAuth(): Promise<UserSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('No autorizado');
  }
  return session;
}

export async function loginUser(email: string) {
  const [user] = await sql`
    SELECT id FROM public.profiles WHERE email = ${email}
  `;

  if (!user) throw new Error("Usuario no encontrado");

  setCookie("leadpulse_session", user.id, {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    httpOnly: true,
    sameSite: "lax"
  });

  return { success: true };
}

export async function logoutUser() {
  deleteCookie("leadpulse_session");
  return { success: true };
}
