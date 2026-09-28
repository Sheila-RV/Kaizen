import { Flame, HandCoins, Trophy } from "lucide-react";
import { CATEGORY_META, type Category, type Profile } from "@/lib/types";

export interface DuelCard {
  profile: Profile;
  current: number;
  best: number;
  overallPct: number;
  byCategory: Record<Category, number>;
  owed: number;
  total: number;
}

const CATEGORIES: Category[] = ["mente", "fisico", "espiritual"];

/** Tarjeta de jugador para /duelo: avatar, rachas, anillo de cumplimiento y barras por categoria. */
export function PlayerCard({ data, leading }: { data: DuelCard; leading: boolean }) {
  return (
    <div className={`card relative flex w-full max-w-sm flex-1 flex-col gap-4 p-5 ${leading ? "shadow-sticker-lg" : ""}`} style={leading ? { borderColor: "var(--accent)" } : undefined}>
      {leading && (
        <span className="chip absolute -top-3.5 left-1/2 -translate-x-1/2 border-ink bg-mostaza whitespace-nowrap text-[#2a1a10] shadow-sticker-sm">
          🏆 Líder
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface-2 text-2xl shadow-sticker-sm">
          {data.profile.avatar_emoji}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{data.profile.display_name}</p>
          {data.profile.goal && <p className="truncate text-sm text-muted">{data.profile.goal}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <MiniStat icon={Flame} label="Racha actual" value={`${data.current} d`} />
        <MiniStat icon={Trophy} label="Mejor racha" value={`${data.best} d`} />
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-2 p-3">
        <PercentRing pct={data.overallPct} />
        <div>
          <p className="label mb-0">Cumplimiento</p>
          <p className="stat text-3xl leading-none">{data.overallPct}%</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {CATEGORIES.map((cat) => (
          <CategoryBar key={cat} cat={cat} pct={data.byCategory[cat]} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1.5">
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm">
          <span className="flex items-center gap-1.5 text-muted">
            <HandCoins className="size-4" aria-hidden /> Bs pendiente
          </span>
          <span className="stat font-bold text-danger">{data.owed} Bs</span>
        </div>
        <p className="text-center text-xs text-muted">Multas acumuladas en total: {data.total} Bs</p>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-surface-2 py-2.5 text-center">
      <Icon className="size-4 text-accent" aria-hidden />
      <span className="stat text-xl leading-none">{value}</span>
      <span className="text-[0.65rem] font-semibold tracking-wide text-muted uppercase">{label}</span>
    </div>
  );
}

function CategoryBar({ cat, pct }: { cat: Category; pct: number }) {
  const meta = CATEGORY_META[cat];
  return (
    <div className="flex items-center gap-2 text-sm">
      <span aria-hidden>{meta.emoji}</span>
      <span className="w-16 shrink-0 font-medium" style={{ color: meta.color }}>
        {meta.label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
      </div>
      <span className="stat w-9 text-right text-xs">{pct}%</span>
    </div>
  );
}

/** Anillo de % de cumplimiento; sin animacion (server component, sin JS). */
function PercentRing({ pct, size = 60 }: { pct: number; size?: number }) {
  const stroke = 8;
  const radius = size / 2 - stroke;
  const drawn = Math.max(0, Math.min(100, pct));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${drawn} ${100 - drawn}`}
      />
    </svg>
  );
}
