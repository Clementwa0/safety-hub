import {
  ContactHero,
  ContactInfoCards,
  FormAndMap,
} from "@/components/contact";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <ContactHero />

      {/* Contact Information */}
      <ContactInfoCards />

      {/* Contact Form + Google Map */}
      <FormAndMap />

    </main>
  );
}