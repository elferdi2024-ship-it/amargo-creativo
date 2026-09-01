// filepath: src/pages/api/preview-proxy.ts
export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing target url", { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    const contentType = res.headers.get("content-type") || "text/html";
    let body = await res.arrayBuffer();

    // Si es HTML, inyectar <base href="..."> para que todas las imágenes, estilos y enlaces relativos apunten al Worker
    if (contentType.includes("text/html")) {
      const decoder = new TextDecoder("utf-8");
      let html = decoder.decode(body);
      const origin = new URL(targetUrl).origin;

      if (!html.includes("<base ")) {
        html = html.replace("<head>", `<head><base href="${origin}/">`);
      }

      const encoder = new TextEncoder();
      body = encoder.encode(html);
    }

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=120");
    // NO set x-frame-options so it embeds perfectly!

    return new Response(body, {
      status: res.status,
      headers,
    });
  } catch (err: any) {
    return new Response(`Proxy error: ${err.message}`, { status: 500 });
  }
};
