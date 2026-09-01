// filepath: src/lib/notifications.ts
import { supabaseAdmin } from "./supabase";

export type NotificationType =
  | "proposal_accepted"
  | "document_uploaded"
  | "stage_changed"
  | "project_finished"
  | "invoice_issued"
  | "invoice_overdue"
  | "payment_received";

export interface CreateNotificationParams {
  type: NotificationType;
  proposalId?: string | null;
  projectId?: string | null;
  clientId?: string | null;
  invoiceId?: string | null;
  message: string;
  channel?: "whatsapp" | "email" | "both";
}

export async function createNotification(params: CreateNotificationParams) {
  try {
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
        status: "pending",
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

// Helpers de mensajes de automatización
export function messageProposalAccepted(clientName: string, projectTitle: string, planName?: string) {
  return `Hola ${clientName}, confirmamos la aceptación de la propuesta "${projectTitle}"${planName ? ` (Plan ${planName})` : ""}. En las próximas horas te contactamos para coordinar el kick-off. — AMARGO Agencia Creativa`;
}

export function messageDocumentUploaded(clientName: string, docName: string) {
  return `Hola ${clientName}, subimos un nuevo documento a tu portal: "${docName}". Podés verlo en tu Magic Link seguro. — AMARGO Agencia Creativa`;
}

export function messageStageChanged(clientName: string, stageName: string, projectTitle: string) {
  return `Hola ${clientName}, el proyecto "${projectTitle}" avanzó a la etapa: ${stageName}. Podés revisar los avances en vivo en tu portal. — AMARGO Agencia Creativa`;
}

export function messageProjectFinished(clientName: string, projectTitle: string) {
  return `Hola ${clientName}, ¡el proyecto "${projectTitle}" fue finalizado con éxito y publicado en producción! Gracias por confiar en AMARGO Agencia Creativa.`;
}

export function messagePaymentReceived(clientName: string, amount: string, invoiceNumber?: string) {
  return `Hola ${clientName}, confirmamos la recepción de tu pago por ${amount}${invoiceNumber ? ` correspondiente al comprobante ${invoiceNumber}` : ""}. ¡Muchas gracias! — AMARGO Agencia Creativa`;
}
