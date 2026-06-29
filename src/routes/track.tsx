import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { formatINR } from "@/lib/cart";
import { useState, type FormEvent } from "react";
import { CheckCircle2, PackageSearch, Search, Truck } from "lucide-react";
import { toast } from "sonner";

type Order = {
  id: string;
  trackingCode: string;
  customer: { name: string; phone: string; address: string; pincode: string };
  items: Array<{ productId: string; name: string; size: string; qty: number; lineTotal: number }>;
  totals: { total: number };
  paymentStatus: string;
  status: string;
  courier: string;
  trackingNumber: string;
  tracking: Array<{ status: string; label: string; note: string; at: string }>;
  createdAt: string;
};

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Order · ARIOMAC" },
      { name: "description", content: "Track your ARIOMAC order status." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lookup = code.trim();
    const mobile = phone.replace(/\D/g, "").slice(-10);
    if (!lookup || !mobile) return;
    setLoading(true);
    try {
      const encoded = encodeURIComponent(lookup);
      const endpoint = lookup.toUpperCase().startsWith("AR-") ? `/api/orders/${encoded}` : `/api/track/${encoded}`;
      const response = await fetch(`${endpoint}?phone=${encodeURIComponent(mobile)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Order not found.");
      setOrder(data.order);
    } catch (error) {
      setOrder(null);
      toast.error(error instanceof Error ? error.message : "Order not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/25">
        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[420px_1fr]">
          <form onSubmit={submit} className="h-fit rounded-lg border border-gold/30 bg-card p-6 shadow-luxe">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-luxe text-primary-foreground">
                <PackageSearch className="h-5 w-5" />
              </div>
              <div>
                <span className="ornament">Tracking</span>
                <h1 className="font-serif text-3xl">Find Order</h1>
              </div>
            </div>

            <label className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Order ID or tracking code</label>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="AR-20260628-ABCD"
              className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-gold/30"
            />

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Mobile number</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="10 digit phone"
              className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-gold/30"
            />

            <button
              type="submit"
              disabled={loading || !code.trim() || phone.replace(/\D/g, "").length < 10}
              className="shine-sweep tap-scale mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-luxe font-bold text-primary-foreground shadow-gold disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {loading ? "Checking" : "Track order"}
            </button>
          </form>

          <div className="rounded-lg border border-border bg-card p-5 shadow-luxe">
            {!order ? (
              <div className="grid min-h-[420px] place-items-center text-center">
                <div>
                  <Truck className="mx-auto h-12 w-12 text-gold" />
                  <h2 className="mt-4 font-serif text-3xl">Order status appears here</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Use the order ID or tracking code from checkout.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">{order.status.replaceAll("_", " ")}</p>
                    <h2 className="mt-2 font-serif text-3xl">{order.id}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Tracking: {order.trackingCode}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-serif text-3xl">{formatINR(order.totals.total)}</p>
                    <p className="text-xs font-semibold text-muted-foreground">Payment: {order.paymentStatus}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Info label="Customer" value={`${order.customer.name} · ${order.customer.phone}`} />
                  <Info label="Delivery" value={`${order.customer.address}, ${order.customer.pincode}`} />
                  <Info label="Courier" value={order.courier || "Awaiting dispatch"} />
                  <Info label="AWB" value={order.trackingNumber || "Not assigned"} />
                </div>

                <div className="mt-6">
                  <h3 className="font-serif text-2xl">Items</h3>
                  <div className="mt-3 space-y-2">
                    {order.items.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex flex-wrap justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm">
                        <span>{item.name} · {item.size} × {item.qty}</span>
                        <strong>{formatINR(item.lineTotal)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-serif text-2xl">Timeline</h3>
                  <div className="mt-4 space-y-4">
                    {order.tracking.map((event, index) => (
                      <div key={`${event.status}-${event.at}`} className="grid grid-cols-[28px_1fr] gap-3">
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="h-5 w-5 text-gold" />
                          {index < order.tracking.length - 1 && <span className="mt-2 h-full w-px bg-border" />}
                        </div>
                        <div className="pb-4">
                          <p className="font-bold">{event.label}</p>
                          <p className="text-sm text-muted-foreground">{event.note}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{new Date(event.at).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
