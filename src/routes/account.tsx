import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { formatINR } from "@/lib/cart";
import { useEffect, useState } from "react";
import { LogOut, PackageSearch, UserRound } from "lucide-react";
import { toast } from "sonner";

type User = { id: string; name: string; email: string; phone: string; createdAt: string };
type Order = {
  id: string;
  trackingCode: string;
  status: string;
  totals: { total: number };
  createdAt: string;
  items: Array<{ name: string; size: string; qty: number }>;
};

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account · ARIOMAC" },
      { name: "description", content: "Your ARIOMAC customer account and orders." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetch("/api/user/me");
        if (!me.ok) {
          navigate({ to: "/login" });
          return;
        }
        const meData = await me.json();
        setUser(meData.user);
        const orderResponse = await fetch("/api/user/orders");
        if (orderResponse.ok) setOrders((await orderResponse.json()).orders);
      } catch {
        toast.error("Account could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const logout = async () => {
    await fetch("/api/user/logout", { method: "POST" });
    toast.success("Logged out");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/25">
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="ornament">My Account</span>
              <h1 className="mt-3 font-serif text-4xl font-bold md:text-5xl">{user?.name ?? "Account"}</h1>
            </div>
            <button onClick={logout} className="tap-scale inline-flex h-10 items-center gap-2 rounded-lg bg-luxe px-4 text-sm font-bold text-primary-foreground">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          {loading ? (
            <p className="mt-8 text-sm text-muted-foreground">Loading account...</p>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
              <aside className="h-fit rounded-lg border border-gold/30 bg-card p-5 shadow-luxe">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-luxe text-primary-foreground">
                  <UserRound className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-serif text-2xl">Profile</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <Info label="Email" value={user?.email ?? ""} />
                  <Info label="Phone" value={user?.phone ?? ""} />
                  <Info label="Customer ID" value={user?.id ?? ""} />
                </div>
              </aside>

              <section className="rounded-lg border border-border bg-card shadow-luxe">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <h2 className="font-serif text-2xl">Orders</h2>
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{orders.length} found</span>
                </div>
                <div className="divide-y divide-border">
                  {orders.length === 0 && (
                    <div className="px-5 py-10 text-center">
                      <PackageSearch className="mx-auto h-10 w-10 text-gold" />
                      <p className="mt-3 text-sm text-muted-foreground">No orders matched this account phone yet.</p>
                      <Link to="/shop" className="mt-4 inline-flex rounded-lg bg-luxe px-4 py-2 text-sm font-bold text-primary-foreground">
                        Shop now
                      </Link>
                    </div>
                  )}
                  {orders.map((order) => (
                    <article key={order.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-xl">{order.id}</h3>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {order.trackingCode} · {new Date(order.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold">{formatINR(order.totals.total)}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-gold">{order.status.replaceAll("_", " ")}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {order.items.map((item) => `${item.name} ${item.size} x${item.qty}`).join(", ")}
                      </p>
                      <Link to="/track" className="mt-3 inline-flex text-sm font-bold text-primary hover:text-gold">
                        Track order
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
