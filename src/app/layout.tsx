import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono, Shrikhand } from "next/font/google";
import { cookies } from "next/headers";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";
import "./globals.css";

const groovy = Shrikhand({
  variable: "--font-groovy",
  weight: "400",
  subsets: ["latin"],
});

const body = Bricolage_Grotesque({
  variable: "--font-body",
  subsets: ["latin"],
});

const numbers = DM_Mono({
  variable: "--font-numbers",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KAIZEN · Reto 100 días",
  description: "Los últimos 100 días del año: mente, físico y espiritual. Mejorar un poquito cada día.",
};

export const viewport: Viewport = {
  themeColor: "#ee6a1a",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // El tema viene de una cookie para que el servidor pinte el color correcto sin parpadeo.
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html
      lang="es"
      data-theme={theme}
      className={`${groovy.variable} ${body.variable} ${numbers.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
