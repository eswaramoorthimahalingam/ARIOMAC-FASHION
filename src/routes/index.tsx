import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import { ArrowRight, MessageCircle, Sparkles, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import hero from "@/assets/hero-saree.jpg";
import ariomacLogo from "@/assets/Ariomac-logo-transparent.png";

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
  const marqueeItems = [
    "Free shipping above ₹1,499",
    "Cash on Delivery",
    "7-day Returns",
    "WhatsApp Support",
  ];

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
            <img
              src={ariomacLogo}
              alt="ARIOMAC Fashion India"
              className="animate-soft-pulse mb-6 w-72 max-w-full object-contain drop-shadow-[0_8px_28px_rgba(201,168,76,0.28)] sm:w-96 md:w-[28rem]"
              width={1458}
              height={898}
            />
            <span className="ornament mb-6">Heritage · Crafted · 2024</span>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mt-4">
              Wear the <span className="text-gradient-gold italic">story</span><br />
              of India.
            </h1>
            <p className="mt-6 text-primary-foreground/80 max-w-md text-lg">
              Heirloom silks, hand-stitched mirrors and zardosi that catches light like a temple lamp. Discover the new festive edit.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop" className="shine-sweep tap-scale inline-flex items-center gap-2 bg-gold text-primary px-6 py-3 rounded-full font-bold hover-lift">
                Shop the Edit <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/checkout" className="tap-scale inline-flex items-center gap-2 border border-gold/50 text-gold px-6 py-3 rounded-full font-semibold hover:bg-gold/10 transition">
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
          <div className="relative pb-28 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="absolute inset-0 -m-6 rounded-full bg-gold/10 blur-2xl animate-float" />
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/30 shadow-luxe transition-transform duration-500 hover:rotate-1 hover:scale-[1.015]">
              <img src={hero} alt="Ariomac maroon silk saree" className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105" width={1080} height={1440} />
              <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur rounded-xl p-3 sm:p-4 flex items-center gap-3 animate-slide-in" style={{ animationDelay: "800ms" }}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="min-w-0 flex-1 text-sm text-foreground">
                  <p className="font-medium">Riya just ordered the Rani Banarasi</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago · Chennai</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-card border border-gold/40 rounded-xl px-5 py-3 shadow-gold animate-float sm:left-8" style={{ animationDelay: "1s" }}>
              <p className="text-[10px] tracking-widest uppercase text-gold">Free Shipping</p>
              <p className="font-serif text-lg">Above ₹1,499</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-gold/30 bg-foreground text-background">
        <div className="marquee-reel py-3.5" aria-label="Store benefits">
          {[0, 1].map((set) => (
            <div key={set} className="marquee-set" aria-hidden={set === 1}>
              {marqueeItems.map((item) => (
                <span key={`${set}-${item}`} className="marquee-item">
                  <span className="text-gold">✦</span>
                  {item}
                </span>
              ))}
            </div>
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
        <div className="grid responsive-card-grid gap-6">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 80} />)}
        </div>
      </section>

      {/* Promise */}
      <section className="bg-background py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <span className="ornament justify-center">Our Promise</span>
            <h2 className="mt-6 font-serif text-4xl font-bold md:text-5xl">
              Crafted, Curated & Conscious
            </h2>
          </div>
          <div className="grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {([
              {
                Icon: Sparkles,
                t: "Handpicked Festive Pieces",
                d: "Each product is selected for fabric feel, fall, finish and occasion-ready detail.",
              },
              {
                Icon: ShieldCheck,
                t: "Quality You Can Trust",
                d: "We inspect embroidery, color, stitching and packaging before it reaches your door.",
              },
              {
                Icon: Truck,
                t: "Pan-India Delivery",
                d: "Carefully packed orders with free shipping above ₹1,499 and WhatsApp tracking support.",
              },
              {
                Icon: RotateCcw,
                t: "Easy Exchanges",
                d: "Friendly support for size or style changes within our simple 7-day exchange window.",
              },
            ]).map(({ Icon, t, d }, i) => (
              <div
                key={t}
                className="group animate-fade-up border-border px-6 text-center sm:border-l first:border-l-0"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mx-auto mb-7 grid h-24 w-24 place-items-center rounded-full border border-gold/35 bg-secondary/50 text-gold shadow-gold transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                  <Icon className="h-11 w-11" />
                </div>
                <h3 className="font-serif text-2xl font-bold">{t}</h3>
                <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-10">
          <span className="ornament">Loved by you</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-3">Trending now</h2>
        </div>
        <div className="grid responsive-card-grid gap-6">
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
            <Link to="/checkout" className="shine-sweep tap-scale bg-gold text-primary px-6 py-3 rounded-full font-bold hover-lift shrink-0">
              Start Chat Checkout
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
