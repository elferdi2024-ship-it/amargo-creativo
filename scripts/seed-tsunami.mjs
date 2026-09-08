// filepath: scripts/seed-tsunami.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hmpswvofxxfanmaiyriu.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHN3dm9meHhmYW5tYWl5cml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3MTEwNiwiZXhwIjoyMTAzODQ3MTA2fQ.-U9OJNRg61B8IaE9zLGA-yoRJs7z_f5vH5V9s514iJU";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("1. Buscando o creando cliente 'Tsunami Dulce de Leche Premium'...");

  let { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("name", "Tsunami Dulce de Leche")
    .maybeSingle();

  if (!client) {
    const { data: newClient } = await supabase
      .from("clients")
      .insert({
        name: "Tsunami Dulce de Leche",
        company: "Tsunami Dulce de Leche Premium / Alfajores Uruguay",
        email: "contacto@tsunami.uy",
        phone: "+598 92 719 271",
        notes: "Dulce de leche artesanal premiado (1er Premio 2021) 100% Sin Gluten y Alfajores Premium Blanco y Negro.",
      })
      .select()
      .single();
    client = newClient;
  }

  console.log("2. Sincronizando propuesta comercial para Tsunami...");

  const proposalData = {
    client_id: client.id,
    slug: "tsunami-dulce-de-leche",
    project_title: "Plataforma de Venta Directa, Catálogo de Alfajores & Canal Mayorista B2B",
    status: "active",
    value_phrase: "Un producto premiado merece una vitrina a su altura. _De la fábrica al paladar del cliente en un solo clic._ Una plataforma que *transforma el antojo en pedidos inmediatos* y abre canales con distribuidores en todo el país.",
    challenge: "Tsunami tiene el producto más codiciado del mercado: 1er Premio en el Concurso Uruguayo de Dulce de Leche y certificación 100% Sin Gluten. Sin embargo, en redes sociales la venta se diluye en mensajes sueltos sin orden y muchos potenciales compradores *terminan comprando opciones industriales en el supermercado* por no tener una vía rápida de compra online.\n\nAdemás, almacenes, cafeterías y distribuidores del interior no cuentan con un canal ágil para solicitar pedidos mayoristas con condiciones claras.",
    solution: "Diseñamos una plataforma gastronómica de alto impacto visual y carga ultrarrápida (< 30ms) con *catálogo interactivo de frascos y alfajores*, selector de unidades con *pedido directo a WhatsApp pre-configurado*, formulario de alta para comercios B2B y posicionamiento SEO gastronómico para dominar las búsquedas en Uruguay.",
    includes: [
      "Landing page editorial con fotografía gourmet y carga instantánea (< 0.8s)",
      "Catálogo interactivo de productos: Dulce de Leche (frascos) y Alfajores Premium (Blanco / Negro)",
      "Botón de pedido directo a WhatsApp por producto con mensaje y cantidad precargados",
      "Canal exclusivo para Comercios y Distribuidores B2B (solicitud de lista de precios mayorista)",
      "Sección de premios, avales de calidad y certificación 100% Sin Gluten (Celíacos)",
      "Módulo de testimonios y valoraciones de clientes gastronómicos",
      "SEO gastronómico optimizado para Google en Uruguay (Montevideo, Canelones, Punta del Este)",
      "★ Pack Lanzamiento Digital (Exclusivo Plan Full): 10 creatividades fotográficas y videos publicitarios para Meta/Instagram Ads",
    ],
    excludes: [
      "Costos de logística, empaque y envíos físicos a domicilio",
      "Inversión publicitaria directa en Meta Ads / Google Ads (presupuesto definido por la marca)",
      "Desarrollo de pasarela de cobros con tarjetas bancarias complejas (se utiliza WhatsApp Checkout directo)",
    ],
    investment: {
      type: "plans",
      currency: "UYU",
      paymentTerms: "Inversión mensual con hosting Cloudflare Edge, soporte técnico continuo y actualización mensual de catálogo.",
      plans: [
        {
          name: "Plan Base",
          price: 5890,
          period: "UYU/mes",
          daily_equivalent: "Menos de $200/día",
          description: "Presencia digital sólida, catálogo online y seguridad cloud 24/7.",
          features: [
            "Hosting de alta velocidad en Cloudflare Edge",
            "Certificado SSL de seguridad y dominio propio",
            "Catálogo completo de dulce de leche y alfajores",
            "Botón de contacto general a WhatsApp",
            "Copias de seguridad semanales",
            "Soporte técnico ante incidencias",
          ],
        },
        {
          name: "Plan Avanzado",
          price: 9490,
          period: "UYU/mes",
          daily_equivalent: "Menos de $320/día",
          recommended: true,
          badge: "RECOMENDADO",
          description: "Venta directa por WhatsApp, canal mayorista B2B y optimización comercial.",
          features: [
            "Todo lo del Plan Base",
            "Botón de pedido directo por cada producto con mensaje pre-armado",
            "Formulario de captación de comercios y distribuidores mayoristas",
            "Módulo de opiniones de clientes y premios gastronómicos",
            "Actualización mensual de precios, stock y promociones",
            "Soporte comercial prioritario por WhatsApp",
          ],
        },
        {
          name: "Plan Full",
          price: 13990,
          original_price: 15490,
          discount_badge: "-10% Lanzamiento",
          badge: "SIN LÍMITES",
          period: "UYU/mes",
          daily_equivalent: "Menos de $470/día",
          description: "Pack audiovisual de lanzamiento para Instagram, marketing y soporte total.",
          features: [
            "Todo lo del Plan Avanzado",
            "Pack Lanzamiento: 10 creatividades y videos editoriales para Instagram Ads",
            "Integración de Meta Pixel y TikTok Pixel para remarketing de compradores",
            "Reporte mensual de productos más consultados y clics de compra",
            "Optimización continua de imágenes para lanzamientos especiales",
            "Guardia de soporte 24/7 para fechas especiales (Día del Padre, Fiestas, etc.)",
          ],
        },
      ],
    },
    timeline: "Estructura de catálogo 3 días · Diseño UI/UX gourmet 4 días · Desarrollo en Astro 6 días · Pruebas y Go-Live. Entrega final en *14 días hábiles*.",
    roi_table: {
      headers: ["MÉTRICA", "VENTA TRADICIONAL", "CON PLATAFORMA AMARGO"],
      rows: [
        [
          "Proceso de compra del cliente",
          "Pregunta precio y espera respuesta manual",
          "Ve el producto, elige variedad y pide directo a WhatsApp en 1 click",
        ],
        [
          "Captación de comercios mayoristas",
          "Llamadas y mensajes desordenados",
          "Formulario B2B que filtra distribuidores calificados automáticamente",
        ],
        [
          "Percepción de marca y premios",
          "Historias efímeras en Instagram",
          "Página oficial premium que posiciona a Tsunami como el DDL #1 del país",
        ],
        [
          "Presencia en Google y búsquedas",
          "Invisible en Google",
          "Top en búsquedas de 'mejor dulce de leche uruguayo' y 'alfajores sin gluten'",
        ],
      ],
    },
    whatsapp_message: "Hola Amargo Creativo, estuve revisando la propuesta de Plataforma Digital para Tsunami Dulce de Leche y queremos avanzar con el Plan Avanzado.",
    notes: "Propuesta para Tsunami Dulce de Leche Premium. Demo interactiva: https://tsunami-uruguay.elferdi2024.workers.dev/",
  };

  // Upsert proposal
  let proposalId;
  const { data: existing } = await supabase
    .from("proposals")
    .select("id")
    .eq("slug", "tsunami-dulce-de-leche")
    .maybeSingle();

  if (existing) {
    console.log("Actualizando propuesta existente...");
    const { data: updated } = await supabase
      .from("proposals")
      .update(proposalData)
      .eq("id", existing.id)
      .select()
      .single();
    proposalId = updated.id;
  } else {
    console.log("Creando nueva propuesta...");
    const { data: inserted } = await supabase
      .from("proposals")
      .insert(proposalData)
      .select()
      .single();
    proposalId = inserted.id;
  }

  console.log(`Propuesta sincronizada con éxito. ID: ${proposalId}`);
  console.log(`URL Magic Link: https://amargo-creativo.pages.dev/p/tsunami-dulce-de-leche`);
}

main().catch((err) => {
  console.error("Error al sincronizar propuesta:", err);
  process.exit(1);
});
