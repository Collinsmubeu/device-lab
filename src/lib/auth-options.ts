import type { AuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase() ?? "cmubeu@gmail.com";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "OWNER" | "WORKER" | "CUSTOMER";
    };
  }
  interface JWT {
    id?: string;
    role?: string;
    accessToken?: string;
  }
}

export type { Session };

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase();
        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.email.split("@")[0],
          role: user.role as "OWNER" | "WORKER" | "CUSTOMER",
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string })?.role;
      }
      // Ensure role is set for Google users based on email
      if (account?.provider === "google" && token.email) {
        const emailLower = token.email.toLowerCase();
        token.role = emailLower === ADMIN_EMAIL ? "OWNER" : "CUSTOMER";
      }
      // Fallback: set role from email if not already set
      if (token.email && !token.role) {
        const emailLower = token.email.toLowerCase();
        token.role = emailLower === ADMIN_EMAIL ? "OWNER" : "CUSTOMER";
      }
      return token as JWT;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "OWNER" | "WORKER" | "CUSTOMER";
      }
      return session as Session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn() {
      return true;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  debug: process.env.NODE_ENV === "development",
};
