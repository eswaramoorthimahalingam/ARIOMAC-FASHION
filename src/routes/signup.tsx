import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site/Header";
import { useState, type FormEvent } from "react";
import { LockKeyhole, Mail, Phone, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up · ARIOMAC" },
      { name: "description", content: "Create your ARIOMAC customer account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/user/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Signup failed.");
      toast.success(`Welcome to ARIOMAC, ${data.user.name}`);
      navigate({ to: "/account" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <section className="mx-auto grid min-h-[68vh] max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1fr_440px]">
          <div>
            <span className="ornament">Join ARIOMAC</span>
            <h1 className="mt-4 font-serif text-4xl font-bold md:text-6xl">Create Account</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Save your details, track orders, and make your next checkout quicker.
            </p>
          </div>

          <form onSubmit={submit} className="rounded-lg border border-gold/30 bg-card p-6 shadow-luxe">
            <h2 className="font-serif text-2xl">Signup</h2>
            <Field icon={UserRound} label="Name" value={form.name} onChange={(value) => setForm((state) => ({ ...state, name: value }))} autoComplete="name" />
            <Field icon={Mail} label="Email" value={form.email} onChange={(value) => setForm((state) => ({ ...state, email: value }))} type="email" autoComplete="email" />
            <Field icon={Phone} label="Phone" value={form.phone} onChange={(value) => setForm((state) => ({ ...state, phone: value }))} autoComplete="tel" />
            <Field icon={LockKeyhole} label="Password" value={form.password} onChange={(value) => setForm((state) => ({ ...state, password: value }))} type="password" autoComplete="new-password" />

            <button
              type="submit"
              disabled={loading}
              className="shine-sweep tap-scale mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-luxe font-bold text-primary-foreground shadow-gold disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating account" : "Create account"}
            </button>
            <Link to="/login" className="mt-4 block text-center text-xs font-semibold text-muted-foreground hover:text-primary">
              Already have an account? Login
            </Link>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-border bg-background px-3">
        <Icon className="h-4 w-4 text-gold" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={type}
          autoComplete={autoComplete}
          required
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </span>
    </label>
  );
}
