// filepath: src/lib/contracts.ts
import { formatDate, formatMoney } from "./format";

export interface ContractTemplate {
  id?: string;
  name: string;
  description: string;
  content: string;
  variables: string[];
}

export const DEFAULT_TEMPLATES: ContractTemplate[] = [
  {
    name: "Orden de Servicio (Simple)",
    description: "Ideal para proyectos ágiles, landing pages y sprints de desarrollo.",
    variables: [
      "id",
      "date",
      "client_name",
      "project_title",
      "accepted_at",
      "solution",
      "includes",
      "excludes",
      "amount",
      "currency",
      "payment_terms",
      "timeline",
      "accepted_name",
      "accepted_contact",
    ],
    content: `ORDEN DE SERVICIO N° {{id}}

Fecha: {{date}}
Cliente: {{client_name}}
Proyecto: {{project_title}}

1. OBJETO
Amargo Creativo se compromete a realizar el servicio de {{project_title}} según el alcance detallado en la propuesta comercial aceptada el {{accepted_at}}.

2. ALCANCE
{{solution}}

Incluye:
{{includes}}

No incluye:
{{excludes}}

3. INVERSIÓN Y FORMA DE PAGO
Monto total: {{amount}} {{currency}}
Condiciones: {{payment_terms}}

4. PLAZO
{{timeline}}

5. ACEPTACIÓN
Al aceptar la propuesta digital mediante el magic link, el Cliente declara haber leído y aceptado los términos de esta Orden de Servicio.

Firma digital: {{accepted_name}} · {{accepted_contact}}
Fecha de aceptación: {{accepted_at}}

Amargo Creativo
Atlántida, Canelones, Uruguay`,
  },
  {
    name: "Contrato de Diseño y Desarrollo Web (Completo)",
    description:
      "Contrato legal exhaustivo con cláusulas de propiedad intelectual, confidencialidad y jurisdicción.",
    variables: [
      "client_name",
      "project_title",
      "includes",
      "excludes",
      "amount",
      "currency",
      "payment_terms",
      "timeline",
      "accepted_at",
      "accepted_name",
      "accepted_contact",
    ],
    content: `CONTRATO DE PRESTACIÓN DE SERVICIOS DE DISEÑO Y DESARROLLO WEB

Entre Amargo Creativo (en adelante "el Prestador") y {{client_name}} (en adelante "el Cliente"), se celebra el presente contrato:

CLÁUSULA PRIMERA – OBJETO
El Prestador se obliga a diseñar y desarrollar el proyecto denominado "{{project_title}}" conforme al alcance, plazos y condiciones establecidos en la propuesta comercial aceptada.

CLÁUSULA SEGUNDA – ALCANCE
El servicio incluye:
{{includes}}

Queda expresamente excluido:
{{excludes}}

CLÁUSULA TERCERA – PRECIO Y FORMA DE PAGO
El precio total es de {{amount}} {{currency}}, pagadero según: {{payment_terms}}.

CLÁUSULA CUARTA – PLAZOS
El plazo estimado de entrega es de {{timeline}}, contados a partir de la recepción del anticipo y de todos los materiales necesarios por parte del Cliente.

CLÁUSULA QUINTA – PROPIEDAD INTELECTUAL
Una vez cancelado el 100% del precio, el Cliente será propietario exclusivo del código fuente, diseños y contenidos desarrollados específicamente para este proyecto.

CLÁUSULA SEXTA – CONFIDENCIALIDAD
Ambas partes se obligan a mantener la confidencialidad de la información intercambiada.

CLÁUSULA SÉPTIMA – JURISDICCIÓN
Para cualquier controversia las partes se someten a los tribunales de Canelones, Uruguay.

Aceptado digitalmente el {{accepted_at}} por {{accepted_name}} ({{accepted_contact}}).`,
  },
  {
    name: "Contrato de Mantenimiento Mensual",
    description:
      "Para acuerdos recurrentes de soporte, seguridad, backups y mejoras evolutivas.",
    variables: [
      "client_name",
      "project_title",
      "date",
      "amount",
      "currency",
      "accepted_at",
      "accepted_name",
    ],
    content: `CONTRATO DE MANTENIMIENTO MENSUAL

Cliente: {{client_name}}
Proyecto: {{project_title}}
Fecha de inicio: {{date}}

1. SERVICIOS INCLUIDOS
- Monitoreo de uptime
- Actualizaciones de seguridad
- Backups semanales
- Hasta 2 horas de cambios menores por mes
- Soporte prioritario por WhatsApp

2. PRECIO
{{amount}} {{currency}} por mes, facturado anticipadamente.

3. DURACIÓN
Mes a mes, renovable automáticamente. Cualquiera de las partes puede dar de baja con 15 días de preaviso.

4. ACEPTACIÓN
Aceptado el {{accepted_at}} por {{accepted_name}}.`,
  },
  {
    name: "Acuerdo de Confidencialidad (NDA)",
    description:
      "Para proteger información estratégica, bases de datos o propiedad intelectual previa.",
    variables: ["client_name", "project_title", "accepted_at", "accepted_name"],
    content: `ACUERDO DE CONFIDENCIALIDAD (NDA)

Entre Amargo Creativo y {{client_name}}.

Las partes se comprometen a no divulgar información confidencial intercambiada en el marco del proyecto "{{project_title}}".

Duración: 3 años desde la fecha de firma.
Jurisdicción: Canelones, Uruguay.

Aceptado el {{accepted_at}} por {{accepted_name}}.`,
  },
];

/**
 * Extracts proposal & client parameters and fills a contract template.
 */
export function renderContract(templateContent: string, proposal: any): string {
  const inv = proposal.investment || {};
  const clientName = proposal.clients?.name || proposal.client_name || "Cliente";

  const includesText = Array.isArray(proposal.includes)
    ? proposal.includes.map((i: string) => `• ${i}`).join("\n")
    : "";

  const excludesText = Array.isArray(proposal.excludes)
    ? proposal.excludes.map((e: string) => `• ${e}`).join("\n")
    : "Ninguno declarado";

  const data: Record<string, string> = {
    id: proposal.id?.substring(0, 8)?.toUpperCase() || "ORD-001",
    date: formatDate(new Date().toISOString()),
    client_name: clientName,
    project_title: proposal.project_title || "Proyecto Web",
    accepted_at: proposal.accepted_at ? formatDate(proposal.accepted_at) : formatDate(new Date().toISOString()),
    solution: proposal.solution || proposal.challenge || "",
    includes: includesText || "Según propuesta comercial",
    excludes: excludesText,
    amount: inv.amount ? formatMoney(inv.amount, inv.currency) : (inv.plans?.[0]?.price ? formatMoney(inv.plans[0].price, inv.currency) : "0"),
    currency: inv.currency || "USD",
    payment_terms: inv.paymentTerms || "50% al inicio · 50% contra entrega",
    timeline: proposal.timeline || "3 a 4 semanas estimadas",
    accepted_name: proposal.accepted_name || clientName,
    accepted_contact: proposal.accepted_contact || proposal.clients?.email || proposal.clients?.phone || "No especificado",
  };

  return templateContent.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : `{{${key}}}`;
  });
}
