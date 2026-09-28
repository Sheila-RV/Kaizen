import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import type { BodyMetric } from "@/lib/types";
import { deleteMetric } from "@/app/(app)/progreso/actions";
import { Sun } from "@/components/ui/brand";
import type { MetricKey } from "./metrics";

function fmtDate(iso: string) {
  return format(new Date(`${iso}T12:00:00Z`), "dd MMM yyyy", { locale: es });
}

const COLUMNS: { key: MetricKey; label: string }[] = [
  { key: "weight_kg", label: "Peso" },
  { key: "waist_cm", label: "Cintura" },
  { key: "thigh_cm", label: "Pierna" },
  { key: "arm_cm", label: "Brazo" },
  { key: "chest_cm", label: "Pecho" },
  { key: "body_fat_pct", label: "Grasa" },
];

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteMetric.bind(null, id)}>
      <button
        type="submit"
        aria-label="Eliminar medida"
        className="rounded-full p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </form>
  );
}

export function HistoryTable({ metrics }: { metrics: BodyMetric[] }) {
  if (metrics.length === 0) {
    return (
      <div className="card-soft animate-rise flex flex-col items-center gap-3 border-dashed p-10 text-center">
        <Sun size={36} />
        <p className="text-sm text-muted">Registra tu medida inicial para ver tu historial aquí.</p>
      </div>
    );
  }

  const sorted = [...metrics].sort((a, b) => b.measured_on.localeCompare(a.measured_on));

  return (
    <>
      {/* Tabla: pantallas sm y mayores */}
      <div className="card animate-rise hidden overflow-hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="bg-surface-2 text-xs font-bold tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} className="px-4 py-3">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((m, i) => (
                <tr key={m.id} className={i % 2 === 1 ? "bg-surface-2/50" : ""}>
                  <td className="px-4 py-3 font-bold whitespace-nowrap">{fmtDate(m.measured_on)}</td>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="stat px-4 py-3">
                      {m[c.key] ?? "—"}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <DeleteButton id={m.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards: pantallas menores a sm */}
      <div className="flex flex-col gap-3 sm:hidden">
        {sorted.map((m) => (
          <div key={m.id} className="card-soft p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-bold">{fmtDate(m.measured_on)}</p>
              <DeleteButton id={m.id} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {COLUMNS.map((c) => (
                <div key={c.key}>
                  <p className="text-[0.65rem] font-bold tracking-wide text-muted uppercase">{c.label}</p>
                  <p className="stat text-sm">{m[c.key] ?? "—"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
