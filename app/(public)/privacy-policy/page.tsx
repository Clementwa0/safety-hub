import Link from "next/link";
import { Metadata } from "next";
import { 
  FaShieldHalved, 
  FaCircleCheck, 
  FaEye, 
  FaLock, 
  FaFileLines, 
  FaUsers, 
  FaDatabase, 
  FaEnvelope, 
  FaArrowLeft, 
  FaPrint, 
  FaDownload, 
  FaClock, 
  FaBars,
  FaRegClock
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "Privacy Policy - HSE Hub Limited",
  description: "Learn how HSE Hub Limited collects, uses, and protects your personal information. Your privacy and security are important to us.",
};

const sections = [
  {
    id: "collect",
    icon: FaDatabase,
    number: "1.",
    title: "Information We Collect",
    description: "We collect various types of information to provide and improve our services.",
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
    description: "Your information helps us deliver better products and services.",
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

export default function PrivacyPage() {
  const effectiveDate = "January 15, 2026";

  return (
    <main className="min-h-screen bg-slate-50 pt-16 sm:pt-20 lg:pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Mobile Table of Contents - Visible only on mobile */}
        <div className="lg:hidden mb-6">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg border border-secondary/20 bg-white px-4 py-3 text-sm font-medium text-primary hover:bg-secondary/5 transition-colors">
              <span className="flex items-center gap-2">
                <FaBars className="h-4 w-4 text-secondary" />
                Table of Contents
              </span>
              <span className="transition-transform duration-200 group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div className="mt-2 rounded-lg border border-secondary/10 bg-white p-4">
              <nav>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#introduction"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                    >
                      <FaShieldHalved className="h-3.5 w-3.5" />
                      Introduction
                    </a>
                  </li>
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            <span className="text-xs text-muted-foreground/50 mr-1">
                              {section.number}
                            </span>
                            {section.title}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                  <li>
                    <a
                      href="#updates"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                    >
                      <FaRegClock className="h-3.5 w-3.5" />
                      Policy Updates
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                    >
                      <FaEnvelope className="h-3.5 w-3.5" />
                      Contact Us
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </details>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-28">
              <Card className="border-secondary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FaBars className="h-4 w-4 text-secondary" />
                    Table of Contents
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Jump to a section
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <nav className="px-4 pb-4">
                      <ul className="space-y-1">
                        <li>
                          <a
                            href="#introduction"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                          >
                            <FaShieldHalved className="h-3.5 w-3.5" />
                            Introduction
                          </a>
                        </li>
                        <li>
                          <a
                            href="#contact"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                          >
                            <FaEnvelope className="h-3.5 w-3.5" />
                            Contact Us
                          </a>
                        </li>
                        {sections.map((section) => {
                          const Icon = section.icon;
                          return (
                            <li key={section.id}>
                              <a
                                href={`#${section.id}`}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors group"
                              >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="line-clamp-1">
                                  <span className="text-xs text-muted-foreground/50 mr-1">
                                    {section.number}
                                  </span>
                                  {section.title}
                                </span>
                              </a>
                            </li>
                          );
                        })}
                        <li>
                          <a
                            href="#updates"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                          >
                            <FaRegClock className="h-3.5 w-3.5" />
                            Policy Updates
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </ScrollArea>
                </CardContent>
                <div className="border-t border-border/50 px-4 py-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <span>Effective: {effectiveDate}</span>
                    </div>
                    <span className="h-3 w-px bg-border/50" />
                    <Badge variant="outline" className="text-[9px] px-1.5">v1.0</Badge>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start gap-2 w-full">
                  <FaPrint className="h-3.5 w-3.5" />
                  Print Page
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 w-full">
                  <FaDownload className="h-3.5 w-3.5" />
                  Download PDF
                </Button>
                <Button variant="ghost" size="sm" className="justify-start gap-2 w-full" asChild>
                  <Link href="/">
                    <FaArrowLeft className="h-3.5 w-3.5" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <FaShieldHalved className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-primary sm:text-3xl">Privacy Policy</h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FaRegClock className="h-3.5 w-3.5" />
                        Effective: {effectiveDate}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <Badge variant="outline" className="text-[10px]">Version 1.0</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Introduction */}
            <Card id="introduction" className="mb-8 border-secondary/20 shadow-sm scroll-mt-28">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <FaShieldHalved className="h-5 w-5" />
                  </div>
                  Our Commitment to Privacy
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  HSE Hub Limited is committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, 
                  products, and services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-secondary/5 p-4">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <FaCircleCheck className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    By using our website and services, you agree to the collection and use of information in accordance with this policy.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card id="contact" className="mb-8 border-secondary/10 shadow-sm scroll-mt-28">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FaEnvelope className="h-5 w-5 text-secondary" />
                  Contact Us
                </CardTitle>
                <CardDescription>
                  If you have any questions about this Privacy Policy, please contact us:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3 text-center hover:shadow-sm transition">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a 
                      href="mailto:info@hsehub.co.ke" 
                      className="text-sm font-medium text-secondary hover:underline"
                    >
                      info@hsehub.co.ke
                    </a>
                  </div>
                  <div className="rounded-lg border p-3 text-center hover:shadow-sm transition">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a 
                      href="tel:+254115062024" 
                      className="text-sm font-medium text-secondary hover:underline"
                    >
                      +254 115 062 024
                    </a>
                  </div>
                  <div className="rounded-lg border p-3 text-center hover:shadow-sm transition">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <span className="text-sm font-medium">Machakos, Kenya</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Sections */}
            <div className="space-y-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card 
                    key={section.id} 
                    id={section.id}
                    className="border-secondary/10 scroll-mt-28 hover:shadow-md transition-all duration-300"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-start gap-3 text-lg">
                        <span className="text-secondary font-mono text-sm font-bold">
                          {section.number}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        {section.title}
                      </CardTitle>
                      <CardDescription>
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                          >
                            <FaCircleCheck className="h-4 w-4 text-secondary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Policy Updates */}
            <Card id="updates" className="mt-8 border-secondary/10 scroll-mt-28">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FaFileLines className="h-5 w-5 text-secondary" />
                  Policy Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. 
                  We encourage you to review this Privacy Policy periodically for any changes.
                </p>
                <div className="rounded-lg bg-secondary/5 p-3">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FaRegClock className="h-4 w-4 text-secondary" />
                    This policy was last updated on {effectiveDate}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Effective Date</span>
                    <br />
                    {effectiveDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Version</span>
                    <br />
                    1.0
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Company</span>
                    <br />
                    HSE Hub Limited
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} HSE Hub Limited. All rights reserved.
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground/60">
                <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
                {' · '}
                <Link href="/privacy" className="text-secondary">Privacy Policy</Link>
                {' · '}
                <Link href="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
              </div>
            </footer>

            {/* Back to Top */}
            <div className="mt-8 text-center">
              <a
                href="#top"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-secondary transition-colors"
              >
                ↑ Back to top
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}