import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ShoppingBag,
  MessageCircle,
  Menu,
  X,
  Search,
  Heart,
  UserRound,
  Mail,
  MapPin,
  Phone,
  Clock,
  Award,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Header() {
  const navigate = useNavigate();
  const count = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navLinkClass =
    "nav-link font-bold text-[15px] text-foreground/90 hover:text-primary";
  const mobileLinkClass =
    "rounded-md px-3 py-3 text-base font-bold text-foreground transition hover:bg-secondary hover:text-primary";
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchQuery.trim();
    navigate({
      to: "/shop",
      search: q ? { q } : {},
    });
    setMobileOpen(false);
  };

  return (
    <header className="site-header sticky top-0 z-40 backdrop-blur-md">
      <div className="bg-luxe px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.34em] text-gold sm:text-xs">
        Discover handpicked festive fashion with ARIOMAC. Free shipping above ₹1,499.
      </div>
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 md:justify-center">
        <form
          onSubmit={submitSearch}
          className="hidden min-w-[17rem] items-center gap-2 rounded-full bg-background/55 px-4 py-2 text-muted-foreground shadow-sm ring-1 ring-gold/25 transition focus-within:bg-background/90 focus-within:ring-gold/60 xl:absolute xl:left-6 xl:flex"
        >
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search sarees, lehengas"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="tap-scale rounded-full bg-luxe px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-foreground"
          >
            Go
          </button>
        </form>
        <Link to="/" className="tap-scale" onClick={() => setMobileOpen(false)}><Logo /></Link>
        <div className="flex items-center gap-2 md:absolute md:right-6">
          <ThemeSwitcher />
          <button
            type="button"
            className="tap-scale hidden h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-secondary/70 hover:text-primary lg:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5 fill-current" />
          </button>
          <button
            type="button"
            className="tap-scale hidden h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-secondary/70 hover:text-primary lg:inline-flex"
            aria-label="Account"
          >
            <UserRound className="h-5 w-5 fill-current" />
          </button>
          <Link
          to="/cart"
          className="shine-sweep tap-scale relative inline-flex items-center gap-2 rounded-full bg-luxe px-5 py-2.5 font-bold text-primary-foreground shadow-gold ring-1 ring-gold/35 transition hover:scale-105"
          aria-label="Open cart"
          onClick={() => setMobileOpen(false)}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-slide-in">
              {count}
            </span>
          )}
          </Link>
          <button
            type="button"
            className="tap-scale inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/60 text-foreground shadow-sm transition hover:bg-secondary md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className="hidden h-12 items-center justify-center md:flex">
        <nav className="flex items-center gap-8 lg:gap-12">
          <Link to="/" className={navLinkClass}>Home</Link>
          <Link to="/shop" className={navLinkClass}>Shop</Link>
          <Link to="/shop" search={{ cat: "Saree" }} className={navLinkClass}>Sarees</Link>
          <Link to="/shop" search={{ cat: "Lehenga" }} className={navLinkClass}>Lehengas</Link>
          <Link to="/about" className={navLinkClass}>About</Link>
        </nav>
      </div>
      {mobileOpen && (
        <div className="animate-slide-down bg-background/95 px-4 pb-4 shadow-luxe md:hidden">
          <form
            onSubmit={submitSearch}
            className="mx-auto mt-3 flex max-w-7xl items-center gap-2 rounded-lg bg-background/70 px-3 py-3 ring-1 ring-gold/25"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search Ariomac"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="tap-scale rounded-full bg-luxe px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground"
            >
              Search
            </button>
          </form>
          <nav className="mx-auto mt-3 flex max-w-7xl flex-col rounded-lg bg-background/55 p-2">
            <Link to="/" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/shop" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link to="/shop" search={{ cat: "Saree" }} className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Sarees</Link>
            <Link to="/shop" search={{ cat: "Lehenga" }} className={mobileLinkClass} onClick={() => setMobileOpen(false)}>Lehengas</Link>
            <Link to="/about" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>About</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background text-foreground">
      <section className="border-b border-border bg-secondary/35">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-[1fr_360px] md:items-center">
          <div>
            <div className="ornament mb-5">Join Our Circle</div>
            <h2 className="font-serif text-4xl font-bold md:text-5xl">Get 15% Off Your First Order</h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              Early access to festive drops, private styling notes, restock alerts and member-only offers.
            </p>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-14 w-full rounded-lg border border-border bg-background px-5 text-sm font-semibold outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
            <button className="shine-sweep tap-scale h-14 w-full rounded-lg bg-luxe px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-gold">
              Subscribe →
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_0.9fr_1fr_1.1fr_1fr]">
        <div className="md:pr-8">
          <div className="flex items-center gap-5">
            <Logo className="min-w-0" />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
            Heritage ethnic wear for modern celebrations. Curated sarees, lehengas, kurtis and occasion pieces delivered across India.
          </p>
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold" />
              ARIOMAC Fashion Studio, Tamil Nadu, India
            </p>
            <a href="mailto:support@ariomac.in" className="flex items-center gap-3 hover:text-primary">
              <Mail className="h-4 w-4 text-gold" /> support@ariomac.in
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-5 border-b border-border pb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold">Explore</h4>
          <ul className="space-y-3 text-sm font-semibold">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/checkout">Chat Checkout</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-5 border-b border-border pb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold">Support</h4>
          <ul className="space-y-3 text-sm font-semibold">
            <li>Size Guide</li>
            <li>Shipping Policy</li>
            <li>Return & Exchange</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-5 border-b border-border pb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold">Trusted Standards</h4>
          <ul className="space-y-4 text-sm font-semibold">
            <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-gold" /> Secure payments</li>
            <li className="flex items-center gap-3"><Award className="h-4 w-4 text-gold" /> Curated quality</li>
            <li className="flex items-center gap-3"><ShoppingBag className="h-4 w-4 text-gold" /> COD available</li>
            <li className="flex items-center gap-3"><MessageCircle className="h-4 w-4 text-gold" /> Stylist support</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-5 border-b border-border pb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold">Working Hours</h4>
          <div className="space-y-4 text-sm font-semibold">
            <p className="flex items-center justify-between gap-4"><span>Mon - Sat</span><span>9 AM - 7 PM</span></p>
            <p className="flex items-center justify-between gap-4"><span>Sunday</span><span>Closed</span></p>
            <p className="flex items-center gap-3 border-t border-border pt-4 text-gold"><Clock className="h-4 w-4" /> For any queries</p>
          </div>
          <a
            href="https://wa.me/918838882424"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold hover:text-primary"
          >
            <Phone className="h-4 w-4" /> Call / WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ariomac Fashion. Crafted in India.
      </div>
    </footer>
  );
}
