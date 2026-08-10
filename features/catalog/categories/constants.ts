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