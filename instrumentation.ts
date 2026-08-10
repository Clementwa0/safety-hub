/**
 * Next.js instrumentation hook — runs once when the server process starts,
 * for both `next dev` and `next start`, before any request is handled.
 * https://nextjs.org/docs/app/guides/instrumentation
 *
 * Forces Node's DNS resolver to prefer IPv4 results. Without this, outbound
 * fetches (notably the Google/Facebook OAuth token exchange in
 * lib/auth/config.ts) can hang until timeout on machines/networks where
 * IPv6 is advertised but not actually routable — a common local-dev and
 * VPN/ISP situation. Node's `fetch` tries the resolved addresses in DNS
 * order, so if IPv6 comes first and is a dead end, every attempt eats the
 * full timeout before falling back — surfacing as
 * `TypeError: fetch failed` / `AggregateError` / `ETIMEDOUT` in the
 * Auth.js callback route, even though the network is otherwise fine.
 *
 * Safe to run in any environment: this only changes the ORDER candidate
 * addresses are tried in, not what's reachable, so it's a no-op when IPv6
 * already works.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns");
    const net = await import("node:net");
    dns.setDefaultResultOrder("ipv4first");
    // Node's `net.connect` races IPv4 and IPv6 attempts against each other
    // by default (Happy Eyeballs / autoSelectFamily). `ipv4first` alone
    // only changes which one goes first — it still races the other one in
    // parallel. On a host where IPv6 is truly unreachable (not slow —
    // confirmed via `ENETUNREACH` from a raw `connect()` syscall trace,
    // meaning there's no route at all) that's pure wasted work on every
    // single outbound connection, and on a lossy/flaky link it can eat
    // into the timeout budget before the IPv4 attempt lands. Disabling it
    // makes Node try addresses sequentially in DNS order instead.
    net.setDefaultAutoSelectFamily(false);
  }
}
