import { NextResponse } from "next/server";
import { z } from "zod";

export function apiSuccess<T>(data: T, message = "Success") {
  return NextResponse.json({ success: true, message, data });
}

export function apiError(message: string, errors: string[] = [], status = 400) {
  return NextResponse.json({ success: false, message, errors }, { status });
}

/**
 * Normalizes a lean Mongoose document (or `.toObject()` result) into a plain
 * object with a string `id` field instead of a raw `_id` ObjectId.
 *
 * Every admin CRUD API route must run its response through this before
 * returning it to the client. Without it, the frontend receives `_id`
 * instead of `id`; since every service/type in this app reads `.id`,
 * `<record>.id` ends up `undefined`, and any subsequent update/delete call
 * is sent to `/api/<resource>/undefined`, which silently fails (404/500).
 * This was the root cause of "edit doesn't save" across Categories, Orders,
 * Quotations, Invoices, and Customers.
 */
export function serializeDoc<T extends Record<string, unknown>>(doc: unknown): T {
  if (doc === null || typeof doc !== "object") return doc as T;

  const value = doc as { _id?: unknown; id?: unknown; [key: string]: unknown };

  const id =
    typeof value.id === "string" && value.id
      ? value.id
      : value._id !== undefined && value._id !== null
        ? String(value._id)
        : undefined;

  const { _id, __v, ...rest } = value;
  void _id;
  void __v;

  return {
    ...rest,
    ...(id ? { id } : {}),
  } as T;
}

export function parseJsonBody<T>(request: Request, schema: z.ZodType<T>) {
  return schema.safeParse(request.json());
}

export function parseJsonBodyFromRequest<T>(request: Request, schema: z.ZodType<T>) {
  return request.json().then((value) => schema.safeParse(value));
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const sort = searchParams.get("sort") || "-createdAt";
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10,
    sort,
    query,
    category,
    status,
  };
}
