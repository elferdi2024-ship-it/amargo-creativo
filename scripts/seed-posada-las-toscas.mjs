// filepath: scripts/seed-posada-las-toscas.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hmpswvofxxfanmaiyriu.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHN3dm9meHhmYW5tYWl5cml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3MTEwNiwiZXhwIjoyMTAzODQ3MTA2fQ.-U9OJNRg61B8IaE9zLGA-yoRJs7z_f5vH5V9s514iJU";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("1. Creando cliente 'Posada & Cabañas Las Toscas'...");

  let { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("name", "Posada & Cabañas Las Toscas")
    .maybeSingle();

  if (!client) {
    const { data: newClient, error: clientErr } = await supabase
      .from("clients")
      .insert({
        name: "Posada & Cabañas Las Toscas",
        company: "Las Toscas Suites SRL",
        email: "reservas@posadalastoscas.uy",
        phone: "+598 99 444 555",
        notes: "Complejo turístico de 12 cabañas y suites boutique en Las Toscas, Canelones. Alto tráfico en temporada alta y escapadas de fin de semana.",
      })
      .select()
      .single();

    if (clientErr) throw clientErr;
    client = newClient;
  }

  console.log("2. Insertando propuesta comercial...");

  const proposalData = {
    client_id: client.id,
    slug: "posada-las-toscas",
    project_title: "Canal Directo de Reservas & Catálogo de Cabañas",
    status: "active",
    value_phrase: "Eliminamos las comisiones del 15% al 18% de Airbnb y Booking con un canal de reserva directa ultrarrápido y cotizador 1-tap a WhatsApp.",
    challenge: "Dependencia excesiva de plataformas internacionales (Booking/Airbnb) que retienen comisiones de hasta un 18% por estadía, demoran las liquidaciones y no permiten fidelizar al huésped que regresa cada verano.",
    solution: "Desarrollo de un sitio web de autor de alto impacto visual con fotografía inmersiva, cotizador automático de noches, disponibilidad en tiempo real y confirmación directa a WhatsApp sin fricción.",
    includes: [
      "Diseño UI/UX exclusivo con estética minimalista y fotografía a pantalla completa",
      "Catálogo interactivo de las 12 cabañas/suites con galería, amenities y capacidad",
      "Cotizador inteligente de tarifas según temporada alta/baja y cantidad de huéspedes",
      "Botón 1-tap de reserva directa que genera el mensaje formateado a WhatsApp",
      "Optimización SEO local para captar búsquedas de Montevideo, Buenos Aires y Brasil",
      "Alojamiento ultrarrápido en Cloudflare Edge (< 0.6s de carga en móviles)",
      "Cero comisiones por noche reservada (100% del ingreso queda en el complejo)",
    ],
    excludes: [
      "Producción fotográfica o de video con dron presencial (el cliente provee el material)",
      "Pauta publicitaria en Meta Ads o Google Ads (se presupuesta por separado)",
      "Comisiones de pasarelas de cobro bancarias en caso de integrar cobro online directo",
    ],
    investment: {
      type: "fixed",
      currency: "USD",
      amount: 1250,
      paymentTerms: "50% al aceptar esta propuesta para dar inicio al proyecto, y 50% restante contra entrega final y publicación en dominio.",
    },
    timeline: "10 a 14 días hábiles desde la entrega de imágenes y textos base.",
    roi_table: {
      headers: [
        "Concepto",
        "Con Portales (16% comisiones)",
        "Con Canal Directo Propio",
      ],
      rows: [
        [
          "Ingresos brutos temporada (4 meses)",
          "$ 25.000 USD",
          "$ 25.000 USD",
        ],
        [
          "Comisiones retenidas por plataformas",
          "-$ 4.000 USD",
          "$ 0 USD (100% para la posada)",
        ],
        [
          "Inversión web Amargo Creativo",
          "$ 0",
          "$ 1.250 USD (pago único)",
        ],
        [
          "Ganancia neta adicional recuperada",
          "$ 21.000 USD",
          "+$ 2.750 USD extra en la 1° temporada",
        ],
      ],
    },
    whatsapp_message: "Hola Amargo Creativo, revisé la propuesta para el canal de reservas de Posada Las Toscas y quiero coordinar el kick-off.",
    notes: "Propuesta de desarrollo de precio fijo para complejo turístico de la Costa de Oro.",
  };

  const { data: existing } = await supabase
    .from("proposals")
    .select("id")
    .eq("slug", "posada-las-toscas")
    .maybeSingle();

  if (existing) {
    const { data: updated } = await supabase
      .from("proposals")
      .update(proposalData)
      .eq("id", existing.id)
      .select()
      .single();
    console.log("Propuesta actualizada:", updated.id);
  } else {
    const { data: created } = await supabase
      .from("proposals")
      .insert(proposalData)
      .select()
      .single();
    console.log("Propuesta creada con ID:", created.id);
  }

  console.log("¡Todo listo! Podés verla en /p/posada-las-toscas");
}

main().catch(console.error);
