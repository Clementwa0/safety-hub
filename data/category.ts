import type { IconType } from "react-icons";
import { FaAnchor, FaCross, FaEarListen, FaEye, FaFireFlameCurved, FaGlobe, FaHand, FaShieldHalved, FaShirt, FaWind, FaShoePrints } from "react-icons/fa6";

export interface Category {
  id: string;
  label: string;
  title: string;
  description: string;
  count: number;
  image: string;
  icon: IconType;
}

export const categories: Category[] = [
  {
    id: "all",
    label: "All Categories",
    title: "All Categories",
    description: "Browse every HSE product category.",
    count: 152,
    image: "",
    icon: FaGlobe,
  },
  {
    id: "head",
    label: "Head Protection",
    title: "Head Protection",
    description: "Helmets, hard hats and head safety gear.",
    count: 18,
    image:
      "https://images.pexels.com/photos/3846517/pexels-photo-3846517.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaShieldHalved,
  },
  {
    id: "eye",
    label: "Eye Protection",
    title: "Eye Protection",
    description: "Safety glasses, goggles and face shields.",
    count: 24,
    image:
      "https://images.pexels.com/photos/8961251/pexels-photo-8961251.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaEye,
  },
  {
    id: "hearing",
    label: "Hearing Protection",
    title: "Hearing Protection",
    description: "Ear muffs, ear plugs and hearing protection.",
    count: 15,
    image:
      "https://images.pexels.com/photos/3846022/pexels-photo-3846022.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaEarListen,
  },
  {
    id: "respiratory",
    label: "Respiratory Protection",
    title: "Respiratory Protection",
    description: "Masks, respirators and breathing protection.",
    count: 22,
    image:
      "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaWind,
  },
  {
    id: "hand",
    label: "Hand Protection",
    title: "Hand Protection",
    description: "Safety gloves and hand protection equipment.",
    count: 26,
    image:
      "https://images.pexels.com/photos/209230/pexels-photo-209230.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaHand,
  },
  {
    id: "foot",
    label: "Foot Protection",
    title: "Foot Protection",
    description: "Safety boots, shoes and protective footwear.",
    count: 20,
    image:
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaShoePrints,
  },
  {
    id: "workwear",
    label: "Workwear",
    title: "Workwear",
    description: "Protective clothing and work uniforms.",
    count: 12,
    image:
      "https://images.pexels.com/photos/1098365/pexels-photo-1098365.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaShirt,
  },
  {
    id: "fall",
    label: "Fall Protection",
    title: "Fall Protection",
    description: "Harnesses, lanyards and fall arrest systems.",
    count: 10,
    image:
      "https://images.pexels.com/photos/8961134/pexels-photo-8961134.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaAnchor,
  },
  {
    id: "fire",
    label: "Fire Safety",
    title: "Fire Safety",
    description: "Fire extinguishers and emergency equipment.",
    count: 13,
    image:
      "https://images.pexels.com/photos/5816291/pexels-photo-5816291.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaFireFlameCurved,
  },
  {
    id: "firstaid",
    label: "First Aid",
    title: "First Aid",
    description: "First aid kits and workplace medical supplies.",
    count: 9,
    image:
      "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: FaCross,
  },
];

/**
 * Used by CategoryGrid and [slug]/page.tsx
 * Excludes the "All Categories" entry.
 */
export const categoryCards = categories.filter(
  (category) => category.id !== "all"
);