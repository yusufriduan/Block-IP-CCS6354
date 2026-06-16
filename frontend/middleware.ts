import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const adminCookie = request.cookies.get("admin_session");
  const ownerCookie = request.cookies.get("owner_session");
  const { pathname } = request.nextUrl;

  if (pathname === "/" && adminCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin") && !adminCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/register_admin") && !adminCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/register_admin") && adminCookie && !ownerCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Admins can't access /registerIP
  if (pathname.startsWith("/registerIP") && adminCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/registerIP/:path*", "/registerIP", "/register_admin/:path*", "/register_admin"],
};