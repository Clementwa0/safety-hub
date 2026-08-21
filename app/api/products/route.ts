import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeProduct } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { CategoryModel } from "@/lib/models/Category";
import { requireStaff } from "@/lib/auth";
import { productSchema } from "@/lib/validation/product";
import { slugify } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await requireStaff();
    const isAdmin = Boolean(user);

    const { searchParams } = new URL(request.url);
    const { page, sort, query, category, status } = getPaginationParams(searchParams);
    // getPaginationParams caps `limit` at 50 for public-facing listings; the
    // admin table needs the full filtered set client-side for bulk-select
    // and CSV export, so admins may ask for up to 500 rows per page.
    const requestedLimit = Number(searchParams.get("limit") || 10);
    const limit = isAdmin
      ? Math.min(Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 10, 500)
      : Math.min(Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 10, 50);
    const brand = searchParams.get("brand") || "";
    const featured = searchParams.get("featured");
    const isNewArrival = searchParams.get("isNewArrival");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    await connectToDatabase();
    const queryFilter: Record<string, unknown> = {};

    if (query) {
      queryFilter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { sku: { $regex: query, $options: "i" } },
      ];
    }

    // `category` is stored as a Category ObjectId on Product, so a
    // name/slug filter has to be resolved to that id first — comparing an
    // ObjectId field against a string (even via $regex) never matches.
    if (category) {
      const matchedCategory = await CategoryModel.findOne({
        $or: [
          { slug: category.toLowerCase() },
          { name: { $regex: `^${category}$`, $options: "i" } },
        ],
      })
        .select("_id")
        .lean();

      // No matching category means no products can match either; short
      // circuit with an ObjectId that can't exist rather than falling
      // through to an unfiltered list.
      queryFilter.category = matchedCategory
        ? matchedCategory._id
        : new mongoose.Types.ObjectId();
    }

    if (brand) {
      queryFilter.brand = { $regex: brand, $options: "i" };
    }

    if (status) {
      queryFilter.status = status;
    } else if (!isAdmin) {
      queryFilter.status = "active";
    }

    if (featured === "true") queryFilter.featured = true;
    if (isNewArrival === "true") queryFilter.isNewArrival = true;

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      queryFilter.price = priceFilter;
    }

    const [products, total] = await Promise.all([
      ProductModel.find(queryFilter)
        .populate("category", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(queryFilter),
    ]);

    return apiSuccess({
      items: products.map((product) => serializeProduct(product)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, "Products loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load products", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const category = await CategoryModel.findOne({ name: parsed.data.category });
    if (!category) {
      return apiError("Category does not exist", [], 400);
    }

    const slug = slugify(parsed.data.name);
    const product = await ProductModel.create({
      ...parsed.data,
      // Product.category is an ObjectId ref, never a raw name string.
      category: category._id,
      slug,
    });

    const created = await product.populate("category", "name slug");
    return apiSuccess(serializeProduct(created.toObject()), "Product created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create product", [], 500);
  }
}
