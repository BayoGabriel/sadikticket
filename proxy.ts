import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Fast gate for /admin pages. This only verifies a well-formed, signed session
// cookie exists — every server action/API still re-checks the user and their
// permissions, per the security guidance in the proxy docs.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login" || pathname === "/admin/bootstrap";

  let authed = false;
  const token = request.cookies.get("admin_token")?.value;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      authed = true;
    } catch {
      authed = false;
    }
  }

  if (isLogin) {
    if (authed) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!authed) {
    const url = new URL("/admin/login", request.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
