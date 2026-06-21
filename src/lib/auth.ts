import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  AdminGetUserCommand,
  type SignUpCommandInput,
  type InitiateAuthCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";

const REGION = process.env.AWS_REGION || "us-east-2";
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

// ── Sign Up ──
export async function signUp(email: string, password: string, name: string) {
  const params: SignUpCommandInput = {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
    ],
  };

  const command = new SignUpCommand(params);
  const response = await cognitoClient.send(command);
  return {
    userSub: response.UserSub,
    userConfirmed: response.UserConfirmed ?? false,
  };
}

// ── Sign In ──
export async function signIn(email: string, password: string) {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  const command = new InitiateAuthCommand(params);
  const response = await cognitoClient.send(command);

  return {
    idToken: response.AuthenticationResult?.IdToken,
    accessToken: response.AuthenticationResult?.AccessToken,
    refreshToken: response.AuthenticationResult?.RefreshToken,
    expiresIn: response.AuthenticationResult?.ExpiresIn,
  };
}

// ── Get User by Access Token ──
export async function getUser(accessToken: string) {
  const command = new GetUserCommand({ AccessToken: accessToken });
  const response = await cognitoClient.send(command);

  const attrs: Record<string, string> = {};
  response.UserAttributes?.forEach((attr) => {
    if (attr.Name && attr.Value) attrs[attr.Name] = attr.Value;
  });

  return {
    sub: attrs.sub,
    email: attrs.email,
    name: attrs.name || "",
  };
}

// ── Refresh Token ──
export async function refreshTokens(refreshToken: string) {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  };

  const command = new InitiateAuthCommand(params);
  const response = await cognitoClient.send(command);

  return {
    idToken: response.AuthenticationResult?.IdToken,
    accessToken: response.AuthenticationResult?.AccessToken,
    expiresIn: response.AuthenticationResult?.ExpiresIn,
  };
}

export { cognitoClient, CLIENT_ID, USER_POOL_ID, REGION };
