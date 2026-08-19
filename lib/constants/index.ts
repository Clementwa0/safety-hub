import { SortKey } from "@/types/storefront/shop";
import { FaDatabase, FaLock } from "react-icons/fa";
import { FaAward, FaEye, FaFileLines, FaShieldHalved, FaTruck, FaUsers } from "react-icons/fa6";

export const COMPANY = {
  name: "HSE Hub Limited",
  email: "info@example.com",
  phone: "0787894925",
  whatsapp: "0787894925",
  address: "Capital Mall - Utawala",


  social: {
    facebook: "https://facebook.com/your-page",
    instagram: "https://instagram.com/your-page",
    linkedin: "https://linkedin.com/company/your-company",
  },
};

export const PAGE_SIZE = 10;

export const STATS_CONFIG = [
  {
    key: "totalOrders",
    label: "Total",
    classes:
      "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40",
  },
  {
    key: "pending",
    label: "Pending",
    classes:
      "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30",
  },
  {
    key: "shipped",
    label: "Shipped",
    classes:
      "border-indigo-200 bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/30",
  },
  {
    key: "delivered",
    label: "Delivered",
    classes:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    classes:
      "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30",
  },
  {
    key: "revenue",
    label: "Revenue",
    classes:
      "border-violet-200 bg-violet-50 dark:border-violet-900/60 dark:bg-violet-950/30",
  },
] as const;

export const features = [
  {
    icon: FaShieldHalved,
    title: "Certified Products",
    description:
      "We supply certified PPE and industrial safety equipment that meet recognised quality and workplace safety standards.",
  },
  {
    icon: FaTruck,
    title: "Fast Delivery",
    description:
      "Reliable and timely delivery across Nairobi and nationwide for businesses, institutions and contractors.",
  },
  {
    icon: FaUsers,
    title: "Trusted Partner",
    description:
      "Serving construction companies, manufacturers, healthcare facilities, schools and government institutions.",
  },
  {
    icon: FaAward,
    title: "Expert Support",
    description:
      "Our experienced team helps you select the right safety solutions for every work environment.",
  },
];

export const values = [
  "High-Quality Safety Products",
  "Customer Satisfaction",
  "Reliable & Fast Delivery",
  "Competitive Pricing",
  "Professional Customer Support",
  "Long-Term Business Partnerships",
];

export const privacysections = [
  {
    id: "collect",
    icon: FaDatabase,
    number: "1.",
    title: "Information We Collect",
    description:
      "We collect various types of information to provide and improve our services.",
    items: [
      "Personal identification information (name, email address, phone number, company name)",
      "Order history and purchase information",
      "Communication preferences and feedback",
      "Website usage data and analytics",
      "Device and browser information",
    ],
  },
  {
    id: "use",
    icon: FaUsers,
    number: "2.",
    title: "How We Use Your Information",
    description:
      "Your information helps us deliver better products and services.",
    items: [
      "Process orders and deliver products",
      "Provide customer support and respond to inquiries",
      "Send order confirmations and updates",
      "Improve our products and services",
      "Send promotional communications (with your consent)",
    ],
  },
  {
    id: "security",
    icon: FaLock,
    number: "3.",
    title: "Information Security",
    description: "We implement robust security measures to protect your data.",
    items: [
      "Industry-standard encryption for data transmission",
      "Secure servers and firewalls",
      "Regular security audits and updates",
      "Limited employee access to personal information",
      "Secure payment processing via trusted partners",
    ],
  },
  {
    id: "sharing",
    icon: FaUsers,
    number: "4.",
    title: "Information Sharing",
    description: "We respect your privacy and limit information sharing.",
    items: [
      "We do not sell your personal information",
      "Shared with trusted service providers (delivery, payment processing)",
      "Required by law or legal process",
      "With your explicit consent",
    ],
  },
  {
    id: "rights",
    icon: FaEye,
    number: "5.",
    title: "Your Rights",
    description: "You have control over your personal information.",
    items: [
      "Access your personal information",
      "Correct inaccurate information",
      "Request deletion of your information",
      "Opt-out of marketing communications",
      "Data portability rights",
    ],
  },
  {
    id: "cookies",
    icon: FaFileLines,
    number: "6.",
    title: "Cookies & Tracking",
    description: "We use cookies to enhance your browsing experience.",
    items: [
      "Essential cookies for website functionality",
      "Analytics cookies for performance improvement",
      "Preference cookies for personalized experience",
      "You can control cookie settings in your browser",
    ],
  },
];
export const termssections = [
  {
    id: "acceptance",
    number: "1.",
    title: "Acceptance of Terms",
    description: "By using our website and services, you agree to these terms.",
    items: [
      "These Terms and Conditions govern your use of the HSE Hub Limited website and services",
      "By accessing or using our services, you agree to be bound by these terms",
      "If you disagree with any part of these terms, you may not use our services",
      "We reserve the right to update these terms at any time",
    ],
  },
  {
    id: "products",
    number: "2.",
    title: "Products and Pricing",
    description: "Information about our products, pricing, and availability.",
    items: [
      "All product descriptions and specifications are provided for informational purposes",
      "Prices are subject to change without prior notice",
      "We strive to display accurate product information and images",
      "Product availability is subject to stock levels",
      "We reserve the right to limit quantities of any product",
    ],
  },
  {
    id: "orders",
    number: "3.",
    title: "Orders and Payment",
    description: "How orders are placed, processed, and paid for.",
    items: [
      "Orders are confirmed upon receipt of payment",
      "We accept payments via M-Pesa, bank transfer, and other specified methods",
      "All prices are in Kenyan Shillings (KES)",
      "Order confirmation emails will be sent upon successful payment",
      "We reserve the right to cancel any order at our discretion",
    ],
  },
  {
    id: "shipping",
    number: "4.",
    title: "Shipping and Delivery",
    description: "Our shipping policies and delivery timelines.",
    items: [
      "We deliver to all counties across Kenya",
      "Delivery timelines are estimates and may vary",
      "Shipping costs are calculated at checkout",
      "Orders are processed within 1-2 business days",
      "Tracking information is provided for all shipments",
    ],
  },
  {
    id: "returns",
    number: "5.",
    title: "Returns and Refunds",
    description: "Our return and refund policies.",
    items: [
      "Returns must be initiated within 7 days of delivery",
      "Products must be in original condition with packaging",
      "Refunds are processed within 5-10 business days",
      "Return shipping costs are the responsibility of the customer",
      "Certain products may not be eligible for return",
    ],
  },
  {
    id: "warranty",
    number: "6.",
    title: "Warranty and Liability",
    description: "Warranty coverage and limitation of liability.",
    items: [
      "Products come with manufacturer warranties where applicable",
      "Warranty periods vary by product type",
      "We are not liable for damages from misuse or improper handling",
      "Our liability is limited to the purchase price of the product",
      "We provide products 'as is' with all faults",
    ],
  },
  {
    id: "account",
    number: "7.",
    title: "User Accounts",
    description: "Account registration and responsibilities.",
    items: [
      "You are responsible for maintaining account security",
      "You must provide accurate and complete information",
      "You are responsible for all activities under your account",
      "We reserve the right to suspend or terminate accounts",
      "Accounts found in violation of terms may be terminated",
    ],
  },
  {
    id: "intellectual",
    number: "8.",
    title: "Intellectual Property",
    description: "Ownership of content and intellectual property.",
    items: [
      "All content on this website is our property",
      "You may not reproduce or distribute our content without permission",
      "Trademarks and logos are owned by HSE Hub Limited",
      "Unauthorized use of content is prohibited",
      "You retain rights to content you submit to us",
    ],
  },
];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "az", label: "Name: A-Z" },
];

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Head Protection":
    "Certified helmets and hard hats engineered to protect against impact, penetration, and falling objects on site.",

  "Eye Protection":
    "Safety glasses and goggles built to shield against debris, dust, splashes, and radiation hazards.",

  "Ear Protection":
    "Earmuffs and plugs rated to reduce noise exposure in high-decibel industrial environments.",

  "Body Protection":
    "Harnesses and fall-arrest systems designed for height work, rescue, and confined-space safety.",

  "Protective Clothing":
    "Hi-vis and chemical-resistant workwear that keeps crews visible, dry, and protected on shift.",

  "Hand Protection":
    "Cut-, chemical-, and abrasion-resistant gloves for tasks that put hands on the front line.",

  "Foot Protection":
    "Safety boots and shoes built for impact resistance, grip, and all-day comfort on site.",

  "Respiratory Protection":
    "Masks and respirators rated to filter dust, fumes, and airborne contaminants.",

  "Safety Equipment":
    "General-purpose safety gear and site equipment for everyday workplace protection.",
};

export const CATEGORY_STANDARDS: Record<string, string[]> = {
  "Head Protection": ["EN397", "ANSI Z89.1", "ISO 45001"],

  "Eye Protection": ["EN166", "ANSI Z87.1", "ISO 4007"],

  "Ear Protection": ["EN352", "ANSI S3.19", "ISO 4869"],

  "Body Protection": ["EN361", "ANSI Z359", "ISO 10333"],

  "Protective Clothing": [
    "EN ISO 20471",
    "ANSI 107",
    "ISO 13688",
  ],

  "Hand Protection": ["EN388", "ANSI 105", "ISO 13997"],

  "Foot Protection": [
    "EN ISO 20345",
    "ANSI Z41",
    "ISO 20344",
  ],

  "Respiratory Protection": [
    "EN149",
    "ANSI Z88.2",
    "ISO 16900",
  ],

  "Safety Equipment": [
    "EN3",
    "ANSI/UL 299",
    "ISO 7165",
  ],
};

export const CATEGORY_APPLICATIONS: Record<string, string[]> = {
  "Head Protection": [
    "Construction and heavy engineering",
    "Manufacturing and processing",
    "Mining and extraction",
  ],

  "Eye Protection": [
    "Welding and fabrication",
    "Laboratory work",
    "Woodworking and machining",
  ],

  "Ear Protection": [
    "Factory floors",
    "Construction sites",
    "Mining operations",
  ],

  "Body Protection": [
    "Height work",
    "Confined spaces",
    "Rescue operations",
  ],

  "Protective Clothing": [
    "Industrial work",
    "Chemical handling",
    "Fire fighting",
  ],

  "Hand Protection": [
    "Construction work",
    "Chemical handling",
    "Food processing",
  ],

  "Foot Protection": [
    "Construction sites",
    "Warehouse work",
    "Manufacturing plants",
  ],

  "Respiratory Protection": [
    "Dust environments",
    "Chemical plants",
    "Healthcare facilities",
  ],

  "Safety Equipment": [
    "Industrial sites",
    "Office buildings",
    "Public facilities",
  ],
};

export const DEFAULT_CATEGORY_DESCRIPTION =
  "Certified PPE built to keep your team protected, compliant, and comfortable on the job.";

export const DEFAULT_CATEGORY_STANDARDS = [
  "ISO 45001",
  "EN 397",
  "ANSI Z89.1",
];

export const DEFAULT_CATEGORY_APPLICATIONS = [
  "Industrial applications",
  "Workplace safety",
  "Site operations",
];

export function getCategoryDescription(category: string): string {
  return (
    CATEGORY_DESCRIPTIONS[category] ??
    DEFAULT_CATEGORY_DESCRIPTION
  );
}

export function getCategoryStandards(
  category: string
): string[] {
  return (
    CATEGORY_STANDARDS[category] ??
    DEFAULT_CATEGORY_STANDARDS
  );
}

export function getCategoryApplications(
  category: string
): string[] {
  return (
    CATEGORY_APPLICATIONS[category] ??
    DEFAULT_CATEGORY_APPLICATIONS
  );
}