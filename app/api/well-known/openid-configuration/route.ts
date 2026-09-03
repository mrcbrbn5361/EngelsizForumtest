import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const issuer = 'https://www.engelsizforum.com';

  return NextResponse.json(
    {
      issuer: issuer,
      authorization_endpoint: `${issuer}/api/oauth/authorize`,
      token_endpoint: `${issuer}/api/oauth/token`,
      userinfo_endpoint: `${issuer}/api/oauth/userinfo`,
      response_types_supported: ['code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['HS256'],
      scopes_supported: ['openid', 'profile', 'email', 'read'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
      claims_supported: ['sub', 'id', 'username', 'name', 'email', 'email_verified', 'picture', 'role'],
    },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}
