// filepath: src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { checkAdminPassword } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Proteger todas las rutas /admin excepto /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const cookie = context.cookies.get("amargo_admin");
    const sessionCookie = context.cookies.get("amargo_admin_session");
    const cfUser = context.request.headers.get("cf-access-authenticated-user-email");
    const cfJwt = context.request.headers.get("cf-access-jwt-assertion");

    const runtimeEnv = (context.locals as any)?.runtime?.env || {};
    const runtimePass = runtimeEnv.ADMIN_PASSWORD;

    // Si tiene sesión activa o Cloudflare Access o cookie válida
    const isAuthed =
      Boolean(cfUser || cfJwt) ||
      Boolean(sessionCookie?.value) ||
      cookie?.value === "authenticated" ||
      checkAdminPassword(cookie?.value || "", runtimePass);

    if (!isAuthed) {
      return context.redirect(`/admin/login?redirect=${encodeURIComponent(pathname + context.url.search)}`);
    }
  }

  return next();
});
