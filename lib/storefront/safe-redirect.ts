
export function getSafeCallbackUrl(next: string | null | undefined, fallback: string): string {
  if (!next) return fallback;

  if (!/^\/(?!\/|\\)/.test(next)) return fallback;

  return next;
}
