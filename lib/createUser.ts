import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { CategoryModel } from "./models/Category";
import { ProductModel } from "./models/Product";
import { UserModel } from "./models/User";

const adminUser = {
  name: "Admin User",
  email: "admin@example.com",
  password: "Admin@123456",
  role: "admin" as const,
};

const categories = [
  {
    name: "Head Protection",
    slug: "head-protection",
    description:
      "Protective helmets, hard hats, bump caps, and head protection equipment for workplace safety.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      "Safety Helmets",
      "Hard Hats",
      "Bump Caps",
      "Helmet Accessories",
    ],
  },
  {
    name: "Eye Protection",
    slug: "eye-protection",
    description:
      "Safety glasses, goggles, and face shields designed to protect workers from workplace eye hazards.",
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      "Safety Glasses",
      "Safety Goggles",
      "Welding Protection",
      "Face Shields",
    ],
  },
  {
    name: "Ear Protection",
    slug: "ear-protection",
    description:
      "Hearing protection products including ear plugs, earmuffs, and electronic hearing protection.",
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      "Ear Muffs",
      "Ear Plugs",
      "Electronic Hearing Protection",
    ],
  },
  {
    name: "Body Protection",
    slug: "body-protection",
    description:
      "Fall protection, safety harnesses, high visibility equipment, and protective body equipment.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      "Safety Harnesses",
      "High Visibility Vests",
      "Fall Protection",
      "Protective Pads",
    ],
  },
  {
    name: "Protective Clothing",
    slug: "protective-clothing",
    description:
      "Industrial workwear, coveralls, high visibility clothing, chemical protection, and work jackets.",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      "Coveralls",
      "High Visibility Clothing",
      "Chemical Protection",
      "Work Jackets",
    ],
  },
  {
    name: "Hand Protection",
    slug: "hand-protection",
    description:
      "Protective gloves for industrial work, chemical handling, welding, and cut protection.",
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      "Cut Resistant Gloves",
      "Work Gloves",
      "Chemical Resistant Gloves",
      "Heat Resistant Gloves",
    ],
  },
  {
    name: "Foot Protection",
    slug: "foot-protection",
    description:
      "Safety boots, safety shoes, waterproof footwear, and industrial protective footwear.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      "Steel Toe Boots",
      "Safety Shoes",
      "Safety Boots",
      "Work Wellington Boots",
    ],
  },
  {
    name: "Respiratory Protection",
    slug: "respiratory-protection",
    description:
      "Respirators, masks, filters, and respiratory protection equipment for hazardous environments.",
    image:
      "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      "Disposable Masks",
      "Half Face Respirators",
      "Full Face Respirators",
      "Respirator Filters",
    ],
  },
  {
    name: "Safety Equipment",
    slug: "safety-equipment",
    description:
      "Essential workplace safety equipment including fire extinguishers, first aid kits, safety signs, and spill control kits.",
    image:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      "Fire Extinguishers",
      "First Aid Kits",
      "Safety Signs",
      "Spill Control",
    ],
  },
];

const products = [
  // Head Protection
  {
    name: "Industrial Safety Helmet",
    slug: "industrial-safety-helmet",
    category: "head-protection",
    subcategory: "Safety Helmets",
    brand: "ProSafe",
    sku: "PS-HLM-001",
    price: 1800,
    stock: 75,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Ventilated Hard Hat",
    slug: "ventilated-hard-hat",
    category: "head-protection",
    subcategory: "Hard Hats",
    brand: "SafeGuard",
    sku: "SG-HAT-002",
    price: 1500,
    stock: 100,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Construction Bump Cap",
    slug: "construction-bump-cap",
    category: "head-protection",
    subcategory: "Bump Caps",
    brand: "WorkGuard",
    sku: "WG-BCP-003",
    price: 1200,
    stock: 60,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Safety Helmet with Visor",
    slug: "safety-helmet-with-visor",
    category: "head-protection",
    subcategory: "Helmet Accessories",
    brand: "ShieldPro",
    sku: "SP-HLM-004",
    price: 3200,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1100&q=80",
  },

  // Eye Protection
  {
    name: "Clear Safety Glasses",
    slug: "clear-safety-glasses",
    category: "eye-protection",
    subcategory: "Safety Glasses",
    brand: "VisionSafe",
    sku: "VS-EYE-001",
    price: 650,
    stock: 150,
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Chemical Splash Safety Goggles",
    slug: "chemical-splash-safety-goggles",
    category: "eye-protection",
    subcategory: "Safety Goggles",
    brand: "ProVision",
    sku: "PV-GOG-002",
    price: 1200,
    stock: 60,
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Dark Welding Safety Glasses",
    slug: "dark-welding-safety-glasses",
    category: "eye-protection",
    subcategory: "Welding Protection",
    brand: "WeldSafe",
    sku: "WS-EYE-003",
    price: 950,
    stock: 70,
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Full Face Protection Shield",
    slug: "full-face-protection-shield",
    category: "eye-protection",
    subcategory: "Face Shields",
    brand: "FaceGuard",
    sku: "FG-SLD-004",
    price: 1600,
    stock: 55,
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1100&q=80",
  },

  // Ear Protection
  {
    name: "Industrial Ear Muffs",
    slug: "industrial-ear-muffs",
    category: "ear-protection",
    subcategory: "Ear Muffs",
    brand: "HearSafe",
    sku: "HS-EAR-001",
    price: 1800,
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Reusable Foam Ear Plugs",
    slug: "reusable-foam-ear-plugs",
    category: "ear-protection",
    subcategory: "Ear Plugs",
    brand: "QuietPro",
    sku: "QP-PLG-002",
    price: 350,
    stock: 200,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Electronic Hearing Protection Muffs",
    slug: "electronic-hearing-protection-muffs",
    category: "ear-protection",
    subcategory: "Electronic Hearing Protection",
    brand: "SoundShield",
    sku: "SS-EAR-003",
    price: 4500,
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Corded Disposable Ear Plugs",
    slug: "corded-disposable-ear-plugs",
    category: "ear-protection",
    subcategory: "Ear Plugs",
    brand: "NoiseGuard",
    sku: "NG-PLG-004",
    price: 180,
    stock: 500,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
  },

  // Body Protection
  {
    name: "Full Body Safety Harness",
    slug: "full-body-safety-harness",
    category: "body-protection",
    subcategory: "Safety Harnesses",
    brand: "FallGuard",
    sku: "FG-HAR-001",
    price: 6500,
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "High Visibility Safety Vest",
    slug: "high-visibility-safety-vest",
    category: "body-protection",
    subcategory: "High Visibility Vests",
    brand: "VisiSafe",
    sku: "VS-VST-002",
    price: 850,
    stock: 120,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Fall Arrest Lanyard",
    slug: "fall-arrest-lanyard",
    category: "body-protection",
    subcategory: "Fall Protection",
    brand: "FallSafe",
    sku: "FS-LAN-003",
    price: 4200,
    stock: 35,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Protective Knee Pads",
    slug: "protective-knee-pads",
    category: "body-protection",
    subcategory: "Protective Pads",
    brand: "KneeGuard",
    sku: "KG-PAD-004",
    price: 1500,
    stock: 80,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
  },

  // Protective Clothing
  {
    name: "Industrial Protective Coverall",
    slug: "industrial-protective-coverall",
    category: "protective-clothing",
    subcategory: "Coveralls",
    brand: "WorkShield",
    sku: "WS-COV-001",
    price: 3200,
    stock: 80,
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "High Visibility Work Jacket",
    slug: "high-visibility-work-jacket",
    category: "protective-clothing",
    subcategory: "High Visibility Clothing",
    brand: "ReflectPro",
    sku: "RP-JKT-002",
    price: 4200,
    stock: 45,
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Chemical Resistant Coverall",
    slug: "chemical-resistant-coverall",
    category: "protective-clothing",
    subcategory: "Chemical Protection",
    brand: "ChemShield",
    sku: "CS-COV-003",
    price: 5800,
    stock: 35,
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Insulated Work Jacket",
    slug: "insulated-work-jacket",
    category: "protective-clothing",
    subcategory: "Work Jackets",
    brand: "ThermoWork",
    sku: "TW-JKT-004",
    price: 4500,
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
  },

  // Hand Protection
  {
    name: "Cut Resistant Work Gloves",
    slug: "cut-resistant-work-gloves",
    category: "hand-protection",
    subcategory: "Cut Resistant Gloves",
    brand: "GripSafe",
    sku: "GS-GLV-001",
    price: 950,
    stock: 150,
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Heavy Duty Nitrile Gloves",
    slug: "heavy-duty-nitrile-gloves",
    category: "hand-protection",
    subcategory: "Work Gloves",
    brand: "GripMax",
    sku: "GM-GLV-002",
    price: 700,
    stock: 180,
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Chemical Resistant Gloves",
    slug: "chemical-resistant-gloves",
    category: "hand-protection",
    subcategory: "Chemical Resistant Gloves",
    brand: "ChemGuard",
    sku: "CG-GLV-003",
    price: 850,
    stock: 100,
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Heat Resistant Welding Gloves",
    slug: "heat-resistant-welding-gloves",
    category: "hand-protection",
    subcategory: "Heat Resistant Gloves",
    brand: "WeldGuard",
    sku: "WG-GLV-004",
    price: 1200,
    stock: 70,
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80",
  },

  // Foot Protection
  {
    name: "Steel Toe Safety Boots",
    slug: "steel-toe-safety-boots",
    category: "foot-protection",
    subcategory: "Steel Toe Boots",
    brand: "SafeStep",
    sku: "SS-BOT-001",
    price: 4800,
    stock: 65,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Slip Resistant Safety Shoes",
    slug: "slip-resistant-safety-shoes",
    category: "foot-protection",
    subcategory: "Safety Shoes",
    brand: "StepGuard",
    sku: "SG-SHO-002",
    price: 3900,
    stock: 70,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Waterproof Safety Boots",
    slug: "waterproof-safety-boots",
    category: "foot-protection",
    subcategory: "Safety Boots",
    brand: "DryStep",
    sku: "DS-BOT-003",
    price: 5200,
    stock: 45,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Industrial Wellington Boots",
    slug: "industrial-wellington-boots",
    category: "foot-protection",
    subcategory: "Work Wellington Boots",
    brand: "RainGuard",
    sku: "RG-WEL-004",
    price: 3600,
    stock: 80,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },

  // Respiratory Protection
  {
    name: "Disposable FFP2 Respirator Mask",
    slug: "disposable-ffp2-respirator-mask",
    category: "respiratory-protection",
    subcategory: "Disposable Masks",
    brand: "AirSafe",
    sku: "AS-MSK-001",
    price: 120,
    stock: 500,
    image:
      "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Half Face Reusable Respirator",
    slug: "half-face-reusable-respirator",
    category: "respiratory-protection",
    subcategory: "Half Face Respirators",
    brand: "RespiraPro",
    sku: "RP-RES-002",
    price: 3500,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Full Face Respirator",
    slug: "full-face-respirator",
    category: "respiratory-protection",
    subcategory: "Full Face Respirators",
    brand: "RespiraMax",
    sku: "RM-RES-003",
    price: 8500,
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Respirator Filter Cartridge",
    slug: "respirator-filter-cartridge",
    category: "respiratory-protection",
    subcategory: "Respirator Filters",
    brand: "AirFilter Pro",
    sku: "AF-FLT-004",
    price: 750,
    stock: 120,
    image:
      "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80",
  },

  // Safety Equipment
  {
    name: "ABC Dry Powder Fire Extinguisher",
    slug: "abc-dry-powder-fire-extinguisher",
    category: "safety-equipment",
    subcategory: "Fire Extinguishers",
    brand: "FireSafe",
    sku: "FS-EXT-001",
    price: 6500,
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Workplace First Aid Kit",
    slug: "workplace-first-aid-kit",
    category: "safety-equipment",
    subcategory: "First Aid Kits",
    brand: "FirstCare",
    sku: "FC-KIT-002",
    price: 2800,
    stock: 60,
    image:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Emergency Safety Sign Set",
    slug: "emergency-safety-sign-set",
    category: "safety-equipment",
    subcategory: "Safety Signs",
    brand: "SafeSign",
    sku: "SS-SGN-003",
    price: 1800,
    stock: 90,
    image:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Workplace Spill Control Kit",
    slug: "workplace-spill-control-kit",
    category: "safety-equipment",
    subcategory: "Spill Control",
    brand: "SpillSafe",
    sku: "SP-KIT-004",
    price: 4200,
    stock: 35,
    image:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80",
  },
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "MONGODB_URI is not defined in your environment variables.",
      );
    }

    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(uri);

    console.log("Connected.");

    // Create the default admin user if it doesn't already exist. This is
    // idempotent — re-running the seed script never duplicates or
    // overwrites an existing admin account.
    console.log("Checking default admin user...");

    const existingAdmin = await UserModel.findOne({
      email: adminUser.email.toLowerCase(),
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminUser.password, 12);

      const createdAdmin = await UserModel.create({
        name: adminUser.name,
        email: adminUser.email.toLowerCase(),
        password: hashedPassword,
        role: adminUser.role,
      });

      console.log(`Created admin user: ${createdAdmin.email}`);
    } else {
      console.log(`Admin user already exists: ${existingAdmin.email}`);
    }

    // IMPORTANT:
    // Delete products first because they reference categories.
    console.log("Deleting existing products...");
    const deletedProducts = await ProductModel.deleteMany({});

    console.log(
      `Deleted ${deletedProducts.deletedCount} products.`,
    );

    // Delete existing categories.
    console.log("Deleting existing categories...");
    const deletedCategories = await CategoryModel.deleteMany({});

    console.log(
      `Deleted ${deletedCategories.deletedCount} categories.`,
    );

    // Create fresh categories.
    console.log("Creating categories...");

    const createdCategories =
      await CategoryModel.insertMany(categories);

    console.log(
      `Created ${createdCategories.length} categories.`,
    );

    // Build:
    // "head-protection" -> ObjectId(...)
    const categoryMap = new Map(
      createdCategories.map((category) => [
        category.slug,
        category._id,
      ]),
    );

    // Convert product category slug into ObjectId.
    const productsToInsert = products.map((product) => {
      const categoryId = categoryMap.get(product.category);

      if (!categoryId) {
        throw new Error(
          `Category "${product.category}" not found for product "${product.name}".`,
        );
      }

      return {
        name: product.name,
        slug: product.slug,
        description: `${product.name} designed for professional workplace safety and protection.`,
        category: categoryId,
        subcategory: product.subcategory,
        brand: product.brand,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        status: "active" as const,
        image: product.image,
        images: [product.image],
        featured: false,
        isNewArrival: false,
        features: [
          "Durable construction",
          "Professional safety design",
          "Comfortable for extended use",
          "Suitable for workplace applications",
        ],
        specs: [
          {
            label: "Brand",
            value: product.brand,
          },
          {
            label: "Product Type",
            value: product.subcategory,
          },
          {
            label: "SKU",
            value: product.sku,
          },
        ],
        certifications: [],
      };
    });

    // Insert products.
    console.log("Creating products...");

    const createdProducts =
      await ProductModel.insertMany(productsToInsert);

    console.log(
      `Created ${createdProducts.length} products.`,
    );

    // Verify relationships.
    console.log("\nVerifying relationships...\n");

    const verification = await ProductModel.find({})
      .populate("category", "name slug")
      .select("name category")
      .lean();

    for (const product of verification) {
      const category = product.category as {
        name: string;
        slug: string;
      };

      console.log(
        `${product.name} -> ${category.name} (${category.slug})`,
      );
    }

    console.log("\n================================");
    console.log("SEED COMPLETED SUCCESSFULLY");
    console.log("================================");
    console.log(`Admin: ${adminUser.email}`);
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${createdProducts.length}`);
    console.log("All products are linked using ObjectId.");
    console.log("================================");
  } catch (error) {
    console.error("\nSeed failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed.");
  }
}

seed();