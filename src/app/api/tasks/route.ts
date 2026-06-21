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

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");

  let result;
  if (projectId) {
    result = await query(
      "SELECT * FROM tasks WHERE project_id = $1 AND user_id = $2 ORDER BY npao_class, sort_order",
      [projectId, userId]
    );
  } else {
    result = await query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY npao_class, sort_order",
      [userId]
    );
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { project_id, title, npao_class, phase, description, estimated_minutes, done_when, build_prompt } = await request.json();

  const result = await query(
    `INSERT INTO tasks (project_id, user_id, title, npao_class, phase, description, estimated_minutes, done_when, build_prompt)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [project_id, userId, title, npao_class || "P", phase || "D1", description || "", estimated_minutes || null, done_when || null, build_prompt || null]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
