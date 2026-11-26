// filepath: src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { isAuthenticated } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login" || pathname === "/admin/login/";
  const isProtectedApi =
    pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/auth");

  if ((isAdminPage && !isAdminLogin) || isProtectedApi) {
    const runtimeEnv =
      (context.locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
    const authed = await isAuthenticated(
      context.cookies,
      context.request,
      runtimeEnv.ADMIN_SESSION_SECRET
    );

    if (!authed) {
      if (isProtectedApi) {
        return new Response(
          JSON.stringify({ ok: false, message: "No autorizado" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      const redirectTarget = encodeURIComponent(pathname + search);
      return context.redirect(`/admin/login?redirect=${redirectTarget}`, 302);
    }
  }

  return next();
});
