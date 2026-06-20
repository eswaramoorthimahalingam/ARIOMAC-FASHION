import { Link } from "@tanstack/react-router";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Header() {
  const count = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="hover:text-primary transition">Home</Link>
          <Link to="/shop" className="hover:text-primary transition">Shop</Link>
          <Link to="/shop" search={{ cat: "Saree" }} className="hover:text-primary transition">Sarees</Link>
          <Link to="/shop" search={{ cat: "Lehenga" }} className="hover:text-primary transition">Lehengas</Link>
          <Link to="/about" className="hover:text-primary transition">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Link
          to="/cart"
          className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxe text-primary-foreground shadow-luxe hover:scale-105 transition"
          aria-label="Open cart"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-slide-in">
              {count}
            </span>
          )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-luxe text-primary-foreground mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-serif text-2xl mb-3 text-gradient-gold">ARIOMAC</h3>
          <p className="text-sm text-primary-foreground/80 max-w-xs">
            Handpicked ethnic wear for the modern Indian woman. Crafted with love, delivered with care.
          </p>
        </div>
        <div>
          <h4 className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li>Sarees</li><li>Kurtis</li><li>Lehengas</li><li>Sharara Suits</li>
          </ul>
        </div>
        <div>
          <h4 className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Help</h4>
          <ul className="space-y-2 text-sm">
            <li>Size Guide</li><li>Shipping</li><li>Returns</li><li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Order on WhatsApp</h4>
          <a
            href="https://wa.me/918838882424"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-gold text-primary px-4 py-2 rounded-full text-sm font-medium hover-lift"
          >
            <MessageCircle className="w-4 h-4" /> +91 88388 82424
          </a>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Ariomac Fashion. Crafted in India.
      </div>
    </footer>
  );
}