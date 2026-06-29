import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { useState, type FormEvent } from "react";
import { LogIn, Mail, LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Customer Login · ARIOMAC" },
      { name: "description", content: "Login to your ARIOMAC customer account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Login failed.");
      toast.success(`Welcome back, ${data.user.name}`);
      navigate({ to: "/account" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <section className="mx-auto grid min-h-[68vh] max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1fr_420px]">
          <div>
            <span className="ornament">Customer Account</span>
            <h1 className="mt-4 font-serif text-4xl font-bold md:text-6xl">Login</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Sign in to track orders faster and keep your ARIOMAC details ready for checkout.
            </p>
          </div>

          <form onSubmit={submit} className="rounded-lg border border-gold/30 bg-card p-6 shadow-luxe">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-luxe text-primary-foreground">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Customer Login</h2>
                <p className="text-xs text-muted-foreground">New here? Create an account below.</p>
              </div>
            </div>

            <label className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Email</label>
            <div className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-border bg-background px-3">
              <Mail className="h-4 w-4 text-gold" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                type="email"
                autoComplete="username"
                required
              />
            </div>

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Password</label>
            <div className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-border bg-background px-3">
              <LockKeyhole className="h-4 w-4 text-gold" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="shine-sweep tap-scale mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-luxe font-bold text-primary-foreground shadow-gold disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in" : "Sign in"}
            </button>
            <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
              <Link to="/signup" className="hover:text-primary">Create account</Link>
              <Link to="/admin-login" className="hover:text-primary">Admin login</Link>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
