import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getUser, createClient } from "@/lib/supabase/server";
import type { Challenge, Profile } from "@/lib/types";
import { Sun } from "@/components/ui/brand";
import { ProfileCard } from "@/components/retos/profile-card";
import { ParticipationCard } from "@/components/retos/participation-card";
import { ChallengesSection } from "@/components/retos/challenges-section";
import { Templates } from "@/components/retos/templates";

export default async function RetosPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [{ data: profiles }, { data: challenges }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("challenges").select("*").order("created_at"),
  ]);

  const allProfiles = (profiles ?? []) as Profile[];
  const allChallenges = (challenges ?? []) as Challenge[];

  const myProfile = allProfiles.find((p) => p.id === user.id) ?? null;
  // Las demas personas activas; quien pauso su participacion no aparece.
  const others = allProfiles.filter((p) => p.id !== user.id && p.active);

  const myChallenges = allChallenges.filter((c) => c.user_id === user.id);

  return (
    <div className="relative space-y-8 pb-16">
      <Sun size={320} className="pointer-events-none absolute -top-16 -right-16 -z-10 opacity-[0.08]" />

      <header className="animate-rise flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl">Mis retos</h1>
          <p className="text-sm text-muted">Perfil, retos y horarios del reto de 100 días.</p>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-secondary">
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="animate-rise grid gap-4 sm:grid-cols-2" style={{ animationDelay: "80ms" }}>
        <ProfileCard profile={myProfile} editable />
        {others.length === 0 ? (
          <ProfileCard profile={null} editable={false} />
        ) : (
          others.map((p) => <ProfileCard key={p.id} profile={p} editable={false} />)
        )}
      </section>

      {myProfile && (
        <div className="animate-rise" style={{ animationDelay: "120ms" }}>
          <ParticipationCard active={myProfile.active} />
        </div>
      )}

      <div className="animate-rise" style={{ animationDelay: "160ms" }}>
        <Templates />
      </div>

      <div className="animate-rise" style={{ animationDelay: "240ms" }}>
        <ChallengesSection title="Mis retos" challenges={myChallenges} editable />
      </div>
      {others.map((p) => (
        <div key={p.id} className="animate-rise" style={{ animationDelay: "320ms" }}>
          <ChallengesSection
            title={`Retos de ${p.display_name}`}
            challenges={allChallenges.filter((c) => c.user_id === p.id)}
            editable={false}
          />
        </div>
      ))}
    </div>
  );
}
