import "dotenv/config";
import mongoose from "mongoose";
import { ProductModel } from "../lib/models/Product";
import { CategoryModel } from "../lib/models/Category";

const MONGODB_URI="mongodb+srv://gcodiagent186_db_user:1k3te6g7kxEYNZiJ@safetyhub.yk7b2ep.mongodb.net/safety-hub?appName=safetyhub"

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined.");
}

// ---------- Helpers ----------
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- Data generation ----------
const BRANDS = [
  "SafeGuard", "ProShield", "VisionPro", "WorkSafe", "GripMax",
  "IndustrialPro", "WorkForce", "SafeStep", "HiVisPro", "AirSafe",
  "HearSafe", "FallSafe", "WorkWear", "ProtectPro", "ArmorTech",
  "ShieldMaster", "SecureFit", "DuraSafe", "PrimeGuard", "EliteProtect"
];

const PRODUCT_NAMES = [
  "Safety Helmet", "Safety Glasses", "Work Gloves", "Safety Boots",
  "High Visibility Vest", "Respirator", "Ear Defenders", "Safety Harness",
  "Coverall", "Face Shield", "Knee Pads", "Welding Mask", "Hard Hat",
  "Goggles", "Ear Plugs", "Lanyard", "Tool Belt", "Apron", "Visor",
  "Protective Sleeves", "Anti‑Fatigue Mat", "First Aid Kit", "Safety Signs"
];

const ADJECTIVES = [
  "Industrial", "Heavy‑Duty", "Lightweight", "Reflective", "Vented",
  "Cut‑Resistant", "Slip‑Resistant", "High‑Visibility", "Disposable",
  "Reusable", "Ergonomic", "Adjustable", "Reinforced", "Weather‑Resistant",
  "Anti‑Fog", "Impact‑Resistant", "Flame‑Resistant", "Chemical‑Resistant",
  "Waterproof", "Breathable", "Insulated", "Padded", "Compact"
];

const MATERIALS = [
  "ABS Plastic", "Polycarbonate", "HPPE", "Nylon", "Leather", "PU",
  "Polyester", "Silicone", "Foam", "Cotton", "Steel", "Aluminium",
  "Rubber", "Kevlar", "Gore‑Tex", "Nitrile", "PVC"
];

const FEATURES_POOL = [
  "Impact resistant", "UV protection", "Adjustable fit", "Lightweight",
  "Vented shell", "Reflective strips", "Anti‑scratch lens", "High grip",
  "Breathable material", "Slip resistant sole", "Steel toe", "Oil resistant",
  "High visibility", "Reusable", "Disposable", "Ergonomic design",
  "Weather resistant", "Multiple pockets", "Full body coverage", "Shock absorber",
  "Twin‑leg design", "Durable fabric", "Comfort cushions", "Noise reduction"
];

const CERTIFICATIONS = ["CE", "ISO 9001", "ANSI", "EN 397", "EN 149", "EN 361"];

const CATEGORIES = [
  "Head Protection",
  "Eye Protection",
  "Hand Protection",
  "Foot Protection",
  "High Visibility",
  "Respiratory Protection",
  "Hearing Protection",
  "Fall Protection",
  "Protective Clothing"
];

// ---------- Product generator ----------
function generateProduct(
  categoryId: mongoose.Types.ObjectId,
  categoryName: string,
  index: number,
  total: number
) {
  const adj = randomPick(ADJECTIVES);
  const baseName = randomPick(PRODUCT_NAMES);
  const brand = randomPick(BRANDS);
  const productName = `${adj} ${baseName}`;

  let minPrice = 100, maxPrice = 5000;
  if (categoryName.includes("Foot") || categoryName.includes("Fall")) {
    maxPrice = 8000;
  } else if (categoryName.includes("Protective Clothing")) {
    maxPrice = 3000;
  } else if (categoryName.includes("Hearing") || categoryName.includes("Respiratory")) {
    minPrice = 50;
    maxPrice = 2000;
  }
  const price = randomInt(minPrice, maxPrice);
  const compareAtPrice = Math.random() > 0.5 ? Math.round(price * (1 + Math.random() * 0.4)) : undefined;

  const stock = randomInt(0, 150);
  const description = `High‑quality ${baseName.toLowerCase()} designed for ${categoryName.toLowerCase()}. ${randomPick(FEATURES_POOL)}.`;

  const image = `/images/products/${slugify(productName)}-${index + 1}.jpg`;

  const featureCount = randomInt(2, 5);
  const features = [];
  const shuffled = [...FEATURES_POOL].sort(() => Math.random() - 0.5);
  for (let i = 0; i < featureCount && i < shuffled.length; i++) {
    features.push(shuffled[i]);
  }

  const specs = [
    { label: "Material", value: randomPick(MATERIALS) },
    { label: "Standard", value: `EN ${randomInt(100, 999)}` },
  ];
  if (Math.random() > 0.5) {
    specs.push({ label: "Weight", value: `${randomInt(50, 5000)}g` });
  }

  // Variants: 0–4 sizes
  const variantSizes = ["S", "M", "L", "XL", "XXL", "39", "40", "41", "42", "43", "44"];
  const variantCount = Math.random() > 0.4 ? randomInt(0, 4) : 0;
  const variants = [];
  if (variantCount > 0) {
    const chosenSizes = [];
    const available = [...variantSizes];
    for (let i = 0; i < variantCount; i++) {
      if (available.length === 0) break;
      const idx = randomInt(0, available.length - 1);
      chosenSizes.push(available.splice(idx, 1)[0]);
    }
    const baseSku = `SKU-${String(index + 1).padStart(4, "0")}${String(randomInt(100, 999))}`;
    for (const size of chosenSizes) {
      const variantPrice = Math.max(0, price + randomInt(-200, 300));
      variants.push({
        sku: `${baseSku}-${size}`,
        size,
        price: variantPrice,
        compareAtPrice: Math.random() > 0.6 ? variantPrice * 1.2 : undefined,
        stock: randomInt(0, 40),
        reserved: 0,
        image: `/images/products/variant-${slugify(size)}.jpg`,
      });
    }
  }

  let totalStock = stock;
  let totalReserved = 0;
  if (variants.length > 0) {
    totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    totalReserved = variants.reduce((sum, v) => sum + v.reserved, 0);
  }

  const slug = `${slugify(productName)}-${index + 1}`;

  return {
    name: productName,
    slug,
    description,
    category: categoryId,
    subcategory: "",
    brand,
    sku: variants.length > 0 ? variants[0].sku.replace(/-[A-Z0-9]+$/, "") : `SKU-${String(index + 1).padStart(4, "0")}`,
    price,
    compareAtPrice,
    stock: totalStock,
    reserved: totalReserved,
    variants,
    status: totalStock > 0 ? "active" : "out_of_stock",
    image,
    images: [image],
    featured: index < 2,
    isNewArrival: index === 0,
    features,
    specs,
    weight: `${randomInt(50, 5000)}g`,
    dimensions: `${randomInt(10, 60)}x${randomInt(10, 60)}x${randomInt(5, 40)} cm`,
    warranty: `${randomInt(1, 5)} years`,
    certifications: randomPick(CERTIFICATIONS).split(",").map(c => c.trim()),
  };
}

// ---------- Seed function ----------
async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Delete existing data (products first, then categories)
  await ProductModel.deleteMany({});
  await CategoryModel.deleteMany({});
  console.log("Cleared existing products and categories.");

  let categoriesCreated = 0;
  let productsCreated = 0;
  let productsSkipped = 0;

  try {
    for (const categoryName of CATEGORIES) {
      const category = await CategoryModel.create({
        name: categoryName,
        slug: slugify(categoryName),
        description: `${categoryName} PPE and workplace safety equipment.`,
        image: `/images/categories/${slugify(categoryName)}.jpg`,
        subcategories: [],
      });
      categoriesCreated++;
      console.log(`Created category: ${categoryName}`);

      const productCount = randomInt(15, 30);
      console.log(`Generating ${productCount} products for "${categoryName}"...`);

      for (let i = 0; i < productCount; i++) {
        const productData = generateProduct(category._id, categoryName, i, productCount);
        const existing = await ProductModel.findOne({ slug: productData.slug });
        if (existing) {
          productsSkipped++;
          continue;
        }
        await ProductModel.create(productData);
        productsCreated++;
      }
    }

    console.log("\nSeed completed.");
    console.log(`Categories created: ${categoriesCreated}`);
    console.log(`Products created:   ${productsCreated}`);
    console.log(`Products skipped:   ${productsSkipped}`);

    const categorySummary = await CategoryModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $project: {
          name: 1,
          productCount: { $size: "$products" },
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    console.log("\nCatalog summary:");
    for (const cat of categorySummary) {
      console.log(`- ${cat.name}: ${cat.productCount} products`);
    }
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

seed().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});