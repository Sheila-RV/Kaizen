"use client";

import { useState } from "react";
import { Pencil, Sparkle, X } from "lucide-react";
import type { Profile } from "@/lib/types";
import { updateProfile } from "@/app/(app)/retos/actions";
import { EMOJI_OPTIONS } from "./constants";

export function ProfileCard({ profile, editable }: { profile: Profile | null; editable: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatar_emoji ?? "🔥");

  const avatarBg = editable ? "bg-mostaza text-[#2a1a10]" : "bg-magenta text-white";

  if (!profile) {
    return (
      <div className="card-soft flex items-center gap-3 p-5 text-sm text-muted">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-border text-2xl">
          🐣
        </span>
        Tu bestie todavía no tiene perfil.
      </div>
    );
  }

  if (editable && isEditing) {
    return (
      <form
        action={async (formData) => {
          await updateProfile(formData);
          setIsEditing(false);
        }}
        className="card space-y-4 p-5"
      >
        <div>
          <label className="label" htmlFor="display_name">
            Nombre
          </label>
          <input id="display_name" name="display_name" defaultValue={profile.display_name} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="goal">
            Meta del reto
          </label>
          <input
            id="goal"
            name="goal"
            defaultValue={profile.goal ?? ""}
            placeholder="p.ej. bajar peso y subir pierna"
            className="field"
          />
        </div>
        <div>
          <span className="label">Avatar</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <input type="hidden" name="avatar_emoji" value={avatarEmoji} />
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatarEmoji(emoji)}
                aria-pressed={avatarEmoji === emoji}
                aria-label={`Usar avatar ${emoji}`}
                className={`flex size-9 items-center justify-center rounded-full border-2 text-lg transition-transform hover:scale-110 ${
                  avatarEmoji === emoji ? "border-ink bg-mostaza shadow-sticker-sm" : "border-border"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost">
            <X className="size-4" aria-hidden />
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="card relative flex items-start gap-4 overflow-hidden p-5">
      <span
        className={`flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-ink text-3xl shadow-sticker-sm ${avatarBg}`}
        aria-hidden
      >
        {profile.avatar_emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="display truncate text-lg">{profile.display_name}</p>
          <span className="chip shrink-0">
            {editable ? (
              <>
                <Sparkle className="size-3" aria-hidden /> Tú
              </>
            ) : (
              "Bestie"
            )}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">{profile.goal || "Sin meta todavía"}</p>
      </div>
      {editable && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Editar perfil"
          className="btn btn-ghost shrink-0 p-2!"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
