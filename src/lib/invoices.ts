// filepath: src/lib/invoices.ts
import { supabaseAdmin } from "./supabase";
import { formatMoney, formatDate, whatsappHref } from "./format";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number; // 22, 10, or 0
  total: number;
}

export type CFETypeCode = "111" | "101" | "112" | "102" | "113";

export interface CFETypeMeta {
  code: CFETypeCode;
  name: string;
  shortName: string;
  description: string;
  requiresRut: boolean;
}

export const CFE_TYPES: Record<CFETypeCode, CFETypeMeta> = {
  "111": {
    code: "111",
    name: "e-Factura",
    shortName: "e-Factura",
    description: "Comprobante oficial para clientes con RUT (Empresas en Uruguay)",
    requiresRut: true,
  },
  "101": {
    code: "101",
    name: "e-Ticket",
    shortName: "e-Ticket",
    description: "Comprobante oficial para Consumidor Final (con o sin CI)",
    requiresRut: false,
  },
  "112": {
    code: "112",
    name: "e-Factura Exportación",
    shortName: "e-Fac Export",
    description: "Para clientes en el exterior (IVA Exento 0% Uruguay)",
    requiresRut: false,
  },
  "102": {
    code: "102",
    name: "Nota de Crédito de e-Ticket",
    shortName: "NC e-Ticket",
    description: "Anulación o devolución parcial para e-Tickets",
    requiresRut: false,
  },
  "113": {
    code: "113",
    name: "Nota de Crédito de e-Factura",
    shortName: "NC e-Factura",
    description: "Anulación o bonificación para empresas con RUT",
    requiresRut: true,
  },
};

export interface CompanyFiscalSettings {
  rut: string;
  razon_social: string;
  nombre_fantasia: string;
  giro: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  pais: string;
  telefono: string;
  email: string;
  sucursal_dgi: string;
  cae_numero: string;
  cae_rango_desde: number;
  cae_rango_hasta: number;
  cae_vencimiento: string;
  brou_cuenta: string;
  itau_cuenta: string;
  santander_cuenta: string;
  mercadopago_link: string;
  nota_pie_defecto: string;
}

export const DEFAULT_FISCAL_SETTINGS: CompanyFiscalSettings = {
  rut: "218904550014",
  razon_social: "AMARGO CREATIVO S.A.S.",
  nombre_fantasia: "AMARGO CREATIVO",
  giro: "Servicios de Software, Consultoría Web & Diseño Digital",
  direccion: "República Argentina y Rambla Costanera",
  ciudad: "Atlántida",
  departamento: "Canelones",
  pais: "Uruguay",
  telefono: "+598 98 300 491",
  email: "hola@amargocreativo.uy",
  sucursal_dgi: "001 - Casa Central",
  cae_numero: "2026-904128",
  cae_rango_desde: 1,
  cae_rango_hasta: 10000,
  cae_vencimiento: "2027-12-31",
  brou_cuenta: "BROU C/A 001558291-00001 ($ UYU)",
  itau_cuenta: "Banco Itaú C/A 7891234 ($ UYU / US$ USD)",
  santander_cuenta: "Banco Santander C/C 4501923 ($ UYU)",
  mercadopago_link: "https://mpago.la/amargo-creativo",
  nota_pie_defecto: "Resolución DGI N° 2026/CFE. Comprobante Fiscal Electrónico emitido de conformidad con la normativa tributaria de la República Oriental del Uruguay.",
};

// Variable en memoria para retener configuraciones editadas en la sesión del servidor
let currentFiscalSettings: CompanyFiscalSettings = { ...DEFAULT_FISCAL_SETTINGS };

export function getFiscalSettings(): CompanyFiscalSettings {
  return { ...currentFiscalSettings };
}

export function updateFiscalSettings(updates: Partial<CompanyFiscalSettings>): CompanyFiscalSettings {
  currentFiscalSettings = {
    ...currentFiscalSettings,
    ...updates,
  };
  return { ...currentFiscalSettings };
}

export interface Invoice {
  id: string;
  client_id: string;
  project_id?: string;
  proposal_id?: string;
  number?: string;
  series?: string;
  status: "draft" | "issued" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
  issue_date?: string;
  due_date?: string;
  paid_at?: string;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  items: InvoiceItem[];
  notes?: string;
  payment_terms?: string;
  cfe_type?: CFETypeCode | string;
  cfe_serie?: string;
  cfe_number?: string;
  cfe_cae?: string;
  cfe_xml?: string;
  cfe_pdf_url?: string;
  cfe_signed_at?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    id?: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    rut?: string;
    address?: string;
    city?: string;
    department?: string;
  };
  projects?: {
    id?: string;
    title: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoice_id: string;
  client_id?: string;
  amount: number;
  currency: string;
  method?: string;
  reference?: string;
  paid_at: string;
  notes?: string;
}

export interface TotalsCalculation {
  subtotal: number;
  tax_amount: number;
  total: number;
  tax_breakdown: {
    basic_subtotal: number;
    basic_tax: number;
    min_subtotal: number;
    min_tax: number;
    exempt_subtotal: number;
  };
}

export function calculateInvoiceTotals(items: InvoiceItem[], defaultTaxRate = 22): TotalsCalculation {
  let subtotal = 0;
  let basic_subtotal = 0;
  let basic_tax = 0;
  let min_subtotal = 0;
  let min_tax = 0;
  let exempt_subtotal = 0;

  for (const item of items) {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unit_price) || 0;
    const lineTotal = Number(item.total) || (qty * price);
    const rate = typeof item.tax_rate === "number" ? item.tax_rate : defaultTaxRate;

    subtotal += lineTotal;

    if (rate === 22) {
      basic_subtotal += lineTotal;
      basic_tax += (lineTotal * 0.22);
    } else if (rate === 10) {
      min_subtotal += lineTotal;
      min_tax += (lineTotal * 0.10);
    } else {
      exempt_subtotal += lineTotal;
    }
  }

  const tax_amount = Math.round((basic_tax + min_tax) * 100) / 100;
  const total = Math.round((subtotal + tax_amount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount,
    total,
    tax_breakdown: {
      basic_subtotal: Math.round(basic_subtotal * 100) / 100,
      basic_tax: Math.round(basic_tax * 100) / 100,
      min_subtotal: Math.round(min_subtotal * 100) / 100,
      min_tax: Math.round(min_tax * 100) / 100,
      exempt_subtotal: Math.round(exempt_subtotal * 100) / 100,
    },
  };
}

export function generateInvoiceNumber(series = "A", count = 1, cfeType = "111"): string {
  const paddedCount = String(count).padStart(7, "0");
  return `${series}-${cfeType}-${paddedCount}`;
}

export function getCFETypeMeta(code?: string): CFETypeMeta {
  if (code && code in CFE_TYPES) {
    return CFE_TYPES[code as CFETypeCode];
  }
  return CFE_TYPES["111"];
}

export async function createInvoice(data: {
  client_id: string;
  project_id?: string;
  proposal_id?: string;
  items: InvoiceItem[];
  issue_date?: string;
  due_date?: string;
  currency?: string;
  tax_rate?: number;
  notes?: string;
  payment_terms?: string;
  series?: string;
  cfe_type?: CFETypeCode | string;
  number?: string;
}) {
  const taxRate = data.tax_rate ?? 22;
  const { subtotal, tax_amount, total } = calculateInvoiceTotals(data.items, taxRate);
  const cfeType = data.cfe_type || "111";
  const series = data.series || "A";

  // Generar número correlativo
  let invoiceNumber = data.number;
  if (!invoiceNumber) {
    const { count } = await supabaseAdmin
      .from("invoices")
      .select("*", { count: "exact", head: true });
    invoiceNumber = generateInvoiceNumber(series, (count || 0) + 1, cfeType);
  }

  const settings = getFiscalSettings();

  const { data: invoice, error } = await supabaseAdmin
    .from("invoices")
    .insert({
      client_id: data.client_id,
      project_id: data.project_id || null,
      proposal_id: data.proposal_id || null,
      number: invoiceNumber,
      series,
      status: "draft",
      issue_date: data.issue_date || new Date().toISOString().slice(0, 10),
      due_date: data.due_date || null,
      currency: data.currency || "UYU",
      subtotal,
      tax_rate: taxRate,
      tax_amount,
      total,
      items: data.items,
      notes: data.notes || null,
      payment_terms: data.payment_terms || "Pago por transferencia bancaria (BROU / Itaú / Santander)",
      cfe_type: cfeType,
      cfe_serie: series,
      cfe_number: invoiceNumber,
      cfe_cae: settings.cae_numero,
    })
    .select()
    .single();

  if (error) throw error;
  return invoice;
}

export async function markInvoiceAsPaid(
  invoiceId: string,
  payment: {
    amount: number;
    currency?: string;
    method?: string;
    reference?: string;
    notes?: string;
    paid_at?: string;
  }
) {
  const { data: invoice, error: invError } = await supabaseAdmin
    .from("invoices")
    .select("*, clients(name, email, phone)")
    .eq("id", invoiceId)
    .single();

  if (invError || !invoice) throw new Error("Factura no encontrada");

  // 1. Registrar pago
  const { data: paymentRecord, error: payError } = await supabaseAdmin
    .from("payments")
    .insert({
      invoice_id: invoiceId,
      client_id: invoice.client_id,
      amount: payment.amount,
      currency: payment.currency || invoice.currency,
      method: payment.method || "Transferencia bancaria",
      reference: payment.reference || null,
      notes: payment.notes || null,
      paid_at: payment.paid_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (payError) throw payError;

  // 2. Calcular total de pagos registrados
  const { data: allPayments } = await supabaseAdmin
    .from("payments")
    .select("amount")
    .eq("invoice_id", invoiceId);

  const totalPaid = (allPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const newStatus = totalPaid >= invoice.total ? "paid" : "partial";

  await supabaseAdmin
    .from("invoices")
    .update({
      status: newStatus,
      paid_at: newStatus === "paid" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  return { ok: true, status: newStatus, payment: paymentRecord, totalPaid };
}

export async function simulateCFESignature(invoiceId: string) {
  const timestamp = new Date().toISOString();
  const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const hashMock = `DGI-SHA256-${randomHex.toUpperCase()}`;

  const { data: invoice, error } = await supabaseAdmin
    .from("invoices")
    .update({
      status: "issued",
      cfe_signed_at: timestamp,
      cfe_xml: `<CFE xmlns="http://cfe.dgi.gub.uy"><Encabezado><IdDoc><TipoCFE>111</TipoCFE><Serie>A</Serie><FirmaDigital>${hashMock}</FirmaDigital></IdDoc></Encabezado></CFE>`,
      updated_at: timestamp,
    })
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) throw error;
  return invoice;
}

// ----------------------------------------------------
// Generadores de Enlaces de WhatsApp para Clientes
// ----------------------------------------------------

export function generateWhatsAppInvoiceLink(
  invoice: Invoice,
  clientName?: string,
  originUrl?: string
): string {
  const settings = getFiscalSettings();
  const cfeMeta = getCFETypeMeta(invoice.cfe_type);
  const baseUrl = originUrl || "https://amargo-creativo.pages.dev";
  const publicLink = `${baseUrl}/comprobante/${invoice.id}`;
  const amountStr = formatMoney(Number(invoice.total), invoice.currency);
  const dueDateStr = invoice.due_date ? formatDate(invoice.due_date) : "A convenir";
  const name = clientName || invoice.clients?.name || "Estimado/a";

  const message = `👋 Hola ${name}, te compartimos el comprobante oficial de ${settings.nombre_fantasia}:

🧾 *${cfeMeta.shortName}*: ${invoice.number || "Comprobante"}
💰 *Monto Total*: ${amountStr}
📅 *Fecha de Vencimiento*: ${dueDateStr}

📄 Podés consultar el estado de cuenta y descargar el PDF fiscal oficial aquí:
👉 ${publicLink}

🏦 *Cuentas disponibles para transferencia*:
• ${settings.brou_cuenta}
• ${settings.itau_cuenta}

Por favor, envianos el comprobante una vez realizada la transferencia. ¡Muchas gracias!`;

  return whatsappHref(message, invoice.clients?.phone);
}

export function generateWhatsAppReminderLink(
  invoice: Invoice,
  clientName?: string,
  originUrl?: string
): string {
  const settings = getFiscalSettings();
  const baseUrl = originUrl || "https://amargo-creativo.pages.dev";
  const publicLink = `${baseUrl}/comprobante/${invoice.id}`;
  const amountStr = formatMoney(Number(invoice.total), invoice.currency);
  const dueDateStr = invoice.due_date ? formatDate(invoice.due_date) : "pronto";
  const name = clientName || invoice.clients?.name || "Estimado/a";

  const message = `👋 Hola ${name}, te saludamos desde ${settings.nombre_fantasia}.

Te recordamos cordialmente que la factura *${invoice.number}* por un total de *${amountStr}* tiene fecha de vencimiento para el *${dueDateStr}*.

Podés revisar el estado actualizado en tu portal directo:
👉 ${publicLink}

Cuentas para depósito:
• ${settings.brou_cuenta}
• ${settings.itau_cuenta}

Si ya realizaste la transferencia, por favor desestimá este mensaje y dejanos el comprobante por acá. ¡Muchas gracias!`;

  return whatsappHref(message, invoice.clients?.phone);
}

export function generateWhatsAppReceiptLink(
  invoice: Invoice,
  paymentAmount: number,
  clientName?: string,
  originUrl?: string
): string {
  const settings = getFiscalSettings();
  const baseUrl = originUrl || "https://amargo-creativo.pages.dev";
  const publicLink = `${baseUrl}/comprobante/${invoice.id}`;
  const amountStr = formatMoney(paymentAmount, invoice.currency);
  const name = clientName || invoice.clients?.name || "Estimado/a";

  const message = `✅ Hola ${name}, confirmamos que se acreditó tu pago por *${amountStr}* correspondiente a la factura *${invoice.number}*.

Tu estado de cuenta ya se encuentra actualizado y podés descargar tu recibo oficial en el siguiente enlace:
👉 ${publicLink}

¡Muchas gracias por confiar en ${settings.nombre_fantasia}!`;

  return whatsappHref(message, invoice.clients?.phone);
}

