import { ContactHero, ContactInfoCards, FormAndMap } from "./components";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <ContactHero />

      <ContactInfoCards />

      <FormAndMap />

    </main>
  );
}