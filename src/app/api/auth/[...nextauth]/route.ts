import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("[AUTH] signIn callback:", {
          user: user.email,
          provider: account?.provider,
          profile: profile ? { email: profile.email } : null,
        });

        if (account?.provider === "google" && profile?.email) {
          const email = profile.email.toLowerCase();

          const existingUser = await db.user.findUnique({
            where: { email },
          });

          if (!existingUser) {
            const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase() ?? "";
            const role = email === ADMIN_EMAIL ? "OWNER" : "CUSTOMER";

            await db.user.create({
              data: {
                email,
                passwordHash: "",
                role: role as "OWNER" | "WORKER" | "CUSTOMER",
              },
            });
            console.log("[AUTH] Created new user:", email, role);
          }
        }

        return true;
      } catch (error) {
        console.error("DEBUG AUTH COLLAPSE:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          code: (error as { code?: string })?.code,
        });
        return false;
      }
    },
    // Add jwt callback to store role
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string })?.role;
      }
      return token;
    },
    // Add session callback to expose role
    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as "OWNER" | "WORKER" | "CUSTOMER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
