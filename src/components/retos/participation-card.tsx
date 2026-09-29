import { Pause, Play } from "lucide-react";
import { setParticipation } from "@/app/(app)/retos/actions";

/** Pausar o reanudar mi participacion en el reto. */
export function ParticipationCard({ active }: { active: boolean }) {
  return (
    <div className={`card-soft flex flex-wrap items-center gap-3 p-4 ${active ? "" : "border-danger/40 bg-danger/10"}`}>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{active ? "Participando en el reto" : "Tu participación está en pausa"}</p>
        <p className="text-sm text-muted">
          {active
            ? "Si pausas, no apareces en el reto ni generas multas. Tus multas anteriores se conservan."
            : "No apareces en el reto ni generas multas. Vuelve cuando quieras."}
        </p>
      </div>
      <form action={setParticipation.bind(null, !active)}>
        <button type="submit" className={`btn ${active ? "btn-secondary" : "btn-primary"}`}>
          {active ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          {active ? "Pausar mi participación" : "Volver al reto"}
        </button>
      </form>
    </div>
  );
}
