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

  console.log("2. Sincronizando propuesta con contenido exacto...");

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
    ],
    excludes: [
      "Fotografía de producto (podemos coordinar sesión aparte)",
      "Gestión diaria de redes o community management",
      "Pasarela de cobro con tarjeta — se resuelve por WhatsApp / Mercado Pago",
      "App nativa iOS/Android",
    ],
    investment: {
      type: "plans",
      currency: "USD",
      paymentTerms: "50% al inicio · 50% contra entrega. Transferencia BROU / Santander o Wise.",
      plans: [
        {
          name: "Vidriera",
          price: 980,
          period: "",
          description: "Presencia digital de alto impacto para abrir el canal.",
          features: [
            "Landing + 6 secciones",
            "WhatsApp Commerce en CTAs",
            "SEO local base",
            "Entrega en 10 días hábiles",
          ],
        },
        {
          name: "Mercado",
          price: 1680,
          period: "",
          recommended: true,
          featured: true,
          description: "El sitio que trabaja como un puesto más del predio.",
          features: [
            "Directorio de puestos",
            "Fichas de producto ilimitadas",
            "Panel de novedades",
            "SEO técnico + Schema",
            "Entrega en 16 días hábiles",
          ],
        },
        {
          name: "Motor",
          price: 2480,
          period: "",
          description: "Plataforma viva: catálogo, búsqueda y operación diaria.",
          features: [
            "Todo lo de Mercado",
            "Búsqueda instantánea",
            "Horarios y stock por puesto",
            "Capacitación al equipo",
            "30 días de ajuste post-lanzamiento",
          ],
        },
      ],
    },
    timeline: "Descubrimiento 3 días · Diseño 5 días · Desarrollo 8 días · Lanzamiento. El plan Mercado queda en el aire en 16 días hábiles desde el ok.",
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
    whatsapp_message: "Hola Amargo Creativo, estuve revisando la propuesta de Sitio web + WhatsApp Commerce para Mercado Atlántida y quiero avanzar con el plan Mercado.",
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

  console.log("¡Sincronizado! Podés verla en https://amargo-creativo.pages.dev/p/mercado-atlantida");
}

main();
