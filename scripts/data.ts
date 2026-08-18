
import { ProductModel } from "@/lib/models/Product";
import { CategoryModel } from "@/lib/models/Category";

import "dotenv/config";
import mongoose from "mongoose";


const MONGODB_URI ="mongodb://127.0.0.1:27017/safetyhub";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

/* =====================================================
   CATEGORIES
===================================================== */

const categories = [
  {
    name: "Head Protection",
    slug: "head-protection",
    description:
      "Safety helmets, hard hats and accessories for workplace head protection.",
    image:
      "https://loremflickr.com/800/800/safety,helmet",
    subcategories: [
      "Safety Helmets",
      "Hard Hats",
      "Helmet Accessories",
    ],
  },

  {
    name: "Eye & Face Protection",
    slug: "eye-face-protection",
    description:
      "Protective eyewear, goggles and face shields for workplace safety.",
    image:
      "https://loremflickr.com/800/800/safety,goggles",
    subcategories: [
      "Safety Glasses",
      "Goggles",
      "Face Shields",
    ],
  },

  {
    name: "Hand Protection",
    slug: "hand-protection",
    description:
      "Industrial and occupational safety gloves for various workplace hazards.",
    image:
      "https://loremflickr.com/800/800/work,gloves",
    subcategories: [
      "Work Gloves",
      "Cut Resistant Gloves",
      "Chemical Gloves",
    ],
  },

  {
    name: "Foot Protection",
    slug: "foot-protection",
    description:
      "Safety boots, shoes and protective footwear for industrial environments.",
    image:
      "https://loremflickr.com/800/800/safety,boots",
    subcategories: [
      "Safety Boots",
      "Safety Shoes",
      "Gumboots",
    ],
  },

  {
    name: "Respiratory Protection",
    slug: "respiratory-protection",
    description:
      "Respirators, masks and filters for protection against airborne hazards.",
    image:
      "https://loremflickr.com/800/800/respirator,mask",
    subcategories: [
      "Disposable Masks",
      "Respirators",
      "Filters",
    ],
  },

  {
    name: "Hearing Protection",
    slug: "hearing-protection",
    description:
      "Earplugs and earmuffs for protection against excessive workplace noise.",
    image:
      "https://loremflickr.com/800/800/earmuffs",
    subcategories: [
      "Earplugs",
      "Earmuffs",
    ],
  },

  {
    name: "Protective Clothing",
    slug: "protective-clothing",
    description:
      "Protective workwear, coveralls, jackets and high-visibility clothing.",
    image:
      "https://loremflickr.com/800/800/workwear",
    subcategories: [
      "Coveralls",
      "Hi-Vis Clothing",
      "Workwear",
    ],
  },

  {
    name: "Fall Protection",
    slug: "fall-protection",
    description:
      "Harnesses, lanyards and fall arrest equipment for working at height.",
    image:
      "https://loremflickr.com/800/800/climbing,harness",
    subcategories: [
      "Harnesses",
      "Lanyards",
      "Fall Arrest",
    ],
  },

  {
    name: "Safety Equipment",
    slug: "safety-equipment",
    description:
      "Essential workplace safety equipment and emergency products.",
    image:
      "https://loremflickr.com/800/800/construction,safety",
    subcategories: [
      "Safety Signs",
      "Barriers",
      "Emergency Equipment",
    ],
  },

  {
    name: "First Aid",
    slug: "first-aid",
    description:
      "First aid kits and workplace emergency medical supplies.",
    image:
      "https://loremflickr.com/800/800/firstaid",
    subcategories: [
      "First Aid Kits",
      "Bandages",
      "Emergency Supplies",
    ],
  },
];

/* =====================================================
   PRODUCT TEMPLATES
===================================================== */

const productTemplates = [
  {
    name: "Industrial Safety Helmet",
    category: "Head Protection",
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
    category: "Head Protection",
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
    category: "Head Protection",
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
    name: "Clear Safety Glasses",
    category: "Eye & Face Protection",
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
    category: "Eye & Face Protection",
    subcategory: "Goggles",
    brand: "SafeGuard",
    price: 650,
    keyword: "safety,goggles",
    features: [
      "Anti-fog coating",
      "Splash protection",
      "Adjustable strap",
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Protection", value: "Splash resistant" },
      { label: "Standard", value: "EN 166" },
    ],
    certifications: ["EN 166"],
  },

  {
    name: "General Purpose Work Gloves",
    category: "Hand Protection",
    subcategory: "Work Gloves",
    brand: "HSE Pro",
    price: 180,
    keyword: "work,gloves",
    features: [
      "Durable construction",
      "Comfortable fit",
      "Excellent grip",
    ],
    specs: [
      {
        label: "Material",
        value: "Polyester with PU coating",
      },
      { label: "Size", value: "M-XL" },
      { label: "Use", value: "General handling" },
    ],
    certifications: ["EN 388"],
  },

  {
    name: "Cut Resistant Safety Gloves",
    category: "Hand Protection",
    subcategory: "Cut Resistant Gloves",
    brand: "SafeGuard",
    price: 850,
    keyword: "protective,gloves",
    features: [
      "High cut resistance",
      "Excellent grip",
      "Flexible design",
    ],
    specs: [
      { label: "Material", value: "HPPE" },
      { label: "Cut Level", value: "Level C" },
      { label: "Standard", value: "EN 388" },
    ],
    certifications: ["EN 388"],
  },

  {
    name: "Steel Toe Safety Boots",
    category: "Foot Protection",
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
    category: "Foot Protection",
    subcategory: "Safety Shoes",
    brand: "SafeGuard",
    price: 3200,
    keyword: "work,safety,shoes",
    features: [
      "Lightweight design",
      "Composite toe",
      "Anti-slip sole",
    ],
    specs: [
      { label: "Upper", value: "Synthetic" },
      { label: "Toe Cap", value: "Composite" },
      { label: "Standard", value: "EN ISO 20345" },
    ],
    certifications: ["EN ISO 20345"],
  },

  {
    name: "Disposable Dust Mask",
    category: "Respiratory Protection",
    subcategory: "Disposable Masks",
    brand: "HSE Pro",
    price: 50,
    keyword: "dust,mask",
    features: [
      "Lightweight",
      "Comfortable nose clip",
      "Dust filtration",
    ],
    specs: [
      { label: "Type", value: "Disposable" },
      { label: "Protection", value: "Dust particles" },
      { label: "Standard", value: "EN 149" },
    ],
    certifications: ["EN 149"],
  },

  {
    name: "FFP2 Respirator Mask",
    category: "Respiratory Protection",
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
    name: "Industrial Earplugs",
    category: "Hearing Protection",
    subcategory: "Earplugs",
    brand: "HSE Pro",
    price: 80,
    keyword: "earplugs",
    features: [
      "Noise reduction",
      "Reusable design",
      "Comfortable fit",
    ],
    specs: [
      { label: "Type", value: "Reusable" },
      { label: "Material", value: "Silicone" },
      { label: "SNR", value: "25 dB" },
    ],
    certifications: ["EN 352"],
  },

  {
    name: "Industrial Ear Defenders",
    category: "Hearing Protection",
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
    name: "High Visibility Safety Vest",
    category: "Protective Clothing",
    subcategory: "Hi-Vis Clothing",
    brand: "HSE Pro",
    price: 450,
    keyword: "safety,vest",
    features: [
      "High visibility fabric",
      "Reflective strips",
      "Lightweight",
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Visibility", value: "High visibility" },
      { label: "Standard", value: "EN ISO 20471" },
    ],
    certifications: ["EN ISO 20471"],
  },

  {
    name: "Industrial Coverall",
    category: "Protective Clothing",
    subcategory: "Coveralls",
    brand: "SafeGuard",
    price: 1800,
    keyword: "workwear,coveralls",
    features: [
      "Durable fabric",
      "Multiple pockets",
      "Full body protection",
    ],
    specs: [
      { label: "Material", value: "Cotton/Polyester" },
      { label: "Closure", value: "Front zipper" },
      { label: "Sizes", value: "S-XXXL" },
    ],
    certifications: ["EN ISO 13688"],
  },

  {
    name: "Full Body Safety Harness",
    category: "Fall Protection",
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
    category: "Fall Protection",
    subcategory: "Lanyards",
    brand: "SafeGuard",
    price: 3200,
    keyword: "safety,lanyard",
    features: [
      "Energy absorber",
      "Durable webbing",
      "Secure connectors",
    ],
    specs: [
      { label: "Length", value: "1.8m" },
      { label: "Material", value: "Polyester" },
      { label: "Standard", value: "EN 355" },
    ],
    certifications: ["EN 355"],
  },

  {
    name: "Caution Wet Floor Sign",
    category: "Safety Equipment",
    subcategory: "Safety Signs",
    brand: "HSE Pro",
    price: 650,
    keyword: "warning,safety,sign",
    features: [
      "Highly visible",
      "Foldable design",
      "Durable construction",
    ],
    specs: [
      { label: "Material", value: "Plastic" },
      { label: "Design", value: "Foldable" },
    ],
    certifications: [],
  },

  {
    name: "Safety Barrier Cone",
    category: "Safety Equipment",
    subcategory: "Barriers",
    brand: "ProtectPro",
    price: 450,
    keyword: "traffic,safety,cone",
    features: [
      "High visibility",
      "Stable base",
      "Weather resistant",
    ],
    specs: [
      { label: "Height", value: "750mm" },
      { label: "Material", value: "PVC" },
    ],
    certifications: [],
  },

  {
    name: "Workplace First Aid Kit",
    category: "First Aid",
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
];

/* =====================================================
   HELPERS
===================================================== */

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generates a unique image URL for every product.
 *
 * The `lock` parameter prevents LoremFlickr from
 * returning the same image repeatedly.
 */
function getProductImage(
  keyword: string,
  index: number
) {
  const seed = `hsehub-${index + 1}`;

  return `https://loremflickr.com/800/800/${keyword}?lock=${index + 1}&${seed}`;
}

/* =====================================================
   SEED
===================================================== */

async function seed() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI);

    console.log("Connected to MongoDB.");

    /*
     * Development only.
     *
     * This removes existing dummy products/categories.
     */
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});

    console.log("Cleared existing seed data.");

    /* -----------------------------------------------
       CATEGORIES
    ------------------------------------------------ */

    const createdCategories =
      await CategoryModel.insertMany(categories);

    console.log(
      `Created ${createdCategories.length} categories.`
    );

    const categoryMap = new Map(
      createdCategories.map((category) => [
        category.name,
        category._id,
      ])
    );

    /* -----------------------------------------------
       PRODUCTS
    ------------------------------------------------ */

    const products = [];

    for (let i = 0; i < 100; i++) {
      const template =
        productTemplates[
          i % productTemplates.length
        ];

      const categoryId =
        categoryMap.get(template.category);

      if (!categoryId) {
        throw new Error(
          `Category not found: ${template.category}`
        );
      }

      const number = String(i + 1).padStart(3, "0");

      /*
       * Make each generated product unique.
       */
      const name =
        i < productTemplates.length
          ? template.name
          : `${template.name} Model ${number}`;

      const slug = `${slugify(name)}-${number}`;

      /*
       * Every product gets its own URL.
       */
      const image = getProductImage(
        template.keyword,
        i
      );

      const price =
        template.price + ((i % 6) * 100);

      products.push({
        name,

        slug,

        description:
          `Professional ${name.toLowerCase()} designed for industrial, construction, commercial and workplace safety applications.`,

        category: categoryId,

        subcategory: template.subcategory,

        brand: template.brand,

        sku: `HSE-${number}`,

        price,

        compareAtPrice:
          i % 4 === 0
            ? Math.round(price * 1.15)
            : undefined,

        stock:
          10 + ((i * 7) % 91),

        status:
          i % 17 === 0
            ? "out_of_stock"
            : i % 13 === 0
              ? "draft"
              : "active",

        /*
         * Unique image URL.
         */
        image,

        images: [image],

        featured: i % 10 === 0,

        isNewArrival: i % 7 === 0,

        features: template.features,

        specs: template.specs,

        weight:
          i % 3 === 0
            ? "500g"
            : "",

        dimensions:
          i % 4 === 0
            ? "Standard size"
            : "",

        warranty:
          i % 6 === 0
            ? "12 months"
            : "",

        certifications:
          template.certifications,
      });
    }

    await ProductModel.insertMany(products);

    console.log(
      `Created ${products.length} products.`
    );

    console.log("");
    console.log("================================");
    console.log("       HSE HUB SEED COMPLETE");
    console.log("================================");
    console.log(
      `Categories : ${createdCategories.length}`
    );
    console.log(
      `Products   : ${products.length}`
    );
    console.log("================================");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seed();