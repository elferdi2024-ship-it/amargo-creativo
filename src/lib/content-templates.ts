// filepath: src/lib/content-templates.ts
export interface ContentPayload {
  title: string;
  client_name: string;
  challenge?: string;
  solution?: string;
  timeline?: string;
  amount?: string;
}

export const CONTENT_PROMPTS = {
  case_study: (data: ContentPayload) => `Case Study – ${data.title}

Cliente: ${data.client_name}

01. El desafío
${data.challenge || "El cliente necesitaba una presencia digital de alto rendimiento que convirtiera visitas en consultas comerciales reales, superando problemas de lentitud y fricción en móviles."}

02. La solución
${data.solution || "Desarrollamos una arquitectura a medida ultrarrápida, eliminando código innecesario y optimizando la ruta de conversión directa a WhatsApp."}

03. Resultados clave
- Tiempo de carga Core Web Vitals < 0.8s en dispositivos móviles
- Cero fricción en el embudo comercial (contacto directo en 1 tap)
- Estética editorial de autor con tipografía suiza y diseño a medida

Amargo Creativo · Atlántida, Canelones, Uruguay
Arquitectura limpia. Conversión directa. Cero bloat.`,

  linkedin: (data: ContentPayload) => `Acabamos de entregar "${data.title}" para ${data.client_name}. 🧉

El problema de muchas empresas no es "no tener una web".
El problema es tener una web lenta, genérica y pesada que nadie lee y que espanta clientes en el primer segundo.

Con Amargo Creativo construimos activos digitales pensados para vender:
• Velocidad instantánea (< 0.8s)
• Enfoque 100% móvil
• Conversión directa a WhatsApp sin formularios burocráticos

Resultado: una herramienta comercial que trabaja y vende las 24 horas del día.

¿Tu sitio web actual está generando consultas reales o solo está ocupando espacio en un servidor?

#WebPerformance #Astro #DesarrolloWeb #Conversion #Uruguay #AmargoCreativo`,

  instagram: (data: ContentPayload) => `${data.title}
Para ${data.client_name}

Arquitectura limpia.
Carga instantánea < 0.8s.
Conversión directa a WhatsApp.

Menos plantillas infladas. Más resultados de negocio.

Diseñado y programado por Amargo Creativo en Atlántida, Uruguay.

#amargocreativo #webdesign #uruguay #webperformance #astro #minimalismo #branding`,

  web: (data: ContentPayload) => `${data.title}
${data.client_name} · Alto rendimiento, estética de autor y conversión directa a WhatsApp.

Tecnologías: Astro 5 · Cloudflare Edge · React Islands · Core Web Vitals <0.8s`,

  email: (data: ContentPayload) => `Asunto: Caso de éxito: Cómo optimizamos ${data.title} para ${data.client_name}

Hola,

Queríamos compartirte brevemente el último proyecto que finalizamos en Amargo Creativo: ${data.title} para ${data.client_name}.

El desafío:
${data.challenge || "Optimizar la conversión y transformar un sitio tradicional en un activo de venta directa."}

Lo que implementamos:
- Desarrollo a medida con carga en menos de 0.8 segundos.
- Arquitectura sin fricción para recibir consultas instantáneas por WhatsApp.

Si te interesa evaluar el rendimiento y conversión de tu sitio actual, respondé este mensaje y lo revisamos juntos en 15 minutos.

Un saludo,
Equipo de Amargo Creativo`,
};
