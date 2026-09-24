-- Enum de roles
CREATE TYPE public.user_role AS ENUM ('admin', 'supervisor', 'agent');

-- Tabla de usuarios (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role public.user_role NOT NULL DEFAULT 'agent',
  supervisor_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  budget numeric DEFAULT 0,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Tabla de leads
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.profiles(id),
  event_id uuid REFERENCES public.events(id),
  status text NOT NULL DEFAULT 'Nuevo',
  contact_info jsonb NOT NULL,
  interest_level text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id),
  agent_id uuid NOT NULL REFERENCES public.profiles(id),
  amount numeric NOT NULL,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Tabla de comisiones
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  role_at_time public.user_role NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Ejemplo básico de políticas
CREATE POLICY "Admins can do everything" ON public.profiles FOR ALL USING (true);
-- Las políticas de RLS completas se implementarán iterativamente.
