import { createClient, getUser } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { FilterTabs } from "@/components/multas/FilterTabs";
import { PenaltyList } from "@/components/multas/PenaltyList";
import { RealtimePenalties } from "@/components/multas/RealtimePenalties";
import { TotalsHeader } from "@/components/multas/TotalsHeader";
import type { PenaltyWithChallenge } from "@/components/multas/penalties";

type SearchParams = Promise<{ user?: string; status?: string }>;

export default async function MultasPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getUser();
  if (!user) return null; // el layout de (app) ya redirige a /login

  const { user: userFilter, status: statusFilter } = await searchParams;

  const supabase = await createClient();
  const [{ data: profiles }, { data: allPenalties }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase
      .from("penalties")
      .select("*, challenges(title, category)")
      .order("penalty_date", { ascending: false }),
  ]);

  // Yo primero, siempre.
  const orderedProfiles = ([...(profiles ?? [])] as Profile[]).sort((a, b) =>
    a.id === user.id ? -1 : b.id === user.id ? 1 : 0,
  );

  const allPenaltiesTyped = (allPenalties ?? []) as unknown as PenaltyWithChallenge[];

  let filtered = allPenaltiesTyped;
  if (userFilter) filtered = filtered.filter((p) => p.user_id === userFilter);
  if (statusFilter === "pagado") filtered = filtered.filter((p) => p.paid);
  if (statusFilter === "pendiente") filtered = filtered.filter((p) => !p.paid);

  return (
    <div className="flex flex-col gap-8">
      <RealtimePenalties />

      <div className="animate-rise">
        <h1 className="display text-3xl sm:text-4xl">Multas</h1>
        <p className="text-sm text-muted">50 Bs por cada reto programado que se te escapa.</p>
      </div>

      <TotalsHeader profiles={orderedProfiles} penalties={allPenaltiesTyped} />

      <FilterTabs profiles={orderedProfiles} user={userFilter} status={statusFilter} />

      <PenaltyList penalties={filtered} profiles={orderedProfiles} />
    </div>
  );
}
