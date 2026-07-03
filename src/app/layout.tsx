import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { LanguageProvider } from "@/components/providers/language-provider";

export const metadata: Metadata = {
  title: "Plataforma do Sono — Desempenho Esportivo",
  description: "Programa de higiene do sono para atletas de alto rendimento",
  other: {
    "Content-Security-Policy": "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval'" />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}