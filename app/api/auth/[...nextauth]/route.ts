import { handlers } from "@/lib/customer-auth";

// This is intentionally separate from every route under `app/api/auth/*`
// (login, logout, me, refresh, register) — those all belong to the staff
// JWT system in `lib/auth.ts` and are untouched. Next.js resolves a
// concrete path like `/api/auth/login` against the static route file first,
// falling through to this catch-all only for paths those don't own
// (Auth.js's own endpoints: `/api/auth/signin`, `/api/auth/callback/google`,
// `/api/auth/session`, `/api/auth/csrf`, etc.) — none of which overlap with
// the staff route names above.
export const { GET, POST } = handlers;
