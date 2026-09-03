/**
 * Validates a user-supplied redirect target (e.g. a `?next=` query param)
 * before it's used as a NextAuth `callbackUrl`.
 *
 * Only same-origin, absolute-path targets are allowed. In particular this
 * rejects:
 *  - protocol-relative URLs like `//evil.com` or `/\evil.com` (browsers
 *    treat both as "go to this other host")
 *  - anything with a scheme, e.g. `https://evil.com`, `javascript:...`
 *  - anything that isn't a string starting with a single `/`
 *
 * Without this check, `/account/sign-in?next=https://evil.com` (or the
 * `//`/`/\` variants) could be used to phish customers straight off the
 * site immediately after a real, successful sign-in.
 */
export function getSafeCallbackUrl(next: string | null | undefined, fallback: string): string {
  if (!next) return fallback;

  // Must start with exactly one leading slash, and that slash must not be
  // followed by another slash or a backslash - both are parsed by
  // browsers as "switch host", i.e. an open redirect.
  if (!/^\/(?!\/|\\)/.test(next)) return fallback;

  return next;
}
