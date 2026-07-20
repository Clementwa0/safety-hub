"use client";

import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { 
  FaHardHat, 
  FaEye, 
  FaTshirt, 
  FaHands, 
  FaShoePrints, 
  FaWind,
} from "react-icons/fa";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Ear, Shield } from "lucide-react";

// Category data
const categories = [
  {
    name: "Head Protection",
    description: "Safety helmets, bump caps & face shields",
    icon: FaHardHat,
    href: "/categories/head-protection",
    color: "from-blue-50 to-blue-100/50",
    iconColor: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    name: "Eye Protection",
    description: "Safety goggles & glasses",
    icon: FaEye,
    href: "/categories/eye-protection",
    color: "from-emerald-50 to-emerald-100/50",
    iconColor: "text-emerald-600",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Ear Protection",
    description: "Ear plugs & ear muffs",
    icon: Ear,
    href: "/categories/ear-protection",
    color: "from-purple-50 to-purple-100/50",
    iconColor: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    name: "Body Protection",
    description: "Harnesses & fall protection",
    icon: Shield,
    href: "/categories/body-protection",
    color: "from-rose-50 to-rose-100/50",
    iconColor: "text-rose-600",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  {
    name: "Protective Clothing",
    description: "Coveralls, jackets & reflective wear",
    icon: FaTshirt,
    href: "/categories/clothing",
    color: "from-amber-50 to-amber-100/50",
    iconColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    name: "Hand Protection",
    description: "Work, welding & chemical gloves",
    icon: FaHands,
    href: "/categories/hand-protection",
    color: "from-cyan-50 to-cyan-100/50",
    iconColor: "text-cyan-600",
    badgeColor: "bg-cyan-100 text-cyan-700",
  },
  {
    name: "Foot Protection",
    description: "Safety boots & shoes",
    icon: FaShoePrints,
    href: "/categories/foot-protection",
    color: "from-orange-50 to-orange-100/50",
    iconColor: "text-orange-600",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    name: "Respiratory Protection",
    description: "Masks & respirators",
    icon: FaWind,
    href: "/categories/respiratory-protection",
    color: "from-indigo-50 to-indigo-100/50",
    iconColor: "text-indigo-600",
    badgeColor: "bg-indigo-100 text-indigo-700",
  },
];

interface CategoryCardProps {
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  iconColor: string;
  badgeColor: string;
}

const CategoryCard = ({
  name,
  description,
  icon: Icon,
  href,
  color,
  iconColor,
  badgeColor,
}: CategoryCardProps) => {
  return (
    <Link href={href} className="group block h-full">
      <Card className={cn(
        "relative h-full overflow-hidden border border-gray-200/60 bg-white/80 transition-all duration-300",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-gray-300/60",
        "group-hover:shadow-lg"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br transition-all duration-300",
              color,
              "group-hover:scale-105 group-hover:shadow-md"
            )}>
              <Icon className={cn("h-7 w-7 transition-all duration-300", iconColor, "group-hover:scale-110")} />
            </div>
            <Badge 
              className={cn(
                "border-0 font-medium text-xs",
                badgeColor
              )}
            >
              Popular
            </Badge>
          </div>
          <CardTitle className="mt-3 text-base font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
            {name}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
            <span>Explore Products</span>
            <FaArrowRight className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-gray-500 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default function Categories() {
  return (
    <section id="categories" className="bg-gray-50/50 py-20">
      <div className="container mx-auto px-6 lg:px-8 space-y-12">
        
        {/* Heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            title="Shop by Category"
            subtitle="Certified PPE and workplace safety equipment tailored for every industry."
          />
          <Link
            href="/categories"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:text-gray-900"
          >
            See All
            <FaArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>

        <Separator className="bg-gray-200/60" />

        {/* Bottom CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Link href="/categories" className="flex items-center gap-2">
              Browse Complete Catalogue
              <FaArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
          >
            <Link href="/bulk-orders" className="flex items-center gap-2">
              Request Bulk Quote
              <FaArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}