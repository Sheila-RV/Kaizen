import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUser } from "@/lib/supabase/server";
import { CHALLENGE_END, TOTAL_DAYS, dayNumber, todayISO } from "@/lib/challenge";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";
import { CATEGORY_META, type Category } from "@/lib/types";
import { FullLogo, Sun } from "@/components/ui/brand";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { LoginForm } from "./login-form";

const ERROR_MESSAGES: Record<string, string> = {
  auth: "El enlace ya expiró o no es válido. Pide uno nuevo.",
};

const CATEGORIES: Category[] = ["mente", "fisico", "espiritual"];

const CATEGORY_CHIP_CLASS: Record<Category, string> = {
  mente: "border-mente/50 text-mente",
  fisico: "border-fisico/50 text-fisico",
  espiritual: "border-espiritual/50 text-espiritual",
};

function formatEnd(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-BO", { day: "numeric", month: "long" });
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getUser();
  if (user) redirect("/");

  const { error } = await searchParams;
  const errorMessage = typeof error === "string" ? (ERROR_MESSAGES[error] ?? error) : undefined;

  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  const day = dayNumber(todayISO());
  const countdown =
    day < 1
      ? `Faltan ${1 - day} día${1 - day === 1 ? "" : "s"} para empezar`
      : day > TOTAL_DAYS
        ? "¡Los 100 días llegaron a su fin!"
        : `Día ${day} de ${TOTAL_DAYS}`;

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <Sun
        size={480}
        spin
        priority
        className="pointer-events-none absolute -top-40 -right-40 opacity-[0.14] sm:-top-52 sm:-right-52"
      />

      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher initial={theme} />
      </div>

      <div className="relative z-0 w-full max-w-sm">
        <div className="animate-rise mb-6 text-center">
          <FullLogo width={220} priority className="mx-auto" />
          <p className="mt-4 text-sm text-balance text-muted">
            Los últimos 100 días del año. Un reto entre besties: mente, físico y espiritual, hasta el{" "}
            {formatEnd(CHALLENGE_END)}.
          </p>
          <span className="stat mt-3 inline-block rounded-full border-2 border-ink bg-mostaza px-3 py-1 text-xs font-bold text-[#2a1a10] shadow-sticker-sm">
            {countdown}
          </span>
        </div>

        <div className="animate-rise mb-6 flex justify-center gap-2" style={{ animationDelay: "80ms" }}>
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <span
                key={cat}
                className={`chip border-2 bg-surface ${CATEGORY_CHIP_CLASS[cat]}`}
              >
                <span aria-hidden>{meta.emoji}</span> {meta.label}
              </span>
            );
          })}
        </div>

        <div className="card animate-rise p-6" style={{ animationDelay: "160ms" }}>
          <LoginForm initialError={errorMessage} />
        </div>

        <p className="wavy animate-rise mt-8" style={{ animationDelay: "240ms" }} />
      </div>
    </div>
  );
}
