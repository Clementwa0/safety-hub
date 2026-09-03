
import "dotenv/config";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { ProductModel, type IProduct, type IProductVariant } from "@/lib/models/Product";

const SIZE_SUFFIX = /^(.*?)\s+Size\s+([A-Za-z0-9-]+)$/i;

interface Group {
  baseName: string;
  products: IProduct[];
}

function groupBySizeSuffix(products: IProduct[]): Group[] {
  const groups = new Map<string, IProduct[]>();

  for (const product of products) {
    const match = product.name.match(SIZE_SUFFIX);
    if (!match) continue;
    const baseName = match[1].trim();
    const key = baseName.toLowerCase();
    const list = groups.get(key) ?? [];
    list.push(product);
    groups.set(key, list);
  }

  return Array.from(groups.entries())
    .filter(([, products]) => products.length > 1)
    .map(([, products]) => ({
      // Recover the original casing from whichever product happened to be
      // matched first, rather than the lowercased grouping key.
      baseName: products[0].name.match(SIZE_SUFFIX)![1].trim(),
      products: products.sort((a, b) => String(a._id).localeCompare(String(b._id))),
    }));
}

function extractSize(product: IProduct): string {
  const match = product.name.match(SIZE_SUFFIX);
  return match ? match[2].toUpperCase() : "DEFAULT";
}

async function main() {
  const apply = process.argv.includes("--apply");

  await connectToDatabase();

  const allProducts = await ProductModel.find({});
  const groups = groupBySizeSuffix(allProducts);

  if (groups.length === 0) {
    console.log("No size-suffixed duplicate groups found. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${groups.length} group(s) to consolidate:\n`);

  for (const group of groups) {
    const survivor = group.products[0];
    const duplicates = group.products.slice(1);

    console.log(`"${group.baseName}"`);
    console.log(`  survivor: ${survivor._id}  (currently "${survivor.name}")`);
    for (const dup of group.products) {
      const size = extractSize(dup);
      console.log(
        `    -> variant ${size}: sku=${dup.sku ?? "(none - will need one)"} stock=${dup.stock} reserved=${dup.reserved} price=${dup.price}`,
      );
    }
    if (duplicates.length > 0) {
      console.log(`  will delete: ${duplicates.map((d) => d._id).join(", ")}`);
    }

    // A variant SKU is required by the schema (see productVariantSchema in
    // lib/models/Product.ts) - if a duplicate has no sku at all, fall back
    // to a generated one derived from the survivor's id + size, rather
    // than silently failing the whole group.
    const variants: IProductVariant[] = group.products.map((p) => {
      const size = extractSize(p);
      const sku = p.sku?.trim() || `${String(survivor._id).slice(-6).toUpperCase()}-${size}`;
      return {
        sku,
        size,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        reserved: p.reserved,
        image: p.image,
      };
    });

    const skus = variants.map((v) => v.sku);
    const dupeSkus = skus.filter((sku, i) => skus.indexOf(sku) !== i);
    if (dupeSkus.length > 0) {
      console.log(
        `  SKIPPING - duplicate variant SKU(s) within this group after fallback generation: ${dupeSkus.join(", ")}. Fix source data and re-run.`,
      );
      console.log();
      continue;
    }

    if (apply) {
      survivor.name = group.baseName;
      survivor.variants = variants;
      // stock/reserved are recomputed from variants by the pre-validate
      // hook in lib/models/Product.ts on save - no need to set them here.
      await survivor.save();

      await ProductModel.deleteMany({
        _id: { $in: duplicates.map((d) => d._id) },
      });

      console.log(`  APPLIED.`);
    }

    console.log();
  }

  if (!apply) {
    console.log("Dry run only - no changes written. Re-run with --apply to commit.");
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
