import { NextResponse, NextRequest } from "next/server";

// middleware.ts
export function middleware(request: NextRequest) {
  const adminCookie = request.cookies.get("admin_session");
  const { pathname } = request.nextUrl;

  if (pathname === "/" && adminCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin") && !adminCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Admins can't access /registerIP
  if (pathname.startsWith("/registerIP") && adminCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/registerIP/:path*", "/registerIP"],
};