// filepath: src/lib/invoices.ts
import { supabaseAdmin } from "./supabase";
import { formatMoney, formatDate } from "./format";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
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
  cfe_type?: string;
  cfe_serie?: string;
  cfe_number?: string;
  cfe_cae?: string;
  cfe_xml?: string;
  cfe_pdf_url?: string;
  cfe_signed_at?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    rut?: string;
    address?: string;
  };
  projects?: {
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

export function calculateInvoiceTotals(items: InvoiceItem[], taxRate = 22) {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || (Number(item.quantity) * Number(item.unit_price)) || 0), 0);
  const tax_amount = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
  const total = Math.round((subtotal + tax_amount) * 100) / 100;
  return { subtotal, tax_amount, total };
}

export function generateInvoiceNumber(series = "A", count = 1): string {
  const paddedCount = String(count).padStart(8, "0");
  return `${series}-001-${paddedCount}`;
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
  number?: string;
}) {
  const taxRate = data.tax_rate ?? 22;
  const { subtotal, tax_amount, total } = calculateInvoiceTotals(data.items, taxRate);

  // Generar número si no se suministró
  let invoiceNumber = data.number;
  if (!invoiceNumber) {
    const { count } = await supabaseAdmin
      .from("invoices")
      .select("*", { count: "exact", head: true });
    invoiceNumber = generateInvoiceNumber(data.series || "A", (count || 0) + 1);
  }

  const { data: invoice, error } = await supabaseAdmin
    .from("invoices")
    .insert({
      client_id: data.client_id,
      project_id: data.project_id || null,
      proposal_id: data.proposal_id || null,
      number: invoiceNumber,
      series: data.series || "A",
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
      payment_terms: data.payment_terms || "Pago al contado / Transferencia bancaria",
      cfe_type: "101", // Default e-Factura CFE
      cfe_serie: data.series || "A",
      cfe_number: invoiceNumber,
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
      method: payment.method || "Transferencia",
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
