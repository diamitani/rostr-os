import { NextResponse, type NextRequest } from "next/server";
import { CognitoJwtVerifier } from "aws-jwt-verify";

// Lazy-init JWT verifier (only when Cognito is configured)
let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!userPoolId || !clientId) return null;

    verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: "id",
      clientId,
    });
  }
  return verifier;
}

async function getUserFromCookies(request: NextRequest) {
  const v = getVerifier();
  if (!v) return null;

  const idToken = request.cookies.get("id_token")?.value;
  if (!idToken) return null;

  try {
    const payload = await v.verify(idToken);
    return {
      sub: payload.sub,
      email: payload.email as string,
      name: (payload.name as string) || "",
    };
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  // If Cognito isn't configured, pass through
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  if (!userPoolId) {
    return NextResponse.next();
  }

  const user = await getUserFromCookies(request);

  // Protected routes
  const protectedPaths = ["/dashboard", "/projects", "/tasks", "/intake", "/settings"];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
