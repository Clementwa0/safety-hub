import path from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ProductModel } from "./models/Product";

const envPath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  ".env"
);

dotenv.config({ path: envPath });

const products = [
  // Head Protection
  {
    name: "Industrial Safety Helmet",
    slug: "industrial-safety-helmet",
    category: "Head Protection",
    description: "Heavy-duty ABS safety helmet with adjustable suspension.",
    price: 1200,
    stock: 50,
    image: "",
    featured: true,
  },
  {
    name: "Construction Hard Hat",
    slug: "construction-hard-hat",
    category: "Head Protection",
    description: "High-impact hard hat for construction sites.",
    price: 1500,
    stock: 40,
    image: "",
  },
  {
    name: "Bump Cap",
    slug: "bump-cap",
    category: "Head Protection",
    description: "Lightweight bump cap for low-risk environments.",
    price: 900,
    stock: 60,
    image: "",
  },

  // Eye Protection
  {
    name: "Clear Safety Glasses",
    slug: "clear-safety-glasses",
    category: "Eye Protection",
    description: "Scratch-resistant safety glasses with UV protection.",
    price: 600,
    stock: 120,
    image: "",
    featured: true,
  },
  {
    name: "Anti-Fog Safety Goggles",
    slug: "anti-fog-safety-goggles",
    category: "Eye Protection",
    description: "Protective goggles with anti-fog coating.",
    price: 950,
    stock: 75,
    image: "",
  },
  {
    name: "Face Shield Visor",
    slug: "face-shield-visor",
    category: "Eye Protection",
    description: "Full-face shield for grinding and cutting tasks.",
    price: 1800,
    stock: 35,
    image: "",
  },

  // Ear Protection
  {
    name: "Foam Ear Plugs",
    slug: "foam-ear-plugs",
    category: "Ear Protection",
    description: "Disposable noise-reduction ear plugs.",
    price: 150,
    stock: 500,
    image: "",
  },
  {
    name: "Industrial Ear Muffs",
    slug: "industrial-ear-muffs",
    category: "Ear Protection",
    description: "High noise reduction earmuffs.",
    price: 1450,
    stock: 40,
    image: "",
  },

  // Body Protection
  {
    name: "Reflective Safety Vest",
    slug: "reflective-safety-vest",
    category: "Body Protection",
    description: "High-visibility reflective vest.",
    price: 850,
    stock: 100,
    image: "",
    featured: true,
  },
  {
    name: "PVC Safety Apron",
    slug: "pvc-safety-apron",
    category: "Body Protection",
    description: "Chemical-resistant PVC apron.",
    price: 1200,
    stock: 30,
    image: "",
  },

  // Protective Clothing
  {
    name: "Industrial Coverall",
    slug: "industrial-coverall",
    category: "Protective Clothing",
    description: "Durable cotton coverall for industrial workers.",
    price: 2800,
    stock: 45,
    image: "",
  },
  {
    name: "Reflective Jacket",
    slug: "reflective-jacket",
    category: "Protective Clothing",
    description: "Weather-resistant reflective jacket.",
    price: 3500,
    stock: 25,
    image: "",
  },
  {
    name: "Disposable Protective Suit",
    slug: "disposable-protective-suit",
    category: "Protective Clothing",
    description: "Single-use protective coverall.",
    price: 1800,
    stock: 70,
    image: "",
  },

  // Hand Protection
  {
    name: "Leather Safety Gloves",
    slug: "leather-safety-gloves",
    category: "Hand Protection",
    description: "Heavy-duty leather work gloves.",
    price: 650,
    stock: 150,
    image: "",
  },
  {
    name: "Nitrile Coated Gloves",
    slug: "nitrile-coated-gloves",
    category: "Hand Protection",
    description: "Cut-resistant nitrile-coated gloves.",
    price: 550,
    stock: 180,
    image: "",
  },
  {
    name: "Welding Gloves",
    slug: "welding-gloves",
    category: "Hand Protection",
    description: "Heat-resistant welding gloves.",
    price: 950,
    stock: 70,
    image: "",
  },

  // Foot Protection
  {
    name: "Steel Toe Safety Boots",
    slug: "steel-toe-safety-boots",
    category: "Foot Protection",
    description: "Slip-resistant steel toe safety boots.",
    price: 4800,
    stock: 55,
    image: "",
    featured: true,
  },
  {
    name: "PVC Gumboots",
    slug: "pvc-gumboots",
    category: "Foot Protection",
    description: "Waterproof industrial gumboots.",
    price: 2200,
    stock: 80,
    image: "",
  },
  {
    name: "Anti-Slip Work Shoes",
    slug: "anti-slip-work-shoes",
    category: "Foot Protection",
    description: "Comfortable anti-slip work shoes.",
    price: 3900,
    stock: 40,
    image: "",
  },

  // Respiratory Protection
  {
    name: "N95 Respirator Mask",
    slug: "n95-respirator-mask",
    category: "Respiratory Protection",
    description: "Certified N95 disposable respirator.",
    price: 250,
    stock: 500,
    image: "",
  },
  {
    name: "Half Face Respirator",
    slug: "half-face-respirator",
    category: "Respiratory Protection",
    description: "Reusable half-face respirator.",
    price: 4200,
    stock: 35,
    image: "",
  },
  {
    name: "Dust Mask Pack",
    slug: "dust-mask-pack",
    category: "Respiratory Protection",
    description: "Pack of 20 disposable dust masks.",
    price: 900,
    stock: 100,
    image: "",
  },

  // Safety Equipment
  {
    name: "Fire Extinguisher 6kg",
    slug: "fire-extinguisher-6kg",
    category: "Safety Equipment",
    description: "ABC dry powder fire extinguisher.",
    price: 6500,
    stock: 20,
    image: "",
    featured: true,
  },
  {
    name: "First Aid Kit",
    slug: "first-aid-kit",
    category: "Safety Equipment",
    description: "Complete workplace first aid kit.",
    price: 2400,
    stock: 60,
    image: "",
  },
  {
    name: "Traffic Safety Cone",
    slug: "traffic-safety-cone",
    category: "Safety Equipment",
    description: "Reflective traffic cone.",
    price: 950,
    stock: 120,
    image: "",
  },
];

async function seedProducts() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || "safety-hub",
  });

  for (const product of products) {
    const exists = await ProductModel.findOne({
      slug: product.slug,
    });

    if (exists) {
      console.log(`⏭ ${product.name} already exists`);
      continue;
    }

    await ProductModel.create(product);
    console.log(`✅ Created ${product.name}`);
  }

  console.log("\n🎉 Product seeding completed!");

  await mongoose.disconnect();
}

seedProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});