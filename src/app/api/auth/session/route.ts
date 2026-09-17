import { NextResponse } from "next/server";
import { verify } from "@/lib/auth";
import type { SessionPayload } from "@/lib/auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = cookieHeader
    ? Object.fromEntries(
        cookieHeader
          .split("; ")
          .map((c) => {
            const [name, value] = c.split("=");
            return [name, decodeURIComponent(value)];
          }),
      )
    : {};

  const token = cookies["dl254_session"];
  const session: SessionPayload | null = verify(token);

  return NextResponse.json({ session });
}
