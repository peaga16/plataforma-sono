import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
const bcrypt = require("bcrypt");

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "login",
      credentials: {
        email: {},
        password: {},
        code: {},
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // ── Admin fixo ──────────────────────────────────────────────
        if (
          credentials.email === "admin@sono.com" &&
          credentials.password === "123456"
        ) {
          return {
            id: "admin",
            name: "Pesquisador",
            email: "admin@sono.com",
            role: "admin",
          };
        }

        // ── Login por código (atletas) ───────────────────────────────
        if (credentials.code) {
          const code = credentials.code.trim().toUpperCase();
          const user = await prisma.user.findUnique({
            where: { code },
          });
          if (!user) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: "athlete",
          };
        }

        // ── Fallback: email + senha ──────────────────────────────────
        if (credentials.email && credentials.password) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });
          if (!user || !user.password) return null;
          const match = await bcrypt.compare(credentials.password, user.password);
          if (!match) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: "athlete",
          };
        }

        return null;
      },
    }),
  ],

  session: { strategy: "jwt" as const },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) { token.id = user.id; token.role = user.role; }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },

  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

import { getServerSession } from "next-auth";
export const auth = () => getServerSession(authOptions);
