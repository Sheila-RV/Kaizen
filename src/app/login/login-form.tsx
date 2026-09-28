"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | undefined>(initialError);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setStatus("sending");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        ...(displayName.trim() ? { data: { display_name: displayName.trim() } } : {}),
      },
    });

    if (signInError) {
      setError("No pudimos enviar el enlace. Revisa el correo e intenta de nuevo.");
      setStatus("idle");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="animate-pop text-center">
        <p className="text-5xl" aria-hidden>
          📬
        </p>
        <h2 className="display mt-3 text-xl">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-muted">
          Te enviamos un enlace mágico a <span className="font-semibold text-foreground">{email}</span>. Ábrelo desde
          este dispositivo para entrar.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="btn btn-ghost mt-5">
          Usar otro correo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-2 text-center">
        <h2 className="display text-xl">Entrar</h2>
        <p className="mt-1 text-sm text-muted">Sin contraseña: te mandamos un enlace mágico.</p>
      </div>

      <div>
        <label htmlFor="email" className="label">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="field"
        />
      </div>
      <div>
        <label htmlFor="displayName" className="label">
          Nombre <span className="font-normal normal-case text-muted">(solo la primera vez)</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="¿Cómo te llamas?"
          className="field"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border-2 border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full">
        {status === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Enviando…
          </>
        ) : (
          <>
            <Mail className="size-4" aria-hidden />
            Enviar enlace mágico
          </>
        )}
      </button>
      <p className="flex items-center justify-center gap-1 text-center text-xs text-muted">
        <Sparkles className="size-3.5" aria-hidden />
        Un clic y estás dentro.
      </p>
    </form>
  );
}
