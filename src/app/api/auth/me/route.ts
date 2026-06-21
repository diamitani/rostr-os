import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET(request: Request) {
  const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  try {
    const user = await getUser(accessToken);
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
