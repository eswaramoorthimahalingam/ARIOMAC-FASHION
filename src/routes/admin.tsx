import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { formatINR } from "@/lib/cart";
import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  IndianRupee,
  LogOut,
  Plus,
  PackageCheck,
  RefreshCw,
  Save,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  sizes: string[];
  sizeStock: Record<string, number>;
  lowStockThreshold: number;
  active: boolean;
  stock: number;
  lowStock: boolean;
};

type Order = {
  id: string;
  trackingCode: string;
  customer: { name: string; phone: string; address: string; pincode: string };
  items: Array<{ productId: string; name: string; size: string; qty: number; price: number; lineTotal: number }>;
  totals: { subtotal: number; shipping: number; discount: number; total: number };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: OrderStatus;
  courier: string;
  trackingNumber: string;
  tracking: Array<{ status: OrderStatus; label: string; note: string; at: string }>;
  createdAt: string;
};

type Summary = { orders: number; pending: number; revenue: number; lowStock: number };
type ProductForm = {
  id: string;
  name: string;
  category: "Saree" | "Kurti" | "Lehenga" | "Sharara";
  price: number;
  mrp: number;
  sizes: string;
  stock: number;
  lowStockThreshold: number;
  active: boolean;
};

const statuses: Array<{ value: OrderStatus; label: string }> = [
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;
const categories = ["Saree", "Kurti", "Lehenga", "Sharara"] as const;
const defaultProductForm: ProductForm = {
  id: "",
  name: "",
  category: "Saree",
  price: 999,
  mrp: 1499,
  sizes: "Free Size",
  stock: 5,
  lowStockThreshold: 5,
  active: true,
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · ARIOMAC" },
      { name: "description", content: "ARIOMAC inventory, orders and tracking dashboard." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({ orders: 0, pending: 0, revenue: 0, lowStock: 0 });
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savingInventory, setSavingInventory] = useState<string>("");
  const [savingOrder, setSavingOrder] = useState<string>("");
  const [productForm, setProductForm] = useState<ProductForm>(defaultProductForm);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const me = await fetch("/api/admin/auth/me");
      if (!me.ok) {
        navigate({ to: "/admin-login" });
        return;
      }
      const [summaryResponse, inventoryResponse, ordersResponse] = await Promise.all([
        fetch("/api/admin/summary"),
        fetch("/api/admin/inventory"),
        fetch("/api/admin/orders"),
      ]);
      if (!summaryResponse.ok || !inventoryResponse.ok || !ordersResponse.ok) throw new Error("Dashboard failed to load.");
      setSummary((await summaryResponse.json()).summary);
      setInventory((await inventoryResponse.json()).inventory);
      setOrders((await ordersResponse.json()).orders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dashboard failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length,
    [orders],
  );

  const updateInventory = (id: string, updater: (item: InventoryItem) => InventoryItem) => {
    setInventory((items) => items.map((item) => (item.id === id ? updater(item) : item)));
  };

  const saveInventory = async (item: InventoryItem) => {
    setSavingInventory(item.id);
    try {
      const response = await fetch(`/api/admin/inventory/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          price: item.price,
          mrp: item.mrp,
          sizeStock: item.sizeStock,
          lowStockThreshold: item.lowStockThreshold,
          active: item.active,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Inventory update failed.");
      setInventory((items) => items.map((entry) => (entry.id === item.id ? data.item : entry)));
      toast.success(`${item.name} inventory saved`);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Inventory update failed.");
    } finally {
      setSavingInventory("");
    }
  };

  const createProduct = async () => {
    const sizes = productForm.sizes
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);
    if (!productForm.name.trim() || sizes.length === 0) {
      toast.error("Product name and at least one size are required.");
      return;
    }

    setCreatingProduct(true);
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: productForm.id,
          name: productForm.name,
          category: productForm.category,
          price: productForm.price,
          mrp: productForm.mrp,
          sizes,
          sizeStock: Object.fromEntries(sizes.map((size) => [size, productForm.stock])),
          lowStockThreshold: productForm.lowStockThreshold,
          active: productForm.active,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Product could not be added.");
      setInventory((items) => [...items, data.item]);
      setProductForm(defaultProductForm);
      toast.success(`${data.item.name} added to inventory`);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Product could not be added.");
    } finally {
      setCreatingProduct(false);
    }
  };

  const patchOrder = async (order: Order, updates: Partial<Order> & { note?: string }) => {
    setSavingOrder(order.id);
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Order update failed.");
      setOrders((items) => items.map((entry) => (entry.id === order.id ? data.order : entry)));
      toast.success(`${order.id} updated`);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order update failed.");
    } finally {
      setSavingOrder("");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    navigate({ to: "/admin-login" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/25">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="ornament">Operations</span>
              <h1 className="mt-3 font-serif text-4xl font-bold md:text-5xl">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refresh} className="tap-scale inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button onClick={logout} className="tap-scale inline-flex h-10 items-center gap-2 rounded-lg bg-luxe px-4 text-sm font-bold text-primary-foreground">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={IndianRupee} label="Revenue" value={formatINR(summary.revenue)} />
            <Metric icon={PackageCheck} label="Orders" value={String(summary.orders)} />
            <Metric icon={Truck} label="Active" value={String(activeOrders || summary.pending)} />
            <Metric icon={Boxes} label="Low stock" value={String(summary.lowStock)} />
          </div>

          <section className="mt-8 rounded-lg border border-border bg-card shadow-luxe">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
              <h2 className="font-serif text-2xl">Inventory</h2>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{inventory.length} styles</span>
            </div>
            <div className="border-b border-border bg-secondary/20 px-4 py-5 sm:px-5">
              <div className="grid gap-3 lg:grid-cols-[0.7fr_1.2fr_0.65fr_0.55fr_0.55fr_0.9fr_0.5fr_0.5fr_auto]">
                <TextInput
                  label="SKU"
                  value={productForm.id}
                  placeholder="Auto"
                  onChange={(value) => setProductForm((state) => ({ ...state, id: value }))}
                />
                <TextInput
                  label="Product"
                  value={productForm.name}
                  placeholder="Product name"
                  onChange={(value) => setProductForm((state) => ({ ...state, name: value }))}
                />
                <label>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Category</span>
                  <select
                    value={productForm.category}
                    onChange={(event) => setProductForm((state) => ({ ...state, category: event.target.value as ProductForm["category"] }))}
                    className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-semibold outline-none"
                  >
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <CompactNumber
                  label="Price"
                  value={productForm.price}
                  onChange={(value) => setProductForm((state) => ({ ...state, price: value }))}
                />
                <CompactNumber
                  label="MRP"
                  value={productForm.mrp}
                  onChange={(value) => setProductForm((state) => ({ ...state, mrp: value }))}
                />
                <TextInput
                  label="Sizes"
                  value={productForm.sizes}
                  placeholder="S, M, L"
                  onChange={(value) => setProductForm((state) => ({ ...state, sizes: value }))}
                />
                <CompactNumber
                  label="Stock"
                  value={productForm.stock}
                  onChange={(value) => setProductForm((state) => ({ ...state, stock: value }))}
                />
                <CompactNumber
                  label="Alert"
                  value={productForm.lowStockThreshold}
                  onChange={(value) => setProductForm((state) => ({ ...state, lowStockThreshold: value }))}
                />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={createProduct}
                    disabled={creatingProduct}
                    className="tap-scale inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-luxe px-4 text-xs font-bold text-primary-foreground disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" /> {creatingProduct ? "Adding" : "Add"}
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-secondary/60 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Size stock</th>
                    <th className="px-4 py-3">Alert</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Save</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-t border-border align-top">
                      <td className="px-4 py-4">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.id} · {item.category} · {item.stock} in stock</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <NumberInput value={item.price} onChange={(value) => updateInventory(item.id, (entry) => ({ ...entry, price: value }))} />
                          <NumberInput value={item.mrp} onChange={(value) => updateInventory(item.id, (entry) => ({ ...entry, mrp: value }))} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                          {item.sizes.map((size) => (
                            <label key={size} className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
                              <span className="w-14 truncate text-xs font-bold text-muted-foreground">{size}</span>
                              <input
                                type="number"
                                min={0}
                                value={item.sizeStock[size] ?? 0}
                                onChange={(event) =>
                                  updateInventory(item.id, (entry) => ({
                                    ...entry,
                                    sizeStock: { ...entry.sizeStock, [size]: Math.max(0, Number(event.target.value) || 0) },
                                  }))
                                }
                                className="w-16 bg-transparent text-sm font-bold outline-none"
                              />
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <NumberInput
                          value={item.lowStockThreshold}
                          onChange={(value) => updateInventory(item.id, (entry) => ({ ...entry, lowStockThreshold: value }))}
                        />
                        {item.lowStock && <p className="mt-2 text-xs font-bold text-gold">Low stock</p>}
                      </td>
                      <td className="px-4 py-4">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold">
                          <input
                            type="checkbox"
                            checked={item.active}
                            onChange={(event) => updateInventory(item.id, (entry) => ({ ...entry, active: event.target.checked }))}
                          />
                          Active
                        </label>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => saveInventory(item)}
                          disabled={savingInventory === item.id}
                          className="tap-scale inline-flex h-9 items-center gap-2 rounded-lg bg-luxe px-3 text-xs font-bold text-primary-foreground disabled:opacity-60"
                        >
                          <Save className="h-4 w-4" /> Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 rounded-lg border border-border bg-card shadow-luxe">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
              <h2 className="font-serif text-2xl">Orders</h2>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{orders.length} records</span>
            </div>
            <div className="divide-y divide-border">
              {loading && <p className="px-5 py-8 text-sm text-muted-foreground">Loading dashboard...</p>}
              {!loading && orders.length === 0 && <p className="px-5 py-8 text-sm text-muted-foreground">No orders yet.</p>}
              {orders.map((order) => (
                <article key={order.id} className="grid gap-4 px-4 py-5 lg:grid-cols-[1fr_360px] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-xl">{order.id}</h3>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">{order.status.replaceAll("_", " ")}</span>
                      <span className="rounded-full border border-gold/40 px-3 py-1 text-xs font-bold">{formatINR(order.totals.total)}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {order.customer.name} · {order.customer.phone} · {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{order.customer.address}, {order.customer.pincode}</p>
                    <div className="mt-3 grid gap-2">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.productId}-${item.size}`} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm">
                          <span>{item.name} · {item.size} × {item.qty}</span>
                          <strong>{formatINR(item.lineTotal)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                      <span>Track: {order.trackingCode}</span>
                      {order.courier && <span>Courier: {order.courier}</span>}
                      {order.trackingNumber && <span>AWB: {order.trackingNumber}</span>}
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-lg border border-border bg-background p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={order.status}
                        onChange={(event) => patchOrder(order, { status: event.target.value as OrderStatus, note: statusNote(event.target.value as OrderStatus) })}
                        disabled={savingOrder === order.id}
                        className="h-10 rounded-md border border-border bg-card px-3 text-sm"
                      >
                        {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                      </select>
                      <select
                        value={order.paymentStatus}
                        onChange={(event) => patchOrder(order, { paymentStatus: event.target.value as Order["paymentStatus"] })}
                        disabled={savingOrder === order.id}
                        className="h-10 rounded-md border border-border bg-card px-3 text-sm"
                      >
                        {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                    <input
                      defaultValue={order.courier}
                      onBlur={(event) => event.target.value !== order.courier && patchOrder(order, { courier: event.target.value })}
                      placeholder="Courier"
                      className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none"
                    />
                    <input
                      defaultValue={order.trackingNumber}
                      onBlur={(event) => event.target.value !== order.trackingNumber && patchOrder(order, { trackingNumber: event.target.value })}
                      placeholder="Tracking number"
                      className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none"
                    />
                    <div className="space-y-2 border-t border-border pt-3">
                      {order.tracking.slice(-3).map((event) => (
                        <div key={`${order.id}-${event.at}`} className="flex gap-2 text-xs">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                          <p><strong>{event.label}</strong> · {new Date(event.at).toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gold/25 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <Icon className="h-5 w-5 text-gold" />
      </div>
      <p className="mt-3 font-serif text-3xl font-bold">{value}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-semibold outline-none"
      />
    </label>
  );
}

function CompactNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-bold outline-none"
      />
    </label>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
      className="h-10 w-24 rounded-md border border-border bg-background px-3 text-sm font-bold outline-none"
    />
  );
}

function statusNote(status: OrderStatus) {
  const notes: Record<OrderStatus, string> = {
    placed: "We received your order.",
    confirmed: "Your order has been confirmed.",
    packed: "Your order has been packed.",
    shipped: "Your order has left our studio.",
    out_for_delivery: "Your order is out for delivery.",
    delivered: "Your order has been delivered.",
    cancelled: "Your order has been cancelled.",
  };
  return notes[status];
}
