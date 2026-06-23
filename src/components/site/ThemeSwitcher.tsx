import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type ThemeId =
  | "noir-gold"
  | "ivory-espresso"
  | "ocean-silver"
  | "emerald-prestige"
  | "midnight-indigo"
  | "blush-rose-gold";

const THEMES: { id: ThemeId; name: string; swatch: string[] }[] = [
  { id: "noir-gold",        name: "Noir & Gold",        swatch: ["#0d0d0d", "#1a1a1a", "#c9a84c", "#f0d78c"] },
  { id: "ivory-espresso",   name: "Ivory & Espresso",   swatch: ["#f7f2e9", "#e8e0d0", "#c9a84c", "#3a2a1f"] },
  { id: "ocean-silver",     name: "Ocean & Silver",     swatch: ["#f1f5fa", "#cdd9e6", "#7892b0", "#15294a"] },
  { id: "emerald-prestige", name: "Emerald Prestige",   swatch: ["#f5f0e0", "#0d7a5f", "#064e3b", "#c9a84c"] },
  { id: "midnight-indigo",  name: "Midnight Indigo",    swatch: ["#0a0a1a", "#141432", "#4f46e5", "#e8c87a"] },
  { id: "blush-rose-gold",  name: "Blush & Rose Gold",  swatch: ["#fdf2f4", "#f4d4dc", "#b76e79", "#3d1f24"] },
];

const STORAGE_KEY = "ariomac:theme";

export function applyStoredTheme() {
  if (typeof window === "undefined") return;
  const t = (localStorage.getItem(STORAGE_KEY) as ThemeId | null) ?? "ivory-espresso";
  document.documentElement.setAttribute("data-theme", t);
}

export function ThemeSwitcher() {
  const [current, setCurrent] = useState<ThemeId>("ivory-espresso");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeId | null) ?? "ivory-espresso";
    setCurrent(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const pick = (id: ThemeId) => {
    setCurrent(id);
    localStorage.setItem(STORAGE_KEY, id);
    document.documentElement.setAttribute("data-theme", id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className="tap-scale inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/35 bg-background/80 text-foreground shadow-sm transition hover:border-gold hover:bg-secondary hover:text-primary"
      >
        <Palette className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs tracking-[0.25em] uppercase text-gold">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onSelect={() => pick(t.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex -space-x-1">
              {t.swatch.map((c) => (
                <span
                  key={c}
                  className="w-4 h-4 rounded-full ring-1 ring-border"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="flex-1 text-sm">{t.name}</span>
            {current === t.id && <Check className="w-4 h-4 text-gold" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
