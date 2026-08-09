export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return headers;
}

/**
 * Combines the envelope's top-level message with any field-level
 * validation errors the server returned, e.g. "Validation failed: String
 * must contain at least 1 character" instead of just "Validation failed".
 */
function buildErrorMessage(payload: ApiEnvelope<unknown> | null): string {
  const base = payload?.message || "Request failed";
  if (payload?.errors?.length) {
    return `${base}: ${payload.errors.join(", ")}`;
  }
  return base;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers: buildHeaders(init),
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(buildErrorMessage(payload));
  }

  return payload.data as T;
}

export async function apiRequestRaw<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers: buildHeaders(init),
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(buildErrorMessage(payload));
  }

  return payload.data as T;
}
