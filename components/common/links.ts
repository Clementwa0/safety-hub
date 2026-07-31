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

import { COMPANY } from "@/lib/constants";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

export function createCategoryLink(category: string): string {
  return `/categories/${encodeURIComponent(category)}`;
}

/* -------------------------------------------------------------------------- */
/*                          Category Icon Lookup                              */
/* -------------------------------------------------------------------------- */
/*
 * Categories themselves now come from the API/DB (see categoryService),
 * not from a hardcoded list here. This map only supplies a nicer icon
 * for known category names when rendering the nav dropdown; anything
 * not in this map (e.g. a category added later in admin) still works,
 * it just falls back to a generic icon below.
 */

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

/**
 * Converts API category records (name + productCount, etc.) into the
 * shape the navbar dropdown needs. Pass whatever categoryService.list()
 * resolves to.
 */
export function toDropdownItems(
  categories: { name: string }[],
): DropdownItem[] {
  return categories.map((category) => ({
    label: category.name,
    href: createCategoryLink(category.name),
    icon: getCategoryIcon(category.name),
  }));
}

/**
 * Converts API category records into the shape the footer's category
 * list needs.
 */
export function toCategoryLinks(
  categories: { name: string }[],
): CategoryLink[] {
  return categories.map((category) => ({
    label: category.name,
    href: createCategoryLink(category.name),
  }));
}

/* -------------------------------------------------------------------------- */
/*                             Navigation Links                               */
/* -------------------------------------------------------------------------- */

export const navLinks: NavLink[] = [
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
    // dropdown is populated at runtime in Navbar.tsx from categoryService,
    // since categories now live in the DB, not here.
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

/* -------------------------------------------------------------------------- */
/*                                Footer Links                                */
/* -------------------------------------------------------------------------- */

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

export const contactInfo: ContactInfo[] = [
  {
    icon: FaPhone,
    value: COMPANY.phone,
    href: `tel:${COMPANY.phone}`,
  },
  {
    icon: FaEnvelope,
    value: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
  },
  {
    icon: FaMapMarkerAlt,
    value: COMPANY.address,
  },
];

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

/* -------------------------------------------------------------------------- */
/*                               Social Links                                 */
/* -------------------------------------------------------------------------- */

export const socialLinks: SocialLink[] = [
  {
    label: "Facebook",
    href: COMPANY.social.facebook,
    icon: FaFacebook,
  },
  {
    label: "Instagram",
    href: COMPANY.social.instagram,
    icon: FaInstagram,
  },
  {
    label: "LinkedIn",
    href: COMPANY.social.linkedin,
    icon: FaLinkedinIn,
  },
];

/* -------------------------------------------------------------------------- */
/*                                Animations                                  */
/* -------------------------------------------------------------------------- */

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