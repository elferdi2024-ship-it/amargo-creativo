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
    name: "Contrato de Desarrollo Web & Soluciones Digitales (Completo)",
    description:
      "Contrato comercial y legal exhaustivo con cláusulas de propiedad intelectual, revisiones, confidencialidad y jurisdicción en Uruguay.",
    variables: [
      "id",
      "date",
      "client_name",
      "client_company",
      "client_contact",
      "project_title",
      "solution",
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
    content: `CONTRATO DE PRESTACIÓN DE SERVICIOS DIGITALES Y DESARROLLO WEB

En la ciudad de Atlántida, Departamento de Canelones, República Oriental del Uruguay, a los {{date}}, se celebra el presente Contrato de Prestación de Servicios entre:

POR UNA PARTE: AMARGO Agencia Creativa (en adelante "EL PRESTADOR" o "AMARGO"), con domicilio comercial en Atlántida, Canelones, Uruguay, representada por su equipo de dirección técnica y comercial.

Y POR OTRA PARTE: {{client_name}}{{#if client_company}} (en representación de {{client_company}}){{/if}} (en adelante "EL CLIENTE"), cuyos datos de contacto e identificación constan en la propuesta comercial vinculada.

Ambas partes convienen en celebrar el presente contrato sujeto a las siguientes cláusulas:

CLÁUSULA PRIMERA — OBJETO DEL CONTRATO
EL PRESTADOR se obliga a ejecutar a favor de EL CLIENTE el desarrollo técnico, diseño y puesta en marcha del proyecto denominado:
"{{project_title}}"
conforme a las especificaciones técnicas y alcances presentados en la propuesta comercial correspondiente.

CLÁUSULA SEGUNDA — ALCANCE DE LOS SERVICIOS
El servicio profesional incluye expresamente los siguientes módulos y tareas:
{{includes}}

Quedan expresamente EXCLUIDOS del alcance los siguientes conceptos:
{{excludes}}

Cualquier requerimiento o funcionalidad adicional no detallada en este documento será presupuestada y calendarizada como anexo independiente.

CLÁUSULA TERCERA — PRECIO Y CONDICIONES DE PAGO
Como contraprestación total por los servicios contratados, EL CLIENTE abonará a EL PRESTADOR la suma de:
{{amount}} {{currency}}
Forma y condiciones de pago acordadas: {{payment_terms}}.
La falta de pago en los plazos convenidos facultará a EL PRESTADOR a pausar las tareas o suspender la entrega definitiva hasta su regularización.

CLÁUSULA CUARTA — CRONOGRAMA Y COOPERACIÓN
El plazo estimado de ejecución es de: {{timeline}}.
Dicho plazo comenzará a computarse una vez acreditado el pago inicial (anticipo) y suministrados la totalidad de los accesos, textos, imágenes y contenidos necesarios por parte de EL CLIENTE.

CLÁUSULA QUINTA — POLÍTICA DE REVISIONES Y APROBACIONES
El proyecto incluye hasta dos (2) rondas de revisión y ajustes sobre los entregables presentados en las etapas de diseño y desarrollo. Una vez aprobada cada etapa, cualquier cambio estructural posterior se considerará trabajo adicional.

CLÁUSULA SEXTA — PROPIEDAD INTELECTUAL Y CESIÓN DE DERECHOS
Una vez cancelado el cien por ciento (100%) del precio convenido, EL CLIENTE adquiere la titularidad sobre el sitio web, código desarrollado a medida y diseños finales entregados. AMARGO conserva el derecho de exhibir el trabajo finalizado en su portafolio comercial y casos de estudio.

CLÁUSULA SÉPTIMA — CONFIDENCIALIDAD
Ambas partes se obligan a guardar estricta reserva y secreto profesional respecto a toda información técnica, comercial o financiera intercambiada durante la vigencia del acuerdo.

CLÁUSULA OCTAVA — JURISDICCIÓN Y LEY APLICABLE
Para todos los efectos judiciales y extrajudiciales, las partes constituyen domicilios en los lugares indicados y se someten expresamente a la jurisdicción de los Tribunales competentes del Departamento de Canelones / Montevideo, República Oriental del Uruguay, con renuncia a cualquier otro fuero.

CONSTANCIA DE ACEPTACIÓN DIGITAL
El presente acuerdo cobra plena validez jurídica mediante la aceptación electrónica registrada a través de la plataforma y Magic Link seguro de AMARGO Agencia Creativa.

Aceptado digitalmente por: {{accepted_name}}
Contacto de verificación: {{accepted_contact}}
Fecha y hora de registro: {{accepted_at}}
Identificador único: AM-{{id}}-UY`,
  },
  {
    name: "Orden de Servicio & Aceptación Ágil",
    description: "Ideal para sprints rápidos, landing pages de lanzamiento y activaciones directas.",
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
    content: `ORDEN DE SERVICIO PROFESIONAL N° AM-{{id}}

EMISOR: AMARGO Agencia Creativa · Atlántida, Canelones, Uruguay
CLIENTE: {{client_name}}
PROYECTO: {{project_title}}
FECHA DE EMISIÓN: {{date}}

1. OBJETO
AMARGO Agencia Creativa ejecutará el proyecto "{{project_title}}" según los requerimientos y propuesta aceptada el {{accepted_at}}.

2. DESCRIPCIÓN ESTRATÉGICA
{{solution}}

3. ALCANCE
INCLUYE:
{{includes}}

NO INCLUYE:
{{excludes}}

4. INVERSIÓN Y PAGO
Monto acordado: {{amount}} {{currency}}
Condiciones: {{payment_terms}}

5. TIEMPO DE ENTREGA
{{timeline}}

6. CONFORMIDAD Y FIRMA DIGITAL
La aceptación de la propuesta mediante Magic Link acredita el consentimiento pleno de los términos y especificaciones de esta Orden de Servicio.

Firmado digitalmente por: {{accepted_name}}
Contacto: {{accepted_contact}}
Fecha: {{accepted_at}}

AMARGO Agencia Creativa · amargocreativo.uy`,
  },
  {
    name: "Acuerdo de Mantenimiento, Hosting & Soporte Continuo",
    description:
      "Para planes de suscripción mensual recurrente, seguridad, copias de respaldo y guardia técnica.",
    variables: [
      "client_name",
      "project_title",
      "date",
      "amount",
      "currency",
      "payment_terms",
      "accepted_at",
      "accepted_name",
    ],
    content: `ACUERDO DE MANTENIMIENTO, HOSPEDAJE & SOPORTE TÉCNICO

PRESTADOR: AMARGO Agencia Creativa
CLIENTE: {{client_name}}
SISTEMA / PLATAFORMA: {{project_title}}
FECHA DE INICIO: {{date}}

1. SERVICIOS MENSUALES GARANTIZADOS
- Hospedaje de alta disponibilidad en red global Cloudflare Edge con certificado SSL activo.
- Monitoreo 24/7 de disponibilidad y respuesta ante caídas de servidor.
- Copias de seguridad periódicas automáticas de base de datos y contenidos.
- Soporte técnico prioritario vía WhatsApp y correo para resolución de incidencias.
- Actualizaciones de seguridad y compatibilidad de librerías.

2. TARIFA MENSUAL
Monto: {{amount}} {{currency}} por mes calendario.
Condiciones: {{payment_terms}}.

3. VIGENCIA Y CANCELACIÓN
Acuerdo de renovación mensual automática. Cualquiera de las partes podrá solicitar la rescisión del servicio comunicándolo fehacientemente con al menos quince (15) días de anticipación al siguiente período.

4. REGISTRO DE CONFORMIDAD
Aceptado digitalmente el {{accepted_at}} por {{accepted_name}}.

AMARGO Agencia Creativa · Atlántida, Canelones, Uruguay`,
  },
  {
    name: "Acuerdo de Confidencialidad (NDA)",
    description:
      "Protección legal de información estratégica, datos comerciales y propiedad previa de ambas partes.",
    variables: ["client_name", "project_title", "date", "accepted_at", "accepted_name"],
    content: `ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN (NDA)

En Atlántida, Canelones, a los {{date}}, entre AMARGO Agencia Creativa y {{client_name}}:

1. INFORMACIÓN CONFIDENCIAL
Se considerará información confidencial toda documentación, base de datos, planes de negocio, código fuente, accesos y estrategias compartidas con motivo del proyecto "{{project_title}}".

2. OBLIGACIÓN DE NO DIVULGACIÓN
Las partes se comprometen a custodiar dicha información con la máxima diligencia, utilizándola únicamente para los fines del proyecto y no revelándola a terceros sin autorización previa por escrito.

3. VIGENCIA
El presente compromiso tendrá una validez de tres (3) años a partir de la fecha de suscripción.

4. JURISDICCIÓN
Se somete a la competencia de los tribunales de Canelones / Montevideo, Uruguay.

Aceptado digitalmente el {{accepted_at}} por {{accepted_name}}.

AMARGO Agencia Creativa`,
  },
];

/**
 * Renders template variables cleanly
 */
export function renderContract(templateContent: string, proposal: any): string {
  const inv = proposal.investment || {};
  const clientName = proposal.clients?.name || proposal.client_name || "Cliente";
  const clientCompany = proposal.clients?.company || "";

  const includesText = Array.isArray(proposal.includes) && proposal.includes.length > 0
    ? proposal.includes.map((i: string) => `• ${i}`).join("\n")
    : "• Según propuesta comercial y alcance convenido.";

  const excludesText = Array.isArray(proposal.excludes) && proposal.excludes.length > 0
    ? proposal.excludes.map((e: string) => `• ${e}`).join("\n")
    : "• Tareas fuera del alcance explícito o no contempladas.";

  let amountDisplay = "0";
  if (inv.amount) {
    amountDisplay = formatMoney(inv.amount, inv.currency);
  } else if (inv.plans && inv.plans.length > 0) {
    const selectedPlan = inv.plans.find((p: any) => p.name === proposal.accepted_plan) || inv.plans.find((p: any) => p.recommended || p.featured) || inv.plans[0];
    amountDisplay = `${formatMoney(selectedPlan.price, inv.currency)}${selectedPlan.period ? " / " + selectedPlan.period : ""}`;
  }

  const data: Record<string, string> = {
    id: proposal.id ? proposal.id.substring(0, 8).toUpperCase() : "DOC-001",
    date: formatDate(new Date().toISOString()),
    client_name: clientName,
    client_company: clientCompany,
    client_contact: proposal.clients?.email || proposal.clients?.phone || "",
    project_title: proposal.project_title || "Solución Digital & Web",
    accepted_at: proposal.accepted_at ? formatDate(proposal.accepted_at) : formatDate(new Date().toISOString()),
    solution: proposal.solution || proposal.value_phrase || "Desarrollo y puesta en producción de infraestructura web.",
    includes: includesText,
    excludes: excludesText,
    amount: amountDisplay,
    currency: inv.currency || "USD",
    payment_terms: inv.paymentTerms || "50% anticipo al iniciar · 50% contra entrega final",
    timeline: proposal.timeline || "15 a 20 días hábiles estimados",
    accepted_name: proposal.accepted_name || clientName,
    accepted_contact: proposal.accepted_contact || proposal.clients?.phone || proposal.clients?.email || "WhatsApp / Email",
  };

  let rendered = templateContent;

  // Handle simple conditionals like {{#if client_company}} ... {{/if}}
  rendered = rendered.replace(/\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, inner) => {
    return data[key] ? inner.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (__, k) => data[k] || "") : "";
  });

  // Handle standard variables {{key}}
  return rendered.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : `{{${key}}}`;
  });
}
