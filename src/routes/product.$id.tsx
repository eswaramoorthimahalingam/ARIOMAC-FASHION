import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { getProduct, products, type Product } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { useCart, formatINR } from "@/lib/cart";
import { useState } from "react";
import { Star, ShoppingBag, MessageCircle, Truck, RotateCcw, ShieldCheck, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }): { product: Product } => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.product.name} · ARIOMAC` },
      { name: "description", content: loaderData.product.description },
      { property: "og:title", content: loaderData.product.name },
      { property: "og:description", content: loaderData.product.description },
      { property: "og:image", content: loaderData.product.image },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-4xl">Not found</h1>
        <Link to="/shop" className="text-primary underline mt-4 inline-block">Back to shop</Link>
      </div>
    </div>
  ),
  errorComponent: () => <div className="p-10 text-center">Something went wrong.</div>,
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);
  const off = Math.round((1 - product.price / product.mrp) * 100);

  const handleAdd = () => {
    add({ id: product.id, name: product.name, price: product.price, image: product.image, size, qty });
    toast.success(`${product.name} added to your bag`, { description: `${qty} × Size ${size}` });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-10 w-full grid lg:grid-cols-2 gap-12">
        <div className="animate-fade-up">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted shadow-luxe">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" width={800} height={1000} />
            <span className="absolute top-4 left-4 bg-luxe text-primary-foreground text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
              {product.tagline}
            </span>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold">{product.category} · {product.fabric}</p>
          <h1 className="font-serif text-4xl md:text-5xl mt-2">{product.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-gold text-gold" /> {product.rating}
            </div>
            <span className="text-sm text-muted-foreground">· {product.reviews} reviews</span>
          </div>

          <div className="flex items-baseline gap-3 mt-5">
            <span className="font-serif text-4xl text-maroon">{formatINR(product.price)}</span>
            <span className="text-muted-foreground line-through">{formatINR(product.mrp)}</span>
            {off > 0 && <span className="bg-gold text-primary px-2 py-0.5 rounded-full text-xs font-bold">{off}% OFF</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes · Free shipping above ₹1,499</p>

          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Size */}
          <div className="mt-7">
            <p className="text-xs tracking-widest uppercase mb-2 text-muted-foreground">Select size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s: string) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-12 px-4 h-11 rounded-full border text-sm transition ${
                    size === s ? "bg-luxe text-primary-foreground border-transparent" : "border-border hover:border-gold"
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="mt-6">
            <p className="text-xs tracking-widest uppercase mb-2 text-muted-foreground">Quantity</p>
            <div className="inline-flex items-center border border-border rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 grid place-items-center hover:text-primary"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 grid place-items-center hover:text-primary"><Plus className="w-4 h-4" /></button>
            </div>
            <span className="ml-4 text-sm text-muted-foreground">Total <strong className="text-foreground">{formatINR(product.price * qty)}</strong></span>
          </div>

          {/* CTA */}
          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            <button onClick={handleAdd} className="inline-flex items-center justify-center gap-2 bg-luxe text-primary-foreground py-3.5 rounded-full hover-lift">
              <ShoppingBag className="w-4 h-4" /> Add to Bag
            </button>
            <Link to="/checkout" onClick={handleAdd} className="inline-flex items-center justify-center gap-2 bg-gold text-primary py-3.5 rounded-full hover-lift font-medium">
              <MessageCircle className="w-4 h-4" /> Chat Checkout
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-center">
            {[[Truck,"Free shipping"],[RotateCcw,"7-day returns"],[ShieldCheck,"COD available"]].map(([Icon,t]) => (
              <div key={t as string} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-secondary/50">
                {/* @ts-ignore */}
                <Icon className="w-5 h-5 text-gold" />
                <span className="text-muted-foreground">{t as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <h2 className="font-serif text-3xl mb-8">You may also love</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {related.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 60} />)}
        </div>
      </section>
      <Footer />
    </div>
  );
}