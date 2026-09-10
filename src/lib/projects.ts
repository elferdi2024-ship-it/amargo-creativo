// filepath: src/lib/projects.ts
export interface Project {
  id: string;
  category: 'marketplace' | 'saas' | 'ecommerce';
  title: string;
  client: string;
  location: string;
  yearCategory: string;
  desc: string;
  challenge: string;
  solution: string;
  keyResult: string;
  url: string;
  liveUrlLabel: string;
  img: string;
  aspectWidth: number;
  aspectHeight: number;
  tags: string[];
  metrics: string;
  featured: boolean;
  status: string;
  lighthouse: {
    perf: number;
    a11y: number;
    bp: number;
    seo: number;
  };
  architecture: {
    stack: string;
    edge: string;
    database: string;
    speed: string;
  };
}

export const projects: Project[] = [
  {
    id: "barrio-uy",
    category: "marketplace",
    title: "Barrio.uy",
    client: "Barrio Inmobiliaria",
    location: "🇺🇾 Montevideo & Costa de Oro",
    yearCategory: "2024 — Real Estate & Marketplace",
    desc: "Marketplace inmobiliario de élite para propiedades de alta gama en Montevideo y Costa de Oro. Búsqueda instantánea con Algolia SSR, filtros de estado en URL y catálogo con cero parpadeo.",
    challenge: "Las plataformas tradicionales tardaban más de 4 segundos en filtrar propiedades por barrio y precio, provocando un rebote del 68%.",
    solution: "Implementación de arquitectura Server-Side Rendering (SSR) con Algolia InstantSearch y optimización de payload attributesToRetrieve, reduciendo el tiempo de respuesta a 42ms.",
    keyResult: "Búsqueda en <45ms • -45% rebote • +180% leads calificados",
    url: "https://www.barrio.uy/",
    liveUrlLabel: "barrio.uy",
    img: "/projects/barrio-uy.webp",
    aspectWidth: 1200,
    aspectHeight: 900,
    tags: ["NEXT.JS 15", "ALGOLIA SSR", "POSTGRESQL", "TAILWIND"],
    metrics: "42ms latencia • 100/100 Core Web Vitals",
    featured: true,
    status: "ACTIVO EN PRODUCCIÓN",
    lighthouse: { perf: 98, a11y: 100, bp: 100, seo: 100 },
    architecture: {
      stack: "Next.js 15 App Router + React 19 RSC",
      edge: "Vercel Edge Network + Stale-While-Revalidate",
      database: "PostgreSQL Neon + Algolia Distributed Index",
      speed: "LCP 0.62s • TTFB 42ms • CLS 0.000"
    }
  },
  {
    id: "mercado-atlantida",
    category: "marketplace",
    title: "Mercado Atlántida",
    client: "Mercado Atlántida Polo Gastronómico",
    location: "🇺🇾 Atlántida, Costa de Oro",
    yearCategory: "2026 — Polo Gastronómico & Comercial",
    desc: "Directorio comercial interactivo y plataforma en vivo para el polo gastronómico más importante de la Costa de Oro. Catálogo de locales en tiempo real con despacho express.",
    challenge: "Más de 40 puestos gastronómicos requerían un canal digital unificado sin pagar altas comisiones de apps intermediarias de delivery.",
    solution: "Ecosistema serverless en Cloudflare Workers con catálogo visual hiperrápido e integración de pedidos directos al WhatsApp de cada puesto.",
    keyResult: "+40 puestos unificados • Cero comisiones de intermediación",
    url: "https://mercado-atlantida.elferdi2024.workers.dev/",
    liveUrlLabel: "mercado-atlantida.workers.dev",
    img: "/projects/mercado-atlantida.webp",
    aspectWidth: 1200,
    aspectHeight: 900,
    tags: ["CLOUDFLARE EDGE", "WHATSAPP COMMERCE", "ASTRO 5"],
    metrics: "Carga en 0.6s • +40 locales activos",
    featured: true,
    status: "ACTIVO EN PRODUCCIÓN",
    lighthouse: { perf: 100, a11y: 100, bp: 100, seo: 100 },
    architecture: {
      stack: "Astro 5 + Vanilla High-Performance JS",
      edge: "Cloudflare Workers Global Edge V8",
      database: "Cloudflare KV + JSON Ledger",
      speed: "LCP 0.58s • TTFB 28ms • CLS 0.000"
    }
  },
  {
    id: "lomax-propiedades",
    category: "marketplace",
    title: "LOMAX Propiedades",
    client: "LOMAX Real Estate Boutique",
    location: "🇺🇾 Punta del Este & Montevideo",
    yearCategory: "2026 — Inmobiliaria Boutique & Lujo",
    desc: "Curaduría editorial y catálogo inmersivo para residencias exclusivas y terrenos singulares en Punta del Este y Montevideo con diseño brutalista refinado.",
    challenge: "Transmitir la exclusividad de propiedades boutique sin la lentitud ni el diseño clónico de los portales inmobiliarios genéricos.",
    solution: "Diseño visual a medida con tipografía editorial de alto impacto, carga progresiva de imágenes arquitectónicas en WebP y tasaciones inteligentes.",
    keyResult: "Tiempo de permanencia +210% • Consultas de alto patrimonio",
    url: "https://lomax-propiedades.elferdi2024.workers.dev/",
    liveUrlLabel: "lomax-propiedades.workers.dev",
    img: "/projects/lomax-propiedades.webp",
    aspectWidth: 1200,
    aspectHeight: 900,
    tags: ["ASTRO 5", "EDITORIAL DESIGN", "CLOUDFLARE PAGES"],
    metrics: "LCP 0.7s • Catálogo High-End",
    featured: true,
    status: "ACTIVO EN PRODUCCIÓN",
    lighthouse: { perf: 99, a11y: 100, bp: 100, seo: 100 },
    architecture: {
      stack: "Astro 5 Server-Driven + Tailwind CSS",
      edge: "Cloudflare Pages Immutable Asset Cache",
      database: "Headless Content Architecture",
      speed: "LCP 0.68s • TTFB 35ms • CLS 0.000"
    }
  },
  {
    id: "legendary-burger",
    category: "ecommerce",
    title: "Legendary Burger",
    client: "Legendary Smash Burgers",
    location: "🇺🇾 Costa de Oro & Canelones",
    yearCategory: "2025 — FoodTech & E-Commerce",
    desc: "Web app interactiva para personalización de smash burgers en tiempo real con constructor de pedidos dinámico y checkout directo a WhatsApp respaldado en Supabase.",
    challenge: "El menú en PDF causaba demoras en la toma de pedidos y errores recurrentes en los agregados de salsas y medallones.",
    solution: "Constructor visual e interactivo 'Armá tu burger' paso a paso, con cálculo automático de totales y derivación inmediata a la comanda de WhatsApp.",
    keyResult: "+120 pedidos diarios • Reducción del tiempo de toma de pedido a 45s",
    url: "https://legendary-burger.vercel.app/",
    liveUrlLabel: "legendary-burger.vercel.app",
    img: "/projects/legendary-burger.webp",
    aspectWidth: 1200,
    aspectHeight: 900,
    tags: ["REACT 19", "SUPABASE", "BURGER BUILDER", "CRO"],
    metrics: "+120 pedidos/día • Checkout en 3 pasos",
    featured: true,
    status: "ACTIVO EN PRODUCCIÓN",
    lighthouse: { perf: 96, a11y: 98, bp: 100, seo: 100 },
    architecture: {
      stack: "React 19 + TypeScript + Tailwind CSS",
      edge: "Vercel Global Edge Network",
      database: "Supabase Realtime PostgreSQL + Auth",
      speed: "LCP 0.74s • Interacción en 16ms • CLS 0.000"
    }
  },
  {
    id: "deal-motors",
    category: "saas",
    title: "Deal Motors UY",
    client: "Deal Motors / SHACMAN Uruguay",
    location: "🇺🇾 Montevideo / Red Nacional",
    yearCategory: "2025 — Automotora Digital & Trade-In",
    desc: "Plataforma automotriz de alta gama, representante oficial SHACMAN en Uruguay. Catálogo certificado con 240 puntos y cotizador inteligente de permutas (Trade-In).",
    challenge: "Los clientes necesitaban cotizar su vehículo usado al instante antes de coordinar visitas presenciales a la concesionaria.",
    solution: "Algoritmo de cotización automática de permutas según año, marca y kilometraje, integrado con agenda de test drives directa.",
    keyResult: "+65 cotizaciones semanales • Ciclo de venta acortado en 4 días",
    url: "https://driveprime-eta.vercel.app/",
    liveUrlLabel: "driveprime-eta.vercel.app",
    img: "/projects/driveprime.webp",
    aspectWidth: 1200,
    aspectHeight: 900,
    tags: ["NEXT.JS 15", "TRADE-IN ENGINE", "TAILWIND CSS"],
    metrics: "Cotizador en tiempo real • Catálogo SHACMAN",
    featured: false,
    status: "ACTIVO EN PRODUCCIÓN",
    lighthouse: { perf: 97, a11y: 100, bp: 100, seo: 100 },
    architecture: {
      stack: "Next.js 15 App Router + Server Actions",
      edge: "Vercel Edge Computing",
      database: "Supabase Relational Engine",
      speed: "LCP 0.69s • Cotización en 120ms • CLS 0.000"
    }
  },
  {
    id: "remate",
    category: "ecommerce",
    title: "Distribuidora El Remate",
    client: "Distribuidora El Remate Canelones",
    location: "🇺🇾 Canelones (6 Sucursales)",
    yearCategory: "2025 — E-Commerce Mayorista & Minorista",
    desc: "Ecosistema comercial con más de 1.900 productos activos y 6 sucursales en Canelones. Buscador ultrarrápido, selector de sucursal y pedidos mayoristas por WhatsApp.",
    challenge: "Manejar un inventario masivo con sincronización de precios entre 6 sucursales sin depender de servidores lentos.",
    solution: "Arquitectura estática híbrida con búsqueda de productos en menos de 20ms y selector de punto de retiro geolocalizado.",
    keyResult: "Catálogo completo navegable en móvil • +1.900 SKUs activos",
    url: "https://remate-psi.vercel.app/",
    liveUrlLabel: "remate-psi.vercel.app",
    img: "/projects/remate.webp",
    aspectWidth: 1200,
    aspectHeight: 900,
    tags: ["E-COMMERCE", "ALTO INVENTARIO", "MAYORISTA"],
    metrics: "+1.900 productos • 6 sucursales Canelones",
    featured: false,
    status: "ACTIVO EN PRODUCCIÓN",
    lighthouse: { perf: 98, a11y: 100, bp: 100, seo: 100 },
    architecture: {
      stack: "Next.js Hybrid SSG + Client Search",
      edge: "Edge CDN Caching + LocalStorage Cart",
      database: "Prisma ORM + PostgreSQL",
      speed: "LCP 0.65s • Búsqueda en 18ms • CLS 0.000"
    }
  },
  {
    id: "avicola-control",
    category: "saas",
    title: "Avícola Control",
    client: "Faconeros & Productores Avícolas",
    location: "🇺🇾 Cuenca Avícola Canelones",
    yearCategory: "2025 — Agro SaaS & Trazabilidad",
    desc: "Software de trazabilidad operativa y gestión integral para criaderos avícolas: curvas de peso Cobb 500 & Ross, balance de ración, mortandad y sincronización de planillas.",
    challenge: "El registro manual en libretas generaba inconsistencias en los índices de conversión alimenticia y faena.",
    solution: "Dashboard en la nube con alertas de desvío de peso, cálculo de índice de eficiencia productiva (IEP) y reportes automáticos.",
    keyResult: "Trazabilidad 100% digital • Cero pérdidas de datos de lotes",
    url: "https://faconeros-app.vercel.app/hub",
    liveUrlLabel: "faconeros-app.vercel.app/hub",
    img: "/projects/avicola-control.webp",
    aspectWidth: 1200,
    aspectHeight: 900,
    tags: ["AGRO SAAS", "DASHBOARD", "SUPABASE", "CHARTS"],
    metrics: "Control de lotes Cobb 500 • Cero pérdidas",
    featured: false,
    status: "ACTIVO EN PRODUCCIÓN",
    lighthouse: { perf: 99, a11y: 100, bp: 100, seo: 100 },
    architecture: {
      stack: "React 19 + Tremor Charts + Tailwind",
      edge: "Vercel Global Edge Network",
      database: "Supabase PostgreSQL with RLS",
      speed: "LCP 0.60s • Render de gráficos en 30ms • CLS 0.000"
    }
  }
];
