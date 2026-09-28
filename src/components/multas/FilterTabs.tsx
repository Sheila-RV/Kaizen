import Link from "next/link";
import type { ReactNode } from "react";
import type { Profile } from "@/lib/types";

const STATUS_OPTIONS: { value: string | undefined; label: string }[] = [
  { value: undefined, label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "pagado", label: "Pagadas" },
];

function buildHref(user: string | undefined, status: string | undefined) {
  const params = new URLSearchParams();
  if (user) params.set("user", user);
  if (status) params.set("status", status);
  const qs = params.toString();
  return qs ? `/multas?${qs}` : "/multas";
}

function Tab({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
        active ? "bg-accent text-accent-foreground shadow-sticker-sm" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

export function FilterTabs({
  profiles,
  user,
  status,
}: {
  profiles: Profile[];
  user?: string;
  status?: string;
}) {
  return (
    <div className="animate-rise flex flex-wrap items-center gap-3">
      <div
        role="tablist"
        aria-label="Filtrar por persona"
        className="inline-flex flex-wrap gap-1 rounded-full border-2 border-ink bg-surface-2 p-1"
      >
        <Tab href={buildHref(undefined, status)} active={!user}>
          Todos
        </Tab>
        {profiles.map((profile) => (
          <Tab key={profile.id} href={buildHref(profile.id, status)} active={user === profile.id}>
            {profile.avatar_emoji} {profile.display_name}
          </Tab>
        ))}
      </div>
      <div
        role="tablist"
        aria-label="Filtrar por estado"
        className="inline-flex flex-wrap gap-1 rounded-full border-2 border-ink bg-surface-2 p-1"
      >
        {STATUS_OPTIONS.map((opt) => (
          <Tab
            key={opt.label}
            href={buildHref(user, opt.value)}
            active={status === opt.value || (!status && !opt.value)}
          >
            {opt.label}
          </Tab>
        ))}
      </div>
    </div>
  );
}
