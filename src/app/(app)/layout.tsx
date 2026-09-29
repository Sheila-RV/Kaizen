import Link from "next/link";
import { LogOut } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { dayNumber, todayISO, TOTAL_DAYS } from "@/lib/challenge";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";
import { Sun, Wordmark } from "@/components/ui/brand";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { NavLinks } from "./nav-links";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();
  if (!user) redirect("/login");

  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  const day = Math.min(Math.max(dayNumber(todayISO()), 0), TOTAL_DAYS);
  const pct = Math.round((day / TOTAL_DAYS) * 100);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-ink bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-3 pb-2 sm:gap-5">
          <Link href="/" className="group flex shrink-0 items-center gap-2" aria-label="KAIZEN, ir a Hoy">
            <Sun size={38} priority className="transition-transform duration-700 group-hover:rotate-90" />
            <Wordmark height={24} priority className="hidden sm:block" />
          </Link>

          <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-mostaza px-3 py-1 text-[#2a1a10] shadow-sticker-sm">
            <span className="text-[0.65rem] font-bold tracking-widest uppercase">Día</span>
            <span className="stat text-lg leading-none">{day}</span>
            <span className="stat text-xs opacity-70">/{TOTAL_DAYS}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitcher initial={theme} />
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn btn-secondary px-3" aria-label="Cerrar sesión" title="Cerrar sesión">
                <LogOut className="size-4" aria-hidden />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-2">
          <NavLinks />
        </div>

        {/* progreso del reto a lo ancho del header */}
        <div className="h-1.5 w-full bg-surface-2">
          <div className="groovy-bar h-full transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 pb-8 text-xs text-muted">
        <Sun size={16} />
        <span>改善 · un poquito mejor cada día</span>
      </footer>
    </div>
  );
}
