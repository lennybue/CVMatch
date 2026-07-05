import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

export default auth((req) => {
  const pathnameWithoutLocale = stripLocale(req.nextUrl.pathname);
  const isProtectedRoute = pathnameWithoutLocale.startsWith("/dashboard");

  if (isProtectedRoute && !req.auth) {
    const locale =
      routing.locales.find((l) => req.nextUrl.pathname.startsWith(`/${l}`)) ??
      routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return handleI18nRouting(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
