import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config — used by middleware (no Prisma/bcrypt).
 * Full providers live in auth.ts (Node.js only).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.targetExam = user.targetExam;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.targetExam = token.targetExam as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
