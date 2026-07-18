import { NextRequest, NextResponse } from 'next/server';

/**
 * Mastodon API: POST /oauth/token
 * Exchanges an authorization code for an OAuth access token.
 */
export async function POST(req: NextRequest) {
  try {
    let clientId = '';
    let clientSecret = '';
    let grantType = '';
    let code = '';
    let redirectUri = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      clientId = body.client_id || '';
      clientSecret = body.client_secret || '';
      grantType = body.grant_type || '';
      code = body.code || '';
      redirectUri = body.redirect_uri || '';
    } else {
      // Handle URL encoded form data
      const formData = await req.formData();
      clientId = (formData.get('client_id') as string) || '';
      clientSecret = (formData.get('client_secret') as string) || '';
      grantType = (formData.get('grant_type') as string) || '';
      code = (formData.get('code') as string) || '';
      redirectUri = (formData.get('redirect_uri') as string) || '';
    }

    if (grantType !== 'authorization_code') {
      return NextResponse.json({ error: 'unsupported_grant_type', error_description: 'Only authorization_code is supported.' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: 'invalid_request', error_description: 'Missing code parameter.' }, { status: 400 });
    }

    // Decode and verify the code
    let decodedPayload: any = null;
    try {
      // Decode standard base64/base64url
      const cleanCode = code.replace(/-/g, '+').replace(/_/g, '/');
      const jsonStr = Buffer.from(cleanCode, 'base64').toString('utf8');
      decodedPayload = JSON.parse(jsonStr);
    } catch (e) {
      return NextResponse.json({ error: 'invalid_grant', error_description: 'Authorization code is malformed.' }, { status: 400 });
    }

    if (!decodedPayload || !decodedPayload.userId) {
      return NextResponse.json({ error: 'invalid_grant', error_description: 'Invalid authorization code content.' }, { status: 400 });
    }

    // Check expiration (10 min duration)
    if (Date.now() > decodedPayload.expiresAt) {
      return NextResponse.json({ error: 'invalid_grant', error_description: 'Authorization code has expired.' }, { status: 400 });
    }

    // Generate a stateless access token containing the user ID
    const tokenPayload = {
      userId: decodedPayload.userId,
      clientId: clientId,
      createdAt: Date.now()
    };

    const accessToken = 'ef_token_' + Buffer.from(JSON.stringify(tokenPayload)).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''); // base64url

    const tokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      scope: decodedPayload.scope || 'read write follow',
      created_at: Math.floor(Date.now() / 1000)
    };

    return new NextResponse(JSON.stringify(tokenResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err: any) {
    console.error('Token API error:', err);
    return NextResponse.json({ error: 'server_error', error_description: err.message }, { status: 500 });
  }
}
