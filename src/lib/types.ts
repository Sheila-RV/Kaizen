export type Category = "mente" | "fisico" | "espiritual";

export interface Profile {
  id: string;
  display_name: string;
  goal: string | null;
  avatar_emoji: string;
  /** false = pauso su participacion: no aparece en el reto ni genera multas. */
  active: boolean;
  created_at: string;
}

export interface Challenge {
  id: string;
  user_id: string;
  category: Category;
  title: string;
  description: string | null;
  /** 0 = domingo ... 6 = sabado */
  days_of_week: number[];
  active: boolean;
  created_at: string;
}

export interface DailyLog {
  id: string;
  challenge_id: string;
  user_id: string;
  /** YYYY-MM-DD */
  log_date: string;
  completed: boolean;
  photo_url: string | null;
  note: string | null;
  created_at: string;
}

export interface Penalty {
  id: string;
  user_id: string;
  challenge_id: string;
  /** YYYY-MM-DD */
  penalty_date: string;
  amount: number;
  paid: boolean;
  paid_at: string | null;
  created_at: string;
}

export interface BodyMetric {
  id: string;
  user_id: string;
  /** YYYY-MM-DD */
  measured_on: string;
  weight_kg: number | null;
  waist_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  chest_cm: number | null;
  body_fat_pct: number | null;
  note: string | null;
  created_at: string;
}

export const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string }> = {
  mente: { label: "Mente", emoji: "🧠", color: "var(--mente)" },
  fisico: { label: "Físico", emoji: "💪", color: "var(--fisico)" },
  espiritual: { label: "Espiritual", emoji: "🧘", color: "var(--espiritual)" },
};
