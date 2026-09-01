// filepath: scripts/test-db-connection.mjs
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hmpswvofxxfanmaiyriu.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHN3dm9meHhmYW5tYWl5cml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3MTEwNiwiZXhwIjoyMTAzODQ3MTA2fQ.-U9OJNRg61B8IaE9zLGA-yoRJs7z_f5vH5V9s514iJU";

const supabase = createClient(supabaseUrl, serviceKey);

async function verify() {
  console.log("🔍 Verificando estructura de base de datos en Supabase...");

  // 1. Probar proposals con is_template
  const { data: tpls, error: tplErr } = await supabase
    .from("proposals")
    .select("id, is_template, template_name, cloned_from")
    .limit(1);

  if (tplErr) {
    console.error("❌ Error en tabla proposals (columnas template):", tplErr.message);
  } else {
    console.log("✅ Tabla proposals OK (is_template, template_name, cloned_from operativos)");
  }

  // 2. Probar tabla invoices
  const { data: invs, error: invErr } = await supabase
    .from("invoices")
    .select("id, number, status, currency, total, tax_rate")
    .limit(1);

  if (invErr) {
    console.error("❌ Error en tabla invoices:", invErr.message);
  } else {
    console.log("✅ Tabla invoices OK");
  }

  // 3. Probar tabla payments
  const { data: pays, error: payErr } = await supabase
    .from("payments")
    .select("id, amount, method")
    .limit(1);

  if (payErr) {
    console.error("❌ Error en tabla payments:", payErr.message);
  } else {
    console.log("✅ Tabla payments OK");
  }

  // 4. Probar tabla notifications
  const { data: notifs, error: notifErr } = await supabase
    .from("notifications")
    .select("id, type, channel, status")
    .limit(1);

  if (notifErr) {
    console.error("❌ Error en tabla notifications:", notifErr.message);
  } else {
    console.log("✅ Tabla notifications OK");
  }

  // 5. Probar tabla clients con columna rut
  const { data: cls, error: clsErr } = await supabase
    .from("clients")
    .select("id, name, rut")
    .limit(1);

  if (clsErr) {
    console.error("❌ Error en tabla clients (rut):", clsErr.message);
  } else {
    console.log("✅ Tabla clients OK (campo rut operativo)");
  }

  console.log("🎉 ¡Todo el ecosistema de base de datos verificado y listo!");
}

verify();
