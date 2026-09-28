"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Refresca la pagina cuando cambian las multas (cron nocturno o marcar como pagada). */
export function RealtimePenalties() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("penalties-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "penalties" }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
