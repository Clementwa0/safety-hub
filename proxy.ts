import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { AUTH } from "@/lib/routes";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isSentinelStaff = role === "staff" || role === "admin";

  // Protect the admin area except the login page.
  if (pathname.startsWith("/sentinel") && pathname !== "/login") {
    if (!isSentinelStaff) {
      const loginUrl = new URL(AUTH.LOGIN, req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Already-authenticated staff/admin shouldn't see the login page.
  if (pathname === "/login" && isSentinelStaff) {
    return NextResponse.redirect(new URL(AUTH.SENTINEL_ROOT, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/sentinel/:path*", "/login"],
  
};
