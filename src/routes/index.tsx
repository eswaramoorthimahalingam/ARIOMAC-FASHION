import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import { ArrowRight, MessageCircle, Sparkles, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import hero from "@/assets/hero-saree.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARIOMAC — Luxe Ethnic Fashion · Sarees, Lehengas, Kurtis" },
      { name: "description", content: "Handpicked sarees, lehengas, kurtis and sharara suits. Order on WhatsApp for instant assistance." },
      { property: "og:title", content: "ARIOMAC — Luxe Ethnic Fashion" },
      { property: "og:description", content: "Discover heritage ethnic wear crafted in India." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = products.slice(0, 4);
  const trending = products.slice(4);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Hero */}
      <section className="relative bg-luxe text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gold blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative">
          <div className="animate-fade-up">
            <span className="ornament mb-6">Heritage · Crafted · 2024</span>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mt-4">
              Wear the <span className="text-gradient-gold italic">story</span><br />
              of India.
            </h1>
            <p className="mt-6 text-primary-foreground/80 max-w-md text-lg">
              Heirloom silks, hand-stitched mirrors and zardosi that catches light like a temple lamp. Discover the new festive edit.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-gold text-primary px-6 py-3 rounded-full font-medium hover-lift">
                Shop the Edit <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/checkout" className="inline-flex items-center gap-2 border border-gold/50 text-gold px-6 py-3 rounded-full hover:bg-gold/10 transition">
                <MessageCircle className="w-4 h-4" /> Chat to Order
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[["50k+","Happy customers"],["4.7★","Avg. rating"],["100%","Handpicked"]].map(([a,b]) => (
                <div key={a}>
                  <div className="font-serif text-3xl text-gold">{a}</div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/60">{b}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="absolute inset-0 -m-6 rounded-full bg-gold/10 blur-2xl animate-float" />
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gold/30 shadow-luxe">
              <img src={hero} alt="Ariomac maroon silk saree" className="w-full h-full object-cover" width={1080} height={1440} />
              <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur rounded-xl p-4 flex items-center gap-3 animate-slide-in" style={{ animationDelay: "800ms" }}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-foreground text-sm flex-1">
                  <p className="font-medium">Riya just ordered the Rani Banarasi</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago · Chennai</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card border border-gold/40 rounded-xl px-5 py-3 shadow-gold animate-float" style={{ animationDelay: "1s" }}>
              <p className="text-[10px] tracking-widest uppercase text-gold">Free Shipping</p>
              <p className="font-serif text-lg">Above ₹1,499</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-foreground text-background overflow-hidden border-y border-gold/30">
        <div className="flex gap-12 py-3 whitespace-nowrap animate-[shimmer_25s_linear_infinite]" style={{ backgroundSize: "200% 100%" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-xs tracking-[0.4em] uppercase flex items-center gap-12">
              ✦ Free shipping above ₹1,499 ✦ Cash on Delivery ✦ 7-day Returns ✦ WhatsApp Support
            </span>
          ))}
        </div>
      </div>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="ornament">The Festive Edit</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-3">Featured pieces</h2>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-2 text-sm text-primary hover:gap-3 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 80} />)}
        </div>
      </section>

      {/* Promise */}
      <section className="bg-secondary/40 py-16">
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {([
            { Icon: Truck, t: "Free Shipping", d: "Pan-India delivery on orders above ₹1,499" },
            { Icon: RotateCcw, t: "Easy Returns", d: "7-day no-questions-asked returns" },
            { Icon: ShieldCheck, t: "Secure Payments", d: "COD + UPI + WhatsApp checkout" },
            { Icon: Sparkles, t: "Handpicked", d: "Curated by stylists, made by artisans" },
          ]).map(({ Icon, t, d }, i) => (
            <div key={t} className="text-center animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <Icon className="w-7 h-7 mx-auto text-gold mb-3" />
              <h4 className="font-serif text-xl">{t}</h4>
              <p className="text-sm text-muted-foreground mt-1">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-10">
          <span className="ornament">Loved by you</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-3">Trending now</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 80} />)}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-20 w-full">
        <div className="relative bg-luxe rounded-3xl p-10 md:p-14 overflow-hidden shadow-luxe">
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-gold/20 blur-3xl animate-float" />
          <div className="relative flex flex-col md:flex-row items-center gap-8 text-primary-foreground">
            <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center shrink-0 animate-float">
              <MessageCircle className="w-9 h-9 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-serif text-3xl md:text-4xl">Not sure what to pick?</h3>
              <p className="text-primary-foreground/80 mt-2">Our stylists are one tap away. Chat to order — we'll size, suggest and ship.</p>
            </div>
            <Link to="/checkout" className="bg-gold text-primary px-6 py-3 rounded-full font-medium hover-lift shrink-0">
              Start Chat Checkout
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}