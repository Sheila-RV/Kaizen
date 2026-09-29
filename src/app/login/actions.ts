"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

/** Es un duelo: solo hay lugar para dos jugadoras. */
const MAX_PLAYERS = 2;

/**
 * Entra solo con el correo, sin enviar nada. Los dos primeros correos quedan como
 * jugadoras; despues solo ellos pueden entrar. La sesion se abre con un token generado
 * en el servidor.
 */
export async function signInWithEmail(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email.includes("@")) {
    return { error: "Escribe un correo válido." };
  }

  const admin = createAdminClient();

  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 50 });
  if (listError) {
    return { error: "No pudimos iniciar sesión. Intenta de nuevo." };
  }

  const exists = list.users.some((u) => u.email?.toLowerCase() === email);
  if (!exists) {
    if (list.users.length >= MAX_PLAYERS) {
      return { error: "El reto ya tiene sus dos jugadoras. Revisa que el correo esté bien escrito." };
    }
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: displayName ? { display_name: displayName } : {},
    });
    if (createError) {
      return { error: "No pudimos crear tu cuenta. Intenta de nuevo." };
    }
  }

  const { data, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    return { error: "No pudimos iniciar sesión. Intenta de nuevo." };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (verifyError) {
    return { error: "No pudimos iniciar sesión. Intenta de nuevo." };
  }

  redirect("/");
}
