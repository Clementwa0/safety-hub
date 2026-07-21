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

import { COMPANY } from "@/lib/constants";

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

export function createCategoryLink(_: string): string {
  return "/";
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
  href: "/", // Redirect all category dropdown items to Home
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
    href: "/s", // Redirect to Home
  },
  {
    label: "Categories",
    href: "/c", // Redirect to Home
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

export const quickLinks: FooterLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/s", // Redirect to Home
  },
  {
    label: "Categories",
    href: "/c", // Redirect to Home
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
    href: "/", // Redirect to Home
  },
];

export const categories: CategoryLink[] = categoryItems.map((item) => ({
  label: item.label,
  href: "/", // Redirect to Home
}));

/* -------------------------------------------------------------------------- */
/*                               Social Links                                 */
/* -------------------------------------------------------------------------- */

export const socialLinks: SocialLink[] = [
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