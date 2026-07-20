import type { StaticImageData } from "next/image";
import type { Product, ProductSpec } from "@/types/product";
import { formatKES as formatProductPrice } from "@/lib/formatters/format";

// Product Images
import helmet from "@/public/images/p-helmet.jpg";
import jacket from "@/public/images/p-jacket.jpg";
import gloves from "@/public/images/p-gloves.jpg";
import boots from "@/public/images/p-boots.jpg";
import goggles from "@/public/images/p-goggles.jpg";
import earmuffs from "@/public/images/p-ears.png";
import respirator from "@/public/images/p-respirator.png";
import harness from "@/public/images/p-harness.jpg";
import extinguisher from "@/public/images/p-extinguisher.jpg";

// Category Images
import head from "@/public/images/p-head.png";
import eye from "@/public/images/p-eyes.png";
import ear from "@/public/images/p-ears.png";
import body from "@/public/images/p-body.png";
import clothing from "@/public/images/p-clothes.png";
import hand from "@/public/images/p-gloves.png";
import foot from "@/public/images/p-boots.png";
import respiratory from "@/public/images/p-respirator.png";

/* -------------------------------------------------------------------------- */
/*                                 Categories                                 */
/* -------------------------------------------------------------------------- */

export const categories = [
  { title: "Head Protection", image: head },
  { title: "Eye Protection", image: eye },
  { title: "Ear Protection", image: ear },
  { title: "Body Protection", image: body },
  { title: "Protective Clothing", image: clothing },
  { title: "Hand Protection", image: hand },
  { title: "Foot Protection", image: foot },
  { title: "Respiratory Protection", image: respiratory },
] as const;

export const CATEGORIES = [
  "Head Protection",
  "Eye Protection",
  "Ear Protection",
  "Body Protection",
  "Protective Clothing",
  "Hand Protection",
  "Foot Protection",
  "Respiratory Protection",
  "Safety Equipment",
] as const;

export type Category = (typeof CATEGORIES)[number];

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type { Product, ProductSpec } from "@/types/product";

/* -------------------------------------------------------------------------- */
/*                              Type Guard                                    */
/* -------------------------------------------------------------------------- */

export function isCategory(value: string): value is Category {
  return CATEGORIES.includes(value as Category);
}

/* -------------------------------------------------------------------------- */
/*                                  Products                                  */
/* -------------------------------------------------------------------------- */

export const PRODUCTS: Product[] = [
  // ===== HEAD PROTECTION =====
  {
    id: "hp-001",
    name: "Industrial Safety Helmet",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 2461,
    compareAtPrice: 3200,
    image: helmet,
    images: [helmet],
    stock: 81,
    featured: false,
    rating: 4.5,
    reviews: 34,
    sku: "HP-001",
    description: "Industrial Safety Helmet designed for industrial, commercial and workplace safety applications. Features a 6-point suspension system and adjustable ratchet for superior comfort and protection.",
    features: [
      "6-point suspension system",
      "Adjustable ratchet sizing",
      "High-density polyethylene shell",
      "UV-stabilized for outdoor use",
      "Ventilation slots for airflow"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "315g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "ProGuard",
    warranty: "2 years",
    certifications: ["EN397"]
  },
  {
    id: "hp-002",
    name: "Vented Safety Helmet",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 8097,
    image: helmet,
    images: [helmet],
    stock: 159,
    featured: false,
    rating: 4.3,
    reviews: 28,
    sku: "HP-002",
    description: "Vented Safety Helmet designed for industrial, commercial and workplace safety applications. Enhanced ventilation system for hot environments.",
    features: [
      "Enhanced ventilation system",
      "4-point suspension",
      "Sweat-absorbent padding",
      "Comfortable fit"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "435g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "VentPro",
    warranty: "2 years",
    certifications: ["EN397"]
  },
  {
    id: "hp-003",
    name: "Electrical Safety Helmet",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 5210,
    image: helmet,
    images: [helmet],
    stock: 102,
    featured: false,
    rating: 4.7,
    reviews: 42,
    sku: "HP-003",
    description: "Electrical Safety Helmet designed for industrial, commercial and workplace safety applications. Provides electrical insulation up to 440V.",
    features: [
      "Electrical insulation up to 440V",
      "6-point suspension",
      "Non-conductive material",
      "Adjustable fit"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "403g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "ElectroSafe",
    warranty: "2 years",
    certifications: ["EN397", "EN50365"]
  },
  {
    id: "hp-004",
    name: "Mining Safety Helmet",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 879,
    image: helmet,
    images: [helmet],
    stock: 242,
    featured: false,
    rating: 4.2,
    reviews: 19,
    sku: "HP-004",
    description: "Mining Safety Helmet designed for industrial, commercial and workplace safety applications. Heavy-duty construction for mining environments.",
    features: [
      "Heavy-duty construction",
      "Impact-resistant shell",
      "Mining lamp bracket included",
      "Reinforced brim"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "450g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "MineGuard",
    warranty: "2 years",
    certifications: ["EN397"]
  },
  {
    id: "hp-005",
    name: "Climbing Helmet",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 1364,
    image: helmet,
    images: [helmet],
    stock: 32,
    featured: true,
    rating: 4.9,
    reviews: 56,
    sku: "HP-005",
    description: "Climbing Helmet designed for industrial, commercial and workplace safety applications. Lightweight design for extended wear.",
    features: [
      "Lightweight design",
      "6-point suspension",
      "Ventilation system",
      "Compatible with headlamps"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "331g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "ClimbSafe",
    warranty: "3 years",
    certifications: ["EN397", "EN12492"]
  },
  {
    id: "hp-006",
    name: "Ratchet Hard Hat",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 4983,
    image: helmet,
    images: [helmet],
    stock: 234,
    featured: false,
    rating: 4.4,
    reviews: 31,
    sku: "HP-006",
    description: "Ratchet Hard Hat designed for industrial, commercial and workplace safety applications. Easy to adjust ratchet system for perfect fit.",
    features: [
      "Easy adjust ratchet system",
      "4-point suspension",
      "Comfort padding",
      "Universal sizing"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "430g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "ProGuard",
    warranty: "2 years",
    certifications: ["EN397"]
  },
  {
    id: "hp-007",
    name: "Bump Cap",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 1330,
    image: helmet,
    images: [helmet],
    stock: 99,
    featured: false,
    rating: 4.1,
    reviews: 15,
    sku: "HP-007",
    description: "Bump Cap designed for industrial, commercial and workplace safety applications. Lightweight protection against bumps and lacerations.",
    features: [
      "Lightweight protection",
      "Adjustable fitting",
      "Sweat-absorbent lining",
      "Low-profile design"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "304g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "BumpGuard",
    warranty: "1 year",
    certifications: ["EN397"]
  },
  {
    id: "hp-008",
    name: "Full Brim Hard Hat",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 351,
    image: helmet,
    images: [helmet],
    stock: 86,
    featured: false,
    rating: 4.3,
    reviews: 22,
    sku: "HP-008",
    description: "Full Brim Hard Hat designed for industrial, commercial and workplace safety applications. Maximum sun and rain protection.",
    features: [
      "Full brim for sun/rain protection",
      "6-point suspension",
      "Comfortable padding",
      "Durable construction"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "360g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "ProGuard",
    warranty: "2 years",
    certifications: ["EN397"]
  },
  {
    id: "hp-009",
    name: "Short Brim Hard Hat",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 6858,
    image: helmet,
    images: [helmet],
    stock: 231,
    featured: false,
    rating: 4.2,
    reviews: 18,
    sku: "HP-009",
    description: "Short Brim Hard Hat designed for industrial, commercial and workplace safety applications. Compact design for restricted spaces.",
    features: [
      "Compact short brim design",
      "4-point suspension",
      "Lightweight",
      "Versatile application"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "318g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "CompactPro",
    warranty: "2 years",
    certifications: ["EN397"]
  },
  {
    id: "hp-010",
    name: "Helmet with Face Shield",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 2170,
    image: helmet,
    images: [helmet],
    stock: 62,
    featured: false,
    rating: 4.8,
    reviews: 47,
    sku: "HP-010",
    description: "Helmet with Face Shield designed for industrial, commercial and workplace safety applications. Provides head and face protection in one unit.",
    features: [
      "Integrated face shield",
      "6-point suspension",
      "Flip-up shield mechanism",
      "Comprehensive protection"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "440g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "FaceGuard",
    warranty: "2 years",
    certifications: ["EN397", "EN166"]
  },
  {
    id: "hp-011",
    name: "Lightweight Safety Helmet",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 5401,
    image: helmet,
    images: [helmet],
    stock: 213,
    featured: false,
    rating: 4.6,
    reviews: 39,
    sku: "HP-011",
    description: "Lightweight Safety Helmet designed for industrial, commercial and workplace safety applications. Ultra-light design for all-day comfort.",
    features: [
      "Ultra-lightweight design",
      "6-point suspension",
      "Comfort padding",
      "Ventilation system"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "301g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "LightPro",
    warranty: "2 years",
    certifications: ["EN397"]
  },
  {
    id: "hp-012",
    name: "Premium Construction Helmet",
    category: "Head Protection",
    subcategory: "Safety Helmets",
    price: 4914,
    image: helmet,
    images: [helmet],
    stock: 212,
    featured: false,
    rating: 4.7,
    reviews: 44,
    sku: "HP-012",
    description: "Premium Construction Helmet designed for industrial, commercial and workplace safety applications. Professional grade for construction sites.",
    features: [
      "Professional grade construction",
      "6-point suspension",
      "Reinforced shell",
      "Comfort padding"
    ],
    specs: [
      { label: "Standard", value: "EN397" },
      { label: "Material", value: "HDPE" },
      { label: "Weight", value: "301g" },
      { label: "Colors", value: "Yellow, White, Blue" }
    ],
    brand: "ConstruSafe",
    warranty: "3 years",
    certifications: ["EN397"]
  },

  // ===== EYE PROTECTION =====
  {
    id: "ep-001",
    name: "Clear Safety Goggles",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 4290,
    compareAtPrice: 5500,
    image: goggles,
    images: [goggles],
    stock: 23,
    featured: true,
    rating: 4.8,
    reviews: 67,
    sku: "EP-001",
    description: "Clear Safety Goggles designed for industrial, commercial and workplace safety applications. Provides 99% UV protection with anti-fog coating.",
    features: [
      "99% UV protection",
      "Anti-fog coating",
      "Impact-resistant lenses",
      "Adjustable head strap"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "ClearView",
    warranty: "2 years",
    certifications: ["EN166", "ANSI Z87.1"]
  },
  {
    id: "ep-002",
    name: "Anti-Fog Goggles",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 3232,
    image: goggles,
    images: [goggles],
    stock: 218,
    featured: true,
    rating: 4.6,
    reviews: 54,
    sku: "EP-002",
    description: "Anti-Fog Goggles designed for industrial, commercial and workplace safety applications. Advanced fog-free technology for clear vision.",
    features: [
      "Advanced anti-fog technology",
      "Scratch-resistant coating",
      "Comfortable fit",
      "Wide field of view"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "ClearView",
    warranty: "2 years",
    certifications: ["EN166"]
  },
  {
    id: "ep-003",
    name: "Chemical Splash Goggles",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 1693,
    image: goggles,
    images: [goggles],
    stock: 86,
    featured: false,
    rating: 4.9,
    reviews: 73,
    sku: "EP-003",
    description: "Chemical Splash Goggles designed for industrial, commercial and workplace safety applications. Sealed protection against chemical splashes.",
    features: [
      "Chemical splash protection",
      "Indirect ventilation",
      "Comfortable seal",
      "Impact-resistant"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "ChemSafe",
    warranty: "2 years",
    certifications: ["EN166", "EN374"]
  },
  {
    id: "ep-004",
    name: "Smoke Safety Glasses",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 5931,
    image: goggles,
    images: [goggles],
    stock: 217,
    featured: false,
    rating: 4.4,
    reviews: 38,
    sku: "EP-004",
    description: "Smoke Safety Glasses designed for industrial, commercial and workplace safety applications. Tinted lenses for outdoor use.",
    features: [
      "Smoke-tinted lenses",
      "UV protection",
      "Impact-resistant",
      "Comfortable frame"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "SunSafe",
    warranty: "1 year",
    certifications: ["EN166"]
  },
  {
    id: "ep-005",
    name: "Blue Lens Safety Glasses",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 1272,
    image: goggles,
    images: [goggles],
    stock: 211,
    featured: true,
    rating: 4.7,
    reviews: 42,
    sku: "EP-005",
    description: "Blue Lens Safety Glasses designed for industrial, commercial and workplace safety applications. Blue tint reduces glare.",
    features: [
      "Blue tinted lenses",
      "UV protection",
      "Impact-resistant",
      "Stylish design"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "VisionPro",
    warranty: "1 year",
    certifications: ["EN166"]
  },
  {
    id: "ep-006",
    name: "Visitor Safety Glasses",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 4518,
    image: goggles,
    images: [goggles],
    stock: 229,
    featured: false,
    rating: 4.3,
    reviews: 29,
    sku: "EP-006",
    description: "Visitor Safety Glasses designed for industrial, commercial and workplace safety applications. Ideal for factory visitors and occasional use.",
    features: [
      "Lightweight design",
      "Universal fit",
      "Impact-resistant",
      "Cost-effective"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "VisitSafe",
    warranty: "1 year",
    certifications: ["EN166"]
  },
  {
    id: "ep-007",
    name: "Full Face Shield",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 2572,
    image: goggles,
    images: [goggles],
    stock: 230,
    featured: false,
    rating: 4.8,
    reviews: 51,
    sku: "EP-007",
    description: "Full Face Shield designed for industrial, commercial and workplace safety applications. Provides full face protection.",
    features: [
      "Full face coverage",
      "Impact-resistant",
      "Adjustable headband",
      "Flip-up design"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "FaceGuard",
    warranty: "2 years",
    certifications: ["EN166"]
  },
  {
    id: "ep-008",
    name: "Mesh Face Shield",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 6069,
    image: goggles,
    images: [goggles],
    stock: 171,
    featured: false,
    rating: 4.5,
    reviews: 33,
    sku: "EP-008",
    description: "Mesh Face Shield designed for industrial, commercial and workplace safety applications. Ventilated design for air flow.",
    features: [
      "Mesh design for ventilation",
      "Impact-resistant",
      "Adjustable headband",
      "Lightweight"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "MeshGuard",
    warranty: "1 year",
    certifications: ["EN166"]
  },
  {
    id: "ep-009",
    name: "Welding Goggles",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 5801,
    image: goggles,
    images: [goggles],
    stock: 204,
    featured: false,
    rating: 4.9,
    reviews: 62,
    sku: "EP-009",
    description: "Welding Goggles designed for industrial, commercial and workplace safety applications. Shade 5 lenses for welding protection.",
    features: [
      "Shade 5 welding lenses",
      "UV/IR protection",
      "Comfortable fit",
      "Indirect ventilation"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "WeldSafe",
    warranty: "2 years",
    certifications: ["EN166", "EN175"]
  },
  {
    id: "ep-010",
    name: "Laser Safety Glasses",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 5539,
    image: goggles,
    images: [goggles],
    stock: 200,
    featured: false,
    rating: 4.9,
    reviews: 28,
    sku: "EP-010",
    description: "Laser Safety Glasses designed for industrial, commercial and workplace safety applications. Protection against laser radiation.",
    features: [
      "Laser radiation protection",
      "Specific wavelength filtering",
      "Lightweight frame",
      "Comfortable fit"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "LaserSafe",
    warranty: "2 years",
    certifications: ["EN166", "EN207"]
  },
  {
    id: "ep-011",
    name: "Over-Spec Safety Goggles",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 2815,
    image: goggles,
    images: [goggles],
    stock: 202,
    featured: true,
    rating: 4.6,
    reviews: 36,
    sku: "EP-011",
    description: "Over-Spec Safety Goggles designed for industrial, commercial and workplace safety applications. Fits over prescription glasses.",
    features: [
      "Fits over prescription glasses",
      "Impact-resistant",
      "Adjustable strap",
      "Comfortable fit"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "OverSpec",
    warranty: "1 year",
    certifications: ["EN166"]
  },
  {
    id: "ep-012",
    name: "UV Protection Glasses",
    category: "Eye Protection",
    subcategory: "Safety Goggles",
    price: 2555,
    image: goggles,
    images: [goggles],
    stock: 109,
    featured: false,
    rating: 4.4,
    reviews: 31,
    sku: "EP-012",
    description: "UV Protection Glasses designed for industrial, commercial and workplace safety applications. Maximum UV protection.",
    features: [
      "Maximum UV protection",
      "Impact-resistant",
      "Lightweight design",
      "Comfortable frame"
    ],
    specs: [
      { label: "Lens", value: "Polycarbonate" },
      { label: "Standard", value: "EN166" },
      { label: "Anti Fog", value: "Yes" },
      { label: "UV Protection", value: "99%" }
    ],
    brand: "UVGuard",
    warranty: "1 year",
    certifications: ["EN166"]
  },

  // ===== EAR PROTECTION =====
  {
    id: "erp-001",
    name: "Foam Ear Plugs",
    category: "Ear Protection",
    subcategory: "Ear Protection",
    price: 869,
    image: ear,
    images: [ear],
    stock: 126,
    featured: true,
    rating: 4.3,
    reviews: 89,
    sku: "ERP-001",
    description: "Foam Ear Plugs designed for industrial, commercial and workplace safety applications. High noise reduction rating.",
    features: [
      "37dB noise reduction",
      "Soft foam material",
      "Comfortable fit",
      "Disposable"
    ],
    specs: [
      { label: "Noise Reduction", value: "37 dB" },
      { label: "Material", value: "ABS / Foam" }
    ],
    brand: "QuietPro",
    warranty: "1 year",
    certifications: ["EN352"]
  },
  {
    id: "erp-002",
    name: "Corded Ear Plugs",
    category: "Ear Protection",
    subcategory: "Ear Protection",
    price: 2682,
    image: ear,
    images: [ear],
    stock: 57,
    featured: true,
    rating: 4.5,
    reviews: 67,
    sku: "ERP-002",
    description: "Corded Ear Plugs designed for industrial, commercial and workplace safety applications. Convenient cord keeps plugs together.",
    features: [
      "Convenient cord",
      "26dB noise reduction",
      "Reusable",
      "Washable"
    ],
    specs: [
      { label: "Noise Reduction", value: "26 dB" },
      { label: "Material", value: "ABS / Foam" }
    ],
    brand: "QuietPro",
    warranty: "1 year",
    certifications: ["EN352"]
  },
  {
    id: "erp-003",
    name: "Silicone Ear Plugs",
    category: "Ear Protection",
    subcategory: "Ear Protection",
    price: 1298,
    image: ear,
    images: [ear],
    stock: 246,
    featured: true,
    rating: 4.6,
    reviews: 78,
    sku: "ERP-003",
    description: "Silicone Ear Plugs designed for industrial, commercial and workplace safety applications. Reusable silicone for comfort.",
    features: [
      "Reusable silicone",
      "33dB noise reduction",
      "Hypoallergenic",
      "Washable"
    ],
    specs: [
      { label: "Noise Reduction", value: "33 dB" },
      { label: "Material", value: "ABS / Foam" }
    ],
    brand: "SilentPro",
    warranty: "2 years",
    certifications: ["EN352"]
  },
  {
    id: "erp-004",
    name: "Industrial Ear Muffs",
    category: "Ear Protection",
    subcategory: "Ear Protection",
    price: 6125,
    image: ear,
    images: [ear],
    stock: 228,
    featured: false,
    rating: 4.7,
    reviews: 92,
    sku: "ERP-004",
    description: "Industrial Ear Muffs designed for industrial, commercial and workplace safety applications. High-performance hearing protection.",
    features: [
      "28dB noise reduction",
      "Adjustable headband",
      "Comfortable cushions",
      "Foldable for storage"
    ],
    specs: [
      { label: "Noise Reduction", value: "28 dB" },
      { label: "Material", value: "ABS / Foam" }
    ],
    brand: "MuffPro",
    warranty: "2 years",
    certifications: ["EN352"]
  },
  {
    id: "erp-005",
    name: "Foldable Ear Muffs",
    category: "Ear Protection",
    subcategory: "Ear Protection",
    price: 7931,
    image: ear,
    images: [ear],
    stock: 243,
    featured: false,
    rating: 4.4,
    reviews: 56,
    sku: "ERP-005",
    description: "Foldable Ear Muffs designed for industrial, commercial and workplace safety applications. Compact foldable design.",
    features: [
      "Foldable design",
      "35dB noise reduction",
      "Comfortable cushions",
      "Portable"
    ],
    specs: [
      { label: "Noise Reduction", value: "35 dB" },
      { label: "Material", value: "ABS / Foam" }
    ],
    brand: "FoldSafe",
    warranty: "2 years",
    certifications: ["EN352"]
  },
  {
    id: "erp-006",
    name: "Helmet Mounted Ear Muffs",
    category: "Ear Protection",
    subcategory: "Ear Protection",
    price: 8267,
    image: ear,
    images: [ear],
    stock: 190,
    featured: false,
    rating: 4.8,
    reviews: 45,
    sku: "ERP-006",
    description: "Helmet Mounted Ear Muffs designed for industrial, commercial and workplace safety applications. Attaches directly to safety helmets.",
    features: [
      "Helmet mounting system",
      "30dB noise reduction",
      "Comfortable fit",
      "Easy attachment"
    ],
    specs: [
      { label: "Noise Reduction", value: "30 dB" },
      { label: "Material", value: "ABS / Foam" }
    ],
    brand: "HelmetMount",
    warranty: "2 years",
    certifications: ["EN352"]
  },
  {
    id: "erp-007",
    name: "Noise Defender",
    category: "Ear Protection",
    subcategory: "Ear Protection",
    price: 4336,
    image: ear,
    images: [ear],
    stock: 210,
    featured: false,
    rating: 4.5,
    reviews: 34,
    sku: "ERP-007",
    description: "Noise Defender designed for industrial, commercial and workplace safety applications. Advanced noise reduction technology.",
    features: [
      "37dB noise reduction",
      "Comfortable design",
      "Durable construction",
      "Adjustable fit"
    ],
    specs: [
      { label: "Noise Reduction", value: "37 dB" },
      { label: "Material", value: "ABS / Foam" }
    ],
    brand: "DefenderPro",
    warranty: "2 years",
    certifications: ["EN352"]
  },
  {
    id: "erp-008",
    name: "Premium Ear Protectors",
    category: "Ear Protection",
    subcategory: "Ear Protection",
    price: 1221,
    image: ear,
    images: [ear],
    stock: 188,
    featured: false,
    rating: 4.6,
    reviews: 41,
    sku: "ERP-008",
    description: "Premium Ear Protectors designed for industrial, commercial and workplace safety applications. Premium quality construction.",
    features: [
      "31dB noise reduction",
      "Premium materials",
      "Comfortable fit",
      "Durable"
    ],
    specs: [
      { label: "Noise Reduction", value: "31 dB" },
      { label: "Material", value: "ABS / Foam" }
    ],
    brand: "PremiumPro",
    warranty: "2 years",
    certifications: ["EN352"]
  },

  // ===== BODY PROTECTION =====
  {
    id: "bp-001",
    name: "Full Body Harness",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 1664,
    image: harness,
    images: [harness],
    stock: 73,
    featured: false,
    rating: 4.8,
    reviews: 89,
    sku: "BP-001",
    description: "Full Body Harness designed for industrial, commercial and workplace safety applications. Full body protection for work at height.",
    features: [
      "Full body protection",
      "Adjustable straps",
      "Dorsal D-ring",
      "Comfort padding"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "HarnessPro",
    warranty: "3 years",
    certifications: ["EN361"]
  },
  {
    id: "bp-002",
    name: "Construction Harness",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 6850,
    image: harness,
    images: [harness],
    stock: 219,
    featured: true,
    rating: 4.9,
    reviews: 112,
    sku: "BP-002",
    description: "Construction Harness designed for industrial, commercial and workplace safety applications. Heavy-duty construction grade.",
    features: [
      "Heavy-duty construction",
      "Multiple attachment points",
      "Comfort padding",
      "Durable webbing"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "ConstruSafe",
    warranty: "3 years",
    certifications: ["EN361"]
  },
  {
    id: "bp-003",
    name: "Single Lanyard",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 2762,
    image: harness,
    images: [harness],
    stock: 196,
    featured: true,
    rating: 4.5,
    reviews: 67,
    sku: "BP-003",
    description: "Single Lanyard designed for industrial, commercial and workplace safety applications. Basic fall protection lanyard.",
    features: [
      "Single leg design",
      "Energy absorbing",
      "Carabiner ends",
      "Lightweight"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "LanyardPro",
    warranty: "2 years",
    certifications: ["EN361"]
  },
  {
    id: "bp-004",
    name: "Double Lanyard",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 3381,
    image: harness,
    images: [harness],
    stock: 135,
    featured: false,
    rating: 4.7,
    reviews: 54,
    sku: "BP-004",
    description: "Double Lanyard designed for industrial, commercial and workplace safety applications. Provides dual connection points.",
    features: [
      "Double leg design",
      "Energy absorbing",
      "Multiple attachment options",
      "Durable construction"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "DualSafe",
    warranty: "2 years",
    certifications: ["EN361"]
  },
  {
    id: "bp-005",
    name: "Energy Absorbing Lanyard",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 1292,
    image: harness,
    images: [harness],
    stock: 171,
    featured: false,
    rating: 4.6,
    reviews: 48,
    sku: "BP-005",
    description: "Energy Absorbing Lanyard designed for industrial, commercial and workplace safety applications. Reduces impact forces.",
    features: [
      "Energy absorbing design",
      "Fall force reduction",
      "Lightweight",
      "Easy to use"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "AbsorbPro",
    warranty: "2 years",
    certifications: ["EN361"]
  },
  {
    id: "bp-006",
    name: "Anchor Strap",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 1534,
    image: harness,
    images: [harness],
    stock: 45,
    featured: false,
    rating: 4.4,
    reviews: 36,
    sku: "BP-006",
    description: "Anchor Strap designed for industrial, commercial and workplace safety applications. Secure anchor point for fall protection.",
    features: [
      "Secure anchor point",
      "Heavy-duty webbing",
      "Multiple configurations",
      "Durable"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "AnchorPro",
    warranty: "2 years",
    certifications: ["EN361"]
  },
  {
    id: "bp-007",
    name: "Retractable Lifeline",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 1747,
    image: harness,
    images: [harness],
    stock: 183,
    featured: false,
    rating: 4.8,
    reviews: 72,
    sku: "BP-007",
    description: "Retractable Lifeline designed for industrial, commercial and workplace safety applications. Auto-retracting for convenience.",
    features: [
      "Auto-retracting",
      "Fall arrest technology",
      "Compact design",
      "Easy to use"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "RetractPro",
    warranty: "3 years",
    certifications: ["EN361"]
  },
  {
    id: "bp-008",
    name: "Positioning Belt",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 1804,
    image: harness,
    images: [harness],
    stock: 230,
    featured: false,
    rating: 4.3,
    reviews: 29,
    sku: "BP-008",
    description: "Positioning Belt designed for industrial, commercial and workplace safety applications. Supports work positioning.",
    features: [
      "Work positioning",
      "Adjustable fit",
      "Durable construction",
      "Comfortable padding"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "PositionPro",
    warranty: "2 years",
    certifications: ["EN361"]
  },
  {
    id: "bp-009",
    name: "Rescue Kit",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 5621,
    image: harness,
    images: [harness],
    stock: 34,
    featured: true,
    rating: 4.9,
    reviews: 45,
    sku: "BP-009",
    description: "Rescue Kit designed for industrial, commercial and workplace safety applications. Complete rescue equipment set.",
    features: [
      "Complete rescue set",
      "Multiple components",
      "Rugged case",
      "Easy deployment"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "RescuePro",
    warranty: "3 years",
    certifications: ["EN361"]
  },
  {
    id: "bp-010",
    name: "Fall Arrest Kit",
    category: "Body Protection",
    subcategory: "Fall Protection",
    price: 2706,
    image: harness,
    images: [harness],
    stock: 130,
    featured: false,
    rating: 4.7,
    reviews: 56,
    sku: "BP-010",
    description: "Fall Arrest Kit designed for industrial, commercial and workplace safety applications. Complete fall arrest system.",
    features: [
      "Complete fall arrest system",
      "All components included",
      "Easy to set up",
      "Certified safety"
    ],
    specs: [
      { label: "Standard", value: "EN361" },
      { label: "Capacity", value: "140kg" }
    ],
    brand: "ArrestPro",
    warranty: "3 years",
    certifications: ["EN361"]
  },

  // ===== PROTECTIVE CLOTHING =====
  {
    id: "pc-001",
    name: "Blue Coverall",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 2046,
    image: jacket,
    images: [jacket],
    stock: 103,
    featured: false,
    rating: 4.2,
    reviews: 45,
    sku: "PC-001",
    description: "Blue Coverall designed for industrial, commercial and workplace safety applications. Durable workwear protection.",
    features: [
      "Durable fabric",
      "Multiple pockets",
      "Zip front closure",
      "Reinforced stitching"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "WorkWear",
    warranty: "1 year",
    certifications: ["EN ISO 13688"]
  },
  {
    id: "pc-002",
    name: "Orange Coverall",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 3997,
    image: jacket,
    images: [jacket],
    stock: 120,
    featured: true,
    rating: 4.4,
    reviews: 56,
    sku: "PC-002",
    description: "Orange Coverall designed for industrial, commercial and workplace safety applications. High visibility orange color.",
    features: [
      "High visibility orange",
      "Durable fabric",
      "Multiple pockets",
      "Reflective tape"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "HiVis",
    warranty: "1 year",
    certifications: ["EN ISO 13688", "EN 471"]
  },
  {
    id: "pc-003",
    name: "Disposable Coverall",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 5639,
    image: jacket,
    images: [jacket],
    stock: 63,
    featured: true,
    rating: 4.3,
    reviews: 34,
    sku: "PC-003",
    description: "Disposable Coverall designed for industrial, commercial and workplace safety applications. Single-use protection.",
    features: [
      "Disposable design",
      "Lightweight material",
      "Full body coverage",
      "Elastic cuffs"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "DispoSafe",
    warranty: "N/A",
    certifications: ["EN ISO 13688"]
  },
  {
    id: "pc-004",
    name: "Reflective Vest",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 6990,
    image: jacket,
    images: [jacket],
    stock: 73,
    featured: true,
    rating: 4.8,
    reviews: 123,
    sku: "PC-004",
    description: "Reflective Vest designed for industrial, commercial and workplace safety applications. Class 2 high visibility.",
    features: [
      "Class 2 visibility",
      "Reflective strips",
      "Breathable mesh",
      "Adjustable fit"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "HiVis",
    warranty: "2 years",
    certifications: ["EN 471", "ANSI 107"]
  },
  {
    id: "pc-005",
    name: "Reflective Jacket",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 1237,
    image: jacket,
    images: [jacket],
    stock: 44,
    featured: false,
    rating: 4.6,
    reviews: 67,
    sku: "PC-005",
    description: "Reflective Jacket designed for industrial, commercial and workplace safety applications. All-weather visibility.",
    features: [
      "All-weather protection",
      "Reflective strips",
      "Water-resistant",
      "Multiple pockets"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "WeatherGuard",
    warranty: "2 years",
    certifications: ["EN 471"]
  },
  {
    id: "pc-006",
    name: "Lab Coat",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 7842,
    image: jacket,
    images: [jacket],
    stock: 52,
    featured: true,
    rating: 4.5,
    reviews: 45,
    sku: "PC-006",
    description: "Lab Coat designed for industrial, commercial and workplace safety applications. Professional laboratory protection.",
    features: [
      "Professional design",
      "Chemical resistant",
      "Multiple pockets",
      "Comfortable fit"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "LabPro",
    warranty: "1 year",
    certifications: ["EN ISO 13688"]
  },
  {
    id: "pc-007",
    name: "Rain Suit",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 5060,
    image: jacket,
    images: [jacket],
    stock: 218,
    featured: false,
    rating: 4.7,
    reviews: 78,
    sku: "PC-007",
    description: "Rain Suit designed for industrial, commercial and workplace safety applications. Waterproof protection.",
    features: [
      "Waterproof fabric",
      "Full suit protection",
      "Breathable material",
      "Adjustable fit"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "RainGuard",
    warranty: "2 years",
    certifications: ["EN ISO 13688"]
  },
  {
    id: "pc-008",
    name: "Chemical Suit",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 3621,
    image: jacket,
    images: [jacket],
    stock: 228,
    featured: true,
    rating: 4.9,
    reviews: 56,
    sku: "PC-008",
    description: "Chemical Suit designed for industrial, commercial and workplace safety applications. Protection against chemical splashes.",
    features: [
      "Chemical splash protection",
      "Sealed seams",
      "Full body coverage",
      "Chemical resistant"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "ChemGuard",
    warranty: "1 year",
    certifications: ["EN ISO 13688", "EN 14605"]
  },
  {
    id: "pc-009",
    name: "Fire Suit",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 2011,
    image: jacket,
    images: [jacket],
    stock: 166,
    featured: false,
    rating: 4.8,
    reviews: 89,
    sku: "PC-009",
    description: "Fire Suit designed for industrial, commercial and workplace safety applications. Flame-resistant protection.",
    features: [
      "Flame resistant",
      "Heat protection",
      "Full body coverage",
      "Durable fabric"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "FireGuard",
    warranty: "2 years",
    certifications: ["EN ISO 11612"]
  },
  {
    id: "pc-010",
    name: "Arc Flash Suit",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 351,
    image: jacket,
    images: [jacket],
    stock: 163,
    featured: true,
    rating: 4.9,
    reviews: 34,
    sku: "PC-010",
    description: "Arc Flash Suit designed for industrial, commercial and workplace safety applications. Protection against electrical arcs.",
    features: [
      "Arc flash protection",
      "Full body coverage",
      "Flame resistant",
      "Durable construction"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "ArcGuard",
    warranty: "2 years",
    certifications: ["EN ISO 11612", "NFPA 70E"]
  },
  {
    id: "pc-011",
    name: "Freezer Jacket",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 5504,
    image: jacket,
    images: [jacket],
    stock: 124,
    featured: false,
    rating: 4.6,
    reviews: 45,
    sku: "PC-011",
    description: "Freezer Jacket designed for industrial, commercial and workplace safety applications. Cold environment protection.",
    features: [
      "Cold protection",
      "Insulated design",
      "Comfortable fit",
      "Durable fabric"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "FreezeGuard",
    warranty: "2 years",
    certifications: ["EN ISO 13688"]
  },
  {
    id: "pc-012",
    name: "Freezer Trousers",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 4073,
    image: jacket,
    images: [jacket],
    stock: 130,
    featured: false,
    rating: 4.5,
    reviews: 38,
    sku: "PC-012",
    description: "Freezer Trousers designed for industrial, commercial and workplace safety applications. Cold environment leg protection.",
    features: [
      "Cold protection",
      "Insulated design",
      "Comfortable fit",
      "Durable fabric"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "FreezeGuard",
    warranty: "2 years",
    certifications: ["EN ISO 13688"]
  },
  {
    id: "pc-013",
    name: "High Visibility Overall",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 7576,
    image: jacket,
    images: [jacket],
    stock: 166,
    featured: false,
    rating: 4.7,
    reviews: 56,
    sku: "PC-013",
    description: "High Visibility Overall designed for industrial, commercial and workplace safety applications. Full body high visibility.",
    features: [
      "Full body visibility",
      "Reflective strips",
      "Durable fabric",
      "Comfortable fit"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "HiVis",
    warranty: "2 years",
    certifications: ["EN 471"]
  },
  {
    id: "pc-014",
    name: "Welding Apron",
    category: "Protective Clothing",
    subcategory: "Workwear",
    price: 1200,
    image: jacket,
    images: [jacket],
    stock: 77,
    featured: false,
    rating: 4.4,
    reviews: 29,
    sku: "PC-014",
    description: "Welding Apron designed for industrial, commercial and workplace safety applications. Sparks and heat protection.",
    features: [
      "Sparks protection",
      "Heat resistant",
      "Leather construction",
      "Adjustable straps"
    ],
    specs: [
      { label: "Material", value: "Polyester" },
      { label: "Sizes", value: "S-3XL" }
    ],
    brand: "WeldGuard",
    warranty: "1 year",
    certifications: ["EN ISO 11611"]
  },

  // ===== HAND PROTECTION =====
  {
    id: "hpg-001",
    name: "Cut Resistant Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 1502,
    image: gloves,
    images: [gloves],
    stock: 158,
    featured: false,
    rating: 4.8,
    reviews: 89,
    sku: "HPG-001",
    description: "Cut Resistant Gloves designed for industrial, commercial and workplace safety applications. Level 5 cut protection.",
    features: [
      "Level 5 cut protection",
      "Kevlar reinforced",
      "Excellent grip",
      "Comfortable fit"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "CutGuard",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-002",
    name: "Leather Work Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 3708,
    image: gloves,
    images: [gloves],
    stock: 171,
    featured: true,
    rating: 4.6,
    reviews: 67,
    sku: "HPG-002",
    description: "Leather Work Gloves designed for industrial, commercial and workplace safety applications. Premium leather construction.",
    features: [
      "Premium leather",
      "Durable construction",
      "Comfortable fit",
      "Excellent grip"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "LeatherPro",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-003",
    name: "Nitrile Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 5885,
    image: gloves,
    images: [gloves],
    stock: 229,
    featured: false,
    rating: 4.5,
    reviews: 78,
    sku: "HPG-003",
    description: "Nitrile Gloves designed for industrial, commercial and workplace safety applications. Chemical resistant protection.",
    features: [
      "Chemical resistant",
      "Puncture resistant",
      "Comfortable fit",
      "Excellent dexterity"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "NitrilePro",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-004",
    name: "Latex Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 7626,
    image: gloves,
    images: [gloves],
    stock: 90,
    featured: false,
    rating: 4.3,
    reviews: 56,
    sku: "HPG-004",
    description: "Latex Gloves designed for industrial, commercial and workplace safety applications. Flexible latex protection.",
    features: [
      "Flexible latex",
      "Good dexterity",
      "Comfortable fit",
      "Cost-effective"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "LatexPro",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-005",
    name: "PVC Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 6904,
    image: gloves,
    images: [gloves],
    stock: 189,
    featured: false,
    rating: 4.4,
    reviews: 45,
    sku: "HPG-005",
    description: "PVC Gloves designed for industrial, commercial and workplace safety applications. Chemical resistant PVC.",
    features: [
      "PVC coated",
      "Chemical resistant",
      "Excellent grip",
      "Durable"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "PVCGuard",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-006",
    name: "Rubber Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 4957,
    image: gloves,
    images: [gloves],
    stock: 16,
    featured: false,
    rating: 4.7,
    reviews: 34,
    sku: "HPG-006",
    description: "Rubber Gloves designed for industrial, commercial and workplace safety applications. Heavy-duty rubber protection.",
    features: [
      "Heavy-duty rubber",
      "Chemical resistant",
      "Excellent grip",
      "Durable construction"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "RubberPro",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-007",
    name: "Mechanic Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 1466,
    image: gloves,
    images: [gloves],
    stock: 77,
    featured: false,
    rating: 4.6,
    reviews: 67,
    sku: "HPG-007",
    description: "Mechanic Gloves designed for industrial, commercial and workplace safety applications. Professional mechanic protection.",
    features: [
      "Professional grade",
      "Impact protection",
      "Excellent grip",
      "Comfortable fit"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "MechPro",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-008",
    name: "Chemical Resistant Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 7953,
    image: gloves,
    images: [gloves],
    stock: 221,
    featured: false,
    rating: 4.9,
    reviews: 89,
    sku: "HPG-008",
    description: "Chemical Resistant Gloves designed for industrial, commercial and workplace safety applications. Maximum chemical protection.",
    features: [
      "Maximum chemical protection",
      "Durable construction",
      "Excellent grip",
      "Comfortable fit"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "ChemGuard",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-009",
    name: "Thermal Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 8179,
    image: gloves,
    images: [gloves],
    stock: 118,
    featured: false,
    rating: 4.5,
    reviews: 56,
    sku: "HPG-009",
    description: "Thermal Gloves designed for industrial, commercial and workplace safety applications. Cold weather protection.",
    features: [
      "Thermal insulation",
      "Comfortable fit",
      "Excellent grip",
      "Durable"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "ThermaGuard",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-010",
    name: "Cotton Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 466,
    image: gloves,
    images: [gloves],
    stock: 32,
    featured: false,
    rating: 4.2,
    reviews: 45,
    sku: "HPG-010",
    description: "Cotton Gloves designed for industrial, commercial and workplace safety applications. Basic cotton protection.",
    features: [
      "Cotton material",
      "Comfortable fit",
      "Lightweight",
      "Cost-effective"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "CottonPro",
    warranty: "N/A",
    certifications: ["EN388"]
  },
  {
    id: "hpg-011",
    name: "Food Grade Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 6334,
    image: gloves,
    images: [gloves],
    stock: 246,
    featured: false,
    rating: 4.6,
    reviews: 34,
    sku: "HPG-011",
    description: "Food Grade Gloves designed for industrial, commercial and workplace safety applications. Food safe material.",
    features: [
      "Food grade material",
      "Safe for food contact",
      "Comfortable fit",
      "Durable"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "FoodSafe",
    warranty: "1 year",
    certifications: ["EN388", "FDA"]
  },
  {
    id: "hpg-012",
    name: "Impact Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 3855,
    image: gloves,
    images: [gloves],
    stock: 98,
    featured: true,
    rating: 4.8,
    reviews: 78,
    sku: "HPG-012",
    description: "Impact Gloves designed for industrial, commercial and workplace safety applications. Impact protection with TPR.",
    features: [
      "TPR impact protection",
      "Excellent grip",
      "Comfortable fit",
      "Durable construction"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "ImpactGuard",
    warranty: "2 years",
    certifications: ["EN388"]
  },
  {
    id: "hpg-013",
    name: "Welding Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 4732,
    image: gloves,
    images: [gloves],
    stock: 63,
    featured: false,
    rating: 4.9,
    reviews: 56,
    sku: "HPG-013",
    description: "Welding Gloves designed for industrial, commercial and workplace safety applications. Heat and sparks protection.",
    features: [
      "Heat resistant",
      "Sparks protection",
      "Excellent grip",
      "Durable leather"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "WeldGuard",
    warranty: "1 year",
    certifications: ["EN388"]
  },
  {
    id: "hpg-014",
    name: "General Purpose Gloves",
    category: "Hand Protection",
    subcategory: "Safety Gloves",
    price: 1190,
    image: gloves,
    images: [gloves],
    stock: 165,
    featured: true,
    rating: 4.3,
    reviews: 89,
    sku: "HPG-014",
    description: "General Purpose Gloves designed for industrial, commercial and workplace safety applications. Versatile protection.",
    features: [
      "Versatile use",
      "Comfortable fit",
      "Good grip",
      "Durable"
    ],
    specs: [
      { label: "Standard", value: "EN388" },
      { label: "Grip", value: "High" }
    ],
    brand: "GenPro",
    warranty: "1 year",
    certifications: ["EN388"]
  },

  // ===== FOOT PROTECTION =====
  {
    id: "fp-001",
    name: "Steel Toe Boots",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 8093,
    image: boots,
    images: [boots],
    stock: 18,
    featured: false,
    rating: 4.7,
    reviews: 89,
    sku: "FP-001",
    description: "Steel Toe Boots designed for industrial, commercial and workplace safety applications. Maximum toe protection.",
    features: [
      "Steel toe protection",
      "Slip resistant sole",
      "Comfortable fit",
      "Durable construction"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "SafeStep",
    warranty: "2 years",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-002",
    name: "Composite Toe Boots",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 604,
    image: boots,
    images: [boots],
    stock: 108,
    featured: true,
    rating: 4.6,
    reviews: 67,
    sku: "FP-002",
    description: "Composite Toe Boots designed for industrial, commercial and workplace safety applications. Non-metallic toe protection.",
    features: [
      "Composite toe",
      "Lightweight design",
      "Slip resistant",
      "Comfortable fit"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "CompoSafe",
    warranty: "2 years",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-003",
    name: "PVC Gumboots",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 7848,
    image: boots,
    images: [boots],
    stock: 242,
    featured: false,
    rating: 4.5,
    reviews: 78,
    sku: "FP-003",
    description: "PVC Gumboots designed for industrial, commercial and workplace safety applications. Waterproof PVC protection.",
    features: [
      "Waterproof PVC",
      "Slip resistant",
      "Easy to clean",
      "Durable"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "GumGuard",
    warranty: "1 year",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-004",
    name: "Safety Shoes",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 6640,
    image: boots,
    images: [boots],
    stock: 22,
    featured: false,
    rating: 4.4,
    reviews: 56,
    sku: "FP-004",
    description: "Safety Shoes designed for industrial, commercial and workplace safety applications. Lightweight safety footwear.",
    features: [
      "Lightweight design",
      "Steel toe protection",
      "Comfortable fit",
      "Slip resistant"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "SafeStep",
    warranty: "1 year",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-005",
    name: "Slip Resistant Shoes",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 3532,
    image: boots,
    images: [boots],
    stock: 105,
    featured: false,
    rating: 4.6,
    reviews: 67,
    sku: "FP-005",
    description: "Slip Resistant Shoes designed for industrial, commercial and workplace safety applications. Maximum slip resistance.",
    features: [
      "Maximum slip resistance",
      "Comfortable fit",
      "Durable construction",
      "Steel toe option"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "GripPro",
    warranty: "1 year",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-006",
    name: "ESD Safety Shoes",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 6431,
    image: boots,
    images: [boots],
    stock: 235,
    featured: false,
    rating: 4.7,
    reviews: 45,
    sku: "FP-006",
    description: "ESD Safety Shoes designed for industrial, commercial and workplace safety applications. Electrostatic discharge protection.",
    features: [
      "ESD protection",
      "Comfortable fit",
      "Steel toe",
      "Slip resistant"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "ESDSafe",
    warranty: "1 year",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-007",
    name: "Rigger Boots",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 431,
    image: boots,
    images: [boots],
    stock: 134,
    featured: true,
    rating: 4.8,
    reviews: 89,
    sku: "FP-007",
    description: "Rigger Boots designed for industrial, commercial and workplace safety applications. Heavy-duty rigger style.",
    features: [
      "Rigger style",
      "Steel toe",
      "Slip resistant",
      "Durable construction"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "RiggerPro",
    warranty: "2 years",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-008",
    name: "Hiker Safety Boots",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 6020,
    image: boots,
    images: [boots],
    stock: 172,
    featured: false,
    rating: 4.5,
    reviews: 56,
    sku: "FP-008",
    description: "Hiker Safety Boots designed for industrial, commercial and workplace safety applications. Hiker style safety boots.",
    features: [
      "Hiker style",
      "Steel toe",
      "Slip resistant",
      "Comfortable fit"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "HikeSafe",
    warranty: "2 years",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-009",
    name: "Metatarsal Boots",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 4556,
    image: boots,
    images: [boots],
    stock: 155,
    featured: false,
    rating: 4.9,
    reviews: 34,
    sku: "FP-009",
    description: "Metatarsal Boots designed for industrial, commercial and workplace safety applications. Extended metatarsal protection.",
    features: [
      "Metatarsal protection",
      "Steel toe",
      "Slip resistant",
      "Durable"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "MetaGuard",
    warranty: "2 years",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-010",
    name: "Overshoes",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 5702,
    image: boots,
    images: [boots],
    stock: 212,
    featured: true,
    rating: 4.3,
    reviews: 45,
    sku: "FP-010",
    description: "Overshoes designed for industrial, commercial and workplace safety applications. Easy slip-on protection.",
    features: [
      "Easy slip-on",
      "Slip resistant",
      "Durable",
      "Comfortable"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "OverGuard",
    warranty: "1 year",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-011",
    name: "Waterproof Safety Boots",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 477,
    image: boots,
    images: [boots],
    stock: 131,
    featured: true,
    rating: 4.6,
    reviews: 67,
    sku: "FP-011",
    description: "Waterproof Safety Boots designed for industrial, commercial and workplace safety applications. Waterproof protection.",
    features: [
      "Waterproof",
      "Steel toe",
      "Slip resistant",
      "Comfortable"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "WaterSafe",
    warranty: "2 years",
    certifications: ["EN ISO 20345"]
  },
  {
    id: "fp-012",
    name: "Industrial Gumboots",
    category: "Foot Protection",
    subcategory: "Safety Boots",
    price: 8369,
    image: boots,
    images: [boots],
    stock: 52,
    featured: true,
    rating: 4.7,
    reviews: 56,
    sku: "FP-012",
    description: "Industrial Gumboots designed for industrial, commercial and workplace safety applications. Heavy-duty industrial boots.",
    features: [
      "Heavy-duty",
      "Steel toe",
      "Slip resistant",
      "Waterproof"
    ],
    specs: [
      { label: "Standard", value: "EN ISO 20345" },
      { label: "Toe", value: "Steel" }
    ],
    brand: "IndusGum",
    warranty: "2 years",
    certifications: ["EN ISO 20345"]
  },

  // ===== RESPIRATORY PROTECTION =====
  {
    id: "rp-001",
    name: "N95 Face Mask",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 2493,
    image: respirator,
    images: [respirator],
    stock: 95,
    featured: true,
    rating: 4.5,
    reviews: 123,
    sku: "RP-001",
    description: "N95 Face Mask designed for industrial, commercial and workplace safety applications. NIOSH N95 certified protection.",
    features: [
      "N95 certified",
      "95% filtration",
      "Comfortable fit",
      "Adjustable nose clip"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "RespireSafe",
    warranty: "2 years",
    certifications: ["NIOSH N95"]
  },
  {
    id: "rp-002",
    name: "KN95 Face Mask",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 4178,
    image: respirator,
    images: [respirator],
    stock: 123,
    featured: false,
    rating: 4.4,
    reviews: 89,
    sku: "RP-002",
    description: "KN95 Face Mask designed for industrial, commercial and workplace safety applications. KN95 certified protection.",
    features: [
      "KN95 certified",
      "95% filtration",
      "Comfortable fit",
      "Ear loops"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "RespireSafe",
    warranty: "2 years",
    certifications: ["KN95"]
  },
  {
    id: "rp-003",
    name: "Dust Mask",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 7433,
    image: respirator,
    images: [respirator],
    stock: 52,
    featured: false,
    rating: 4.2,
    reviews: 56,
    sku: "RP-003",
    description: "Dust Mask designed for industrial, commercial and workplace safety applications. Basic dust protection.",
    features: [
      "Dust protection",
      "Comfortable fit",
      "Lightweight",
      "Cost-effective"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "DustGuard",
    warranty: "1 year",
    certifications: ["EN149"]
  },
  {
    id: "rp-004",
    name: "FFP2 Respirator",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 7730,
    image: respirator,
    images: [respirator],
    stock: 130,
    featured: true,
    rating: 4.7,
    reviews: 78,
    sku: "RP-004",
    description: "FFP2 Respirator designed for industrial, commercial and workplace safety applications. European standard protection.",
    features: [
      "FFP2 certified",
      "95% filtration",
      "Comfortable fit",
      "Adjustable strap"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "RespirePro",
    warranty: "2 years",
    certifications: ["EN149"]
  },
  {
    id: "rp-005",
    name: "FFP3 Respirator",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 3849,
    image: respirator,
    images: [respirator],
    stock: 220,
    featured: false,
    rating: 4.8,
    reviews: 67,
    sku: "RP-005",
    description: "FFP3 Respirator designed for industrial, commercial and workplace safety applications. Maximum filtration protection.",
    features: [
      "FFP3 certified",
      "99% filtration",
      "Comfortable fit",
      "Adjustable strap"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "RespirePro",
    warranty: "2 years",
    certifications: ["EN149"]
  },
  {
    id: "rp-006",
    name: "Half Face Respirator",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 2384,
    image: respirator,
    images: [respirator],
    stock: 45,
    featured: false,
    rating: 4.6,
    reviews: 45,
    sku: "RP-006",
    description: "Half Face Respirator designed for industrial, commercial and workplace safety applications. Reusable respirator.",
    features: [
      "Reusable",
      "Replaceable filters",
      "Comfortable fit",
      "Adjustable strap"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "RespirePro",
    warranty: "3 years",
    certifications: ["EN149"]
  },
  {
    id: "rp-007",
    name: "Full Face Respirator",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 4920,
    image: respirator,
    images: [respirator],
    stock: 120,
    featured: false,
    rating: 4.9,
    reviews: 56,
    sku: "RP-007",
    description: "Full Face Respirator designed for industrial, commercial and workplace safety applications. Complete face and respiratory protection.",
    features: [
      "Full face protection",
      "Replaceable filters",
      "Comfortable seal",
      "Adjustable strap"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "RespirePro",
    warranty: "3 years",
    certifications: ["EN149"]
  },
  {
    id: "rp-008",
    name: "Organic Vapour Filter",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 8004,
    image: respirator,
    images: [respirator],
    stock: 21,
    featured: true,
    rating: 4.7,
    reviews: 34,
    sku: "RP-008",
    description: "Organic Vapour Filter designed for industrial, commercial and workplace safety applications. Protection against organic vapors.",
    features: [
      "Organic vapor protection",
      "Replaceable",
      "Easy to install",
      "Compatible with respirators"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "FilterPro",
    warranty: "1 year",
    certifications: ["EN149"]
  },
  {
    id: "rp-009",
    name: "P100 Filter",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 4503,
    image: respirator,
    images: [respirator],
    stock: 222,
    featured: false,
    rating: 4.8,
    reviews: 45,
    sku: "RP-009",
    description: "P100 Filter designed for industrial, commercial and workplace safety applications. Maximum particle filtration.",
    features: [
      "P100 certified",
      "99.9% filtration",
      "Replaceable",
      "Easy to install"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "FilterPro",
    warranty: "1 year",
    certifications: ["NIOSH P100"]
  },
  {
    id: "rp-010",
    name: "Powered Air Respirator",
    category: "Respiratory Protection",
    subcategory: "Respirators",
    price: 1978,
    image: respirator,
    images: [respirator],
    stock: 184,
    featured: true,
    rating: 4.9,
    reviews: 67,
    sku: "RP-010",
    description: "Powered Air Respirator designed for industrial, commercial and workplace safety applications. Active air supply system.",
    features: [
      "Powered air supply",
      "Battery operated",
      "Comfortable fit",
      "Replaceable filters"
    ],
    specs: [
      { label: "Filter", value: "P2" },
      { label: "Standard", value: "EN149" }
    ],
    brand: "PowerAir",
    warranty: "3 years",
    certifications: ["EN149"]
  },

  // ===== SAFETY EQUIPMENT =====
  {
    id: "se-001",
    name: "6kg ABC Fire Extinguisher",
    category: "Safety Equipment",
    subcategory: "Safety Equipment",
    price: 1123,
    image: extinguisher,
    images: [extinguisher],
    stock: 124,
    featured: true,
    rating: 4.8,
    reviews: 89,
    sku: "SE-001",
    description: "6kg ABC Fire Extinguisher designed for industrial, commercial and workplace safety applications. Multiple fire class protection.",
    features: [
      "ABC fire rating",
      "Pressure gauge",
      "Mounting bracket",
      "Tamper seal"
    ],
    specs: [
      { label: "Certification", value: "KEBS Approved" },
      { label: "Warranty", value: "1 Year" }
    ],
    brand: "FireShield",
    warranty: "5 years",
    certifications: ["KEBS", "EN3"]
  },
  {
    id: "se-002",
    name: "9kg ABC Fire Extinguisher",
    category: "Safety Equipment",
    subcategory: "Safety Equipment",
    price: 3558,
    image: extinguisher,
    images: [extinguisher],
    stock: 237,
    featured: false,
    rating: 4.7,
    reviews: 67,
    sku: "SE-002",
    description: "9kg ABC Fire Extinguisher designed for industrial, commercial and workplace safety applications. Larger capacity extinguisher.",
    features: [
      "ABC fire rating",
      "Pressure gauge",
      "Mounting bracket",
      "Tamper seal"
    ],
    specs: [
      { label: "Certification", value: "KEBS Approved" },
      { label: "Warranty", value: "1 Year" }
    ],
    brand: "FireShield",
    warranty: "5 years",
    certifications: ["KEBS", "EN3"]
  },
  {
    id: "se-003",
    name: "CO2 Fire Extinguisher",
    category: "Safety Equipment",
    subcategory: "Safety Equipment",
    price: 7122,
    image: extinguisher,
    images: [extinguisher],
    stock: 57,
    featured: false,
    rating: 4.6,
    reviews: 45,
    sku: "SE-003",
    description: "CO2 Fire Extinguisher designed for industrial, commercial and workplace safety applications. Electrical fire protection.",
    features: [
      "CO2 extinguishing agent",
      "Electrical fire safe",
      "Clean extinguishing",
      "No residue"
    ],
    specs: [
      { label: "Certification", value: "KEBS Approved" },
      { label: "Warranty", value: "1 Year" }
    ],
    brand: "FireShield",
    warranty: "5 years",
    certifications: ["KEBS", "EN3"]
  },
  {
    id: "se-004",
    name: "Foam Fire Extinguisher",
    category: "Safety Equipment",
    subcategory: "Safety Equipment",
    price: 6772,
    image: extinguisher,
    images: [extinguisher],
    stock: 188,
    featured: true,
    rating: 4.5,
    reviews: 56,
    sku: "SE-004",
    description: "Foam Fire Extinguisher designed for industrial, commercial and workplace safety applications. Liquid fire protection.",
    features: [
      "Foam extinguishing agent",
      "Class A and B fires",
      "Effective on liquids",
      "Quick discharge"
    ],
    specs: [
      { label: "Certification", value: "KEBS Approved" },
      { label: "Warranty", value: "1 Year" }
    ],
    brand: "FireShield",
    warranty: "5 years",
    certifications: ["KEBS", "EN3"]
  },
  {
    id: "se-005",
    name: "Fire Blanket",
    category: "Safety Equipment",
    subcategory: "Safety Equipment",
    price: 4431,
    image: extinguisher,
    images: [extinguisher],
    stock: 203,
    featured: true,
    rating: 4.4,
    reviews: 78,
    sku: "SE-005",
    description: "Fire Blanket designed for industrial, commercial and workplace safety applications. Quick fire suppression.",
    features: [
      "Quick fire suppression",
      "Easy to use",
      "Multi-purpose",
      "Durable material"
    ],
    specs: [
      { label: "Certification", value: "KEBS Approved" },
      { label: "Warranty", value: "1 Year" }
    ],
    brand: "FireShield",
    warranty: "2 years",
    certifications: ["KEBS", "EN1869"]
  },
  {
    id: "se-006",
    name: "First Aid Kit",
    category: "Safety Equipment",
    subcategory: "Safety Equipment",
    price: 4942,
    image: extinguisher,
    images: [extinguisher],
    stock: 94,
    featured: true,
    rating: 4.6,
    reviews: 89,
    sku: "SE-006",
    description: "First Aid Kit designed for industrial, commercial and workplace safety applications. Complete first aid supplies.",
    features: [
      "Complete first aid set",
      "Organized compartments",
      "Easy to carry",
      "Waterproof case"
    ],
    specs: [
      { label: "Certification", value: "KEBS Approved" },
      { label: "Warranty", value: "1 Year" }
    ],
    brand: "MediSafe",
    warranty: "2 years",
    certifications: ["KEBS"]
  },
  {
    id: "se-007",
    name: "Traffic Cone",
    category: "Safety Equipment",
    subcategory: "Safety Equipment",
    price: 5293,
    image: extinguisher,
    images: [extinguisher],
    stock: 169,
    featured: true,
    rating: 4.3,
    reviews: 45,
    sku: "SE-007",
    description: "Traffic Cone designed for industrial, commercial and workplace safety applications. High visibility traffic control.",
    features: [
      "High visibility orange",
      "Reflective strips",
      "Stackable design",
      "Heavy-duty base"
    ],
    specs: [
      { label: "Certification", value: "KEBS Approved" },
      { label: "Warranty", value: "1 Year" }
    ],
    brand: "TrafficSafe",
    warranty: "2 years",
    certifications: ["KEBS"]
  },
  {
    id: "se-008",
    name: "Smoke Detector",
    category: "Safety Equipment",
    subcategory: "Safety Equipment",
    price: 5599,
    image: extinguisher,
    images: [extinguisher],
    stock: 92,
    featured: false,
    rating: 4.7,
    reviews: 67,
    sku: "SE-008",
    description: "Smoke Detector designed for industrial, commercial and workplace safety applications. Early fire detection.",
    features: [
      "Early fire detection",
      "Battery operated",
      "Easy installation",
      "Alarm system"
    ],
    specs: [
      { label: "Certification", value: "KEBS Approved" },
      { label: "Warranty", value: "1 Year" }
    ],
    brand: "FireShield",
    warranty: "3 years",
    certifications: ["KEBS", "EN14604"]
  }
];

/* -------------------------------------------------------------------------- */
/*                                 Formatting                                 */
/* -------------------------------------------------------------------------- */

export const formatKES = formatProductPrice;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find((product) => product.id === id);
};


export const getProductsByCategory = (category: Category): Product[] => {
  return PRODUCTS.filter((product) => product.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return PRODUCTS.filter((product) => product.featured);
};

export const getNewArrivals = (count: number = 4): Product[] => {
  return PRODUCTS.slice(-count);
};

export const getProductsByPriceRange = (min: number, max: number): Product[] => {
  return PRODUCTS.filter(
    (product) => product.price >= min && product.price <= max
  );
};

export const searchProducts = (query: string): Product[] => {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter((product) =>
    [product.name, product.category, product.subcategory, product.description]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
};

export const getRelatedProducts = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  return PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, limit);
};

export const getCategoriesWithCount = () => {
  return CATEGORIES.map((category) => ({
    name: category,
    count: PRODUCTS.filter((product) => product.category === category).length,
  }));
};

export const getProductCount = (): number => {
  return PRODUCTS.length;
};

export const getMinPrice = (): number => {
  return Math.min(...PRODUCTS.map((p) => p.price));
};

export const getMaxPrice = (): number => {
  return Math.max(...PRODUCTS.map((p) => p.price));
};

export const getCategoriesWithProducts = () => {
  return CATEGORIES.map((category) => ({
    category,
    products: PRODUCTS.filter((product) => product.category === category),
    count: PRODUCTS.filter((product) => product.category === category).length,
  }));
};

export const getProductsBySubcategory = (subcategory: string): Product[] => {
  return PRODUCTS.filter((product) =>
    product.subcategory.toLowerCase().includes(subcategory.toLowerCase())
  );
};

export const getProductStats = () => {
  return {
    total: getProductCount(),
    categories: CATEGORIES.length,
    featured: PRODUCTS.filter((p) => p.featured).length,
    minPrice: getMinPrice(),
    maxPrice: getMaxPrice(),
    outOfStock: PRODUCTS.filter((p) => p.stock === 0).length,
    lowStock: PRODUCTS.filter((p) => p.stock > 0 && p.stock < 10).length,
  };
};

// Default export
export default {
  PRODUCTS,
  categories,
  CATEGORIES,
  formatKES,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getNewArrivals,
  getProductsByPriceRange,
  searchProducts,
  getRelatedProducts,
  getCategoriesWithCount,
  getProductCount,
  getMinPrice,
  getMaxPrice,
  getCategoriesWithProducts,
  getProductsBySubcategory,
  getProductStats,
};