import {
  PRODUCT_CATEGORIES,
  type Category,
  type Product,
  type ProductStatus,
} from "@/types/product";
import { formatCurrency, formatKES } from "@/lib/format";

export type { Category, Product, ProductStatus };
export { PRODUCT_CATEGORIES, formatCurrency, formatKES };

/**
 * Canonical category name list used across the public site and the admin area.
 */
export const CATEGORIES: string[] = [...PRODUCT_CATEGORIES];

export interface CategoryPreview {
  title: string;
  image: string;
  description?: string;
}

const CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=70";

export const categories: CategoryPreview[] = CATEGORIES.map((title) => ({
  title,
  image: CATEGORY_IMAGE,
  description: `Certified ${title.toLowerCase()} equipment for demanding worksites.`,
}));

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

export const PRODUCTS: Product[] = [
  {
    id: "safety-helmet-white",
    name: "Industrial Safety Helmet",
    category: "Head Protection",
    subcategory: "Hard Hats",
    price: 1450,
    image: IMG("1581092160562-40aa08e78837"),
    stock: 124,
    status: "active",
    description:
      "EN397 certified hard hat with 6-point suspension harness and UV stabilised HDPE shell.",
    featured: true,
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
    ],
    sku: "HP-1001",
    brand: "HSE Hub",
    createdAt: Date.parse("2025-01-12"),
  },
  {
    id: "clear-safety-goggles",
    name: "Anti-Fog Safety Goggles",
    category: "Eye Protection",
    subcategory: "Goggles",
    price: 890,
    image: IMG("1618477388954-7852f32655ec"),
    stock: 240,
    status: "active",
    description:
      "Wide-vision polycarbonate goggles with anti-fog, anti-scratch coating and indirect ventilation.",
    featured: true,
    specs: [
      { label: "Standard", value: "EN166" },
      { label: "Lens", value: "Polycarbonate" },
    ],
    sku: "EP-2004",
    brand: "VisionPro",
    createdAt: Date.parse("2025-02-02"),
  },
  {
    id: "ear-defenders-pro",
    name: "Ear Defenders SNR 32dB",
    category: "Ear Protection",
    subcategory: "Earmuffs",
    price: 2100,
    image: IMG("1590650153855-d9e808231d41"),
    stock: 62,
    status: "active",
    description:
      "High attenuation earmuffs with padded headband for extended wear in high-noise environments.",
    specs: [
      { label: "Standard", value: "EN352" },
      { label: "SNR", value: "32 dB" },
    ],
    sku: "AP-3007",
    brand: "SilentGuard",
    createdAt: Date.parse("2025-02-18"),
  },
  {
    id: "hi-vis-vest",
    name: "Hi-Vis Reflective Vest",
    category: "Protective Clothing",
    subcategory: "Vests",
    price: 650,
    image: IMG("1504328345606-18bbc8c9d7d1"),
    stock: 480,
    status: "active",
    description:
      "Class 2 fluorescent vest with 50mm retro-reflective tape and breathable mesh body.",
    featured: true,
    specs: [
      { label: "Standard", value: "EN ISO 20471" },
      { label: "Class", value: "2" },
    ],
    sku: "PC-4002",
    brand: "HSE Hub",
    createdAt: Date.parse("2025-03-01"),
  },
  {
    id: "nitrile-gloves",
    name: "Cut Resistant Nitrile Gloves",
    category: "Hand Protection",
    subcategory: "Gloves",
    price: 540,
    image: IMG("1585155770447-2f66e2a397b5"),
    stock: 8,
    status: "active",
    description:
      "Level D cut resistant liner with sandy nitrile palm coating for superior wet grip.",
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Cut Level", value: "D" },
    ],
    sku: "HD-5011",
    brand: "GripTech",
    createdAt: Date.parse("2025-03-14"),
  },
  {
    id: "steel-toe-boots",
    name: "Steel Toe Safety Boots",
    category: "Foot Protection",
    subcategory: "Boots",
    price: 5200,
    image: IMG("1520639888713-7851133b1ed0"),
    stock: 74,
    status: "active",
    description:
      "S3 rated leather boots with steel toe cap, penetration resistant midsole and oil resistant outsole.",
    featured: true,
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Rating", value: "S3" },
    ],
    sku: "FP-6003",
    brand: "StrideSafe",
    createdAt: Date.parse("2025-03-27"),
  },
  {
    id: "ffp2-respirator",
    name: "FFP2 Respirator Mask (Box of 20)",
    category: "Respiratory Protection",
    subcategory: "Disposable Masks",
    price: 1800,
    image: IMG("1584634731339-252c581abfc5"),
    stock: 0,
    status: "draft",
    description:
      "Moulded FFP2 particulate respirators with adjustable nose clip and low breathing resistance.",
    specs: [
      { label: "Standard", value: "EN149" },
      { label: "Pack", value: "20 units" },
    ],
    sku: "RP-7008",
    brand: "AirShield",
    createdAt: Date.parse("2025-04-05"),
  },
  {
    id: "full-body-harness",
    name: "Full Body Fall Arrest Harness",
    category: "Body Protection",
    subcategory: "Harnesses",
    price: 7900,
    image: IMG("1581092795360-fd1ca04f0952"),
    stock: 31,
    status: "active",
    description:
      "Two-point fall arrest harness with dorsal and sternal attachment, adjustable leg and chest straps.",
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Max Load", value: "140 kg" },
    ],
    sku: "BP-8001",
    brand: "AltiSafe",
    createdAt: Date.parse("2025-04-19"),
  },
  {
    id: "first-aid-kit",
    name: "Workplace First Aid Kit",
    category: "Safety Equipment",
    subcategory: "First Aid",
    price: 3400,
    image: IMG("1603398938378-e54eab446dde"),
    stock: 46,
    status: "active",
    description:
      "25-person workplace first aid kit in a wall mountable, dust proof ABS case.",
    specs: [
      { label: "Capacity", value: "25 persons" },
      { label: "Case", value: "ABS wall mount" },
    ],
    sku: "SE-9004",
    brand: "MediPrep",
    createdAt: Date.parse("2025-05-03"),
  },
  {
    id: "welding-shield",
    name: "Auto-Darkening Welding Shield",
    category: "Eye Protection",
    subcategory: "Welding",
    price: 6300,
    image: IMG("1565608087341-404b25492fee"),
    stock: 18,
    status: "active",
    description:
      "Auto-darkening welding helmet with shade 9-13 adjustment and solar assisted power.",
    specs: [
      { label: "Shade", value: "9 - 13" },
      { label: "Switch", value: "0.04 ms" },
    ],
    sku: "EP-2019",
    brand: "ArcGuard",
    createdAt: Date.parse("2025-05-21"),
  },
  {
    id: "coverall-navy",
    name: "Industrial Coverall",
    category: "Protective Clothing",
    subcategory: "Coveralls",
    price: 2950,
    image: IMG("1618221195710-dd6b41faaea6"),
    stock: 96,
    status: "active",
    description:
      "Heavy duty 65/35 poly-cotton coverall with reinforced stitching and multiple utility pockets.",
    specs: [
      { label: "Fabric", value: "Poly-cotton 245gsm" },
      { label: "Sizes", value: "S - 4XL" },
    ],
    sku: "PC-4025",
    brand: "HSE Hub",
    createdAt: Date.parse("2025-06-08"),
  },
  {
    id: "safety-signage-pack",
    name: "Safety Signage Pack",
    category: "Safety Equipment",
    subcategory: "Signage",
    price: 1250,
    image: IMG("1517420704952-d9f39e95b43e"),
    stock: 150,
    status: "archived",
    description:
      "Set of 12 photoluminescent workplace safety signs printed on rigid PVC board.",
    specs: [
      { label: "Pack", value: "12 signs" },
      { label: "Material", value: "Rigid PVC" },
    ],
    sku: "SE-9032",
    brand: "HSE Hub",
    createdAt: Date.parse("2025-06-30"),
  },
];

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter(
    (product) => product.category.toLowerCase() === category.toLowerCase(),
  );
}

export function getRelatedProducts(id: string, limit = 4): Product[] {
  const current = getProductById(id);

  if (!current) {
    return PRODUCTS.slice(0, limit);
  }

  return PRODUCTS.filter(
    (product) => product.id !== id && product.category === current.category,
  ).slice(0, limit);
}

export function getCategoriesWithCount(
  products: Product[] = PRODUCTS,
): { name: string; count: number }[] {
  return CATEGORIES.map((name) => ({
    name,
    count: products.filter((product) => product.category === name).length,
  }));
}

export function getFeaturedProducts(limit = 4): Product[] {
  return PRODUCTS.filter((product) => product.featured).slice(0, limit);
}
