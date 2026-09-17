import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSessionCookie, UserRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole as PrismaUserRole } from "@prisma/client";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const REDIRECT_URI = `${BASE_URL}/api/auth/google`;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ message: `[ OAUTH_FAILED // ${error} ]` }, { status: 400 });
  }

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { message: "[ OAUTH_FAILED // GOOGLE_CLIENT_ID_NOT_CONFIGURED ]" },
      { status: 500 },
    );
  }

  if (!code) {
    // Step 1: Redirect to Google consent screen
    const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    googleUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    googleUrl.searchParams.set("response_type", "code");
    googleUrl.searchParams.set("scope", "openid email profile");
    googleUrl.searchParams.set("access_type", "offline");
    googleUrl.searchParams.set("state", "dl254_oauth");

    return NextResponse.redirect(googleUrl.toString());
  }

  // Step 2: Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const tokenErr = await tokenRes.text();
    return NextResponse.json(
      { message: `[ OAUTH_FAILED // TOKEN_EXCHANGE_ERROR: ${tokenErr} ]` },
      { status: 400 },
    );
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Fetch user info
  const userInfoRes = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
  );

  if (!userInfoRes.ok) {
    return NextResponse.json({ message: "[ OAUTH_FAILED // USER_INFO_ERROR ]" }, { status: 400 });
  }

  const userInfo = await userInfoRes.json();
  const email = userInfo.email.toLowerCase();

  const OWNER_EMAIL = "cmubeu@gmail.com";

  try {
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      const role = email === OWNER_EMAIL ? PrismaUserRole.OWNER : PrismaUserRole.CUSTOMER;

      user = await db.user.create({
        data: {
          email,
          passwordHash: "",
          role,
        },
      });
    }

    const role: UserRole = user.role as UserRole;
    const res = NextResponse.redirect(`${BASE_URL}${ROLE_ROUTES[role]}`);
    res.cookies.set(createSessionCookie(user.id, user.email, role));

    return res;
  } catch (error) {
    console.error("[ SYS_AUTH // GOOGLE_OAUTH_ERROR ]:", error);
    return NextResponse.json({ message: "[ OAUTH_FAILED // SERVER_ERROR ]" }, { status: 500 });
  }
}

const ROLE_ROUTES: Record<UserRole, string> = {
  OWNER: "/admin/dashboard",
  WORKER: "/staff/dashboard",
  CUSTOMER: "/customer/dashboard",
};
