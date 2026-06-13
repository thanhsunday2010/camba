import type { NextAuthConfig } from "next-auth";

/**
 * Shared auth config — no Prisma/bcrypt (safe for Edge).
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const id = user.id ?? token.sub;
        if (id) token.id = id;
        const u = user as { role?: string; targetExam?: string };
        if (u.role) token.role = u.role;
        if (u.targetExam) token.targetExam = u.targetExam;
      }
      if (trigger === "update" && session?.targetExam) {
        token.targetExam = session.targetExam as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "STUDENT";
        session.user.targetExam = (token.targetExam as string) ?? "KET";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
