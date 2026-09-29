"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

/**
 * Entra solo con el correo, sin enviar nada. Un correo nuevo crea su cuenta y queda
 * como jugador. La sesion se abre con un token generado en el servidor.
 */
export async function signInWithEmail(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email.includes("@")) {
    return { error: "Escribe un correo válido." };
  }

  const admin = createAdminClient();

  // Si el correo ya tiene cuenta, createUser falla con email_exists y seguimos al login.
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: displayName ? { display_name: displayName } : {},
  });
  if (createError && createError.code !== "email_exists") {
    return { error: "No pudimos crear tu cuenta. Intenta de nuevo." };
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
