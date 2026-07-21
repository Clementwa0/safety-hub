"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaTriangleExclamation, FaArrowLeft, FaHouse } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { FaHome } from "react-icons/fa";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-secondary/10">
          <FaTriangleExclamation className="h-12 w-12 text-secondary" />
        </div>

        <h1 className="text-7xl font-black text-primary">404</h1>

        <h2 className="mt-4 text-3xl font-bold text-foreground">
          Page Not Found
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
          Sorry, the page you&apos;re looking for doesn&apos;t exist, has been moved, or
          the URL may be incorrect.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/">
              <FaHome className="mr-2 h-5 w-5" />
              Back Home
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            <FaArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </main>
  );
}