import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Header, Footer } from "@/components/site/Header";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, products } from "@/lib/products";

const search = z.object({
  cat: z.enum(["All","Saree","Kurti","Lehenga","Sharara"]).optional(),
  sort: z.enum(["new","low","high"]).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Shop Ethnic Wear · ARIOMAC" },
      { name: "description", content: "Browse sarees, kurtis, lehengas and sharara suits at Ariomac." },
      { property: "og:title", content: "Shop · ARIOMAC" },
      { property: "og:description", content: "Festive edit of luxe Indian ethnic wear." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { cat = "All", sort = "new", q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const query = q.trim().toLowerCase();
  let list = cat === "All" ? products : products.filter((p) => p.category === cat);
  if (query) {
    list = list.filter((p) =>
      [p.name, p.category, p.fabric, p.tagline, p.description]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }
  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="bg-luxe text-primary-foreground py-14">
        <div className="max-w-7xl mx-auto px-6">
          <span className="ornament">Collection</span>
          <h1 className="font-serif text-4xl md:text-6xl mt-3">The Festive Edit</h1>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl">
            {query
              ? `Showing styles matching "${q.trim()}".`
              : "All 8 styles — curated for weddings, pujas and quiet evenings alike."}
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => navigate({ search: (s: z.infer<typeof search>) => ({ ...s, cat: c === "All" ? undefined : c }) })}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                  (cat ?? "All") === c
                    ? "bg-luxe text-primary-foreground border-transparent"
                    : "border-border hover:border-gold hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => navigate({ search: (s: z.infer<typeof search>) => ({ ...s, sort: e.target.value as "new"|"low"|"high" }) })}
            className="px-3 py-1.5 text-sm rounded-full border border-border bg-background"
          >
            <option value="new">Newest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        {list.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">
            {query ? "No products found for this search." : "No products in this category yet."}
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {list.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 60} />)}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
