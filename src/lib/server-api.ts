import { createHash, randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

type Category = "Saree" | "Kurti" | "Lehenga" | "Sharara";
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
  category: Category;
  price: number;
  mrp: number;
  sizes: string[];
  sizeStock: Record<string, number>;
  lowStockThreshold: number;
  active: boolean;
  updatedAt: string;
};

type OrderItem = {
  productId: string;
  name: string;
  size: string;
  qty: number;
  price: number;
  lineTotal: number;
};

type Order = {
  id: string;
  trackingCode: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    pincode: string;
  };
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: OrderStatus;
  courier: string;
  trackingNumber: string;
  tracking: Array<{
    status: OrderStatus;
    label: string;
    note: string;
    at: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
};

type AdminSession = { email: string; role: "admin"; expiresAt: string };
type UserSession = { userId: string; expiresAt: string };

type Store = {
  inventory: InventoryItem[];
  orders: Order[];
  users: User[];
  adminSessions: Record<string, AdminSession>;
  userSessions: Record<string, UserSession>;
  sessions?: Record<string, AdminSession>;
};

const dataDir = path.resolve(process.cwd(), ".data");
const storeFile = path.join(dataDir, "ariomac-store.json");
const adminSessionCookie = "ariomac_admin_session";
const userSessionCookie = "ariomac_user_session";
const adminEmail = process.env.ARIOMAC_ADMIN_EMAIL ?? "admin@ariomac.in";
const adminPassword = process.env.ARIOMAC_ADMIN_PASSWORD ?? "Admin@123";

const statusLabels: Record<OrderStatus, string> = {
  placed: "Order placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const seedInventory: InventoryItem[] = [
  seed("ar-001", "Rani Banarasi Silk Saree", "Saree", 1899, 3499, ["Free Size"], [18]),
  seed("ar-002", "Emerald Kanjivaram Drape", "Saree", 2299, 4199, ["Free Size"], [14]),
  seed("ar-003", "Midnight Sequin Saree", "Saree", 1599, 2999, ["Free Size"], [20]),
  seed("ar-004", "Royal Blue Anarkali", "Kurti", 1199, 2199, ["S", "M", "L", "XL", "XXL"], [8, 12, 11, 9, 5]),
  seed("ar-005", "Marigold Mirror Kurti", "Kurti", 799, 1499, ["S", "M", "L", "XL"], [15, 18, 16, 10]),
  seed("ar-006", "Blush Pink Lehenga Set", "Lehenga", 3299, 5999, ["S", "M", "L", "XL"], [6, 7, 5, 3]),
  seed("ar-007", "Sindoor Bridal Lehenga", "Lehenga", 4899, 8999, ["S", "M", "L", "XL"], [3, 5, 4, 2]),
  seed("ar-008", "Ivory Gota Sharara Suit", "Sharara", 1799, 3299, ["S", "M", "L", "XL"], [7, 9, 8, 4]),
];

function seed(
  id: string,
  name: string,
  category: Category,
  price: number,
  mrp: number,
  sizes: string[],
  stock: number[],
): InventoryItem {
  return {
    id,
    name,
    category,
    price,
    mrp,
    sizes,
    sizeStock: Object.fromEntries(sizes.map((size, index) => [size, stock[index] ?? 0])),
    lowStockThreshold: 5,
    active: true,
    updatedAt: new Date().toISOString(),
  };
}

function totalStock(item: InventoryItem) {
  return Object.values(item.sizeStock).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });
}

function badRequest(message: string) {
  return json({ error: message }, { status: 400 });
}

async function readBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

async function readStore(): Promise<Store> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const data = JSON.parse(await fs.readFile(storeFile, "utf8")) as Store;
    return {
      inventory: data.inventory ?? seedInventory,
      orders: data.orders ?? [],
      users: data.users ?? [],
      adminSessions: data.adminSessions ?? data.sessions ?? {},
      userSessions: data.userSessions ?? {},
    };
  } catch {
    const store: Store = { inventory: seedInventory, orders: [], users: [], adminSessions: {}, userSessions: {} };
    await writeStore(store);
    return store;
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(storeFile, JSON.stringify(store, null, 2), "utf8");
}

function parseCookies(request: Request) {
  return Object.fromEntries(
    (request.headers.get("cookie") ?? "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

async function requireAdmin(request: Request, store: Store) {
  const token = parseCookies(request)[adminSessionCookie];
  if (!token) return null;
  const session = store.adminSessions[token];
  if (!session) return null;
  if (Date.parse(session.expiresAt) < Date.now()) {
    delete store.adminSessions[token];
    await writeStore(store);
    return null;
  }
  return { email: session.email, role: session.role };
}

async function requireUser(request: Request, store: Store) {
  const token = parseCookies(request)[userSessionCookie];
  if (!token) return null;
  const session = store.userSessions[token];
  if (!session) return null;
  if (Date.parse(session.expiresAt) < Date.now()) {
    delete store.userSessions[token];
    await writeStore(store);
    return null;
  }
  const user = store.users.find((entry) => entry.id === session.userId);
  return user ? publicUser(user) : null;
}

function cookieHeaders(cookieName: string, token: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:";
  return {
    "set-cookie": `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure ? "; Secure" : ""}`,
  };
}

function clearCookieHeaders(cookieName: string) {
  return {
    "set-cookie": `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  };
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: createHash("sha256").update(`${salt}:${password}`).digest("hex"),
  };
}

function verifyPassword(user: User, password: string) {
  return hashPassword(password, user.passwordSalt).hash === user.passwordHash;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

function publicInventory(item: InventoryItem) {
  return {
    ...item,
    stock: totalStock(item),
    lowStock: totalStock(item) <= item.lowStockThreshold,
  };
}

function calculateTotals(items: OrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 1499 ? 0 : 79;
  const discount = subtotal >= 2999 ? Math.round(subtotal * 0.1) : 0;
  return { subtotal, shipping, discount, total: subtotal + shipping - discount };
}

function makeOrderId() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `AR-${stamp}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

function makeTrackingCode() {
  return `TRK-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function makeProductId(store: Store) {
  const nextNumber =
    store.inventory
      .map((item) => Number(item.id.match(/^ar-(\d+)$/i)?.[1] ?? 0))
      .reduce((max, value) => Math.max(max, value), 0) + 1;
  return `ar-${String(nextNumber).padStart(3, "0")}`;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

function normalizeProductId(id: string) {
  return id
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createOrder(request: Request, store: Store) {
  const body = await readBody<{
    customer?: { name?: string; phone?: string; address?: string; pincode?: string };
    items?: Array<{ id?: string; productId?: string; size?: string; qty?: number }>;
    paymentMethod?: string;
  }>(request);
  const customer = body.customer;
  const phone = normalizePhone(customer?.phone ?? "");

  if (!customer?.name?.trim()) return badRequest("Customer name is required.");
  if (!/^[6-9]\d{9}$/.test(phone)) return badRequest("Valid 10-digit phone is required.");
  if (!customer.address?.trim() || customer.address.trim().length < 10) return badRequest("Full delivery address is required.");
  if (!/^\d{6}$/.test(customer.pincode ?? "")) return badRequest("Valid 6-digit pincode is required.");
  if (!body.items?.length) return badRequest("Cart is empty.");

  const orderItems: OrderItem[] = [];
  for (const cartItem of body.items) {
    const productId = cartItem.productId ?? cartItem.id ?? "";
    const inventory = store.inventory.find((item) => item.id === productId && item.active);
    const qty = Math.max(1, Number(cartItem.qty) || 0);
    const size = cartItem.size ?? "";
    if (!inventory) return badRequest(`Product ${productId} is unavailable.`);
    if (!inventory.sizes.includes(size)) return badRequest(`${inventory.name} is not available in size ${size}.`);
    if ((inventory.sizeStock[size] ?? 0) < qty) {
      return badRequest(`Only ${inventory.sizeStock[size] ?? 0} left for ${inventory.name} in size ${size}.`);
    }
    orderItems.push({
      productId: inventory.id,
      name: inventory.name,
      size,
      qty,
      price: inventory.price,
      lineTotal: inventory.price * qty,
    });
  }

  for (const item of orderItems) {
    const inventory = store.inventory.find((entry) => entry.id === item.productId);
    if (inventory) {
      inventory.sizeStock[item.size] = Math.max(0, (inventory.sizeStock[item.size] ?? 0) - item.qty);
      inventory.updatedAt = new Date().toISOString();
    }
  }

  const now = new Date().toISOString();
  const order: Order = {
    id: makeOrderId(),
    trackingCode: makeTrackingCode(),
    customer: {
      name: customer.name.trim(),
      phone,
      address: customer.address.trim(),
      pincode: customer.pincode ?? "",
    },
    items: orderItems,
    totals: calculateTotals(orderItems),
    paymentMethod: body.paymentMethod?.trim() || "Cash on Delivery",
    paymentStatus: "pending",
    status: "placed",
    courier: "",
    trackingNumber: "",
    tracking: [{ status: "placed", label: statusLabels.placed, note: "We received your order.", at: now }],
    createdAt: now,
    updatedAt: now,
  };

  store.orders.unshift(order);
  await writeStore(store);
  return json({ order }, { status: 201 });
}

function canViewOrder(
  request: Request,
  order: Order,
  admin: Awaited<ReturnType<typeof requireAdmin>>,
  user: Awaited<ReturnType<typeof requireUser>>,
) {
  if (admin) return true;
  if (user && user.phone === order.customer.phone) return true;
  const phone = normalizePhone(new URL(request.url).searchParams.get("phone") ?? "");
  return phone.length === 10 && phone === order.customer.phone;
}

async function patchInventory(request: Request, store: Store, id: string) {
  const body = await readBody<Partial<InventoryItem>>(request);
  const item = store.inventory.find((entry) => entry.id === id);
  if (!item) return json({ error: "Inventory item not found." }, { status: 404 });

  if (typeof body.price === "number") item.price = Math.max(0, Math.round(body.price));
  if (typeof body.mrp === "number") item.mrp = Math.max(item.price, Math.round(body.mrp));
  if (typeof body.lowStockThreshold === "number") item.lowStockThreshold = Math.max(0, Math.round(body.lowStockThreshold));
  if (typeof body.active === "boolean") item.active = body.active;
  if (body.sizeStock && typeof body.sizeStock === "object") {
    item.sizeStock = Object.fromEntries(
      item.sizes.map((size) => [size, Math.max(0, Math.round(Number(body.sizeStock?.[size]) || 0))]),
    );
  }
  item.updatedAt = new Date().toISOString();
  await writeStore(store);
  return json({ item: publicInventory(item) });
}

async function createInventoryItem(request: Request, store: Store) {
  const body = await readBody<{
    id?: string;
    name?: string;
    category?: Category;
    price?: number;
    mrp?: number;
    sizes?: string[];
    sizeStock?: Record<string, number>;
    lowStockThreshold?: number;
    active?: boolean;
  }>(request);

  const name = body.name?.trim();
  const categories: Category[] = ["Saree", "Kurti", "Lehenga", "Sharara"];
  const category = body.category && categories.includes(body.category) ? body.category : undefined;
  const sizes = (body.sizes ?? [])
    .map((size) => size.trim())
    .filter(Boolean)
    .filter((size, index, list) => list.indexOf(size) === index);
  const id = normalizeProductId(body.id ?? "") || makeProductId(store);

  if (!name) return badRequest("Product name is required.");
  if (!category) return badRequest("Valid product category is required.");
  if (!sizes.length) return badRequest("At least one size is required.");
  if (store.inventory.some((item) => item.id === id)) return badRequest("A product with this SKU already exists.");

  const price = Math.max(0, Math.round(Number(body.price) || 0));
  const mrp = Math.max(price, Math.round(Number(body.mrp) || price));
  if (price <= 0) return badRequest("Product price must be greater than zero.");

  const item: InventoryItem = {
    id,
    name,
    category,
    price,
    mrp,
    sizes,
    sizeStock: Object.fromEntries(
      sizes.map((size) => [size, Math.max(0, Math.round(Number(body.sizeStock?.[size]) || 0))]),
    ),
    lowStockThreshold: Math.max(0, Math.round(Number(body.lowStockThreshold) || 5)),
    active: body.active ?? true,
    updatedAt: new Date().toISOString(),
  };

  store.inventory.push(item);
  await writeStore(store);
  return json({ item: publicInventory(item) }, { status: 201 });
}

async function patchOrder(request: Request, store: Store, id: string) {
  const body = await readBody<{
    status?: OrderStatus;
    paymentStatus?: Order["paymentStatus"];
    courier?: string;
    trackingNumber?: string;
    note?: string;
  }>(request);
  const order = store.orders.find((entry) => entry.id === id);
  if (!order) return json({ error: "Order not found." }, { status: 404 });

  const now = new Date().toISOString();
  if (body.status && statusLabels[body.status] && body.status !== order.status) {
    order.status = body.status;
    order.tracking.push({
      status: body.status,
      label: statusLabels[body.status],
      note: body.note?.trim() || statusLabels[body.status],
      at: now,
    });
  }
  if (body.paymentStatus && ["pending", "paid", "failed", "refunded"].includes(body.paymentStatus)) {
    order.paymentStatus = body.paymentStatus;
  }
  if (typeof body.courier === "string") order.courier = body.courier.trim();
  if (typeof body.trackingNumber === "string") order.trackingNumber = body.trackingNumber.trim();
  order.updatedAt = now;
  await writeStore(store);
  return json({ order });
}

function summary(store: Store) {
  const orders = store.orders;
  const liveOrders = orders.filter((order) => order.status !== "cancelled");
  return {
    orders: orders.length,
    pending: orders.filter((order) => ["placed", "confirmed", "packed"].includes(order.status)).length,
    revenue: liveOrders.reduce((sum, order) => sum + order.totals.total, 0),
    lowStock: store.inventory.filter((item) => totalStock(item) <= item.lowStockThreshold).length,
  };
}

export async function handleApiRequest(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return undefined;

  const store = await readStore();
  const admin = await requireAdmin(request, store);
  const user = await requireUser(request, store);
  const method = request.method.toUpperCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (method === "POST" && url.pathname === "/api/admin/auth/login") {
    const body = await readBody<{ email?: string; password?: string }>(request);
    if ((body.email ?? "").trim().toLowerCase() !== adminEmail.toLowerCase() || body.password !== adminPassword) {
      return json({ error: "Invalid email or password." }, { status: 401 });
    }
    const token = randomBytes(32).toString("hex");
    store.adminSessions[token] = {
      email: adminEmail,
      role: "admin",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    await writeStore(store);
    return json({ user: { email: adminEmail, role: "admin" } }, { headers: cookieHeaders(adminSessionCookie, token, request) });
  }

  if (method === "POST" && url.pathname === "/api/admin/auth/logout") {
    const token = parseCookies(request)[adminSessionCookie];
    if (token) delete store.adminSessions[token];
    await writeStore(store);
    return json({ ok: true }, { headers: clearCookieHeaders(adminSessionCookie) });
  }

  if (method === "GET" && url.pathname === "/api/admin/auth/me") {
    return admin ? json({ user: admin }) : json({ user: null }, { status: 401 });
  }

  if (method === "POST" && url.pathname === "/api/user/signup") {
    const body = await readBody<{ name?: string; email?: string; phone?: string; password?: string }>(request);
    const email = normalizeEmail(body.email ?? "");
    const phone = normalizePhone(body.phone ?? "");
    const password = body.password ?? "";
    if (!body.name?.trim()) return badRequest("Name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Valid email is required.");
    if (!/^[6-9]\d{9}$/.test(phone)) return badRequest("Valid 10-digit phone is required.");
    if (password.length < 6) return badRequest("Password must be at least 6 characters.");
    if (store.users.some((entry) => entry.email === email)) return badRequest("An account already exists with this email.");
    if (store.users.some((entry) => entry.phone === phone)) return badRequest("An account already exists with this phone.");

    const passwordResult = hashPassword(password);
    const newUser: User = {
      id: `USR-${randomBytes(4).toString("hex").toUpperCase()}`,
      name: body.name.trim(),
      email,
      phone,
      passwordSalt: passwordResult.salt,
      passwordHash: passwordResult.hash,
      createdAt: new Date().toISOString(),
    };
    const token = randomBytes(32).toString("hex");
    store.users.push(newUser);
    store.userSessions[token] = {
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    await writeStore(store);
    return json({ user: publicUser(newUser) }, { status: 201, headers: cookieHeaders(userSessionCookie, token, request) });
  }

  if (method === "POST" && url.pathname === "/api/user/login") {
    const body = await readBody<{ email?: string; password?: string }>(request);
    const email = normalizeEmail(body.email ?? "");
    const account = store.users.find((entry) => entry.email === email);
    if (!account || !verifyPassword(account, body.password ?? "")) {
      return json({ error: "Invalid email or password." }, { status: 401 });
    }
    const token = randomBytes(32).toString("hex");
    store.userSessions[token] = {
      userId: account.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    await writeStore(store);
    return json({ user: publicUser(account) }, { headers: cookieHeaders(userSessionCookie, token, request) });
  }

  if (method === "POST" && url.pathname === "/api/user/logout") {
    const token = parseCookies(request)[userSessionCookie];
    if (token) delete store.userSessions[token];
    await writeStore(store);
    return json({ ok: true }, { headers: clearCookieHeaders(userSessionCookie) });
  }

  if (method === "GET" && url.pathname === "/api/user/me") {
    return user ? json({ user }) : json({ user: null }, { status: 401 });
  }

  if (method === "GET" && url.pathname === "/api/user/orders") {
    if (!user) return json({ error: "User login required." }, { status: 401 });
    return json({ orders: store.orders.filter((order) => order.customer.phone === user.phone) });
  }

  if (method === "POST" && url.pathname === "/api/orders") {
    return createOrder(request, store);
  }

  if (method === "GET" && parts[1] === "orders" && parts[2]) {
    const order = store.orders.find((entry) => entry.id.toLowerCase() === decodeURIComponent(parts[2]).toLowerCase());
    if (!order) return json({ error: "Order not found." }, { status: 404 });
    if (!canViewOrder(request, order, admin, user)) return json({ error: "Phone number does not match this order." }, { status: 403 });
    return json({ order });
  }

  if (method === "GET" && parts[1] === "track" && parts[2]) {
    const code = decodeURIComponent(parts[2]).toLowerCase();
    const order = store.orders.find(
      (entry) => entry.trackingCode.toLowerCase() === code || entry.trackingNumber.toLowerCase() === code,
    );
    if (!order) return json({ error: "Tracking code not found." }, { status: 404 });
    if (!canViewOrder(request, order, admin, user)) return json({ error: "Phone number does not match this order." }, { status: 403 });
    return json({ order });
  }

  if (!admin && url.pathname.startsWith("/api/admin/")) {
    return json({ error: "Admin login required." }, { status: 401 });
  }

  if (method === "GET" && url.pathname === "/api/admin/summary") {
    return json({ summary: summary(store) });
  }

  if (method === "GET" && url.pathname === "/api/admin/inventory") {
    return json({ inventory: store.inventory.map(publicInventory) });
  }

  if (method === "POST" && url.pathname === "/api/admin/inventory") {
    return createInventoryItem(request, store);
  }

  if (method === "PATCH" && parts[1] === "admin" && parts[2] === "inventory" && parts[3]) {
    return patchInventory(request, store, decodeURIComponent(parts[3]));
  }

  if (method === "GET" && url.pathname === "/api/admin/orders") {
    return json({ orders: store.orders });
  }

  if (method === "PATCH" && parts[1] === "admin" && parts[2] === "orders" && parts[3]) {
    return patchOrder(request, store, decodeURIComponent(parts[3]));
  }

  return json({ error: "API route not found." }, { status: 404 });
}
