// filepath: src/middleware.ts
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Proteger todas las rutas /admin excepto /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const cookie = context.cookies.get("amargo_admin");
    const sessionCookie = context.cookies.get("amargo_admin_session");
    const cfUser = context.request.headers.get("cf-access-authenticated-user-email");
    const cfJwt = context.request.headers.get("cf-access-jwt-assertion");

    const adminPassword = import.meta.env.ADMIN_PASSWORD || "amargo2026";

    // Si tiene Cloudflare Access o Cookie válida de admin o sesión
    const isAuthed =
      Boolean(cfUser || cfJwt) ||
      cookie?.value === adminPassword ||
      Boolean(sessionCookie?.value);

    if (!isAuthed) {
      return context.redirect(`/admin/login?redirect=${encodeURIComponent(pathname + context.url.search)}`);
    }
  }

  return next();
});
