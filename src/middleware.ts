import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const idToken = request.cookies.get("idToken")?.value;

  if (!idToken && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    idToken &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
};
