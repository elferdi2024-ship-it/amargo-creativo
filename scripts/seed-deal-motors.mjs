// filepath: scripts/seed-deal-motors.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hmpswvofxxfanmaiyriu.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHN3dm9meHhmYW5tYWl5cml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3MTEwNiwiZXhwIjoyMTAzODQ3MTA2fQ.-U9OJNRg61B8IaE9zLGA-yoRJs7z_f5vH5V9s514iJU";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("1. Buscando o creando cliente 'Deal Motors UY'...");

  let { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("name", "Deal Motors UY")
    .maybeSingle();

  if (!client) {
    const { data: newClient } = await supabase
      .from("clients")
      .insert({
        name: "Deal Motors UY",
        company: "Deal Motors / Drive Prime Uruguay",
        email: "ventas@dealmotors.uy",
        phone: "+598 99 123 456",
        notes: "Concesionaria oficial SHACMAN, compra/venta de vehículos premium y cotizador de permutas.",
      })
      .select()
      .single();
    client = newClient;
  }

  console.log("2. Sincronizando propuesta para Deal Motors...");

  const proposalData = {
    client_id: client.id,
    slug: "deal-motors",
    project_title: "Plataforma Automotriz + Cotizador de Permutas y WhatsApp CRM",
    status: "active",
    value_phrase: "Tu salón abre en horario comercial. _Tu showroom digital, vende las 24 horas._ Una plataforma que *califica compradores reales* y automatiza permutas sin fricción.",
    challenge: "El mercado automotriz premium en Uruguay exige velocidad y transparencia. Hoy los clientes consultan por Instagram o Marketplace con mensajes genéricos, perdiendo horas en tasaciones manuales de vehículos usados.\n\nSin un cotizador inteligente en tiempo real, los compradores calificados *se van a otras automotoras* que sí les dan una respuesta inmediata con opciones de financiación claras.",
    solution: "Desarrollamos una plataforma web a medida en Astro 5 con *búsqueda instantánea en < 30ms*, filtros avanzados por marca/año/cuota, simulador de financiación y un *cotizador de permutas directo a WhatsApp* con ficha técnica precargada.",
    includes: [
      "Showroom digital mobile-first con galería HD y carga instantánea (< 0.8s)",
      "Buscador y filtros reactivos por segmento, combustible, transmisión y precio",
      "Cotizador inteligente de permutas con subida de fotos y tasación orientativa",
      "Calculadora de financiación bancaria integrada por vehículo",
      "Botón de consulta rápida a WhatsApp con asesor asignado y mensaje automático",
      "SEO automotriz especializado para Uruguay (Montevideo, Canelones, Maldonado)",
      "Panel de administración para alta/baja de unidades, precios y estado (Disponible/Reservado/Vendido)",
      "★ Pack Lanzamiento Digital (Exclusivo Plan Full): 10 creatividades publicitarias para Meta Ads (5 de preventa de stock + 5 de lanzamiento oficial)",
    ],
    excludes: [
      "Sesión fotográfica presencial en salón (disponible como servicio adicional)",
      "Pauta publicitaria en Google Ads / Meta Ads (presupuesto a cargo del cliente)",
      "Gestión de transferencias notariales o gestoría vehicular",
    ],
    investment: {
      type: "plans",
      currency: "UYU",
      paymentTerms: "Inversión mensual con soporte continuo, hosting cloud de alta disponibilidad y actualizaciones de catálogo.",
      plans: [
        {
          name: "Plan Base",
          price: 5890,
          period: "UYU/mes",
          daily_equivalent: "Menos de $200/día",
          description: "Infraestructura cloud, catálogo online y seguridad 24/7.",
          features: [
            "Hosting de alta velocidad en Cloudflare",
            "Certificado SSL y dominio personalizado",
            "Catálogo de hasta 50 vehículos activos",
            "Copias de seguridad semanales",
            "Soporte técnico ante incidencias",
            "Acceso completo al Panel de Control",
          ],
        },
        {
          name: "Plan Avanzado",
          price: 10890,
          period: "UYU/mes",
          daily_equivalent: "Menos de $370/día",
          recommended: true,
          badge: "RECOMENDADO",
          description: "Cotizador de permutas, simulador y optimización comercial.",
          features: [
            "Todo lo del Plan Base",
            "Catálogo ilimitado de vehículos",
            "Cotizador interactivo de permutas activo",
            "Simulador de cuotas y financiación BROU/Santander",
            "Actualización masiva de precios y stock",
            "Soporte comercial prioritario por WhatsApp",
          ],
        },
        {
          name: "Plan Full",
          price: 16990,
          original_price: 18490,
          discount_badge: "-8% Lanzamiento",
          badge: "SIN LÍMITES",
          period: "UYU/mes",
          daily_equivalent: "Menos de $570/día",
          description: "Evolución digital continua, pack de marketing y soporte total.",
          features: [
            "Todo lo del Plan Avanzado",
            "Pack Lanzamiento: 10 creatividades publicitarias para Meta Ads",
            "Reporte mensual de vehículos más vistos y cotizados",
            "Optimización y retoque de fotos de unidades ingresadas",
            "Mejoras de software trimestrales a medida",
            "Guardia de soporte fines de semana para guardias de ventas",
          ],
        },
      ],
    },
    timeline: "Auditoría de catálogo 3 días · Diseño UI/UX 4 días · Desarrollo & Cotizador 7 días · Pruebas y Go-Live. Entrega final en *14 días hábiles*.",
    roi_table: {
      headers: ["MÉTRICA", "ESTADO ACTUAL", "CON SHOWROOM DIGITAL"],
      rows: [
        [
          "Consultas recibidas por WhatsApp",
          "Informales y sin datos del vehículo",
          "Leads calificados con modelo, presupuesto y permuta",
        ],
        [
          "Tiempo de tasación de permutas",
          "Horas de intercambio manual",
          "Automático: el cliente envía datos y fotos en 1 click",
        ],
        [
          "Disponibilidad del inventario",
          "Solo en horario de salón",
          "Showroom abierto 24/7 en cualquier dispositivo",
        ],
        [
          "Posicionamiento en Google",
          "Solo redes sociales",
          "Top en búsquedas de autos usados y 0km en Uruguay",
        ],
      ],
    },
    whatsapp_message: "Hola Amargo Creativo, estuve revisando la propuesta de Showroom Digital + Cotizador de Permutas para Deal Motors y queremos avanzar con el Plan Avanzado.",
    notes: "Propuesta para Deal Motors UY. Demo: https://driveprime-eta.vercel.app/",
  };

  // Upsert proposal
  let proposalId;
  const { data: existing } = await supabase
    .from("proposals")
    .select("id")
    .eq("slug", "deal-motors")
    .maybeSingle();

  if (existing) {
    await supabase.from("proposals").update(proposalData).eq("id", existing.id);
    proposalId = existing.id;
    console.log("Propuesta actualizada:", proposalId);
  } else {
    const { data: created } = await supabase.from("proposals").insert(proposalData).select().single();
    proposalId = created.id;
    console.log("Propuesta creada:", proposalId);
  }

  // Sincronizar documentos oficiales adjuntos de prueba
  console.log("3. Sincronizando documentos oficiales visibles para el cliente...");

  // Eliminar documentos anteriores si existieran
  await supabase.from("documents").delete().eq("proposal_id", proposalId);

  const sampleDocs = [
    {
      name: "Contrato Marco de Servicios Digitales · Deal Motors",
      type: "contract",
      storage_path: "deal-motors/contrato-marco-deal-motors.pdf",
      url: "https://driveprime-eta.vercel.app/",
      proposal_id: proposalId,
      client_id: client.id,
      visible_to_client: true,
    },
    {
      name: "Especificación Técnica & Arquitectura · Astro 5 + Supabase",
      type: "brief",
      storage_path: "deal-motors/especificacion-tecnica.pdf",
      url: "https://driveprime-eta.vercel.app/",
      proposal_id: proposalId,
      client_id: client.id,
      visible_to_client: true,
    },
    {
      name: "Guía de Operación del Cotizador de Permutas y CRM",
      type: "other",
      storage_path: "deal-motors/guia-permutas.pdf",
      url: "https://driveprime-eta.vercel.app/",
      proposal_id: proposalId,
      client_id: client.id,
      visible_to_client: true,
    },
  ];

  await supabase.from("documents").insert(sampleDocs);
  console.log("¡3 Documentos adjuntos sincronizados con éxito!");

  console.log("¡Listo! Podés ver la propuesta completa en https://amargo-creativo.pages.dev/p/deal-motors");
}

main();
