"use client";

import { useActionState } from "react";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import { signInWithEmail, type LoginState } from "./actions";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(signInWithEmail, {
    error: initialError,
  });

  return (
    <form action={formAction} className="space-y-4">
      <div className="mb-2 text-center">
        <h2 className="display text-xl">Entrar</h2>
        <p className="mt-1 text-sm text-muted">Sin contraseña: solo tu correo.</p>
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
          placeholder="tu@correo.com"
          className="field"
        />
      </div>
      <div>
        <label htmlFor="displayName" className="label">
          Nombre <span className="font-normal normal-case text-muted">(opcional, solo la primera vez)</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          placeholder="¿Cómo te llamas?"
          className="field"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl border-2 border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Entrando…
          </>
        ) : (
          <>
            <LogIn className="size-4" aria-hidden />
            Entrar
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
