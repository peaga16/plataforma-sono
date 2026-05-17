import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Plataforma do Sono — Desempenho Esportivo",
  description: "Programa de higiene do sono para atletas de alto rendimento",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
