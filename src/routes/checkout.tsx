import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { useCart, calcTotals, formatINR } from "@/lib/cart";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Check, ShoppingBag, PackageCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Chat Checkout · ARIOMAC" }, { name: "description", content: "Place your order in a conversation. WhatsApp confirms it instantly." }] }),
  component: Checkout,
});

const WHATSAPP = "919176294875";

type Step = "name" | "phone" | "address" | "pincode" | "pay" | "done";
type Msg = { from: "bot" | "user"; text: string; ts?: number };
type CreatedOrder = {
  id: string;
  trackingCode: string;
  items: Array<{ productId: string; name: string; size: string; qty: number; lineTotal: number }>;
  totals: { subtotal: number; shipping: number; discount: number; total: number };
};

function Checkout() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const totals = calcTotals(items);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [step, setStep] = useState<Step>("name");
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "", pincode: "", pay: "" });
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pushBot = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text, ts: Date.now() }]);
    }, 700);
  };

  useEffect(() => {
    if (items.length === 0) return;
    pushBot(`Namaste! ✨ I'm Aaru, your Ariomac stylist. You have ${items.length} ${items.length === 1 ? "piece" : "pieces"} in your bag — total ${formatINR(totals.total)}.`);
    setTimeout(() => pushBot("What name should we use for delivery?"), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const handleSubmit = (e?: React.FormEvent, overrideValue?: string) => {
    e?.preventDefault();
    const value = (overrideValue ?? input).trim();
    if (!value || step === "done") return;
    setMessages((m) => [...m, { from: "user", text: value }]);
    setInput("");

    if (step === "name") {
      setForm((f) => ({ ...f, name: value }));
      setStep("phone");
      pushBot(`Lovely to meet you, ${value.split(" ")[0]} 🙏 What's your WhatsApp number?`);
    } else if (step === "phone") {
      if (!/^[6-9]\d{9}$/.test(value.replace(/\D/g, "").slice(-10))) {
        pushBot("That doesn't look like a valid 10-digit Indian mobile. Try again?");
        return;
      }
      setForm((f) => ({ ...f, phone: value }));
      setStep("address");
      pushBot("Got it. What's your full delivery address? (House, street, area)");
    } else if (step === "address") {
      if (value.length < 10) { pushBot("A little more detail please — we want it to reach you 💌"); return; }
      setForm((f) => ({ ...f, address: value }));
      setStep("pincode");
      pushBot("And the pincode?");
    } else if (step === "pincode") {
      if (!/^\d{6}$/.test(value)) { pushBot("Pincode should be exactly 6 digits."); return; }
      setForm((f) => ({ ...f, pincode: value }));
      setStep("pay");
      pushBot("How would you like to pay — Cash on Delivery, UPI, or Card?");
    } else if (step === "pay") {
      setForm((f) => ({ ...f, pay: value }));
      setStep("done");
      pushBot("Perfect! Tap the button below to confirm your order. We'll generate your tracking code instantly.");
    }
  };

  const quickReply = (val: string) => handleSubmit(undefined, val);

  const createOrder = async () => {
    setCreatingOrder(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            pincode: form.pincode,
          },
          paymentMethod: form.pay,
          items: items.map((item) => ({ id: item.id, size: item.size, qty: item.qty })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Order could not be created.");
      setOrder(data.order);
      clear();
      toast.success(`Order ${data.order.id} created`);
      pushBot(`Done! Your order ${data.order.id} is confirmed with tracking code ${data.order.trackingCode}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order could not be created.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const buildWaMessage = () => {
    const confirmedItems = order?.items.map((i, n) => `${n+1}. ${i.name} — Size ${i.size} × ${i.qty} = ${formatINR(i.lineTotal)}`);
    const lines = [
      "🛍️ *New Order — Ariomac*",
      order ? `*Order ID:* ${order.id}` : "",
      order ? `*Tracking:* ${order.trackingCode}` : "",
      "",
      `*Name:* ${form.name}`,
      `*Phone:* ${form.phone}`,
      `*Address:* ${form.address}, ${form.pincode}`,
      `*Payment:* ${form.pay}`,
      "",
      "*Items:*",
      ...(confirmedItems ?? items.map((i, n) => `${n+1}. ${i.name} — Size ${i.size} × ${i.qty} = ${formatINR(i.price * i.qty)}`)),
      "",
      `Subtotal: ${formatINR(order?.totals.subtotal ?? totals.subtotal)}`,
      `Shipping: ${(order?.totals.shipping ?? totals.shipping) === 0 ? "Free" : formatINR(order?.totals.shipping ?? totals.shipping)}`,
      (order?.totals.discount ?? totals.discount) > 0 ? `Bundle Discount: − ${formatINR(order?.totals.discount ?? totals.discount)}` : "",
      `*Total: ${formatINR(order?.totals.total ?? totals.total)}*`,
    ].filter(Boolean);
    return encodeURIComponent(lines.join("\n"));
  };

  const waLink = `https://wa.me/${WHATSAPP}?text=${buildWaMessage()}`;

  if (items.length === 0 && !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <section className="max-w-2xl mx-auto px-6 py-24 text-center flex-1">
          <ShoppingBag className="w-12 h-12 mx-auto text-gold" />
          <h1 className="font-serif text-4xl mt-4">Nothing to checkout yet</h1>
          <p className="text-muted-foreground mt-2">Add a piece to your bag and we'll chat you through the rest.</p>
          <Link to="/shop" className="inline-block mt-6 bg-luxe text-primary-foreground px-6 py-3 rounded-full hover-lift">Browse the Edit</Link>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* Chat panel */}
          <div className="bg-card border border-border rounded-3xl shadow-luxe overflow-hidden flex flex-col h-[78vh]">
            <div className="bg-luxe text-primary-foreground px-5 py-4 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-primary font-serif text-lg">A</div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium leading-tight">Aaru · Ariomac Stylist</p>
                <p className="text-[11px] text-primary-foreground/70">Online · replies instantly</p>
              </div>
              <MessageCircle className="w-5 h-5 text-gold" />
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(circle_at_20%_20%,oklch(0.95_0.02_60_/_0.5),transparent_50%),radial-gradient(circle_at_80%_80%,oklch(0.9_0.04_80_/_0.4),transparent_50%)]">
              {messages.map((m, i) => (
                <div key={i} className={`flex animate-slide-in ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-luxe text-primary-foreground rounded-br-sm"
                      : "bg-background border border-border rounded-bl-sm"
                  }`}>{m.text}</div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start animate-slide-in">
                  <div className="bg-background border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                  </div>
                </div>
              )}

              {step === "pay" && !typing && (
                <div className="flex flex-wrap gap-2 pt-2 animate-slide-in">
                  {["Cash on Delivery", "UPI", "Card"].map((opt) => (
                    <button key={opt} onClick={() => quickReply(opt)}
                      className="px-4 py-1.5 rounded-full border border-gold/60 text-sm hover:bg-gold/10 transition">
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {step === "done" && (
                <div className="bg-luxe text-primary-foreground rounded-2xl p-5 mt-4 animate-slide-in shadow-luxe">
                  <div className="flex items-center gap-2 text-gold mb-2">
                    <Check className="w-5 h-5" /><span className="text-xs uppercase tracking-widest">Order Ready</span>
                  </div>
                  {!order ? (
                    <>
                      <p className="font-serif text-xl">Confirm your ARIOMAC order</p>
                      <p className="text-sm text-primary-foreground/80 mt-1">Inventory will be reserved and your tracking code will be created.</p>
                      <button
                        onClick={createOrder}
                        disabled={creatingOrder}
                        className="mt-4 inline-flex items-center gap-2 bg-gold text-primary px-5 py-3 rounded-full font-medium hover-lift disabled:opacity-60"
                      >
                        <PackageCheck className="w-4 h-4" /> {creatingOrder ? "Creating Order" : "Confirm Order"}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-serif text-xl">Order confirmed</p>
                      <p className="text-sm text-primary-foreground/80 mt-1">Order {order.id} · Tracking {order.trackingCode}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link to="/track" className="inline-flex items-center gap-2 bg-background text-primary px-5 py-3 rounded-full font-medium hover-lift">
                          <Check className="w-4 h-4" /> Track Order
                        </Link>
                        <a href={waLink} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-gold text-primary px-5 py-3 rounded-full font-medium hover-lift">
                          <MessageCircle className="w-4 h-4" /> Send on WhatsApp
                        </a>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-border bg-background p-3 flex gap-2 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={step === "done" || typing}
                placeholder={step === "done" ? "Order complete ✨" : "Type your reply…"}
                className="flex-1 px-4 py-2.5 rounded-full bg-secondary/60 outline-none focus:ring-2 focus:ring-gold/60 text-sm"
              />
              <button type="submit" disabled={!input.trim() || typing || step === "done"}
                className="w-11 h-11 rounded-full bg-luxe text-primary-foreground grid place-items-center hover-lift disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Live summary */}
          <aside className="bg-card border border-gold/30 rounded-3xl p-5 shadow-gold h-fit lg:sticky lg:top-24">
            <h3 className="font-serif text-lg">Order Summary</h3>
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {!order && items.map((it) => (
                <div key={`${it.id}-${it.size}`} className="flex gap-2 items-center text-xs">
                  <img src={it.image} alt={it.name} className="w-10 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{it.name}</p>
                    <p className="text-muted-foreground">{it.size} · ×{it.qty}</p>
                  </div>
                  <span className="text-xs font-semibold">{formatINR(it.price * it.qty)}</span>
                </div>
              ))}
              {order?.items.map((it) => (
                <div key={`${it.productId}-${it.size}`} className="flex gap-2 items-center text-xs rounded-md bg-secondary/50 p-2">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{it.name}</p>
                    <p className="text-muted-foreground">{it.size} · ×{it.qty}</p>
                  </div>
                  <span className="text-xs font-semibold">{formatINR(it.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-border my-4" />
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(order?.totals.subtotal ?? totals.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{(order?.totals.shipping ?? totals.shipping) === 0 ? "Free" : formatINR(order?.totals.shipping ?? totals.shipping)}</span></div>
              {(order?.totals.discount ?? totals.discount) > 0 && <div className="flex justify-between text-gold"><span>Bundle Discount</span><span>− {formatINR(order?.totals.discount ?? totals.discount)}</span></div>}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-widest">Total</span>
              <span className="font-serif text-2xl text-maroon">{formatINR(order?.totals.total ?? totals.total)}</span>
            </div>
            <Link to="/cart" className="block text-center text-xs text-muted-foreground mt-3 hover:text-primary">← Edit bag</Link>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
}
