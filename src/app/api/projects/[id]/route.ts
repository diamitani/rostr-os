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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await query("SELECT * FROM projects WHERE id = $1 AND user_id = $2", [id, userId]);
  if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(result.rows[0]);
}
