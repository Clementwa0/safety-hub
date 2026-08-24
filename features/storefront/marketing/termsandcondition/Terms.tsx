"use client";
import Link from "next/link";
import { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { termssections } from "@/lib/constants";
import { useSettings } from "@/components/SettingsProvider";

export const metadata: Metadata = {
  title: "Terms and Conditions - HSE Hub Limited",
  description:
    "Read the terms and conditions for using HSE Hub Limited's website, products, and services.",
};


export default function TermsPage() {
  const { settings } = useSettings();
  const effectiveDate = "January 15, 2026";

  return (
    <main className="min-h-screen bg-slate-50 pt-16 sm:pt-20 lg:pt-24">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:py-16">
        {/* Mobile Table of Contents - Visible only on mobile */}
        <div className="lg:hidden mb-6">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg border border-secondary/20 bg-white px-4 py-3 text-sm font-medium text-primary hover:bg-secondary/5 transition-colors">
              <span>Table of Contents</span>
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
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                    >
                      Introduction
                    </a>
                  </li>
                  {termssections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                      >
                        <span className="text-xs text-muted-foreground/50 mr-1">
                          {section.number}
                        </span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href="#contact"
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                    >
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
            <div className="lg:sticky lg:top-24">
              <Card className="border-secondary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
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
                            Introduction
                          </a>
                        </li>
                        {termssections.map((section) => (
                          <li key={section.id}>
                            <a
                              href={`#${section.id}`}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                            >
                              <span className="text-xs text-muted-foreground/50">
                                {section.number}
                              </span>
                              {section.title}
                            </a>
                          </li>
                        ))}
                        <li>
                          <a
                            href="#contact"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/5 hover:text-secondary transition-colors"
                          >
                            Contact Us
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
                    <Badge variant="outline" className="text-[9px] px-1.5">
                      v1.0
                    </Badge>
                  </div>
                </div>
              </Card>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start w-full"
                >
                  Print Page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start w-full"
                >
                  Download PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-primary sm:text-3xl">
                    Terms and Conditions
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Effective: {effectiveDate}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <Badge variant="outline" className="text-[10px]">
                      Version 1.0
                    </Badge>
                  </div>
                </div>
              </div>
            </header>

            {/* Introduction */}
            <Card
              id="introduction"
              className="mb-8 border-secondary/20 shadow-sm scroll-mt-24"
            >
              <CardHeader>
                <CardTitle className="text-xl">Introduction</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Welcome to HSE Hub Limited. By using our website, products,
                  and services, you agree to comply with and be bound by the
                  following terms and conditions. Please read these terms
                  carefully before using our services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-secondary/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    These terms apply to all users of our website, products, and
                    services. By continuing to use our services, you accept
                    these terms.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-6">
              {termssections.map((section) => (
                <Card
                  key={section.id}
                  id={section.id}
                  className="border-secondary/10 scroll-mt-24 hover:shadow-md transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3 text-lg">
                      <span className="text-secondary font-mono text-sm font-bold">
                        {section.number}
                      </span>
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary/50 shrink-0 mt-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Information */}
            <Card
              id="contact"
              className="mt-8 border-secondary/10 shadow-sm scroll-mt-24"
            >
              <CardHeader>
                <CardTitle className="text-lg">Contact Us</CardTitle>
                <CardDescription>
                  If you have any questions about these Terms and Conditions,
                  please contact us:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3 text-center hover:shadow-sm transition">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-sm font-medium text-secondary hover:underline"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                  <div className="rounded-lg border p-3 text-center hover:shadow-sm transition">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${settings.contactPhone}`}
                      className="text-sm font-medium text-secondary hover:underline"
                    >
                      {settings.contactPhone}
                    </a>
                  </div>
                  <div className="rounded-lg border p-3 text-center hover:shadow-sm transition">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <span className="text-sm font-medium">
                      {settings.address}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="mt-6 border-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg">Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These terms and conditions are governed by and construed in
                  accordance with the laws of the Republic of Kenya. Any
                  disputes arising from these terms shall be subject to the
                  exclusive jurisdiction of the courts of Kenya.
                </p>
                <div className="mt-3 rounded-lg bg-secondary/5 p-3">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {effectiveDate}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
