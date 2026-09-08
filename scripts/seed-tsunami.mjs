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

  console.log("2. Sincronizando propuesta cercana, cálida y directa para Tsunami...");

  const proposalData = {
    client_id: client.id,
    slug: "tsunami-dulce-de-leche",
    project_title: "Plataforma Web Oficial + Catálogo de Alfajores & Pedidos Directos a WhatsApp",
    status: "active",
    value_phrase: "Tomamos la iniciativa de diseñar una web nueva para ustedes, enfocada en su Dulce de Leche premiado. _Más moderna, rápida y visualmente tentadora._ Optimizada para *convertir cada visita en pedidos directos a su WhatsApp* y posicionarse en Google y en los nuevos buscadores de IA.",
    challenge: "Tienen un producto que enamora: 1er Premio en el Concurso Uruguayo de Dulce de Leche y una receta 100% Sin Gluten única en el país. Pero la web anterior no le hacía justicia a esa calidad artesanal ni permitía comprar de forma simple desde el celular.\n\nQueríamos que cualquier persona con antojo de Tsunami o cualquier comercio del interior que quiera vender sus alfajores pueda *hacer su pedido en un solo toque*, sin fricción ni esperas.",
    solution: "Diseñamos la web completa pensando en la identidad y el sabor de Tsunami. Incluye *catálogo visual e interactivo de frascos y alfajores*, botón de pedido directo a su WhatsApp con el mensaje ya armado, carga instantánea en celular y *optimización SEO para salir arriba en Google y búsquedas con IA*.",
    includes: [
      "Diseño nuevo, fresco y tentador enfocado en su Dulce de Leche y Alfajores",
      "Catálogo interactivo para elegir entre frascos de DDL y cajas de alfajores Blanco y Negro",
      "Botón de compra directa a su WhatsApp con la variedad seleccionada lista para enviar",
      "Optimización para que su web se encuentre mejor en Google y en los buscadores de Inteligencia Artificial",
      "Carga ultra rápida en celulares (menos de 1 segundo) para que nadie se vaya con las manos vacías",
      "Puesta en marcha, conexión con su dominio oficial tsunami.uy y todo listo para funcionar",
      "Sección para que almacenes y distribuidores del interior les pidan listas de precios mayoristas",
      "1 año entero de hosting cloud rápido y certificado de seguridad SSL incluidos",
    ],
    excludes: [
      "Inversión en pauta publicitaria en Meta Ads o Google Ads (presupuesto definido por ustedes)",
      "Pasarela de cobro bancario con tarjetas (utilizamos WhatsApp Checkout directo; se puede sumar a demanda)",
      "Fotografía presencial en fábrica (optimizamos al máximo el material y fotos actuales)",
    ],
    investment: {
      type: "plans",
      currency: "USD",
      paymentTerms: "Pago único de $480 USD por la entrega y puesta en producción de la web completa en su dominio propio. Los futuros desarrollos o ampliaciones se cotizan a demanda por separado, sin mensualidades obligatorias.",
      plans: [
        {
          name: "Web Completa Lista para Usar",
          price: 480,
          period: "Pago Único",
          recommended: true,
          badge: "TODO INCLUIDO · LISTA PARA PUBLICAR",
          description: "La web completa que ya diseñamos para ustedes, lista para conectar a su dominio y empezar a recibir pedidos.",
          features: [
            "Web completa ya desarrollada a medida en Astro 5 y Cloudflare Edge",
            "Catálogo interactivo de frascos de dulce de leche y alfajores (Blanco y Negro)",
            "Botón de pedido directo a su WhatsApp por producto con mensaje precargado",
            "Optimización SEO para Google y motores de búsqueda con IA",
            "Canal de solicitud de lista de precios para comercios mayoristas B2B",
            "1 año entero de hosting cloud de alta velocidad y certificado SSL",
            "Puesta en marcha, entrega de código y conexión a su dominio propio",
          ],
        },
        {
          name: "Futuras Ideas & Nuevos Módulos",
          price_display: "¿Charlamos? 🧉",
          period: "A demanda · Sin mensualidades",
          badge: "OPCIONAL · CUANDO LO NECESITEN",
          description: "Si más adelante quieren sumar pagos con tarjeta, nuevas páginas o catálogo para fechas especiales, lo presupuestamos puntual y con tarifa preferencial.",
          features: [
            "Nuevas landing pages para lanzamientos o promociones especiales",
            "Integración de pasarela de pagos online (MercadoPago / POS digital)",
            "Incorporación de nuevas líneas de productos o ediciones de temporada",
            "Campañas publicitarias y creatividades para Meta/Instagram Ads",
            "Tarifas preferenciales y presupuesto cerrado por cada nuevo módulo",
            "Cero costos fijos mensuales ni mantenimiento obligatorio",
          ],
        },
      ],
    },
    timeline: "La web ya está diseñada y testeada. La puesta en marcha, vinculación de su dominio y entrega final toma *48 a 72 horas hábiles*.",
    roi_table: {
      headers: ["MÉTRICA", "WEB ANTERIOR / INSTAGRAM", "CON LA NUEVA WEB DE TSUNAMI"],
      rows: [
        [
          "Experiencia del cliente al comprar",
          "Preguntas manuales y demora en responder",
          "Ve el producto, elige la variedad y pide a WhatsApp en 1 click",
        ],
        [
          "Pedidos de comercios del interior",
          "Consultas sueltas y desorganizadas",
          "Canal directo para pedir listas de precios mayoristas",
        ],
        [
          "Velocidad y diseño en celular",
          "Lenta y poco atractiva",
          "Carga instantánea en < 1s, visualmente tentadora",
        ],
        [
          "Presencia en Google y búsquedas con IA",
          "Difícil de encontrar",
          "Optimizada para búsquedas del mejor dulce de leche de Uruguay",
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
