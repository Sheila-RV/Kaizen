"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { Camera, Check, Loader2, MessageSquare } from "lucide-react";
import { CATEGORY_META, type Challenge, type DailyLog } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { saveLog } from "@/app/(app)/actions";

interface Props {
  challenge: Challenge;
  initialLog: DailyLog | null;
  /** YYYY-MM-DD */
  date: string;
  userId: string;
}

/** Un reto del dia: check grande estilo sticker, nota opcional y foto de prueba opcional. UI optimista. */
export function ChallengeItem({ challenge, initialLog, date, userId }: Props) {
  const [completed, setCompleted] = useState(initialLog?.completed ?? false);
  const [note, setNote] = useState(initialLog?.note ?? "");
  const [photoUrl, setPhotoUrl] = useState(initialLog?.photo_url ?? null);
  const [showNote, setShowNote] = useState(Boolean(initialLog?.note));
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  const meta = CATEGORY_META[challenge.category];
  // El mostaza/mente es claro en todos los temas: icono oscuro para contraste. Los demas usan blanco.
  const checkColor = challenge.category === "mente" ? "#2a1a10" : "#fff8ec";

  function toggle() {
    const next = !completed;
    setCompleted(next);
    startTransition(async () => {
      try {
        await saveLog({ challengeId: challenge.id, date, completed: next });
      } catch {
        setCompleted(!next);
      }
    });
  }

  function commitNote(value: string) {
    startTransition(async () => {
      try {
        await saveLog({ challengeId: challenge.id, date, note: value || null });
      } catch {
        // el usuario puede reintentar editando de nuevo
      }
    });
  }

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${date}/${challenge.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("proofs").upload(path, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("proofs").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
      // Una foto de prueba cuenta como cumplido (misma regla que el server).
      setCompleted(true);
      await saveLog({ challengeId: challenge.id, date, photoUrl: data.publicUrl });
    } catch {
      // silencioso: se puede reintentar subiendo de nuevo
    } finally {
      setUploading(false);
    }
  }

  return (
    <li
      className={`flex flex-col gap-2.5 rounded-2xl border-2 border-ink bg-surface p-3 shadow-sticker-sm transition-opacity ${completed ? "opacity-75" : ""}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={completed}
          aria-label={completed ? `Marcar "${challenge.title}" como no hecho` : `Marcar "${challenge.title}" como hecho`}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink transition-transform hover:scale-105 active:scale-95 ${completed ? "animate-pop" : ""}`}
          style={{ backgroundColor: completed ? meta.color : "var(--surface-2)", color: completed ? checkColor : "transparent" }}
        >
          <Check className="h-6 w-6" strokeWidth={3} />
        </button>

        <div className="min-w-0 flex-1">
          <p className={`truncate font-bold ${completed ? "text-muted line-through" : ""}`}>{challenge.title}</p>
          {challenge.description && <p className="truncate text-sm text-muted">{challenge.description}</p>}
        </div>

        <button
          type="button"
          onClick={() => setShowNote((s) => !s)}
          aria-label="Agregar nota"
          aria-pressed={showNote}
          className={`btn btn-ghost p-2! ${note ? "text-accent" : ""}`}
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        <label className={`btn btn-ghost p-2! cursor-pointer ${photoUrl ? "text-accent" : ""}`} aria-label="Subir foto de prueba">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} disabled={uploading} />
        </label>
      </div>

      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- foto de usuario en dominio dinamico de Supabase Storage
        <img
          src={photoUrl}
          alt={`Prueba de ${challenge.title}`}
          className="h-24 w-24 rounded-xl border-2 border-ink object-cover shadow-sticker-sm"
        />
      )}

      {showNote && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={(e) => commitNote(e.target.value)}
          placeholder="Nota (opcional)"
          rows={2}
          className="field"
        />
      )}
    </li>
  );
}
