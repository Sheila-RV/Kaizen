"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  bestieId: string;
  name: string;
  emoji: string;
  done: number;
  total: number;
}

/** Mini tarjeta "rival" del bestie hoy; se actualiza al instante via realtime cuando marca algo. */
export function BestieToday({ bestieId, name, emoji, done, total }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`bestie-hoy-${bestieId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_logs", filter: `user_id=eq.${bestieId}` },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bestieId, router]);

  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = total > 0 && done === total;

  return (
    <div className="card-soft flex items-center gap-3 p-3.5">
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface-2 text-xl">
        {emoji}
        <span
          className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-surface bg-success"
          aria-hidden
        />
        <span className="sr-only">En línea</span>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold">
            <span className="text-muted font-normal">Hoy · </span>
            {name}
          </p>
          <span className="stat shrink-0 text-sm">
            {done}/{total}
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${allDone ? "bg-success" : "groovy-bar"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
