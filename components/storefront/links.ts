import type { IconType } from "react-icons";

import {
  FaHardHat,
  FaEye,
  FaAssistiveListeningSystems,
  FaShieldAlt,
  FaTshirt,
  FaHands,
  FaShoePrints,
  FaWind,
  FaFireExtinguisher,
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";

import type { PortalSettings } from "@/services/sentinel/settings.service";

export type DropdownItem = {
  label: string;
  href: string;
  description?: string;
  icon?: IconType;
};

export type NavLink = {
  label: string;
  href: string;
  active?: boolean;
  dropdown?: DropdownItem[];
};

export interface LinkItem {
  label: string;
  href: string;
}

export type FooterLink = LinkItem;
export type CategoryLink = LinkItem;

export interface SocialLink {
  label: string;
  href: string;
  icon: IconType;
}

export interface ContactInfo {
  value: string;
  href?: string;
  icon: IconType;
}

export function createCategoryLink(slug: string): string {
  return `/categories/${slug}`;
}


const CATEGORY_ICON_MAP: Record<string, IconType> = {
  "Head Protection": FaHardHat,
  "Eye Protection": FaEye,
  "Ear Protection": FaAssistiveListeningSystems,
  "Body Protection": FaShieldAlt,
  "Protective Clothing": FaTshirt,
  "Hand Protection": FaHands,
  "Foot Protection": FaShoePrints,
  "Respiratory Protection": FaWind,
  "Safety Equipment": FaFireExtinguisher,
};

const DEFAULT_CATEGORY_ICON: IconType = FaShieldAlt;

export function getCategoryIcon(category: string): IconType {
  return CATEGORY_ICON_MAP[category] ?? DEFAULT_CATEGORY_ICON;
}

export function toDropdownItems(
  categories: { name: string; slug: string }[],
): DropdownItem[] {
  return categories.map((category) => ({
    label: category.name,
    href: createCategoryLink(category.slug),
    icon: getCategoryIcon(category.name),
  }));
}

/**
 * Converts API category records into the shape the footer's category
 * list needs.
 */
export function toCategoryLinks(
  categories: { name: string; slug: string }[],
): CategoryLink[] {
  return categories.map((category) => ({
    label: category.name,
    href: createCategoryLink(category.slug),
  }));
}

export const navLinks: NavLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/shop",
    dropdown: [
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Featured Products", href: "/featured" },
    ],
  },
  {
    label: "Categories",
    href: "/categories",
    // dropdown is populated at runtime in Navbar.tsx from categoryService,
    // since categories now live in the DB, not here.
  },
  {
    label: "Services",
    href: "/services",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

/**
 * Corporate / bulk purchasing entry point, surfaced in the top utility
 * bar and the homepage hero. Routes to the existing contact form with
 * the subject pre-filled — there's no dedicated bulk-order flow yet.
 */
export const corporateLink: LinkItem = {
  label: "Corporate / Bulk Orders",
  href: "/contact?subject=Corporate%20%2F%20Bulk%20Order",
};

export const requestQuoteLink: LinkItem = {
  label: "Request a Quote",
  href: "/contact?subject=Request%20a%20Quote",
};

export const quickLinks: FooterLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "Categories",
    href: "/categories",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

export const shopLinks: FooterLink[] = [
  {
    label: "All Products",
    href: "/shop",
  },
  {
    label: "Categories",
    href: "/categories",
  },
  {
    label: "New Arrivals",
    href: "/new-arrivals",
  },
  {
    label: "Featured Products",
    href: "/featured",
  },
];

export const businessLinks: FooterLink[] = [
  {
    label: "Corporate Orders",
    href: "/contact?subject=Corporate%20Order",
  },
  {
    label: "Bulk Purchasing",
    href: "/contact?subject=Bulk%20Purchasing",
  },
  {
    label: "Request a Quote",
    href: "/contact?subject=Request%20a%20Quote",
  },
];

/**
 * Built from live settings rather than a static constant, so editing
 * Sentinel → Settings updates the footer immediately. Call with the
 * current `useSettings().settings`.
 */
export function getContactInfo(settings: Pick<PortalSettings, "contactPhone" | "contactEmail" | "address">): ContactInfo[] {
  return [
    {
      icon: FaPhone,
      value: settings.contactPhone,
      href: `tel:${settings.contactPhone}`,
    },
    {
      icon: FaEnvelope,
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
    },
    {
      icon: FaMapMarkerAlt,
      value: settings.address,
    },
  ];
}

export const legalLinks: FooterLink[] = [
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms",
  },
  {
    label: "Shipping Policy",
    href: "/",
  },
];

/** Same rationale as `getContactInfo` — sourced from live settings, not a constant. */
export function getSocialLinks(social: PortalSettings["social"]): SocialLink[] {
  return [
    {
      label: "Facebook",
      href: social.facebook,
      icon: FaFacebook,
    },
    {
      label: "Instagram",
      href: social.instagram,
      icon: FaInstagram,
    },
    {
      label: "LinkedIn",
      href: social.linkedin,
      icon: FaLinkedinIn,
    },
  ].filter((link) => link.href.trim().length > 0);
}

export const containerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.12,
    },
  },
};

export const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};