import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const OWNER_EMAIL = "cmubeu@gmail.com";

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

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        const password = credentials.password;

        // Dev-only credential fallback
        if (process.env.NODE_ENV !== "production") {
          const DEV_CREDS: Record<string, { password: string; role: "OWNER" | "WORKER" | "CUSTOMER" }> = {
            "owner@device254.dev": { password: "lab254-rock", role: "OWNER" },
            "worker@device254.dev": { password: "work254-pass", role: "WORKER" },
            "client@device254.dev": { password: "client254-pass", role: "CUSTOMER" },
          };

          const devCred = DEV_CREDS[email];
          if (devCred && password === devCred.password) {
            return {
              id: `dev-${email}`,
              email,
              name: email.split("@")[0],
              role: devCred.role,
            };
          }
        }

        // Production: check DB
        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const bcrypt = await import("bcrypt");
        const isValid = await bcrypt.compare(password, user.passwordHash);
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
    async jwt({ token, account, user: jwtUser }) {
      if (account && jwtUser) {
        token.accessToken = account.access_token;
        token.id = jwtUser.id;
        token.role = (jwtUser as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "OWNER" | "WORKER" | "CUSTOMER";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const email = profile.email.toLowerCase();
        const role = email === OWNER_EMAIL ? "OWNER" : "CUSTOMER";

        const existingUser = await db.user.findUnique({ where: { email } });
        if (!existingUser) {
          await db.user.create({
            data: {
              email,
              passwordHash: "",
              role: role as "OWNER" | "WORKER" | "CUSTOMER",
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
