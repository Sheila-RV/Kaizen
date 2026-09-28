/** Insignia groovy "VS" entre las dos tarjetas de jugador. */
export function VsBadge() {
  return (
    <div className="relative z-10 flex shrink-0 items-center justify-center">
      <div className="display flex size-16 items-center justify-center rounded-full border-2 border-ink bg-accent text-xl text-accent-foreground shadow-sticker">
        VS
      </div>
    </div>
  );
}
