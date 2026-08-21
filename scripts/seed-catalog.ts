/**
 * Seeds the storefront catalog (categories + ~100 products per category)
 * and, optionally, the single Sentinel admin account.
 *
 * Categories are upserted by slug (stable _ids, safe to re-run). Products
 * are DELETED and rebuilt from scratch on every run by default, so the
 * catalog always ends up exactly matching this script's templates.
 * Pass --keep-products to upsert by slug instead of deleting first.
 * Pass --reset to also wipe categories first (development only).
 *
 * Usage:
 *   npx tsx scripts/seed-catalog.ts
 *   npx tsx scripts/seed-catalog.ts --per-category 150
 *   npx tsx scripts/seed-catalog.ts --keep-products
 *   npx tsx scripts/seed-catalog.ts --reset
 *   npx tsx scripts/seed-catalog.ts \
 *     --admin-name "Jane Doe" \
 *     --admin-email jane@example.com \
 *     --admin-password "your-password"
 */

import "dotenv/config";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { CategoryModel, type ICategory } from "@/lib/models/Category";
import { ProductModel, type IProductSpec } from "@/lib/models/Product";
import { UserModel } from "@/lib/models/User";
import { hashPassword } from "@/lib/auth/sentinel";

/* =====================================================
   CLI ARGS
===================================================== */

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

const RESET = hasFlag("--reset");

const PER_CATEGORY = (() => {
  const raw = readArg("--per-category");
  const parsed = raw ? Number.parseInt(raw, 10) : 100;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
})();

const ADMIN_NAME = readArg("--admin-name")?.trim();
const ADMIN_EMAIL = readArg("--admin-email")?.trim().toLowerCase();
const ADMIN_PASSWORD = readArg("--admin-password");

/* =====================================================
   CATEGORIES
===================================================== */

type CategorySeed = Pick<
  ICategory,
  "name" | "slug" | "description" | "image" | "subcategories"
>;

const categories: CategorySeed[] = [
  {
    name: "Head Protection",
    slug: "head-protection",
    description:
      "Safety helmets, hard hats and accessories for workplace head protection.",
    image: "https://loremflickr.com/800/800/safety,helmet",
    subcategories: ["Safety Helmets", "Hard Hats", "Helmet Accessories"],
  },
  {
    name: "Eye & Face Protection",
    slug: "eye-face-protection",
    description:
      "Protective eyewear, goggles and face shields for workplace safety.",
    image: "https://loremflickr.com/800/800/safety,goggles",
    subcategories: ["Safety Glasses", "Goggles", "Face Shields"],
  },
  {
    name: "Hand Protection",
    slug: "hand-protection",
    description:
      "Industrial and occupational safety gloves for various workplace hazards.",
    image: "https://loremflickr.com/800/800/work,gloves",
    subcategories: ["Work Gloves", "Cut Resistant Gloves", "Chemical Gloves"],
  },
  {
    name: "Foot Protection",
    slug: "foot-protection",
    description:
      "Safety boots, shoes and protective footwear for industrial environments.",
    image: "https://loremflickr.com/800/800/safety,boots",
    subcategories: ["Safety Boots", "Safety Shoes", "Gumboots"],
  },
  {
    name: "Respiratory Protection",
    slug: "respiratory-protection",
    description:
      "Respirators, masks and filters for protection against airborne hazards.",
    image: "https://loremflickr.com/800/800/respirator,mask",
    subcategories: ["Disposable Masks", "Respirators", "Filters"],
  },
  {
    name: "Hearing Protection",
    slug: "hearing-protection",
    description:
      "Earplugs and earmuffs for protection against excessive workplace noise.",
    image: "https://loremflickr.com/800/800/earmuffs",
    subcategories: ["Earplugs", "Earmuffs"],
  },
  {
    name: "Protective Clothing",
    slug: "protective-clothing",
    description:
      "Protective workwear, coveralls, jackets and high-visibility clothing.",
    image: "https://loremflickr.com/800/800/workwear",
    subcategories: ["Coveralls", "Hi-Vis Clothing", "Workwear"],
  },
  {
    name: "Fall Protection",
    slug: "fall-protection",
    description:
      "Harnesses, lanyards and fall arrest equipment for working at height.",
    image: "https://loremflickr.com/800/800/climbing,harness",
    subcategories: ["Harnesses", "Lanyards", "Fall Arrest"],
  },
  {
    name: "Safety Equipment",
    slug: "safety-equipment",
    description:
      "Essential workplace safety equipment and emergency products.",
    image: "https://loremflickr.com/800/800/construction,safety",
    subcategories: ["Safety Signs", "Barriers", "Emergency Equipment"],
  },
  {
    name: "First Aid",
    slug: "first-aid",
    description: "First aid kits and workplace emergency medical supplies.",
    image: "https://loremflickr.com/800/800/firstaid",
    subcategories: ["First Aid Kits", "Bandages", "Emergency Supplies"],
  },
];

/* =====================================================
   PRODUCT TEMPLATES (grouped by category)
===================================================== */

interface ProductTemplate {
  name: string;
  subcategory: string;
  brand: string;
  price: number;
  keyword: string;
  features: string[];
  specs: IProductSpec[];
  certifications: string[];
}

const BRAND_POOL = ["HSE Pro", "SafeGuard", "ProtectPro", "Guardian", "Ironclad"];

/* =====================================================
   IMAGES
===================================================== */

/**
 * Verified, real, hotlinkable Pexels photos (Pexels' free license permits
 * this - no attribution required). Each pool is rotated across every
 * product generated for that category, so listings show an actual,
 * relevant product/PPE photo instead of a random keyword-matched image.
 *
 * Only categories with a confirmed-working photo are listed here. Photo
 * IDs were verified by URL, not guessed - do not add an ID without
 * checking it resolves on pexels.com first.
 */
const CATEGORY_IMAGE_POOL: Record<string, string[]> = {
  "Head Protection": [
    "https://images.pexels.com/photos/38070/pexels-photo-38070.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "Eye & Face Protection": [
    "https://images.pexels.com/photos/8326736/pexels-photo-8326736.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "Respiratory Protection": [
    "https://images.pexels.com/photos/3993241/pexels-photo-3993241.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3992946/pexels-photo-3992946.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "Protective Clothing": [
    "https://images.pexels.com/photos/159358/pexels-photo-159358.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "Hand Protection": [
    "https://images.pexels.com/photos/28576636/pexels-photo-28576636.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
};

/**
 * TODO: the categories below don't have a verified real photo yet
 * (Foot Protection, Hearing Protection, Fall Protection, Safety
 * Equipment, First Aid). They fall back to keyword-matched LoremFlickr
 * placeholders. Replace with real product photography uploaded through
 * Cloudinary (see lib/cloudinary) before going live.
 */
function getFallbackImage(keyword: string, seed: number): string {
  return `https://loremflickr.com/800/800/${keyword}?lock=${seed}`;
}

const productTemplatesByCategory: Record<string, ProductTemplate[]> = {
  "Head Protection": [
    {
      name: "Industrial Safety Helmet",
      subcategory: "Safety Helmets",
      brand: "HSE Pro",
      price: 850,
      keyword: "safety,helmet",
      features: [
        "Adjustable suspension",
        "Impact resistant shell",
        "Ventilation system",
        "Comfort sweatband",
      ],
      specs: [
        { label: "Material", value: "HDPE" },
        { label: "Standard", value: "EN 397" },
        { label: "Adjustment", value: "Adjustable" },
      ],
      certifications: ["EN 397"],
    },
    {
      name: "Ventilated Safety Helmet",
      subcategory: "Safety Helmets",
      brand: "SafeGuard",
      price: 1200,
      keyword: "construction,helmet",
      features: [
        "Ventilated shell",
        "Adjustable headband",
        "Lightweight construction",
      ],
      specs: [
        { label: "Material", value: "ABS" },
        { label: "Weight", value: "380g" },
        { label: "Standard", value: "EN 397" },
      ],
      certifications: ["EN 397"],
    },
    {
      name: "Safety Helmet With Chin Strap",
      subcategory: "Helmet Accessories",
      brand: "ProtectPro",
      price: 1450,
      keyword: "hardhat,helmet",
      features: [
        "Four-point chin strap",
        "Adjustable suspension",
        "Impact protection",
      ],
      specs: [
        { label: "Material", value: "ABS" },
        { label: "Strap", value: "4-point" },
        { label: "Standard", value: "EN 397" },
      ],
      certifications: ["EN 397"],
    },
    {
      name: "Bump Cap",
      subcategory: "Hard Hats",
      brand: "Guardian",
      price: 620,
      keyword: "bump,cap,helmet",
      features: [
        "Lightweight shell",
        "Breathable liner",
        "Low-clearance protection",
      ],
      specs: [
        { label: "Material", value: "Polyethylene" },
        { label: "Weight", value: "180g" },
        { label: "Standard", value: "EN 812" },
      ],
      certifications: ["EN 812"],
    },
  ],

  "Eye & Face Protection": [
    {
      name: "Clear Safety Glasses",
      subcategory: "Safety Glasses",
      brand: "HSE Pro",
      price: 350,
      keyword: "safety,glasses",
      features: [
        "Anti-scratch lenses",
        "UV protection",
        "Lightweight frame",
        "Clear lenses",
      ],
      specs: [
        { label: "Lens", value: "Polycarbonate" },
        { label: "UV Protection", value: "Yes" },
        { label: "Standard", value: "EN 166" },
      ],
      certifications: ["EN 166"],
    },
    {
      name: "Anti-Fog Safety Goggles",
      subcategory: "Goggles",
      brand: "SafeGuard",
      price: 650,
      keyword: "safety,goggles",
      features: ["Anti-fog coating", "Splash protection", "Adjustable strap"],
      specs: [
        { label: "Lens", value: "Polycarbonate" },
        { label: "Protection", value: "Splash resistant" },
        { label: "Standard", value: "EN 166" },
      ],
      certifications: ["EN 166"],
    },
    {
      name: "Tinted Safety Glasses",
      subcategory: "Safety Glasses",
      brand: "Ironclad",
      price: 420,
      keyword: "tinted,safety,glasses",
      features: ["Glare reduction", "Scratch resistant", "Wraparound fit"],
      specs: [
        { label: "Lens", value: "Polycarbonate" },
        { label: "Tint", value: "Smoke grey" },
        { label: "Standard", value: "EN 166" },
      ],
      certifications: ["EN 166"],
    },
    {
      name: "Full Face Shield",
      subcategory: "Face Shields",
      brand: "ProtectPro",
      price: 780,
      keyword: "face,shield",
      features: ["Full face coverage", "Ratchet headgear", "Chemical splash resistant"],
      specs: [
        { label: "Material", value: "PETG" },
        { label: "Coverage", value: "Full face" },
        { label: "Standard", value: "EN 166" },
      ],
      certifications: ["EN 166"],
    },
  ],

  "Hand Protection": [
    {
      name: "General Purpose Work Gloves",
      subcategory: "Work Gloves",
      brand: "HSE Pro",
      price: 180,
      keyword: "work,gloves",
      features: ["Durable construction", "Comfortable fit", "Excellent grip"],
      specs: [
        { label: "Material", value: "Polyester with PU coating" },
        { label: "Size", value: "M-XL" },
        { label: "Use", value: "General handling" },
      ],
      certifications: ["EN 388"],
    },
    {
      name: "Cut Resistant Safety Gloves",
      subcategory: "Cut Resistant Gloves",
      brand: "SafeGuard",
      price: 850,
      keyword: "protective,gloves",
      features: ["High cut resistance", "Excellent grip", "Flexible design"],
      specs: [
        { label: "Material", value: "HPPE" },
        { label: "Cut Level", value: "Level C" },
        { label: "Standard", value: "EN 388" },
      ],
      certifications: ["EN 388"],
    },
    {
      name: "Chemical Resistant Gloves",
      subcategory: "Chemical Gloves",
      brand: "Guardian",
      price: 540,
      keyword: "chemical,gloves",
      features: ["Chemical splash resistant", "Textured grip", "Reusable"],
      specs: [
        { label: "Material", value: "Nitrile" },
        { label: "Length", value: "300mm" },
        { label: "Standard", value: "EN 374" },
      ],
      certifications: ["EN 374"],
    },
  ],

  "Foot Protection": [
    {
      name: "Steel Toe Safety Boots",
      subcategory: "Safety Boots",
      brand: "ProtectPro",
      price: 4200,
      keyword: "safety,boots",
      features: [
        "Steel toe cap",
        "Oil resistant sole",
        "Anti-slip outsole",
        "Padded collar",
      ],
      specs: [
        { label: "Upper", value: "Leather" },
        { label: "Toe Cap", value: "Steel" },
        { label: "Standard", value: "EN ISO 20345" },
      ],
      certifications: ["EN ISO 20345"],
    },
    {
      name: "Lightweight Safety Shoes",
      subcategory: "Safety Shoes",
      brand: "SafeGuard",
      price: 3200,
      keyword: "work,safety,shoes",
      features: ["Lightweight design", "Composite toe", "Anti-slip sole"],
      specs: [
        { label: "Upper", value: "Synthetic" },
        { label: "Toe Cap", value: "Composite" },
        { label: "Standard", value: "EN ISO 20345" },
      ],
      certifications: ["EN ISO 20345"],
    },
    {
      name: "Industrial Gumboots",
      subcategory: "Gumboots",
      brand: "Guardian",
      price: 2100,
      keyword: "gumboots,rubber,boots",
      features: ["Waterproof", "Chemical resistant sole", "Steel midsole"],
      specs: [
        { label: "Material", value: "PVC" },
        { label: "Toe Cap", value: "Steel" },
        { label: "Standard", value: "EN ISO 20345" },
      ],
      certifications: ["EN ISO 20345"],
    },
  ],

  "Respiratory Protection": [
    {
      name: "Disposable Dust Mask",
      subcategory: "Disposable Masks",
      brand: "HSE Pro",
      price: 50,
      keyword: "dust,mask",
      features: ["Lightweight", "Comfortable nose clip", "Dust filtration"],
      specs: [
        { label: "Type", value: "Disposable" },
        { label: "Protection", value: "Dust particles" },
        { label: "Standard", value: "EN 149" },
      ],
      certifications: ["EN 149"],
    },
    {
      name: "FFP2 Respirator Mask",
      subcategory: "Disposable Masks",
      brand: "SafeGuard",
      price: 120,
      keyword: "respirator,mask",
      features: [
        "FFP2 filtration",
        "Adjustable nose clip",
        "Low breathing resistance",
      ],
      specs: [
        { label: "Protection", value: "FFP2" },
        { label: "Type", value: "Disposable" },
        { label: "Standard", value: "EN 149" },
      ],
      certifications: ["EN 149"],
    },
    {
      name: "Half Face Respirator",
      subcategory: "Respirators",
      brand: "ProtectPro",
      price: 980,
      keyword: "respirator,half,mask",
      features: ["Reusable body", "Twin filter cartridges", "Adjustable straps"],
      specs: [
        { label: "Type", value: "Reusable" },
        { label: "Filter", value: "Twin cartridge" },
        { label: "Standard", value: "EN 140" },
      ],
      certifications: ["EN 140"],
    },
    {
      name: "Replacement Filter Cartridge",
      subcategory: "Filters",
      brand: "Guardian",
      price: 260,
      keyword: "respirator,filter",
      features: ["Universal fit", "Organic vapour protection", "Easy twist-lock"],
      specs: [
        { label: "Class", value: "A1" },
        { label: "Fit", value: "Bayonet" },
        { label: "Standard", value: "EN 14387" },
      ],
      certifications: ["EN 14387"],
    },
  ],

  "Hearing Protection": [
    {
      name: "Industrial Earplugs",
      subcategory: "Earplugs",
      brand: "HSE Pro",
      price: 80,
      keyword: "earplugs",
      features: ["Noise reduction", "Reusable design", "Comfortable fit"],
      specs: [
        { label: "Type", value: "Reusable" },
        { label: "Material", value: "Silicone" },
        { label: "SNR", value: "25 dB" },
      ],
      certifications: ["EN 352"],
    },
    {
      name: "Industrial Ear Defenders",
      subcategory: "Earmuffs",
      brand: "ProtectPro",
      price: 950,
      keyword: "earmuffs",
      features: [
        "High noise reduction",
        "Adjustable headband",
        "Comfortable ear cushions",
      ],
      specs: [
        { label: "Type", value: "Earmuff" },
        { label: "SNR", value: "30 dB" },
        { label: "Standard", value: "EN 352" },
      ],
      certifications: ["EN 352"],
    },
    {
      name: "Corded Foam Earplugs",
      subcategory: "Earplugs",
      brand: "SafeGuard",
      price: 65,
      keyword: "foam,earplugs",
      features: ["Corded for convenience", "Soft foam", "Disposable"],
      specs: [
        { label: "Type", value: "Disposable" },
        { label: "Material", value: "PU foam" },
        { label: "SNR", value: "33 dB" },
      ],
      certifications: ["EN 352"],
    },
  ],

  "Protective Clothing": [
    {
      name: "High Visibility Safety Vest",
      subcategory: "Hi-Vis Clothing",
      brand: "HSE Pro",
      price: 450,
      keyword: "safety,vest",
      features: ["High visibility fabric", "Reflective strips", "Lightweight"],
      specs: [
        { label: "Material", value: "Polyester" },
        { label: "Visibility", value: "High visibility" },
        { label: "Standard", value: "EN ISO 20471" },
      ],
      certifications: ["EN ISO 20471"],
    },
    {
      name: "Industrial Coverall",
      subcategory: "Coveralls",
      brand: "SafeGuard",
      price: 1800,
      keyword: "workwear,coveralls",
      features: ["Durable fabric", "Multiple pockets", "Full body protection"],
      specs: [
        { label: "Material", value: "Cotton/Polyester" },
        { label: "Closure", value: "Front zipper" },
        { label: "Sizes", value: "S-XXXL" },
      ],
      certifications: ["EN ISO 13688"],
    },
    {
      name: "Hi-Vis Bomber Jacket",
      subcategory: "Workwear",
      brand: "Guardian",
      price: 2600,
      keyword: "hi-vis,jacket,workwear",
      features: ["Reflective tape", "Water resistant shell", "Insulated lining"],
      specs: [
        { label: "Material", value: "Polyester" },
        { label: "Visibility", value: "Class 3" },
        { label: "Standard", value: "EN ISO 20471" },
      ],
      certifications: ["EN ISO 20471"],
    },
  ],

  "Fall Protection": [
    {
      name: "Full Body Safety Harness",
      subcategory: "Harnesses",
      brand: "ProtectPro",
      price: 4500,
      keyword: "safety,harness",
      features: [
        "Full body protection",
        "Adjustable straps",
        "Dorsal attachment point",
      ],
      specs: [
        { label: "Material", value: "Polyester webbing" },
        { label: "Attachment", value: "Dorsal D-ring" },
        { label: "Standard", value: "EN 361" },
      ],
      certifications: ["EN 361"],
    },
    {
      name: "Shock Absorbing Lanyard",
      subcategory: "Lanyards",
      brand: "SafeGuard",
      price: 3200,
      keyword: "safety,lanyard",
      features: ["Energy absorber", "Durable webbing", "Secure connectors"],
      specs: [
        { label: "Length", value: "1.8m" },
        { label: "Material", value: "Polyester" },
        { label: "Standard", value: "EN 355" },
      ],
      certifications: ["EN 355"],
    },
    {
      name: "Self-Retracting Fall Arrest Block",
      subcategory: "Fall Arrest",
      brand: "Guardian",
      price: 8600,
      keyword: "fall,arrest,block",
      features: ["Automatic locking", "Compact housing", "Galvanized cable"],
      specs: [
        { label: "Cable Length", value: "6m" },
        { label: "Housing", value: "ABS" },
        { label: "Standard", value: "EN 360" },
      ],
      certifications: ["EN 360"],
    },
  ],

  "Safety Equipment": [
    {
      name: "Caution Wet Floor Sign",
      subcategory: "Safety Signs",
      brand: "HSE Pro",
      price: 650,
      keyword: "warning,safety,sign",
      features: ["Highly visible", "Foldable design", "Durable construction"],
      specs: [
        { label: "Material", value: "Plastic" },
        { label: "Design", value: "Foldable" },
      ],
      certifications: [],
    },
    {
      name: "Safety Barrier Cone",
      subcategory: "Barriers",
      brand: "ProtectPro",
      price: 450,
      keyword: "traffic,safety,cone",
      features: ["High visibility", "Stable base", "Weather resistant"],
      specs: [
        { label: "Height", value: "750mm" },
        { label: "Material", value: "PVC" },
      ],
      certifications: [],
    },
    {
      name: "Portable Fire Extinguisher",
      subcategory: "Emergency Equipment",
      brand: "Guardian",
      price: 3400,
      keyword: "fire,extinguisher",
      features: ["Wall bracket included", "Pressure gauge", "Multi-purpose"],
      specs: [
        { label: "Type", value: "ABC dry powder" },
        { label: "Capacity", value: "6kg" },
      ],
      certifications: ["EN 3"],
    },
  ],

  "First Aid": [
    {
      name: "Workplace First Aid Kit",
      subcategory: "First Aid Kits",
      brand: "HSE Pro",
      price: 2500,
      keyword: "first,aid,kit",
      features: [
        "Comprehensive first aid supplies",
        "Durable storage case",
        "Suitable for workplaces",
      ],
      specs: [
        { label: "Contents", value: "50+ items" },
        { label: "Case", value: "Hard plastic" },
        { label: "Use", value: "Workplace" },
      ],
      certifications: [],
    },
    {
      name: "Elastic Adhesive Bandage Pack",
      subcategory: "Bandages",
      brand: "SafeGuard",
      price: 220,
      keyword: "bandage,firstaid",
      features: ["Breathable fabric", "Strong adhesion", "Assorted sizes"],
      specs: [
        { label: "Pack Size", value: "20 units" },
        { label: "Material", value: "Non-woven fabric" },
      ],
      certifications: [],
    },
    {
      name: "Emergency Eye Wash Station",
      subcategory: "Emergency Supplies",
      brand: "ProtectPro",
      price: 3100,
      keyword: "eyewash,station",
      features: ["Wall mounted", "Dual sterile bottles", "High visibility case"],
      specs: [
        { label: "Capacity", value: "2 x 500ml" },
        { label: "Mounting", value: "Wall bracket" },
      ],
      certifications: [],
    },
  ],
};

/* =====================================================
   HELPERS
===================================================== */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryCode(slug: string): string {
  return slug.split("-")[0].slice(0, 4).toUpperCase();
}

/**
 * Picks a product image. Prefers a verified real photo from
 * CATEGORY_IMAGE_POOL (rotated across products in that category);
 * falls back to a keyword-matched LoremFlickr placeholder otherwise.
 */
function getProductImage(
  categoryName: string,
  keyword: string,
  seed: number,
): string {
  const pool = CATEGORY_IMAGE_POOL[categoryName];

  if (pool && pool.length > 0) {
    return pool[seed % pool.length];
  }

  return getFallbackImage(keyword, seed);
}

interface ProductSeed {
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  subcategory: string;
  brand: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: "active" | "draft" | "out_of_stock";
  image: string;
  images: string[];
  featured: boolean;
  isNewArrival: boolean;
  features: string[];
  specs: IProductSpec[];
  weight?: string;
  dimensions?: string;
  warranty?: string;
  certifications: string[];
}

/**
 * Builds `count` unique product docs for a single category by cycling
 * through that category's templates, rotating brands and appending a
 * category-scoped model number/size once the templates repeat.
 */
function buildProductsForCategory(
  categoryName: string,
  categorySlug: string,
  categoryId: mongoose.Types.ObjectId,
  templates: ProductTemplate[],
  count: number,
): ProductSeed[] {
  const code = categoryCode(categorySlug);
  const sizes = ["S", "M", "L", "XL", "XXL"];
  const products: ProductSeed[] = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const pass = Math.floor(i / templates.length);
    const number = String(i + 1).padStart(3, "0");

    // Rotate through the brand pool on later passes so repeated
    // templates don't all look like the exact same listing.
    const brand =
      pass === 0 ? template.brand : BRAND_POOL[i % BRAND_POOL.length];

    const variantSuffix =
      pass === 0
        ? ""
        : pass % 2 === 0
          ? ` - Size ${sizes[i % sizes.length]}`
          : ` Model ${number}`;

    const name = `${template.name}${variantSuffix}`;
    const slug = `${slugify(name)}-${code.toLowerCase()}-${number}`;
    const sku = `HSE-${code}-${number}`;

    const price = template.price + (i % 6) * 100;
    const image = getProductImage(categoryName, template.keyword, i + 1);

    products.push({
      name,
      slug,
      description: `Professional ${name.toLowerCase()} designed for industrial, construction, commercial and workplace safety applications.`,
      category: categoryId,
      subcategory: template.subcategory,
      brand,
      sku,
      price,
      compareAtPrice: i % 4 === 0 ? Math.round(price * 1.15) : undefined,
      stock: 10 + ((i * 7) % 91),
      status: i % 17 === 0 ? "out_of_stock" : i % 13 === 0 ? "draft" : "active",
      image,
      images: [image],
      featured: i % 10 === 0,
      isNewArrival: i % 7 === 0,
      features: template.features,
      specs: template.specs,
      weight: i % 3 === 0 ? "500g" : "",
      dimensions: i % 4 === 0 ? "Standard size" : "",
      warranty: i % 6 === 0 ? "12 months" : "",
      certifications: template.certifications,
    });
  }

  return products;
}

/* =====================================================
   SEED
===================================================== */

async function seedCategories(): Promise<Map<string, mongoose.Types.ObjectId>> {
  if (RESET) {
    await CategoryModel.deleteMany({});
    console.log("Cleared existing categories.");
  }

  await CategoryModel.bulkWrite(
    categories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: { $set: category },
        upsert: true,
      },
    })),
  );

  const stored = await CategoryModel.find({
    slug: { $in: categories.map((c) => c.slug) },
  })
    .select("_id name")
    .lean();

  console.log(`Upserted ${stored.length} categories.`);

  return new Map(stored.map((c) => [c.name, c._id as mongoose.Types.ObjectId]));
}

async function seedProducts(
  categoryMap: Map<string, mongoose.Types.ObjectId>,
): Promise<void> {
  // Products are always wiped and rebuilt from scratch (unlike categories,
  // which are upserted so their _ids stay stable). Pass --keep-products to
  // skip this and upsert by slug instead.
  if (!hasFlag("--keep-products")) {
    const { deletedCount } = await ProductModel.deleteMany({});
    console.log(`Deleted ${deletedCount ?? 0} existing products.`);
  }

  let totalUpserted = 0;

  for (const category of categories) {
    const categoryId = categoryMap.get(category.name);

    if (!categoryId) {
      throw new Error(`Category not found in DB: ${category.name}`);
    }

    const templates = productTemplatesByCategory[category.name];

    if (!templates || templates.length === 0) {
      throw new Error(`No product templates for category: ${category.name}`);
    }

    const products = buildProductsForCategory(
      category.name,
      category.slug,
      categoryId,
      templates,
      PER_CATEGORY,
    );

    // Batch the upserts to keep individual bulkWrite payloads reasonable.
    const BATCH_SIZE = 200;

    for (let start = 0; start < products.length; start += BATCH_SIZE) {
      const batch = products.slice(start, start + BATCH_SIZE);

      await ProductModel.bulkWrite(
        batch.map((product) => ({
          updateOne: {
            filter: { slug: product.slug },
            update: { $set: product },
            upsert: true,
          },
        })),
      );
    }

    totalUpserted += products.length;

    console.log(`  ${category.name}: upserted ${products.length} products.`);
  }

  console.log(`Upserted ${totalUpserted} products in total.`);
}

async function seedAdmin(): Promise<void> {
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("Skipping admin creation (--admin-name/--admin-email/--admin-password not all provided).");
    return;
  }

  if (ADMIN_PASSWORD.length < 6) {
    console.error("Admin password must be at least 6 characters. Skipping admin creation.");
    return;
  }

  const existingAdmin = await UserModel.findOne({ role: "admin" })
    .select("_id email")
    .lean();

  if (existingAdmin) {
    console.log(
      `Skipping admin creation: an admin already exists (${existingAdmin.email}).`,
    );
    return;
  }

  const existingUser = await UserModel.findOne({ email: ADMIN_EMAIL })
    .select("_id email role")
    .lean();

  if (existingUser) {
    console.log(
      `Skipping admin creation: "${ADMIN_EMAIL}" already exists with role "${existingUser.role}".`,
    );
    return;
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  const admin = await UserModel.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    status: "active",
    activeSessionId: null,
  });

  console.log(`Created Sentinel admin "${admin.name}" <${admin.email}>.`);
}

async function seed(): Promise<void> {
  try {
    console.log("Connecting to MongoDB...");
    await connectToDatabase();
    console.log("Connected to MongoDB.");

    if (RESET) {
      console.log("--reset passed: existing categories/products will be wiped first.");
    }

    console.log(`Target: ~${PER_CATEGORY} products per category.`);
    console.log("");

    const categoryMap = await seedCategories();

    console.log("");
    console.log("Seeding products by category...");
    await seedProducts(categoryMap);

    console.log("");
    await seedAdmin();

    console.log("");
    console.log("================================");
    console.log("       HSE HUB SEED COMPLETE");
    console.log("================================");
    console.log(`Categories      : ${categories.length}`);
    console.log(`Products/category: ~${PER_CATEGORY}`);
    console.log(`Products (total) : ~${categories.length * PER_CATEGORY}`);
    console.log("================================");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seed();
