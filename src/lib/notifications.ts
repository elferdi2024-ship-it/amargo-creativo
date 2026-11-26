// filepath: src/lib/notifications.ts
import { supabaseAdmin } from "./supabase";

export type NotificationType =
  | "proposal_accepted"
  | "document_uploaded"
  | "stage_changed"
  | "project_finished"
  | "invoice_issued"
  | "invoice_overdue"
  | "payment_received"
  | "webhook_test";

export interface CreateNotificationParams {
  type: NotificationType;
  proposalId?: string | null;
  projectId?: string | null;
  clientId?: string | null;
  invoiceId?: string | null;
  message: string;
  channel?: "whatsapp" | "email" | "both";
  webhookUrl?: string;
}

export async function dispatchOutboundWebhook(
  payload: Record<string, unknown>,
  explicitUrl?: string
): Promise<{ delivered: boolean; status?: number; skipped?: boolean; error?: string }> {
  const url =
    explicitUrl?.trim() ||
    (import.meta.env.AUTOMATION_WEBHOOK_URL as string | undefined)?.trim();

  if (!url) {
    return { delivered: false, skipped: true };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Amargo-Source": "amargo-studio-os",
      },
      body: JSON.stringify({
        source: "amargo-studio-os",
        timestamp: new Date().toISOString(),
        ...payload,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { delivered: res.ok, status: res.status };
  } catch (err) {
    return { delivered: false, error: err instanceof Error ? err.message : "webhook_error" };
  }
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const webhookRes = await dispatchOutboundWebhook(
      {
        event: params.type,
        proposal_id: params.proposalId || null,
        project_id: params.projectId || null,
        client_id: params.clientId || null,
        invoice_id: params.invoiceId || null,
        channel: params.channel || "whatsapp",
        message: params.message,
      },
      params.webhookUrl
    );

    const status = webhookRes.delivered ? "sent" : "pending";

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        type: params.type,
        proposal_id: params.proposalId || null,
        project_id: params.projectId || null,
        client_id: params.clientId || null,
        invoice_id: params.invoiceId || null,
        message: params.message,
        channel: params.channel || "whatsapp",
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("[Notifications] Error creating notification:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[Notifications] Exception creating notification:", err);
    return null;
  }
}

export function messageProposalAccepted(clientName: string, projectTitle: string, planName?: string) {
  return `Hola ${clientName}, confirmamos la aceptación de la propuesta "${projectTitle}"${planName ? ` (Plan ${planName})` : ""}. En las próximas horas coordinamos el kick-off. — Amargo Creativo`;
}

export function messageDocumentUploaded(clientName: string, docName: string) {
  return `Hola ${clientName}, subimos un nuevo documento a tu portal: "${docName}". Podés verlo desde tu Magic Link seguro. — Amargo Creativo`;
}

export function messageStageChanged(clientName: string, stageName: string, projectTitle: string) {
  return `Hola ${clientName}, tu proyecto "${projectTitle}" avanzó a la etapa: ${stageName}. Podés revisar el progreso en vivo desde tu portal. — Amargo Creativo`;
}

export function messageProjectFinished(clientName: string, projectTitle: string) {
  return `Hola ${clientName}, ¡el proyecto "${projectTitle}" fue finalizado y publicado en producción! Gracias por confiar en Amargo Creativo.`;
}

export function messagePaymentReceived(clientName: string, amount: string, invoiceNumber?: string) {
  return `Hola ${clientName}, confirmamos la recepción de tu pago por ${amount}${invoiceNumber ? ` correspondiente al comprobante ${invoiceNumber}` : ""}. ¡Muchas gracias! — Amargo Creativo`;
}
