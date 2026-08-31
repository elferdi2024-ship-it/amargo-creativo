# 🧉 AMARGO CREATIVO — ESTADO DEL PROYECTO & ARQUITECTURA (V30.0)

Este documento representa la **Única Fuente de Verdad (SSOT)** del proyecto. Toda la arquitectura en **Astro 5** ha sido optimizada para máxima velocidad (<0.8s), autoridad SEO multirregional (Uruguay, Argentina y España) y despliegue en `https://amargo-creativo.pages.dev/`.

### 📜 Manifiesto & Speech Oficial:
> *"Más que una agencia creativa: una fuerza que amplifica voces y genera vínculos reales. Integramos estrategia, diseño, tecnología y datos para crear activos digitales que no solo se ven bien… se sienten y convierten. Escuchamos con atención, pensamos con claridad y ejecutamos con precisión. Como un buen mate: cercano, intenso y que deja huella."*

---

## 🏛️ 1. Estructura de Componentes (`src/components/`)

1. **`Preloader.astro`**:
   - Fondo verde mate (`--hero-bg: #2d6335`), contador monumental en `Syne 800` (`mix-blend-mode: exclusion`) y la palabra protagonista en cursiva **`amargo`** (`Instrument Serif Italic`, opacidad `0.35`).
   - Marquee inferior con origen Atlántida, Canelones, Uruguay.

2. **`CustomCursor.astro`**:
   - Puntero fluido con interpolación lerp (`0.18`) en `requestAnimationFrame`.
   - Compatibilidad total en Windows/Chromium con colores sólidos (`rgba(212, 255, 0, 0.25)` y borde oscuro) que no se pierden sobre canvas de video acelerado.
   - Activación condicional con clase `has-custom-cursor` para preservar cursor nativo en dispositivos táctiles.

3. **`Navbar.astro`**:
   - Enlaces de navegación rápida: `Manifiesto`, `Servicios`, `Rendimiento`, `Trabajo`, `Clientes`, `FAQ`, `Contacto`, `Instagram`.
   - Indicador de disponibilidad en tiempo real con pulso de luz: `🟢 5 CUPOS DISPONIBLES • AGOSTO 2026`.
   - Menú lateral en pantalla completa con speech oficial de la **Agencia Creativa** y cobertura en Uruguay, Argentina y España.

4. **`Hero.astro`**:
   - Video cinemático nativo (`new hero.mp4`) con fondo texturizado a juego (`#e4e1d8`) y sin estiramientos pixelados.
   - Centro visual 100% despejado para destacar el arte original del mate y la estética de autor.
   - Scrubbing ultrasuave con amortiguación sedosa (`lerp 0.07`), protección contra saltos de frame y fallback para móviles.
   - Barra inferior HUD con `<h1>` semántico (`CREACIÓN DE PÁGINAS WEB • APPS • SEO • CONVERSIÓN`) y métricas de alto impacto (`100% ENFOCADO EN VENTAS`, `< 0.8s CARGA INSTANTÁNEA`).
   - Sello circular rotatorio con física continua: `AMARGO CREATIVO™ • AGENCIA CREATIVA • ATLÁNTIDA, UY`.

5. **`Marquee.astro`**:
   - Cinta infinita optimizada sin layout thrashing.
   - Bloques distintivos: `DISEÑO WEB` (Bone), `crecimiento` (Electric Italic), `APLICACIONES` (Mate Green), `resultados` (Rust).

6. **`Manifesto.astro`**:
   - Insignia `[01]` en Verde Mate.
   - Speech oficial completo de la Agencia Creativa con revelado escalonado en scroll.

7. **`Capabilities.astro` (Servicios)**:
    - 4 servicios de alta conversión para UY, AR y ES:
      1. `01. Creación y Diseño Web de Élite` (Rápido, móvil, tiendas online).
      2. `02. Desarrollo de Aplicaciones & SaaS` (Plataformas web, marketplaces, Next.js/Astro).
      3. `03. Posicionamiento SEO & Búsquedas IA` (SEO técnico, Schema.org, Google UY/AR).
      4. `04. Estrategia Comercial & WhatsApp Commerce` (Venta directa, CRO, cero fricción).
    - 4 iconos vectoriales SVG limpios e interactivos.

8. **`PerformanceComparison.astro` (Comparativa Técnica)**:
   - Bloque 1 (Web Tradicional / Plantilla): `4.8s`, `38/100`, `35% retención`.
   - Bloque 2 (Motor Amargo Creativo): `< 0.8s`, `99/100 Core Web Vitals`, `92% retención`, `Stack Moderno a Medida (Cero Bloat)`.

9. **`Showcase.astro` (Trabajos)**:
   - Filtros por categoría interactivos: `TODOS (4)`, `MARKETPLACE`, `SAAS & APPS`.
   - Casos de éxito con métricas y soluciones reales: *Barrio.uy*, *DrivePrime*, *Remate*, *Faconeros Hub*.
   - Carrusel arrastrable con mouse (drag & swipe) y modal de detalles a pantalla completa.

10. **`Metrics.astro` (Estrategia Sin Vueltas)**:
    - 4 pilares de crecimiento: `VENTAS`, `< 1s`, `GOOGLE`, `100% ACTIVO TUYO`.

11. **`Testimonials.astro` (Prueba Social)**:
    - Citas de clientes y fundadores con sus logros concretos (`-45% Tasa de Rebote`, `Cero Fricción Comercial`, `WebSockets & Cero Latencia`).

12. **`Process.astro` (Cómo Trabajamos)**:
    - Grilla limpia de 3 columnas (`80px 1fr 2fr`) con spotlight lumínico interactivo.
    - 4 etapas transparentes: *01. Charla de 15 min*, *02. Estructura y Diseño Visual*, *03. Desarrollo y Velocidad*, *04. Lanzamiento y a Rodar*.

13. **`FAQ.astro` (Preguntas Frecuentes)**:
    - Acordeones interactivos para resolver dudas de compra: tiempos de entrega (10-14 días), propiedad total del código (100%), posicionamiento en Uruguay y métodos de pago (BROU, Santander, Itaú, Stripe).

14. **`Contact.astro` (Contacto Directo)**:
    - Fondo terracota (`--contact-bg: #b94821`).
    - Enlaces monumentales con física magnética:
      - `hola@amargocreativo.com ↗` (Subrayado Amarillo Eléctrico)
      - `+598 99 000 000 (WhatsApp) ↗` (Subrayado Verde Mate Claro)
    - Información de estudio en Atlántida, Canelones y respuesta en menos de 24 horas.

15. **`Footer.astro`**:
    - Reloj en vivo de Uruguay (Montevideo timezone `America/Montevideo`).
    - Frase identitaria de marca: *"Siempre es una buena hora para compartir un amargo"*.

16. **`ThemeSwitcher.astro`**:
    - 4 temas intercambiables: **Hueso (Default)**, **Carbón (Dark)**, **Eléctrico (Neon)** y **Modo Mate (Verde Yerba Mate & Bombilla)**.

---

## 🎨 2. Sistema de Diseño & Tokens CSS (`src/styles/global.css`)

```css
:root {
  --bone: #e8e6e0;
  --paper: #f4f2ec;
  --ink: #0a0a0a;
  --charcoal: #1a1a18;
  --mate: #3a7d44;        /* Verde Mate Principal */
  --mate-light: #97bc62;  /* Acento Verde Mate Claro */
  --electric: #d4ff00;    /* Amarillo Eléctrico */
  --rust: #b94821;        /* Terracota / Óxido */
  --mute: #4a4a45;
  --line: #0a0a0a;
}
```

### Tipografías:
- **`Syne (600, 700, 800)`**: Titulares y jerarquía principal.
- **`Instrument Serif (Italic)`**: Acentos estilísticos y frases de impacto.
- **`Space Grotesk (300, 400, 500, 600, 700)`**: Textos de lectura y párrafos.
- **`JetBrains Mono (400, 500, 700)`**: Metadatos, etiquetas técnicas y botones.
- **`Anton`**: Números gigantes.

---

## ⚡ 3. Rendimiento & SEO
- **Astro 5 Static Build**: Salida compilada ultraligera en `dist/`.
- **Sitemap Automático**: Generado en `https://www.amargocreativo.com/sitemap-index.xml`.
- **Robots.txt**: Indexación optimizada para Google.
- **Schema JSON-LD**: `LocalBusiness` con cobertura en Canelones, Montevideo y todo Uruguay.
- **Smooth Scroll**: Lenis integrado nativamente.
