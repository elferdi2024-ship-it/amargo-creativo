// filepath: scripts/seed-tsunami.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hmpswvofxxfanmaiyriu.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHN3dm9meHhmYW5tYWl5cml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3MTEwNiwiZXhwIjoyMTAzODQ3MTA2fQ.-U9OJNRg61B8IaE9zLGA-yoRJs7z_f5vH5V9s514iJU";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("1. Buscando o actualizando cliente 'Tsunami Dulce de Leche'...");

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
        company: "Tsunami Dulce de Leche Premium & Alfajores",
        email: "contacto@tsunami.uy",
        phone: "+598 92 719 271",
        notes: "Dulce de leche artesanal premiado (1er Premio 2021) 100% Sin Gluten y Alfajores Premium Blanco y Negro.",
      })
      .select()
      .single();
    client = newClient;
  }

  console.log("2. Sincronizando propuesta de venta directa y evolución a demanda para Tsunami...");

  const proposalData = {
    client_id: client.id,
    slug: "tsunami-dulce-de-leche",
    project_title: "Plataforma Web Oficial + Catálogo de Alfajores & Canal Mayorista B2B",
    status: "active",
    value_phrase: "Tomamos la iniciativa de diseñar una web nueva para Tsunami, enfocada en su Dulce de Leche premiado. _Más moderna, rápida y visualmente atractiva._ Optimizada para *convertir visitas en pedidos directos de WhatsApp* y posicionarse en Google y buscadores de IA.",
    challenge: "Tsunami elabora el dulce de leche más premiado de Uruguay: 1er Premio en el Concurso Uruguayo de Dulce de Leche y receta 100% Sin Gluten. Sin embargo, su presencia digital anterior no transmitía la calidad artesanal del producto ni facilitaba la compra directa, perdiendo ventas frente a opciones industriales.\n\nFaltaba una vitrina digital que hiciera justicia al producto, permitiera a los clientes *pedir en un solo clic* y a los comercios del interior solicitar listas de precios mayoristas con total agilidad.",
    solution: "Por iniciativa de AMARGO, diseñamos y desarrollamos una plataforma web completa pensada para la identidad gastronómica de Tsunami. Incluye *catálogo interactivo de frascos y alfajores*, pedidos directos a WhatsApp con mensaje automático, infraestructura Cloudflare Edge ultrarrápida y *optimización SEO para Google y motores de IA*.",
    includes: [
      "Diseño UI/UX gourmet moderno, rápido y visualmente atractivo enfocado en Dulce de Leche y Alfajores",
      "Catálogo interactivo con selector de variedades (frascos de DDL y cajas de alfajores Blanco / Negro)",
      "Botón de compra directa a WhatsApp con mensaje automático y producto pre-seleccionado",
      "Optimización SEO avanzada para Google y motores de Inteligencia Artificial (ChatGPT, Perplexity, Gemini)",
      "Infraestructura Cloudflare Edge de alto rendimiento con carga en menos de 0.8s",
      "Puesta en producción y vinculación completa con el dominio oficial tsunami.uy",
      "Formulario de contacto para distribuidores y pedidos mayoristas del interior",
      "1 año de hosting cloud de alta velocidad y certificado SSL de seguridad incluidos",
    ],
    excludes: [
      "Inversión en pauta publicitaria en Meta Ads o Google Ads (presupuesto a cargo de la marca)",
      "Pasarela de cobro bancario con tarjetas (se utiliza WhatsApp Checkout directo; disponible como módulo adicional)",
      "Fotografía presencial adicional en fábrica (se optimizó el material y catálogo actual)",
    ],
    investment: {
      type: "plans",
      currency: "USD",
      paymentTerms: "Pago único de $480 USD por la entrega y puesta en producción de la web completa en su dominio propio. Los futuros desarrollos o ampliaciones se cotizan a demanda por separado, sin mensualidades obligatorias.",
      plans: [
        {
          name: "Web Completa Llave en Mano",
          price: 480,
          period: "Pago Único",
          recommended: true,
          badge: "PRECIO FINAL · PAGO ÚNICO",
          description: "La web completa ya diseñada y desarrollada para Tsunami, lista para publicar en su dominio propio.",
          features: [
            "Web completa desarrollada a medida en Astro 5 y Cloudflare Edge",
            "Catálogo interactivo de frascos de dulce de leche y alfajores (Blanco y Negro)",
            "Botón de pedido directo a WhatsApp por producto con mensaje precargado",
            "Optimización SEO para Google y motores de búsqueda con IA",
            "Canal de solicitud de lista de precios para comercios mayoristas B2B",
            "1 año de hosting cloud de alta disponibilidad y certificado SSL",
            "Puesta en marcha, entrega de código y vinculación a dominio propio",
          ],
        },
        {
          name: "Evolución & Futuros Módulos",
          price_display: "A Demanda",
          period: "Sin mensualidades",
          badge: "OPCIONAL · A DEMANDA",
          description: "Futuros desarrollos y ampliaciones de la web se cotizan por separado según lo que necesiten, sin costos fijos.",
          features: [
            "Nuevas landing pages para lanzamientos o promociones especiales",
            "Integración de pasarela de pagos online (MercadoPago / POS digital)",
            "Incorporación de nuevas líneas de productos o ediciones limitadas",
            "Campañas publicitarias y creatividades para Meta/Instagram Ads",
            "Tarifas preferenciales y presupuesto cerrado por cada nuevo módulo",
            "Sin mensualidades ni costos de mantenimiento obligatorios",
          ],
        },
      ],
    },
    timeline: "Web ya diseñada y testeada. Puesta en marcha, vinculación de dominio y entrega final en *48 a 72 horas hábiles*.",
    roi_table: {
      headers: ["MÉTRICA", "WEB ANTERIOR / REDES", "CON LA NUEVA WEB DE TSUNAMI"],
      rows: [
        [
          "Proceso de compra del cliente",
          "Preguntas manuales sin orden en Instagram",
          "Ve el producto, elige variedad y pide directo a WhatsApp en 1 click",
        ],
        [
          "Captación de comercios mayoristas",
          "Mensajes sueltos y pérdida de oportunidades",
          "Canal B2B directo que filtra pedidos mayoristas de todo el país",
        ],
        [
          "Velocidad y experiencia en celular",
          "Lenta y desactualizada",
          "Carga instantánea en < 0.8s en cualquier celular o computadora",
        ],
        [
          "Posicionamiento en Google y búsquedas con IA",
          "Sin optimización SEO",
          "Indexada para búsquedas de 'mejor dulce de leche uruguayo' y 'alfajores sin gluten'",
        ],
      ],
    },
    whatsapp_message: "Hola Amargo Creativo, vimos la web que diseñaron para Tsunami Dulce de Leche y queremos avanzar con la puesta en marcha.",
    notes: "Propuesta para Tsunami Dulce de Leche Premium. Demo: https://tsunami-uruguay.elferdi2024.workers.dev/",
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

  console.log(`Propuesta actualizada con éxito. ID: ${proposalId}`);
  console.log(`URL Magic Link: https://amargo-creativo.pages.dev/p/tsunami-dulce-de-leche`);
}

main().catch((err) => {
  console.error("Error al sincronizar propuesta:", err);
  process.exit(1);
});
