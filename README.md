# KAIZEN · Reto 100 días

改善 — un poquito mejor cada día. Reto de los últimos 100 días del año (23-sep → 31-dic-2026) entre dos besties.
Fondo seleccionable: blanco, negro o café (botones arriba a la derecha).
Retos diarios de **🧠 Mente**, **💪 Físico** y **🧘 Espiritual**; cada reto incumplido = **50 Bs** de multa.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres, Auth, Storage, Realtime, pg_cron) · Recharts · Vercel.

## Pantallas

| Ruta | Qué hace |
|---|---|
| `/` | **Hoy**: retos del día, check, nota y foto de prueba; progreso del bestie en vivo |
| `/duelo` | Rachas, % de cumplimiento y multas, lado a lado |
| `/calendario` | Cuadrícula de 100 días (verde / ámbar / rojo) |
| `/progreso` | Peso y medidas (pierna, brazo, cintura, pecho) con gráficas |
| `/multas` | Historial de multas, bote total, marcar pagadas |
| `/retos` | Perfil y gestión de mis retos (días de la semana, pausar, borrar) |

## Configuración

### 1. Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. **Database → Extensions**: activa `pg_cron`.
3. **SQL Editor**: pega y ejecuta [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Crea las tablas, la seguridad (RLS), el bucket de fotos `proofs`, realtime y el cierre diario
   (00:05 hora Bolivia) que genera las multas.
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3001` (luego la URL de Vercel)
   - Redirect URLs: `http://localhost:3001/auth/callback` y `https://TU-APP.vercel.app/auth/callback`
5. Cuando ambos se hayan registrado, en **Authentication → Providers → Email** desactiva
   *Allow new users to sign up* para que nadie más entre.

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
# llena NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (Project Settings → API)
```

### 3. Correr

```bash
npm install
npm run dev
```

Abre <http://localhost:3001>, entra con tu correo (magic link) y crea tus retos en **Mis retos**.

## Cómo funcionan las multas

Puedes registrar **hoy y ayer** (un día de gracia por si se te olvidó antes de medianoche); días más
viejos quedan bloqueados, también a nivel de base de datos.

La función `close_day(fecha)` corre cada día a las 00:05 (hora Bolivia) y cierra el día **anterior a ayer**:
por cada reto **activo** programado ese día de la semana que **no** esté marcado como cumplido, crea una
multa de 50 Bs. Solo cuenta desde el día en que se creó el reto y dentro del rango del reto.

Para probarla a mano (SQL Editor): `select public.close_day(current_date - 1);`

## Deploy

Importa el repo en [Vercel](https://vercel.com), agrega las dos variables de entorno y listo.
