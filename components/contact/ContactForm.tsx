"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaPaperPlane, FaUser, FaEnvelope, FaPhone, FaPen, FaCommentDots } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const searchParams = useSearchParams();
  const prefilledSubject = searchParams.get("subject") ?? "";

  const [agree, setAgree] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<ContactFormState>({
    ...initialFormState,
    subject: prefilledSubject,
  });

  const update =
    (field: keyof ContactFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (sending) return;

    if (!agree) {
      toast.error("Please agree to the privacy policy before submitting.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.subject.trim() ||
      !form.message.trim()
    ) {
      toast.error("All fields are required.");
      return;
    }

    if (!emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          body?.error || body?.message || "Could not send your message. Please try again later.";
        toast.error(errorMessage);
        return;
      }

      toast.success("Your message was sent successfully.");
      setForm(initialFormState);
      setAgree(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while sending your message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      variants={item}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
    >
      <Card className="overflow-hidden rounded-3xl border shadow-card">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl font-bold text-primary">
            Send Us a Message
          </CardTitle>

          <CardDescription className="text-base">
            Fill in the form below and our team will get back to you as soon as
            possible.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <motion.form
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <motion.div variants={item} className="space-y-2">
                <Label htmlFor="name">
                  Full Name
                  <span className="ml-1 text-destructive">*</span>
                </Label>

                <div className="relative">
                  <FaUser className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={update("name")}
                    className="pl-10 h-11"
                  />
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-2">
                <Label htmlFor="email">
                  Email Address
                  <span className="ml-1 text-destructive">*</span>
                </Label>

                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={update("email")}
                    className="pl-10 h-11"
                  />
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number
                  <span className="ml-1 text-destructive">*</span>
                </Label>

                <div className="relative">
                  <FaPhone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="phone"
                    placeholder="+254 787 894 925"
                    value={form.phone}
                    onChange={update("phone")}
                    className="pl-10 h-11"
                  />
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-2">
                <Label htmlFor="subject">
                  Subject
                  <span className="ml-1 text-destructive">*</span>
                </Label>

                <div className="relative">
                  <FaPen className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={update("subject")}
                    className="pl-10 h-11"
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="message">
                Your Message
                <span className="ml-1 text-destructive">*</span>
              </Label>

              <div className="relative">
                <FaCommentDots className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />

                <Textarea
                  id="message"
                  rows={7}
                  placeholder="Tell us about your PPE requirements..."
                  value={form.message}
                  onChange={update("message")}
                  className="pl-10 pt-3 resize-none"
                />
              </div>
            </motion.div>

            <motion.div
              variants={item}
              className="flex items-start gap-3"
            >
              <Checkbox
                id="privacy"
                checked={agree}
                onCheckedChange={(checked) =>
                  setAgree(checked === true)
                }
              />

              <Label
                htmlFor="privacy"
                className="text-sm leading-6 text-muted-foreground"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-semibold text-secondary hover:underline"
                >
                  Privacy Policy
                </a>
              </Label>
            </motion.div>

            <motion.div
              variants={item}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                size="lg"
                disabled={!agree || sending}
                className="h-12 w-full rounded-xl text-base font-semibold"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  );
}