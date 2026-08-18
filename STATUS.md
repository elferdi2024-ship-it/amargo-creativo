# 🧉 AMARGO CREATIVO — ESTADO DEL PROYECTO & ARQUITECTURA (V26.0)

Este documento representa la **Única Fuente de Verdad (SSOT)** del proyecto. Toda la migración desde el HTML original hacia **Astro 5** ha sido completada, optimizada y pulida al 100%. **Ya no es necesario consultar el HTML anterior.**

---

## 🏛️ 1. Estructura de Componentes (`src/components/`)

1. **`Preloader.astro`**:
   - Fondo verde mate (`--hero-bg: #3a7d44`), contador monumental en `Syne 800` (`mix-blend-mode: exclusion`) y la palabra protagonista en cursiva **`amargo`** (`Instrument Serif Italic`, opacidad `0.35`).
   - Marquee inferior con origen Atlántida, Canelones, Uruguay.

2. **`CustomCursor.astro`**:
   - Puntero fluido con interpolación lerp (`0.18`) en `requestAnimationFrame`.
   - Círculo exterior con expansión a caja brutalista de 80px en hover con etiqueta interactiva (`VER`, `EMAIL`, `WHATSAPP`, etc.).
   - Punto central `cursorDot` con `mix-blend-mode: difference`.

3. **`Navbar.astro`**:
   - Enlaces de navegación rápida: `Manifiesto`, `Servicios`, `Rendimiento`, `Trabajo`, `Clientes`, `FAQ`.
   - Indicador de disponibilidad en tiempo real con pulso de luz: `🟢 5 CUPOS DISPONIBLES • AGOSTO 2026`.
   - Menú lateral en pantalla completa (móvil y desktop) con efecto scramble en enlaces y botón de cierre interactivo.

4. **`Hero.astro`**:
   - Tipografía monumental brutalista: `MOTORES` `de crecimiento` `DIGITAL`.
   - Subtítulo vendedor y cercano.
   - Botones equilibrados con altura estandarizada de 44px: `EMPECEMOS TU PROYECTO` (Amarillo Eléctrico) y `VER TRABAJOS →` (Borde sutil).
   - Métricas destacadas sin solapamientos: `100% ENFOCADO EN VENTAS` y `< 1.0s CARGA INSTANTÁNEA`.
   - Sello circular rotatorio con física continua: `AMARGO CREATIVO™ • ATLÁNTIDA, UY`.

5. **`Marquee.astro`**:
   - Cinta infinita optimizada sin layout thrashing.
   - Bloques distintivos: `DISEÑO WEB` (Bone), `crecimiento` (Electric Italic), `APLICACIONES` (Mate Green), `resultados` (Rust).

6. **`Manifesto.astro`**:
   - Insignia `[01]` en Verde Mate.
   - Frase célebre: *"Tu web no es un folleto que junta polvo. Es tu mejor vendedor, trabajando las 24 horas, sin pedir aumentos ni comisiones. Construimos herramientas que venden todos los días."*
   - Revelado escalonado en scroll seguro para Astro.

7. **`Capabilities.astro` (Servicios)**:
   - 4 servicios explicados en lenguaje humano y cercano:
     1. `01. Diseño y Creación Web` (Rápido, celular, tiendas online).
     2. `02. Estrategia para Vender Más` (Enfoque en WhatsApp directo y ventas).
     3. `03. Marcas con Personalidad` (Identidad y carácter).
     4. `04. Que te Encuentren en Google` (SEO local en Uruguay).
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
