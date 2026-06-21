import { NextRequest, NextResponse } from "next/server";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { query } from "@/lib/db";

async function getUserId(request: NextRequest): Promise<string | null> {
  const idToken = request.cookies.get("id_token")?.value;
  if (!idToken) return null;

  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;
  if (!userPoolId || !clientId) return null;

  try {
    const verifier = CognitoJwtVerifier.create({ userPoolId, tokenUse: "id", clientId });
    const payload = await verifier.verify(idToken);
    return payload.sub;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await query(
    "SELECT * FROM projects WHERE user_id = $1 AND is_archived = false ORDER BY updated_at DESC",
    [userId]
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, phase } = await request.json();
  const result = await query(
    "INSERT INTO projects (user_id, name, description, phase) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, name, description || "", phase || "PreD"]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
