"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Flame, HandCoins, ListChecks, Swords, TrendingUp } from "lucide-react";

const LINKS = [
  { href: "/", label: "Hoy", icon: Flame },
  { href: "/duelo", label: "Duelo", icon: Swords },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/progreso", label: "Progreso", icon: TrendingUp },
  { href: "/multas", label: "Multas", icon: HandCoins },
  { href: "/retos", label: "Mis retos", icon: ListChecks },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 overflow-x-auto px-4 scrollbar-none">
      <ul className="flex w-max gap-1.5 text-sm">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 font-semibold transition-all ${
                  active
                    ? "border-ink bg-accent text-accent-foreground shadow-sticker-sm"
                    : "border-transparent text-muted hover:border-border hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon className="size-4" strokeWidth={2.5} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
