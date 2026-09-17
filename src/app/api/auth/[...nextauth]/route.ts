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
          profile,
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
          }
        }

        return true;
      } catch (error) {
        console.error("DEBUG AUTH COLLAPSE:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
