import { format } from "date-fns";
import { es } from "date-fns/locale";
import { updatePenalty } from "@/app/(app)/multas/actions";
import { CATEGORY_META } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { Sun } from "@/components/ui/brand";
import { groupByDate, type PenaltyWithChallenge } from "./penalties";

function fmtDate(iso: string) {
  return format(new Date(`${iso}T12:00:00Z`), "dd MMM yyyy", { locale: es });
}

export function PenaltyList({
  penalties,
  profiles,
}: {
  penalties: PenaltyWithChallenge[];
  profiles: Profile[];
}) {
  if (penalties.length === 0) {
    return (
      <div className="card-soft animate-rise flex flex-col items-center gap-3 border-dashed p-10 text-center">
        <Sun size={40} />
        <p className="font-bold text-muted">Sin multas… por ahora 😏</p>
      </div>
    );
  }

  const groups = groupByDate(penalties);

  return (
    <div className="flex flex-col gap-5">
      {groups.map(([date, items], gi) => (
        <div
          key={date}
          className="card animate-rise overflow-hidden p-0"
          style={{ animationDelay: `${gi * 60}ms` }}
        >
          {/* encabezado tipo recibo, con borde perforado */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-border bg-surface-2 px-4 py-2">
            <p className="text-xs font-bold tracking-wide text-muted uppercase">{fmtDate(date)}</p>
            <span className="text-[0.65rem] font-bold tracking-widest text-muted uppercase">Recibo</span>
          </div>

          <div className="flex flex-col gap-2 p-3">
            {items.map((penalty) => {
              const profile = profiles.find((p) => p.id === penalty.user_id);
              const category = penalty.challenges?.category;
              return (
                <div
                  key={penalty.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-background/60 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink text-base"
                      style={{ background: category ? CATEGORY_META[category].color : "var(--surface-2)" }}
                    >
                      {category ? CATEGORY_META[category].emoji : "❓"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {penalty.challenges?.title ?? "Reto eliminado"}
                      </p>
                      <p className="text-xs text-muted">
                        {profile ? `${profile.avatar_emoji} ${profile.display_name}` : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="stat rounded-full border-2 border-ink bg-mostaza px-2.5 py-1 text-xs text-[#2a1a10] shadow-sticker-sm">
                      {Number(penalty.amount)} Bs
                    </span>
                    <span className={`chip ${penalty.paid ? "text-success" : "text-danger"}`}>
                      {penalty.paid ? "Pagado" : "Pendiente"}
                    </span>
                    <form action={updatePenalty.bind(null, penalty.id, !penalty.paid)}>
                      <button type="submit" className="btn btn-secondary">
                        {penalty.paid ? "Deshacer" : "Marcar pagada"}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
