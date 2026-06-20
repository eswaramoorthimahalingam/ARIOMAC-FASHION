import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story · ARIOMAC" },
      { name: "description", content: "Ariomac is a women-led ethnic wear label crafting heirloom pieces in India." },
      { property: "og:title", content: "Our Story · ARIOMAC" },
      { property: "og:description", content: "Heritage textiles, modern silhouettes — handcrafted in India." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="max-w-3xl mx-auto px-6 py-20 w-full flex-1">
        <span className="ornament">Our Story</span>
        <h1 className="font-serif text-5xl md:text-6xl mt-4">Crafted by hands, <span className="text-gradient-gold italic">worn with pride.</span></h1>
        <div className="mt-8 space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p>Ariomac began in a small Coimbatore atelier with a simple promise — that the silks our grandmothers wore deserve to live again, in silhouettes our daughters will love.</p>
          <p>Every piece is sourced from artisan clusters across Banaras, Kanjivaram, Lucknow and Jaipur. We never mass-produce, never compromise on weave, and never pad our prices.</p>
          <p>And because choosing the perfect piece is personal, we built a checkout that's a conversation, not a form. Chat with our stylists on WhatsApp — they'll size, style and ship for you.</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/shop" className="bg-luxe text-primary-foreground px-6 py-3 rounded-full hover-lift">Browse the Edit</Link>
          <a href="https://wa.me/918838882424" target="_blank" rel="noreferrer" className="border border-gold text-gold px-6 py-3 rounded-full hover:bg-gold/10 inline-flex items-center gap-2 transition">
            <MessageCircle className="w-4 h-4" /> +91 88388 82424
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}