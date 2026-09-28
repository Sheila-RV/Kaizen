"use client";

import { useEffect, useState } from "react";
import { CATEGORY_META, type Category } from "@/lib/types";
import { Sun } from "@/components/ui/brand";

interface CategoryProgress {
  done: number;
  total: number;
}

interface Props {
  byCategory: Record<Category, CategoryProgress>;
  overallDone: number;
  overallTotal: number;
  size?: number;
}

const CATEGORIES: Category[] = ["mente", "fisico", "espiritual"];
/** Hueco entre segmentos, en unidades de pathLength (0-100 = circulo completo). */
const GAP = 4;
const SEGMENT = 100 / 3;
const DRAWABLE = SEGMENT - GAP;

/**
 * Anillo de progreso de hoy: un segmento por categoria (tercio del circulo),
 * cada uno se llena con el color de la categoria segun su % de cumplimiento.
 * Al montar, anima de 0 al valor real (efecto "se dibuja").
 */
export function DayRing({ byCategory, overallDone, overallTotal, size = 136 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const stroke = 13;
  const radius = size / 2 - stroke;
  const allDone = overallTotal > 0 && overallDone === overallTotal;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Progreso de hoy: ${overallDone} de ${overallTotal} retos cumplidos`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} opacity={0.6} />
        {CATEGORIES.map((cat, i) => {
          const p = byCategory[cat];
          const pct = p.total === 0 ? 0 : p.done / p.total;
          const drawn = mounted ? DRAWABLE * pct : 0;
          return (
            <circle
              key={cat}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={CATEGORY_META[cat].color}
              strokeWidth={stroke}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${drawn} ${100 - drawn}`}
              strokeDashoffset={-(i * SEGMENT)}
              style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.3,1,.4,1)", transitionDelay: `${i * 90}ms` }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {allDone ? (
          <Sun size={38} spin />
        ) : (
          <>
            <span className="stat text-2xl leading-none">
              {overallDone}/{overallTotal}
            </span>
            <span className="text-[0.62rem] font-bold tracking-widest text-muted uppercase">hoy</span>
          </>
        )}
      </div>
    </div>
  );
}
