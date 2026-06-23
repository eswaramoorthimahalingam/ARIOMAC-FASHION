import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/cart";

export function ProductCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  const off = Math.round((1 - product.price / product.mrp) * 100);
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group block animate-fade-up tap-scale rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="shine-sweep relative overflow-hidden rounded-lg bg-card hover-lift">
        <div className="aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-focus-visible:scale-110"
          />
        </div>
        <div className="absolute inset-x-3 bottom-3 translate-y-3 rounded-md bg-background/90 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.22em] text-primary opacity-0 shadow-gold backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          View Details
        </div>
        <span className="absolute top-3 left-3 bg-luxe text-primary-foreground text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full">
          {product.tagline}
        </span>
        {off > 0 && (
          <span className="absolute top-3 right-3 bg-gold text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">
            {off}% OFF
          </span>
        )}
      </div>
      <div className="pt-3 px-1">
        <p className="text-[10px] tracking-[0.25em] uppercase text-gold">{product.category}</p>
        <h3 className="font-serif text-lg mt-0.5 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-foreground">{formatINR(product.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3 fill-gold text-gold" />
          <span>{product.rating}</span>
          <span>· {product.reviews} reviews</span>
        </div>
      </div>
    </Link>
  );
}
