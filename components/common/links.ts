import type { ComponentType } from "react";
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

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type DropdownItem = {
  label: string;
  href: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
};

export type NavLink = {
  label: string;
  href: string;
  active?: boolean;
  dropdown?: DropdownItem[];
};

export interface FooterLink {
  label: string;
  href: string;
}

export interface CategoryLink {
  label: string;
  href: string;
}

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
/*                               Category Data                                */
/* -------------------------------------------------------------------------- */

const categoryItems = [
  {
    label: "Head Protection",
    description: "Safety helmets, bump caps & face shields",
    icon: FaHardHat,
  },
  {
    label: "Eye Protection",
    description: "Safety goggles & glasses",
    icon: FaEye,
  },
  {
    label: "Ear Protection",
    description: "Ear plugs & ear muffs",
    icon: FaAssistiveListeningSystems,
  },
  {
    label: "Body Protection",
    description: "Harnesses & fall protection",
    icon: FaShieldAlt,
  },
  {
    label: "Protective Clothing",
    description: "Coveralls, jackets & reflective wear",
    icon: FaTshirt,
  },
  {
    label: "Hand Protection",
    description: "Work, welding & chemical gloves",
    icon: FaHands,
  },
  {
    label: "Foot Protection",
    description: "Safety boots & shoes",
    icon: FaShoePrints,
  },
  {
    label: "Respiratory Protection",
    description: "Masks & respirators",
    icon: FaWind,
  },
  {
    label: "Safety Equipment",
    description: "Fire extinguishers & safety accessories",
    icon: FaFireExtinguisher,
  },
];

export const categoriesMenu: DropdownItem[] = categoryItems.map((item) => ({
  ...item,
  href: createCategoryLink(item.label),
}));

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
    dropdown: categoriesMenu,
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

export const quickLinks = [
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

export const contactInfo = [
  {
    icon: FaPhone,
    value: "+254 700 000 000",
    href: "tel:+254700000000",
  },
  {
    icon: FaEnvelope,
    value: "info@hsehub.co.ke",
    href: "mailto:info@hsehub.co.ke",
  },
  {
    icon: FaMapMarkerAlt,
    value: "Nairobi, Kenya",
  },
];

export const legalLinks = [
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
    href: "/shipping",
  },
];

export const categories: CategoryLink[] = categoryItems.map((item) => ({
  label: item.label,
  href: createCategoryLink(item.label),
}));

/* -------------------------------------------------------------------------- */
/*                               Social Links                                 */
/* -------------------------------------------------------------------------- */

export const socialLinks = [
  {
    icon: FaFacebook,
    href: "https://facebook.com",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    href: "https://instagram.com",
    label: "Instagram",
  },
  {
    icon: FaLinkedinIn,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
  {
    icon: FaYoutube,
    href: "https://youtube.com",
    label: "YouTube",
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