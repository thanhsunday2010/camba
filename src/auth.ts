import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { ensureAuthPublicUrl } from "@/lib/auth-url";
import { isPhoneInput, normalizePhone } from "@/lib/auth/phone";
import { loadAdminAccessForToken } from "@/lib/admin/access";

ensureAuthPublicUrl();

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
});

function buildOAuthProviders() {
  const providers = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }
  if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
    providers.push(
      Facebook({
        clientId: process.env.AUTH_FACEBOOK_ID,
        clientSecret: process.env.AUTH_FACEBOOK_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }
  return providers;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    ...buildOAuthProviders(),
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email hoặc SĐT", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const { identifier, password } = parsed.data;
          const user = isPhoneInput(identifier)
            ? await db.user.findUnique({
                where: { phone: normalizePhone(identifier) ?? undefined },
              })
            : await db.user.findUnique({
                where: { email: identifier.toLowerCase() },
              });

          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            targetExam: user.targetExam,
          };
        } catch (error) {
          console.error("[auth authorize] DB error:", error);
          return null;
        }
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await db.user.update({
        where: { id: user.id },
        data: {
          role: "STUDENT",
          targetExam: "KET",
        },
      });
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      if (!user.id) return true;

      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      if (dbUser && account?.provider) {
        await db.user.update({
          where: { id: user.id },
          data: {
            emailVerified: dbUser.emailVerified ?? new Date(),
            image: user.image ?? dbUser.image,
            name: user.name ?? dbUser.name,
          },
        });
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        const dbUser = await db.user.findUnique({ where: { id: user.id } });
        if (dbUser) {
          token.role = dbUser.role;
          token.targetExam = dbUser.targetExam;
          if (dbUser.role === "ADMIN") {
            const adminFields = await loadAdminAccessForToken(user.id);
            token.adminRoleSlug = adminFields.adminRoleSlug;
            token.adminRoleName = adminFields.adminRoleName;
            token.adminPermissions = adminFields.adminPermissions;
          }
        } else {
          const u = user as { role?: string; targetExam?: string };
          if (u.role) token.role = u.role;
          if (u.targetExam) token.targetExam = u.targetExam;
        }
      } else if (token.id && token.role === "ADMIN" && trigger === "update") {
        const adminFields = await loadAdminAccessForToken(token.id as string);
        token.adminRoleSlug = adminFields.adminRoleSlug;
        token.adminRoleName = adminFields.adminRoleName;
        token.adminPermissions = adminFields.adminPermissions;
      }
      if (trigger === "update" && session) {
        if (session.targetExam) token.targetExam = session.targetExam as string;
        if (session.name) token.name = session.name as string;
        if ("image" in session) token.picture = session.image as string | null | undefined;
      }
      return token;
    },
  },
});
