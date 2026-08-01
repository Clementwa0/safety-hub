import { NextResponse } from "next/server";
import { z } from "zod";

export function apiSuccess<T>(data: T, message = "Success") {
  return NextResponse.json({ success: true, message, data });
}

export function apiError(message: string, errors: string[] = [], status = 400) {
  return NextResponse.json({ success: false, message, errors }, { status });
}

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

/**
 * Serializes a Product document whose `category` field may either be a raw
 * ObjectId or a populated Category doc (`.populate("category", "name slug")`).
 * Always returns `category` as the plain category NAME string (what every
 * consumer in the app — admin forms, cart, CSV export — expects), plus
 * `categoryId`/`categorySlug` for anything that needs the ObjectId/slug.
 * This keeps Mongoose ObjectIds from ever reaching a Client Component.
 */
export function serializeProduct<T extends Record<string, unknown>>(doc: unknown): T {
  if (doc === null || typeof doc !== "object") return doc as T;

  const value = doc as { category?: unknown; [key: string]: unknown };
  const rawCategory = value.category;

  let categoryName = "";
  let categoryId: string | undefined;
  let categorySlug: string | undefined;

  if (rawCategory && typeof rawCategory === "object" && "name" in rawCategory) {
    const populated = rawCategory as { _id?: unknown; name?: unknown; slug?: unknown };
    categoryName = typeof populated.name === "string" ? populated.name : "";
    categoryId = populated._id !== undefined ? String(populated._id) : undefined;
    categorySlug = typeof populated.slug === "string" ? populated.slug : undefined;
  } else if (rawCategory !== undefined && rawCategory !== null) {
    // Not populated — just the ObjectId (or already a string, e.g. legacy data).
    categoryId = String(rawCategory);
  }

  return serializeDoc({
    ...value,
    category: categoryName,
    categoryId,
    categorySlug,
  }) as T;
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
