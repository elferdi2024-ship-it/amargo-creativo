// filepath: scripts/seed-mercado-atlantida.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hmpswvofxxfanmaiyriu.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHN3dm9meHhmYW5tYWl5cml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3MTEwNiwiZXhwIjoyMTAzODQ3MTA2fQ.-U9OJNRg61B8IaE9zLGA-yoRJs7z_f5vH5V9s514iJU";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("1. Buscando o creando cliente 'Mercado Atlántida'...");

  let { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("name", "Mercado Atlántida")
    .maybeSingle();

  if (!client) {
    const { data: newClient } = await supabase
      .from("clients")
      .insert({
        name: "Mercado Atlántida",
        company: "Mercado Atlántida",
        email: "contacto@mercadoatlantida.uy",
        phone: "+598 98 300 491",
        notes: "Comercio minorista en Atlántida, Canelones. Catálogo de frutería, verdulería y almacén con delivery y pedidos directos por WhatsApp.",
      })
      .select()
      .single();
    client = newClient;
  }

  console.log("2. Insertando/Actualizando propuesta con formato exacto...");

  const proposalData = {
    client_id: client.id,
    slug: "mercado-atlantida",
    project_title: "Sistema Integral de Pedidos Online, Catálogo & Panel Operativo",
    status: "active",
    value_phrase: "Eliminamos las comisiones del 18% al 25% de apps intermediarias con un sistema propio ultrarrápido con catálogo, fraccionamiento por kilo y panel Kanban para el local.",
    challenge: "Las plataformas tradicionales (PedidosYa, Rappi) retienen entre 15% y 25% de cada venta, no entregan la base de datos de los clientes y generan fricción operativa en el local.",
    solution: "Diseñamos e implementamos una infraestructura digital completa orientada a maximizar las ventas directas por WhatsApp con código único AT-XXXX, catálogo de 150+ productos y panel de control operativo Kanban en tiempo real.",
    includes: [
      "Tienda Web Móvil PWA con buscador predictivo y fraccionamiento por kilo (medio/uno/dos kg)",
      "Catálogo optimizado de más de 150 productos, categorías y ofertas destacadas",
      "Generación automática de pedido con código único AT-XXXX directo a WhatsApp",
      "Pipeline Operativo Kanban en tiempo real (Pendiente → Confirmado → Preparando → Listo → En camino)",
      "Alertas sonoras de pedidos nuevos en el mostrador del local",
      "Infraestructura ultrarrápida en Cloudflare Edge con SSL y disponibilidad 24/7",
      "100% de la venta y datos del cliente quedan en el comercio (Cero comisiones)",
    ],
    excludes: [
      "Líneas telefónicas o dispositivos físicos (tablets/celulares para el mostrador)",
      "Campañas de publicidad paga en Meta Ads o Google Ads (se cotizan por separado)",
      "Comisiones de pasarelas de pago externas si el cliente opta por Mercado Pago en el futuro",
    ],
    investment: {
      type: "plans",
      currency: "UYU",
      paymentTerms: "Tarifa plana mensual sin contratos de permanencia. Facturación a mes adelantado.",
      plans: [
        {
          name: "Plan Base",
          price: 3500,
          period: "UYU/mes",
          description: "Mantenimiento técnico y hosting seguro para operar sin caídas.",
          features: [
            "Hosting en la nube 24/7 en Cloudflare Edge",
            "Certificado de seguridad SSL (HTTPS)",
            "Base de datos de pedidos y catálogo",
            "Copias de seguridad semanales automáticas",
            "Soporte técnico ante caídas o errores",
            "Acceso total al Panel de Control",
          ],
        },
        {
          name: "Plan Crecimiento",
          price: 6900,
          period: "UYU/mes",
          recommended: true,
          featured: true,
          description: "Operación asistida, cambio de precios, altas de productos y marketing.",
          features: [
            "Todo lo incluido en el Plan Base",
            "Ajustes masivos de precios mensuales",
            "Alta y baja de productos nuevos en catálogo",
            "Diseño de 2 Banners de Oferta mensuales",
            "Soporte prioritario por WhatsApp directo al local",
            "Capacitación continua al personal de turno",
          ],
        },
        {
          name: "Plan Full",
          price: 11500,
          period: "UYU/mes",
          description: "Gestión integral del catálogo, fotografía y evolución continua.",
          features: [
            "Todo lo incluido en el Plan Crecimiento",
            "Carga y optimización de fotos de productos",
            "Reporte mensual de métricas y productos más pedidos",
            "Banners de ofertas y promociones ilimitados",
            "Desarrollo de mejoras a medida trimestrales",
            "Guardia técnica prioritaria fines de semana",
          ],
        },
      ],
    },
    timeline: "24 a 48 horas hábiles para traspaso a producción y puesta en marcha con dominio definitivo.",
    roi_table: {
      headers: [
        "Concepto",
        "Con Apps Tradicionales (18% comisión)",
        "Con Sistema Propio Mercado Atlántida",
      ],
      rows: [
        [
          "Ventas mensuales estimadas",
          "$ 120.000 UYU",
          "$ 120.000 UYU",
        ],
        [
          "Comisión / Costo mensual",
          "-$ 21.600 UYU (en comisiones)",
          "$ 6.900 UYU (tarifa plana fija)",
        ],
        [
          "Ahorro neto mensual",
          "$ 0",
          "+$ 14.700 UYU de ganancia extra/mes",
        ],
        [
          "Base de datos de clientes",
          "Propiedad de la app",
          "Propiedad exclusiva de Mercado Atlántida",
        ],
      ],
    },
    whatsapp_message: "Hola Amargo Creativo, estuve revisando la propuesta del sistema para Mercado Atlántida y me interesa avanzar con la implementación.",
    notes: "Propuesta comercial para Mercado Atlántida.",
  };

  // Upsert proposal
  const { data: existing } = await supabase
    .from("proposals")
    .select("id")
    .eq("slug", "mercado-atlantida")
    .maybeSingle();

  if (existing) {
    await supabase.from("proposals").update(proposalData).eq("id", existing.id);
    console.log("Propuesta actualizada:", existing.id);
  } else {
    const { data: created } = await supabase.from("proposals").insert(proposalData).select().single();
    console.log("Propuesta creada:", created.id);
  }

  console.log("Listo en https://amargo-creativo.pages.dev/p/mercado-atlantida");
}

main();
