// filepath: scripts/seed-yoyo-juanito.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hmpswvofxxfanmaiyriu.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHN3dm9meHhmYW5tYWl5cml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3MTEwNiwiZXhwIjoyMTAzODQ3MTA2fQ.-U9OJNRg61B8IaE9zLGA-yoRJs7z_f5vH5V9s514iJU";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("1. Buscando o creando cliente 'Yoyo Juanito'...");

  let { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("name", "Yoyo Juanito")
    .maybeSingle();

  if (!client) {
    const { data: newClient } = await supabase
      .from("clients")
      .insert({
        name: "Yoyo Juanito",
        company: "Yoyo Juanito — Alfajores y Yoyos Artesanales",
        email: "contacto@yoyojuanito.uy",
        phone: "+598 99 000 000",
        notes: "Yoyos artesanales de chocolate semiamargo y dulce de leche repostero, horneados en tandas semanales en Uruguay.",
      })
      .select()
      .single();
    client = newClient;
  }

  console.log("2. Sincronizando propuesta para Yoyo Juanito...");

  const proposalData = {
    client_id: client.id,
    slug: "yoyo-juanito",
    project_title: "Plataforma Web Oficial + Catálogo de Yoyos & Pedidos Directos a WhatsApp",
    status: "active",
    value_phrase: "Tomamos la iniciativa de diseñar una web nueva para ustedes, enfocada en la mística de sus Yoyos y alfajores artesanales. _Más moderna, rápida y visualmente tentadora._ El contenido es *100% personalizable antes de la entrega* y está lista para convertir visitas en pedidos directos a su WhatsApp.",
    challenge: "Tienen un producto con identidad de sobra: bizcocho aireado, chocolate templado y dulce de leche repostero generoso horneado en tandas semanales. Sin embargo, en redes sociales la venta depende de mensajes sueltos y quienes buscan un buen yoyo o alfajor artesanal en la web no tenían un canal ágil para comprar.\n\nQueríamos que cualquier persona con ganas de una merienda clásica o un comercio que quiera encargar cajas pueda *hacer su reserva en un solo toque*, conociendo las tandas disponibles al instante.",
    solution: "Diseñamos la web completa pensando en la tentación del bocado perfecto. Con *galería visual de las 4 capas maestras, catálogo de cajas x6 y piezas individuales*, botón de pedido directo a su WhatsApp con la tanda y cantidad precargadas, carga ultra rápida en celulares y *100% de personalización de fotos, textos y precios antes de la entrega final*.",
    includes: [
      "Diseño nuevo, cálido y tentador enfocado en sus Yoyos y alfajores artesanales",
      "Personalización 100% de fotos, textos, tandas de producción y precios antes del lanzamiento",
      "Catálogo visual interactivo para elegir entre cajas x6, unidades individuales y cortes de producto",
      "Botón de compra directa a su WhatsApp con el pedido y la cantidad ya escrita",
      "Optimización para que su web se encuentre mejor en Google y en los buscadores de Inteligencia Artificial",
      "Carga ultra rápida en celulares (menos de 1 segundo) para que nadie se quede con las ganas",
      "Puesta en marcha, conexión con su dominio oficial y todo listo para funcionar",
      "1 año entero de hosting cloud rápido, certificado de seguridad SSL y mantenimiento técnico incluidos",
    ],
    excludes: [
      "Inversión en pauta publicitaria en Meta Ads o Google Ads (presupuesto definido por ustedes)",
      "Pasarela de cobro bancario automática (se utiliza WhatsApp Checkout directo; disponible como módulo adicional)",
      "Fotografía presencial en taller (se optimizó el material visual actual)",
    ],
    investment: {
      type: "plans",
      currency: "USD",
      paymentTerms: "Pago único de $480 USD por la entrega y puesta en producción de la web completa en su dominio propio. Los futuros desarrollos o ampliaciones se cotizan a demanda por separado, sin mensualidades forzadas.",
      plans: [
        {
          name: "Web Completa Lista para Usar + Mantenimiento",
          price: 480,
          period: "Pago Único",
          recommended: true,
          badge: "TODO INCLUIDO · LISTA PARA PUBLICAR",
          description: "La web completa que ya diseñamos para ustedes, 100% personalizable antes de la entrega final, lista para conectar a su dominio y empezar a recibir pedidos.",
          features: [
            "Web completa desarrollada a medida en Astro 5 y Cloudflare Edge",
            "Personalización 100% de fotos, textos y precios antes de la entrega final",
            "Catálogo visual de cajas x6, piezas individuales y cortes de producto",
            "Botón de pedido directo a su WhatsApp con mensaje y tanda precargados",
            "Optimización SEO para Google y motores de búsqueda con IA",
            "1 año entero de hosting cloud de alta velocidad y certificado SSL",
            "Mantenimiento técnico mínimo y soporte de puesta en marcha incluidos",
            "Puesta en marcha, entrega de código y conexión a su dominio propio",
          ],
        },
        {
          name: "Futuras Ideas & Nuevos Módulos",
          price_display: "¿Charlamos? 🧉",
          period: "A demanda · Sin mensualidades",
          badge: "OPCIONAL · CUANDO LO NECESITEN",
          description: "Si más adelante quieren sumar pagos online con tarjeta (MercadoPago), nuevas landing pages para fechas especiales o envíos automatizados, se cotiza puntual y con tarifa preferencial.",
          features: [
            "Nuevas landing pages para lanzamientos o promociones especiales",
            "Integración de pasarela de pagos online (MercadoPago / POS digital)",
            "Incorporación de nuevas variedades, combos o ediciones festivas",
            "Campañas publicitarias y creatividades para Meta/Instagram Ads",
            "Tarifas preferenciales y presupuesto cerrado por cada nuevo módulo",
            "Cero costos fijos mensuales forzados: pagan solo lo que decidan sumar",
          ],
        },
      ],
    },
    timeline: "La web ya está diseñada y lista para personalizar. Con los ajustes de contenido que coordinemos, la puesta en marcha y entrega final toma *48 a 72 horas hábiles*.",
    roi_table: {
      headers: ["MÉTRICA", "REDES SOCIALES", "CON LA NUEVA WEB DE JUANITO"],
      rows: [
        [
          "Proceso de pedido de tandas",
          "Mensajes desordenados por Instagram",
          "El cliente ve el producto, elige la caja y pide a WhatsApp en 1 click",
        ],
        [
          "Pedidos para mesas familiares o eventos",
          "Consultas manuales de precios",
          "Catálogo visual claro de cajas oficiales x6 y bocado en corte limpio",
        ],
        [
          "Velocidad y tentación visual",
          "Fotos comprimidas en feeds",
          "Carga instantánea en < 1s con fotografía gastronómica en alta definición",
        ],
        [
          "Presencia en Google y búsquedas con IA",
          "Sin presencia web",
          "Indexada para búsquedas de 'yoyos artesanales uruguay' y 'alfajores tradicionales'",
        ],
      ],
    },
    whatsapp_message: "Hola Amargo Creativo, vimos la web que diseñaron para Yoyo Juanito y queremos coordinar la personalización y puesta en marcha.",
    notes: "Propuesta para Yoyo Juanito. Demo: https://yoyo-juanito.elferdi2024.workers.dev/",
  };

  // Upsert proposal
  let proposalId;
  const { data: existing } = await supabase
    .from("proposals")
    .select("id")
    .eq("slug", "yoyo-juanito")
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
  console.log(`URL Magic Link: https://amargo-creativo.pages.dev/p/yoyo-juanito`);
}

main().catch((err) => {
  console.error("Error al sincronizar propuesta:", err);
  process.exit(1);
});
