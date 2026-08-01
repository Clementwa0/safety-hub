import { FaEnvelope } from "react-icons/fa6";
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { COMPANY } from "@/lib/constants";

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const contactCards = [
  {
    icon: FaPhoneAlt,
    iconBg: "bg-blue-900",
    iconColor: "text-blue-600",
    title: "Call Us",
    lines: [COMPANY.phone],
    sub: "Mon - Sat: 8:00 AM - 6:00 PM",
  },
  {
    icon: FaWhatsapp,
    iconBg: "bg-green-500",
    iconColor: "text-green-600",
    title: "WhatsApp",
    lines: [COMPANY.whatsapp],
    sub: "Chat with us on WhatsApp anytime!",
  },
  {
    icon:FaEnvelope,
    iconBg: "bg-yellow-500",
    iconColor: "text-red-600",
    title: "Email Us",
    lines: [COMPANY.email],
    sub: "We reply within 24 hours",
  },
  {
    icon: FaMapMarkerAlt,
    iconBg: "bg-green-500",
    iconColor: "text-orange-600",
    title: "Visit Us",
    lines: [COMPANY.address],
    sub: "Mon - Sat: 8:00 AM - 6:00 PM",
  },
];

export const navLinks = [
  { label: "Home", href: "#" },
  { label: "Products", href: "#", hasDropdown: true },
  { label: "Categories", href: "#", hasDropdown: true },
  { label: "Services", href: "#" },
  { label: "About Us", href: "#" },
  { label: "Contact Us", href: "#", active: true },
];

export const quickLinks = ["Home", "Products", "Categories", "Services", "About Us", "Contact Us"];

export const footerCategories = [
  "Head Protection",
  "Eye Protection",
  "Hearing Protection",
  "Respiratory Protection",
  "Workwear",
  "View All Categories",
];
