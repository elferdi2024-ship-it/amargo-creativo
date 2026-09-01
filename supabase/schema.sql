-- ============================================
-- AMARGO CREATIVO - SCHEMA FINAL + RLS + SEED
-- ============================================

-- 1. CLIENTES
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROPUESTAS
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  project_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'accepted', 'rejected', 'disabled')),
  
  value_phrase TEXT,
  challenge TEXT,
  solution TEXT,
  includes TEXT[] DEFAULT '{}',
  excludes TEXT[] DEFAULT '{}',
  
  investment JSONB NOT NULL DEFAULT '{"type":"fixed","currency":"USD","amount":0}',
  timeline TEXT,
  roi_table JSONB,
  
  whatsapp_message TEXT,
  notes TEXT,
  
  accepted_name TEXT,
  accepted_contact TEXT,
  accepted_plan TEXT,
  accepted_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposals_slug ON public.proposals(slug);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_client ON public.proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON public.proposals(created_at DESC);

-- 3. PROYECTOS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'finished', 'cancelled')),
  current_stage INTEGER DEFAULT 1,
  stages JSONB NOT NULL DEFAULT '[]',
  start_date DATE,
  estimated_end_date DATE,
  last_checkin_at TIMESTAMPTZ,
  health_status TEXT DEFAULT 'green'
    CHECK (health_status IN ('green', 'yellow', 'red')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_proposal ON public.projects(proposal_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- 4. DOCUMENTOS
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other'
    CHECK (type IN ('contract', 'proposal', 'deliverable', 'brief', 'other')),
  storage_path TEXT NOT NULL,
  url TEXT,
  visible_to_client BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_client ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_proposal ON public.documents(proposal_id);

-- 5. PLANTILLAS DE CONTRATO
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CONTENT ENGINE (PIEZAS DE CONTENIDO GENERADAS)
CREATE TABLE IF NOT EXISTS public.content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('case_study', 'linkedin', 'instagram', 'web', 'email', 'other')),
  title TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_project ON public.content_pieces(project_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content_pieces(type);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content_pieces(status);
CREATE INDEX IF NOT EXISTS idx_content_created ON public.content_pieces(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active proposals by slug"
  ON public.proposals FOR SELECT
  USING (status IN ('active', 'accepted'));

CREATE POLICY "Service role full access proposals"
  ON public.proposals FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access clients"
  ON public.clients FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access projects"
  ON public.projects FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access documents"
  ON public.documents FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access templates"
  ON public.contract_templates FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access content"
  ON public.content_pieces FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Public read visible documents"
  ON public.documents FOR SELECT
  USING (visible_to_client = true);
