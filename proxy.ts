import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { AUTH } from "@/lib/routes";

// Single Auth.js session now backs both Sentinel and the storefront, so
// this is the one place route protection is enforced at the network
// boundary — role checks for individual API routes still live at each
// route via requireStaff()/requireAdmin(), since Proxy alone must never
// be the only line of defense (see lib/auth/permissions.ts).
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
  // No `runtime` option: as of Next.js 16, Proxy always runs on the
  // Node.js runtime, which is what `auth()` needs here anyway (it talks
  // to MongoDB via the adapter on staff/admin token re-validation).
};
