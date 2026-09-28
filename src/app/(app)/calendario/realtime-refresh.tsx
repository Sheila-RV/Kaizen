"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Refresca la pagina cuando cambian logs o multas (para ver el calendario al dia). */
export function RealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("calendario-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_logs" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "penalties" }, () => router.refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
