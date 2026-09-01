-- ============================================
-- AMARGO CREATIVO - SCHEMA UNIFICADO COMPLETO
-- ============================================
-- Incluye: Propuestas + Portal + Content Engine + 
-- Project Health + Notificaciones + Facturación (UY)
-- ============================================

-- 1. CLIENTES
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  rut TEXT,                    -- preparado para facturación UY
  address TEXT,
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
  
  -- Plantillas reutilizables
  is_template BOOLEAN DEFAULT false,
  template_name TEXT,
  cloned_from UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  
  -- Aceptación
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
CREATE INDEX IF NOT EXISTS idx_proposals_template ON public.proposals(is_template) WHERE is_template = true;
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
  
  -- Project Health
  last_checkin_at TIMESTAMPTZ,
  health_status TEXT DEFAULT 'green'
    CHECK (health_status IN ('green', 'yellow', 'red')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_proposal ON public.projects(proposal_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_health ON public.projects(health_status);

-- 4. DOCUMENTOS (propuestas / proyectos)
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

-- 6. CONTENT ENGINE
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

-- 7. NOTIFICACIONES (Automatizaciones)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- proposal_accepted | document_uploaded | stage_changed | project_finished | payment_received | invoice_overdue
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_id UUID,
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'both')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- 8. FACTURACIÓN (Uruguay - preparado para CFE)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  
  number TEXT,                          -- ej: A-0001-00001234
  series TEXT DEFAULT 'A',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'issued', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
  
  issue_date DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  
  currency TEXT DEFAULT 'UYU',
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 22,     -- IVA Uruguay
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  
  items JSONB DEFAULT '[]',             -- [{description, quantity, unit_price, total}]
  
  notes TEXT,
  payment_terms TEXT,
  
  -- Campos preparados para CFE / DGI (futuro)
  cfe_type TEXT,                        -- 101 = e-Factura, 111 = e-Ticket, etc.
  cfe_serie TEXT,
  cfe_number TEXT,
  cfe_cae TEXT,
  cfe_xml TEXT,
  cfe_pdf_url TEXT,
  cfe_signed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- 9. PAGOS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'UYU',
  method TEXT,                          -- transferencia, mercadopago, efectivo, stripe, etc.
  reference TEXT,
  paid_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON public.payments(client_id);

-- 10. DOCUMENTOS DE FACTURA
CREATE TABLE IF NOT EXISTS public.invoice_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT,
  type TEXT DEFAULT 'other' CHECK (type IN ('invoice_pdf', 'receipt', 'credit_note', 'other')),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_documents_invoice ON public.invoice_documents(invoice_id);

-- Agregar FK de notifications → invoices si no existiera
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_documents ENABLE ROW LEVEL SECURITY;

-- Políticas de servicio (admin usa service_role)
CREATE POLICY "Service role full access clients" ON public.clients FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access proposals" ON public.proposals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access projects" ON public.projects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access documents" ON public.documents FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access templates" ON public.contract_templates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access content" ON public.content_pieces FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access notifications" ON public.notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access invoices" ON public.invoices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access payments" ON public.payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access invoice_documents" ON public.invoice_documents FOR ALL USING (auth.role() = 'service_role');

-- Lectura pública controlada
CREATE POLICY "Public read active proposals by slug"
  ON public.proposals FOR SELECT
  USING (status IN ('active', 'accepted'));

CREATE POLICY "Public read visible documents"
  ON public.documents FOR SELECT
  USING (visible_to_client = true);
