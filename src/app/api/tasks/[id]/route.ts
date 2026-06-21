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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updates = await request.json();

  // Build dynamic UPDATE
  const allowed = ["title", "description", "npao_class", "phase", "status", "estimated_minutes", "done_when", "build_prompt", "sort_order"];
  const sets: string[] = [];
  const values: any[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowed.includes(key)) {
      sets.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }

  if (sets.length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  values.push(id, userId);
  const result = await query(
    `UPDATE tasks SET ${sets.join(", ")} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`,
    values
  );

  if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);

  if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
