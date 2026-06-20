import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { useCart, calcTotals, formatINR } from "@/lib/cart";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Bag · ARIOMAC" }, { name: "description", content: "Review your items and proceed to WhatsApp chat checkout." }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const { subtotal, shipping, discount, total } = calcTotals(items);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        <span className="ornament">Step 1 of 2</span>
        <h1 className="font-serif text-4xl md:text-5xl mt-3">Your Bag</h1>
        <p className="text-muted-foreground mt-2">{items.length} {items.length === 1 ? "piece" : "pieces"} waiting to be styled.</p>

        {items.length === 0 ? (
          <div className="text-center py-24 animate-fade-up">
            <ShoppingBag className="w-12 h-12 mx-auto text-gold" />
            <h2 className="font-serif text-2xl mt-4">Your bag is empty</h2>
            <p className="text-muted-foreground mt-2">Let's find you something beautiful.</p>
            <Link to="/shop" className="inline-block mt-6 bg-luxe text-primary-foreground px-6 py-3 rounded-full hover-lift">Browse the Edit</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-8">
            <div className="space-y-4">
              {items.map((it, i) => (
                <div key={`${it.id}-${it.size}`} className="flex gap-4 p-4 bg-card border border-border rounded-2xl animate-slide-in" style={{ animationDelay: `${i*60}ms` }}>
                  <img src={it.image} alt={it.name} className="w-24 h-32 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg leading-tight">{it.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Size {it.size}</p>
                    <p className="font-semibold mt-1">{formatINR(it.price)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-border rounded-full">
                        <button onClick={() => setQty(it.id, it.size, it.qty - 1)} className="w-8 h-8 grid place-items-center"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm">{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.size, it.qty + 1)} className="w-8 h-8 grid place-items-center"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => remove(it.id, it.size)} className="text-muted-foreground hover:text-destructive transition" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-card border border-gold/30 rounded-2xl p-6 h-fit lg:sticky lg:top-24 shadow-gold">
              <h3 className="font-serif text-xl">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatINR(subtotal)} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
                {discount > 0 && <Row label="Bundle Discount (10%)" value={`− ${formatINR(discount)}`} highlight />}
              </div>
              <div className="my-4 border-t border-dashed border-border" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm tracking-widest uppercase text-muted-foreground">Total</span>
                <span className="font-serif text-3xl text-maroon">{formatINR(total)}</span>
              </div>

              {subtotal < 1499 && (
                <p className="text-xs text-muted-foreground mt-3">Add {formatINR(1499 - subtotal)} more for <strong className="text-gold">free shipping</strong>.</p>
              )}
              {subtotal < 2999 && subtotal > 0 && (
                <p className="text-xs text-muted-foreground mt-1">Spend {formatINR(2999 - subtotal)} more to unlock <strong className="text-gold">10% bundle discount</strong>.</p>
              )}

              <Link to="/checkout" className="mt-6 w-full bg-luxe text-primary-foreground py-3 rounded-full inline-flex items-center justify-center gap-2 hover-lift">
                <MessageCircle className="w-4 h-4" /> Continue to Chat Checkout
              </Link>
              <p className="text-[11px] text-center text-muted-foreground mt-2">Place your order via WhatsApp — chat, confirm, done.</p>
            </aside>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "text-gold font-medium" : "font-medium"}>{value}</span>
    </div>
  );
}