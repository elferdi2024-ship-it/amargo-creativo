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
        notes: "Comercio minorista y predio gastronómico en Atlántida, Canelones.",
      })
      .select()
      .single();
    client = newClient;
  }

  console.log("2. Sincronizando propuesta con los planes mensuales y el pack de lanzamiento...");

  const proposalData = {
    client_id: client.id,
    slug: "mercado-atlantida",
    project_title: "Sitio web + WhatsApp Commerce",
    status: "active",
    value_phrase: "Tu local abre a las 8. Tu web, nunca cierra. Una vidriera que vende todos los días, no un folleto que junta polvo.",
    challenge: "Mercado Atlántida es el corazón comercial de la Costa de Oro, pero online todavía se busca de oído. El catálogo vive en historias de Instagram que caducan, los precios se piden por privado y cada consulta se responde mil veces. Mientras tanto, el visitante de Atlántida, Parque del Plata o Montevideo que quiere saber si hay stock un domingo a las 22 se va con las manos vacías — y compra en el primero que sí le responde.",
    solution: "Diseñamos una plataforma a medida en Astro 5 que carga instantáneamente, organiza todos los puestos y productos del predio y convierte cada visita en un pedido directo a WhatsApp ya armado con fotos, precio y código único.",
    includes: [
      "Sitio a medida en Astro 5, mobile-first, Core Web Vitals en verde",
      "Home editorial + directorio de puestos + fichas de producto",
      "Botón de compra/consulta a WhatsApp con mensaje precargado por producto",
      "SEO local (Atlántida, Costa de Oro, Canelones) + Schema.org",
      "Panel simple para actualizar horarios, novedades y destacados",
      "Identidad visual extendida (tipografía, color, isologo digital)",
      "Lanzamiento, redirecciones y capacitación de 60 minutos",
      "★ Pack de Marketing y Lanzamiento (Exclusivo en Plan Full): 10 imágenes diseñadas para promocionar el lanzamiento de la web (5 de ellas para la campaña previa de expectativa y 5 para cuando la web ya esté operativa)",
    ],
    excludes: [
      "Fotografía de producto en piso (podemos coordinar sesión aparte)",
      "Gestión diaria de redes o community management",
      "Pasarela de cobro con tarjeta — se resuelve por WhatsApp / Mercado Pago",
      "App nativa iOS/Android",
    ],
    investment: {
      type: "plans",
      currency: "UYU",
      paymentTerms: "Planes mensuales de operación, hosting y soporte. Sin contratos de permanencia forzados.",
      plans: [
        {
          name: "Plan Base",
          price: 3500,
          period: "UYU/mes",
          description: "Mantenimiento técnico y hosting seguro para operar.",
          features: [
            "Hosting en la nube 24/7 (Cloudflare)",
            "Certificado de seguridad SSL (HTTPS)",
            "Base de datos de pedidos y catálogo",
            "Copias de seguridad (Backups) semanales",
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
          description: "Operación asistida, cambio de precios y marketing.",
          features: [
            "Todo lo del Plan Base",
            "Ajustes masivos de precios mensuales",
            "Alta y baja de productos nuevos",
            "Diseño de 2 Banners de Oferta mensuales",
            "Soporte prioritario por WhatsApp al local",
            "Capacitación continua al personal de turno",
          ],
        },
        {
          name: "Plan Full",
          price: 11500,
          period: "UYU/mes",
          description: "Gestión integral del catálogo y evolución digital.",
          features: [
            "Todo lo del Plan Crecimiento",
            "Pack Lanzamiento: 10 imágenes promocionales (5 previa + 5 operativa)",
            "Carga y optimización de fotos de productos",
            "Reporte mensual de productos más pedidos",
            "Banners de ofertas ilimitados",
            "Desarrollo de mejoras a medida trimestrales",
            "Guardia técnica prioritaria fines de semana",
          ],
        },
      ],
    },
    timeline: "Descubrimiento 3 días · Diseño 5 días · Desarrollo 8 días · Lanzamiento. La plataforma queda en el aire en 16 días hábiles desde el ok.",
    roi_table: {
      headers: [
        "MÉTRICA",
        "HOY",
        "A 90 DÍAS CON LA WEB",
      ],
      rows: [
        [
          "Consultas por WhatsApp",
          "Esporádicas / manuales",
          "En flujo constante con pedido armado",
        ],
        [
          "Tiempo de respuesta",
          "Horas o al otro día",
          "< 5 min (el pedido ya llega con código y precio)",
        ],
        [
          "Presencia en Google",
          "Ficha incompleta",
          "Posicionado #1 en búsquedas de la Costa de Oro",
        ],
        [
          "Dependencia de Instagram",
          "Alta (historias que caducan)",
          "Activo propio que vende 24/7 sin pagar pauta",
        ],
      ],
    },
    whatsapp_message: "Hola Amargo Creativo, estuve revisando la propuesta de Sitio web + WhatsApp Commerce para Mercado Atlántida y quiero avanzar con el Plan Crecimiento.",
    notes: "Propuesta comercial para Mercado Atlántida. Demo: https://mercado-atlantida.elferdi2024.workers.dev/",
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

  console.log("¡Sincronizado! Podés verla en https://amargo-creativo.pages.dev/p/mercado-atlantida");
}

main();
