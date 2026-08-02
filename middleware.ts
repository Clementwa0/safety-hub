import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { AUTH } from "@/lib/routes";

function isValidToken(token?: string) {
  if (!token) return false;

  try {
    jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;

  // Protect the admin area except the login page
  if (pathname.startsWith("/sentinel") && pathname !== "/login") {
    if (!isValidToken(token)) {
      const loginUrl = new URL(AUTH.LOGIN, request.url);
      loginUrl.searchParams.set("next", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  // Already authenticated users shouldn't see the login page
  if (pathname === "/login" && isValidToken(token)) {
    return NextResponse.redirect(new URL(AUTH.SENTINEL_ROOT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sentinel/:path*", "/login"],
  // `jsonwebtoken` relies on Node's `crypto` module, which is not available
  // in the default Edge runtime. Without this, jwt.verify() throws on every
  // request, isValidToken() silently returns false, and every request -
  // including ones with a freshly-set, valid auth_token cookie - gets
  // redirected back to /login. This is the root cause of the reported bug.
  runtime: "nodejs",
};
